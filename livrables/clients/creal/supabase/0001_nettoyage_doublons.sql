-- C'Real — retrait des trois doublons de catalogue
-- Exécuté le 06/08/2026, avant le lancement de la communication de Kezey.
--
-- Contexte : le catalogue servait 11 produits pour 8 réels. Trois lignes créées
-- le 19/06/2026 font doublon avec les originaux du 16/06 : même produit, même
-- prix, mais nom raccourci et catégorie vide.
--
--   ea01db3b  « Mes premières C'real »  doublon de  17283e3b  « Mes premieres C'real (Riz et Sorgho) »
--   ff1f4b8b  « Multicreal »            doublon de  59b599d3  « Multicreal (Melange enrichi) »
--   f3121e7c  « Mix C'real »            doublon de  b2004503  « Mix C'real (Riz, Mais et Sorgho) »
--
-- On garde les originaux : ils portent une catégorie, dont Zoé se sert pour
-- conseiller les mamans.
--
-- Désactivation et non suppression : get_catalogue filtre sur actif = true,
-- donc l'effet est immédiat côté cliente et côté Zoé, et le geste reste
-- réversible. La suppression définitive se fera au moment de la migration
-- vers les tables creal_, où seuls les produits actifs seront repris.
-- Vérifié avant exécution : aucune ligne de client_purchases ne les référence.

update produits_user
set    actif = false
where  id in (
  'ea01db3b-7d59-41f9-91d4-55eb8f7dba88',
  'ff1f4b8b-54b7-4f64-bddc-d01fea7c995a',
  'f3121e7c-6094-4ef3-b22a-43b9bcdae22d'
);
