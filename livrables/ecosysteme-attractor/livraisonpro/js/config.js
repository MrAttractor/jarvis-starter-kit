/* ===== LIVRAISON PRO — CONFIG SUPABASE ===== */

/* Projet Supabase partagé attractor-assists (tables préfixées lp_) —
   le projet dédié jwucinmwrksqfrmkymds a été mis en pause (limite 2 projets
   actifs gratuits atteinte), greffé ici le 08/07/2026. */
const SUPABASE_URL  = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk';

/* Version app */
const APP_VERSION = '2.0.0';

/* Client Supabase */
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
