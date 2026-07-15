// Réorganise dist/ après le build de Vite.
//
// Pourquoi : Cloudflare Pages refuse les réécritures (_redirects en 200) vers un
// fichier .html — il les transforme en redirection 308 vers l'URL « propre », ce qui
// perd la query et donc le slug de la boutique. Vérifié en production :
//   /privacy  → /privacy.html 200  donnait un 308 vers /privacy, soit une boucle
//   /qa-awa   → /boutique/index.html 200  donnait un 308 vers /boutique/ (slug perdu)
//
// La parade est de ne pas dépendre des réécritures : les fichiers réels sont servis
// AVANT _redirects. Donc chaque page a son propre chemin sur le disque.
//
//   dist/index.html            →  /                 la landing publique
//   dist/app/index.html        →  /app              l'app entrepreneur
//   dist/privacy/index.html    →  /privacy          (corrige une boucle qui existait déjà)
//   dist/boutique/index.html   →  /boutique/        la boutique, atteinte via _redirects

import { rename, mkdir, rm, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const existe = async (p) => { try { await access(p); return true; } catch { return false; } };

/** Déplace un fichier plat vers dossier/index.html, pour qu'il soit servi sur /dossier */
async function enDossier(fichier, dossier) {
  const src = join(dist, fichier);
  if (!await existe(src)) return console.warn(`  ignoré (absent) : ${fichier}`);
  await mkdir(join(dist, dossier), { recursive: true });
  await rename(src, join(dist, dossier, 'index.html'));
  console.log(`  /${dossier}  ←  ${fichier}`);
}

// 1. L'app quitte la racine pour /app
if (await existe(join(dist, 'index.html'))) {
  await mkdir(join(dist, 'app'), { recursive: true });
  await rename(join(dist, 'index.html'), join(dist, 'app', 'index.html'));
  console.log('  /app      ←  index.html (app entrepreneur)');
}

// 2. La landing prend la racine
if (await existe(join(dist, 'landing.html'))) {
  await rename(join(dist, 'landing.html'), join(dist, 'index.html'));
  console.log('  /         ←  landing.html');
}

// 3. Les pages légales, en dossier pour éviter la boucle 308
await enDossier('privacy.html', 'privacy');
await enDossier('privacy-delete.html', 'privacy-delete');

// 4. Dossiers hérités d'écrans supprimés : ils occuperaient les slugs
//    « marketplace » et « methode » et masqueraient ces boutiques.
for (const mort of ['marketplace', 'methode']) {
  const p = join(dist, mort);
  if (await existe(p)) { await rm(p, { recursive: true, force: true }); console.log(`  retiré    :  /${mort}`); }
}

console.log('postbuild : dist réorganisé');
