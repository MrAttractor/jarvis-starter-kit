-- ════════════════════════════════════════════════════════════════════════
-- 0012 — Un droit d'accès qui s'achète, séparé du grade qui se gagne
--
-- LE DÉFAUT (D-15), TROUVÉ PAR LE CONTRE-AUDIT DU 18/09/2026
--
-- La plateforme n'avait que deux niveaux, `membre` et `ambassadeur`, et le
-- second s'obtient GRATUITEMENT en cinq parrainages, sans cadence ni captcha
-- (D-06, toujours ouverte). Vendre le direct du 5 décembre en le réservant aux
-- Ambassadeurs revenait donc à vendre une porte dont la clé est gratuite.
--
-- Pire : `launchLive` écrit `grade_requis:'membre'` en dur, donc un direct ne
-- pouvait littéralement pas être réservé.
--
-- LA FORME RETENUE
--
-- Un grade se GAGNE, un billet s'ACHÈTE. Ce sont deux choses différentes et
-- elles cessent d'être portées par la même colonne. Le billet est nominatif,
-- rattaché à un contenu précis, et il ne s'obtient par aucun parrainage.
--
-- Ce que cette migration ne fait PAS, et qu'il ne faut pas croire faite :
-- l'encaissement. Aucun paiement n'est branché ici. Un billet s'écrit soit par
-- la fonction serveur après un paiement confirmé, soit à la main pour offrir un
-- accès. Le lien avec XPaye reste à construire.
-- ════════════════════════════════════════════════════════════════════════

-- ── Le contenu peut désormais exiger un billet ──
-- Par défaut à `false` : tout ce qui existe reste exactement aussi accessible
-- qu'avant. Une migration qui verrouille du contenu déjà publié serait une
-- panne, pas une correction.
alter table public.bey_contenus
  add column if not exists billet_requis boolean not null default false;

-- ── Le billet ──
create table if not exists public.bey_billets (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid not null references public.bey_membres(id) on delete cascade,
  contenu_id  uuid not null references public.bey_contenus(id) on delete cascade,
  -- `achat` quand c'est payé, `offert` quand l'artiste ou l'agence donne
  -- l'accès. On garde la distinction : offrir 500 accès et en vendre 500 ne se
  -- lisent pas pareil dans un bilan.
  source      text not null default 'achat' check (source in ('achat','offert')),
  -- La référence du paiement, pour rapprocher un billet d'un encaissement le
  -- jour où il y a un litige. Nulle pour un accès offert.
  reference   text,
  montant     integer,
  devise      text default 'XOF',
  created_at  timestamptz not null default now(),
  -- Un membre ne peut pas détenir deux fois le même billet. C'est la base qui
  -- le garantit, pas le code : un double clic sur « payer » ne doit pas créer
  -- deux lignes, et un rejeu de webhook non plus.
  unique (membre_id, contenu_id)
);

create index if not exists bey_billets_membre  on public.bey_billets (membre_id);
create index if not exists bey_billets_contenu on public.bey_billets (contenu_id);

alter table public.bey_billets enable row level security;
-- Aucune policy : personne n'atteint cette table depuis le navigateur. Les
-- billets se lisent et s'écrivent uniquement par les fonctions serveur, avec la
-- clé de service. Une table de droits d'accès lisible par le public serait la
-- même faute que celle qu'on vient de corriger.

-- ── La question qu'on posera à chaque affichage ──
create or replace function public.bey_billets_du_membre(p_membre uuid)
returns table (contenu_id uuid)
language sql stable security definer set search_path = public as $$
  select b.contenu_id from public.bey_billets b where b.membre_id = p_membre;
$$;

revoke all on function public.bey_billets_du_membre(uuid) from public, anon, authenticated;

-- ── Donner un accès, sans passer par le dashboard ──
-- Sert à offrir un billet, et servira au raccordement du paiement. Écrit en
-- « ne fait rien si déjà là » : un rejeu ne doit jamais dupliquer un droit.
create or replace function public.bey_donner_billet(
  p_membre uuid, p_contenu uuid, p_source text default 'offert',
  p_reference text default null, p_montant integer default null)
returns table (id uuid, deja boolean)
language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid; v_deja boolean := false;
begin
  select b.id into v_id from public.bey_billets b
   where b.membre_id = p_membre and b.contenu_id = p_contenu;
  if found then
    -- `return query` AJOUTE des lignes et NE SORT PAS de la fonction : sans le
    -- `return` qui suit, l'execution continuait jusqu'a l'insertion et le rejeu
    -- tombait sur la cle unique. Defaut trouve par le test de rejeu le 18/09,
    -- c'est-a-dire par le controle meme que cette fonction est censee passer.
    return query select v_id, true;
    return;
  end if;
  insert into public.bey_billets (membre_id, contenu_id, source, reference, montant)
  values (p_membre, p_contenu,
          case when p_source in ('achat','offert') then p_source else 'offert' end,
          p_reference, p_montant)
  returning bey_billets.id into v_id;
  return query select v_id, v_deja;
end $$;

revoke all on function public.bey_donner_billet(uuid, uuid, text, text, integer) from public, anon, authenticated;

select 'migration 0012 appliquee' as resultat;
