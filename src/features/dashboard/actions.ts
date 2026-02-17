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
} from "date-fns";

export async function getPatientStats(todayStr?: string) {
  try {
    // Initialize Supabase and get current user
    const supabase = await createServerSupabase();
    const today = todayStr ? new Date(todayStr.replace(/-/g, "/")) : new Date();
    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { error: "Unauthorized" };
    // Fetch all active medications for the user
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id);

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

    const startOfHistory = subDays(today, 90);
    const startOfHistoryISO = startOfHistory.toISOString().split("T")[0];

    // Fetch medication logs for last 90 days
    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select(
        "medication_id, log_date, status, evidence_url, medications(name)",
      )
      .eq("user_id", user.id)
      .gte("log_date", startOfHistoryISO);

    if (logsError) throw new Error(logsError.message);

    // Map logs by date for quick lookup (tracks taken vs any log)
    const anyLogByDate: Record<string, Set<string>> = {};
    const logsByDate: Record<string, Set<string>> = {};
    logs?.forEach((log) => {
      const dateKey = log.log_date;
      if (!logsByDate[dateKey]) logsByDate[dateKey] = new Set();
      if (!anyLogByDate[dateKey]) anyLogByDate[dateKey] = new Set();

      anyLogByDate[dateKey].add(log.medication_id);
      if (log.status === "taken") {
        logsByDate[dateKey].add(log.medication_id);
      }
    });

    // Get medications active on a specific date (respects creation/deletion dates)
    const getActiveMedsForDate = (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const startOfDate = new Date(dateStr);
      startOfDate.setHours(0, 0, 0, 0);
      const endOfDate = new Date(dateStr);
      endOfDate.setHours(23, 59, 59, 999);

      return medications.filter((m) => {
        const created = new Date(m.created_at);
        const deleted = m.deleted_at ? new Date(m.deleted_at) : null;

        const isCreated = created <= endOfDate;
        const hasLog = anyLogByDate[dateStr]?.has(m.id);

        const isNotDeleted = !deleted || deleted > startOfDate;

        return (isCreated || hasLog) && isNotDeleted;
      });
    };

    // Calculate medication adherence streak (consecutive complete days)
    let streak = 0;
    const todayKey = format(today, "yyyy-MM-dd");

    const activeTodayMeds = getActiveMedsForDate(today);
    const takenTodaySet = logsByDate[todayKey] || new Set();

    // Check if today is complete or has missed medications
    let hasTodayMissed = false;
    for (const med of activeTodayMeds) {
      if (!takenTodaySet.has(med.id)) {
        const [h, m] = med.reminder_time.split(":").map(Number);
        const remDate = new Date();
        remDate.setHours(h, m, 0, 0);
        if (new Date() > new Date(remDate.getTime() + 6 * 60 * 60 * 1000)) {
          hasTodayMissed = true;
          break;
        }
      }
    }

    if (!hasTodayMissed) {
      streak = 1;
    }

    // Count consecutive complete days going backwards from yesterday
    let checkDate = subDays(today, 1);
    while (streak < 365) {
      const activeMeds = getActiveMedsForDate(checkDate);
      if (activeMeds.length === 0) {
        break;
      }

      const dKey = format(checkDate, "yyyy-MM-dd");
      const takenSet = logsByDate[dKey] || new Set();
      const isComplete = activeMeds.every((m) => takenSet.has(m.id));

      if (isComplete) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
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

    const monthStart = startOfMonth(today);
    const daysInMonth = differenceInDays(today, monthStart) + 1;

    // Sum all opportunities and completions for the month
    for (let i = 0; i < daysInMonth; i++) {
      const d = subDays(today, i);
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
    const startCalendar = subDays(today, 90);

    // Iterate through each day and determine status (empty, complete, partial, missed)
    for (let d = startCalendar; d <= today; d = addDays(d, 1)) {
      const dKey = format(d, "yyyy-MM-dd");
      const activeMeds = getActiveMedsForDate(d);
      const takenSet = logsByDate[dKey] || new Set();
      const takenCount = activeMeds.filter((m) => takenSet.has(m.id)).length;

      let status = "future";
      let hasTaken = takenCount > 0;
      let hasMissed = false;

      // Determine day status: empty, complete, partial, missed, or future
      if (d <= today) {
        if (activeMeds.length === 0) {
          status = "empty";
        } else {
          if (activeMeds.length > 0 && takenCount >= activeMeds.length)
            status = "complete";
          else if (takenCount > 0) status = "partial";
          else status = "missed";

          if (isSameDay(d, today)) {
            if (status === "missed") status = "future";

            for (const med of activeMeds) {
              if (!takenSet.has(med.id)) {
                const [hours, minutes] = (med.reminder_time || "08:00")
                  .split(":")
                  .map(Number);
                const reminderDate = new Date();
                reminderDate.setHours(hours, minutes, 0, 0);
                const graceEnd = new Date(
                  reminderDate.getTime() + 6 * 60 * 60 * 1000,
                );
                if (new Date() > graceEnd) {
                  hasMissed = true;
                  status = "missed";
                  break;
                }
              }
            }
            if (!hasMissed && takenCount === 0) status = "future";
            if (!hasMissed && takenCount > 0 && takenCount < activeMeds.length)
              status = "partial";
          } else {
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
    const currentMonthStart = startOfMonth(today);

    const currentMonthStartISO = format(currentMonthStart, "yyyy-MM-dd");
    let missedThisMonth = 0;

    // Only count doses from current month onwards
    history.forEach((h) => {
      if (h.date < currentMonthStartISO) return;

      if (h.date === todayKey) {
        const activeMeds = getActiveMedsForDate(today);
        const takenSet = logsByDate[todayKey] || new Set();

        activeMeds.forEach((med) => {
          if (!takenSet.has(med.id)) {
            const [hours, minutes] = (med.reminder_time || "08:00")
              .split(":")
              .map(Number);
            const reminderDate = new Date();
            reminderDate.setHours(hours, minutes, 0, 0);
            const graceEnd = new Date(
              reminderDate.getTime() + 6 * 60 * 60 * 1000,
            );
            if (new Date() > graceEnd) missedThisMonth++;
          }
        });
      } else {
        missedThisMonth += h.total - h.taken;
      }
    });

    // Count complete days (all meds taken) in the last 7 days
    let takenThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = subDays(today, i);
      const dKey = format(d, "yyyy-MM-dd");
      const hEntry = history.find((h) => h.date === dKey);
      if (hEntry && hEntry.status === "complete") takenThisWeek++;
    }

    // Calculate remaining days until end of month
    const remainingDays = differenceInDays(endOfMonth(today), today);

    // Format recent activity (last 10 log entries)
    const recentActivityLogs = logs
      ? logs
          .sort(
            (a, b) =>
              new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
          )
          .slice(0, 10)
      : [];

    const recentActivity = recentActivityLogs.map((log) => ({
      id: log.medication_id + log.log_date,
      date: format(new Date(log.log_date), "EEEE, MMMM d"),
      time: "",
      status: log.status === "taken" ? "Completed" : "Missed",
      medication: Array.isArray(log.medications)
        ? log.medications[0]?.name || "Unknown Medication"
        : (log.medications as any)?.name || "Unknown Medication",
      type: log.status,
      evidenceUrl: log.evidence_url,
    }));

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

export async function markAllMedicationsTaken() {
  try {
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

    // Get today's date in ISO format
    const today = new Date().toISOString().split("T")[0];

    // Fetch logs already recorded for today
    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select("medication_id")
      .eq("user_id", user.id)
      .eq("log_date", today);

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
        log_date: today,
        taken_at: new Date().toISOString(),
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
