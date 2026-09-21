-- latiss.net — trois distinctions au lieu de quinze badges, 21/09/2026
--
-- POURQUOI ON DEFAIT CE QU'ON A FAIT CE MATIN. Quinze badges, verdict de Mac
-- Arthur le jour meme : « c'est un concept trop detaille ». Il a raison, et
-- la raison est mesurable : quinze recompenses, c'est quinze phrases a retenir
-- pour le fan, et surtout quinze choses que Serge ne peut pas citer en video.
-- Une distinction qui ne se dit pas a voix haute ne sert a rien.
--
-- IL EN RESTE TROIS, et chacune repond a une question differente :
--   1. QUI EST LA          -> Meilleur contributeur, titre de la semaine
--   2. QUI AMENE DU MONDE  -> Ambassadeur, trois paliers, acquis a vie
--   3. QUI FAIT LES DEUX   -> Super fan
--
-- LE MEILLEUR CONTRIBUTEUR NE SE COMPTE PAS EN POINTS, IL SE COMPTE EN
-- COUVERTURE. C'est la definition donnee par Mac Arthur : « celui qui est
-- actif sur TOUS les postes ». Ce n'est pas la meme chose qu'un score : un
-- fan qui met trente coeurs sur une seule publication fait un gros score et
-- rate la semaine. Celui qui repond a chacune des publications, meme d'un
-- seul coeur, est celui qui est vraiment la. Et la phrase que Serge peut dire
-- devient vraie et simple : « cette semaine, ils n'ont rien rate ».
--
-- SEPT JOURS. Mac Arthur hesitait entre trois jours et une semaine. Sept,
-- parce que trois jours punit celui qui travaille et ne consulte que le
-- week-end, et parce qu'un titre hebdomadaire donne a Serge un rendez-vous
-- regulier a animer. C'est une seule constante, elle se change en une ligne.
--
-- DEUX VUES, ET C'EST VOULU. Le cout d'une vue qui partirait des MEMBRES
-- serait proportionnel au nombre d'inscrits : a 500 000 membres, il faudrait
-- parcourir 500 000 lignes pour trouver les dix qui ont bouge. Ici on part
-- des GESTES : le cout suit l'activite reelle, pas la taille de la base. Un
-- membre sans aucun geste n'apparait tout simplement pas, et cote application
-- « absent » se lit « zero ».

-- Les quinze badges n'ont plus de lecteur.
drop view if exists public.v_bey_totaux;
drop view if exists public.v_bey_contributeurs;

-- ── 1. LE FIL, EN UNE SEULE LISTE ────────────────────────────────────────
-- Les quatre tables de publication vues comme une seule, avec le meme couple
-- (type, id) que celui employe par les coeurs et les commentaires depuis la
-- migration 0005. Ce qui est eteint ne compte pas : on ne peut pas reprocher
-- a un fan d'avoir rate une publication qui ne s'affichait pas.
create or replace view public.v_bey_publications
with (security_invoker = true) as
select 'message'::text as cible_type, id as cible_id, created_at from public.bey_messages
union all
select 'photo'::text,   id, created_at from public.bey_photos   where actif
union all
select 'contenu'::text, id, created_at from public.bey_contenus where actif
union all
select 'sondage'::text, id, created_at from public.bey_sondages where actif;

comment on view public.v_bey_publications is
  'Le fil de Serge vu comme une seule liste (type, id, date). Les quatre '
  'tables partagent deja ce couple avec les coeurs et les commentaires. '
  'Creee le 21/09/2026.';

-- ── 2. COMBIEN DE PUBLICATIONS SUR LA SEMAINE ────────────────────────────
-- Le denominateur du titre. Une seule ligne, lue par les deux ecrans, pour
-- que le fan et Serge comptent la meme semaine a la seconde pres.
create or replace view public.v_bey_semaine
with (security_invoker = true) as
select
  (now() - interval '7 days')                                as debut,
  now()                                                      as fin,
  (select count(*) from public.v_bey_publications p
    where p.created_at >= now() - interval '7 days')         as publications;

comment on view public.v_bey_semaine is
  'Combien Serge a publie sur les 7 derniers jours. C''est le denominateur '
  'du titre de Meilleur contributeur. Creee le 21/09/2026.';

-- ── 3. QUI A REPONDU, ET A COMBIEN DE PUBLICATIONS ───────────────────────
-- On part des gestes, pas des membres : le cout suit l'activite.
-- Un geste est un coeur, un commentaire visible, ou un vote. Les trois se
-- valent : le titre recompense la PRESENCE, pas l'effort.
-- `union` et non `union all` : un fan qui a mis un coeur ET commente la meme
-- publication l'a couverte une fois, pas deux, sinon la couverture depasse
-- cent pour cent et le titre se decroche sans avoir tout suivi.
create or replace view public.v_bey_actifs_semaine
with (security_invoker = true) as
with gestes as (
  select r.membre_id, r.cible_type, r.cible_id
    from public.bey_reactions r
    join public.v_bey_publications p
      on p.cible_type = r.cible_type and p.cible_id = r.cible_id
   where p.created_at >= now() - interval '7 days'
  union
  select c.membre_id, c.cible_type, c.cible_id
    from public.bey_commentaires c
    join public.v_bey_publications p
      on p.cible_type = c.cible_type and p.cible_id = c.cible_id
   where p.created_at >= now() - interval '7 days'
     and c.membre_id is not null
     and c.masque = false
  union
  select v.membre_id, 'sondage'::text, v.sondage_id
    from public.bey_votes v
    join public.v_bey_publications p
      on p.cible_type = 'sondage' and p.cible_id = v.sondage_id
   where p.created_at >= now() - interval '7 days'
)
select
  m.id,
  m.prenom,
  m.lieu,
  m.grade,
  m.filleuls,
  g.touchees,
  coalesce((select count(*) from public.bey_commentaires c
             where c.membre_id = m.id
               and c.masque = false
               and c.created_at >= now() - interval '7 days'), 0) as commentaires
from (select membre_id, count(*) as touchees from gestes group by membre_id) g
join public.bey_membres m on m.id = g.membre_id;

comment on view public.v_bey_actifs_semaine is
  'Qui a repondu a Serge cette semaine, et a combien de ses publications. '
  '`touchees` compare a v_bey_semaine.publications donne la couverture : '
  'egales, le fan n''a rien rate. Part des GESTES et non des membres, pour '
  'que le cout suive l''activite et non la taille de la base. Le detail des '
  'seuils vit dans _partage/badges.ts. Creee le 21/09/2026.';

-- Ce que les vues voient aujourd'hui.
select (select publications from public.v_bey_semaine) as publications_7j,
       a.prenom, a.touchees, a.commentaires, a.filleuls
  from public.v_bey_actifs_semaine a
 order by a.touchees desc, a.commentaires desc;
