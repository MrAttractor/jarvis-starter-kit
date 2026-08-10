-- C'Real — le reçu de paiement
-- Écrit le 10/08/2026, sur le modèle de J'Envoie Express.
--
-- POURQUOI UN JETON, ET PAS SEULEMENT LE NUMÉRO.
-- Le reçu s'ouvre par un lien. Si ce lien ne contenait que le numéro, il
-- suffirait d'essayer CR-0001, CR-0002, CR-0003 pour lire le nom, le téléphone
-- et l'adresse de toutes les clientes de Kezey, une par une. Un numéro qui
-- s'incrémente est une invitation à énumérer.
--
-- Le jeton casse ça : 16 caractères tirés au hasard, impossibles à deviner,
-- et propres à chaque commande. Le lien reste partageable par la cliente à qui
-- il appartient, et par elle seule.
--
-- Ce n'est pas de la précaution excessive : le reçu contient un nom, un numéro
-- de téléphone et une adresse de livraison. C'est exactement ce qu'on ne laisse
-- pas énumérer.

begin;

alter table public.cr_commandes
  add column if not exists jeton text;

-- gen_random_uuid() est déjà disponible (utilisé par les clés primaires).
-- On en garde 16 caractères : assez pour être introuvable au hasard, assez
-- court pour tenir dans un lien lisible.
update public.cr_commandes
set    jeton = replace(gen_random_uuid()::text, '-', '')
where  jeton is null;

alter table public.cr_commandes
  alter column jeton set default replace(gen_random_uuid()::text, '-', '');

alter table public.cr_commandes
  alter column jeton set not null;

comment on column public.cr_commandes.jeton is
  'Secret du lien de reçu. Sans lui, les numéros séquentiels seraient énumérables.';

commit;
