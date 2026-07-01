-- ============================================================
-- GetWinWorld — Schema complémentaire : comptes clients + panier
-- Projet : lgdgbrivnhgeupqhkckd (Attractor Assists — projet partagé multi-clients)
-- Exécuter dans : Supabase Dashboard > SQL Editor (après supabase-schema.sql)
-- ============================================================

-- Compte client léger, sans mot de passe (identité conservée côté navigateur
-- via localStorage, cohérent avec le reste de l'app qui n'a pas d'auth visiteur)
CREATE TABLE IF NOT EXISTS public.gw_clients (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom        text NOT NULL,
  whatsapp   text NOT NULL,
  email      text,
  ville      text,
  langue     text,
  created_at timestamptz DEFAULT now()
);

-- Demande groupée envoyée à Charles (le panier constitué par le client)
-- produits = jsonb : [{ produit_id, nom, prix, quantite, commentaire }]
CREATE TABLE IF NOT EXISTS public.gw_commandes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    uuid REFERENCES public.gw_clients(id) ON DELETE SET NULL,
  client_nom   text NOT NULL,
  client_wa    text NOT NULL,
  produits     jsonb NOT NULL,
  traitee      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.gw_clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gw_commandes ENABLE ROW LEVEL SECURITY;

-- Le client peut créer son compte et envoyer une demande, mais ne peut PAS
-- relire la table (pas de policy SELECT publique) : son identité reste dans
-- son localStorage, pas besoin de la relire depuis Supabase. Ça évite qu'un
-- visiteur puisse lister les noms/WhatsApp/commandes des autres clients de
-- Charles via la clé anon (même logique que gw_reservations/gw_inscriptions).
CREATE POLICY "gw_clients_public_insert" ON public.gw_clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "gw_commandes_public_insert" ON public.gw_commandes
  FOR INSERT WITH CHECK (true);

-- Charles uniquement : lecture des comptes clients et gestion complète des demandes
CREATE POLICY "gw_clients_admin_read" ON public.gw_clients
  FOR SELECT USING (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

CREATE POLICY "gw_commandes_admin_all" ON public.gw_commandes
  FOR ALL
  USING      (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid)
  WITH CHECK (auth.uid() = '62d7867d-ee1b-4ef3-acbc-0cf089ea8ef9'::uuid);

-- Récupération d'espace sur un nouvel appareil (localStorage perdu).
-- Fonction dédiée plutôt qu'une policy SELECT publique : une policy USING(true)
-- permettrait à n'importe qui de lister TOUS les clients de Charles via la clé
-- anon. Ici, un visiteur ne peut récupérer qu'UNE ligne, et seulement s'il
-- connaît déjà le numéro WhatsApp exact associé au compte.
CREATE OR REPLACE FUNCTION public.gw_find_client_by_whatsapp(p_whatsapp text)
RETURNS TABLE(id uuid, nom text, whatsapp text, email text, ville text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nom, whatsapp, email, ville
  FROM public.gw_clients
  WHERE whatsapp = p_whatsapp
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.gw_find_client_by_whatsapp(text) TO anon, authenticated;
