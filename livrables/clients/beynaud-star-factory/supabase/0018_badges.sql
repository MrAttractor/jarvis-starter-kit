-- latiss.net — les badges se gagnent tout seuls, 21/09/2026
--
-- POURQUOI. Un fan qui commente ne recoit rien en retour. Le concours
-- recompense le parrainage, donc ceux qui amenent du monde ; il ne dit rien a
-- celui qui est la tous les jours sans jamais recruter. Les badges comblent ce
-- trou, et ils le comblent SEULS : aucune ligne a ecrire, aucune decision a
-- prendre, aucun oubli possible un jour de tournee.
--
-- CALCULE, JAMAIS DECERNE. Un badge attribue a la main est un badge qu'on
-- oublie de retirer et qu'on decerne deux fois. Ici, le badge est la lecture
-- d'un compteur : il apparait a la seconde ou le compteur passe le palier. La
-- regle d'attribution vit dans un seul fichier, `_partage/badges.ts`, lu a la
-- fois par l'espace fan et par le tableau de bord, pour que les deux ecrans ne
-- puissent pas raconter deux histoires differentes.
--
-- DEPUIS LE DEBUT, contrairement aux meilleurs contributeurs qui se comptent
-- sur 30 jours glissants. Un badge gagne ne se reprend pas : c'est ce qui en
-- fait une recompense plutot qu'un classement.
--
-- LES COMMENTAIRES MASQUES NE COMPTENT PAS, sinon l'insulte decroche un badge.
--
-- LE FILTRE DESCEND JUSQU'AU PLAN. La vue n'emploie aucune fonction de
-- fenetrage : `?id=eq.X` est alors pousse dans la vue par Postgres, qui ne lit
-- qu'une ligne au lieu de recalculer toute la communaute. Avec `row_number()`
-- pour le rang d'inscription, chaque ouverture d'un espace fan aurait relu la
-- table entiere. A 500 000 membres, c'est la difference entre une reponse
-- immediate et une page qui ne s'ouvre plus.

-- Compter l'activite d'UN membre, c'est chercher par membre_id. Les trois
-- tables n'etaient indexees que par ce qui recevait l'activite (le message, le
-- sondage), pas par celui qui la produit.
create index if not exists bey_comm_membre_idx  on public.bey_commentaires(membre_id);
create index if not exists bey_react_membre_idx on public.bey_reactions(membre_id);
create index if not exists bey_votes_membre_idx on public.bey_votes(membre_id);

create or replace view public.v_bey_totaux
with (security_invoker = true) as
select
  m.id,
  m.prenom,
  m.lieu,
  m.grade,
  m.filleuls,
  m.created_at,
  coalesce((select count(*) from public.bey_commentaires c
             where c.membre_id = m.id and c.masque = false), 0) as commentaires,
  coalesce((select count(*) from public.bey_votes v
             where v.membre_id = m.id), 0)                      as votes,
  coalesce((select count(*) from public.bey_reactions r
             where r.membre_id = m.id), 0)                      as coeurs,
  -- La cloche : le fan a accepte d'etre prevenu. C'est le geste qui compte
  -- double pour Serge, c'est lui qui rend une annonce lisible le jour J.
  exists (select 1 from public.bey_push p where p.membre_id = m.id)   as cloche,
  -- Le rang d'inscription, compte et non numerote : combien etaient la avant
  -- lui. Sert au badge Pionnier, et l'index sur created_at le rend immediat.
  (select count(*) from public.bey_membres b
    where b.created_at < m.created_at)                          as arrives_avant
from public.bey_membres m;

comment on view public.v_bey_totaux is
  'Tout ce qu''un membre a fait depuis son inscription. Sert aux badges '
  'automatiques (regle d''attribution dans _partage/badges.ts, lue par '
  'bey-public et bey-admin). Aucune fonction de fenetrage, pour que le filtre '
  'par id descende dans le plan. Creee le 21/09/2026.';

-- Ce que la vue voit aujourd'hui, les dix membres les plus actifs.
select prenom, lieu, commentaires, votes, coeurs, filleuls, cloche, arrives_avant
  from public.v_bey_totaux
 order by commentaires desc, coeurs desc, filleuls desc
 limit 10;
