/* ═══════════════════════════════════════════════════════════════════════
   LE TEST DE CHARGE DE L'INSCRIPTION
   ───────────────────────────────────────────────────────────────────────
   Dernier point bloquant du contre-audit du 18/09 : le chemin d'ECRITURE
   n'avait jamais ete mesure au-dela de 12 appels simultanes, alors que le
   pic attendu au lancement est de 200. Il ne l'avait pas ete pour une
   bonne raison : s'inscrire CREE UN COMPTE, et mesurer la charge en
   production voulait dire fabriquer des centaines de faux fans.

   ── L'INSTRUMENT, ET POURQUOI CELUI-LA ────────────────────────────────
   Premiere version, le 19/09 : 200 appels lances d'un coup avec `fetch`.
   Elle montrait 38 pannes sur 200 et un effondrement du debit a partir de
   100. C'etait FAUX, et le temoin l'a prouve : un fichier statique servi
   par Cloudflare, qui ne peut pas etre sature par 200 requetes, echouait
   13 fois sur 200 depuis ce meme poste, avec la meme erreur de connexion
   et le meme debit de 19/s. Le plafond mesure etait celui du POSTE, pas
   celui du serveur.

   D'ou cette version. Elle n'ouvre pas une connexion par appel : elle
   garde un petit nombre de connexions ouvertes et y fait passer les
   requetes les unes apres les autres, en continu, pendant une duree
   fixee. On mesure alors ce qu'on cherche — le DEBIT que le serveur
   soutient — et non la capacite d'un ordinateur portable a ouvrir des
   sockets.

   REGLE GENERALE, et elle vaut pour tout test de charge : avant de
   conclure qu'un serveur plafonne, lancer la meme charge sur une cible
   qui ne peut pas plafonner. Si elle tombe aussi, c'est l'instrument.

   ── LES DEUX TEMPS ────────────────────────────────────────────────────
   Temps 1, SANS ECRIRE. On envoie un numero deja inscrit. La requete
   traverse tout : le reveil de la fonction, la lecture du corps, les trois
   validations, et la RECHERCHE en base sur la colonne du numero. Tout
   sauf l'ecriture. Aucune ligne creee.

   Temps 2, EN ECRIVANT, a la taille du pic attendu. Les comptes fabriques
   portent un numero en +999, un indicatif que l'UIT n'attribue a aucun
   pays : il ne peut JAMAIS appartenir a un vrai fan, et le menage se fait
   sur ce seul critere, sans risque de se tromper de ligne.

   CE QUE LA MESURE NE DIT PAS. Elle part d'ici, en France. Un fan a
   Abidjan ajoute sa propre latence, que ce test ne voit pas. On mesure le
   plafond du SERVEUR, pas le temps ressenti.

     node charge-inscription.js          les deux temps
     node charge-inscription.js lecture  le temps 1 seul, aucune ecriture
   ═══════════════════════════════════════════════════════════════════════ */

const https = require('https');
const fs = require('fs'), path = require('path');

const page = fs.readFileSync(path.join(__dirname, 'site', 'public', 'fan.html'), 'utf8');
const SB_URL = (page.match(/SB_URL\s*=\s*"([^"]+)"/) || [])[1];
const SB_ANON = (page.match(/SB_ANON\s*=\s*"([^"]+)"/) || [])[1];
if (!SB_URL || !SB_ANON) { console.error('Adresse ou cle introuvable dans fan.html'); process.exit(2); }

const hote = new URL(SB_URL).hostname;
const CHEMIN = '/functions/v1/bey-public';

/* Un numero deja en base, pour le temps 1 : la recherche ira donc jusqu'au
   bout, comme pour un vrai fan qui se reinscrit. */
const NUMERO_CONNU = '+2250709543355';
/* L'indicatif +999 n'est attribue a aucun pays. */
const MARQUEUR = '+999';

const PALIERS = [5, 10, 20, 40, 60];
const SECONDES_PAR_PALIER = 12;
const PIC_ECRITURE = 200;

