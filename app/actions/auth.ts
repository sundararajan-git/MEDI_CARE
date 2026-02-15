"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { LoginFormData, SignupFormData } from "@/lib/zod/authSchema";

export async function signup(formData: SignupFormData) {
  // validation
  const { email, password } = formData;
  if (!email.trim() || !password.trim())
    return { error: "Email & Password is required" };

  // connect
  const supabase = await createServerSupabase();
  // create new user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Signed up successfully",
    user: data.user,
    session: data.session,
  };
}

export async function login(formData: LoginFormData) {
  // validation
  const { email, password } = formData;
  if (!email.trim() || !password.trim())
    return { error: "Email & Password is required" };

  // connect
  const supabase = await createServerSupabase();
  // log in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: error.message };
  }
  return {
    success: true,
    message: "Logged in!",
    user: data.user,
    session: data.session,
  };
}

export async function logout() {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
