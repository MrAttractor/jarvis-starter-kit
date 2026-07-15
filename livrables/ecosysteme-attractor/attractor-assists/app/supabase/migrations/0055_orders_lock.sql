-- Migration 0055 : fermeture de la faille d'écriture des commandes
--
-- `public_insert` (créée en 0028, recréée à l'identique en 0040) autorisait
-- FOR INSERT WITH CHECK (true) : avec la clé anon — publique par nature, lisible
-- dans le code de n'importe quelle boutique — n'importe qui pouvait insérer une
-- commande en choisissant lui-même `owner_id`. Vérifié en réel avant fermeture :
-- une commande à 999 999 F insérée sur un compte tiers, sans authentification,
-- HTTP 201. Elle contournait aussi le quota mensuel et l'enregistrement Fidelys.
--
-- Le seul appelant était PublicAssistantScreen.jsx (supprimé : la boutique passe
-- désormais par save_order). Vérifié par recherche sur tout le repo, y compris
-- les sites clients de demo-site : creal, template-1b et template-1c utilisent
-- déjà save_order.
--
-- save_order est SECURITY DEFINER : il écrit sans cette policy, résout `owner_id`
-- côté serveur depuis le slug, applique le quota et alimente Fidelys.

DROP POLICY IF EXISTS "public_insert" ON public.orders;

-- Reste en place : "owner_orders" (auth.uid() = owner_id), qui donne à chaque
-- entrepreneur la main sur ses seules commandes.
