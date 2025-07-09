import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mhkoygsumkxpcnnkpbjb.supabase.co'; // replace this
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa295Z3N1bWt4cGNubmtwYmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjY5MjAsImV4cCI6MjA2NzY0MjkyMH0.GA3BDnzct4vcJjRcG0uHwFNE9veYgtTk79lBiyf01wU'; // replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
