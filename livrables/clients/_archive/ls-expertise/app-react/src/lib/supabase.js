import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://lgdgbrivnhgeupqhkckd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "ls-expertise-auth",
    },
  }
);
