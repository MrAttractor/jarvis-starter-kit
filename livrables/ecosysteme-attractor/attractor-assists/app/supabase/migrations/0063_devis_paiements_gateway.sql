-- Capture de la réponse brute de la passerelle XPaye sur chaque paiement de
-- devis, pour audit et débogage (ex. lire le format exact du callback quand
-- un paiement est mal interprété). Appliqué le 25/07/2026.

alter table public.devis_paiements add column if not exists gateway_response jsonb;
alter table public.devis_paiements add column if not exists callback_at       timestamptz;
