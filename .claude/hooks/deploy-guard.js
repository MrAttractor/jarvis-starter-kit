/**
 * deploy-guard.js — Gardien de déploiement Attractor Assists
 * Déclenché après chaque git push via hook PostToolUse.
 * Scanne la structure de l'app et signale les problèmes sans bloquer.
 */

const fs   = require('fs');
const path = require('path');

// Lire l'input du tool Bash depuis stdin (format JSON Claude Code)
let rawInput = '';
process.stdin.on('data', d => rawInput += d);
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(rawInput || '{}');
    const cmd = (payload.tool_input?.command || payload.command || '').toLowerCase();
    if (!cmd.includes('git push')) process.exit(0);
  } catch {
    // Fallback : vérifier CLAUDE_TOOL_INPUT
    const env = (process.env.CLAUDE_TOOL_INPUT || '').toLowerCase();
    if (!env.includes('git push')) process.exit(0);
  }
  runGuard();
});

// Timeout safety : si stdin ne se ferme pas, on part en runGuard après 500ms
setTimeout(() => {
  const env = (process.env.CLAUDE_TOOL_INPUT || '').toLowerCase();
  if (!env.includes('git push')) process.exit(0);
  runGuard();
}, 500);

function runGuard() {
  const ROOT  = path.resolve(__dirname, '../../livrables/ecosysteme-attractor/attractor-assists/app/src');
  const issues   = [];
  const warnings = [];

  // ── 1. Imports App.jsx → fichiers screens ──────────────────────────────────
  try {
    const appContent = fs.readFileSync(path.join(ROOT, 'App.jsx'), 'utf8');
    const importRe = /import\s*\{[^}]+\}\s*from\s*['"]\.\/screens\/(\w+)['"]/g;
    let m;
    while ((m = importRe.exec(appContent)) !== null) {
      const screenFile = path.join(ROOT, 'screens', `${m[1]}.jsx`);
      if (!fs.existsSync(screenFile)) {
        issues.push(`App.jsx importe screens/${m[1]}.jsx mais le fichier n'existe pas`);
      }
    }
  } catch (e) {
    warnings.push(`Impossible de lire App.jsx : ${e.message}`);
  }

  // ── 2. Encodage — caractères garbled ──────────────────────────────────────
  const GARBLED = ['Ã©', 'Ã¨', 'Ã ', 'â€"', 'â€™'];
  const screensDir = path.join(ROOT, 'screens');
  try {
    fs.readdirSync(screensDir).filter(f => f.endsWith('.jsx')).forEach(file => {
      const content = fs.readFileSync(path.join(screensDir, file), 'utf8');
      const found = GARBLED.filter(g => content.includes(g));
      if (found.length) {
        issues.push(`${file} : caractères garbled détectés (encodage) — ${found.join(', ')}`);
      }
    });
  } catch (e) {
    warnings.push(`Impossible de scanner screens/ : ${e.message}`);
  }

  // ── 3. Routes App.jsx → screens enregistrés ───────────────────────────────
  try {
    const appContent = fs.readFileSync(path.join(ROOT, 'App.jsx'), 'utf8');
    const routeRe = /^\s+(\w+):\s+</gm;
    let rm;
    const screenFiles = new Set(
      fs.readdirSync(screensDir)
        .filter(f => f.endsWith('.jsx'))
        .map(f => f.toLowerCase().replace('.jsx', ''))
    );
    while ((rm = routeRe.exec(appContent)) !== null) {
      const route = rm[1].toLowerCase();
      if (route === 'screens') continue;
      // Routes connues qui n'ont pas de fichier dédié (ex: conversation, agenda…)
      const knownNoFile = new Set(['conversation', 'axes', 'broadcasts', 'paliers', 'agenda',
        'notifications', 'admin', 'methode', 'install', 'mastersheet', 'discovery', 'activation']);
      if (!screenFiles.has(route) && !screenFiles.has(route + 'screen') && !knownNoFile.has(route)) {
        warnings.push(`App.jsx : route "${rm[1]}" sans fichier screen évident`);
      }
    }
  } catch {}

  // ── 4. Rapport ─────────────────────────────────────────────────────────────
  const SEP = '─'.repeat(46);
  console.error(`\n🛡️  GARDIEN DE DÉPLOIEMENT\n${SEP}`);

  if (issues.length === 0 && warnings.length === 0) {
    console.error('✅  Structure OK — aucun problème détecté\n');
  } else {
    if (issues.length) {
      console.error('\n🔴  PROBLÈMES :');
      issues.forEach(i => console.error(`    • ${i}`));
    }
    if (warnings.length) {
      console.error('\n🟡  ATTENTION :');
      warnings.forEach(w => console.error(`    • ${w}`));
    }
    console.error('');
  }

  process.exit(0); // Ne jamais bloquer le push
}
