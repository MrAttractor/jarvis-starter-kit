-- latiss.net — DIAGNOSTIC des comptes en double, 19/09/2026
--
-- CE FICHIER NE MODIFIE RIEN. Il regarde, il compte, il n'efface pas une
-- ligne. La fusion viendra dans 0015, et elle dependra de ce qu'on lit ici.
--
-- POURQUOI ON REGARDE AVANT D'AGIR. Le 14/09, la migration 0010 a appris
-- une chose a nos depens : `parraine_par` stocke le CODE ambassadeur en
-- TEXTE, et aucune cle etrangere ne le protege. Supprimer un membre ne
-- nettoie donc pas ses filleuls et ne leve aucune erreur : la reference
-- reste, pointant dans le vide. Le compte le plus recent n'est presque
-- jamais celui qu'il faut garder, parce que les parrainages sont souvent
-- sur un compte plus ancien. Garder « le dernier » par reflexe efface des
-- parrainages en silence.
--
-- A LIRE DANS L'ORDRE. Chaque requete repond a une question precise.

-- ── 1. Les comptes qui portent le meme prenom ─────────────────────────
-- C'est le symptome visible : « il y a deux fois Mr Attractor ».
select
  lower(trim(prenom))                    as prenom_replie,
  count(*)                               as combien,
  array_agg(id order by created_at)      as identifiants,
  array_agg(code_ambassadeur order by created_at) as codes,
  array_agg(created_at::date order by created_at) as crees_le,
  array_agg(coalesce(whatsapp,'(sans numero)') order by created_at) as numeros,
  array_agg(coalesce(lieu,'(sans lieu)') order by created_at)       as lieux
from public.bey_membres
group by 1
having count(*) > 1
order by combien desc, prenom_replie;

-- ── 2. Ce que chaque compte porte vraiment ────────────────────────────
-- C'est CETTE requete qui decide lequel on garde : celui qui porte des
-- filleuls, des votes ou des commentaires, pas le plus recent.
select
  m.id, m.prenom, m.code_ambassadeur, m.grade,
  m.created_at::date                                   as cree_le,
  coalesce(m.whatsapp,'(sans numero)')                 as numero,
  coalesce(m.lieu,'(sans lieu)')                       as lieu,
  m.filleuls                                           as filleuls_compteur,
  (select count(*) from public.bey_membres f
     where f.parraine_par = m.code_ambassadeur)        as filleuls_reels,
  (select count(*) from public.bey_reactions r    where r.membre_id = m.id) as coeurs,
  (select count(*) from public.bey_commentaires c where c.membre_id = m.id) as commentaires,
  (select count(*) from public.bey_votes v        where v.membre_id = m.id) as votes,
  (select count(*) from public.bey_push p         where p.membre_id = m.id) as appareils_notifies
from public.bey_membres m
where lower(trim(m.prenom)) in (
  select lower(trim(prenom)) from public.bey_membres
  group by 1 having count(*) > 1
)
order by lower(trim(m.prenom)), m.created_at;

-- ── 3. Les filleuls orphelins ─────────────────────────────────────────
-- Un membre dit « j'ai ete parraine par ce code » et ce code n'existe plus
-- nulle part. Deja constate le 14/09 avec MACOCO0UQ. Chaque ligne ici est
-- un parrainage perdu, invisible dans le classement.
select
  m.id, m.prenom, m.parraine_par as code_du_parrain_introuvable, m.created_at::date
from public.bey_membres m
where m.parraine_par is not null
  and not exists (
    select 1 from public.bey_membres p where p.code_ambassadeur = m.parraine_par
  )
order by m.created_at;

-- ── 4. L'etat general, pour comparer apres la fusion ──────────────────
select
  (select count(*) from public.bey_membres)                             as membres,
  (select count(*) from public.bey_membres where whatsapp is not null)  as avec_numero,
  (select count(*) from public.bey_membres where lieu is not null)      as avec_lieu,
  (select count(*) from public.bey_reactions)                           as coeurs,
  (select count(*) from public.bey_commentaires)                        as commentaires,
  (select count(*) from public.bey_votes)                               as votes;
