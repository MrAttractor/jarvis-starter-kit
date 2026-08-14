-- ============================================================
-- Club Privé Élévia — limitation des envois de code
--
-- Recette de la Cliente du 08/08/2026, point 14 « Limitation OTP ».
--
-- Ce qui existait déjà : le nombre de tentatives de SAISIE d'un code est
-- plafonné à 5 (el_codes.tentatives), et le code expire en 10 minutes.
--
-- Ce qui manquait : rien ne limitait le nombre de DEMANDES de code. L'action
-- « connexion » de la fonction elevia-auth envoie un e-mail à chaque appel, et
-- elle est appelable avec la clé publique. N'importe qui pouvait donc, en
-- boucle, inonder la boîte d'un membre et épuiser le quota d'envoi du service
-- de messagerie, ce qui aurait bloqué les connexions de tous les autres.
--
-- Le comptage se fait dans une table à part, et non sur el_codes, pour une
-- raison de confidentialité : un code n'est créé que si le compte existe.
-- Compter les codes aurait donc fait répondre « trop de demandes » aux seules
-- adresses réellement inscrites, et cette différence de réponse révélait qui
-- est membre du Club. Ici, toute demande est comptée, membre ou non, et la
-- réponse reste identique dans les deux cas.
-- ============================================================

create table if not exists public.el_envois (
  id          uuid primary key default gen_random_uuid(),
  email_norm  text not null,
  created_at  timestamptz not null default now()
);

create index if not exists el_envois_idx
  on public.el_envois(email_norm, created_at desc);

-- RLS active et aucune policy : la table est illisible et non modifiable avec
-- la clé publique. Seule la fonction, en service role, y accède.
alter table public.el_envois enable row level security;

comment on table public.el_envois is
  'Journal des demandes de code de connexion, y compris pour des adresses non inscrites. Sert au plafonnement des envois. Purgé au bout de 30 jours.';

-- ── Purge ─────────────────────────────────────────────────
-- Ce journal n'a aucune valeur au-delà de la fenêtre de plafonnement. On le
-- garde 30 jours pour pouvoir constater un abus, pas davantage : conserver
-- indéfiniment la liste des adresses ayant tenté de se connecter reviendrait à
-- constituer un fichier dont personne n'a besoin.
create or replace function public.el_purger_envois()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from public.el_envois where created_at < (now() - interval '30 days');
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Postgres accorde l'exécution à public à la création : on retire d'abord,
-- on n'accorde à personne ensuite. Cette fonction n'est appelée que par une
-- tâche planifiée ou en service role.
revoke all on function public.el_purger_envois() from public, anon, authenticated;

comment on function public.el_purger_envois() is
  'Efface les demandes de code de plus de 30 jours. À planifier une fois par jour.';
