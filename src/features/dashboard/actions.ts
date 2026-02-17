"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";

export async function getPatientStats(todayStr?: string, clientInfo?: string) {
  try {
    // Parse client info if available, otherwise fallback to server time
    let localDateStr = format(new Date(), "yyyy-MM-dd");
    let localTimeStr = format(new Date(), "HH:mm");
    let now = new Date();

    if (clientInfo) {
      try {
        const info = JSON.parse(clientInfo);
        localDateStr = info.localDate;
        localTimeStr = info.localTime;
        now = new Date(info.now);
      } catch (e) {
        console.error("Failed to parse clientInfo", e);
      }
    }

    const todayISO = todayStr || localDateStr;
    const todayObj = parseISO(todayISO);

    // Calculate user's local timezone offset in minutes
    // This is the difference between their Local time and UTC now.
    const clientNow = now;
    const clientLocalTime = new Date(localDateStr + "T" + localTimeStr);
    const userOffsetMs = clientLocalTime.getTime() - clientNow.getTime();

    // Initialize Supabase and get current user
    const supabase = await createServerSupabase();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { error: "Unauthorized" };

    // Fetch all active medications for the user (ordered by reminder time)
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_time", { ascending: true });

    if (medError) throw new Error(medError.message);

    // Return empty stats if no medications exist
    if (!medications || medications.length === 0) {
      return {
        streak: 0,
        todayStatus: 0,
        monthlyRate: 0,
        totalMeds: 0,
        takenCount: 0,
        history: [],
        missedThisMonth: 0,
        takenThisWeek: 0,
        remainingDays: 0,
        recentActivity: [],
      };
    }

    const startOfHistory = subDays(todayObj, 365);
    const startOfHistoryISO = format(startOfHistory, "yyyy-MM-dd");

    // Fetch medication logs for last 365 days for accurate streaks
    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select(
        "medication_id, log_date, status, evidence_url, taken_at, medications(name, reminder_time)",
      )
      .eq("user_id", user.id)
      .gte("log_date", startOfHistoryISO);

    if (logsError) throw new Error(logsError.message);

    // Map logs by date for quick lookup (tracks taken vs any log)
    const anyLogByDate: Record<string, Set<string>> = {};
    const logsByDate: Record<string, Set<string>> = {};

    // Helper to safely extract YYYY-MM-DD from any date string
    // CRITICAL:
    // 1. If it's a simple date string (YYYY-MM-DD), use it AS IS. DO NOT Shift timezones.
    // 2. If it's a timestamp (created_at), shift to user's local time.
    const toLocalDateKey = (
      dateStr: string | null | undefined,
      isTimestamp = false,
    ) => {
      if (!dateStr) return "";

      // If it's a timestamp (like created_at), we MUST adjust to local time
      if (isTimestamp) {
        const utcDate = new Date(dateStr);
        const localDate = new Date(utcDate.getTime() + userOffsetMs);
        return format(localDate, "yyyy-MM-dd");
      }

      // If it's a log_date (likely "YYYY-MM-DD"), just take the date part string
      return dateStr.split("T")[0];
    };

    logs?.forEach((log) => {
      // Logs use the raw date string from DB (assumed to be correct day)
      const dateKey = toLocalDateKey(log.log_date, false);
      if (!logsByDate[dateKey]) logsByDate[dateKey] = new Set();
      if (!anyLogByDate[dateKey]) anyLogByDate[dateKey] = new Set();

      anyLogByDate[dateKey].add(log.medication_id);
      if (log.status === "taken") {
        logsByDate[dateKey].add(log.medication_id);
      }
    });

    // Helper for minutes conversion
    const getMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const currentLocalMinutes = getMinutes(localTimeStr);

    // Get medications active on a specific date (respects creation/deletion dates)
    const getActiveMedsForDate = (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");

      return medications.filter((m) => {
        // Use simpler logic:
        // 1. If we have a log for this date, it's definitely active (and taken/missed).
        const hasLog = anyLogByDate[dateStr]?.has(m.id);
        if (hasLog) return true;

        // 2. Otherwise, check creation/deletion
        // created_at / deleted_at ARE timestamps, so we use isTimestamp=true
        const createdDateStr = toLocalDateKey(m.created_at, true);
        const deletedDateStr = m.deleted_at
          ? toLocalDateKey(m.deleted_at, true)
          : null;

        // If created in future relative to this date, not active
        if (createdDateStr > dateStr) return false;

        // If created ON the target date, check time/log
        if (createdDateStr === dateStr) {
          const hasLog = anyLogByDate[dateStr]?.has(m.id);
          // If logged, it counts! (Credit for Day 1)
          // If not logged, we ignore it to avoid penalty.
          return !!hasLog;
        }

        // 2. Deletion Check
        if (deletedDateStr) {
          if (deletedDateStr < dateStr) return false;
          // If deleted today, effectively active if logged or deleted late?
          // Keep simple: if deleted today, count it (user deleted it today, likely handled or irrelevant)
        }

        return true;
      });
    };

    // Use alert window from user metadata or default to 120 minutes
    const userMetadata = (user.user_metadata as any) || {};
    const alertWindowMinutes = userMetadata.alert_window || 120;

    // Calculate medication adherence streak (consecutive complete days)
    // CORE LOGIC: We count backwards from YESTERDAY.
    // If today is complete, we add 1 to that count.
    // If today is missed, the streak is 0 logic remains separate or handled by the loop break.

    let streak = 0;

    // 1. Calculate past streak (consecutive days ending yesterday)
    let checkDate = subDays(todayObj, 1);
    let daysChecked = 0;
    let pastStreak = 0;

    while (daysChecked < 365) {
      const activeMeds = getActiveMedsForDate(checkDate);

      // If no meds were active on this date
      if (activeMeds.length === 0) {
        checkDate = subDays(checkDate, 1);
        daysChecked++;
        if (daysChecked > 365 && pastStreak === 0) break;
        continue;
      }

      const dKey = format(checkDate, "yyyy-MM-dd");
      const takenSet = logsByDate[dKey] || new Set();
      const isComplete = activeMeds.every((m) => takenSet.has(m.id));

      if (isComplete) {
        pastStreak++;
        checkDate = subDays(checkDate, 1);
        daysChecked++;
      } else {
        // Break on the first incomplete day found
        break;
      }
    }

    // 2. Determine today's contribution
    const activeTodayMeds = getActiveMedsForDate(todayObj);
    const takenTodaySet = logsByDate[todayISO] || new Set();

    // Determine today's state
    const isTodayComplete =
      activeTodayMeds.length > 0 &&
      activeTodayMeds.every((m) => takenTodaySet.has(m.id));

    // Check if today is explicitly missed
    let hasTodayMissed = false;
    if (
      !isTodayComplete &&
      activeTodayMeds.length > 0 &&
      todayISO === localDateStr
    ) {
      for (const med of activeTodayMeds) {
        if (!takenTodaySet.has(med.id)) {
          const reminderMinutes = getMinutes(med.reminder_time || "08:00");
          const graceMinutes = reminderMinutes + alertWindowMinutes;

          if (currentLocalMinutes >= graceMinutes) {
            hasTodayMissed = true;
            break;
          }
        }
      }
    } else if (
      !isTodayComplete &&
      activeTodayMeds.length > 0 &&
      todayISO < localDateStr
    ) {
      hasTodayMissed = true;
    }

    // 3. Final Streak Calculation
    if (hasTodayMissed) {
      // User missed today. Technically streak is broken.
      // But typically apps show "current streak" as the one you are building.
      // If we return 0, they feel they lost everything.
      // If we return pastStreak, they see "5 days" (from yesterday).
      // Given the user feedback "still 0... past days check", they likely want to see the number.
      // Let's return pastStreak even if missed today.
      streak = pastStreak;
    } else {
      streak = pastStreak;
      if (isTodayComplete) {
        streak += 1;
      }
    }

    // Calculate today's adherence percentage
    const activeTodayCount = activeTodayMeds.length;
    const todayTakenCount = takenTodaySet.size;

    const todayStatus =
      activeTodayCount > 0
        ? Math.round((todayTakenCount / activeTodayCount) * 100)
        : 0;

    // Calculate adherence rate for current month
    let totalOpportunities = 0;
    let totalTaken = 0;

    const monthStart = startOfMonth(todayObj);
    const daysInMonth = differenceInDays(todayObj, monthStart) + 1;

    // Sum all opportunities and completions for the month
    for (let i = 0; i < daysInMonth; i++) {
      const d = subDays(todayObj, i);
      const dKey = format(d, "yyyy-MM-dd");
      const activeMeds = getActiveMedsForDate(d);

      if (activeMeds.length > 0) {
        totalOpportunities += activeMeds.length;
        const takenSet = logsByDate[dKey] || new Set();
        const takenForDate = activeMeds.filter((m) =>
          takenSet.has(m.id),
        ).length;
        totalTaken += takenForDate;
      }
    }

    const monthlyRate =
      totalOpportunities > 0
        ? Math.round((totalTaken / totalOpportunities) * 100)
        : 0;

    // Build 90-day calendar history for visualization
    const history = [];
    const startCalendar = subDays(todayObj, 90);

    // Iterate through each day and determine status (empty, complete, partial, missed)
    for (let d = startCalendar; d <= todayObj; d = addDays(d, 1)) {
      const dKey = format(d, "yyyy-MM-dd");
      const activeMeds = getActiveMedsForDate(d);
      const takenSet = logsByDate[dKey] || new Set();
      const takenCount = activeMeds.filter((m) => takenSet.has(m.id)).length;

      let status = "future";
      let hasTaken = takenCount > 0;
      let hasMissed = false;

      // Determine day status: empty, complete, partial, missed, or future
      if (d <= todayObj) {
        if (activeMeds.length === 0) {
          status = "empty";
        } else {
          if (activeMeds.length > 0 && takenCount >= activeMeds.length)
            status = "complete";
          else if (takenCount > 0) status = "partial";
          else status = "missed";

          if (dKey === localDateStr) {
            if (status === "missed") status = "future";

            for (const med of activeMeds) {
              if (!takenSet.has(med.id)) {
                const reminderMinutes = getMinutes(
                  med.reminder_time || "08:00",
                );
                const graceMinutes = reminderMinutes + alertWindowMinutes;

                if (currentLocalMinutes >= graceMinutes) {
                  hasMissed = true;
                  status = "missed";
                  break;
                }
              }
            }
            if (!hasMissed && takenCount === 0) status = "future";
            if (!hasMissed && takenCount > 0 && takenCount < activeMeds.length)
              status = "partial";
          } else if (dKey < localDateStr) {
            if (takenCount < activeMeds.length) hasMissed = true;
          }
        }
      }

      history.push({
        date: dKey,
        status,
        taken: takenCount,
        total: activeMeds.length,
        hasTaken,
        hasMissed,
      });
    }

    // Count missed doses this month (past and current day)
    const currentMonthStart = startOfMonth(todayObj);

    const currentMonthStartISO = format(currentMonthStart, "yyyy-MM-dd");
    let missedThisMonth = 0;

    // Only count doses from current month onwards
    history.forEach((h) => {
      if (h.date < currentMonthStartISO) return;

      if (h.date === localDateStr) {
        const activeMeds = getActiveMedsForDate(todayObj);
        const takenSet = logsByDate[h.date] || new Set();

        activeMeds.forEach((med) => {
          if (!takenSet.has(med.id)) {
            const reminderMinutes = getMinutes(med.reminder_time || "08:00");
            const graceMinutes = reminderMinutes + alertWindowMinutes;
            if (currentLocalMinutes >= graceMinutes) missedThisMonth++;
          }
        });
      } else if (h.date < localDateStr) {
        missedThisMonth += h.total - h.taken;
      }
    });

    // Count complete days (all meds taken) in the last 7 days
    let takenThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = subDays(todayObj, i);
      const dKey = format(d, "yyyy-MM-dd");
      const hEntry = history.find((h) => h.date === dKey);
      if (hEntry && hEntry.status === "complete") takenThisWeek++;
    }

    // Calculate remaining days until end of month
    const remainingDays = differenceInDays(endOfMonth(todayObj), todayObj);

    // Format recent activity (last 10 log entries)
    const recentActivityLogs = logs
      ? logs
          .sort(
            (a, b) =>
              new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
          )
          .slice(0, 10)
      : [];

    const recentActivity = recentActivityLogs.map((log) => {
      const medData = Array.isArray(log.medications)
        ? log.medications[0]
        : log.medications;
      const displayTime = log.taken_at
        ? format(new Date(log.taken_at), "hh:mm a")
        : (() => {
            const timeStr = (medData as any)?.reminder_time || "08:00";
            const [h, m] = timeStr.split(":");
            const hour = parseInt(h);
            const ampm = hour >= 12 ? "PM" : "AM";
            return `${hour % 12 || 12}:${m} ${ampm}`;
          })();

      return {
        id: log.medication_id + log.log_date,
        date: format(new Date(log.log_date), "EEEE, MMMM d"),
        time: displayTime,
        status: log.status === "taken" ? "Completed" : "Missed",
        medication: (medData as any)?.name || "Unknown Medication",
        type: log.status,
        evidenceUrl: log.evidence_url,
      };
    });

    // Return all calculated stats
    return {
      streak,
      todayStatus,
      monthlyRate,
      totalMeds: activeTodayMeds.length,
      takenCount: todayTakenCount,
      missedThisMonth,
      takenThisWeek,
      remainingDays,
      history,
      recentActivity,
      email: user.email,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch patient stats";
    return { error: errorMessage };
  }
}

