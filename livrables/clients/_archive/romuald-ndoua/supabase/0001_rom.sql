-- ============================================================
-- Romuald Ndoua — Comptes agence Meta
-- Backend de l'assistant IA (edge function romuald-chat)
-- Projet Supabase partagé lgdgbrivnhgeupqhkckd, tables préfixées rom_
-- ============================================================

-- ── Prospects captés par l'assistant ─────────────────────────
-- statut pilote le tri en sortie de conversation :
--   'nouveau'  : capté, pas encore qualifié en chaud/tiède
--   'a_suivre' : intéressé mais ne paie pas maintenant -> fichier de relance
--   'chaud'    : prêt à payer, basculé vers Romuald sur WhatsApp pour finaliser
--   'client'   : a payé et envoyé son reçu (Romuald le passe à ce statut à la main)
create table if not exists public.rom_leads (
  id          uuid primary key default gen_random_uuid(),
  prenom      text,
  whatsapp    text not null,
  activite    text,
  situation   text,
  statut      text not null default 'nouveau',
  traite      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.rom_leads enable row level security;
-- Aucune policy anonyme : la table n'est jamais lue ni écrite depuis le
-- navigateur. Seule l'edge function (service_role) y écrit. Romuald la lira
-- via son admin une fois son compte créé (policy nominative à ajouter alors).

-- ── Base de connaissance enrichissable (l'apprentissage continu piloté) ──
-- Romuald / Mac Arthur ajoutent ici les réponses validées au fil des vraies
-- conversations. L'edge function les injecte dans le prompt système comme
-- « les mots de Romuald ». C'est ça, l'enrichissement en continu.
create table if not exists public.rom_connaissance (
  id          uuid primary key default gen_random_uuid(),
  sujet       text not null,          -- ex : "Objection : c'est légal ?"
  reponse     text not null,          -- la réponse validée, dans le ton de Romuald
  priorite    int  not null default 0,
  actif       boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.rom_connaissance enable row level security;
-- Idem : lue uniquement par l'edge function (service_role). Pas d'accès public.

-- ── Quand Romuald aura son compte auth, ajouter (en remplaçant l'UID) : ──
-- create policy "rom admin leads" on public.rom_leads
--   for all using (auth.uid() = 'UID_DE_ROMUALD') with check (auth.uid() = 'UID_DE_ROMUALD');
-- create policy "rom admin savoir" on public.rom_connaissance
--   for all using (auth.uid() = 'UID_DE_ROMUALD') with check (auth.uid() = 'UID_DE_ROMUALD');

-- ── Amorce de connaissance (facultatif, éditable par Romuald ensuite) ──
insert into public.rom_connaissance (sujet, reponse, priorite) values
('Objection : est-ce que c''est légal ?',
 'Oui, à 100%. L''accès partagé entre Business Managers est une fonctionnalité native de Meta, c''est le modèle officiel de toutes les agences. Romuald est représentant officiel Meta.', 10),
('Objection : et si le compte est banni ?',
 'Si un incident arrive sur le compte, Romuald le remplace immédiatement, sans frais en plus. C''est inclus dans la location.', 9),
('Prix',
 'Mise en place unique 25 000 FCFA, puis 14 900 FCFA par mois de location. Une offre d''appel pour l''Afrique : en Europe le même service coûte 350 à 700 euros par mois.', 8),
('Délai de mise à disposition',
 'Le compte est mis à disposition rapidement une fois l''inscription faite. Romuald confirme le délai exact sur WhatsApp.', 5);
