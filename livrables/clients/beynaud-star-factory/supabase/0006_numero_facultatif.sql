-- ============================================================
-- 0006 — LE NUMERO DEVIENT FACULTATIF
-- ------------------------------------------------------------
-- L'inscription demandait prenom + WhatsApp + lieu avant d'avoir
-- rien montre. Le numero n'a jamais servi a contacter personne :
-- aucun envoi n'y est branche. Il ne reste qu'a l'inscription un
-- cout de conversion, et un moyen de reprendre le compte d'autrui
-- pour qui connait le numero.
--
-- Il devient facultatif. Le fan le donnera plus tard, depuis son
-- espace, presente comme un filet de securite.
--
-- Migration volontairement ADDITIVE : elle relache une contrainte,
-- elle n'en retire aucune colonne. Le code deja en ligne, qui envoie
-- toujours un numero, continue donc de fonctionner pendant la
-- bascule. C'est R-77, ecrite ce matin apres avoir fait l'inverse.
--
-- L'unicite est conservee : PostgreSQL autorise plusieurs NULL dans
-- un index unique, donc les comptes sans numero coexistent, et deux
-- comptes ne peuvent toujours pas porter le meme numero.
-- ============================================================

alter table public.bey_membres alter column whatsapp drop not null;

-- ------------------------------------------------------------
-- Normalisation des numeros deja en base.
-- Constate le 13/09 : le meme numero existait sous trois ecritures
-- (+33753902323, 0753902323, 753902323), donc trois comptes pour une
-- seule personne. Le serveur impose desormais l'indicatif precede
-- d'un plus, et convertit le 00 international. On aligne l'existant.
-- ------------------------------------------------------------
update public.bey_membres
   set whatsapp = '+' || substring(whatsapp from 3)
 where whatsapp like '00%';
