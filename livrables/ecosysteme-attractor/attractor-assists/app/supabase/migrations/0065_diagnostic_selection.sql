-- 0065_diagnostic_selection.sql — 05/08/2026
--
-- Pourquoi : en fin de diagnostic, le prospect coche ce qui l'intéresse (application,
-- accompagnement, vidéo, contenus, ne sait pas). Jusqu'ici cette sélection ne servait qu'à
-- composer le texte d'un lien wa.me : rien n'était envoyé au serveur. Si le prospect ne
-- cliquait pas sur le bouton, ou cliquait sans envoyer le message, l'information disparaissait.
--
-- Or c'est le signal le plus fiable du tunnel : c'est le prospect lui-même qui dit ce qu'il
-- vient chercher, là où la classification automatique se trompe (cas Serge Boka, 05/08 :
-- demande explicite de plateforme classée en famille B, donc voie conseil).
--
-- On stocke donc la sélection, et on mesure aussi qui arrive au bout de l'écran sans cliquer,
-- chiffre qui n'existait pas.

alter table public.pilotage_pipeline
  add column if not exists services text[],
  add column if not exists wa_clique_at timestamptz,
  add column if not exists famille_auto text;

comment on column public.pilotage_pipeline.services is
  'Ce que le prospect a coché lui-même en fin de diagnostic. Prime sur la classification automatique.';
comment on column public.pilotage_pipeline.wa_clique_at is
  'Horodatage du clic sur le bouton WhatsApp de fin de diagnostic. Null = il a vu l''écran sans cliquer.';
comment on column public.pilotage_pipeline.famille_auto is
  'Famille proposée par le modèle, conservée quand la sélection du prospect l''a corrigée. Matière première de l''apprentissage du classificateur.';

alter table public.diagnostics
  add column if not exists services text[];

comment on column public.diagnostics.services is
  'Copie de la sélection du prospect, pour garder le diagnostic complet dans une seule ligne.';
