"use server";

import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getEmailTemplate } from "@/lib/email-template";

// send email via function
async function sendEmail(to: string, subject: string, message: string) {
  // get api keys
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // validation keys
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");

  // initialize
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // call edge function
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { to, subject, message },
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      return { error: error.message || "Failed to trigger Edge Function" };
    }

    if (data?.error) {
      return {
        error:
          typeof data.error === "object"
            ? data.error.message || JSON.stringify(data.error)
            : data.error,
      };
    }

    return { success: true, data: data?.data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error occurred on the send email";
    return { error: errorMessage };
  }
}

// currently client side context refresh via check in future go with edge function trigger
export async function checkMissedDosesAndNotify() {
  try {
    // initialize
    const supabase = await createServerSupabase();
    // get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // get email + grace time
    const caretakerEmail = user.user_metadata?.caretaker_email;
    const alertWindow = user.user_metadata?.alert_window || 120;

    if (!caretakerEmail) {
      return { error: "Caretaker email is not configured." };
    }

    const todayISO = format(new Date(), "yyyy-MM-dd");
    // get undeleted medications
    const { data: medications } = await supabase
      .from("medications")
      .select("*")
      .is("deleted_at", null);

    if (!medications || medications.length === 0) {
      return { success: true, message: "No active medications." };
    }

    const now = new Date();
    let notificationsSent = 0;

    for (const med of medications) {
      // get med logs via med id and today
      const { data: existingLog } = await supabase
        .from("medication_logs")
        .select("status")
        .eq("medication_id", med.id)
        .eq("log_date", todayISO)
        .maybeSingle();

      if (existingLog) continue;

      // destructure hours , minutes
      const [hours, minutes] = med.reminder_time.split(":").map(Number);
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);

      const gracePeriodEnd = new Date(
        reminderDate.getTime() + alertWindow * 60 * 1000,
      );

      // update the in log
      if (now > gracePeriodEnd) {
        const { error: insertError } = await supabase
          .from("medication_logs")
          .insert({
            medication_id: med.id,
            user_id: user.id,
            status: "missed",
            log_date: todayISO,
            taken_at: null,
          });

        if (insertError) {
          continue;
        }

        const patientName = user.email?.split("@")[0].replace(/[._]/g, " ") || "Patient";

        // send email
        const subject = `⚠️ Alert: Missed Dose Detected - ${med.name}`;
        const message = getEmailTemplate({
          patientName,
          medicationName: med.name,
          dosage: med.dosage,
          time: med.reminder_time,
          type: "missed",
        });

        await sendEmail(caretakerEmail, subject, message);
        notificationsSent++;
      }
    }

    return {
      success: true,
      message: notificationsSent
        ? `Checked system. ${notificationsSent} missed dose alerts processed.`
        : "All medications are on track.",
    };
  } catch (error: any) {
    return { error: error.message || "Failed to process missed doses" };
  }
}


// development test email
export async function sendTestNotification() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const caretakerEmail = user.user_metadata?.caretaker_email;
    if (!caretakerEmail) {
      return { error: "Caretaker email is not configured." };
    }

    const subject = `Medication Alert - Test Notification`;
    const message = getEmailTemplate({
      patientName: "John Doe",
      medicationName: "Lisinopril",
      dosage: "10mg",
      time: "10:30 AM",
      type: "missed",
    });

    const result = await sendEmail(caretakerEmail, subject, message);

    if (result.error) {
      return { error: `Verification failed: ${result.error}` };
    }

    return {
      success: true,
      message: `Verification email sent to ${caretakerEmail}`,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send test notification";
    return { error: message };
  }
}
