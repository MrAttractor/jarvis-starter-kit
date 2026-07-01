-- ============================================================
-- GetWinWorld — Supabase Schema
-- Projet : lgdgbrivnhgeupqhkckd (Attractor Assists — projet partagé multi-clients)
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Étape 0 : compte admin de Charles ──────────────────────
-- Compte créé le 01/07/2026 : UUID 62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9 (déjà substitué ci-dessous)
--
-- Ne JAMAIS utiliser auth.role() = 'authenticated' seul ici : ce projet est
-- partagé par ~25 testeurs Attractor Assists + d'autres clients (C'Real, etc.)
-- qui ont TOUS un compte Auth dans ce même projet. Le gating doit être
-- nominatif (auth.uid() = UUID de Charles), sinon n'importe quel autre
-- utilisateur du projet pourrait lire/écrire les données de Charles.

-- ── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gw_produits (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom               text NOT NULL,
  prix              text NOT NULL,
  description       text,
  categorie         text NOT NULL DEFAULT 'Divers',
  maison            text,
  note_delai        text DEFAULT 'Sur commande · Délai 5-8 jours',
  badge             text,
  photo_url         text NOT NULL,
  est_actif         boolean DEFAULT true,
  est_offre_du_jour boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gw_reservations (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_id   uuid REFERENCES public.gw_produits(id) ON DELETE SET NULL,
  produit_nom  text NOT NULL,
  client_nom   text NOT NULL,
  client_wa    text NOT NULL,
  message      text,
  traitee      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gw_inscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_nom  text NOT NULL,
  client_wa   text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.gw_produits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gw_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gw_inscriptions ENABLE ROW LEVEL SECURITY;

-- Lecture publique (visiteurs anonymes, clé anon)
CREATE POLICY "gw_produits_public_read" ON public.gw_produits
  FOR SELECT USING (est_actif = true);

CREATE POLICY "gw_reservations_public_insert" ON public.gw_reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "gw_inscriptions_public_insert" ON public.gw_inscriptions
  FOR INSERT WITH CHECK (true);

-- Écriture/lecture admin, restreintes à Charles uniquement
CREATE POLICY "gw_produits_admin_all" ON public.gw_produits
  FOR ALL
  USING      (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid)
  WITH CHECK (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

CREATE POLICY "gw_reservations_admin_read" ON public.gw_reservations
  FOR SELECT USING (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

CREATE POLICY "gw_reservations_admin_update" ON public.gw_reservations
  FOR UPDATE
  USING      (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid)
  WITH CHECK (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

CREATE POLICY "gw_inscriptions_admin_read" ON public.gw_inscriptions
  FOR SELECT USING (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

-- ── STORAGE ─────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('gw-photos', 'gw-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "gw_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'gw-photos');

-- Upload/édition/suppression restreints à Charles uniquement
-- (un brouillon antérieur de ce schéma laissait n'importe quel visiteur
-- anonyme uploader/supprimer dans ce bucket — faille corrigée ici)
CREATE POLICY "gw_photos_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gw-photos' AND auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid
  );

CREATE POLICY "gw_photos_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gw-photos' AND auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid
  );

CREATE POLICY "gw_photos_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gw-photos' AND auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid
  );

-- ── SEED — 9 produits actuellement hardcodés dans index.html ──
-- (photo_url pointe vers le dossier statique photos/ pour ces 9-là —
-- les nouveaux arrivages publiés via admin.html iront dans le bucket
-- gw-photos à la place)

INSERT INTO public.gw_produits (nom, prix, description, categorie, maison, note_delai, badge, photo_url, est_actif, est_offre_du_jour) VALUES
('Loafer Python Noir',     '490 €',   'Mocassin en cuir de python véritable, sellerie intérieure camel. Pièce rare, confectionnée à la main. Charles commande pour vous.', 'Chaussures', 'Artisan Exclusif',        'Sur commande · Délai 5-8 jours',  'Exclusif',  'photos/p1.jpg',  true, false),
('Script Loafer Tabac',    '395 €',   'Le moccasin signature Filangieri. Cuir pleine fleur brossé, écriture cursive gravée à la main. Charles s''occupe de la livraison.', 'Chaussures', 'Filangieri 1966 — Italy', 'Sur commande · Délai 5-7 jours',  NULL,        'photos/p10.jpg', true, false),
('Script Loafer Nuit',     '395 €',   'Version nuit du loafer Filangieri Script. Cuir pleine fleur bleu-nuit, sellerie orange signature.', 'Chaussures', 'Filangieri 1966 — Italy', 'Sur commande · Délai 5-7 jours',  NULL,        'photos/p11.jpg', true, false),
('Sneaker Croco Cognac',   '450 €',   'Sneaker cuir croco gaufré cognac, tige full-grain, semelle running blanche. Élégance et sport réunis.', 'Chaussures', 'Filangieri 1966 — Italy', 'Sur commande · Délai 6-8 jours',  'Nouveauté', 'photos/p20.jpg', true, false),
('Penny Loafer Classic',   '320 €',   'Le loafer classique revisité. Cuir veau pleine fleur noir, sangle penny traditionnelle, semelle gomme.', 'Chaussures', 'Artisan Sélectionné',     'Sur commande · Délai 4-6 jours',  NULL,        'photos/p45.jpg', true, false),
('Costume DB Anthracite',  '1 200 €', 'Costume double boutonnage lainage fin anthracite, fine rayure craie. Coupe cintrée italienne.', 'Costumes',   'Tailleur Italien',        'Sur commande · Délai 7-12 jours', 'Signature', 'photos/p30.jpg', true, false),
('Costume Classic Navy',   '1 100 €', 'Costume simple boutonnage navy profond. Lainage stretch, coupe semi-structurée moderne.', 'Costumes',   'Tailleur Italien',        'Sur commande · Délai 7-12 jours', NULL,        'photos/p40.jpg', true, false),
('Costume DB Vert Forêt',  '1 350 €', 'Costume double boutonnage vert forêt, rayure craie dorée. Pour les hommes qui assument leur élégance.', 'Costumes',   'Tailleur Italien',        'Sur commande · Délai 8-12 jours', 'Rare',      'photos/p5.jpg',  true, false),
('Costume DB Navy Rayé',   '1 250 €', 'Double boutonnage navy intense, rayure ton sur ton. Label Made in Italy, finitions soignées.', 'Costumes',   'Made in Italy',           'Sur commande · Délai 7-12 jours', NULL,        'photos/p25.jpg', true, false);
