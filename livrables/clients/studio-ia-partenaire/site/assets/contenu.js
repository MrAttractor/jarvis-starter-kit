/* ---------------------------------------------------------------------------
   Contenus pilotés par Emmanuel depuis /admin.

   Principe : le HTML du site garde ses textes d'origine. La table aic_contenu
   ne contient QUE ce qu'Emmanuel a modifié. Une clé absente = le site affiche
   son texte d'origine. Donc si la base ne répond pas, le site est intact.

   Le formulaire de l'admin lit ses valeurs de départ dans le HTML réel du site
   (via data-c), pas dans une liste recopiée ici : impossible de désynchroniser.
--------------------------------------------------------------------------- */
const CONTENU_SUPA_URL  = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const CONTENU_SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk';

/* Ce qu'Emmanuel peut modifier, dans l'ordre où ça apparaît sur son site.
   `t` : texte = une ligne · zone = paragraphe · lien = adresse web
         compteur = chiffre animé · video / image = fichier à charger
   Les libellés sont ceux qu'il verra : pas de jargon, pas de nom de code. */
const CONTENU_CHAMPS = [
  { section:"Écran d'accueil", desc:"Le premier écran, avant d'entrer sur le site.", champs:[
    { cle:'accueil.video',     lib:"Vidéo de fond",             t:'video', aide:"Vidéo courte en boucle, sans son. Garde-la légère : au-delà de 6 Mo le site s'ouvre lentement sur mobile." },
    { cle:'accueil.poster',    lib:"Image affichée avant la vidéo", t:'image', aide:"S'affiche le temps que la vidéo démarre." },
    { cle:'accueil.titre',     lib:"Titre",                     t:'texte' },
    { cle:'accueil.soustitre', lib:"Phrase sous le titre",      t:'zone' },
    { cle:'accueil.bouton',    lib:"Texte du bouton",           t:'texte' },
  ]},
  { section:"Bandeau principal", desc:"Le haut de la page, juste après l'écran d'accueil.", champs:[
    { cle:'hero.eyebrow', lib:"Petite étiquette du haut", t:'texte' },
    { cle:'hero.titre_a', lib:"Titre, première ligne",    t:'texte' },
    { cle:'hero.titre_b', lib:"Titre, mots en orange",    t:'texte' },
    { cle:'hero.titre_c', lib:"Titre, fin de phrase",     t:'texte' },
    { cle:'hero.texte',   lib:"Paragraphe de présentation", t:'zone' },
  ]},
  { section:"Le studio", desc:"La section qui te présente.", champs:[
    { cle:'studio.titre', lib:"Titre",              t:'texte' },
    { cle:'studio.para1', lib:"Premier paragraphe", t:'zone' },
    { cle:'studio.para2', lib:"Second paragraphe",  t:'zone' },
    { cle:'studio.photo', lib:"Ta photo",           t:'image' },
  ]},
  { section:"Tes chiffres", desc:"Les quatre compteurs animés. Mets tes chiffres réels.", champs:[
    { cle:'chiffre1.valeur', lib:"Chiffre 1",  t:'compteur' },
    { cle:'chiffre1.libelle',lib:"Libellé 1",  t:'texte' },
    { cle:'chiffre2.valeur', lib:"Chiffre 2",  t:'compteur' },
    { cle:'chiffre2.libelle',lib:"Libellé 2",  t:'texte' },
    { cle:'chiffre3.valeur', lib:"Chiffre 3",  t:'compteur' },
    { cle:'chiffre3.libelle',lib:"Libellé 3",  t:'texte' },
    { cle:'chiffre4.valeur', lib:"Chiffre 4",  t:'compteur' },
    { cle:'chiffre4.libelle',lib:"Libellé 4",  t:'texte' },
  ]},
  { section:"Formations IMAG'IN", desc:"Prix et liens de paiement de tes trois formations.", champs:[
    { cle:'formation1.prix', lib:"IMAG'IN 1 · prix",             t:'texte' },
    { cle:'formation1.lien', lib:"IMAG'IN 1 · lien de paiement", t:'lien' },
    { cle:'formation3.prix', lib:"IMAG'IN 3 · prix",             t:'texte' },
    { cle:'formation3.lien', lib:"IMAG'IN 3 · lien de paiement", t:'lien', aide:"Tant que ce lien est vide, le bouton renvoie vers le formulaire de contact." },
    { cle:'formation2.prix', lib:"IMAG'IN 2 · prix",             t:'texte' },
    { cle:'formation2.lien', lib:"IMAG'IN 2 · lien de paiement", t:'lien' },
  ]},
  { section:"Coaching privé", desc:"Les tarifs de tes deux formules.", champs:[
    { cle:'coaching1.prix', lib:"1 séance · prix",  t:'texte' },
    { cle:'coaching2.prix', lib:"Premium · prix",   t:'texte' },
  ]},
  { section:"Contact", desc:"Ce que les clients voient pour te joindre.", champs:[
    { cle:'contact.whatsapp', lib:"Numéro WhatsApp affiché", t:'texte', aide:"Change seulement le texte affiché. Pour changer le numéro qui reçoit les messages, préviens l'agence." },
    { cle:'contact.email',    lib:"Adresse email affichée",  t:'texte' },
    { cle:'contact.ville',    lib:"Ville",                   t:'texte' },
  ]},
];