export async function markAllMedicationsTaken(clientInfo?: string) {
  try {
    let localDateStr = format(new Date(), "yyyy-MM-dd");
    let nowISO = new Date().toISOString();

    if (clientInfo) {
      try {
        const info = JSON.parse(clientInfo);
        localDateStr = info.localDate;
        nowISO = info.now;
      } catch (e) {
        console.error("Failed to parse clientInfo in bulk log", e);
      }
    }

    // Initialize Supabase and get current user
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return { error: "Unauthorized" };

    // Fetch all active (non-deleted) medications
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("id")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (medError) throw new Error(medError.message);

    // Skip if no medications exist
    if (!medications || medications.length === 0) return { success: true };

    // Fetch logs already recorded for today in local time
    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .eq("user_id", user.id)
      .eq("log_date", localDateStr);

    if (logsError) throw new Error(logsError.message);

    // Find medications not yet logged today
    const takenSet = new Set(logs?.map((l) => l.medication_id) || []);

    // Prepare bulk insert for unmapped medications
    const toInsert = medications
      .filter((m) => !takenSet.has(m.id))
      .map((m) => ({
        user_id: user.id,
        medication_id: m.id,
        status: "taken",
        log_date: localDateStr,
        taken_at: nowISO,
      }));

    // Bulk insert unmapped medications as taken
    if (toInsert.length > 0) {
      const { error } = await supabase.from("medication_logs").insert(toInsert);
      if (error) return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark all as taken";
    return { error: message };
  }
}
