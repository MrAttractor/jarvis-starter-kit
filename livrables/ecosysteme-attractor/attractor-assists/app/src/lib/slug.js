// Slug de boutique : normalisation + disponibilité.
//
// La liste des slugs réservés vit en base (table `reserved_slugs`, migration 0053)
// et n'est PAS dupliquée ici : la RPC `slug_available` vérifie la forme, les mots
// réservés et l'unicité en un seul appel. Une deuxième liste côté client finirait
// par diverger de celle du serveur, exactement comme les templates ont divergé.
//
// Le serveur reste l'autorité : un trigger sur `profiles.public_slug` rejette les
// slugs réservés même quand l'écriture ne passe pas par ces écrans
// (`generate-client-assistant` crée des slugs sans voir l'UI).

import { supabase } from './supabase';

/** Met la saisie à la forme acceptée par la base : ^[a-z0-9][a-z0-9-]{1,19}$ */
export function normalizeSlug(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+/, '')
    .slice(0, 20);
}

/**
 * Le slug est-il utilisable ?
 * @returns {Promise<{ok: boolean, error: string|null}>} error = message affichable
 */
export async function checkSlug(slug) {
  if (!slug || slug.length < 3) return { ok: false, error: 'Trois caractères minimum.' };

  const { data, error } = await supabase.rpc('slug_available', { p_slug: slug });

  // Réseau coupé ou RPC absente : ne pas prétendre que le nom est libre.
  if (error) return { ok: false, error: 'Vérification impossible. Réessaie.' };
  if (!data)  return { ok: false, error: 'Ce nom est déjà pris ou réservé. Essaie autre chose.' };

  return { ok: true, error: null };
}
