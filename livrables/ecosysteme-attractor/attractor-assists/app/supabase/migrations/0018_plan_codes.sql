-- Migration 0018 : Mise à jour des plan_codes
-- Ancienne nomenclature → nouvelle nomenclature
-- decouverte → gratuit  |  manager → team

UPDATE profiles
SET plan_code = 'gratuit'
WHERE plan_code IN ('decouverte', 'decouverte_eu');

UPDATE profiles
SET plan_code = 'team'
WHERE plan_code = 'manager';

-- Insérer les nouveaux forfaits dans le catalogue (sans écraser l'existant)
INSERT INTO plans (code, nom, zone, prix_base, prix_promo, engagement_mois, devise, messages_jour, proactif, agents, ordre)
VALUES
  ('gratuit',   'Gratuit',          'both', 0,    0,    0, 'EUR',  20,  false, ARRAY['coach'],                                              1),
  ('growth',    'Attractor Growth', 'CI',   0,    0,    1, 'XOF',  100, true,  ARRAY['coach','awa','kofi'],                                  2),
  ('growth_eu', 'Attractor Growth', 'EU',   15,   15,   1, 'EUR',  100, true,  ARRAY['coach','awa','kofi'],                                  2),
  ('team',      'Attractor Team',   'both', 29,   29,   1, 'EUR',  -1,  true,  ARRAY['coach','awa','miriam','serge','roland','kofi','carelle'], 3)
ON CONFLICT (code) DO NOTHING;
