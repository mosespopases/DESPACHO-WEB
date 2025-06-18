// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cudzrruoawsiwpcsubap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZHpycnVvYXdzaXdwY3N1YmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDkwNjIsImV4cCI6MjA2NTQyNTA2Mn0.h-3tvkXensegUio4hgVp3vtLMhZjQSoR5r4Q2ozGQQM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
