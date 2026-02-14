import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";



export async function createClient(): Promise<SupabaseClient> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are missing");
    }
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return supabase;
}
