import { createClient } from "@supabase/supabase-js";

// Sudah tersambung ke project Supabase "gudang-kita" milik Outfitly.co
const SUPABASE_URL = "https://xvibyfelgmiacoikcnlt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_waYvzKT6b2G_8YgY10oq6A_nK9fO6Mb";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

