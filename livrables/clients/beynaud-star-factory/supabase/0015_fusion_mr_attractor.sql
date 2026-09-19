-- latiss.net — fusion du compte en double « Mr Attractor », 19/09/2026
--
-- CE QUI S'EST PASSE. Le demenagement de l'espace fan vers latiss.net a
-- change l'origine du site. Le navigateur range ses donnees PAR ORIGINE :
-- le compte de Mac Arthur est reste sur demo.agenceattractor.com, il s'est
-- reinscrit sur latiss.net, et un deuxieme compte est ne. C'etait annonce,
-- et c'est exactement le quatrieme cas que la migration 0010 predisait le
-- 14/09 : « tant que l'identite vit dans le stockage local du navigateur,
-- une nouvelle entree par un autre contexte creera un nouveau compte ».
--
-- LEQUEL ON GARDE, ET POURQUOI CE N'EST PAS LE PLUS RECENT.
--   1752a758  MRATTR0IB  14/09  3 filleuls, 4 coeurs, 1 commentaire, 1 vote
--   750e107a  MRATTR0W9  19/09  rien, sauf un abonnement aux notifications
-- Les trois filleuls (Cynthia, Mano, Reyna) portent le code MRATTR0IB en
-- TEXTE, sans cle etrangere. Supprimer ce compte-la ne leverait aucune
-- erreur et les rendrait orphelins en silence. On garde donc l'ancien.
--
-- ON DEPLACE, ON NE JETTE PAS. L'abonnement aux notifications cree
-- aujourd'hui sur latiss.net est le seul qui puisse encore delivrer : il
-- passe sur le compte conserve, pour que Mac Arthur n'ait pas a reactiver
-- la cloche. L'ancien abonnement, lie a demo.agenceattractor.com dont le
-- service worker n'existe plus, est laisse en place : il s'effacera tout
-- seul au premier 404 ou 410, ce que le code sait deja traiter. On ne le
-- supprime pas a la main parce qu'on ne peut pas prouver ici lequel des
-- deux est lequel, et se tromper couperait ses notifications.
--
-- LE SCRIPT REFUSE DE TRAVAILLER A L'AVEUGLE. Si le compte a supprimer
-- porte quoi que ce soit entre le diagnostic et maintenant, il s'arrete
-- au lieu de le perdre.

begin;

do $$
declare
  garde  uuid := '1752a758-e11a-41f2-b32e-b7f94fafdada';  -- MRATTR0IB, 14/09
  fusion uuid := '750e107a-d4e1-47c6-9146-354576c64ea7';  -- MRATTR0W9, 19/09
  n int;
begin
  if not exists (select 1 from public.bey_membres where id = garde) then
    raise exception 'Le compte a garder est introuvable (%). On ne touche a rien.', garde;
  end if;
  if not exists (select 1 from public.bey_membres where id = fusion) then
    raise exception 'Le compte a fusionner est introuvable (%). Deja fait ?', fusion;
  end if;

  -- Personne ne doit se dire parraine par le code du compte qui part.
  select count(*) into n from public.bey_membres
   where parraine_par = (select code_ambassadeur from public.bey_membres where id = fusion);
  if n > 0 then
    raise exception 'Le compte a fusionner a % filleul(s). Il faudrait les reporter avant.', n;
  end if;

  select count(*) into n from public.bey_reactions where membre_id = fusion;
  if n > 0 then raise exception 'Le compte a fusionner porte % coeur(s), non prevu au diagnostic.', n; end if;

  select count(*) into n from public.bey_commentaires where membre_id = fusion;
  if n > 0 then raise exception 'Le compte a fusionner porte % commentaire(s), non prevu.', n; end if;

  select count(*) into n from public.bey_votes where membre_id = fusion;
  if n > 0 then raise exception 'Le compte a fusionner porte % vote(s), non prevu.', n; end if;

  -- Ce qui se deplace : l'abonnement aux notifications, et lui seul.
  update public.bey_push set membre_id = garde where membre_id = fusion;

  delete from public.bey_membres where id = fusion;

  raise notice 'Fusion faite. Compte conserve : %', garde;
end $$;

commit;

-- Le controle d'apres. On attend : 11 membres, un seul « Mr Attractor »,
-- qui porte 3 filleuls comptes et 3 filleuls reels, et deux appareils.
select
  m.prenom,
  m.code_ambassadeur as code,
  m.filleuls         as compteur,
  (select count(*) from public.bey_membres f
     where f.parraine_par = m.code_ambassadeur) as filleuls_reels,
  (select count(*) from public.bey_push p where p.membre_id = m.id) as appareils
from public.bey_membres m
where lower(trim(m.prenom)) = 'mr attractor';
