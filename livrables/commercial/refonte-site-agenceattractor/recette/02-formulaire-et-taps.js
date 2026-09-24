const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8777';

(async () => {
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle' });

  // 1. Zone de tap réelle des cases : c'est le label, pas la case.
  const zones = await page.evaluate(() =>
    [...document.querySelectorAll('.choix')].map(l => {
      const b = l.getBoundingClientRect();
      return { texte: l.textContent.trim().slice(0, 28), h: Math.round(b.height), w: Math.round(b.width) };
    })
  );
  const trop_petits = zones.filter(z => z.h < 44);
  console.log('Cases à cocher / boutons radio : ' + zones.length);
  console.log('Hauteur de zone cliquable : ' + [...new Set(zones.map(z => z.h))].join(', ') + ' px');
  console.log(trop_petits.length ? '!! ' + trop_petits.length + ' sous 44 px' : 'Toutes au-dessus de 44 px.');

  // 2. Le clic sur le texte du label coche bien la case
  await page.click('.choix:has-text("Je porte un projet")');
  const coche = await page.isChecked('input[value="Projet sans forme"]');
  console.log('Clic sur le texte du label : ' + (coche ? 'la case se coche' : '!! NE COCHE PAS'));

  // 3. Validation : formulaire vide
  await page.click('#btn-envoi');
  await page.waitForTimeout(200);
  console.log('Envoi à vide → « ' + (await page.textContent('#etat')).trim() + ' »');

  // 4. Email invalide
  await page.fill('#prenom', 'Test');
  await page.fill('#email', 'pas-un-email');
  await page.fill('#declencheur', 'Un texte suffisamment long pour passer la validation.');
  await page.click('#btn-envoi');
  await page.waitForTimeout(200);
  console.log('Email invalide → « ' + (await page.textContent('#etat')).trim() + ' »');

  // 5. Déclencheur trop court
  await page.fill('#email', 'test@exemple.fr');
  await page.fill('#declencheur', 'court');
  await page.click('#btn-envoi');
  await page.waitForTimeout(200);
  console.log('Motif trop court → « ' + (await page.textContent('#etat')).trim() + ' »');

  // 6. Envoi nominal, en interceptant l'appel pour ne pas polluer le pipeline
  let envoye = null;
  await page.route('**/functions/v1/notify-lead', async route => {
    envoye = JSON.parse(route.request().postData());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, dossier: true, erreur_dossier: null })
    });
  });
  await page.fill('#declencheur', "Mon associé est parti la semaine dernière et je dois tout reprendre seul.");
  await page.fill('#situation', "Agence de deux personnes, cinq ans d'activité.");
  await page.fill('#objectif', "Être connu sans avoir à me forcer.");
  await page.check('input[value="echeance"]');
  await page.click('#btn-envoi');
  await page.waitForTimeout(600);

  const confirme = await page.textContent('#form-contact');
  console.log('\nEnvoi nominal → « ' + confirme.trim().split('\n')[0].slice(0, 60) + ' »');
  console.log('\nCe qui part vers le pipeline :');
  ['nom', 'contact', 'besoin', 'type', 'urgent', 'priorite', 'prochaine', 'source'].forEach(k =>
    console.log('   ' + k.padEnd(11) + ' : ' + JSON.stringify(envoye[k]))
  );
  console.log('   contexte    :');
  envoye.contexte.split('\n').forEach(l => console.log('       ' + l));

  // 7. Menu mobile
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const avant = await page.isVisible('.volet a');
  await page.click('label.burger');
  await page.waitForTimeout(200);
  const apres = await page.isVisible('.volet a');
  console.log('\nMenu mobile : fermé au départ = ' + !avant + ', s\'ouvre au tap = ' + apres);

  await nav.close();
})();
