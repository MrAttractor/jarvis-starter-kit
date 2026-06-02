-- 0016_admin_mac_arthur.sql
-- Repositionnement compte Mac Arthur : plan Manager + rôle admin

UPDATE public.profiles
SET
  plan_code = 'manager',
  role      = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'macarthur.nguessankouassi@gmail.com'
);
