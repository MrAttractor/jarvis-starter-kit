-- C'Real — migration des données depuis Attractor Assists
-- Écrit le 06/08/2026, à exécuter après 0002_socle_creal.sql.
--
-- CE QUI SE PASSE ICI, et pourquoi ce n'est pas une simple recopie.
--
-- Les fiches produits complètes n'étaient PAS dans Assists. Elles vivaient en
-- dur dans le JavaScript de la page (noms affichés, photos, kcal, poids,
-- descriptions, textes de détail), et Assists ne synchronisait QUE le prix, par
-- rapprochement approximatif sur le nom. Conséquence : Kezey pouvait changer un
-- prix et rien d'autre. Si elle désactivait un produit, la page continuait de
-- l'afficher.
--
-- Cette migration réunit les deux moitiés dans cr_produits, qui devient la
-- seule source de vérité. C'est la condition pour qu'un tableau de bord serve à
-- quelque chose : sans ça, elle modifierait et la boutique ne bougerait pas.
--
-- Les identifiants d'origine de produits_user sont conservés, pour ne pas
-- couper le lien avec l'historique Assists.
--
-- Les trois doublons désactivés par 0001 ne sont volontairement PAS repris.

begin;

-- ── Les 8 farines ──────────────────────────────────────────────────────────
insert into public.cr_produits
  (id, nom, etiquette, prix, unite, categorie, photo_url, poids, kcal, preparation, description, detail, actif, ordre)
values
  ('b2004503-3c7f-40e6-a948-bcb465e6e5aa', 'Mix C''real', 'Bestseller', 1500, 'FCFA', 'Farines mixtes',
   'imgs/mix.jpg', '200g', 365, '5-10 min',
   'Riz · Maïs · Sorgho — Énergie & immunité',
   'Source d''énergie naturelle composée de riz, maïs et sorgho. Riche en fer, calcium, magnésium et vitamines, il soutient l''immunité et la croissance de bébé dès 4 mois.',
   true, 1),

  ('59b599d3-ea99-4564-be76-f7c9fa68d6a3', 'Multi C''real', 'Complet', 1500, 'FCFA', 'Farines mixtes',
   'imgs/multi.jpg', '200g', 365, '5-10 min',
   'Riz · Maïs · Sorgho · Soja — Mélange complet',
   'Mélange de riz, maïs, sorgho et soja, enrichi en nutriments essentiels. Riche en calories, protéines et micronutriments pour une croissance complète et équilibrée.',
   true, 2),

  ('1630157a-c772-4f5c-9436-5149de865044', 'C''real Sorgho', 'Sans gluten', 1500, 'FCFA', 'Farines simples',
   'imgs/sorgho.jpg', '200g', 339, '5-10 min',
   'Sans gluten · Protéines · Anti-diarrhée',
   'Farine de sorgho sans gluten, riche en protéines, fibres, vitamines et minéraux. Favorise une bonne digestion, solidifie les os et renforce le système immunitaire. Recommandée en cas de diarrhée.',
   true, 3),

  ('82b87d8d-58d8-4556-b77b-df783e7443f5', 'C''real Maïs', 'Sans gluten', 1000, 'FCFA', 'Farines simples',
   'imgs/mais.jpg', '200g', 365, '5-10 min',
   'Sans gluten · Antioxydant · Vitamines B3',
   'Farine de maïs à fort pouvoir antioxydant, source de fibres et protéines. Sans gluten, excellente source de glucides complexes et de vitamines B3 pour l''énergie de bébé.',
   true, 4),

  ('b2b45bb3-9860-438d-b884-6ca3e1ac6665', 'C''real Riz', 'Digeste', 1500, 'FCFA', 'Farines simples',
   'imgs/riz.jpg', '200g', 336, '5-10 min',
   'Sans gluten · Digeste · Anti-constipation',
   'Farine de riz sans gluten, digeste et au goût neutre. Excellente source d''énergie grâce aux glucides, vitamines B et minéraux (potassium, phosphore). Idéale contre la constipation.',
   true, 5),

  ('47b5214a-e7cf-451a-8194-814d64e60aea', 'C''real Mil', 'Minéraux', 1000, 'FCFA', 'Farines simples',
   'imgs/mil.jpg', '200g', 377, '5-10 min',
   'Sans gluten · Magnésium · Fer · Zinc',
   'Farine de mil sans gluten, source de protéines, glucides, magnésium (140mg), fer (4,5mg), zinc et vitamines B. Le silicium favorise une belle peau, des cheveux sains et des ongles solides.',
   true, 6),

  ('e5bcedd1-3985-446a-9487-2cd2f1fdf0af', 'Kit prise de poids', 'Bundle', 5000, 'FCFA', 'Kits',
   'imgs/kit.jpeg?v=2', '4×200g', 365, '5-10 min',
   'Riz · Maïs · Mix C''real · Multicreal — Prise de poids',
   'Le kit comprend 4 farines locales sélectionnées pour booster rapidement la prise de poids de bébé : Riz, Maïs, Mix C''real et Multicreal. Idéal pour les bébés ayant besoin d''un apport calorique renforcé.',
   true, 7),

  ('17283e3b-15f8-4cfe-9085-abf0c139ac02', 'Mes premières C''real', '4-6 mois', 1500, 'FCFA', 'Des 4 mois',
   'imgs/premieres.jpg', '300g', 339, '5-10 min',
   'Riz · Sorgho — Duo digeste pour bébé',
   'Un duo Riz et Sorgho, facile à digérer. Idéale pour les premières cuillères de bébé. Uniquement pour les débuts de diversification, 4 à 6 mois.',
   true, 8)
