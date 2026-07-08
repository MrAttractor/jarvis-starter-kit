-- J'Envoie Express — Collecte à domicile (sens Abidjan → Paris)
-- Ajoute le flag + le quartier de collecte, miroir de livraison_souhaitee / quartier_abidjan.
-- Appliqué en prod le 2026-07-09 sur le projet partagé attractor-assists.

ALTER TABLE je_demandes ADD COLUMN IF NOT EXISTS collecte_domicile boolean DEFAULT false;
ALTER TABLE je_demandes ADD COLUMN IF NOT EXISTS quartier_collecte text;

ALTER TABLE je_colis    ADD COLUMN IF NOT EXISTS collecte_domicile boolean DEFAULT false;
ALTER TABLE je_colis    ADD COLUMN IF NOT EXISTS quartier_collecte text;
