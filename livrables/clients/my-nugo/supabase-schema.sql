-- ═══════════════════════════════════════════════════════════
-- MY NUGO — Schéma Supabase
-- À coller dans l'éditeur SQL de ton projet Supabase
-- ═══════════════════════════════════════════════════════════

-- 1. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS produits (
  id            TEXT PRIMARY KEY,
  nom_fr        TEXT NOT NULL,
  description_fr TEXT,
  prix_eur      NUMERIC(10,2),
  prix_fcfa     INTEGER,
  stock         INTEGER DEFAULT 10,
  statut        TEXT DEFAULT 'disponible',
  badge         TEXT,
  photo_principale TEXT,
  categorie     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE HERO SLIDES
CREATE TABLE IF NOT EXISTS hero_slides (
  id         SERIAL PRIMARY KEY,
  ordre      INTEGER NOT NULL,
  titre_fr   TEXT,
  photo      TEXT,
  id_produit TEXT REFERENCES produits(id) ON DELETE SET NULL,
  badge      TEXT,
  actif      BOOLEAN DEFAULT TRUE
);

-- 3. SÉCURITÉ (lecture publique, écriture admin seulement)
ALTER TABLE produits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique produits"    ON produits    FOR SELECT USING (true);
CREATE POLICY "Lecture publique hero_slides" ON hero_slides FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════
-- SEED — 22 PRODUITS NOUVELLE COLLECTION
-- ═══════════════════════════════════════════════════════════

INSERT INTO produits (id, nom_fr, description_fr, prix_eur, prix_fcfa, stock, statut, badge, photo_principale, categorie) VALUES
('PROD_01', 'Robe Oloa',                 'Dentelle · 4 coloris (blanc, rose, jaune, bleu)',      65,  43000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Robes'),
('PROD_02', 'Robe Lia',                  'Coupe élégante · Fluidité naturelle',                  50,  33000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Robes'),
('PROD_03', 'Robe Eliora Long',           'Bleu ciel · Coupe longue · Légèreté estivale',         65,  43000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Robes'),
('PROD_04', 'Robe Eliora Long',           'Corail · Coupe longue · Disponible en bleu ciel',      65,  43000, 10, 'disponible', 'LOOK DUO',   NULL,                              'Robes'),
('PROD_23', 'Robe Eliora Long',          'Bleu ciel · Coupe longue · Légèreté estivale',          65,  43000,  7, 'disponible', 'NOUVEAU',    NULL,                              'Robes'),
('PROD_24', 'Robe Eliora Court',         'Coupe courte · Légèreté estivale',                      50,  33000, 10, 'disponible', 'NOUVEAU',    'images/PROD_24_principale.png',   'Robes'),
('PROD_05', 'Robe Kimono',               'Jaune & corail · Manches kimono · Fluidité naturelle', 50,  33000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Robes'),
('PROD_06', 'Robe Elena',                'Élégance raffinée · Silhouette soignée',               60,  39000, 10, 'disponible', 'BESTSELLER', NULL,                              'Robes'),
('PROD_07', 'Robe Teecya',               'Style contemporain · Allure affirmée',                 60,  39000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Robes'),
('PROD_08', 'Ensemble Aymerik',          'Culotte & haut · Look coordonné · Porter ensemble ou séparé', 70, 46000, 10, 'disponible', 'LOOK DUO', NULL,                         'Ensembles'),
('PROD_09', 'Pantalon Yasmine',          'Coupe ample · Confort et élégance au quotidien',       40,  26000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Pantalons'),
('PROD_10', 'Boubou Renée',              'Vert · Boubou contemporain · Pièce signature',         85,  56000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Robes'),
('PROD_11', 'Pantalon Naïla',             'Coupe ample · Silhouette fluide',                  40,  26000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Ensembles'),
('PROD_12', 'Robe Désirée',              'Jaune & blanc · Éclat naturel · Imprimé délicat',      70,  46000, 10, 'disponible', 'BESTSELLER', NULL,                              'Robes'),
('PROD_13', 'Robe Lirane',               'Élégance intemporelle · Coupe longue',                 75,  49000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Robes'),
('PROD_14', 'Combinaison Nourah',        'Jumpsuit élégant · Confort moderne · Allure unique',   75,  49000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Combinaisons'),
('PROD_15', 'Combinaison Mandia',        'Pièce forte · Allure inégalée · Collection premium',   120, 79000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Combinaisons'),
('PROD_16', 'Perfecto Armelia',          'Version simple · Perfecto wax · Pièce iconique',       100, 65500, 10, 'disponible', 'NOUVEAU',    'images/PROD_16_principale.jpg',   'Vestes'),
('PROD_17', 'Perfecto Armelia Réversible','Double face · Deux looks en un · Pièce collector',   120, 79000, 10, 'disponible', 'EXCLUSIF',   'images/PROD_17_principale.jpg',   'Vestes'),
('PROD_19', 'Paréo Anaëlle',             'Réversible · Pied de poule · Liberté créative',        80,  52500, 10, 'disponible', 'NOUVEAU',    NULL,                              'Accessoires'),
('PROD_20', 'Ensemble Maelys',           'Jupe & haut · Coordonnés · Élégance naturelle',        65,  43000, 10, 'disponible', 'LOOK DUO',   NULL,                              'Ensembles'),
('PROD_21', 'Pantalon Ayêla',            'Coupe tendance · Confort premium · Porter au quotidien',70, 46000, 10, 'disponible', 'NOUVEAU',    NULL,                              'Pantalons'),
('PROD_22', 'Robe Mahi',                 'Marron & orange · Chaleur ivoirienne · Coupe fluide',  40,  26000, 10, 'disponible', 'EXCLUSIF',   NULL,                              'Robes')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SEED — 4 SLIDES HERO
-- (photo = URL Supabase Storage à mettre à jour après upload)
-- ═══════════════════════════════════════════════════════════

INSERT INTO hero_slides (ordre, titre_fr, photo, id_produit, badge, actif) VALUES
(1, 'Yaya, la réversible', 'images/HERO_01.jpg', 'PROD_18', 'BESTSELLER', true),
(2, 'Armelia, l''icône',   'images/HERO_02.jpg', 'PROD_16', 'EXCLUSIF',   true),
(3, 'Armelia, la pièce',   'images/HERO_03.jpg', 'PROD_16', 'NOUVEAU',    true),
(4, 'Armelia, le collector','images/HERO_04.jpg','PROD_17', 'EXCLUSIF',   true)
ON CONFLICT DO NOTHING;
