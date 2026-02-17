"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  medicationSchema,
  MedicationFormData,
  uuidSchema,
  dateSchema,
} from "@/lib/zod/medicationSchema";
import { format, parseISO, isSameDay } from "date-fns";

export async function uploadEvidence(formData: FormData) {
  try {
    // get file from formData
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    // max 5MB allowed file
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size exceeds 5MB limit" };
    }

    //  image file only allowed
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files are allowed" };
    }

    // initialize
    const supabase = await createServerSupabase();
    // check user and id wise file upload
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // file details
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // upload
    const { error } = await supabase.storage
      .from("medication-evidence")
      .upload(filePath, file);

    if (error) return { error: error.message };

    // get public url of the file
    const { data } = supabase.storage
      .from("medication-evidence")
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return { error: errorMessage };
  }
}

export async function addMedication(formData: MedicationFormData) {
  try {
    // schema validation
    const result = medicationSchema.safeParse(formData);

    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { name, dosage, reminder_time } = result.data;

    const now = new Date();
    const [hours, minutes] = reminder_time.split(":").map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);

    const nowForComparison = new Date(now);
    nowForComparison.setSeconds(0, 0);

    if (selectedTime < nowForComparison) {
      return {
        error: `Reminder time (${reminder_time}) cannot be in the past. It's currently ${format(now, "HH:mm")}.`,
      };
    }
    // initialize
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized" };
    }
    // create new one
    const { error } = await supabase.from("medications").insert({
      user_id: user.id,
      name,
      dosage,
      reminder_time,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Medication added successfully" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add medication";
    return { error: errorMessage };
  }
}

export async function getMedications(dateStr?: string, clientInfo?: string) {
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

    // if date check schema
    if (dateStr) {
      const result = dateSchema.safeParse(dateStr);
      if (!result.success) return { error: "Invalid date format", data: [] };
    }

    // initialize
    const supabase = await createServerSupabase();
    // check user and get user id wise data
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Unauthorized", data: [] };
    }
    // get med
    const { data: medications, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_time", { ascending: true });

    if (error) {
      return { error: error.message, data: [] };
    }

    const userMetadata = user.user_metadata || {};
    const alertWindowMinutes = userMetadata.alert_window || 120;

    const targetDateISO = dateStr || localDateStr;
    const targetDateObj = parseISO(targetDateISO);

    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select("medication_id, log_date, status, evidence_url")
      .eq("user_id", user.id)
      .eq("log_date", targetDateISO);

    if (logsError) throw new Error(logsError.message);

    // filter active meds list
    const activeOnDateMeds = medications.filter((med) => {
      // date med
      const created = new Date(med.created_at);
      const deleted = med.deleted_at ? new Date(med.deleted_at) : null;

      // query date boundaries
      const startOfTargetDate = new Date(targetDateISO + "T00:00:00");
      const endOfTargetDate = new Date(targetDateISO + "T23:59:59");

      const wasCreated = created <= endOfTargetDate;
      const hasLog = logs?.some((l) => l.medication_id === med.id);

      let wasActiveAtSomePointToday = !deleted || deleted > startOfTargetDate;

      if (deleted && isSameDay(deleted, targetDateObj)) {
        const [h, m] = (med.reminder_time || "08:00").split(":").map(Number);
        const reminderTimeOnDeletionDay = new Date(
          targetDateISO +
            "T" +
            h.toString().padStart(2, "0") +
            ":" +
            m.toString().padStart(2, "0") +
            ":00",
        );
        const wasScheduledBeforeDeletion = reminderTimeOnDeletionDay <= deleted;
        wasActiveAtSomePointToday = hasLog || wasScheduledBeforeDeletion;
      }

      return wasCreated && wasActiveAtSomePointToday;
    });

    // Helper for time comparison in minutes
    const getMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const currentLocalMinutes = getMinutes(localTimeStr);

    // update the logs with med
    const medicationsWithStatus = activeOnDateMeds.map((med) => {
      const log = logs?.find((l) => l.medication_id === med.id);
      const isTaken = log?.status === "taken";

      if (isTaken) {
        return {
          ...med,
          status: "taken",
          isTaken: true,
          evidence_url: log?.evidence_url,
        };
      }

      const isToday = targetDateISO === localDateStr;
      const isPastDay = targetDateISO < localDateStr;
      const isFutureDay = targetDateISO > localDateStr;

      let status: "missed" | "upcoming" | "pending" | "taken" = "upcoming";

      if (isPastDay) {
        status = "missed";
      } else if (isToday) {
        const reminderMinutes = getMinutes(med.reminder_time || "08:00");
        const graceMinutes = reminderMinutes + alertWindowMinutes;

        if (currentLocalMinutes >= graceMinutes) {
          status = "missed";
        } else if (currentLocalMinutes >= reminderMinutes) {
          status = "pending";
        } else {
          status = "upcoming";
        }
      } else if (isFutureDay) {
        status = "upcoming";
      }

      return {
        ...med,
        status,
        isTaken,
      };
    });

    return { success: true, data: medicationsWithStatus };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch medications";
    return { error: errorMessage, data: [] };
  }
}

