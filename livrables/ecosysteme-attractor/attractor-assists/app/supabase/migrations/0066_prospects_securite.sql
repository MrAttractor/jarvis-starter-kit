-- 0066_prospects_securite.sql — 05/08/2026
--
-- Faille relevée pendant l'audit du tunnel de vente.
--
-- La table `prospects` portait une policy `pros_a` en ALL, roles={authenticated}, using=true.
-- Autrement dit : TOUT compte authentifié du projet pouvait lire, modifier et supprimer la
-- totalité des prospects de l'agence (prénom, WhatsApp, activité, besoin, contexte).
--
-- Ce n'est pas théorique : le projet Supabase est partagé, `auth.users` est commune à Attractor
-- Assists et aux dossiers clients. Au 05/08/2026 il compte 18 comptes. 17 d'entre eux, dont des
-- comptes clients, avaient donc accès au fichier commercial complet.
--
-- Correctif : même modèle que `pilotage_pipeline`, un gating nominatif sur l'UID de Mac Arthur
-- (myattractor1@gmail.com). Le cockpit (MacCockpitScreen) continue de fonctionner puisqu'il
-- travaille avec sa session à lui ; les 17 autres comptes ne voient plus rien.
--
-- On retire aussi l'INSERT anonyme : il servait au formulaire d'audit de la page d'accueil, qui
-- est aujourd'hui du code mort (aucun bouton ne l'ouvre). L'edge function `diagnostic` écrit avec
-- le service role, elle n'est pas concernée. Laisser cette policy, c'est laisser n'importe qui
-- remplir la table depuis Internet.

drop policy if exists pros_a on public.prospects;
drop policy if exists allow_anon_insert_prospects on public.prospects;

create policy prospects_owner on public.prospects
  for all
  using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid)
  with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);

comment on table public.prospects is
  'Fichier commercial de l''agence. Accès nominatif Mac Arthur uniquement (0066). Les écritures du tunnel passent par les edge functions en service role, jamais par la clé anon.';
