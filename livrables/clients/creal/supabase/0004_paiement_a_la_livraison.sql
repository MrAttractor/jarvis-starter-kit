-- C'Real — le paiement à la livraison
-- Écrit le 10/08/2026, après un retour de Marie Kezey.
--
-- POURQUOI. L'option avait été promise mais n'a jamais existé dans le code :
-- vérifié, elle était absente avant comme après la sortie d'Attractor Assists.
-- Ce n'est donc pas une régression, c'est un oubli de départ.
--
-- LE PIÈGE À ÉVITER, et c'est le vrai sujet de cette migration.
-- Wave et Orange Money sont encaissés AVANT la préparation. Le paiement à la
-- livraison, non. Ces commandes se ressemblent en base et ne se traitent pas du
-- tout pareil : l'une est réglée, l'autre est une créance. Si le tableau de bord
-- les affiche de la même façon, Kezey prépare et livre une commande en croyant
-- qu'elle est payée. La colonne `encaisse` existe pour que cette différence soit
-- portée par la donnée, et pas par la mémoire de Kezey.

begin;

-- ── La commande porte elle-même son état d'encaissement ────────────────────
-- Wave et OM : true à la création, l'argent est arrivé avant.
-- Livraison   : false, et Kezey le bascule à la main quand elle a reçu l'argent.
alter table public.cr_commandes
  add column if not exists encaisse boolean not null default true;

-- Les commandes déjà en base sont toutes des paiements avant livraison.
update public.cr_commandes set encaisse = true where moyen in ('wave','om');

-- Trois moyens, pas plus. Une valeur libre finirait par contenir une faute de
-- frappe que plus aucun affichage ne saurait traduire.
alter table public.cr_commandes drop constraint if exists cr_commandes_moyen_check;
alter table public.cr_commandes
  add constraint cr_commandes_moyen_check
  check (moyen is null or moyen in ('wave','om','livraison'));

comment on column public.cr_commandes.moyen is
  'wave | om | livraison. Les deux premiers sont encaissés avant préparation.';
comment on column public.cr_commandes.encaisse is
  'Faux tant que l''argent n''est pas reçu. Toujours vrai pour wave et om.';

-- ── Kezey décide si elle propose cette option ──────────────────────────────
-- Elle en a la main, comme pour ses prix : un impayé, une zone difficile, une
-- période chargée, et elle coupe l'option sans demander à personne.
alter table public.cr_config
  add column if not exists paiement_livraison boolean not null default true;

comment on column public.cr_config.paiement_livraison is
  'Affiche ou masque le bouton « Payer à la livraison » sur la boutique.';

commit;
