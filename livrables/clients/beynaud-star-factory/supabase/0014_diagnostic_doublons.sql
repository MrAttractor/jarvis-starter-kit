-- latiss.net — DIAGNOSTIC des comptes en double, 19/09/2026
--
-- CE FICHIER NE MODIFIE RIEN. Pas un delete, pas un update, pas un insert.
-- Il lit et il compte. La fusion viendra dans 0015, et elle dependra de ce
-- qu'on lit ici.
--
-- POURQUOI ON REGARDE AVANT D'AGIR. Le 14/09, la migration 0010 a appris
-- une chose a nos depens : `parraine_par` stocke le CODE ambassadeur en
-- TEXTE, et aucune cle etrangere ne le protege. Supprimer un membre ne
-- nettoie donc pas ses filleuls et ne leve aucune erreur : la reference
-- reste, pointant dans le vide. Le compte le plus recent n'est presque
-- jamais celui qu'il faut garder, parce que les parrainages sont souvent
-- sur un compte plus ancien. Garder « le dernier » par reflexe efface des
-- parrainages en silence, et c'est deja arrive (MACOCO0UQ, deux orphelins).
--
-- POURQUOI CETTE FORME, SIMPLE ET PLATE. La premiere version rassemblait
-- tout dans un seul objet JSON, pour contourner le fait que l'editeur de
-- Supabase n'affiche que le resultat de la DERNIERE instruction. Elle a
-- echoue sur une erreur de syntaxe, et je ne pouvais pas la tester : la
-- base ne m'est pas ouverte en lecture depuis le poste. Avec treize
-- membres, afficher TOUTE la table coute moins cher qu'une requete
-- ingenieuse : le doublon se voit a l'oeil, et `parraine_par` est dans la
-- liste, donc les orphelins se reperent en comparant deux colonnes.

select
  m.prenom,
  m.created_at::date                     as cree,
  m.code_ambassadeur                     as code,
  coalesce(m.parraine_par, '-')          as parraine_par,
  m.grade,
  coalesce(m.whatsapp, '-')              as numero,
  coalesce(m.lieu, '-')                  as lieu,
  m.filleuls                             as compteur,
  (select count(*) from public.bey_membres f
     where f.parraine_par = m.code_ambassadeur)                      as filleuls_reels,
  (select count(*) from public.bey_reactions r    where r.membre_id = m.id) as coeurs,
  (select count(*) from public.bey_commentaires c where c.membre_id = m.id) as commentaires,
  (select count(*) from public.bey_votes v        where v.membre_id = m.id) as votes,
  (select count(*) from public.bey_push p         where p.membre_id = m.id) as appareils,
  m.id
from public.bey_membres m
order by lower(trim(m.prenom)), m.created_at;
