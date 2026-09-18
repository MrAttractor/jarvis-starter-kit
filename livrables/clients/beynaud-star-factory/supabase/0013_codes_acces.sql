-- ════════════════════════════════════════════════════════════════════════
-- 0013 — Des codes d'accès, pour vendre sans dépendre d'un prestataire
--
-- POURQUOI CETTE FORME
--
-- La migration 0012 a créé le billet. Restait à savoir comment un fan l'obtient.
-- Le branchement XPaye est mis en veille le 18/09 par Mac Arthur, et de toute
-- façon aucune documentation de leur API n'existe dans le dossier : inventer
-- leurs endpoints aurait produit du code qui a l'air fini et qui échoue le soir
-- du concert, devant des gens qui ont payé.
--
-- Le code d'accès ne dépend d'aucun prestataire. Serge génère un lot, le fan
-- paie par le moyen qu'il veut, Wave, Orange Money, MTN ou en main propre, il
-- reçoit un code, il le saisit, il a son billet. Ça marche aussi avec l'espèce,
-- ce qui compte sur cette audience, et ça permet de vendre À L'AVANCE, ce que
-- le calendrier prévoit déjà, vente ouverte le 7 novembre.
--
-- Le jour où XPaye est documenté, il vient EN PLUS : le paiement délivrera un
-- code, ou écrira directement le billet. Rien de ce qui suit n'est à jeter.
--
-- USAGE UNIQUE, et c'est un choix. Un code réutilisable circule sur WhatsApp en
-- dix minutes et le contenu devient gratuit. On garde aussi QUI a utilisé quel
-- code : sans ça, un litige ne se tranche pas.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.bey_codes (
  id          uuid primary key default gen_random_uuid(),
  -- Le code lui-même, en majuscules, unique sur toute la plateforme.
  code        text not null unique,
  contenu_id  uuid not null references public.bey_contenus(id) on delete cascade,
  -- Le lot sert à s'y retrouver : « vente du 7 novembre », « invités presse ».
  lot         text,
  -- Nul tant que personne ne l'a utilisé. C'est CE champ qui fait l'usage
  -- unique, et c'est la base qui l'arbitre, pas le code applicatif.
  membre_id   uuid references public.bey_membres(id) on delete set null,
  utilise_le  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists bey_codes_contenu on public.bey_codes (contenu_id);
create index if not exists bey_codes_libres  on public.bey_codes (contenu_id) where membre_id is null;

alter table public.bey_codes enable row level security;
-- Aucune policy. Une table de codes lisible depuis le navigateur, ce serait
-- publier la liste des billets gratuits.

-- ── Fabriquer un lot ──
-- Alphabet volontairement amputé : ni O ni 0, ni I ni 1, ni L. Un code se dicte
-- au téléphone et se recopie à la main, donc tout caractère ambigu finit en
-- litige. Format ABCD-EFGH, lisible et court.
create or replace function public.bey_generer_codes(p_contenu uuid, p_combien int, p_lot text default null)
returns table (code text)
language plpgsql volatile security definer set search_path = public as $$
declare
  v_alpha text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code  text;
  i int := 0;
  essais int;
begin
  if p_combien is null or p_combien < 1 or p_combien > 5000 then
    raise exception 'nombre de codes hors limites (1 a 5000)';
  end if;
  if not exists (select 1 from public.bey_contenus c where c.id = p_contenu) then
    raise exception 'contenu introuvable';
  end if;

  while i < p_combien loop
    essais := 0;
    loop
      v_code := '';
      for k in 1..8 loop
        v_code := v_code || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
        if k = 4 then v_code := v_code || '-'; end if;
      end loop;
      -- La collision est improbable mais pas impossible : on retente au lieu
      -- de laisser l'unicite lever une erreur au milieu d'un lot de 500.
      exit when not exists (select 1 from public.bey_codes b where b.code = v_code);
      essais := essais + 1;
      if essais > 20 then raise exception 'impossible de generer un code unique'; end if;
    end loop;
    insert into public.bey_codes (code, contenu_id, lot) values (v_code, p_contenu, p_lot);
    i := i + 1;
    return query select v_code;
  end loop;
end $$;

revoke all on function public.bey_generer_codes(uuid, int, text) from public, anon, authenticated;

-- ── Utiliser un code ──
-- Le cœur du mécanisme, et le seul endroit où la concurrence compte. La prise
-- du code est un UPDATE conditionnel : `where membre_id is null`. Deux personnes
-- qui saisissent le même code au même instant, une seule le prend, l'autre est
-- refusée proprement. Ce n'est pas le code applicatif qui arbitre, c'est la base.
create or replace function public.bey_utiliser_code(p_code text, p_membre uuid)
returns table (etat text, contenu_id uuid)
language plpgsql volatile security definer set search_path = public as $$
declare
  v_norm text;
  v_row  public.bey_codes%rowtype;
begin
  -- On pardonne la casse, les espaces et le tiret oublié : le fan recopie à la
  -- main un code qu'on lui a dicté ou envoyé par WhatsApp.
  v_norm := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_norm) <> 8 then
    return query select 'inconnu'::text, null::uuid;
    return;
  end if;
  v_norm := substr(v_norm, 1, 4) || '-' || substr(v_norm, 5, 4);

  select * into v_row from public.bey_codes b where b.code = v_norm;
  if not found then
    return query select 'inconnu'::text, null::uuid;
    return;
  end if;

  -- Deja utilise PAR CE MEMBRE : on ne le punit pas d'avoir appuye deux fois,
  -- on lui redonne son acces. Un double clic n'est pas une fraude.
  if v_row.membre_id = p_membre then
    return query select 'a_toi'::text, v_row.contenu_id;
    return;
  end if;

  if v_row.membre_id is not null then
    return query select 'deja_utilise'::text, v_row.contenu_id;
    return;
  end if;

  update public.bey_codes
     set membre_id = p_membre, utilise_le = now()
   where id = v_row.id and membre_id is null;

  if not found then
    -- Quelqu'un l'a pris entre la lecture et l'ecriture. C'est exactement le
    -- cas que la condition `membre_id is null` existe pour attraper.
    return query select 'deja_utilise'::text, v_row.contenu_id;
    return;
  end if;

  perform public.bey_donner_billet(p_membre, v_row.contenu_id, 'achat', 'CODE ' || v_norm, null);
  return query select 'ok'::text, v_row.contenu_id;
end $$;

revoke all on function public.bey_utiliser_code(text, uuid) from public, anon, authenticated;

-- ── Ce que Serge doit voir : combien il en reste ──
create or replace function public.bey_etat_codes(p_contenu uuid)
returns table (lot text, total bigint, utilises bigint, restants bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(b.lot, 'sans lot') as lot,
         count(*) as total,
         count(b.membre_id) as utilises,
         count(*) - count(b.membre_id) as restants
    from public.bey_codes b
   where b.contenu_id = p_contenu
   group by coalesce(b.lot, 'sans lot')
   order by 1;
$$;

revoke all on function public.bey_etat_codes(uuid) from public, anon, authenticated;

select 'migration 0013 appliquee' as resultat;