/* index à plat, pour retrouver le type d'une clé sans reparcourir */
const CONTENU_TYPES = (()=>{ const m={}; CONTENU_CHAMPS.forEach(g=> g.champs.forEach(c=> m[c.cle]=c.t)); return m; })();

/* Lecture des valeurs modifiées. Renvoie toujours un objet, jamais une erreur :
   le site ne doit pas dépendre de la disponibilité de la base.
   La requête part dès le chargement du script (voir CONTENU_READY en bas de fichier),
   en parallèle du rendu de la page. */
async function loadContenu(){
  try{
    const r = await fetch(CONTENU_SUPA_URL + '/rest/v1/aic_contenu?select=cle,valeur',
      { headers:{ apikey: CONTENU_SUPA_ANON, Authorization:'Bearer ' + CONTENU_SUPA_ANON } });
    if(!r.ok) throw 0;
    const rows = await r.json();
    if(!Array.isArray(rows)) throw 0;
    const map = {};
    rows.forEach(x=>{ if(x.cle) map[x.cle] = x.valeur; });
    return map;
  }catch(_){ return {}; }
}

/* Applique une valeur sur son élément, selon le type du champ.
   Une valeur vide ou absente ne touche à rien : le texte d'origine reste. */
function applyContenuValue(el, cle, val){
  const t = CONTENU_TYPES[cle] || 'texte';
  if(val == null || val === '') return;
  if(t === 'lien'){ el.setAttribute('href', val); return; }
  if(t === 'image'){ el.setAttribute('src', val); return; }
  if(t === 'video'){
    // <source> ne suffit pas : il faut recharger la piste pour que le navigateur la prenne.
    if(el.tagName === 'VIDEO'){
      const s = el.querySelector('source');
      if(s) s.setAttribute('src', val); else el.setAttribute('src', val);
      /* load() et play() manquent ou ne renvoient pas de promesse sur certains
         WebView Android : sans ces gardes, une exception ici empêcherait
         l'application de TOUS les autres contenus. */
      try{ if(typeof el.load === 'function') el.load(); }catch(_){}
      try{ const p = el.play && el.play(); if(p && typeof p.catch === 'function') p.catch(()=>{}); }catch(_){}
    } else el.setAttribute('src', val);
    return;
  }
  if(t === 'compteur'){
    // l'animation lit data-to ; on réécrit aussi le texte au cas où elle a déjà tourné
    const n = String(val).replace(/[^\d]/g,'');
    if(!n) return;
    el.dataset.to = n;
    if(el.textContent.trim() !== '0') el.textContent = n + (+n >= 100 ? '+' : '');
    return;
  }
  el.textContent = val;   // texte et zone
}

/* Applique tout ce qui a été modifié. Sûr à appeler plusieurs fois. */
function applyContenu(map){
  if(!map) return;
  Object.keys(map).forEach(cle=>{
    const safe = cle.replace(/"/g,'');
    document.querySelectorAll('[data-c="'+safe+'"]').forEach(el=>{
      /* un champ qui échoue ne doit jamais empêcher les suivants de s'appliquer */
      try{ applyContenuValue(el, cle, map[cle]); }catch(_){}
    });
    /* cas du poster de vidéo : c'est un attribut de la balise <video>,
       pas un élément à lui seul, donc il porte son propre repère. */
    if(map[cle]) document.querySelectorAll('[data-c-poster="'+safe+'"]').forEach(el=>{
      el.setAttribute('poster', map[cle]);
    });
  });
}

/* La requête part immédiatement, sans attendre le reste de la page.
   Les pages font ensuite : CONTENU_READY.then(applyContenu) */
const CONTENU_READY = (typeof fetch === 'function') ? loadContenu() : Promise.resolve({});
