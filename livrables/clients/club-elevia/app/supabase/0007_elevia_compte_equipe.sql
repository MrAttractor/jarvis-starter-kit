-- ════════════════════════════════════════════════════════════════════════
-- 0007 — Le premier compte d'équipe
--
-- Constat du 14/09/2026 : les trois comptes existants en base portent tous
-- le rôle « membre ». AUCUN compte n'a jamais eu le rôle « agent ».
--
-- Conséquence, et elle est visible par la Cliente : la file de vérification
-- n'est ouvrable par personne. `elevia-verif` refuse en 403 toute demande
-- d'accès à la file et toute décision qui ne vient pas d'un agent. La
-- demande de vérification déposée le 04/09/2026 est donc restée en attente,
-- alors que l'écran affiché au membre promet une réponse « sous 24 à 48
-- heures ouvrées ».
--
-- Le compte ci-dessous a été créé le 14/09/2026 par le parcours d'inscription
-- normal de l'application, pour que tous ses champs soient posés par
-- l'application elle-même et non insérés à la main. Il ne reste qu'à lui
-- donner son rôle.
--
-- Comment s'en servir une fois cette migration appliquée :
--   1. ouvrir https://demo.agenceattractor.com/elevia/app/
--   2. « J'ai déjà un compte », adresse macarthur@agenceattractor.com
--   3. saisir le code reçu par e-mail
--   4. ouvrir https://demo.agenceattractor.com/elevia/admin/
-- Le back-office lit le jeton de session posé par l'application : les deux
-- adresses sont sur le même domaine, la connexion faite sur l'une vaut pour
-- l'autre. Se connecter directement sur /admin/ ne marche pas, c'est normal.
-- ════════════════════════════════════════════════════════════════════════

update public.el_membres
   set role = 'agent'
 where email_norm = lower('macarthur@agenceattractor.com')
   and role = 'membre';

-- Contrôle : doit renvoyer exactement une ligne, pseudo « EquipeElevia ».
select pseudo, role
  from public.el_membres
 where role = 'agent';

-- ── Ce qui reste à faire, et qui n'est pas de notre ressort ──────────────
-- La Cliente et son équipe auront besoin de leurs propres accès. Ils ne
-- sont PAS créés ici : chaque compte d'équipe doit être ouvert par la
-- personne elle-même, avec son adresse, avant d'être promu. Donner le
-- rôle « agent » à un compte, c'est donner accès aux vidéos d'identité de
-- tous les membres.
--
-- Rappel de sécurité, vérifié le 14/09/2026 en conditions réelles avec un
-- vrai jeton de membre : `elevia-verif` contrôle le rôle côté serveur avant
-- la file ET avant chaque décision (403), et un jeton inventé est refusé
-- (401). Le rôle ne peut donc pas s'obtenir depuis le navigateur. Cette
-- propriété est à préserver : voir la mémoire sur l'escalade de privilèges
-- par policy de self-update, qui a déjà mordu sur une autre application.
