-- ════════════════════════════════════════════════════════════════════════
-- 0012 — Module 3, les quatre manques du cahier des charges
--
-- CE QUI MANQUAIT, ET OÙ LE CDC LE DIT
--
--   1. « l'autre peut l'accepter, la refuser, LA BLOQUER OU LA SIGNALER »
--      el_repondre_relation ne connaissait que 'acceptee' et 'refusee'.
--   2. « UN PREMIER MESSAGE peut être échangé uniquement après acceptation
--      mutuelle, jamais avant »
--      Le code renvoyait la conversation au Module 4. Le CDC la place ici,
--      et réserve au Module 4 le vocal, la photo et l'historique consultable.
--   3. « L'ÉCRAN DE CONNEXION ÉTABLIE s'affiche aux deux membres »
--      Rien ne gardait la trace de qui l'avait déjà vu, donc il était
--      impossible de l'afficher une fois à chacun.
--   4. « grille de profils FILTRABLE (zone géographique, vérifié) »
--      el_decouverte ne prenait aucun filtre.
--
-- CE QUI N'EST PAS TRAITÉ ICI, ET POURQUOI
--
-- Le comportement affiché à l'expéditeur d'une demande déclinée reste en
-- l'état. Le CDC en fait explicitement « un choix produit à trancher avec la
-- Cliente », son défaut de secteur étant la disparition silencieuse. Le
-- changer sans elle serait trancher à sa place.
-- ════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════
-- 1 · LE BLOCAGE
--
-- Le blocage n'est pas un refus plus sec : un refus laisse la porte fermée,
-- un blocage la condamne. Les deux s'écrivent sur la MÊME ligne de paire,
-- donc l'index unique déjà posé en 0011 garantit tout seul ce que demande le
-- CDC, « aucune future mise en relation possible entre les deux comptes,
-- dans les deux sens ». Aucune table de blocage séparée n'est nécessaire, et
-- une seconde table aurait ouvert la possibilité qu'elles se contredisent.
-- ════════════════════════════════════════════════════════════════════════

alter table public.el_relations drop constraint if exists el_relations_statut_check;
alter table public.el_relations
  add constraint el_relations_statut_check
  check (statut in ('demandee','acceptee','refusee','retiree','bloquee'));

-- Qui a bloqué. Sans cette colonne, la ligne dit que la paire est morte mais
-- pas de quel côté, et un back-office de modération ne peut rien en faire.
alter table public.el_relations add column if not exists bloquee_par uuid
  references public.el_membres(id) on delete set null;

comment on column public.el_relations.bloquee_par is
  'Auteur du blocage. Une paire bloquée ne peut plus jamais redonner lieu à '
  'une demande, dans aucun des deux sens (index el_relations_paire_unique).';

-- ════════════════════════════════════════════════════════════════════════
-- 2 · LE SIGNALEMENT
--
-- Le CDC : « retrait immédiat de la visibilité du profil signalé le temps de
-- l'examen par le back-office (traité au Module 4) ». Deux choses distinctes
-- donc, et c'est la première seule qui est du Module 3 : on enregistre, on
-- masque, on ne juge pas.
--
-- CE QU'IL FAUT SAVOIR AVANT D'OUVRIR LE CLUB : un signalement ouvert retire
-- le profil de la découverte de TOUT LE MONDE, pas seulement de celle du
-- signaleur. C'est ce que demande le CDC, et c'est abusable : une personne
-- mal intentionnée retire n'importe quel membre en un geste. La parade n'est
-- pas technique, elle est humaine, c'est le délai de traitement côté équipe.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.el_signalements (
  id           uuid primary key default gen_random_uuid(),
  signaleur_id uuid not null references public.el_membres(id) on delete cascade,
  signale_id   uuid not null references public.el_membres(id) on delete cascade,
  motif        text check (motif is null or length(motif) <= 1000),
  statut       text not null default 'ouvert'
                 check (statut in ('ouvert','fonde','non_fonde')),
  -- Le traitement appartient au Module 4. Ces colonnes l'attendent.
  traite_le    timestamptz,
  traite_par   uuid references public.el_membres(id) on delete set null,
  decision     text,
  created_at   timestamptz not null default now(),
  constraint el_signalements_pas_soi check (signaleur_id <> signale_id)
);

