-- La Beynaumania — ménage des comptes en double, 14/09/2026
--
-- POURQUOI. Mac Arthur signale deux symptômes : il active les notifications et
-- l'application le lui redemande, il vote et son vote a disparu au retour.
-- Mesure en base : il existe TROIS comptes « Mr Attractor », créés le 13/09 à
-- 20h28, le 14/09 à 06h54 et le 14/09 à 12h13, et chacun porte EXACTEMENT UN
-- vote. Deux portent un abonnement de notification Apple distinct. Les deux
-- symptômes n'en font qu'un : à chaque entrée par un contexte de stockage
-- différent (Safari, l'app installée, le navigateur interne de WhatsApp), il
-- repart sur une identité neuve, et l'état de la précédente n'est plus le sien.
--
-- LEQUEL ON GARDE, ET POURQUOI CE N'EST PAS LE PLUS RÉCENT.
-- `parraine_par` stocke le CODE ambassadeur en texte, et AUCUNE clé étrangère
-- ne le protège. Supprimer un membre ne nettoie donc pas ses filleuls et ne
-- lève aucune erreur : la référence reste, pointant dans le vide. Or le compte
-- du 14/09 à 06h54 (MRATTR0IB) porte les DEUX seuls parrainages réels de la
-- plateforme, Cynthia et Mano. Garder le plus récent, qui est le réflexe
-- naturel, aurait fait disparaître ces deux parrainages du classement en
-- silence. C'est donc MRATTR0IB qu'on garde.
--
-- LA PREUVE QUE LE DÉFAUT A DÉJÀ FRAPPÉ. Dany et Camille-Coralie sont marqués
-- parrainés par `MACOCO0UQ`, un code qui n'existe dans aucun compte : un
-- compte de test supprimé par le passé a laissé deux orphelins en base. Même
-- famille que R-76, une suppression qui n'emporte pas ce qui la référence.
--
-- CE QUE CE FICHIER NE FAIT PAS. Il nettoie les données, il ne corrige pas la
-- cause. Tant que l'identité vit dans le stockage local du navigateur, une
-- quatrième entrée par un autre contexte créera un quatrième compte.

begin;

-- ── 1. Les deux comptes « Mr Attractor » en trop ──────────────────────────
-- Les votes, les likes et les abonnements push partent en cascade, c'est
-- voulu : ils appartiennent à des identités qui n'auraient jamais dû exister.
-- Aucun des deux ne porte de filleul, vérifié avant écriture.
delete from bey_membres
where prenom = 'Mr Attractor'
  and code_ambassadeur in ('MRATTR056', 'MRATTR0DM');

-- ── 2. Le compte Dany ─────────────────────────────────────────────────────
-- Compte de test du 11/07, parrainé par le code déjà disparu MACOCO0UQ.
-- Son commentaire « Coucou » part AVANT le compte : `bey_commentaires` est en
-- SET NULL et porte une colonne `prenom` dénormalisée, donc le commentaire
-- resterait affiché signé « Dany » sans compte derrière. Un résidu de jeu de
-- test visible par les fans, ce que R-16 interdit avant mise en production.
delete from bey_commentaires
where membre_id = (select id from bey_membres where code_ambassadeur = 'DANY01X');

delete from bey_membres where code_ambassadeur = 'DANY01X';

-- ── 3. Les parrainages orphelins laissés par MACOCO0UQ ────────────────────
-- Camille-Coralie reste marquée parrainée par un code qui n'existe pas. On ne
-- devine pas un parrain : on retire la référence morte, ce qui rend l'état de
-- la base honnête au lieu de vaguement faux.
update bey_membres
set parraine_par = null
where parraine_par is not null
  and parraine_par not in (select code_ambassadeur from bey_membres);

-- ── 4. Le compteur de filleuls recalculé depuis les faits ─────────────────
-- `filleuls` est un compteur stocké : après toute suppression il peut mentir.
-- On le réaligne sur le nombre réel de comptes qui portent le code.
update bey_membres m
set filleuls = (
  select count(*) from bey_membres f where f.parraine_par = m.code_ambassadeur
);

commit;
