-- ============================================================
-- Ayêla SARL — Schéma Supabase (app métier : vitrine + tableau de bord)
-- Projet partagé : lgdgbrivnhgeupqhkckd
-- Admin (Lorraine / Sonialorraine3@gmail.com) : 52992f9a-593f-4b03-b4c6-1e0981d36224
-- Préfixe tables : ay_
--
-- Sécurité multi-tenant : le projet est partagé par ~25 testeurs Assists
-- + d'autres clients (GetWinWorld, C'Real, J'Envoie Express…) qui ont TOUS
-- un compte Auth ici. Tout gating admin est NOMINATIF (auth.uid() = UUID de
-- Lorraine), jamais 'authenticated' seul.
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ay_produits (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom         text NOT NULL,
  categorie   text NOT NULL DEFAULT 'Liqueur',
  degre       text,
  description text,
  formats     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{label, sub, prix}]
  badge       text,
  photo_url   text NOT NULL,
  est_actif   boolean DEFAULT true,
  ordre       int DEFAULT 100,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ay_commandes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_nom  text NOT NULL DEFAULT 'Client boutique',
  client_wa   text,
  produits    jsonb NOT NULL,                        -- [{nom, format, quantite, prix}]
  total       text,
  traitee     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ay_inscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_nom  text NOT NULL,
  client_wa   text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ay_stock (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_nom  text NOT NULL,
  format       text,
  quantite     int DEFAULT 0,
  seuil        int DEFAULT 20,
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ay_lots (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reference    text,
  produit_nom  text NOT NULL,
  ingredients  text,
  volume       text,
  statut       text DEFAULT 'Macération',            -- Macération | Embouteillage | Terminé
  progression  int DEFAULT 0,
  lanema       text DEFAULT 'aucun',                 -- aucun | depose | conforme | non_conforme
  note         text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ay_pos (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom                text NOT NULL,
  zone               text,
  contact_nom        text,
  contact_tel        text,
  stock_depose       int DEFAULT 0,
  vendu              int DEFAULT 0,
  derniere_livraison date,
  prochaine_livraison date,
  actif              boolean DEFAULT true,
  ordre              int DEFAULT 100,
  created_at         timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.ay_produits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_commandes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_stock        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_lots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_pos          ENABLE ROW LEVEL SECURITY;

-- Vitrine publique : lecture du catalogue actif uniquement
DROP POLICY IF EXISTS ay_produits_public_read ON public.ay_produits;
CREATE POLICY ay_produits_public_read ON public.ay_produits
  FOR SELECT USING (est_actif = true);

-- Visiteurs : peuvent passer commande et rejoindre le Club, sans rien relire
DROP POLICY IF EXISTS ay_commandes_public_insert ON public.ay_commandes;
CREATE POLICY ay_commandes_public_insert ON public.ay_commandes
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS ay_inscriptions_public_insert ON public.ay_inscriptions;
CREATE POLICY ay_inscriptions_public_insert ON public.ay_inscriptions
  FOR INSERT WITH CHECK (true);

-- Admin (Lorraine uniquement) sur tout le reste
DROP POLICY IF EXISTS ay_produits_admin_all ON public.ay_produits;
CREATE POLICY ay_produits_admin_all ON public.ay_produits
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_commandes_admin_all ON public.ay_commandes;
CREATE POLICY ay_commandes_admin_all ON public.ay_commandes
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_inscriptions_admin_read ON public.ay_inscriptions;
CREATE POLICY ay_inscriptions_admin_read ON public.ay_inscriptions
  FOR SELECT USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_stock_admin_all ON public.ay_stock;
CREATE POLICY ay_stock_admin_all ON public.ay_stock
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_lots_admin_all ON public.ay_lots;
CREATE POLICY ay_lots_admin_all ON public.ay_lots
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_pos_admin_all ON public.ay_pos;
CREATE POLICY ay_pos_admin_all ON public.ay_pos
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

-- ── STORAGE (photos du catalogue) ───────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('ay-photos', 'ay-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS ay_photos_public_read ON storage.objects;
CREATE POLICY ay_photos_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'ay-photos');
DROP POLICY IF EXISTS ay_photos_admin_insert ON storage.objects;
CREATE POLICY ay_photos_admin_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ay-photos' AND auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);
DROP POLICY IF EXISTS ay_photos_admin_update ON storage.objects;
CREATE POLICY ay_photos_admin_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'ay-photos' AND auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);
DROP POLICY IF EXISTS ay_photos_admin_delete ON storage.objects;
CREATE POLICY ay_photos_admin_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'ay-photos' AND auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

-- ── SEED — catalogue réel (7 créations) ─────────────────────
INSERT INTO public.ay_produits (nom, categorie, degre, description, formats, badge, photo_url, ordre) VALUES
('Cocktail DG', 'Cocktail RTD', '12% · Canette 33cl',
 'Le prêt-à-boire signature : lait de coco, lait de souchet et gingembre. Crémeux, exotique, légèrement épicé. À servir très frais.',
 '[{"label":"Canette 33cl","sub":"Prêt-à-boire, à emporter","prix":"3 000 F"}]'::jsonb, 'RTD', 'assets/dg.jpg', 1),
('Cocktail MAÏKE', 'Cocktail RTD', '10% · Canette 33cl',
 'Frais et audacieux : citron greffé et mandarine. Vif, fruité, désaltérant. Le cocktail nomade et festif.',
 '[{"label":"Canette 33cl","sub":"Prêt-à-boire, à emporter","prix":"3 000 F"}]'::jsonb, 'RTD', 'assets/maike.jpg', 2),
('Ayêla 1722', 'Liqueur', '15% · Liqueur',
 'Hibiscus (bissap), cannelle et anis étoilé. Une signature florale, épicée et douce. Si tu aimes le Porto ou le Martini rouge, tu vas adorer.',
 '[{"label":"Bouteille 50cl","sub":"Verre premium","prix":"10 000 F"},{"label":"Pocket 100ml","sub":"Format nomade PET","prix":"700 F"}]'::jsonb, NULL, 'assets/1722.jpg', 3),
('Ayêla Passion', 'Liqueur', '25% · Liqueur',
 'Fruit de la passion soigneusement sélectionné. Fraîcheur, douceur maîtrisée et finale exotique persistante. Pure, sur glace ou en cocktail.',
 '[{"label":"Bouteille 50cl","sub":"Verre premium","prix":"10 000 F"},{"label":"Pocket 100ml","sub":"Format nomade PET","prix":"700 F"}]'::jsonb, NULL, 'assets/passion.jpg', 4),
('Chocolat Écrémé', 'Liqueur', '25% · Liqueur',
 'Cacao de qualité et lait écrémé : texture veloutée, intensité chocolatée, douceur équilibrée. Idéale dégustation et pâtisserie. (Contient du lait.)',
 '[{"label":"Bouteille 50cl","sub":"Verre premium","prix":"10 000 F"},{"label":"Pocket 100ml","sub":"Format nomade PET","prix":"700 F"}]'::jsonb, NULL, 'assets/chocolat.jpg', 5),
('Nuit de Miel', 'Liqueur', '30% · Liqueur',
 'Miel naturel, gingembre frais et clou de girofle. Douce au palais, intensément parfumée, finale chaleureuse. Enveloppante.',
 '[{"label":"Bouteille 50cl","sub":"Verre premium","prix":"10 000 F"},{"label":"Pocket 100ml","sub":"Format nomade PET","prix":"700 F"}]'::jsonb, NULL, 'assets/miel.jpg', 6),
('Caramel Citron', 'Liqueur', '30% · Liqueur',
 'Caramel gourmand et fraîcheur acidulée du citron. Rondeur et vivacité. Dégustation, mixologie et pâtisserie.',
 '[{"label":"Bouteille 50cl","sub":"Verre premium","prix":"10 000 F"},{"label":"Pocket 100ml","sub":"Format nomade PET","prix":"700 F"}]'::jsonb, NULL, 'assets/caramel.jpg', 7);

-- ── SEED — grille de stock (quantités à 0, à remplir par Lorraine) ──
INSERT INTO public.ay_stock (produit_nom, format, quantite, seuil) VALUES
('Cocktail DG', 'Canette 33cl', 0, 40),
('Cocktail MAÏKE', 'Canette 33cl', 0, 40),
('Ayêla 1722', 'Bouteille 50cl', 0, 20),
('Ayêla 1722', 'Pocket 100ml', 0, 30),
('Ayêla Passion', 'Bouteille 50cl', 0, 20),
('Ayêla Passion', 'Pocket 100ml', 0, 30),
('Chocolat Écrémé', 'Bouteille 50cl', 0, 20),
('Chocolat Écrémé', 'Pocket 100ml', 0, 30),
('Nuit de Miel', 'Bouteille 50cl', 0, 20),
('Nuit de Miel', 'Pocket 100ml', 0, 30),
('Caramel Citron', 'Bouteille 50cl', 0, 20),
('Caramel Citron', 'Pocket 100ml', 0, 30);
