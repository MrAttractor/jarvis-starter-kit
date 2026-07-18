-- ============================================================
-- Ayêla — Migration 02 : fiche stock/vente par point de vente + emballages (appro Chine)
-- Projet partagé lgdgbrivnhgeupqhkckd · admin Lorraine 52992f9a-593f-4b03-b4c6-1e0981d36224
-- ============================================================

-- ── Fiche par POS : une ligne = un produit/format suivi dans ce point de vente ──
CREATE TABLE IF NOT EXISTS public.ay_pos_lignes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pos_id      uuid NOT NULL REFERENCES public.ay_pos(id) ON DELETE CASCADE,
  produit_nom text NOT NULL,
  format      text,
  depose      int DEFAULT 0,   -- quantité déposée dans ce point
  vendu       int DEFAULT 0,   -- quantité vendue (reste = depose - vendu)
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ay_pos_lignes_pos_idx ON public.ay_pos_lignes(pos_id);

-- ── Emballages vides / consommables (approvisionnement fournisseur, ex. Chine ~90j) ──
CREATE TABLE IF NOT EXISTS public.ay_emballages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom             text NOT NULL,            -- ex. "Bouteille verre 50cl"
  type            text,                     -- Bouteille | Canette | Pocket | Autre
  quantite        int DEFAULT 0,            -- vides en stock
  seuil           int DEFAULT 100,          -- seuil d'alerte
  en_commande     int DEFAULT 0,            -- quantité déjà commandée
  fournisseur     text DEFAULT 'Chine',
  delai_jours     int DEFAULT 90,           -- délai fournisseur (~3 mois)
  derniere_commande date,
  reception_prevue  date,                   -- ETA de la commande en cours
  note            text,
  updated_at      timestamptz DEFAULT now()
);

-- ── RLS : admin (Lorraine) uniquement ──
ALTER TABLE public.ay_pos_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ay_emballages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ay_pos_lignes_admin_all ON public.ay_pos_lignes;
CREATE POLICY ay_pos_lignes_admin_all ON public.ay_pos_lignes
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

DROP POLICY IF EXISTS ay_emballages_admin_all ON public.ay_emballages;
CREATE POLICY ay_emballages_admin_all ON public.ay_emballages
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

-- ── Seed emballages (3 formats réels, quantités à 0, à remplir par Lorraine) ──
INSERT INTO public.ay_emballages (nom, type, quantite, seuil, delai_jours, fournisseur) VALUES
('Bouteille verre 50cl', 'Bouteille', 0, 200, 90, 'Chine'),
('Canette 33cl',         'Canette',   0, 300, 90, 'Chine'),
('Pocket 100ml PET',     'Pocket',    0, 500, 90, 'Chine');