on conflict (id) do nothing;

-- ── Stock initialisé à zéro ────────────────────────────────────────────────
-- Zéro et non un chiffre inventé : un stock faux est pire que pas de stock.
-- C'est Kezey qui saisira ses vraies quantités depuis son tableau de bord.
insert into public.cr_stock (produit_id, quantite, seuil_alerte)
select id, 0, 5 from public.cr_produits
on conflict (produit_id) do nothing;

-- ── Configuration ──────────────────────────────────────────────────────────
-- Le prompt de Zoé est repris tel quel depuis Assists : il appartient à Kezey,
-- il n'est pas réécrit à cette occasion.
-- Les deux numéros sont distincts et ne doivent jamais être confondus :
-- 07 49 56 39 76 reçoit les commandes, 07 58 68 02 79 est le bénéficiaire
-- Orange Money. C'est cette confusion qui avait cassé le bouton de commande.
insert into public.cr_config (id, prompt_zoe, whatsapp, lien_wave, numero_om)
select true,
       p.client_assistant_prompt,
       '2250749563976',
       'https://pay.wave.com/m/M_ci_1BZymigN-SjL/c/ci/',
       '+225 07 58 68 02 79'
from public.profiles p
where p.public_slug = 'creal'
  and p.client_assistant_prompt is not null
on conflict (id) do update
  set prompt_zoe = excluded.prompt_zoe,
      whatsapp   = excluded.whatsapp,
      lien_wave  = excluded.lien_wave,
      numero_om  = excluded.numero_om;

-- ── Conversations et messages ──────────────────────────────────────────────
-- Ses échanges avec ses clientes sont son historique commercial, pas un journal
-- technique. Ils la suivent.
insert into public.cr_conversations (id, titre, created_at, updated_at)
select c.id, c.titre, c.created_at, c.created_at
from public.conversations c
where c.user_id = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid
on conflict (id) do nothing;

insert into public.cr_messages (id, conversation_id, role, contenu, created_at)
select m.id, m.conversation_id, m.role, m.contenu, m.created_at
from public.messages m
join public.cr_conversations cc on cc.id = m.conversation_id
where m.user_id = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid
  and m.role in ('user','assistant')
  and m.contenu is not null
on conflict (id) do nothing;

-- ── Commandes ──────────────────────────────────────────────────────────────
-- Rien à reprendre : la table orders ne contient aucune ligne pour elle.
-- Ses clientes commandaient sur WhatsApp, et la seule voie d'enregistrement
-- était le bout du tunnel de paiement, que personne n'a jamais parcouru.

commit;
