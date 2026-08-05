-- ============================================================
-- Club Privé Élévia — ouverture à tous les pays
--
-- Décision de la Cliente (05/08/2026) : l'inscription est ouverte au monde
-- entier, pour ne pas écarter une diaspora en restreignant la liste.
--
-- On conserve DEUX colonnes, et ce n'est pas une redondance :
--   pays      = le nom affiché, tel que le membre l'a vu au moment de choisir ;
--   pays_code = le code ISO 3166-1 alpha-2, stable, qui servira au filtre
--               « zone géographique » de la découverte (CDC, Module 3) et à une
--               éventuelle traduction de l'interface (feuille de route V3).
-- Un nom de pays peut changer de graphie, un code ISO non.
-- ============================================================

alter table public.el_membres
  add column if not exists pays_code text;

alter table public.el_membres drop constraint if exists el_membres_pays_code_forme;
alter table public.el_membres add constraint el_membres_pays_code_forme
  check (pays_code is null or pays_code ~ '^[A-Z]{2}$');

create index if not exists el_membres_pays_idx on public.el_membres(pays_code);

-- Rattrapage des deux comptes créés avant l'ouverture (tests internes).
update public.el_membres set pays_code = 'BE' where pays = 'Belgique' and pays_code is null;
update public.el_membres set pays_code = 'FR' where pays = 'France'   and pays_code is null;

comment on column public.el_membres.pays_code is
  'Code ISO 3166-1 alpha-2. Sert au filtre par zone (Module 3) ; le nom affiché vit dans pays.';
