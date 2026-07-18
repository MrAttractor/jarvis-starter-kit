-- 0004 — Ajout du statut colis "disponible" (après le contrôle douanier, avant "livré)
-- À exécuter dans le SQL Editor Supabase du projet J'Envoie Express.
-- Le colis dédouané mais pas encore remis passe en "disponible".

alter table je_colis drop constraint if exists je_colis_statut_check;

alter table je_colis
  add constraint je_colis_statut_check
  check (statut in ('en_attente','collecte','transit','douane','disponible','livre'));
