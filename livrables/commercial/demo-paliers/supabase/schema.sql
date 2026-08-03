-- ============================================================
-- DEMO PALIERS — Maison Wôrô (boutique fictive de démonstration)
-- Projet Supabase partagé : lgdgbrivnhgeupqhkckd
-- Préfixe tables : demo_
--
-- OBJET
-- Trois vitrines + trois tableaux de bord de démonstration, un par palier
-- du barème Famille A (App simple 250 € / App pro 490 € / App pro+ 1 200 €).
-- Un seul jeu de données, trois habillages front : ce qui change d'un palier
-- à l'autre, ce sont les fonctions affichées, pas la base.
--
-- SÉCURITÉ — LIRE AVANT DE TOUCHER
-- Ces tables sont les SEULES du projet ouvertes en écriture publique.
-- C'est assumé : le tableau de bord de démo doit être cliquable sans login,
-- sinon il ne se partage pas dans un post. Conséquences acceptées :
--   1. Aucune donnée réelle, aucune donnée personnelle ici. Jamais.
--   2. Tout est jetable et remis à zéro automatiquement (voir demo_reset()).
--   3. Aucune de ces tables n'est liée à auth.users, à un UID client ou à
--      une table applicative. Pas de colonne de rôle, donc pas de vecteur
--      d'escalade de privilèges.
-- Ne JAMAIS reprendre ces policies comme modèle pour un dossier client :
-- le standard client reste le gating nominatif auth.uid() = UUID.
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.demo_produits (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         text NOT NULL,
  categorie   text NOT NULL DEFAULT 'Soin',
  description text,
  formats     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{label, sub, prix}]
  badge       text,
  photo_url   text,
  est_actif   boolean DEFAULT true,
  ordre       int DEFAULT 100,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_commandes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_nom   text NOT NULL DEFAULT 'Cliente boutique',
  client_wa    text,
  client_zone  text,                                 -- quartier / commune
  produits     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{nom, format, quantite, prix}]
  total        int DEFAULT 0,                        -- en FCFA
  statut       text DEFAULT 'nouvelle',              -- nouvelle | acceptee | en_livraison | livree | annulee
  livreur_note text,
  created_at   timestamptz DEFAULT now()
);

-- Palier pro+ : le fichier client, qui n'existe pas dans les paliers inférieurs
CREATE TABLE IF NOT EXISTS public.demo_clients (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom           text NOT NULL,
  whatsapp      text,
  zone          text,
  nb_commandes  int DEFAULT 0,
  total_achete  int DEFAULT 0,
  derniere_le   date,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_stock (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_nom  text NOT NULL,
  format       text,
  quantite     int DEFAULT 0,
  seuil        int DEFAULT 10,
  updated_at   timestamptz DEFAULT now()
);

-- Palier pro+ : points de vente / dépôts
CREATE TABLE IF NOT EXISTS public.demo_pos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom           text NOT NULL,
  zone          text,
  gerante_nom   text,
  gerante_tel   text,
  stock_depose  int DEFAULT 0,
  vendu         int DEFAULT 0,
  actif         boolean DEFAULT true,
  ordre         int DEFAULT 100,
  created_at    timestamptz DEFAULT now()
);

-- Palier pro+ : l'équipe (ce que « multi-utilisateurs » veut dire, montré)
CREATE TABLE IF NOT EXISTS public.demo_equipe (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         text NOT NULL,
  role        text NOT NULL DEFAULT 'Vendeuse',   -- Direction | Vendeuse | Livreur | Production
  perimetre   text,
  actif       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Journal de ventes : alimente les statistiques (sinon les graphiques sont vides)
CREATE TABLE IF NOT EXISTS public.demo_ventes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_nom  text NOT NULL,
  format       text,
  quantite     int DEFAULT 1,
  montant      int DEFAULT 0,
  canal        text DEFAULT 'boutique',            -- boutique | point_de_vente | whatsapp
  pos_nom      text,
  vendu_le     date DEFAULT current_date,
  created_at   timestamptz DEFAULT now()
);

-- ── RLS : ouverture publique assumée, limitée à ces tables ──

ALTER TABLE public.demo_produits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_stock     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_pos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_equipe    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_ventes    ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['demo_produits','demo_commandes','demo_clients',
                           'demo_stock','demo_pos','demo_equipe','demo_ventes']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_demo_open ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_demo_open ON public.%I FOR ALL USING (true) WITH CHECK (true)',
      t, t);
  END LOOP;
END $$;

-- ── REMISE À ZÉRO ───────────────────────────────────────────
-- Appelée par le bouton « Remettre la démo à zéro » (RPC anon) et par le
-- planificateur horaire. Vide tout et rejoue le jeu de données de départ.

