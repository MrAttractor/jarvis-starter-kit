-- ════════════════════════════════════════════════════════════════════════
-- 0008 — L'entretien planifié, pour que les 24 heures soient vraies
--
-- Constat du 14/09/2026, après la première décision réelle prise dans le
-- back-office. La purge des vidéos ne tournait qu'au début de chaque appel à
-- l'edge function `elevia-verif`. Autrement dit : elle attendait qu'un membre
-- ouvre son écran de vérification ou qu'un agent ouvre la file.
--
-- Sur un Club calme, trois jours sans appel voulaient dire une vidéo
-- d'identité gardée trois jours. Or la politique de confidentialité publiée
-- promet au membre « 24 heures après la décision, 30 jours au maximum », et
-- l'Avenant n°1 Art. 15 l'engage contractuellement. La promesse ne pouvait
-- donc pas être tenue par construction : elle dépendait du passage de
-- quelqu'un.
--
-- Cette migration la rend vraie : une tâche horaire appelle l'action
-- `entretien`, qui purge les vidéos décidées, vide la file des orphelins et
-- balaie le stockage.
--
-- Le secret d'appel vit dans Vault et non en clair dans la définition de la
-- tâche. L'action est fermée si le secret ne correspond pas, et fermée aussi
-- si aucun secret n'est configuré côté fonction.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Les extensions ───────────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── 2. Les deux secrets, dans Vault ─────────────────────────────────────
-- `elevia_cron_secret` : la même valeur est posée dans les secrets de l'edge
--   function sous le nom ELEVIA_CRON_SECRET. Les deux doivent correspondre,
--   sinon l'entretien répond 403 et la tâche ne purge rien. C'est le bon
--   comportement : elle échoue franchement plutôt que de tourner à vide.
-- `elevia_anon_key` : la clé anonyme du projet, que la fonction exige comme
--   toute requête entrante. Elle est déjà publique (le navigateur la porte),
--   mais elle n'a pas à traîner en clair dans une définition de tâche.
--
-- Les valeurs ne figurent pas dans ce fichier, qui est versionné. Elles ont
-- été posées le 14/09/2026 par appel direct, et se recréent ainsi :
--
--   select vault.create_secret('<valeur>', 'elevia_cron_secret',
--     'Secret partagé entretien Club Élévia (migration 0008)');
--   select vault.create_secret('<clé anon>', 'elevia_anon_key',
--     'Clé anon du projet, pour les appels planifiés');
--
-- Contrôle : les deux doivent exister avant de planifier la tâche.
do $$
begin
  if (select count(*) from vault.secrets
       where name in ('elevia_cron_secret', 'elevia_anon_key')) < 2 then
    raise exception 'Les secrets Vault elevia_cron_secret et elevia_anon_key doivent exister avant de planifier la tâche.';
  end if;
end $$;

-- ── 3. La tâche horaire ─────────────────────────────────────────────────
-- Passée à 17 minutes de chaque heure, et non à l'heure pile : cinq autres
-- tâches tournent déjà sur ce projet, dont deux à l'heure ronde.
select cron.unschedule('elevia-entretien')
 where exists (select 1 from cron.job where jobname = 'elevia-entretien');

select cron.schedule(
  'elevia-entretien',
  '17 * * * *',
  $cron$
    select net.http_post(
      url := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/elevia-verif',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'elevia_anon_key'),
        'x-elevia-entretien', (select decrypted_secret from vault.decrypted_secrets where name = 'elevia_cron_secret')
      ),
      body := '{"action":"entretien"}'::jsonb
    ) as r
  $cron$
);

-- ── 4. Contrôle ─────────────────────────────────────────────────────────
-- La tâche doit apparaître active. Son effet réel se lit dans
-- net._http_response après son premier passage.
select jobname, schedule, active from cron.job where jobname = 'elevia-entretien';

-- ── APPLIQUÉE le 14/09/2026, et vérifiée ────────────────────────────────
-- La commande de la tâche a été exécutée telle qu'enregistrée, sans attendre
-- l'heure : réponse 200 avec le compte rendu de purge. Chaîne complète
-- prouvée, Vault puis pg_net puis edge function.
--
-- L'action `entretien` a aussi été éprouvée sur ses refus : sans en-tête et
-- avec un mauvais secret, elle répond 403 et ne purge rien.
--
-- Effet réel constaté dans la foulée : deux vidéos devenues orphelines après
-- la suppression d'un compte de recette ont été effacées du stockage par un
-- passage d'entretien, et la vidéo encore référencée d'une membre a été vue
-- par le balayage sans être touchée.
