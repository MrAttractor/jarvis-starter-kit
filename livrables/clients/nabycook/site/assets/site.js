/* ============================================================
   NABYCOOK — Moteur commun aux 5 pages de la Phase 1
   Depend de assets/config.js (objet NABY).
   Aucune dependance externe.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Utilitaires ---------- */
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // Rend une valeur, ou un marqueur "à fournir" si elle est absente.
  var val = function (v, attente) {
    if (v === null || v === undefined || v === '') {
      return '<span class="afournir">' + esc(attente || 'à fournir') + '</span>';
    }
    return esc(v);
  };

  var vide = function (v) {
    return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
  };

  /* Masque la section entiere qui porte cet emplacement.
     Sert des que le site est public : un visiteur ne doit pas voir
     nos encadres « a fournir », qui sont des notes de chantier.
     Rien n'est supprime, la section reapparait des que Nabintou
     remplit la rubrique depuis son espace. */
  var masquerSection = function (cible) {
    var s = cible.closest ? cible.closest('section') : null;
    if (s) { s.hidden = true; return; }
    cible.hidden = true;
  };
  var montrerSection = function (cible) {
    var s = cible.closest ? cible.closest('section') : null;
    if (s) s.hidden = false;
    cible.hidden = false;
  };

  var q = function (sel, racine) { return (racine || document).querySelector(sel); };
  var qa = function (sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); };
  var slot = function (nom) { return q('[data-slot="' + nom + '"]'); };

  /* ---------- Icones (trait, inspirees des motifs adinkra) ---------- */
  var ICONES = {
    // cercles concentriques — adinkrahene, l'autorite et le centre
    cercles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.5"/></svg>',
    // zigzag — nkyinkyim, le chemin qui n'est jamais droit
    chemin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19V9a3 3 0 0 1 6 0v6a3 3 0 0 0 6 0V5"/><path d="M15 5h6"/></svg>',
    // feuille — la fougere aya, l'endurance
    feuille: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20C4 11 10 4 20 4c0 10-7 16-16 16Z"/><path d="M4 20 20 4"/></svg>',
    // marmite — l'atelier
    marmite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5Z"/><path d="M2 10h20"/><path d="M20 12h2v3h-2"/><path d="M4 12H2v3h2"/><path d="M9 6c0-1.5 1.5-1.5 1.5-3"/><path d="M14 6c0-1.5 1.5-1.5 1.5-3"/></svg>',
    // plateau — le traiteur
    plateau: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h18"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V5"/><circle cx="12" cy="4" r="1"/><path d="M2 20h20"/></svg>',
    // panier — l'epicerie
    panier: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18l-1.6 9.2A2 2 0 0 1 17.4 20H6.6a2 2 0 0 1-2-1.8L3 9Z"/><path d="M8 9 10 4"/><path d="M16 9 14 4"/><path d="M9.5 13v3"/><path d="M14.5 13v3"/></svg>',
    // coeur — le soutien
    coeur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z"/></svg>',
    // etoile — les distinctions
    etoile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8L12 3Z"/></svg>',
    // enveloppe
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
    // combine
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/></svg>',
    // epingle
    lieu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    // appareil photo — emplacements d'images
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h2.2l1.2-2h7.2l1.2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><circle cx="12" cy="12.5" r="3.4"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11h-3V9a.5.5 0 0 1 .5-.5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10.5V17"/><circle cx="7.5" cy="7.4" r="1"/><path d="M11.5 17v-3.6a2.4 2.4 0 0 1 4.8 0V17"/><path d="M11.5 10.5V17"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10.5 9.5 5 2.5-5 2.5Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4a8 8 0 1 1 3 3l-4.3 1Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>',
    // calendrier — les rendez-vous a venir
    agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>',
    fleche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  };

  /* ---------- Navigation ---------- */
  var PAGES = [
    // `court` = libelle de la barre de navigation. Depuis l'ajout du 6e onglet,
    // les intitules complets passaient sur deux lignes des 1280 px.
    // `libelle` reste le nom complet, utilise dans le pied de page.
    { cle: 'accueil', url: 'index.html', libelle: 'Accueil', court: 'Accueil' },
    { cle: 'univers', url: 'univers.html', libelle: 'L\'Univers NabyCook', court: 'L\'Univers' },
    { cle: 'association', url: 'association.html', libelle: 'L\'Association & l\'Impact', court: 'L\'Association' },
    { cle: 'agenda', url: 'agenda.html', libelle: 'En ce moment', court: 'En ce moment' },
    { cle: 'adhesions', url: 'adhesions.html', libelle: 'Adhérer', court: 'Adhérer' },
    { cle: 'contact', url: 'contact.html', libelle: 'Contact', court: 'Contact' },
  ];

  var pageCourante = document.body.getAttribute('data-page') || '';

  /* ---------- Bandeau maquette ---------- */
  function bandeau() {
    if (!NABY.maquette) return;
    var d = document.createElement('div');
    d.className = 'bandeau-maquette';
    d.innerHTML = '<b>Maquette de travail</b> — les zones soulignées en orange attendent tes éléments. Merci de ne pas partager ce lien en dehors de l\'association.';
    document.body.insertBefore(d, document.body.firstChild);
  }

  /* ---------- En-tete ---------- */
  function entete() {
    var cible = slot('entete');
    if (!cible) return;
    var liens = PAGES.map(function (p) {
      if (p.cle === 'adhesions') return '';
      var courant = p.cle === pageCourante ? ' aria-current="page"' : '';
      return '<li><a href="' + p.url + '"' + courant + '>' + esc(p.court || p.libelle) + '</a></li>';
    }).join('');

    cible.outerHTML =
      '<header class="entete" id="entete">' +
        '<div class="wrap entete-inner">' +
          '<a class="marque" href="index.html">' +
            '<img src="assets/logo-nabycook.png" alt="Logo NabyCook" width="56" height="56">' +
            '<span><span class="nom">NabyCook</span><span class="sous">Association loi 1901</span></span>' +
          '</a>' +
          '<button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><span></span></button>' +
          '<nav class="nav" id="menu" aria-label="Navigation principale">' +
            '<ul>' + liens + '</ul>' +
            '<a class="bouton bouton-1" href="adhesions.html">Adhérer à l\'association</a>' +
          '</nav>' +
        '</div>' +
      '</header>';

    var tete = q('#entete');
    var b = q('.burger', tete);
    b.addEventListener('click', function () {
      var ouvert = tete.classList.toggle('ouvert');
      b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      b.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    document.addEventListener('click', function (e) {
      if (tete.classList.contains('ouvert') && !tete.contains(e.target)) {
        tete.classList.remove('ouvert');
        b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Pied de page ---------- */
  function pied() {
    var cible = slot('pied');
    if (!cible) return;

    var reseaux = [
      { cle: 'instagram', url: NABY.liens.instagram, nom: 'Instagram' },
      { cle: 'youtube', url: NABY.liens.youtube, nom: 'YouTube' },
      { cle: 'whatsapp', url: NABY.liens.whatsappCanal, nom: 'Canal WhatsApp' },
      { cle: 'facebook', url: NABY.liens.facebook, nom: 'Facebook' },
      { cle: 'linkedin', url: NABY.liens.linkedin, nom: 'LinkedIn' },
    ].filter(function (r) { return !vide(r.url); });

    var htmlReseaux = reseaux.length
      ? '<div class="sociaux">' + reseaux.map(function (r) {
          return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener" aria-label="' + esc(r.nom) + '">' + ICONES[r.cle] + '</a>';
        }).join('') + '</div>'
      : '<p class="aide" style="color:rgba(247,242,231,.62)">Liens réseaux sociaux <span class="afournir">à fournir</span></p>';

    var liensPages = PAGES.map(function (p) {
      return '<li><a href="' + p.url + '">' + esc(p.libelle) + '</a></li>';
    }).join('');

    cible.outerHTML =
      '<footer class="pied">' +
        '<div class="wrap">' +
          '<div class="pied-grille">' +
            '<div>' +
              '<div class="marque-pied">NabyCook</div>' +
              '<p>' + esc(NABY.statut) + '<br>' + esc(NABY.esus) + '</p>' +
              htmlReseaux +
            '</div>' +
            '<div>' +
              '<h4>Le site</h4>' +
              '<ul>' + liensPages + '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Nous joindre</h4>' +
              '<ul>' +
                '<li><a href="mailto:' + esc(NABY.email) + '">' + esc(NABY.email) + '</a></li>' +
                '<li><a href="tel:' + esc(NABY.telephoneLien) + '">' + esc(NABY.telephone) + '</a></li>' +
                '<li>' + val(NABY.adresse, 'adresse à fournir') + '</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="bas">' +
            '<span>&copy; ' + new Date().getFullYear() + ' Association NabyCook · ' + esc(NABY.ville) + '</span>' +
            '<span>Site conçu et réalisé par l\'agence Mr Attractor</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- Distinctions ---------- */
  function distinctions() {
    var cible = slot('distinctions');
    if (!cible) return;
    cible.innerHTML =
      '<div class="wrap"><ul>' +
        NABY.distinctions.map(function (d) {
          return '<li>' + ICONES.etoile + '<span>' + esc(d) + '</span></li>';
        }).join('') +
      '</ul></div>';
  }

  /* ---------- Chiffres d'impact ---------- */
  function impact() {
    var cible = slot('impact');
    if (!cible) return;
    cible.innerHTML = NABY.impact.map(function (c) {
      var n = vide(c.valeur)
        ? '<span class="n"><span class="afournir">000</span></span>'
        : '<span class="n">' + esc(c.valeur) + '</span>';
      return '<div class="chiffre">' + n + '<span class="l">' + esc(c.libelle) + '</span></div>';
    }).join('');
  }

  /* ---------- Partenaires ---------- */
  function partenaires() {
    var cible = slot('partenaires');
    if (!cible) return;
    if (vide(NABY.partenaires)) { masquerSection(cible); return; }
    montrerSection(cible);
    // Construit a la main : un logo declare mais pas encore depose doit
    // retomber sur le nom du partenaire, jamais sur une image cassee.
    var boite = document.createElement('div');
    boite.className = 'logos';

    // Le partenaire marque « principal » passe devant et occupe seul la
    // premiere ligne de la bande. L'ordre des autres n'est pas touche.
    var liste = NABY.partenaires.slice().sort(function (a, b) {
      return (b.principal ? 1 : 0) - (a.principal ? 1 : 0);
    });

    liste.forEach(function (p) {
      var slotP = document.createElement('div');
      slotP.className = p.principal ? 'logo-slot logo-principal' : 'logo-slot';

      // Sans logo, on affiche le nom dans un cadre plein : c'est un
      // parti pris assume, pas un emplacement en attente. Le pointille
      // disait au visiteur qu'il manquait quelque chose.
      var nom = function () {
        slotP.style.borderStyle = 'solid';
        slotP.style.fontWeight = '600';
        slotP.textContent = p.nom;
      };

      if (vide(p.logo)) { nom(); boite.appendChild(slotP); return; }

      var img = document.createElement('img');
      img.setAttribute('alt', p.nom);
      img.setAttribute('loading', 'lazy');
      img.style.maxHeight = p.principal ? '72px' : '56px';
      img.style.maxWidth = '100%';
      img.style.width = 'auto';
      img.addEventListener('error', nom);
      img.setAttribute('src', p.logo);

      slotP.style.borderStyle = 'solid';
      slotP.appendChild(img);
      boite.appendChild(slotP);
    });

    cible.innerHTML = '';
    cible.appendChild(boite);
  }

  /* ---------- Agenda ----------
     Liste tenue a la main, volontairement : Nabintou a demande
     3 a 5 rendez-vous, pas un calendrier interactif.
  ---------------------------- */
  function agenda() {
    var cible = slot('agenda');
    if (!cible) return;

    // Sans date au programme, on le dit simplement au visiteur et on
    // l'invite a ecrire, plutot que d'afficher une page vide. C'est la
    // seule rubrique qui garde un message quand elle n'a rien : la page
    // existe dans le menu, elle ne peut pas etre blanche.
    if (vide(NABY.agenda)) {
      cible.innerHTML =
        '<div class="centre">' +
          '<p class="lead">Les prochaines dates sont en cours de calage. Elles seront annoncées ici, et sur nos réseaux.</p>' +
          '<div class="boutons" style="justify-content:center;margin-top:24px">' +
            '<a class="bouton bouton-1" href="contact.html">Nous proposer une date</a>' +
            (vide(NABY.liens.instagram) ? '' :
              '<a class="bouton bouton-2" href="' + esc(NABY.liens.instagram) + '" target="_blank" rel="noopener">Suivre sur Instagram</a>') +
          '</div>' +
        '</div>';
      return;
    }

    var boite = document.createElement('div');
    boite.className = 'grille grille-3';

    NABY.agenda.forEach(function (e) {
      var carte = document.createElement('article');
      carte.className = 'carte rdv';

      var d = document.createElement('span');
      d.className = 'rdv-date';
      d.textContent = e.date || '';
      carte.appendChild(d);

      var t = document.createElement('h3');
      t.textContent = e.type || 'Rendez-vous';
      carte.appendChild(t);

      if (!vide(e.lieu)) {
        var l = document.createElement('p');
        l.className = 'rdv-lieu';
        l.textContent = e.lieu;
        carte.appendChild(l);
      }

      if (!vide(e.desc)) {
        var p = document.createElement('p');
        p.textContent = e.desc;
        carte.appendChild(p);
      }

      var pied = document.createElement('div');
      pied.className = 'lien-carte';
      var a = document.createElement('a');
      a.className = 'carte-lien';
      a.setAttribute('href', vide(e.lien) ? 'contact.html' : e.lien);
      if (/^https?:/i.test(a.getAttribute('href'))) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      a.textContent = 'Participer';
      pied.appendChild(a);
      carte.appendChild(pied);

      boite.appendChild(carte);
    });

    cible.innerHTML = '';
    cible.appendChild(boite);
  }

  /* ---------- Le chemin de l'association ---------- */
  function historique() {
    var cible = slot('historique');
    if (!cible) return;

    if (vide(NABY.historique)) { masquerSection(cible); return; }
    montrerSection(cible);

    cible.innerHTML =
      '<ol class="chemin">' +
        NABY.historique.map(function (e) {
          return '<li>' +
            '<span class="an">' + esc(e.annee) + '</span>' +
            '<div><h3>' + esc(e.titre) + '</h3>' +
            (vide(e.desc) ? '' : '<p>' + esc(e.desc) + '</p>') +
            '</div>' +
          '</li>';
        }).join('') +
      '</ol>';
  }

  /* ---------- Revue de presse ---------- */
  function presse() {
    var cible = slot('presse');
    if (!cible) return;
    if (vide(NABY.presse)) { masquerSection(cible); return; }
    montrerSection(cible);
    cible.innerHTML =
      '<ul class="presse">' +
        NABY.presse.map(function (a) {
          var cit = '<span class="cit">&laquo;&nbsp;' + esc(a.citation) + '&nbsp;&raquo;</span>';
          if (!vide(a.url)) cit = '<a href="' + esc(a.url) + '" target="_blank" rel="noopener" class="cit">&laquo;&nbsp;' + esc(a.citation) + '&nbsp;&raquo;</a>';
          return '<li><span class="src">' + esc(a.source) + '</span>' + cit + '</li>';
        }).join('') +
      '</ul>';
  }

  /* ---------- Temoignages ---------- */
  function temoignages() {
    var cible = slot('temoignages');
    if (!cible) return;
    if (vide(NABY.temoignages)) { masquerSection(cible); return; }
    montrerSection(cible);
    cible.innerHTML =
      '<div class="grille grille-3">' +
        NABY.temoignages.map(function (t) {
          return '<blockquote class="temoin">' +
            '<p class="q">&laquo;&nbsp;' + esc(t.texte) + '&nbsp;&raquo;</p>' +
            '<span class="a">' + esc(t.auteur) + '</span><br>' +
            '<span class="r">' + esc(t.role) + '</span>' +
          '</blockquote>';
        }).join('') +
      '</div>';
  }

  /* ---------- Formules d'adhesion ---------- */
  function formules() {
    var cible = slot('formules');
    if (!cible) return;
    cible.innerHTML =
      '<div class="grille grille-2">' +
        NABY.formules.map(function (f, i) {
          var url = i === 0 ? NABY.liens.helloassoAdhesion : NABY.liens.helloassoDon;
          var actif = NABY.adhesions && !vide(url);
          var bouton = actif
            ? '<a class="bouton bouton-1" href="' + esc(url) + '" target="_blank" rel="noopener">Adhérer &mdash; ' + esc(f.nom) + '</a>'
            : '<span class="bouton bouton-1" style="opacity:.55;cursor:not-allowed" aria-disabled="true">Lien HelloAsso <span class="afournir">à fournir</span></span>';
          // Le QR code n'est affiche que si Nabintou en fournit un. Une case
          // en pointilles a cote d'un bouton qui marche deja n'est que du bruit.
          var qr = actif && !vide(NABY.qrHelloAsso)
            ? '<div class="qr" style="border-style:solid"><img src="' + esc(NABY.qrHelloAsso) + '" alt="QR code d\'adhésion HelloAsso" style="max-width:100%;height:auto"></div>'
            : '';
          return '<div class="formule' + (f.vedette ? ' vedette' : '') + '">' +
            '<span class="etiquette">' + esc(f.etiquette) + '</span>' +
            '<span class="nom">' + esc(f.nom) + '</span>' +
            '<div class="prix">' + esc(f.prix) + ' <small>' + esc(f.unite) + '</small></div>' +
            '<p class="desc">' + esc(f.desc) + '</p>' +
            '<ul>' + f.avantages.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
            bouton + qr +
          '</div>';
        }).join('') +
      '</div>';
  }

  /* ---------- Coordonnees ---------- */
  function coordonnees() {
    var cible = slot('coordonnees');
    if (!cible) return;
    cible.innerHTML =
      '<ul class="coord">' +
        '<li><span class="icone">' + ICONES.mail + '</span><span><span class="k">Email</span><br><a class="v" href="mailto:' + esc(NABY.email) + '">' + esc(NABY.email) + '</a></span></li>' +
        '<li><span class="icone">' + ICONES.tel + '</span><span><span class="k">Téléphone</span><br><a class="v" href="tel:' + esc(NABY.telephoneLien) + '">' + esc(NABY.telephone) + '</a></span></li>' +
        '<li><span class="icone">' + ICONES.lieu + '</span><span><span class="k">Adresse</span><br><span class="v">' + val(NABY.adresse, 'adresse à fournir') + '</span></span></li>' +
      '</ul>';
  }

  /* ---------- Formulaire de contact (sans backend) ---------- */
  function formulaireContact() {
    var f = q('#form-contact');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f);
      var nom = (d.get('nom') || '').toString().trim();
      var email = (d.get('email') || '').toString().trim();
      var sujet = (d.get('sujet') || '').toString().trim();
      var message = (d.get('message') || '').toString().trim();
      if (!nom || !email || !message) return;

      var corps =
        'Nom : ' + nom + '\n' +
        'Email : ' + email + '\n' +
        'Sujet : ' + (sujet || 'Non precise') + '\n\n' +
        message + '\n\n---\nEnvoye depuis le site nabycook.com';

      var choix = (d.get('canal') || 'email').toString();
      if (choix === 'whatsapp') {
        window.open('https://wa.me/' + NABY.whatsapp + '?text=' + encodeURIComponent(corps), '_blank', 'noopener');
      } else {
        window.location.href = 'mailto:' + NABY.email +
          '?subject=' + encodeURIComponent('[Site] ' + (sujet || 'Message de ' + nom)) +
          '&body=' + encodeURIComponent(corps);
      }
      var etat = q('#form-etat');
      if (etat) {
        etat.textContent = choix === 'whatsapp'
          ? 'WhatsApp s\'ouvre avec votre message pre-rempli. Il ne reste qu\'a l\'envoyer.'
          : 'Votre messagerie s\'ouvre avec le message pre-rempli. Il ne reste qu\'a l\'envoyer.';
        etat.hidden = false;
      }
    });
  }

  /* ---------- Textes pilotes par le config ---------- */
  function textes() {
    qa('[data-naby]').forEach(function (el) {
      var cle = el.getAttribute('data-naby');
      var v = cle.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, NABY);
      el.innerHTML = val(v, el.getAttribute('data-attente') || 'a fournir');
    });
    var t = q('[data-slot="tagline"]');
    if (t) {
      t.innerHTML = esc(NABY.tagline) +
        (NABY.taglineAValider ? ' <span class="afournir" title="Tagline proposee, a valider par Nabintou">a valider</span>' : '');
    }
  }

  /* ---------- Integrations externes ---------- */
  function integrations() {
    var ig = slot('instagram');
    if (ig && !(NABY.instagram && !vide(NABY.liens.instagram))) {
      ig.innerHTML =
        '<div class="embed-slot">' +
          '<h4>Le flux Instagram s\'affichera ici</h4>' +
          '<p>Il suffit du nom du compte Instagram et de l\'autorisation d\'intégration. Les dernières publications remonteront automatiquement, sans intervention.</p>' +
          '<span class="etiq-afournir">Compte Instagram à fournir</span>' +
        '</div>';
    } else if (ig) {
      var lienYt = vide(NABY.liens.youtube)
        ? ''
        : '<a class="bouton bouton-2" href="' + esc(NABY.liens.youtube) + '" target="_blank" rel="noopener">Voir la chaîne YouTube</a>';
      ig.innerHTML =
        '<div class="embed-slot" style="border-style:solid">' +
          '<h4>Suivez NabyCook au jour le jour</h4>' +
          '<p>Les ateliers, les coulisses et les éditions limitées de l\'épicerie, publiés au fil des jours.</p>' +
          '<div class="boutons" style="justify-content:center">' +
            '<a class="bouton bouton-1" href="' + esc(NABY.liens.instagram) + '" target="_blank" rel="noopener">Voir le compte Instagram</a>' +
            lienYt +
          '</div>' +
        '</div>';
    }
    // Lettre d'information : formulaire maison, les adresses arrivent dans
    // l'espace de Nabintou. Brevo a ete ecarte le 11/08/2026, sa cle d'API
    // aurait ete lisible dans la page par n'importe quel visiteur.
    var nl = slot('newsletter');
    if (nl) {
      var f = document.createElement('form');
      f.className = 'form-lettre';

      var g = document.createElement('div');
      g.className = 'lettre-grille';

      var cp = document.createElement('div');
      cp.className = 'champ';
      var lp = document.createElement('label');
      lp.setAttribute('for', 'l-prenom');
      lp.textContent = 'Votre prénom';
      var ip = document.createElement('input');
      ip.type = 'text';
      ip.id = 'l-prenom';
      ip.autocomplete = 'given-name';
      cp.appendChild(lp); cp.appendChild(ip);

      var ce = document.createElement('div');
      ce.className = 'champ';
      var le = document.createElement('label');
      le.setAttribute('for', 'l-email');
      le.textContent = 'Votre email';
      var ie = document.createElement('input');
      ie.type = 'email';
      ie.id = 'l-email';
      ie.autocomplete = 'email';
      ie.required = true;
      ce.appendChild(le); ce.appendChild(ie);

      g.appendChild(cp); g.appendChild(ce);
      f.appendChild(g);

      var b = document.createElement('button');
      b.type = 'submit';
      b.className = 'bouton bouton-1';
      b.textContent = 'Je m\'inscris';
      f.appendChild(b);

      var msg = document.createElement('p');
      msg.className = 'aide';
      msg.hidden = true;
      f.appendChild(msg);

      var mentions = document.createElement('p');
      mentions.className = 'aide';
      mentions.textContent = 'Votre adresse sert uniquement à recevoir la lettre de NabyCook. '
        + 'Elle n\'est ni revendue ni transmise, et vous pouvez demander à être retiré à tout moment.';
      f.appendChild(mentions);

      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var email = ie.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          msg.textContent = 'Cette adresse email ne semble pas valide.';
          msg.style.color = 'var(--terracotta)';
          msg.hidden = false;
          return;
        }
        b.disabled = true;
        b.textContent = 'Inscription…';
        fetch(NABY.base.url + '/functions/v1/nb-lettre', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            prenom: ip.value.trim() || null,
            source: document.body.getAttribute('data-page'),
          }),
        }).then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.ok) {
              f.reset();
              msg.textContent = 'C\'est noté, merci. Vous recevrez la prochaine lettre.';
              msg.style.color = 'var(--vert-feuille)';
              b.textContent = 'Inscription enregistrée';
            } else {
              msg.textContent = j.erreur || 'L\'inscription n\'a pas abouti.';
              msg.style.color = 'var(--terracotta)';
              b.disabled = false;
              b.textContent = 'Je m\'inscris';
            }
            msg.hidden = false;
          })
          .catch(function () {
            msg.textContent = 'L\'inscription a échoué. Vérifiez votre connexion.';
            msg.style.color = 'var(--terracotta)';
            msg.hidden = false;
            b.disabled = false;
            b.textContent = 'Je m\'inscris';
          });
      });

      nl.innerHTML = '';
      nl.appendChild(f);
    }
  }

  /* ---------- Formulaire partenaire magasin ----------
     Reprend les 14 questions du Jotform d'origine, mais dans le
     site : a la charte, sans iframe, et les reponses arrivent chez
     Nabintou au lieu d'un prestataire tiers.
  -------------------------------------------------- */
  function formulairePartenaire() {
    var f = q('#form-partenaire');
    if (!f) return;
    var CFG = NABY.formulairePartenaire;

    // Listes deroulantes
    qa('[data-choix]', f).forEach(function (bloc) {
      var liste = CFG[bloc.getAttribute('data-choix')] || [];
      var nom = bloc.getAttribute('data-nom');
      var sel = document.createElement('select');
      sel.name = nom;
      sel.id = 'p-' + nom;
      var lab = q('label', bloc);
      if (lab) lab.setAttribute('for', sel.id);

      var vide0 = document.createElement('option');
      vide0.value = '';
      vide0.textContent = 'Choisir…';
      sel.appendChild(vide0);

      liste.forEach(function (v) {
        var o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });

      if (bloc.getAttribute('data-autre')) {
        var oa = document.createElement('option');
        oa.value = '__autre__';
        oa.textContent = 'Autre…';
        sel.appendChild(oa);

        var libre = document.createElement('input');
        libre.type = 'text';
        libre.placeholder = 'Précisez';
        libre.hidden = true;
        libre.style.marginTop = '8px';
        libre.setAttribute('data-libre', nom);
        sel.addEventListener('change', function () {
          libre.hidden = sel.value !== '__autre__';
          if (!libre.hidden) libre.focus();
        });
        bloc.appendChild(sel);
        bloc.appendChild(libre);
        return;
      }
      bloc.appendChild(sel);
    });

    // Cases a cocher
    qa('[data-cases]', f).forEach(function (bloc) {
      var liste = CFG[bloc.getAttribute('data-cases')] || [];
      var nom = bloc.getAttribute('data-nom');
      var g = document.createElement('div');
      g.className = 'cases';

      liste.forEach(function (v, i) {
        var id = 'c-' + nom + '-' + i;
        var l = document.createElement('label');
        l.className = 'case';
        l.setAttribute('for', id);

        var c = document.createElement('input');
        c.type = 'checkbox';
        c.id = id;
        c.value = v;
        c.setAttribute('data-groupe', nom);

        var s = document.createElement('span');
        s.textContent = v;

        l.appendChild(c);
        l.appendChild(s);
        g.appendChild(l);
      });

      bloc.appendChild(g);

      if (bloc.getAttribute('data-autre')) {
        var libre = document.createElement('input');
        libre.type = 'text';
        libre.placeholder = 'Autre chose ? Précisez ici.';
        libre.style.marginTop = '12px';
        libre.setAttribute('data-libre-groupe', nom);
        bloc.appendChild(libre);
      }
    });

    var etat = q('#p-etat');
    var bouton = q('#p-envoyer');

    function dire(msg, rate) {
      etat.textContent = msg;
      etat.style.color = rate ? 'var(--terracotta)' : 'var(--vert-feuille)';
      etat.style.fontWeight = '600';
      etat.hidden = false;
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();

      var val1 = function (n) {
        var el = q('[name="' + n + '"]', f);
        if (!el) return null;
        if (el.value === '__autre__') {
          var lib = q('[data-libre="' + n + '"]', f);
          return lib && lib.value.trim() ? lib.value.trim() : null;
        }
        return el.value.trim() || null;
      };

      var cases = function (n) {
        var out = qa('[data-groupe="' + n + '"]', f)
          .filter(function (c) { return c.checked; })
          .map(function (c) { return c.value; });
        var lib = q('[data-libre-groupe="' + n + '"]', f);
        if (lib && lib.value.trim()) out.push(lib.value.trim());
        return out.length ? out : null;
      };

      var d = {
        enseigne: val1('enseigne'),
        type_commerce: val1('type_commerce'),
        adresse: val1('adresse'),
        frequentation: val1('frequentation'),
        contact_nom: val1('contact_nom'),
        contact_email: val1('contact_email'),
        contact_tel: val1('contact_tel'),
        formats: cases('formats'),
        frequence: val1('frequence'),
        dates: val1('dates'),
        themes: val1('themes'),
        apports: cases('apports'),
        budget: val1('budget'),
        origine: val1('origine'),
      };

      if (!d.enseigne || !d.adresse || !d.contact_nom || !d.contact_email) {
        dire('Merci de remplir le nom du magasin, l\'adresse, votre nom et votre email.', true);
        return;
      }

      bouton.disabled = true;
      bouton.textContent = 'Envoi en cours…';

      fetch(NABY.base.url + '/functions/v1/' + CFG.fonction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (!r.ok) {
            dire(r.j.erreur || 'L\'envoi n\'a pas abouti. Réessayez dans un instant.', true);
            bouton.disabled = false;
            bouton.textContent = 'Envoyer ma demande';
            return;
          }
          f.reset();
          qa('[data-libre], [data-libre-groupe]', f).forEach(function (i) { i.value = ''; });
          dire('Votre demande est bien arrivée. NabyCook vous répond très vite.');
          bouton.textContent = 'Demande envoyée';
        })
        .catch(function () {
          dire('L\'envoi a échoué. Vérifiez votre connexion, ou écrivez-nous directement à ' + NABY.email + '.', true);
          bouton.disabled = false;
          bouton.textContent = 'Envoyer ma demande';
        });
    });
  }

  /* ---------- Emplacements photo ----------
     Un emplacement affiche la vraie photo des que le fichier declare
     dans NABY.photos existe. S'il n'est pas encore depose, on retombe
     sur l'emplacement en pointilles : jamais d'image cassee a l'ecran.
  ---------------------------------------- */
  function photos() {
    qa('[data-photo]').forEach(function (el) {
      var libelle = el.getAttribute('data-photo');
      var cle = el.getAttribute('data-photo-cle');
      var p = (cle && NABY.photos) ? NABY.photos[cle] : null;

      var attente = function () {
        el.classList.remove('photo-remplie');
        el.innerHTML = ICONES.photo + '<b>' + esc(libelle) + '</b><span>Emplacement photo à fournir</span>';
      };

      if (!p || vide(p.src)) { attente(); return; }

      var img = document.createElement('img');
      img.setAttribute('alt', p.alt || '');
      img.setAttribute('decoding', 'async');
      // La premiere image de la page d'accueil est visible d'emblee :
      // la charger paresseusement la ferait apparaitre en retard.
      if (cle !== 'heroAccueil') img.setAttribute('loading', 'lazy');
      img.addEventListener('error', attente);
      img.setAttribute('src', p.src);

      el.innerHTML = '';
      el.classList.add('photo-remplie');
      el.appendChild(img);
    });
  }

  /* ---------- Icones posees dans le HTML ---------- */
  function icones() {
    qa('[data-icone]').forEach(function (el) {
      var nom = el.getAttribute('data-icone');
      if (ICONES[nom]) el.innerHTML = ICONES[nom];
    });
  }

  /* ---------- Garde-fou : coherence du referencement ----------
     Le noindex ne depend pas du bandeau maquette mais de l'adresse.
     Tant que le site vit sur le domaine de demonstration, il ne doit
     pas etre reference : ce serait le mauvais domaine qui remonterait
     dans les moteurs, et un doublon a nettoyer plus tard.
  ------------------------------------------------------------ */
  var DOMAINE_PROD = 'nabycook.com';

  function gardeFou() {
    var meta = q('meta[name="robots"]');
    var noindex = meta && /noindex/i.test(meta.getAttribute('content') || '');
    var enProd = new RegExp('(^|\\.)' + DOMAINE_PROD.replace('.', '\\.') + '$')
      .test(location.hostname);

    if (enProd && noindex) {
      console.warn('[NabyCook] Le site est sur ' + DOMAINE_PROD + ' mais la balise <meta name="robots" content="noindex"> est encore presente : il ne sera pas reference. La retirer dans les 5 pages.');
    }
    if (!enProd && !noindex) {
      console.warn('[NabyCook] Page indexable hors du domaine de production. Ajouter <meta name="robots" content="noindex">.');
    }
  }

  /* ---------- Contenus tenus par Nabintou ----------
     Le site s'affiche D'ABORD avec les valeurs du fichier de
     configuration, puis se rafraichit si la base repond. Dans cet
     ordre et pas l'inverse : une base lente ou en panne ne doit
     jamais produire une page vide, ni un clignotement.
  ------------------------------------------------- */
  function lire(table, tri) {
    var u = NABY.base.url + '/rest/v1/' + table + '?select=*';
    if (tri) u += '&order=' + tri;
    return fetch(u, { headers: { apikey: NABY.base.cle } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function contenus() {
    if (!NABY.base || vide(NABY.base.url)) return;

    Promise.all([
      lire('nb_agenda', 'date_tri.asc.nullslast'),
      lire('nb_impact', 'rang.asc'),
      lire('nb_reglages'),
      lire('nb_partenaires', 'rang.asc'),
      lire('nb_temoignages', 'rang.asc'),
      lire('nb_presse', 'rang.asc'),
      lire('nb_historique', 'rang.asc'),
    ]).then(function (r) {
      var ag = r[0], im = r[1], rg = r[2], pa = r[3], te = r[4], pr = r[5], hi = r[6];

      // Chaque bloc ne remplace ce qui est en place QUE s'il a du contenu.
      if (ag.length) {
        NABY.agenda = ag.map(function (e) {
          return { date: e.date_texte, type: e.type, lieu: e.lieu, desc: e.description, lien: e.lien };
        });
        agenda();
      }
      if (im.length) {
        NABY.impact = im.map(function (e) { return { valeur: e.valeur, libelle: e.libelle }; });
        impact();
      }
      if (rg.length) {
        rg.forEach(function (e) {
          if (e.cle === 'impact_date' && !vide(e.valeur)) NABY.impactDate = e.valeur;
        });
        textes();
      }
      if (pa.length) {
        // La base ne connait pas la notion de partenaire principal : c'est un
        // choix editorial, pas une donnee que Nabintou saisit. On le reporte
        // donc par correspondance de nom depuis config.js, sinon la mise en
        // tete disparaitrait silencieusement des qu'elle ajoute un partenaire
        // depuis son espace.
        var enTete = {};
        (NABY.partenaires || []).forEach(function (p) {
          if (p.principal) enTete[String(p.nom).trim().toLowerCase()] = true;
        });
        NABY.partenaires = pa.map(function (e) {
          return {
            nom: e.nom,
            logo: e.logo,
            principal: enTete[String(e.nom || '').trim().toLowerCase()] === true,
          };
        });
        partenaires();
      }
      if (te.length) {
        NABY.temoignages = te.map(function (e) {
          return { texte: e.texte, auteur: e.auteur, role: e.role };
        });
        temoignages();
      }
      if (pr.length) {
        NABY.presse = pr.map(function (e) {
          return { source: e.source, citation: e.citation, url: e.url };
        });
        presse();
      }
      if (hi.length) {
        NABY.historique = hi.map(function (e) {
          return { annee: e.annee, titre: e.titre, desc: e.description };
        });
        historique();
      }
    });
  }

  /* ---------- Demarrage ---------- */
  function init() {
    bandeau();
    entete();
    icones();
    textes();
    distinctions();
    impact();
    agenda();
    historique();
    partenaires();
    presse();
    temoignages();
    formules();
    coordonnees();
    photos();
    integrations();
    formulaireContact();
    formulairePartenaire();
    pied();
    gardeFou();
    contenus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
