-- C'Real — un numéro lisible sur chaque commande
-- Écrit le 10/08/2026, demande de Marie Kezey.
--
-- POURQUOI. Le message WhatsApp et le tableau de bord ne se parlaient pas.
-- Kezey lit une commande sur son téléphone, puis doit la retrouver dans son
-- tableau de bord parmi d'autres du même jour, au nom près. Un numéro cité des
-- deux côtés fait le lien en une seconde.
--
-- POURQUOI PAS L'IDENTIFIANT EXISTANT. Chaque commande a déjà un `id`, mais
-- c'est un UUID de 36 caractères : illisible dans un message, impossible à dire
-- au téléphone, impossible à recopier sans se tromper. Un numéro se lit à voix
-- haute, c'est tout ce qu'on lui demande.
--
-- SUR LE MOT « FACTURE ». C'est le terme employé par Kezey, on garde le sien
-- (R-38). Techniquement c'est un numéro de commande, attribué à la prise de
-- commande et non à l'encaissement. Il reste attribué même si la commande est
-- annulée, ce qui est le bon comportement : un numéro réutilisé désigne deux
-- choses différentes, et c'est ainsi qu'une comptabilité devient fausse.

begin;

-- La séquence donne le numéro suivant, sans collision possible même si deux
-- clientes commandent à la même seconde.
create sequence if not exists public.cr_commandes_numero_seq as integer start with 1;

alter table public.cr_commandes
  add column if not exists numero integer;

alter table public.cr_commandes
  alter column numero set default nextval('public.cr_commandes_numero_seq');

-- Les commandes déjà en base reçoivent un numéro dans leur ordre d'arrivée.
-- (Aucune au 10/08/2026, mais la migration doit rester rejouable ailleurs.)
update public.cr_commandes c
set    numero = n.rang
from ( select id, row_number() over (order by created_at) as rang
       from public.cr_commandes where numero is null ) n
where c.id = n.id and c.numero is null;

-- La séquence repart après le plus grand numéro déjà attribué.
select setval('public.cr_commandes_numero_seq',
              coalesce((select max(numero) from public.cr_commandes), 0) + 1,
              false);

alter table public.cr_commandes alter column numero set not null;

-- Deux commandes ne peuvent pas porter le même numéro. Sans cette contrainte,
-- rien n'empêcherait une écriture manuelle de créer un doublon, et le numéro
-- ne servirait plus à retrouver quoi que ce soit.
create unique index if not exists cr_commandes_numero_unique
  on public.cr_commandes (numero);

comment on column public.cr_commandes.numero is
  'Numéro lisible, cité dans le message WhatsApp sous la forme CR-0001. Jamais réutilisé.';

commit;
