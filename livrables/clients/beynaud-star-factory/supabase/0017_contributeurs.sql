-- latiss.net — qui fait vivre la communaute, 21/09/2026
--
-- POURQUOI. Le tableau de bord sait dire combien de fans sont inscrits et qui
-- parraine le plus. Il ne sait pas dire qui ANIME. Ce sont deux populations
-- differentes : celui qui amene dix filleuls et disparait n'est pas celui qui
-- commente chaque publication. Les statistiques de groupe Facebook affichent
-- justement ce chiffre-la, et c'est celui que les animateurs regardent, parce
-- que c'est le seul qui dit si le groupe est vivant ou juste peuple.
--
-- TROIS GESTES, TROIS POIDS. Commenter demande d'ecrire, voter demande de
-- choisir, aimer demande un pouce. On ne peut pas les compter a egalite sans
-- mettre en tete celui qui a le plus de temps, au lieu de celui qui donne le
-- plus. D'ou 3 / 2 / 1. Le poids est affiche a l'ecran : un classement dont
-- on ne connait pas la regle ne fait bouger personne.
--
-- TRENTE JOURS, pas depuis le debut. Un classement depuis le debut se fige
-- au bout de quelques mois : le premier arrive reste premier et plus personne
-- ne peut le rattraper. Serge a besoin de savoir qui anime MAINTENANT, pour
-- le citer maintenant. La fenetre glisse toute seule, il n'y a rien a
-- reinitialiser.
--
-- LES COMMENTAIRES MASQUES NE COMPTENT PAS. Sinon l'insulte rapporte des
-- points, et le meilleur contributeur devient celui que la moderation a du
-- cacher le plus souvent.
--
-- CALCULE, JAMAIS STOCKE, comme le classement du concours : un compteur
-- entretenu a la main finit toujours par diverger de la realite.

create or replace view public.v_bey_contributeurs
with (security_invoker = true) as
select
  m.id,
  m.prenom,
  m.lieu,
  m.grade,
  coalesce(c.n, 0) as commentaires,
  coalesce(v.n, 0) as votes,
  coalesce(r.n, 0) as coeurs,
  coalesce(c.n, 0) * 3 + coalesce(v.n, 0) * 2 + coalesce(r.n, 0) as points
from public.bey_membres m
left join (
  select membre_id, count(*) as n
    from public.bey_commentaires
   where membre_id is not null
     and masque = false
     and created_at >= now() - interval '30 days'
   group by membre_id
) c on c.membre_id = m.id
left join (
  select membre_id, count(*) as n
    from public.bey_votes
   where created_at >= now() - interval '30 days'
   group by membre_id
) v on v.membre_id = m.id
left join (
  select membre_id, count(*) as n
    from public.bey_reactions
   where created_at >= now() - interval '30 days'
   group by membre_id
) r on r.membre_id = m.id;

comment on view public.v_bey_contributeurs is
  'Qui anime la communaute sur les 30 derniers jours. Un commentaire visible '
  'vaut 3 points, un vote 2, un coeur 1. Fenetre glissante, rien a '
  'reinitialiser. Lu par bey-admin action=stats. Cree le 21/09/2026.';

-- Ce que la vue voit aujourd'hui, les dix premiers.
select prenom, lieu, commentaires, votes, coeurs, points
  from public.v_bey_contributeurs
 where points > 0
 order by points desc, commentaires desc
 limit 10;