-- Un membre ne signale une même personne qu'une fois tant que c'est ouvert :
-- sinon dix clics font dix dossiers pour un seul fait à examiner.
create unique index if not exists el_signalements_ouvert_unique
  on public.el_signalements (signaleur_id, signale_id)
  where statut = 'ouvert';

create index if not exists el_signalements_signale on public.el_signalements (signale_id, statut);
create index if not exists el_signalements_file    on public.el_signalements (statut, created_at);

alter table public.el_signalements enable row level security;
revoke all on public.el_signalements from anon, authenticated;

comment on table public.el_signalements is
  'Signalements de profils. Le Module 3 enregistre et masque, le Module 4 '
  'juge. Un signalement ouvert retire le profil de la découverte de tous.';

-- ── Signaler un profil ──────────────────────────────────────────────────
-- Un signalement emporte toujours un blocage : on ne veut pas se retrouver à
-- proposer de nouveau à quelqu'un la personne qu'il vient de signaler, même
-- si l'équipe conclut que le signalement n'était pas fondé.
create or replace function public.el_signaler(
  p_membre uuid, p_cible uuid, p_motif text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare cible record; deja uuid;
begin
  if p_membre = p_cible then
    return jsonb_build_object('ok', false, 'error', 'Vous ne pouvez pas vous signaler.');
  end if;

  select id into cible from public.el_membres where id = p_cible and statut = 'actif';
  if cible.id is null then
    return jsonb_build_object('ok', false, 'error', 'Ce membre n''existe plus.');
  end if;

  insert into public.el_signalements (signaleur_id, signale_id, motif)
  values (p_membre, p_cible, nullif(btrim(coalesce(p_motif, '')), ''))
  on conflict do nothing;

  -- Le blocage de la paire, qu'une relation existe déjà ou non.
  select id into deja from public.el_relations
   where least(demandeur_id::text, destinataire_id::text) = least(p_membre::text, p_cible::text)
     and greatest(demandeur_id::text, destinataire_id::text) = greatest(p_membre::text, p_cible::text);

  if deja is null then
    insert into public.el_relations (demandeur_id, destinataire_id, statut, bloquee_par, repondu_le)
    values (p_membre, p_cible, 'bloquee', p_membre, now());
  else
    update public.el_relations
       set statut = 'bloquee', bloquee_par = p_membre, repondu_le = now()
     where id = deja;
  end if;

  return jsonb_build_object('ok', true);
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- 3 · LE PREMIER MESSAGE
--
-- Le garde-fou est au serveur et non à l'écran : la fonction refuse d'écrire
-- tant que la relation n'est pas acceptée. Cacher le champ de saisie aurait
-- laissé passer un appel direct (R-80).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.el_messages (
  id          uuid primary key default gen_random_uuid(),
  relation_id uuid not null references public.el_relations(id) on delete cascade,
  auteur_id   uuid not null references public.el_membres(id) on delete cascade,
  -- Texte seul, volontairement. Le vocal, la photo et l'historique
  -- consultable sont le Module 4, le CDC trace la ligne lui-même.
  texte       text not null check (length(btrim(texte)) between 1 and 2000),
  lu_le       timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists el_messages_fil on public.el_messages (relation_id, created_at);

alter table public.el_messages enable row level security;
revoke all on public.el_messages from anon, authenticated;

comment on table public.el_messages is
  'Premier échange texte, ouvert seulement après acceptation mutuelle '
  '(CDC Module 3). Le vocal, la photo et l''historique riche sont Module 4.';

-- ── Envoyer un message ──────────────────────────────────────────────────
create or replace function public.el_envoyer_message(
  p_membre uuid, p_relation uuid, p_texte text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare rel record; propre text;
begin
  propre := btrim(coalesce(p_texte, ''));
  if length(propre) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Votre message est vide.');
  end if;
  if length(propre) > 2000 then
    return jsonb_build_object('ok', false, 'error', 'Votre message dépasse 2000 caractères.');
  end if;

  select * into rel from public.el_relations where id = p_relation;
  if rel.id is null then
    return jsonb_build_object('ok', false, 'error', 'Cette conversation n''existe pas.');
  end if;
  if p_membre <> rel.demandeur_id and p_membre <> rel.destinataire_id then
    return jsonb_build_object('ok', false, 'error', 'Cette conversation n''est pas la vôtre.');
  end if;
  -- Le cœur du critère d'acceptation : jamais avant l'acceptation.
  if rel.statut <> 'acceptee' then
    return jsonb_build_object('ok', false, 'error',
      case rel.statut
        when 'demandee' then 'Vous pourrez écrire dès que votre demande sera acceptée.'
        when 'bloquee'  then 'Cette conversation est fermée.'
        else 'Cette conversation est fermée.'
      end);
  end if;

  insert into public.el_messages (relation_id, auteur_id, texte)
  values (p_relation, p_membre, propre);

  return jsonb_build_object('ok', true);
end $$;

-- ── Lire un fil ─────────────────────────────────────────────────────────
create or replace function public.el_fil(p_membre uuid, p_relation uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rel record; autre record; lignes jsonb;
begin
  select * into rel from public.el_relations where id = p_relation;
  if rel.id is null or (p_membre <> rel.demandeur_id and p_membre <> rel.destinataire_id) then
    return jsonb_build_object('ok', false, 'error', 'Cette conversation n''est pas la vôtre.');
  end if;
  if rel.statut <> 'acceptee' then
    return jsonb_build_object('ok', false, 'error', 'Cette conversation est fermée.');
  end if;

  select m.id, m.pseudo into autre from public.el_membres m
   where m.id = case when rel.demandeur_id = p_membre then rel.destinataire_id else rel.demandeur_id end;

  -- Marquer lu ce que l'autre a écrit, avant de rendre le fil.
  update public.el_messages
     set lu_le = now()
   where relation_id = p_relation and auteur_id <> p_membre and lu_le is null;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', x.id, 'texte', x.texte, 'a_moi', x.auteur_id = p_membre, 'quand', x.created_at)
         order by x.created_at), '[]'::jsonb)
    into lignes
    from public.el_messages x where x.relation_id = p_relation;

  return jsonb_build_object('ok', true, 'pseudo', autre.pseudo,
                            'autre_id', autre.id, 'messages', lignes);
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- 4 · L'ÉCRAN DE CONNEXION ÉTABLIE
--
-- Le CDC veut qu'il s'affiche AUX DEUX MEMBRES. Celui qui accepte le voit
-- dans la foulée de son geste, celui qui a demandé ne sait encore rien : il
-- faut donc garder, de chaque côté, si l'annonce a déjà été faite. Deux
-- colonnes plutôt qu'un tableau : on veut savoir quand, pas seulement si.
-- ════════════════════════════════════════════════════════════════════════

alter table public.el_relations add column if not exists vue_demandeur    timestamptz;
alter table public.el_relations add column if not exists vue_destinataire timestamptz;

comment on column public.el_relations.vue_demandeur is
  'Quand l''annonce « connexion établie » a été montrée au demandeur. Nulle '
  'tant qu''elle ne l''a pas été, ce qui est la file d''annonces.';

-- ── Les connexions à annoncer à ce membre ───────────────────────────────
create or replace function public.el_connexions_a_annoncer(p_membre uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', r.id,
           'pseudo', case when r.demandeur_id = p_membre then d.pseudo else g.pseudo end,
           'quand', r.repondu_le)
         order by r.repondu_le), '[]'::jsonb)
    from public.el_relations r
    join public.el_membres g on g.id = r.demandeur_id
    join public.el_membres d on d.id = r.destinataire_id
   where r.statut = 'acceptee'
     and ((r.demandeur_id    = p_membre and r.vue_demandeur    is null)
       or (r.destinataire_id = p_membre and r.vue_destinataire is null));