function envoyer(agent, corps) {
  return new Promise((resolve) => {
    const charge = Buffer.from(JSON.stringify(corps));
    const t0 = Date.now();
    const req = https.request({
      agent, hostname: hote, path: CHEMIN, method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'Content-Length': charge.length,
        apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON,
      },
    }, (res) => {
      let t = '';
      res.on('data', (c) => { t += c; });
      res.on('end', () => {
        let ok = false, erreur = null, corpsRecu = null;
        try { const j = JSON.parse(t); ok = j.ok === true; erreur = j.error || j.code || null; corpsRecu = j; }
        catch (_) { erreur = 'reponse illisible'; }
        resolve({ ms: Date.now() - t0, statut: res.statusCode, ok, erreur, corps: corpsRecu });
      });
    });
    req.on('error', (e) => resolve({ ms: Date.now() - t0, statut: 0, ok: false, erreur: e.code || e.message }));
    req.setTimeout(30000, () => { req.destroy(); });
    req.end(charge);
  });
}

const centile = (l, p) => { const s = [...l].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

function rapporter(titre, res, secondes) {
  const ms = res.map(r => r.ms);
  const pannes = res.filter(r => r.statut === 0 || r.statut >= 500);
  const parErreur = {};
  res.forEach(r => { if (r.erreur) parErreur[r.erreur] = (parErreur[r.erreur] || 0) + 1; });
  console.log('  ' + titre.padEnd(18)
    + String(res.length).padStart(5) + ' appels'
    + ' · ' + (res.length / secondes).toFixed(0).padStart(4) + '/s'
    + ' · median ' + String(centile(ms, 0.5)).padStart(5) + ' ms'
    + ' · 95e ' + String(centile(ms, 0.95)).padStart(5) + ' ms'
    + ' · pannes ' + pannes.length);
  const codes = Object.entries(parErreur).map(([k, v]) => k.slice(0, 44) + ' x' + v).join(' | ');
  if (codes) console.log('    ' + ' '.repeat(16) + codes);
  return { debit: res.length / secondes, median: centile(ms, 0.5), p95: centile(ms, 0.95), pannes: pannes.length };
}

/* Un palier : N ouvriers qui bouclent pendant la duree fixee, chacun sur
   sa connexion gardee ouverte. Le debit obtenu est celui du serveur. */
async function palier(n, secondes, fabriquer) {
  const agent = new https.Agent({ keepAlive: true, maxSockets: n, maxFreeSockets: n });
  const res = [];
  const fin = Date.now() + secondes * 1000;
  let i = 0;
  const ouvrier = async () => { while (Date.now() < fin) res.push(await envoyer(agent, fabriquer(i++))); };
  const t0 = Date.now();
  await Promise.all(Array.from({ length: n }, ouvrier));
  agent.destroy();
  return { res, secondes: (Date.now() - t0) / 1000 };
}

(async () => {
  console.log('\nTest de charge de l\'inscription — ' + hote + CHEMIN);
  console.log('Connexions gardees ouvertes, ' + SECONDES_PAR_PALIER + ' s par palier.\n');

  console.log('TEMPS 1 · le chemin complet SANS ecrire\n');
  const lecture = [];
  for (const n of PALIERS) {
    const { res, secondes } = await palier(n, SECONDES_PAR_PALIER, () => ({
      action: 'join', prenom: 'Charge', whatsapp: NUMERO_CONNU, lieu: 'Abidjan',
    }));
    lecture.push({ n, ...rapporter(n + ' connexions', res, secondes) });
    await new Promise(r => setTimeout(r, 1500));
  }

  const meilleur = lecture.reduce((a, b) => (b.debit > a.debit ? b : a));
  console.log('\n  Debit le plus eleve : ' + meilleur.debit.toFixed(0) + '/s a ' + meilleur.n + ' connexions.');

  if (process.argv[2] === 'lecture') {
    console.log('  Arret demande. Aucune ligne creee.\n');
    return;
  }

  console.log('\nTEMPS 2 · ' + PIC_ECRITURE + ' inscriptions REELLES\n');
  const agent = new https.Agent({ keepAlive: true, maxSockets: 40, maxFreeSockets: 40 });
  const base = MARQUEUR + String(Date.now()).slice(-6);
  const t0 = Date.now();
  const res = await Promise.all(Array.from({ length: PIC_ECRITURE }, (_, i) =>
    envoyer(agent, {
      action: 'join', prenom: 'ChargeTest',
      whatsapp: base + String(i).padStart(3, '0'), lieu: 'Autre pays',
    })));
  agent.destroy();
  const ecriture = rapporter(PIC_ECRITURE + ' inscriptions', res, (Date.now() - t0) / 1000);
  const crees = res.filter(r => r.ok).length;
  console.log('\n  comptes reellement crees : ' + crees + ' / ' + PIC_ECRITURE);

  console.log('\n  ── LE MENAGE, a lancer dans le SQL Editor ──\n');
  console.log("    delete from public.bey_membres where whatsapp like '" + MARQUEUR + "%';");
  console.log("    select count(*) as restants from public.bey_membres where whatsapp like '" + MARQUEUR + "%';");
  console.log("    select count(*) as membres from public.bey_membres;\n");
  /* ── TEMPS 3 · LE CAS QUI COMPTE VRAIMENT ──
     Les 200 inscriptions ci-dessus n'avaient AUCUN parrain. Au lancement
     elles en auront presque toutes un, et elles ecriront toutes sur LA MEME
     LIGNE : celle de l'Ambassadeur dont le lien circule sur WhatsApp. C'est
     le seul endroit ou la base met les appels en file, depuis la migration
     0011 qui a rendu l'increment atomique. C'est donc la, et nulle part
     ailleurs, que la contention peut apparaitre.

     Un parrainage perdu ne leve aucune erreur : il disparait, simplement.
     La preuve ne peut donc pas etre « zero panne », elle doit etre « le
     compteur vaut EXACTEMENT 200 ». */
  console.log('\nTEMPS 3 · ' + PIC_ECRITURE + ' inscriptions SUR LE MEME LIEN de parrainage\n');
  const agent3 = new https.Agent({ keepAlive: true, maxSockets: 40, maxFreeSockets: 40 });
  const parrain = await envoyer(agent3, {
    action: 'join', prenom: 'ChargeParrain',
    whatsapp: MARQUEUR + String(Date.now()).slice(-6) + '99', lieu: 'Autre pays',
  });
  const code = parrain.ok && parrain.corps && parrain.corps.membre
    ? parrain.corps.membre.code_ambassadeur : null;

  if (!code) {
    console.log('  Parrain de test impossible a creer (' + (parrain.erreur || parrain.statut) + '). Temps 3 abandonne.');
    agent3.destroy();
  } else {
    const base3 = MARQUEUR + String(Date.now()).slice(-6);
    const t3 = Date.now();
    const res3 = await Promise.all(Array.from({ length: PIC_ECRITURE }, (_, i) =>
      envoyer(agent3, {
        action: 'join', prenom: 'ChargeFilleul',
        whatsapp: base3 + String(i).padStart(3, '0'), lieu: 'Autre pays', ref: code,
      })));
    agent3.destroy();
    rapporter(PIC_ECRITURE + ' filleuls', res3, (Date.now() - t3) / 1000);
    console.log('\n  Parrain de test : ' + code);
    console.log('  Son compteur doit valoir EXACTEMENT ' + PIC_ECRITURE + '. Un seul de moins,');
    console.log('  et le verrou de la migration 0011 lache sous charge.\n');
    console.log("    select prenom, code_ambassadeur, grade, filleuls as compteur,");
    console.log("           (select count(*) from public.bey_membres f");
    console.log("              where f.parraine_par = m.code_ambassadeur) as filleuls_reels");
    console.log("      from public.bey_membres m where m.code_ambassadeur = '" + code + "';\n");
  }

  console.log('  ' + (ecriture.pannes === 0
    ? 'Aucune panne : sous charge le systeme ralentit, il ne casse pas.'
    : ecriture.pannes + ' pannes : le plafond d\'ecriture est atteint.'));
  console.log('');
})();
