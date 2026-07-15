-- Migration 0054 : le contrat de données de la boutique publique
--
-- La boutique (public/boutique/index.html) n'a besoin que de deux RPC pour
-- s'afficher : get_boutique_info + get_catalogue. L'edge function `public-assistant`
-- devient inutile pour elle (elle sera retirée quand creal, seule appelante restante,
-- aura basculé).
--
-- get_boutique_info v2 corrige trois choses :
--   1. n'expose plus `profiles.id`. La v1 ne le renvoyait pas, mais `public-assistant`
--      le faisait — et c'est exactement l'identifiant que l'ancienne boutique React
--      réutilisait pour forger un `owner_id` en INSERT direct sur `orders`.
--   2. filtre sur client_assistant_ready : sans lui, n'importe qui pouvait énumérer
--      les slugs et lire le nom/l'activité/la zone de profils à moitié inscrits.
--   3. renvoie le layout, le WhatsApp et les infos déclarées de paiement/livraison,
--      pour que la boutique cesse d'avoir un numéro de téléphone codé en dur.
--
-- Additif : la v1 avait 5 champs, la v2 les garde tous. Les templates 1b/1c qui
-- l'appellent encore continuent de fonctionner.

CREATE OR REPLACE FUNCTION public.get_boutique_info(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v     record;
  v_ana record;
BEGIN
  SELECT id, prenom, nom_assistant, activite, zone, nom_boutique, brand_color,
         COALESCE(template_choisi, template_id, '1a') AS layout,
         whatsapp,
         COALESCE(plan_tier, 'gratuit') AS plan_tier
    INTO v
  FROM public.profiles
  WHERE public_slug = p_slug
    AND COALESCE(client_assistant_ready, false) = true
  LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Seuls `paiement` et `livraison` traversent : ce sont les deux réponses que
  -- l'entrepreneur destine à ses clients. Le reste de l'anamnèse (dont
  -- `ce_qui_fatigue`) est privé et ne doit jamais sortir. La RLS de
  -- business_anamnese interdit toute lecture anon : cette fonction SECURITY DEFINER
  -- est la seule porte, et elle ne laisse passer que ces deux champs.
  SELECT paiement, livraison INTO v_ana
  FROM public.business_anamnese
  WHERE user_id = v.id;

  RETURN jsonb_build_object(
    'nom_boutique',  COALESCE(NULLIF(v.nom_boutique, ''), v.prenom, 'Ma Boutique'),
    'tagline',       COALESCE(v.activite, ''),
    'zone',          COALESCE(v.zone, ''),
    'nom_assistant', COALESCE(NULLIF(v.nom_assistant, ''), 'Assists'),
    'brand_color',   COALESCE(NULLIF(v.brand_color, ''), '#FF6B35'),
    'layout',        v.layout,
    'whatsapp',      regexp_replace(COALESCE(v.whatsapp, ''), '\D', '', 'g'),
    'paiement',      COALESCE(v_ana.paiement, ''),
    'livraison',     COALESCE(v_ana.livraison, ''),
    'fidelys_actif', (v.plan_tier <> 'gratuit')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_boutique_info(text) TO anon;

-- Historique de conversation d'un client qui revient sur la boutique.
-- Reprend le contrôle de `public-assistant` : la conversation doit appartenir au
-- propriétaire de CE slug et être publique.
CREATE OR REPLACE FUNCTION public.get_public_conversation(p_slug text, p_conversation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_owner_id uuid;
  v_history  jsonb;
BEGIN
  SELECT id INTO v_owner_id
  FROM public.profiles
  WHERE public_slug = p_slug
    AND COALESCE(client_assistant_ready, false) = true
  LIMIT 1;

  IF v_owner_id IS NULL THEN RETURN '[]'::jsonb; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
      AND user_id = v_owner_id
      AND is_public = true
  ) THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(jsonb_agg(
           jsonb_build_object(
             'from', CASE WHEN m.role = 'user' THEN 'me' ELSE 'bot' END,
             'text', m.contenu
           ) ORDER BY m.created_at
         ), '[]'::jsonb)
    INTO v_history
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id;

  RETURN v_history;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_conversation(text, uuid) TO anon;
