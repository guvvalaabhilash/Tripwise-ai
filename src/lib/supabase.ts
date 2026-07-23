import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic token refresh retries when the network is unavailable.
    // This prevents the flood of ERR_NAME_NOT_RESOLVED / "Failed to fetch" errors
    // when the Supabase project is paused or unreachable.
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
})