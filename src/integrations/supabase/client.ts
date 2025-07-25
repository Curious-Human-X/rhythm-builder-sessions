// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pbychyisdnczjrjsonyw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWNoeWlzZG5jempyanNvbnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mzk2MDAsImV4cCI6MjA2NzMxNTYwMH0.wEq6FKVAAGDyRhlM1ntOmvJH5miykqvNWT8vRGWUaCI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});