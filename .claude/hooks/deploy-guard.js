/**
 * deploy-guard.js — Gardien de déploiement Attractor Assists
 * Déclenché après chaque git push via hook PostToolUse.
 * Scanne la structure de l'app et signale les problèmes sans bloquer.
 */

const fs   = require('fs');
const path = require('path');

// Lire l'input du tool Bash depuis stdin (format JSON Claude Code)
let rawInput = '';
let dispatched = false;

function extractCmd() {
  try {
    const payload = JSON.parse(rawInput || '{}');
    return (payload.tool_input?.command || payload.command || '').toLowerCase();
  } catch {
    return (process.env.CLAUDE_TOOL_INPUT || '').toLowerCase();
  }
}

// Route selon la commande : git push → audit structure, wrangler → rappel déploiement
function dispatch() {
  if (dispatched) return;
  dispatched = true;
  const cmd = extractCmd();
  if (cmd.includes('wrangler') && cmd.includes('deploy')) return runDeployReminder(cmd);
  if (cmd.includes('git push')) return runGuard();
  process.exit(0);
}

process.stdin.on('data', d => rawInput += d);
process.stdin.on('end', dispatch);

// Timeout safety : si stdin ne se ferme pas, on dispatche après 500ms
setTimeout(dispatch, 500);

// Rappel des pièges de déploiement Cloudflare (déclenché sur commande wrangler)
function runDeployReminder(cmd) {
  const SEP = '─'.repeat(46);
  console.error(`\n🛡️  GARDIEN — DÉPLOIEMENT\n${SEP}`);

  const isPages  = cmd.includes('pages deploy');
  const isDemo   = cmd.includes('demo-agenceattractor') || cmd.includes('demo-site');

  if (isDemo) {
    console.error('    • demo-agenceattractor : branche de prod = MASTER (pas main).');
    console.error('    • C\'est un projet PAGES. Jamais "wrangler deploy" seul (ça vise le Worker homonyme).');
  }
  if (isPages && cmd.includes('--branch=main') && isDemo) {
    console.error('    🔴 --branch=main sur demo-agenceattractor part en PREVIEW, pas en prod.');
  }
  if (isPages) {
    console.error('    • Vérifier la branche de prod : wrangler pages deployment list --project-name=<projet>');
  }
  console.error('    • Après déploiement : tester le VRAI domaine (avec ?v=timestamp), pas juste le "Success".');
  console.error('    • Liens testés, zéro débordement horizontal, résidus de template éliminés.');
  console.error('    → Détail : .claude/skills/gardien/references/checklist-deploiement.md\n');
  process.exit(0);
}

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
