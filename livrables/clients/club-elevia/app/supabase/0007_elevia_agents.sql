-- ============================================================
-- Club Privé Élévia — 0007 « Le rôle d'agent, et personne pour le porter »
--
-- Le fait mesuré, 03/09/2026 :
--   `el_membres.role` vaut 'membre' par défaut (0003, ligne 19), et
--   `elevia-verif` refuse la file de modération à tout ce qui n'est pas
--   'agent' (403, « Accès réservé à l'équipe Élévia »).
--   Or AUCUNE migration, aucun script et aucun code du dépôt ne promeut
--   un compte en 'agent'. Le rôle existe, personne ne le porte.
--
-- Conséquence, si rien n'a été fait à la main en base :
--   la Cliente ne peut pas ouvrir /elevia/admin/, donc elle ne peut valider
--   aucune candidature, donc AUCUN membre ne peut devenir vérifié, y compris
--   elle. La vidéo de son compte en attente depuis le 08/08 le confirme.
--
-- Cette migration ne devine rien : elle promeut un compte NOMMÉ, échoue
-- bruyamment si ce compte n'existe pas, et se relit d'un coup d'œil.
-- ============================================================

-- ── Le compte à promouvoir ─────────────────────────────────
-- ⚠️ Remplacer l'adresse ci-dessous par l'adresse RÉELLE du compte Élévia
--    d'Élise CAPEL, qui n'est pas forcément son adresse de correspondance
--    (Elisepelagie@outlook.be). À relever dans `el_membres` avant d'exécuter :
--
--      select id, pseudo, email, role, statut_verif, created_at
--        from public.el_membres order by created_at;
--
do $$
declare
  cible constant text := lower(trim('A_REMPLACER@exemple.com'));
  touche int;
begin
  if cible = lower(trim('A_REMPLACER@exemple.com')) then
    raise exception
      'Adresse non renseignée : ouvrir 0007_elevia_agents.sql et remplacer A_REMPLACER@exemple.com par le compte Élévia de la Cliente.';
  end if;

  update public.el_membres
     set role = 'agent'
   where email_norm = cible
     and statut = 'actif';

  get diagnostics touche = row_count;

  if touche = 0 then
    raise exception
      'Aucun membre actif avec cette adresse (%). Rien promu, rien cassé : vérifier l''adresse en base.', cible;
  end if;

  raise notice 'Rôle agent accordé à % (% ligne).', cible, touche;
end $$;

-- ── Contrôle d'après application ───────────────────────────
-- À exécuter et à LIRE, la migration ne remplace pas la vérification :
--
--   select pseudo, email, role from public.el_membres where role = 'agent';
--
-- Attendu : la Cliente, et elle seule tant qu'elle n'a pas d'équipe.
-- Un second agent se promeut en réexécutant ce fichier avec l'autre adresse.

-- ── Ce qui reste à faire, et qui n'est pas de la base ──────
-- Rien dans l'interface ne permet à la Cliente de nommer un agent elle-même.
-- Tant que son équipe se compte sur une main, une promotion en base suffit.
-- Au-delà, c'est un écran d'administration des rôles, à inscrire au Module 4
-- (Communauté, back-office) plutôt qu'à improviser.
