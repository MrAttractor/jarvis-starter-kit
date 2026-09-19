-- latiss.net — une video sait dire si elle est verticale, 19/09/2026
--
-- POURQUOI. Mac Arthur annonce que 90 % de ce que Serge filmera sera
-- vertical. Or la rangee de reels de l'onglet Latiss ne reconnait une
-- verticale qu'a une seule chose : son lien YouTube contient « /shorts/ ».
-- Un fichier .mp4 depose directement, ou un lien YouTube normal d'une video
-- verticale, n'y apparait pas. Avec 90 % de vertical, la rangee raterait
-- presque tout, en silence.
--
-- DEVINER NE SUFFIT PAS. On ne peut pas lire les dimensions d'une video
-- YouTube sans la charger, et le nom du fichier ne dit rien de sa forme.
-- La seule source fiable est celle qui a filme : Serge coche, l'application
-- sait.
--
-- FAUX PAR DEFAUT, et c'est delibere : une video non marquee est traitee
-- comme avant, en horizontal. Aucun contenu deja publie ne change d'aspect.
--
-- Le champ reste a cote de `youtube_url` et non dedans : un jour la meme
-- video pourra etre servie autrement (Cloudflare Stream, fichier local), et
-- sa forme ne depend pas de l'endroit ou elle est rangee.

alter table public.bey_contenus
  add column if not exists vertical boolean not null default false;

comment on column public.bey_contenus.vertical is
  'Video filmee a la verticale (9/16). Renseignee par Serge a la publication. '
  'Sert a la rangee de reels et au lecteur plein ecran. Faux par defaut : une '
  'video non marquee reste horizontale, comme avant le 19/09/2026.';

-- Les Shorts deja publies sont verticaux par construction : on les marque,
-- sinon la regle « /shorts/ » devrait survivre en double dans le code.
update public.bey_contenus
   set vertical = true
 where youtube_url ilike '%/shorts/%'
   and vertical = false;

select count(*) filter (where vertical) as verticales,
       count(*)                          as contenus
  from public.bey_contenus;
