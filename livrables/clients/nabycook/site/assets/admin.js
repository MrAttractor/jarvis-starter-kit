/* ============================================================
   NABYCOOK — Espace de pilotage de Nabintou
   Depend de assets/config.js (objet NABY). Aucune dependance externe.

   Regle de construction : tout est fabrique par createElement et
   textContent, jamais par innerHTML avec des donnees. Un nom de
   partenaire ou un temoignage colle depuis un traitement de texte
   ne doit pas pouvoir devenir du code.
   ============================================================ */
(function () {
  'use strict';

  var URL_BASE = NABY.base.url;
  var CLE = NABY.base.cle;
  var CLE_SESSION = 'naby_session';

  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var session = null;

  /* ---------- Petits messages en bas d'ecran ---------- */
  var minuteur = null;
  function etat(msg, rate) {
    var e = q('#etat');
    e.textContent = msg;
    e.className = 'etat' + (rate ? ' rate' : '');
    e.hidden = false;
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { e.hidden = true; }, rate ? 6000 : 3000);
  }

  /* ---------- Session ---------- */
  function lireSession() {
    try { return JSON.parse(localStorage.getItem(CLE_SESSION)); } catch (e) { return null; }
  }
  function ecrireSession(s) {
    session = s;
    localStorage.setItem(CLE_SESSION, JSON.stringify(s));
  }
  function oublierSession() {
    session = null;
    localStorage.removeItem(CLE_SESSION);
  }

  function connecter(email, mdp) {
    return fetch(URL_BASE + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: CLE, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: mdp }),
    }).then(function (r) { return r.json(); });
  }

  function rafraichir() {
    if (!session || !session.refresh_token) return Promise.resolve(false);
    return fetch(URL_BASE + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: CLE, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.access_token) { ecrireSession(d); return true; }
        return false;
      }).catch(function () { return false; });
  }

  /* ---------- Appels a la base ----------
     Une seule tentative de renouvellement en cas de 401 : si le jeton
     est definitivement perime, on renvoie a l'ecran de connexion plutot
     que de boucler en silence.
  -------------------------------------- */
  function api(chemin, options, deuxieme) {
    var o = options || {};
    var h = {
      apikey: CLE,
      Authorization: 'Bearer ' + (session ? session.access_token : ''),
      'Content-Type': 'application/json',
      Prefer: o.prefer || 'return=representation',
    };
    return fetch(URL_BASE + '/rest/v1/' + chemin, {
      method: o.method || 'GET',
      headers: h,
      body: o.body ? JSON.stringify(o.body) : undefined,
    }).then(function (r) {
      if (r.status === 401 && !deuxieme) {
        return rafraichir().then(function (ok) {
          if (ok) return api(chemin, options, true);
          deconnecter();
          throw new Error('session expiree');
        });
      }
      if (!r.ok) {
        return r.text().then(function (t) { throw new Error(t || ('erreur ' + r.status)); });
      }
      return r.status === 204 ? [] : r.json();
    });
  }

  /* ---------- Description des sections ----------
     Un seul endroit decrit les champs. Ajouter une colonne se fait ici,
     pas dans six fonctions differentes.
  --------------------------------------------- */
  var SECTIONS = {
    agenda: {
      table: 'nb_agenda',
      tri: 'date_tri.asc.nullslast',
      titre: function (l) { return l.type || 'Rendez-vous'; },
      neuf: { date_texte: '', type: '', lieu: '', description: '', lien: '', publie: true },
      rangeable: false,
      champs: [
        { c: 'date_texte', l: 'Quand ? (tel que ça s\'affichera)', ph: '5 septembre 2026', large: false },
        { c: 'date_tri', l: 'Date, pour le classement', type: 'date', large: false },
        { c: 'type', l: 'Type de rendez-vous', ph: 'Forum des associations', large: false },
        { c: 'lieu', l: 'Où ?', ph: 'Mairie du 20e, Paris', large: false },
        { c: 'description', l: 'Une phrase de présentation (facultatif)', zone: true, large: true },
        { c: 'lien', l: 'Lien d\'inscription (facultatif)', ph: 'https://…', large: true },
      ],
      colonnes: 'deux',
    },
    historique: {
      table: 'nb_historique',
      tri: 'rang.asc',
      titre: function (l) { return (l.annee || '') + ' · ' + (l.titre || 'Étape'); },
      neuf: { annee: '', titre: '', description: '', rang: 0, publie: true },
      rangeable: true,
      champs: [
        { c: 'annee', l: 'Année', ph: '2023', large: false },
        { c: 'titre', l: 'L\'étape en quelques mots', ph: 'Les premiers ateliers', large: false },
        { c: 'description', l: 'Le détail (facultatif)', zone: true, large: true },
      ],
      colonnes: 'deux',
    },
    partenaires: {
      table: 'nb_partenaires',
      tri: 'rang.asc',
      titre: function (l) { return l.nom || 'Partenaire'; },
      neuf: { nom: '', logo: '', rang: 0, publie: true },
      rangeable: true,
      champs: [
        { c: 'nom', l: 'Nom de la structure', ph: 'Mairie du 20e', large: false },
        { c: 'logo', l: 'Adresse du logo (facultatif)', ph: 'assets/partenaires/…', large: false },
      ],
      colonnes: 'deux',
    },
    temoignages: {
      table: 'nb_temoignages',
      tri: 'rang.asc',
      titre: function (l) { return l.auteur || 'Témoignage'; },
      neuf: { texte: '', auteur: '', role: '', rang: 0, publie: true },
      rangeable: true,
      champs: [
        { c: 'texte', l: 'Ce que la personne dit', zone: true, large: true },
        { c: 'auteur', l: 'Son prénom', ph: 'Fatou K.', large: false },
        { c: 'role', l: 'En quelle qualité elle parle', ph: 'Participante atelier', large: false },
      ],
      colonnes: 'deux',
    },
    presse: {
      table: 'nb_presse',
      tri: 'rang.asc',
      titre: function (l) { return l.source || 'Parution'; },
      neuf: { source: '', citation: '', url: '', rang: 0, publie: true },
      rangeable: true,
      champs: [
        { c: 'source', l: 'Le média', ph: 'Le Parisien', large: false },
        { c: 'url', l: 'Lien vers l\'article (facultatif)', ph: 'https://…', large: false },
        { c: 'citation', l: 'La phrase à mettre en avant', zone: true, large: true },
      ],
      colonnes: 'deux',
    },
  };

  /* ---------- Fabrication d'un champ ---------- */
  function champ(def, valeur, onChange) {
    var d = document.createElement('div');
    d.className = 'champ';
    if (def.large) d.style.gridColumn = '1 / -1';

    var id = 'c' + Math.abs(def.c.length * 7 + def.l.length * 13) + '-' + def.c;
    var lab = document.createElement('label');
    lab.setAttribute('for', id);
    lab.textContent = def.l;
    d.appendChild(lab);

    var el = document.createElement(def.zone ? 'textarea' : 'input');
    el.id = id;
    if (!def.zone) el.setAttribute('type', def.type || 'text');
    if (def.ph) el.setAttribute('placeholder', def.ph);
    el.value = valeur == null ? '' : valeur;
    el.addEventListener('input', function () { onChange(def.c, el.value); });
    d.appendChild(el);
    return d;
  }

  /* ---------- Fabrication d'une fiche ---------- */
  function fiche(nom, ligne, index, total) {
    var S = SECTIONS[nom];
    var modif = {};

    var f = document.createElement('div');
    f.className = 'fiche' + (ligne.publie === false ? ' depubliee' : '');

    var t = document.createElement('h3');
    t.textContent = S.titre(ligne);
    f.appendChild(t);

    var g = document.createElement('div');
    g.className = 'fiche-grille ' + (S.colonnes || 'deux');
    S.champs.forEach(function (def) {
      g.appendChild(champ(def, ligne[def.c], function (c, v) { modif[c] = v; }));
    });
    f.appendChild(g);

    var pied = document.createElement('div');
    pied.className = 'fiche-pied';

    var bEnr = document.createElement('button');
    bEnr.type = 'button';
    bEnr.className = 'bouton bouton-1';
    bEnr.textContent = 'Enregistrer';
    bEnr.addEventListener('click', function () {
      if (!Object.keys(modif).length) { etat('Rien à enregistrer.'); return; }
      if (modif.date_tri === '') modif.date_tri = null;
      api(S.table + '?id=eq.' + ligne.id, { method: 'PATCH', body: modif })
        .then(function () { etat('Enregistré.'); charger(nom); })
        .catch(function (e) { etat('Impossible d\'enregistrer. ' + e.message, true); });
    });
    pied.appendChild(bEnr);

    var bPub = document.createElement('button');
    bPub.type = 'button';
    bPub.className = 'bouton bouton-2';
    bPub.textContent = ligne.publie === false ? 'Publier' : 'Retirer du site';
    bPub.addEventListener('click', function () {
      api(S.table + '?id=eq.' + ligne.id, { method: 'PATCH', body: { publie: ligne.publie === false } })
        .then(function () {
          etat(ligne.publie === false ? 'C\'est publié.' : 'Retiré du site.');
          charger(nom);
        })
        .catch(function (e) { etat('Impossible. ' + e.message, true); });
    });
    pied.appendChild(bPub);

    var bSup = document.createElement('button');
    bSup.type = 'button';
    bSup.className = 'bouton bouton-danger';
    bSup.textContent = 'Supprimer';
    bSup.addEventListener('click', function () {
      if (!window.confirm('Supprimer définitivement « ' + S.titre(ligne) + ' » ?\n\nCette action ne peut pas être annulée. Pour le retirer du site sans le perdre, utilisez plutôt « Retirer du site ».')) return;
      api(S.table + '?id=eq.' + ligne.id, { method: 'DELETE', prefer: 'return=minimal' })
        .then(function () { etat('Supprimé.'); charger(nom); })
        .catch(function (e) { etat('Impossible de supprimer. ' + e.message, true); });
    });
    pied.appendChild(bSup);

    if (S.rangeable) {
      var r = document.createElement('div');
      r.className = 'rang';
      [['↑', -1, index > 0], ['↓', 1, index < total - 1]].forEach(function (b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = b[0];
        btn.setAttribute('aria-label', b[1] < 0 ? 'Monter' : 'Descendre');
        btn.disabled = !b[2];
        if (!b[2]) btn.style.opacity = '.35';
        btn.addEventListener('click', function () { deplacer(nom, index, b[1]); });
        r.appendChild(btn);
      });
      pied.appendChild(r);
    }

    f.appendChild(pied);
    return f;
  }

  /* ---------- Ordre d'affichage ----------
     Les rangs sont reecrits en entier a chaque deplacement. C'est plus
     d'ecritures, mais ca repare aussi les rangs en double herites d'un
     import ou d'une suppression.
  -------------------------------------- */
  var cache = {};

  function deplacer(nom, index, sens) {
    var lignes = cache[nom].slice();
    var cible = index + sens;
    if (cible < 0 || cible >= lignes.length) return;
    var tmp = lignes[index];
    lignes[index] = lignes[cible];
    lignes[cible] = tmp;

    Promise.all(lignes.map(function (l, i) {
      return api(SECTIONS[nom].table + '?id=eq.' + l.id, { method: 'PATCH', body: { rang: i + 1 } });
    })).then(function () { charger(nom); })
      .catch(function (e) { etat('Impossible de réordonner. ' + e.message, true); });
  }

  /* ---------- Les demandes de partenariat ----------
     En lecture seule sur le fond : elle ne modifie pas ce qu'un
     commercant a ecrit. Elle change seulement l'etat du dossier
     et ajoute sa note.
  ----------------------------------------------- */
  var STATUTS = [
    ['nouvelle', 'Nouvelle'],
    ['en cours', 'En cours'],
    ['acceptee', 'Acceptée'],
    ['refusee', 'Refusée'],
  ];

  function ligneInfo(parent, etiquette, valeur) {
    if (!valeur || (Array.isArray(valeur) && !valeur.length)) return;
    var p = document.createElement('p');
    var k = document.createElement('strong');
    k.textContent = etiquette + ' : ';
    p.appendChild(k);
    p.appendChild(document.createTextNode(
      Array.isArray(valeur) ? valeur.join(', ') : valeur));
    parent.appendChild(p);
  }

  function chargerDemandes() {
    var boite = q('#liste-demandes');
    return api('nb_demandes?select=*&order=recue_le.desc').then(function (lignes) {
      cache.demandes = lignes;

      var neuves = lignes.filter(function (l) { return l.statut === 'nouvelle'; }).length;
      var past = q('#pastille-demandes');
      past.textContent = neuves || '';
      past.hidden = !neuves;

      boite.innerHTML = '';
      if (!lignes.length) {
        var v = document.createElement('p');
        v.className = 'aide';
        v.textContent = 'Aucune demande pour l\'instant. Elles arriveront ici dès qu\'un magasin remplira le formulaire de la page Contact.';
        boite.appendChild(v);
        return;
      }

      lignes.forEach(function (l) {
        var f = document.createElement('div');
        f.className = 'fiche' + (l.statut === 'nouvelle' ? ' neuve' : '');

        var t = document.createElement('h3');
        t.textContent = l.enseigne;
        f.appendChild(t);

        var d = document.createElement('p');
        d.className = 'aide';
        var quand = new Date(l.recue_le);
        d.textContent = 'Reçue le ' + quand.toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        }) + ' à ' + quand.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        f.appendChild(d);

        var corps = document.createElement('div');
        corps.className = 'demande-corps';
        ligneInfo(corps, 'Type de commerce', l.type_commerce);
        ligneInfo(corps, 'Adresse', l.adresse);
        ligneInfo(corps, 'Fréquentation', l.frequentation);
        ligneInfo(corps, 'Contact', l.contact_nom);
        ligneInfo(corps, 'Format souhaité', l.formats);
        ligneInfo(corps, 'Fréquence', l.frequence);
        ligneInfo(corps, 'Dates', l.dates);
        ligneInfo(corps, 'Thèmes', l.themes);
        ligneInfo(corps, 'Ce qu\'ils apportent', l.apports);
        ligneInfo(corps, 'Budget', l.budget);
        ligneInfo(corps, 'Nous ont connus par', l.origine);
        f.appendChild(corps);

        // Repondre en un geste, sans recopier l'adresse a la main.
        var joindre = document.createElement('div');
        joindre.className = 'joindre';
        var mail = document.createElement('a');
        mail.className = 'bouton bouton-1';
        mail.setAttribute('href', 'mailto:' + l.contact_email +
          '?subject=' + encodeURIComponent('Votre demande de partenariat avec NabyCook') +
          '&body=' + encodeURIComponent('Bonjour ' + l.contact_nom + ',\n\n'));
        mail.textContent = 'Répondre par email';
        joindre.appendChild(mail);

        if (l.contact_tel) {
          var tel = document.createElement('a');
          tel.className = 'bouton bouton-2';
          tel.setAttribute('href', 'tel:' + l.contact_tel.replace(/\s/g, ''));
          tel.textContent = 'Appeler ' + l.contact_tel;
          joindre.appendChild(tel);
        }
        f.appendChild(joindre);

        // Son suivi
        var suivi = document.createElement('div');
        suivi.className = 'fiche-grille deux';

        var cs = document.createElement('div');
        cs.className = 'champ';
        var ls = document.createElement('label');
        ls.textContent = 'Où en êtes-vous ?';
        ls.setAttribute('for', 's-' + l.id);
        cs.appendChild(ls);
        var sel = document.createElement('select');
        sel.id = 's-' + l.id;
        STATUTS.forEach(function (s) {
          var o = document.createElement('option');
          o.value = s[0];
          o.textContent = s[1];
          if (l.statut === s[0]) o.selected = true;
          sel.appendChild(o);
        });
        cs.appendChild(sel);
        suivi.appendChild(cs);

        var cn = document.createElement('div');
        cn.className = 'champ';
        var ln = document.createElement('label');
        ln.textContent = 'Votre note (elle reste privée)';
        ln.setAttribute('for', 'n-' + l.id);
        cn.appendChild(ln);
        var note = document.createElement('input');
        note.type = 'text';
        note.id = 'n-' + l.id;
        note.value = l.note || '';
        cn.appendChild(note);
        suivi.appendChild(cn);

        f.appendChild(suivi);

        var pied = document.createElement('div');
        pied.className = 'fiche-pied';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bouton bouton-1';
        b.textContent = 'Enregistrer';
        b.addEventListener('click', function () {
          api('nb_demandes?id=eq.' + l.id, {
            method: 'PATCH', body: { statut: sel.value, note: note.value },
          }).then(function () { etat('Enregistré.'); charger('demandes'); })
            .catch(function (e) { etat('Impossible d\'enregistrer. ' + e.message, true); });
        });
        pied.appendChild(b);

        var sup = document.createElement('button');
        sup.type = 'button';
        sup.className = 'bouton bouton-danger';
        sup.textContent = 'Supprimer';
        sup.addEventListener('click', function () {
          if (!window.confirm('Supprimer définitivement la demande de « ' + l.enseigne + ' » ?\n\nVous perdrez ses coordonnées et son message.')) return;
          api('nb_demandes?id=eq.' + l.id, { method: 'DELETE', prefer: 'return=minimal' })
            .then(function () { etat('Supprimée.'); charger('demandes'); })
            .catch(function (e) { etat('Impossible de supprimer. ' + e.message, true); });
        });
        pied.appendChild(sup);
        f.appendChild(pied);

        boite.appendChild(f);
      });
    }).catch(function (e) { etat('Chargement impossible. ' + e.message, true); });
  }

  /* ---------- Les abonnes a la lettre ---------- */
  function chargerLettre() {
    var boite = q('#liste-lettre');
    return api('nb_lettre?select=*&order=inscrit_le.desc').then(function (lignes) {
      cache.lettre = lignes;
      boite.innerHTML = '';

      if (!lignes.length) {
        var v = document.createElement('p');
        v.className = 'aide';
        v.textContent = 'Personne pour l\'instant. Les inscriptions arriveront ici dès que quelqu\'un remplira le formulaire en bas de votre page d\'accueil.';
        boite.appendChild(v);
        return;
      }

      var n = document.createElement('p');
      n.className = 'bandeau-info';
      n.textContent = lignes.length + (lignes.length > 1 ? ' personnes inscrites.' : ' personne inscrite.');
      boite.appendChild(n);

      lignes.forEach(function (l) {
        var f = document.createElement('div');
        f.className = 'fiche';

        var t = document.createElement('h3');
        t.textContent = l.prenom ? l.prenom + ' · ' + l.email : l.email;
        f.appendChild(t);

        var d = document.createElement('p');
        d.className = 'aide';
        d.textContent = 'Inscrit le ' + new Date(l.inscrit_le).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        f.appendChild(d);

        var pied = document.createElement('div');
        pied.className = 'fiche-pied';
        var sup = document.createElement('button');
        sup.type = 'button';
        sup.className = 'bouton bouton-danger';
        sup.textContent = 'Retirer de la liste';
        sup.addEventListener('click', function () {
          if (!window.confirm('Retirer ' + l.email + ' de votre lettre ?')) return;
          api('nb_lettre?id=eq.' + l.id, { method: 'DELETE', prefer: 'return=minimal' })
            .then(function () { etat('Retiré.'); charger('lettre'); })
            .catch(function (e) { etat('Impossible. ' + e.message, true); });
        });
        pied.appendChild(sup);
        f.appendChild(pied);

        boite.appendChild(f);
      });
    }).catch(function (e) { etat('Chargement impossible. ' + e.message, true); });
  }

  function exporterLettre() {
    var lignes = cache.lettre || [];
    if (!lignes.length) { etat('Il n\'y a personne à exporter.'); return; }

    // Point-virgule et BOM : c'est ce qu'attend Excel en français.
    // Une virgule mettrait tout dans une seule colonne chez elle.
    var csv = '﻿Email;Prénom;Inscrit le\n' + lignes.map(function (l) {
      var p = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      return [p(l.email), p(l.prenom), p(new Date(l.inscrit_le).toLocaleDateString('fr-FR'))].join(';');
    }).join('\n');

    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'lettre-nabycook.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    etat('Fichier téléchargé.');
  }

  /* ---------- Chargement d'une section ---------- */
  function charger(nom) {
    if (nom === 'lettre') return chargerLettre();
    if (nom === 'demandes') return chargerDemandes();
    if (nom === 'impact') return chargerImpact();
    var S = SECTIONS[nom];
    var boite = q('#liste-' + nom);
    return api(S.table + '?select=*&order=' + S.tri).then(function (lignes) {
      cache[nom] = lignes;
      boite.innerHTML = '';
      if (!lignes.length) {
        var v = document.createElement('p');
        v.className = 'aide';
        v.textContent = 'Rien pour le moment. Le site affiche un emplacement en attente, il n\'affiche rien de faux.';
        boite.appendChild(v);
        return;
      }
      lignes.forEach(function (l, i) { boite.appendChild(fiche(nom, l, i, lignes.length)); });
    }).catch(function (e) { etat('Chargement impossible. ' + e.message, true); });
  }

  function ajouter(nom) {
    var S = SECTIONS[nom];
    var neuf = JSON.parse(JSON.stringify(S.neuf));
    if (S.rangeable) neuf.rang = (cache[nom] ? cache[nom].length : 0) + 1;
    api(S.table, { method: 'POST', body: neuf })
      .then(function () { etat('Ajouté. Remplissez-le, puis enregistrez.'); charger(nom); })
      .catch(function (e) { etat('Impossible d\'ajouter. ' + e.message, true); });
  }

  /* ---------- Les chiffres, cas particulier ----------
     Quatre lignes fixes et une date, enregistrees d'un seul geste.
  -------------------------------------------------- */
  function chargerImpact() {
    return Promise.all([
      api('nb_impact?select=*&order=rang.asc'),
      api('nb_reglages?select=*&cle=eq.impact_date'),
    ]).then(function (r) {
      cache.impact = r[0];
      q('#impact-date').value = (r[1][0] && r[1][0].valeur) || '';
      var boite = q('#liste-impact');
      boite.innerHTML = '';
      r[0].forEach(function (l) {
        var f = document.createElement('div');
        f.className = 'fiche';
        var g = document.createElement('div');
        g.className = 'fiche-grille deux';
        g.appendChild(champ({ c: 'valeur', l: 'Le chiffre', ph: '460 kg' }, l.valeur, function (c, v) { l.valeur = v; }));
        g.appendChild(champ({ c: 'libelle', l: 'Ce qu\'il désigne', ph: 'd\'invendus sauvés du gaspillage' }, l.libelle, function (c, v) { l.libelle = v; }));
        f.appendChild(g);
        boite.appendChild(f);
      });
    }).catch(function (e) { etat('Chargement impossible. ' + e.message, true); });
  }

  function enregistrerImpact() {
    var appels = cache.impact.map(function (l) {
      return api('nb_impact?id=eq.' + l.id, { method: 'PATCH', body: { valeur: l.valeur, libelle: l.libelle } });
    });
    appels.push(api('nb_reglages?cle=eq.impact_date', {
      method: 'PATCH', body: { valeur: q('#impact-date').value },
    }));
    Promise.all(appels)
      .then(function () { etat('Vos chiffres sont à jour sur le site.'); })
      .catch(function (e) { etat('Impossible d\'enregistrer. ' + e.message, true); });
  }

  /* ---------- Navigation par onglets ---------- */
  function onglet(nom) {
    qa('.onglets button').forEach(function (b) {
      b.classList.toggle('actif', b.getAttribute('data-onglet') === nom);
    });
    qa('[data-vue]').forEach(function (s) {
      s.hidden = s.getAttribute('data-vue') !== nom;
    });
    charger(nom);
  }

  /* ---------- Entree et sortie ---------- */
  function ouvrir() {
    q('#ecran-connexion').hidden = true;
    q('#ecran-espace').hidden = false;
    q('#qui').textContent = (session.user && session.user.email) || '';
    onglet('demandes');
  }

  function deconnecter() {
    oublierSession();
    q('#ecran-espace').hidden = true;
    q('#ecran-connexion').hidden = false;
  }

  /* ---------- Demarrage ---------- */
  q('#form-connexion').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = q('#erreur-connexion');
    err.hidden = true;
    connecter(q('#email').value.trim(), q('#mdp').value).then(function (d) {
      if (!d.access_token) {
        err.textContent = 'Email ou mot de passe incorrect. Vérifiez, et réessayez.';
        err.hidden = false;
        return;
      }
      ecrireSession(d);
      ouvrir();
    }).catch(function () {
      err.textContent = 'La connexion a échoué. Vérifiez votre accès à internet.';
      err.hidden = false;
    });
  });

  q('#deconnexion').addEventListener('click', deconnecter);
  q('#enregistrer-impact').addEventListener('click', enregistrerImpact);
  q('#exporter-lettre').addEventListener('click', exporterLettre);
  qa('.onglets button').forEach(function (b) {
    b.addEventListener('click', function () { onglet(b.getAttribute('data-onglet')); });
  });
  qa('[data-ajout]').forEach(function (b) {
    b.addEventListener('click', function () { ajouter(b.getAttribute('data-ajout')); });
  });

  session = lireSession();
  if (session && session.access_token) {
    // Le jeton en memoire peut avoir expire pendant la nuit : on le renouvelle
    // avant d'ouvrir, sinon le premier chargement echoue sous ses yeux.
    rafraichir().then(function (ok) { if (ok) ouvrir(); else deconnecter(); });
  }
})();
