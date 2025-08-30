import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://ypgdvtqqygqhcbovwqji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZ2R2dHFxeWdxaGNib3Z3cWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDQ4NTcsImV4cCI6MjA3MTQyMDg1N30.nQC0OpGG84EaL8BziMdixpLq-HI8v2JTNlNTW70CIsg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session token. This is the default, but we're
    // being explicit to ensure robustness against expired JWT errors.
    autoRefreshToken: true,
    // Persist the session in storage. This is the default and allows the
    // session to be restored across page loads.
    persistSession: true,
    // Detect session from URL, which is needed for OAuth and password resets.
    detectSessionInUrl: true
  },
});