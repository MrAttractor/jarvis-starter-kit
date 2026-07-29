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

  // Rend une valeur, ou un marqueur "a fournir" si elle est absente.
  var val = function (v, attente) {
    if (v === null || v === undefined || v === '') {
      return '<span class="afournir">' + esc(attente || 'a fournir') + '</span>';
    }
    return esc(v);
  };

  var vide = function (v) {
    return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
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
    fleche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  };

  /* ---------- Navigation ---------- */
  var PAGES = [
    { cle: 'accueil', url: 'index.html', libelle: 'Accueil' },
    { cle: 'univers', url: 'univers.html', libelle: 'L\'Univers NabyCook' },
    { cle: 'association', url: 'association.html', libelle: 'L\'Association & l\'Impact' },
    { cle: 'adhesions', url: 'adhesions.html', libelle: 'Adherer' },
    { cle: 'contact', url: 'contact.html', libelle: 'Contact' },
  ];

  var pageCourante = document.body.getAttribute('data-page') || '';

  /* ---------- Bandeau maquette ---------- */
  function bandeau() {
    if (!NABY.maquette) return;
    var d = document.createElement('div');
    d.className = 'bandeau-maquette';
    d.innerHTML = '<b>Maquette de travail</b> — les zones soulignees en orange attendent les elements de NabyCook. Document interne, ne pas diffuser.';
    document.body.insertBefore(d, document.body.firstChild);
  }

  /* ---------- En-tete ---------- */
  function entete() {
    var cible = slot('entete');
    if (!cible) return;
    var liens = PAGES.map(function (p) {
      if (p.cle === 'adhesions') return '';
      var courant = p.cle === pageCourante ? ' aria-current="page"' : '';
      return '<li><a href="' + p.url + '"' + courant + '>' + esc(p.libelle) + '</a></li>';
    }).join('');

    cible.outerHTML =
      '<header class="entete" id="entete">' +
        '<div class="wrap entete-inner">' +
          '<a class="marque" href="index.html">' +
            '<img src="assets/logo-nabycook.jpg" alt="Logo NabyCook" width="56" height="56">' +
            '<span><span class="nom">NabyCook</span><span class="sous">Association loi 1901</span></span>' +
          '</a>' +
          '<button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><span></span></button>' +
          '<nav class="nav" id="menu" aria-label="Navigation principale">' +
            '<ul>' + liens + '</ul>' +
            '<a class="bouton bouton-1" href="adhesions.html">Adherer a l\'association</a>' +
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
      { cle: 'facebook', url: NABY.liens.facebook, nom: 'Facebook' },
      { cle: 'linkedin', url: NABY.liens.linkedin, nom: 'LinkedIn' },
    ].filter(function (r) { return !vide(r.url); });

    var htmlReseaux = reseaux.length
      ? '<div class="sociaux">' + reseaux.map(function (r) {
          return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener" aria-label="' + esc(r.nom) + '">' + ICONES[r.cle] + '</a>';
        }).join('') + '</div>'
      : '<p class="aide" style="color:rgba(247,242,231,.62)">Liens reseaux sociaux <span class="afournir">a fournir</span></p>';

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
                '<li>' + val(NABY.adresse, 'adresse a fournir') + '</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="bas">' +
            '<span>&copy; ' + new Date().getFullYear() + ' Association NabyCook · ' + esc(NABY.ville) + '</span>' +
            '<span>Site concu et realise par l\'agence Mr Attractor</span>' +
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
    if (vide(NABY.partenaires)) {
      cible.innerHTML =
        '<div class="logos">' +
          [1, 2, 3, 4, 5].map(function () {
            return '<div class="logo-slot">Logo partenaire<br><span class="afournir">a fournir</span></div>';
          }).join('') +
        '</div>';
      return;
    }
    cible.innerHTML =
      '<div class="logos">' +
        NABY.partenaires.map(function (p) {
          if (vide(p.logo)) return '<div class="logo-slot">' + esc(p.nom) + '</div>';
          return '<div class="logo-slot" style="border-style:solid"><img src="' + esc(p.logo) + '" alt="' + esc(p.nom) + '" style="max-height:56px;width:auto"></div>';
        }).join('') +
      '</div>';
  }

  /* ---------- Revue de presse ---------- */
  function presse() {
    var cible = slot('presse');
    if (!cible) return;
    if (vide(NABY.presse)) {
      cible.innerHTML =
        '<div class="bloc-afournir">' +
          '<span class="etiq-afournir">A fournir</span>' +
          '<h3>Revue de presse</h3>' +
          '<p class="lead" style="margin-bottom:0">Articles, passages radio ou television, publications des incubateurs : envoyez la source, la date et le lien. Chaque parution sera affichee ici avec sa citation.</p>' +
        '</div>';
      return;
    }
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
    if (vide(NABY.temoignages)) {
      cible.innerHTML =
        '<div class="bloc-afournir">' +
          '<span class="etiq-afournir">A fournir</span>' +
          '<h3>Ce qu\'en disent les participants</h3>' +
          '<p class="lead" style="margin-bottom:0">Trois temoignages suffisent : le texte, le prenom, et en quelle qualite la personne parle (participante, entreprise, partenaire). Rien n\'est invente ici.</p>' +
        '</div>';
      return;
    }
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
            ? '<a class="bouton bouton-1" href="' + esc(url) + '" target="_blank" rel="noopener">Adherer &mdash; ' + esc(f.nom) + '</a>'
            : '<span class="bouton bouton-1" style="opacity:.55;cursor:not-allowed" aria-disabled="true">Lien HelloAsso <span class="afournir">a fournir</span></span>';
          var qr = actif
            ? '<div class="qr"><span class="afournir">QR HelloAsso a deposer</span></div>'
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
        '<li><span class="icone">' + ICONES.tel + '</span><span><span class="k">Telephone</span><br><a class="v" href="tel:' + esc(NABY.telephoneLien) + '">' + esc(NABY.telephone) + '</a></span></li>' +
        '<li><span class="icone">' + ICONES.lieu + '</span><span><span class="k">Adresse</span><br><span class="v">' + val(NABY.adresse, 'adresse a fournir') + '</span></span></li>' +
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
          '<p>Il suffit du nom du compte Instagram et de l\'autorisation d\'integration. Les dernieres publications remonteront automatiquement, sans intervention.</p>' +
          '<span class="etiq-afournir">Compte Instagram a fournir</span>' +
        '</div>';
    } else if (ig) {
      ig.innerHTML =
        '<div class="embed-slot" style="border-style:solid">' +
          '<h4>Suivez NabyCook sur Instagram</h4>' +
          '<p>Les ateliers, les coulisses et les editions limitees de l\'epicerie, publies au fil des jours.</p>' +
          '<a class="bouton bouton-1" href="' + esc(NABY.liens.instagram) + '" target="_blank" rel="noopener">Voir le compte Instagram</a>' +
        '</div>';
    }
    var nl = slot('newsletter');
    if (nl && !(NABY.newsletter && !vide(NABY.liens.brevoFormulaire))) {
      nl.innerHTML =
        '<div class="embed-slot">' +
          '<h4>Le formulaire de newsletter s\'affichera ici</h4>' +
          '<p>Le compte Brevo est deja en place. Il manque l\'adresse du formulaire d\'inscription pour le brancher aux couleurs du site.</p>' +
          '<span class="etiq-afournir">Formulaire Brevo a fournir</span>' +
        '</div>';
    } else if (nl) {
      nl.innerHTML = '<iframe src="' + esc(NABY.liens.brevoFormulaire) + '" title="Inscription a la lettre NabyCook" style="width:100%;height:420px;border:0;border-radius:18px"></iframe>';
    }
    var jp = slot('jotform-partenaire');
    if (jp) {
      jp.innerHTML = '<iframe src="https://form.jotform.com/' + esc(NABY.jotform.partenaire) + '" title="Formulaire partenaire magasin" style="width:100%;min-height:760px;border:0;border-radius:18px;background:#FFFDF7" loading="lazy"></iframe>';
    }
  }

  /* ---------- Emplacements photo ---------- */
  function photos() {
    qa('[data-photo]').forEach(function (el) {
      var libelle = el.getAttribute('data-photo');
      el.innerHTML = ICONES.photo + '<b>' + esc(libelle) + '</b><span>Emplacement photo a fournir</span>';
    });
  }

  /* ---------- Icones posees dans le HTML ---------- */
  function icones() {
    qa('[data-icone]').forEach(function (el) {
      var nom = el.getAttribute('data-icone');
      if (ICONES[nom]) el.innerHTML = ICONES[nom];
    });
  }

  /* ---------- Garde-fou : coherence maquette / noindex ---------- */
  function gardeFou() {
    var meta = q('meta[name="robots"]');
    var noindex = meta && /noindex/i.test(meta.getAttribute('content') || '');
    if (!NABY.maquette && noindex) {
      console.warn('[NabyCook] NABY.maquette est a false mais la balise <meta name="robots" content="noindex"> est encore presente : le site ne sera pas reference. La retirer dans les 5 pages.');
    }
    if (NABY.maquette && !noindex) {
      console.warn('[NabyCook] Mode maquette actif mais la page est indexable. Ajouter <meta name="robots" content="noindex">.');
    }
  }

  /* ---------- Demarrage ---------- */
  function init() {
    bandeau();
    entete();
    icones();
    textes();
    distinctions();
    impact();
    partenaires();
    presse();
    temoignages();
    formules();
    coordonnees();
    photos();
    integrations();
    formulaireContact();
    pied();
    gardeFou();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
