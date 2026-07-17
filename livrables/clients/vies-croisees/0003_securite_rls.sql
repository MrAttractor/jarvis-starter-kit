-- ============================================================================
-- Vies Croisées — fermeture des accès publics (17/07/2026)
--
-- Contexte : le site utilisait un contrôle d'accès écrit dans le navigateur
-- (comparaison du mot de passe en JS) adossé à des policies `public true`.
-- La clé anon étant publique par nature (elle est dans le code source de la
-- page), ce contrôle n'existait pas :
--   * vc_config exposait le mot de passe admin EN CLAIR en lecture publique,
--     et le laissait modifiable par n'importe qui (verrouillage possible) ;
--   * vc_articles et vc_episodes étaient en ALL public : n'importe qui pouvait
--     publier, modifier ou supprimer les contenus en production ;
--   * vc_abonnes (contacts), vc_temoignages et vc_commentaires étaient
--     lisibles et supprimables publiquement.
--
-- Correctif : l'authentification passe sur Supabase Auth (compte d'Andréa),
-- les policies sont scopées à son UID, vc_config disparaît.
-- ============================================================================

-- UID du compte admin d'Andréa (admin.vies-croisees@agenceattractor.com)
-- Créé le 17/07/2026. Rebasculable sur son email perso via "mot de passe oublié".

-- ----------------------------------------------------------------------------
-- 1. Purge des anciennes policies publiques
-- ----------------------------------------------------------------------------
drop policy if exists "vc_ep_read"     on vc_episodes;
drop policy if exists "vc_ep_write"    on vc_episodes;
drop policy if exists "vc_art_read"    on vc_articles;
drop policy if exists "vc_art_write"   on vc_articles;
drop policy if exists "vc_com_read"    on vc_commentaires;
drop policy if exists "vc_com_insert"  on vc_commentaires;
drop policy if exists "vc_com_update"  on vc_commentaires;
drop policy if exists "vc_com_delete"  on vc_commentaires;
drop policy if exists "vc_temo_admin"  on vc_temoignages;
drop policy if exists "vc_temo_insert" on vc_temoignages;
drop policy if exists "vc_temo_update" on vc_temoignages;
drop policy if exists "vc_ab_admin"    on vc_abonnes;
drop policy if exists "vc_ab_insert"   on vc_abonnes;
drop policy if exists "vc_ab_delete"   on vc_abonnes;

-- ----------------------------------------------------------------------------
-- 2. ÉPISODES — le public ne voit que ce qui est publié ou programmé
-- ----------------------------------------------------------------------------
create policy "vc_ep_public_read" on vc_episodes
  for select using (statut in ('publie', 'programme'));

create policy "vc_ep_admin" on vc_episodes
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 3. ARTICLES — le public ne voit que les articles publiés
--    (un brouillon n'est plus lisible avant sa publication)
-- ----------------------------------------------------------------------------
create policy "vc_art_public_read" on vc_articles
  for select using (statut = 'publie');

create policy "vc_art_admin" on vc_articles
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 4. COMMENTAIRES — lecture publique des seuls commentaires approuvés.
--    L'insertion publique force visible = false : la modération d'Andréa ne
--    peut plus être contournée en postant directement un commentaire visible.
-- ----------------------------------------------------------------------------
create policy "vc_com_public_read" on vc_commentaires
  for select using (visible = true);

create policy "vc_com_public_insert" on vc_commentaires
  for insert with check (visible = false);

create policy "vc_com_admin" on vc_commentaires
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 5. TÉMOIGNAGES — dépôt public, lecture réservée à Andréa.
--    Ce sont des récits personnels : ils n'ont jamais à être lisibles par tous.
-- ----------------------------------------------------------------------------
create policy "vc_temo_public_insert" on vc_temoignages
  for insert with check (traite = false or traite is null);

create policy "vc_temo_admin" on vc_temoignages
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 6. ABONNÉS — inscription publique, lecture réservée à Andréa.
--    `contact` est un email ou un numéro : donnée personnelle (RGPD).
-- ----------------------------------------------------------------------------
create policy "vc_ab_public_insert" on vc_abonnes
  for insert with check (true);

create policy "vc_ab_admin" on vc_abonnes
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 7. vc_config disparaît — le mot de passe est désormais géré par Supabase Auth
--    (haché, jamais exposé). Plus aucun secret ne transite par une table.
-- ----------------------------------------------------------------------------
drop table if exists vc_config;