$$;

-- ── L'annonce a été vue ─────────────────────────────────────────────────
create or replace function public.el_connexion_vue(p_membre uuid, p_relation uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  update public.el_relations
     set vue_demandeur    = case when demandeur_id    = p_membre then coalesce(vue_demandeur, now())    else vue_demandeur    end,
         vue_destinataire = case when destinataire_id = p_membre then coalesce(vue_destinataire, now()) else vue_destinataire end
   where id = p_relation
     and (demandeur_id = p_membre or destinataire_id = p_membre);
  return jsonb_build_object('ok', true);
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- 5 · RÉPONDRE : ACCEPTER, DÉCLINER, BLOQUER
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.el_repondre_relation(
  p_membre uuid, p_relation uuid, p_reponse text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare rel record;
begin
  if p_reponse not in ('acceptee','refusee','bloquee') then
    return jsonb_build_object('ok', false, 'error', 'Réponse inconnue.');
  end if;

  select * into rel from public.el_relations where id = p_relation;
  if rel.id is null then
    return jsonb_build_object('ok', false, 'error', 'Demande introuvable.');
  end if;
  -- Seul le destinataire répond. Le demandeur, lui, peut retirer sa demande.
  if rel.destinataire_id <> p_membre then
    return jsonb_build_object('ok', false, 'error', 'Cette demande ne vous est pas adressée.');
  end if;
  -- Une relation acceptée peut encore être bloquée : c'est même le cas le
  -- plus utile, celui où l'échange tourne mal après coup.
  if rel.statut not in ('demandee','acceptee')
     or (rel.statut = 'acceptee' and p_reponse <> 'bloquee') then
    return jsonb_build_object('ok', false, 'error', 'Cette demande a déjà été tranchée.');
  end if;

  -- L'annonce n'est marquée vue NI ICI NI POUR PERSONNE : le CDC la veut aux
  -- deux membres, et celle qui accepte la découvre dans la foulée de son
  -- geste par la file d'annonces, exactement comme l'autre à sa visite
  -- suivante. La marquer vue en acceptant l'aurait supprimée pour elle.
  update public.el_relations
     set statut      = p_reponse,
         repondu_le  = now(),
         bloquee_par = case when p_reponse = 'bloquee' then p_membre else bloquee_par end
   where id = rel.id;

  return jsonb_build_object('ok', true, 'statut', p_reponse);
end $$;

-- ════════════════════════════════════════════════════════════════════════
-- 6 · LA DÉCOUVERTE : ZONE, ET LES SIGNALÉS RETIRÉS
--
-- La zone se lit sur des données qui existent déjà : la ville est la réponse
-- à la question 1, le pays est déclaré à l'inscription. Aucune saisie neuve
-- n'est demandée au membre pour filtrer.
--
-- Le filtre « vérifié uniquement » du CDC est satisfait par construction
-- depuis 0010 : el_profils_compatibles ne propose que des membres vérifiés.
-- On ne fabrique donc pas une case à cocher qui ne changerait rien, l'écran
-- le dit en toutes lettres et porte le badge sur chaque profil.
-- ════════════════════════════════════════════════════════════════════════

-- Les signalés sortent de la découverte de tout le monde, le temps de l'examen.
create or replace function public.el_profils_compatibles(p_membre uuid, p_limite int default 12)
returns table (
  membre_id uuid, pseudo text, ville jsonb, parcours jsonb,
  trois_mots jsonb, score int, raisons jsonb
)
language sql stable security definer set search_path = public as $$
  with autres as (
    select m.id, m.pseudo
      from public.el_membres m
     where m.id <> p_membre
       and m.statut_verif = 'valide'      -- le Club ne propose que des membres vérifiés
       and m.statut = 'actif'
       and not exists (                   -- retrait immédiat le temps de l'examen
         select 1 from public.el_signalements s
          where s.signale_id = m.id and s.statut = 'ouvert'
       )
  ), notes as (
    select a.id, a.pseudo, public.el_affinite(p_membre, a.id) as a_score
      from autres a
  )
  select n.id, n.pseudo,
         public.el_rep(n.id,'ville'),
         public.el_rep(n.id,'parcours'),
         public.el_rep(n.id,'trois_mots'),
         (n.a_score->>'score')::int,
         n.a_score->'raisons'
    from notes n
   where (n.a_score->>'ecarte')::boolean is false
   order by (n.a_score->>'score')::int desc, n.pseudo
   limit greatest(1, least(p_limite, 50));
$$;

-- L'ancienne signature part AVANT que la nouvelle arrive : deux versions dont
-- l'une a un paramètre par défaut rendraient tout appel à deux arguments
-- ambigu, et la fonction actuellement en ligne appelle à deux arguments.
drop function if exists public.el_decouverte(uuid, int);

create or replace function public.el_decouverte(
  p_membre uuid, p_limite int default 12, p_zone text default 'partout'
) returns jsonb language sql stable security definer set search_path = public as $$
  with moi as (
    select m.pays_code, public.el_rep(p_membre, 'ville') as ville
      from public.el_membres m where m.id = p_membre
  ), retenus as (
    select p.*
      -- On puise plus large quand on filtre : sans cela, restreindre à sa
      -- ville ne ferait que vider une liste déjà coupée aux douze meilleurs,
      -- et le filtre paraîtrait ne rien trouver alors qu'il n'a rien cherché.
      from public.el_profils_compatibles(
             p_membre,
             case when coalesce(p_zone,'partout') = 'partout' then p_limite else 50 end) p
     cross join moi
     where not exists (
       select 1 from public.el_relations r
        where least(r.demandeur_id::text, r.destinataire_id::text) = least(p_membre::text, p.membre_id::text)
          and greatest(r.demandeur_id::text, r.destinataire_id::text) = greatest(p_membre::text, p.membre_id::text)
     )
       and case coalesce(p_zone, 'partout')
             when 'ville' then
               moi.ville is not null and p.ville is not null
               and lower(btrim(moi.ville #>> '{}')) = lower(btrim(p.ville #>> '{}'))
             when 'pays' then
               moi.pays_code is not null
               and moi.pays_code = (select m2.pays_code from public.el_membres m2 where m2.id = p.membre_id)
             else true
           end
     -- Et on recoupe APRÈS le filtre : puiser large sans recouper rendrait
     -- jusqu'à 50 cartes sur « mon pays » là où « partout » en rend 12.
     order by p.score desc
     limit greatest(1, p_limite)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', membre_id, 'pseudo', pseudo,
           'ville', ville, 'parcours', parcours,
           'trois_mots', trois_mots,
           'score', score, 'raisons', raisons)
         order by score desc), '[]'::jsonb)
    from retenus;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 7 · MES RELATIONS, AVEC LE FIL ET LES BLOQUÉES
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.el_mes_relations(p_membre uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'recues', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'membre', r.demandeur_id, 'pseudo', m.pseudo, 'mot', r.mot,
               'quand', r.demandee_le,
               'raisons', public.el_affinite(p_membre, r.demandeur_id)->'raisons')
             order by r.demandee_le desc)
        from public.el_relations r
        join public.el_membres m on m.id = r.demandeur_id
       where r.destinataire_id = p_membre and r.statut = 'demandee'
    ), '[]'::jsonb),
    'envoyees', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'pseudo', m.pseudo, 'statut', r.statut, 'quand', r.demandee_le)
             order by r.demandee_le desc)
        from public.el_relations r
        join public.el_membres m on m.id = r.destinataire_id
       where r.demandeur_id = p_membre and r.statut in ('demandee','refusee')
    ), '[]'::jsonb),
    'acceptees', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id,
               'membre', case when r.demandeur_id = p_membre then r.destinataire_id else r.demandeur_id end,
               'pseudo', case when r.demandeur_id = p_membre then d.pseudo else g.pseudo end,
               'quand', r.repondu_le,
               'messages', (select count(*) from public.el_messages x where x.relation_id = r.id),
               -- Ce qui n'a pas encore été lu, pour que l'écran de profil
               -- puisse le dire sans ouvrir chaque fil.
               'non_lus', (select count(*) from public.el_messages x
                            where x.relation_id = r.id and x.auteur_id <> p_membre and x.lu_le is null))
             order by r.repondu_le desc)
        from public.el_relations r
        join public.el_membres g on g.id = r.demandeur_id
        join public.el_membres d on d.id = r.destinataire_id
       where r.statut = 'acceptee'
         and (r.demandeur_id = p_membre or r.destinataire_id = p_membre)
    ), '[]'::jsonb),
    'annonces', public.el_connexions_a_annoncer(p_membre)
  );
$$;

-- ── Fermeture ───────────────────────────────────────────────────────────
-- Postgres accorde l'exécution à public à la création : sans ce retrait, un
-- grant ciblé ne restreindrait rien (R-68).
revoke all on function public.el_signaler(uuid,uuid,text)                   from public, anon, authenticated;
revoke all on function public.el_envoyer_message(uuid,uuid,text)            from public, anon, authenticated;
revoke all on function public.el_fil(uuid,uuid)                             from public, anon, authenticated;
revoke all on function public.el_connexions_a_annoncer(uuid)                from public, anon, authenticated;
revoke all on function public.el_connexion_vue(uuid,uuid)                   from public, anon, authenticated;
revoke all on function public.el_repondre_relation(uuid,uuid,text)          from public, anon, authenticated;
revoke all on function public.el_profils_compatibles(uuid,int)              from public, anon, authenticated;
revoke all on function public.el_decouverte(uuid,int,text)                  from public, anon, authenticated;
revoke all on function public.el_mes_relations(uuid)                        from public, anon, authenticated;

select 'migration 0012 appliquee' as resultat;
