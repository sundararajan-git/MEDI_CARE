"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { LoginFormData, SignupFormData } from "@/lib/zod/authSchema";

export async function signup(formData: SignupFormData) {
  try {
    // connect
    const supabase = await createServerSupabase();
    // signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) return { error: error.message };
    return {
      success: true,
      user: data.user,
      session: data.session,
      message: "Signed up successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred during signup";
    return { error: errorMessage };
  }
}

export async function login(formData: LoginFormData) {
  try {
    // connect supabase
    const supabase = await createServerSupabase();
    // sign in 
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) return { error: error.message };

    return {
      success: true,
      user: data.user,
      session: data.session,
      message: "Logged in successfully",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Login failed";
    return { error: errorMessage };
  }
}

export async function logout() {
  try {
    // connect | initialize
    const supabase = await createServerSupabase();
    // log out
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Logout failed";
    return { error: errorMessage };
  }
}

export async function updateCaretaker(settings: {
  email: string;
  notificationsEnabled: boolean;
  missedAlertsEnabled: boolean;
  alertWindow: number;
}) {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.updateUser({
      data: {
        caretaker_email: settings.email,
        notifications_enabled: settings.notificationsEnabled,
        missed_alerts_enabled: settings.missedAlertsEnabled,
        alert_window: settings.alertWindow,
      },
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, message: "Settings updated successfully" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
    return { error: errorMessage };
  }
}

export async function getCaretaker() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      email: user?.user_metadata?.caretaker_email || "",
      notificationsEnabled: user?.user_metadata?.notifications_enabled ?? true,
      missedAlertsEnabled: user?.user_metadata?.missed_alerts_enabled ?? true,
      alertWindow: user?.user_metadata?.alert_window ?? 120,
    };
  } catch (error) {
    return {
      email: "",
      notificationsEnabled: true,
      missedAlertsEnabled: true,
      alertWindow: 120,
    };
  }
}

export async function getUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    email: user.email,
    id: user.id,
    user_metadata: user.user_metadata,
  };
}
