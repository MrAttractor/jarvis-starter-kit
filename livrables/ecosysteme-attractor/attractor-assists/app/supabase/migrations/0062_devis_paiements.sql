-- ============================================================
-- Vente de sites — registre des paiements XPaye rattachés à un devis
-- accepté (devis_web). Un devis peut donner lieu à plusieurs paiements :
-- acompte puis solde. Chaque tentative = une ligne, tracée par sa
-- référence XPaye (matchée par le webhook payment-webhook).
--
-- Sécurité : RLS activée SANS policy publique. Tout passe par les
-- edge functions (devis-payer, payment-webhook) en service role.
-- Aucune donnée financière lisible avec la clé anon.
-- ============================================================

create table if not exists public.devis_paiements (
  id            uuid primary key default gen_random_uuid(),
  devis_id      uuid references public.devis_web(id) on delete set null,
  reference     text not null unique,                 -- référence XPaye (préfixe DEVIS-)
  type          text not null default 'acompte',      -- acompte | total | solde
  montant       numeric not null,                     -- montant de CETTE tentative (FCFA)
  devise        text not null default 'XOF',
  channel       text,                                 -- WAVECI | MOMOCI | OMCIV2 | CARD
  statut        text not null default 'pending',      -- pending | success | failed
  payer_nom     text,
  payer_contact text,
  payer_email   text,
  created_at    timestamptz not null default now(),
  paye_at       timestamptz
);

create index if not exists devis_paiements_devis_idx on public.devis_paiements(devis_id);
create index if not exists devis_paiements_ref_idx   on public.devis_paiements(reference);
create index if not exists devis_paiements_statut_idx on public.devis_paiements(statut);

alter table public.devis_paiements enable row level security;

-- Colonnes de synthèse sur le devis, pour lire l'état sans recalculer, et
-- surtout pour piloter les relances de solde (un devis avec acompte payé et
-- solde dû est un candidat à la relance automatique).
alter table public.devis_web add column if not exists paiement_statut text not null default 'aucun';
  -- aucun | acompte_paye | paye_total
alter table public.devis_web add column if not exists montant_paye   numeric not null default 0;
alter table public.devis_web add column if not exists solde_du       numeric not null default 0;
alter table public.devis_web add column if not exists relance_solde_at timestamptz;  -- dernière relance envoyée
