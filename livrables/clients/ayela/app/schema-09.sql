-- ============================================================
-- Ayêla — Migration 09 : promotions pilotées par Lorraine
-- Elle crée ses offres depuis le tableau de bord, la vitrine
-- applique seule le prix barré, le badge et le panier.
--
-- Portée : 'boutique' (toutes les créations) ou 'produit'
--          (une création, tous ses formats ou un format précis).
-- Remise  : 'pourcentage' (ex. 20 = -20 %) ou 'prix_fixe'
--          (ex. 8000 = le format passe à 8 000 F).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ay_promos (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre        text NOT NULL,                        -- « Fête des mères »
  message      text,                                 -- accroche affichée sur la boutique
  portee       text NOT NULL DEFAULT 'boutique',     -- boutique | produit
  produit_id   uuid REFERENCES public.ay_produits(id) ON DELETE CASCADE,
  format_label text,                                 -- NULL = tous les formats du produit
  type_remise  text NOT NULL DEFAULT 'pourcentage',  -- pourcentage | prix_fixe
  valeur       numeric NOT NULL,
  debut        date,                                 -- NULL = tout de suite
  fin          date,                                 -- NULL = sans date de fin
  actif        boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ay_promos_actif_idx ON public.ay_promos (actif, debut, fin);

ALTER TABLE public.ay_promos ENABLE ROW LEVEL SECURITY;

-- Vitrine publique : ne voit QUE les promotions en cours.
-- Le filtrage des dates est fait ici, côté serveur : une offre
-- programmée ou terminée n'est jamais lisible avec la clé publique.
DROP POLICY IF EXISTS ay_promos_public_read ON public.ay_promos;
CREATE POLICY ay_promos_public_read ON public.ay_promos
  FOR SELECT USING (
    actif = true
    AND (debut IS NULL OR debut <= CURRENT_DATE)
    AND (fin   IS NULL OR fin   >= CURRENT_DATE)
  );

-- Lorraine : voit et pilote tout (y compris programmé, en pause, terminé)
DROP POLICY IF EXISTS ay_promos_admin_all ON public.ay_promos;
CREATE POLICY ay_promos_admin_all ON public.ay_promos
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);
