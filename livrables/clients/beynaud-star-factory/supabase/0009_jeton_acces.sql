-- ============================================================
-- 0009 — LE LIEN D'ACCES PERSONNEL
-- ------------------------------------------------------------
-- Constate le 13/09 par Mac Arthur : « a chaque fois que je sors et
-- que je reviens je dois renseigner les memes infos ».
--
-- Cause : le compte vit dans le stockage du navigateur, et une
-- application ajoutee a l'ecran d'accueil d'un iPhone a SON PROPRE
-- stockage, separe de Safari, lui-meme separe du navigateur integre
-- de WhatsApp. Trois mondes qui ne se voient pas. Or les fans
-- recevront justement le lien par WhatsApp.
--
-- Le jeton est une cle porteuse : qui l'a, entre. Il n'est donc
-- jamais affiche ni copiable dans l'interface, seulement glisse dans
-- l'adresse le temps d'ajouter la page a l'ecran d'accueil, puis
-- retire. A ne pas confondre avec code_ambassadeur, qui lui est fait
-- pour etre partage partout : les melanger reviendrait a donner son
-- compte a tous ses filleuls.
-- ============================================================

alter table public.bey_membres add column if not exists jeton text;

-- 32 caracteres tires au hasard. gen_random_uuid deux fois plutot qu'un
-- generateur maison : c'est deja la source d'alea du serveur.
update public.bey_membres
   set jeton = replace(gen_random_uuid()::text, '-', '') 
 where jeton is null;

-- La valeur par defaut AVANT le NOT NULL, et non l'inverse. Pose dans cet
-- ordre le 13/09, la contrainte a casse toutes les inscriptions pendant une
-- minute : le code deja en ligne n'envoyait pas de jeton. C'est R-77, ecrite
-- le matin meme, et enfreinte le soir.
alter table public.bey_membres
  alter column jeton set default replace(gen_random_uuid()::text, '-', '');

alter table public.bey_membres alter column jeton set not null;

create unique index if not exists bey_membres_jeton_key on public.bey_membres (jeton);
