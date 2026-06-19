/* ===== LIVRAISON PRO — CONFIG SUPABASE ===== */

const SUPABASE_URL  = 'https://jwucinmwrksqfrmkymds.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dWNpbm13cmtzcWZybWt5bWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDQyODYsImV4cCI6MjA5NjU4MDI4Nn0.CsDqzi2be1jm1ApkCr_AIU5mOrwp9PzvsTsv90Qi_Eg';

/* Version app */
const APP_VERSION = '2.0.0';

/* Client Supabase */
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
