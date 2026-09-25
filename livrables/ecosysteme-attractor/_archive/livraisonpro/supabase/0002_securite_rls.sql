-- ============================================================================
-- Livraison Pro — verrouillage des tables publiques inutilisées (17/07/2026)
--
-- Contexte : l'app tournait entièrement sur des policies `public true`, sans
-- vraie authentification (le "login" = saisir son numéro de téléphone). Tant
-- que l'app est pré-lancement (1 testeur, 0 mission, 0 position GPS), on ferme
-- déjà ce qui n'est PAS utilisé par le front, sans rien casser :
--   * lp_tracking_gps : positions GPS des livreurs — table world-readable par
--     défaut, le plus sensible pour la suite (traçage de personnes). Le front
--     ne l'utilise pas encore.
--   * lp_bons, lp_avis : idem, définies mais non lues/écrites par le front.
--
-- Ces trois tables passent en service-role uniquement (plus aucun accès via la
-- clé anon). Les edge functions (service role) continuent d'y accéder.
--
-- NON traité ici (chantier dédié "auth Livraison Pro", à faire AVANT
-- d'onboarder de vrais testeurs) : lp_users / lp_missions / lp_alertes, encore
-- lus/écrits en direct depuis le navigateur avec la clé anon. Les fermer exige
-- de router l'app par une edge function ET de remplacer le login-par-téléphone
-- par un vrai mécanisme (OTP). C'est un rebuild, pas un correctif de config.
-- ============================================================================

drop policy if exists "lp_gps_read"   on lp_tracking_gps;
drop policy if exists "lp_gps_insert" on lp_tracking_gps;
drop policy if exists "lp_bons_read"   on lp_bons;
drop policy if exists "lp_bons_insert" on lp_bons;
drop policy if exists "lp_avis_read"   on lp_avis;
drop policy if exists "lp_avis_insert" on lp_avis;

-- RLS reste actif : sans aucune policy, la clé anon n'a plus aucun accès.
-- Les edge functions en service role contournent RLS et gardent l'accès complet.
alter table lp_tracking_gps enable row level security;
alter table lp_bons         enable row level security;
alter table lp_avis         enable row level security;