CREATE OR REPLACE FUNCTION public.demo_reset()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  TRUNCATE public.demo_produits, public.demo_commandes, public.demo_clients,
           public.demo_stock, public.demo_pos, public.demo_equipe, public.demo_ventes;

  -- Catalogue (8 références)
  INSERT INTO public.demo_produits (nom, categorie, description, formats, badge, photo_url, ordre) VALUES
  ('Beurre de karité brut', 'Soin corps', 'Karité non raffiné du nord de la Côte d''Ivoire, filtré à froid. Nourrit les peaux très sèches, apaise les tiraillements.',
   '[{"label":"Pot 200 g","sub":"Format familial","prix":"4 500 F"},{"label":"Pot 50 g","sub":"Format sac à main","prix":"1 500 F"}]'::jsonb, 'Best-seller', 'assets/p-karite.jpg', 1),
  ('Savon noir traditionnel', 'Soin visage', 'Cendres de cabosse de cacao et huile de palmiste. Nettoie en profondeur sans décaper. Le geste du matin.',
   '[{"label":"Pain 250 g","sub":"Coupé main","prix":"2 000 F"}]'::jsonb, NULL, 'assets/p-savon.jpg', 2),
  ('Huile de coco vierge', 'Huile', 'Pression à froid, non désodorisée. Cheveux, corps, cuisine. Un seul produit, trois usages.',
   '[{"label":"Flacon 250 ml","sub":"Verre ambré","prix":"5 000 F"},{"label":"Flacon 100 ml","sub":"Format voyage","prix":"2 500 F"}]'::jsonb, NULL, 'assets/p-coco.jpg', 3),
  ('Huile de ricin noire', 'Huile', 'Ricin grillé puis pressé, à l''ancienne. Densifie les cheveux, fortifie les ongles. Odeur forte, effet réel.',
   '[{"label":"Flacon 100 ml","sub":"Verre ambré","prix":"3 500 F"}]'::jsonb, NULL, 'assets/p-ricin.jpg', 4),
  ('Beurre de cacao pur', 'Soin corps', 'Cacao ivoirien, pressé et coulé sans additif. Fond au contact de la peau, parfum naturel de chocolat.',
   '[{"label":"Pot 150 g","sub":"Non parfumé","prix":"4 000 F"}]'::jsonb, NULL, 'assets/p-cacao.jpg', 5),
  ('Gommage café-karité', 'Soin corps', 'Marc de café d''Abidjan et karité fondu. Lisse le grain de peau, réveille la circulation. Deux fois par semaine.',
   '[{"label":"Pot 200 g","sub":"Grain moyen","prix":"5 500 F"}]'::jsonb, 'Nouveau', 'assets/p-gommage.jpg', 6),
  ('Lait corporel karité-coco', 'Soin corps', 'La texture légère du coco et la tenue du karité. Pénètre vite, ne colle pas. Pour tous les jours.',
   '[{"label":"Flacon 250 ml","sub":"Pompe","prix":"6 000 F"}]'::jsonb, NULL, 'assets/p-lait.jpg', 7),
  ('Coffret découverte', 'Coffret', 'Karité 50 g, savon noir, huile de coco 100 ml. Le cadeau qui fait essayer la marque.',
   '[{"label":"Coffret 3 pièces","sub":"Emballage cadeau","prix":"8 500 F"}]'::jsonb, 'Cadeau', 'assets/p-coffret.jpg', 8);

  -- Stock
  INSERT INTO public.demo_stock (produit_nom, format, quantite, seuil) VALUES
  ('Beurre de karité brut', 'Pot 200 g', 48, 15),
  ('Beurre de karité brut', 'Pot 50 g', 96, 30),
  ('Savon noir traditionnel', 'Pain 250 g', 12, 20),
  ('Huile de coco vierge', 'Flacon 250 ml', 34, 10),
  ('Huile de coco vierge', 'Flacon 100 ml', 61, 20),
  ('Huile de ricin noire', 'Flacon 100 ml', 7, 10),
  ('Beurre de cacao pur', 'Pot 150 g', 22, 10),
  ('Gommage café-karité', 'Pot 200 g', 29, 10),
  ('Lait corporel karité-coco', 'Flacon 250 ml', 41, 15),
  ('Coffret découverte', 'Coffret 3 pièces', 18, 8);

  -- Équipe (palier pro+)
  INSERT INTO public.demo_equipe (nom, role, perimetre) VALUES
  ('Aminata K.', 'Direction', 'Accès complet, prix et statistiques'),
  ('Fatou D.', 'Vendeuse', 'Commandes et catalogue, sans les chiffres'),
  ('Ibrahim S.', 'Livreur', 'Tournée du jour uniquement'),
  ('Mariam T.', 'Production', 'Stock et fabrication');

  -- Points de vente (palier pro+)
  INSERT INTO public.demo_pos (nom, zone, gerante_nom, gerante_tel, stock_depose, vendu, ordre) VALUES
  ('Boutique Cocody Angré', 'Cocody', 'Fatou D.', '+225 07 00 00 00 01', 120, 87, 1),
  ('Corner Marcory Zone 4', 'Marcory', 'Adjoua N.', '+225 07 00 00 00 02', 80, 64, 2),
  ('Dépôt Yopougon Niangon', 'Yopougon', 'Salimata B.', '+225 07 00 00 00 03', 60, 31, 3);

  -- Fichier client (palier pro+)
  INSERT INTO public.demo_clients (nom, whatsapp, zone, nb_commandes, total_achete, derniere_le) VALUES
  ('Awa Traoré', '+225 07 00 00 10 01', 'Cocody', 7, 48500, current_date - 3),
  ('Nadège Koffi', '+225 07 00 00 10 02', 'Marcory', 4, 26000, current_date - 9),
  ('Sarah Diomandé', '+225 07 00 00 10 03', 'Yopougon', 3, 17500, current_date - 14),
  ('Kadi Bamba', '+225 07 00 00 10 04', 'Cocody', 2, 11000, current_date - 21),
  ('Estelle Gnahoré', '+225 07 00 00 10 05', 'Plateau', 1, 8500, current_date - 30);

  -- Commandes en cours, réparties sur les statuts pour que le tableau soit vivant
  INSERT INTO public.demo_commandes (client_nom, client_wa, client_zone, produits, total, statut, created_at) VALUES
  ('Awa Traoré', '+225 07 00 00 10 01', 'Cocody Angré',
   '[{"nom":"Beurre de karité brut","format":"Pot 200 g","quantite":2,"prix":4500},{"nom":"Savon noir traditionnel","format":"Pain 250 g","quantite":1,"prix":2000}]'::jsonb,
   11000, 'nouvelle', now() - interval '40 minutes'),
  ('Nadège Koffi', '+225 07 00 00 10 02', 'Marcory Zone 4',
   '[{"nom":"Coffret découverte","format":"Coffret 3 pièces","quantite":1,"prix":8500}]'::jsonb,
   8500, 'acceptee', now() - interval '3 hours'),
  ('Sarah Diomandé', '+225 07 00 00 10 03', 'Yopougon Niangon',
   '[{"nom":"Huile de coco vierge","format":"Flacon 250 ml","quantite":1,"prix":5000},{"nom":"Gommage café-karité","format":"Pot 200 g","quantite":1,"prix":5500}]'::jsonb,
   10500, 'en_livraison', now() - interval '6 hours'),
  ('Kadi Bamba', '+225 07 00 00 10 04', 'Cocody Riviera',
   '[{"nom":"Lait corporel karité-coco","format":"Flacon 250 ml","quantite":1,"prix":6000}]'::jsonb,
   6000, 'livree', now() - interval '1 day');

  -- Journal de ventes sur 90 jours, pour que les statistiques aient une histoire.
  -- Volume croissant et pic de week-end : un graphique plat ne démontre rien.
  INSERT INTO public.demo_ventes (produit_nom, format, quantite, montant, canal, pos_nom, vendu_le)
  SELECT
    p.nom,
    p.formats->0->>'label',
    1 + (i % 3),
    (1 + (i % 3)) * (regexp_replace(p.formats->0->>'prix', '[^0-9]', '', 'g'))::int,
    -- Trois canaux, pas deux : la répartition du palier pro+ est un graphique
    -- à trois parts, il lui faut trois parts qui existent.
    CASE WHEN i % 4 = 0 THEN 'point_de_vente'
         WHEN i % 7 = 0 THEN 'whatsapp'
         ELSE 'boutique' END,
    CASE WHEN i % 4 = 0 THEN (ARRAY['Boutique Cocody Angré','Corner Marcory Zone 4','Dépôt Yopougon Niangon'])[1 + (i % 3)] END,
    current_date - (i % 90)
  FROM generate_series(1, 260) AS i
  CROSS JOIN LATERAL (
    SELECT nom, formats FROM public.demo_produits ORDER BY ordre OFFSET (i % 8) LIMIT 1
  ) AS p;

  RETURN 'Démonstration remise à zéro le ' || to_char(now(), 'DD/MM/YYYY à HH24:MI');
END $$;

-- La vitrine et le tableau de bord de démo appellent cette fonction sans login.
GRANT EXECUTE ON FUNCTION public.demo_reset() TO anon, authenticated;

-- ── PLANIFICATION HORAIRE ───────────────────────────────────
-- Remise à zéro toutes les heures. Deux raisons : les données restent
-- présentables pour le prospect suivant, et tout contenu déplacé écrit par
-- un visiteur disparaît en moins d'une heure sans intervention.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('demo_reset_horaire')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'demo_reset_horaire');

SELECT cron.schedule('demo_reset_horaire', '0 * * * *', 'SELECT public.demo_reset()');

-- ── AMORÇAGE ────────────────────────────────────────────────
SELECT public.demo_reset();