export async function deleteMedication(id: string) {
  try {
    // validate id schema
    const result = uuidSchema.safeParse(id);
    if (!result.success) return { error: "Invalid ID" };

    // initialize
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("medications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Medication deleted" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete medication";
    return { error: errorMessage };
  }
}

export async function logMedication(
  medicationId: string,
  evidenceUrl?: string,
  clientInfo?: string,
) {
  try {
    let localDateStr = format(new Date(), "yyyy-MM-dd");
    let nowISO = new Date().toISOString();

    if (clientInfo) {
      try {
        const info = JSON.parse(clientInfo);
        localDateStr = info.localDate;
        nowISO = info.now;
      } catch (e) {
        console.error("Failed to parse clientInfo in log actions", e);
      }
    }

    // initialize
    const supabase = await createServerSupabase();
    // get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { error: "Unauthorized" };

    // check already logged today
    const { data: existingLog, error: logError } = await supabase
      .from("medication_logs")
      .select("status")
      .eq("medication_id", medicationId)
      .eq("log_date", localDateStr)
      .maybeSingle();

    if (logError) return { error: logError.message };

    // currently prevent single dose of the per day
    if (existingLog) {
      if (existingLog.status === "taken") {
        return { error: "This medication has already been taken today." };
      }
      if (existingLog.status === "missed") {
        return {
          error: "This dose was finalized as 'Missed' and cannot be changed.",
        };
      }
      return { error: "This medication is already logged for today." };
    }

    const { error } = await supabase.from("medication_logs").insert({
      medication_id: medicationId,
      user_id: user.id,
      status: "taken",
      log_date: localDateStr,
      taken_at: nowISO,
      evidence_url: evidenceUrl,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Medication marked as taken" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to log medication";
    return { error: errorMessage };
  }
}

export async function updateMedication(
  id: string,
  formData: MedicationFormData,
) {
  try {
    // validation
    const result = medicationSchema.safeParse(formData);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { name, dosage, reminder_time } = result.data;

    const now = new Date();
    const [hours, minutes] = reminder_time.split(":").map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);

    const nowForComparison = new Date(now);
    nowForComparison.setSeconds(0, 0);

    // prevent past
    if (selectedTime < nowForComparison) {
      return {
        error: `New reminder time (${reminder_time}) cannot be in the past for today.`,
      };
    }

    // initialize
    const supabase = await createServerSupabase();
    const today = new Date().toISOString().split("T")[0];
    // check already logged today
    const { data: existingLog } = await supabase
      .from("medication_logs")
      .select("status")
      .eq("medication_id", id)
      .eq("log_date", today)
      .maybeSingle();

    if (existingLog) {
      return {
        error: `This medication has already been marked as '${existingLog.status.toUpperCase()}' for today and cannot be updated.`,
      };
    }

    // update
    const { error } = await supabase
      .from("medications")
      .update({ name, dosage, reminder_time })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Medication updated successfully" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update medication";
    return { error: message };
  }
}
