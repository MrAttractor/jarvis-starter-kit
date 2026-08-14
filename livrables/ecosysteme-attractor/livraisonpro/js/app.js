/* ===== LIVRAISON PRO v2.0 — APP PRINCIPALE ===== */

/* ---- État global ---- */
let currentUser = null;
let missions = [];
let livreurs = [];
let alertes = [];
let selectedLivreur = null;
let selectedRole = null;

const TRIAL_DAYS = 30;

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  setupOfflineDetection();
  animateSplash();
});

function animateSplash() {
  setTimeout(() => {
    const s = document.getElementById('splash');
    if (s) s.classList.add('done');
    setTimeout(initApp, 400);
  }, 1800);
}

async function initApp() {
  const saved = localStorage.getItem('lp_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showApp();
      await syncData(false);
    } catch (e) {
      localStorage.removeItem('lp_user');
      showOnboarding();
    }
  } else {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role')) {
      selectedRole = params.get('role');
      const card = document.getElementById('role-' + selectedRole);
      if (card) card.classList.add('selected');
      const extra = document.getElementById('livreur-extra');
      if (extra) extra.style.display = selectedRole === 'livreur' ? 'block' : 'none';
    }
    showOnboarding();
  }
}

/* ===== OFFLINE ===== */
function setupOfflineDetection() {
  const bar = document.getElementById('offline-bar');
  window.addEventListener('offline', () => { if (bar) bar.classList.add('show'); });
  window.addEventListener('online', () => { if (bar) bar.classList.remove('show'); });
  if (!navigator.onLine && bar) bar.classList.add('show');
}

/* ===== ONBOARDING ===== */
function showOnboarding() {
  document.getElementById('onboarding').style.display = 'block';
  document.getElementById('ob-step1').style.display = 'block';
  document.getElementById('ob-step2').style.display = 'none';
  document.getElementById('app').style.display = 'none';

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('m-date');
  if (dateInput) dateInput.value = today;
}

function selectRole(r) {
  selectedRole = r;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role-' + r)?.classList.add('selected');
  const extra = document.getElementById('livreur-extra');
  if (extra) extra.style.display = r === 'livreur' ? 'block' : 'none';
}

async function creerCompte() {
  const nom = document.getElementById('ob-nom').value.trim();
  const telRaw = document.getElementById('ob-tel').value.trim();
  const commune = document.getElementById('ob-commune').value;
  const errTel = document.getElementById('ob-err-tel');
  const errGlobal = document.getElementById('ob-err-global');

  errTel.style.display = 'none';
  errGlobal.style.display = 'none';

  if (!selectedRole) { toast('Choisissez votre rôle (Marchand ou Livreur)', 'rouge'); return; }
  if (!nom) { toast('Entrez votre prénom et nom', 'rouge'); return; }
  if (!valTel(telRaw)) { errTel.style.display = 'block'; return; }
  if (!commune) { toast('Choisissez votre commune', 'rouge'); return; }

  const tel = fmtTel(telRaw);

  if (selectedRole === 'livreur') {
    const vehicule = document.getElementById('ob-vehicule').value;
    const zones = document.getElementById('ob-zones').value.trim();
    if (!vehicule) { toast('Choisissez votre type de véhicule', 'rouge'); return; }
    if (!zones) { toast('Entrez vos zones de livraison', 'rouge'); return; }
  }

  const btn = document.getElementById('ob-submit');
  btn.disabled = true;
  btn.textContent = 'Création en cours...';

  showLoading('Création de votre compte...');

  const params = { action: 'createUser', nom, tel, role: selectedRole, commune };
  if (selectedRole === 'livreur') {
    params.vehicule = document.getElementById('ob-vehicule').value;
    params.zones = document.getElementById('ob-zones').value.trim();
  }

  const res = await api(params);
  hideLoading();
  btn.disabled = false;
  btn.textContent = "J'accepte et je crée mon compte";

  if (res.ok) {
    currentUser = { ...res.user, plan: res.user.plan || 'gratuit', trial_start: res.user.trial_start || new Date().toISOString() };
    localStorage.setItem('lp_user', JSON.stringify(currentUser));
    toast('Compte créé — bienvenue ' + currentUser.nom + ' !', 'vt');
    showStep2();
  } else {
    if (res.error && res.error.includes('existe')) {
      toast('Ce numéro est déjà enregistré. Reconnectez-vous.', 'rouge');
      openModal('modal-rc');
    } else {
      errGlobal.textContent = res.error || 'Erreur, réessayez';
      errGlobal.style.display = 'block';
    }
  }
}

function showStep2() {
  document.getElementById('ob-step1').style.display = 'none';
  const step2 = document.getElementById('ob-step2');
  step2.style.display = 'block';
  const os = detectOS();
  document.getElementById('pwa-android').style.display = os === 'android' ? 'block' : 'none';
  document.getElementById('pwa-ios').style.display = os === 'ios' ? 'block' : 'none';
  if (os === 'desktop') {
    document.getElementById('pwa-android').style.display = 'block';
  }
}

function finirOnboarding() {
  document.getElementById('onboarding').style.display = 'none';
  showApp();
  lancerVisite();
}

/* ===== RECONNEXION ===== */
async function doReconnexion() {
  const inp = document.getElementById('rc-input');
  const err = document.getElementById('rc-input-err');
  const btn = document.getElementById('rc-btn');
  const tel = inp.value.trim();

  err.style.display = 'none';

  if (!valTel(tel)) {
    err.textContent = 'Format invalide';
    err.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Recherche...';
  showLoading('Recherche du compte...');

  const res = await api({ action: 'getUser', tel: fmtTel(tel) });
  hideLoading();
  btn.disabled = false;
  btn.textContent = 'Rechercher mon compte';

  if (res.ok && res.user) {
    currentUser = res.user;
    localStorage.setItem('lp_user', JSON.stringify(currentUser));
    closeModal('modal-rc');
    document.getElementById('onboarding').style.display = 'none';
    toast('Rebonjour ' + currentUser.nom + ' !', 'vt');
    showApp();
    await syncData(false);
  } else {
    err.textContent = 'Numéro non trouvé. Créez un compte.';
    err.style.display = 'block';
  }
}

/* ===== APP ===== */
function showApp() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  buildNav();
  renderHeader();
  renderTrialBar();
  const role = currentUser?.role;
  if (role === 'marchand') {
    document.getElementById('l-screens').style.display = 'none';
    document.getElementById('m-screens').style.display = 'block';
    document.getElementById('fab').style.display = 'flex';
    showScreen('m-home');
  } else {
    document.getElementById('l-screens').style.display = 'block';
    document.getElementById('m-screens').style.display = 'none';
    document.getElementById('fab').style.display = 'none';
    showScreen('l-home');
  }
}

function renderHeader() {
  if (!currentUser) return;
  document.getElementById('hd-name').textContent = currentUser.nom?.split(' ')[0] || '';
  document.getElementById('hd-id').textContent = currentUser.id || '';
  const av = document.getElementById('hd-avatar');
  if (av) av.textContent = (currentUser.nom || 'U').charAt(0).toUpperCase();
}

/* ===== NAVIGATION ===== */
const NAV_MARCHAND = [
  { id: 'm-home', icon: svgHome(), label: 'Accueil' },
  { id: 'm-nouvelle', icon: svgPlus(), label: 'Nouvelle' },
  { id: 'm-alertes', icon: svgBell(), label: 'Alertes' },
  { id: 'm-rapport', icon: svgChart(), label: 'Rapport' },
];
const NAV_LIVREUR = [
  { id: 'l-home', icon: svgHome(), label: 'Accueil' },
  { id: 'l-missions', icon: svgList(), label: 'Missions' },
  { id: 'l-alertes', icon: svgBell(), label: 'Alertes' },
  { id: 'l-profil', icon: svgUser(), label: 'Profil' },
];

function buildNav() {
  const nav = document.getElementById('bottom-nav');
  const tabs = document.getElementById('tabs-c');
  if (!nav || !currentUser) return;
  const items = currentUser.role === 'marchand' ? NAV_MARCHAND : NAV_LIVREUR;
  nav.innerHTML = items.map(it => `
    <button class="nav-item" id="nav-${it.id}" onclick="showScreen('${it.id}')">
      <div class="nav-icon">${it.icon}</div>
      <div class="nav-label">${it.label}</div>
    </button>
  `).join('');
  if (tabs) tabs.innerHTML = '';
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sc = document.getElementById('sc-' + id);
  if (sc) sc.classList.add('active');
  const nb = document.getElementById('nav-' + id);
  if (nb) nb.classList.add('active');
  if (id === 'm-home') renderMHome();
  if (id === 'm-alertes') renderMAlertes();
  if (id === 'm-rapport') { const m = new Date().getMonth(); const s = document.getElementById('m-mois'); if (s) s.value = m; }
  if (id === 'l-home') renderLHome();
  if (id === 'l-missions') renderLMissions();
  if (id === 'l-alertes') renderLAlertes();
  if (id === 'l-profil') renderLProfil();
}

/* ===== SYNC ===== */
async function syncData(showFeedback = true) {
  if (!currentUser) return;
  const btn = document.getElementById('sync-btn');
  if (btn) btn.classList.add('spin');
  if (showFeedback) showLoading('Synchronisation...');

  const [rMissions, rLivreurs, rAlertes] = await Promise.all([
    api({ action: 'getMissions', userId: currentUser.id }),
    api({ action: 'getLivreurs', commune: currentUser.commune }),
    api({ action: 'getAlertes', userId: currentUser.id }),
  ]);

  if (rMissions.ok) missions = rMissions.missions || [];
  if (rLivreurs.ok) livreurs = rLivreurs.livreurs || [];
  if (rAlertes.ok) alertes = rAlertes.alertes || [];

  if (btn) btn.classList.remove('spin');
  if (showFeedback) { hideLoading(); toast('Données à jour', 'vt'); }

  const cur = currentUser.role;
  if (cur === 'marchand') renderMHome();
  else { renderLHome(); renderLMissions(); updateDispoBtn(); }

  updateAlertBadges();
  fillMissionSelects();
}

function updateAlertBadges() {
  const unread = alertes.filter(a => !a.lu).length;
  const navAlerte = currentUser?.role === 'marchand' ? document.getElementById('nav-m-alertes') : document.getElementById('nav-l-alertes');
  if (navAlerte) {
    const old = navAlerte.querySelector('.badge');
    if (old) old.remove();
    if (unread > 0) {
      const b = document.createElement('div');
      b.className = 'badge';
      b.textContent = unread;
      navAlerte.querySelector('.nav-icon').appendChild(b);
    }
  }
}

function fillMissionSelects() {
  const mine = missions.filter(m => {
    if (currentUser.role === 'livreur') return m.livreur_id === currentUser.id && !['livre','echec','annule'].includes(m.status);
    return m.marchand_id === currentUser.id && !['livre','echec','annule'].includes(m.status);
  });
  const opts = '<option value="">Choisir...</option>' + mine.map(m => `<option value="${m.id}">${m.id} — ${m.dest_nom}</option>`).join('');
  ['l-al-mission', 'm-al-liv'].forEach(id => { const s = document.getElementById(id); if (s) s.innerHTML = opts; });
}

/* ===== MARCHAND HOME ===== */
function renderMHome() {
  if (!currentUser || currentUser.role !== 'marchand') return;
  const mes = missions.filter(m => m.marchand_id === currentUser.id);
  const mois = new Date().getMonth();
  const moisMissions = mes.filter(m => new Date(m.created_at).getMonth() === mois);
  const ok = mes.filter(m => m.status === 'livre');
  const route = mes.filter(m => ['accepte','recupere','enroute'].includes(m.status));
  const alNonLues = alertes.filter(a => !a.lu).length;
  const vol = moisMissions.filter(m => m.status === 'livre').reduce((s, m) => s + (m.frais || 0), 0);

  document.getElementById('m-total').textContent = mes.length;
  document.getElementById('m-ok').textContent = ok.length + ' livrés';
  document.getElementById('m-vol').textContent = vol.toLocaleString('fr-FR');
  document.getElementById('m-route').textContent = route.length;
  document.getElementById('m-alrt').textContent = alNonLues;

  const el = document.getElementById('m-recent');
  const recent = [...mes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  el.innerHTML = recent.length ? recent.map(missionCardM).join('') : emptyState('📦', 'Aucune livraison pour l\'instant');

  renderTrialBar();
}

/* ===== LIVREUR HOME ===== */
function renderLHome() {
  if (!currentUser || currentUser.role !== 'livreur') return;
  const mes = missions.filter(m => m.livreur_id === currentUser.id);
  const today = new Date().toDateString();
  const auj = mes.filter(m => new Date(m.created_at).toDateString() === today);
  const ok = auj.filter(m => m.status === 'livre');
  const route = mes.filter(m => ['accepte','recupere','enroute'].includes(m.status));
  const mois = new Date().getMonth();
  const ca = mes.filter(m => m.status === 'livre' && new Date(m.created_at).getMonth() === mois)
                .reduce((s, m) => s + (m.frais || 0), 0);
  const alNonLues = alertes.filter(a => !a.lu).length;

  document.getElementById('l-auj').textContent = auj.length;
  document.getElementById('l-auj-ok').textContent = ok.length + ' livrées';
  document.getElementById('l-ca').textContent = ca.toLocaleString('fr-FR');
  document.getElementById('l-route').textContent = route.length;
  document.getElementById('l-alrt').textContent = alNonLues;

  const el = document.getElementById('l-today');
  const aujourdhui = auj.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  el.innerHTML = aujourdhui.length ? aujourdhui.map(missionCardL).join('') : emptyState('🛵', 'Aucune mission aujourd\'hui');

  renderTrialBar();
}

function renderLMissions() {
  if (!currentUser || currentUser.role !== 'livreur') return;
  const mes = missions.filter(m => m.livreur_id === currentUser.id);
  const sorted = [...mes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const el = document.getElementById('l-all');
  el.innerHTML = sorted.length ? sorted.map(missionCardL).join('') : emptyState('📋', 'Aucune mission encore');
}

/* ===== DISPONIBILITÉ ===== */
function updateDispoBtn() {
  const btn = document.getElementById('dispo-btn');
  const icon = document.getElementById('dispo-icon');
  const txt = document.getElementById('dispo-txt');
  if (!btn) return;
  const dispo = currentUser?.disponible;
  btn.className = 'dispo-btn ' + (dispo ? 'on' : 'off');
  icon.innerHTML = dispo ? svgCheckCircle() : svgXCircle();
  txt.textContent = dispo ? 'Disponible — je reçois des missions' : 'Je suis disponible aujourd\'hui';
}

async function toggleDispo() {
  if (!currentUser) return;
  const newVal = !currentUser.disponible;
  currentUser.disponible = newVal;
  localStorage.setItem('lp_user', JSON.stringify(currentUser));
  updateDispoBtn();
  await api({ action: 'updateDispo', userId: currentUser.id, tel: currentUser.tel, disponible: newVal });
  toast(newVal ? 'Vous êtes maintenant disponible' : 'Vous êtes maintenant indisponible', newVal ? 'vt' : '');
}

/* ===== CRÉER LIVRAISON ===== */
function calcDistance() {
  const commune = document.getElementById('m-commune').value;
  if (!commune || !currentUser) return;
  const km = getDistance(currentUser.commune, commune);
  const prix = getPrix(km, 'marchand');
  const dr = document.getElementById('dist-result');
  const dkm = document.getElementById('dist-km');
  const dp = document.getElementById('dist-prix');
  if (km && dr) {
    dr.style.display = 'block';
    dkm.textContent = km + ' km estimés';
    dp.textContent = 'Tarif suggéré : ' + prix.toLocaleString('fr-FR') + ' FCFA';
    const fraisInput = document.getElementById('m-frais');
    if (fraisInput && !fraisInput.value) fraisInput.value = prix;
  }
}

function getDistance(from, to) {
  if (!from || !to) return null;
  return DIST[from]?.[to] || null;
}

async function creerLivraison() {
  const dest = document.getElementById('m-dest').value.trim();
  const destTelRaw = document.getElementById('m-dest-tel').value.trim();
  const depart = document.getElementById('m-depart').value.trim();
  const commune = document.getElementById('m-commune').value;
  const arrivee = document.getElementById('m-arrivee').value.trim();
  const frais = document.getElementById('m-frais').value;
  const paiement = document.getElementById('m-paiement').value;
  const desc = document.getElementById('m-desc').value.trim();
  const date = document.getElementById('m-date').value;
  const livreurNom = document.getElementById('m-livreur-nom').value.trim();
  const livreurTelRaw = document.getElementById('m-livreur-tel').value.trim();

  const telErr = document.getElementById('m-tel-err');
  telErr.style.display = 'none';

  if (!dest) { toast('Entrez le nom de la destinataire', 'rouge'); return; }
  if (!commune) { toast('Choisissez la commune de livraison', 'rouge'); return; }
  if (!arrivee) { toast('Entrez l\'adresse de livraison', 'rouge'); return; }
  if (destTelRaw && !valTel(destTelRaw)) { telErr.style.display = 'block'; return; }
  if (!frais) { toast('Entrez les frais de livraison', 'rouge'); return; }

  let livreurTel = livreurTelRaw;
  if (livreurTelRaw && !valTel(livreurTelRaw)) { toast('Format du tel livreur invalide', 'rouge'); return; }
  if (livreurTelRaw) livreurTel = fmtTel(livreurTelRaw);

  if (!selectedLivreur && !livreurNom) { toast('Choisissez ou entrez un livreur', 'rouge'); return; }

  const btn = document.getElementById('btn-creer');
  btn.disabled = true;
  btn.textContent = 'Création...';
  showLoading('Création de la livraison...');

  const params = {
    action: 'createMission',
    marchand_id: currentUser.id,
    marchand_nom: currentUser.nom,
    livreur_id: selectedLivreur?.id || '',
    livreur_nom: selectedLivreur ? selectedLivreur.nom : livreurNom,
    livreur_tel: selectedLivreur ? selectedLivreur.tel : livreurTel,
    dest_nom: dest,
    dest_tel: destTelRaw ? fmtTel(destTelRaw) : '',
    adresse_depart: depart,
    adresse: arrivee,
    commune,
    description: desc,
    frais: parseInt(frais) || 0,
    mode_paiement: paiement,
    distance_km: getDistance(currentUser.commune, commune) || 0,
    date_souhaitee: date,
  };

  const res = await api(params);
  hideLoading();
  btn.disabled = false;
  btn.textContent = 'Créer la livraison';

  if (res.ok) {
    missions.unshift(res.mission);
    selectedLivreur = null;
    document.getElementById('livreur-sel').style.display = 'none';
    document.getElementById('livreur-choice').style.display = 'block';
    clearForm();
    toast('Livraison créée — ' + res.mission.id, 'vt');
    showScreen('m-home');
    if (res.mission.livreur_tel) {
      setTimeout(() => notifierLivreur(res.mission), 800);
    }
  } else {
    toast(res.error || 'Erreur, réessayez', 'rouge');
  }
}

function clearForm() {
  ['m-dest', 'm-dest-tel', 'm-depart', 'm-arrivee', 'm-frais', 'm-desc', 'm-livreur-nom', 'm-livreur-tel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['m-commune', 'm-paiement'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const dr = document.getElementById('dist-result');
  if (dr) dr.style.display = 'none';
}

function notifierLivreur(mission) {
  const msg = encodeURIComponent(
    `Bonjour ${mission.livreur_nom},\n\nNouvelle mission Livraison Pro :\n` +
    `📦 Mission : ${mission.id}\n` +
    `👤 Destinataire : ${mission.dest_nom}\n` +
    `📍 Livraison : ${mission.adresse} (${mission.commune})\n` +
    `💰 Frais : ${(mission.frais || 0).toLocaleString('fr-FR')} FCFA\n\n` +
    `Confirmez votre acceptation sur l'app.`
  );
  const tel = mission.livreur_tel?.replace(/\s/g, '').replace('+', '');
  if (tel) window.open('https://wa.me/' + tel + '?text=' + msg, '_blank');
}

/* ===== CATALOGUE LIVREURS ===== */
function voirCatalogue() {
  const commune = document.getElementById('m-commune').value || currentUser?.commune;
  const disponibles = livreurs.filter(l => l.disponible && (!commune || l.commune === commune || (l.zones && l.zones.includes(commune))));
  const content = document.getElementById('modal-cat-content');

  if (!disponibles.length) {
    content.innerHTML = emptyState('🛵', 'Aucun livreur disponible dans cette zone pour l\'instant');
  } else {
    content.innerHTML = disponibles.map(l => livreurCatalogueCard(l)).join('');
  }
  openModal('modal-catalogue');
}

function livreurCatalogueCard(l) {
  const note = parseFloat(l.note || 5).toFixed(1);
  return `
  <div class="cat-card" onclick="choisirLivreur('${l.id}')">
    <div class="cat-avatar">${(l.nom || 'L').charAt(0).toUpperCase()}</div>
    <div class="cat-info">
      <div class="cat-nom">
        ${l.nom}
        ${l.verifie ? `<span class="cat-badge">${svgCheckBadge()}</span>` : ''}
      </div>
      <div class="cat-meta">${l.vehicule || 'Moto'} · ${l.commune}</div>
      ${l.zones ? `<div class="cat-zones">Zones : ${l.zones}</div>` : ''}
    </div>
    <div class="cat-right">
      <div class="cat-note">★ ${note}</div>
      <div class="cat-missions">${l.nb_missions || 0} livr.</div>
    </div>
  </div>`;
}

function choisirLivreur(id) {
  selectedLivreur = livreurs.find(l => l.id === id);
  if (!selectedLivreur) return;
  document.getElementById('livreur-sel-nom').textContent = selectedLivreur.nom + ' (' + selectedLivreur.vehicule + ')';
  document.getElementById('livreur-sel').style.display = 'block';
  document.getElementById('livreur-choice').style.display = 'none';
  closeModal('modal-catalogue');
  toast(selectedLivreur.nom + ' sélectionné', 'vt');
}

function changerLivreur() {
  selectedLivreur = null;
  document.getElementById('livreur-sel').style.display = 'none';
  document.getElementById('livreur-choice').style.display = 'block';
}

/* ===== INVITER LIVREUR ===== */
function inviterLivreur() {
  const msg = encodeURIComponent(
    `Bonjour ! Je vous invite à rejoindre Livraison Pro pour recevoir des missions de livraison vérifiées.\n\nInscrivez-vous ici : ${window.location.origin}/app.html?role=livreur`
  );
  window.open('https://wa.me/?text=' + msg, '_blank');
}

/* ===== MISSION CARDS ===== */
function missionCardM(m) {
  const st = STATUTS[m.status] || { label: m.status, color: 'gris' };
  return `
  <div class="mission-card" onclick="showMissionDetail('${m.id}')">
    <div class="mc-top">
      <div class="mc-id">${m.id}</div>
      <span class="status-badge ${st.color}">${st.label}</span>
    </div>
    <div class="mc-dest">${m.dest_nom}${m.dest_tel ? ' · ' + m.dest_tel : ''}</div>
    <div class="mc-addr">📍 ${m.adresse}, ${m.commune}</div>
    <div class="mc-row">
      <span class="mc-livreur">${m.livreur_nom || 'Non assigné'}</span>
      <span class="mc-frais">${(m.frais || 0).toLocaleString('fr-FR')} FCFA</span>
    </div>
    <div class="mc-date">${fmtDate(m.created_at)}</div>
  </div>`;
}

function missionCardL(m) {
  const st = STATUTS[m.status] || { label: m.status, color: 'gris' };
  const actions = nextActions(m.status);
  return `
  <div class="mission-card" onclick="showMissionDetail('${m.id}')">
    <div class="mc-top">
      <div class="mc-id">${m.id}</div>
      <span class="status-badge ${st.color}">${st.label}</span>
    </div>
    <div class="mc-dest">${m.dest_nom}</div>
    <div class="mc-addr">📍 ${m.adresse}, ${m.commune}</div>
    <div class="mc-row">
      <span class="mc-livreur">👤 ${m.marchand_nom || 'Marchand'}</span>
      <span class="mc-frais">${(m.frais || 0).toLocaleString('fr-FR')} FCFA</span>
    </div>
    ${actions.length ? `<div class="mc-actions">${actions.map(a => `<button class="btn-action btn-${a.color}" onclick="changerStatut(event,'${m.id}','${a.to}')">${a.label}</button>`).join('')}</div>` : ''}
    <div class="mc-date">${fmtDate(m.created_at)}</div>
  </div>`;
}

function nextActions(status) {
  const map = {
    attente:    [{ to: 'accepte',   label: 'Accepter',          color: 'vt' }, { to: 'annule', label: 'Refuser', color: 'rouge' }],
    accepte:    [{ to: 'recupere',  label: 'Colis récupéré',    color: 'or' }],
    recupere:   [{ to: 'enroute',   label: 'En route',          color: 'or' }],
    enroute:    [{ to: 'livre',     label: 'Livraison confirmée', color: 'vt' }, { to: 'echec', label: 'Échec', color: 'rouge' }],
  };
  return map[status] || [];
}

async function changerStatut(e, missionId, newStatus) {
  e.stopPropagation();
  showLoading('Mise à jour...');
  const res = await api({ action: 'updateStatus', id: missionId, status: newStatus, userId: currentUser.id });
  hideLoading();
  if (res.ok) {
    const idx = missions.findIndex(m => m.id === missionId);
    if (idx >= 0) missions[idx].status = newStatus;
    toast(STATUTS[newStatus]?.label + ' !', 'vt');
    renderLHome();
    renderLMissions();
    if (newStatus === 'livre') {
      setTimeout(() => genBon(missionId), 500);
    }
  } else {
    toast(res.error || 'Erreur', 'rouge');
  }
}

/* ===== DÉTAIL MISSION ===== */
function showMissionDetail(id) {
  const m = missions.find(x => x.id === id);
  if (!m) return;
  const st = STATUTS[m.status] || { label: m.status, color: 'gris' };
  const steps = ['attente','accepte','recupere','enroute','livre'];
  const cur = steps.indexOf(m.status);

  const timelineHtml = steps.map((s, i) => {
    const done = i <= cur && m.status !== 'annule' && m.status !== 'echec';
    const info = STATUTS[s] || { label: s };
    return `<div class="tl-item ${done ? 'done' : ''}">
      <div class="tl-dot"></div>
      <div class="tl-info">
        <div class="tl-label">${info.label}</div>
        ${m[s + '_at'] ? `<div class="tl-date">${fmtDate(m[s + '_at'])}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  const html = `
    <div class="modal-title">Mission ${m.id}</div>
    <span class="status-badge ${st.color}" style="margin-bottom:12px;display:inline-block">${st.label}</span>
    <div class="detail-row"><span class="dr-label">Destinataire</span><span class="dr-val">${m.dest_nom}</span></div>
    ${m.dest_tel ? `<div class="detail-row"><span class="dr-label">Tél.</span><span class="dr-val">${m.dest_tel}</span></div>` : ''}
    <div class="detail-row"><span class="dr-label">Adresse</span><span class="dr-val">${m.adresse}, ${m.commune}</span></div>
    <div class="detail-row"><span class="dr-label">Frais</span><span class="dr-val">${(m.frais || 0).toLocaleString('fr-FR')} FCFA — ${m.mode_paiement || '-'}</span></div>
    ${m.livreur_nom ? `<div class="detail-row"><span class="dr-label">Livreur</span><span class="dr-val">${m.livreur_nom}</span></div>` : ''}
    ${m.description ? `<div class="detail-row"><span class="dr-label">Colis</span><span class="dr-val">${m.description}</span></div>` : ''}
    <div class="st" style="margin:12px 0 8px">Suivi</div>
    <div class="timeline">${timelineHtml}</div>
    ${m.status === 'livre' ? `<button class="btn btn-or" style="margin-top:12px" onclick="genBon('${m.id}')">Voir le bon de livraison</button>` : ''}
    ${m.livreur_tel ? `<button class="btn btn-vt" style="margin-top:8px" onclick="waLivreur('${m.livreur_tel}','${m.livreur_nom}')">Contacter le livreur</button>` : ''}
  `;
  document.getElementById('modal-mission-content').innerHTML = html;
  openModal('modal-mission');
}

function waLivreur(tel, nom) {
  const t = tel.replace(/\s/g, '').replace('+', '');
  window.open('https://wa.me/' + t + '?text=' + encodeURIComponent('Bonjour ' + nom + ' — message de Livraison Pro'), '_blank');
}

/* ===== BON DE LIVRAISON ===== */
async function genBon(missionId) {
  const m = missions.find(x => x.id === missionId);
  if (!m) return;

  const bon = document.createElement('div');
  bon.id = 'bon-print';
  bon.innerHTML = `
    <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;border:2px solid #009A44">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:18px;font-weight:900;color:#009A44">BON DE LIVRAISON</div>
        <div style="font-size:11px;color:#666">Livraison Pro — ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:6px 0;color:#666;width:40%">N° Mission</td><td style="font-weight:700">${m.id}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Marchand</td><td>${m.marchand_nom}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Livreur</td><td>${m.livreur_nom || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Destinataire</td><td>${m.dest_nom}</td></tr>
        ${m.dest_tel ? `<tr><td style="padding:6px 0;color:#666">Tél. dest.</td><td>${m.dest_tel}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#666">Adresse</td><td>${m.adresse}, ${m.commune}</td></tr>
        ${m.description ? `<tr><td style="padding:6px 0;color:#666">Contenu</td><td>${m.description}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#666">Frais</td><td style="font-weight:700;color:#009A44">${(m.frais || 0).toLocaleString('fr-FR')} FCFA — ${m.mode_paiement || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Date</td><td>${fmtDate(m.livre_at || m.created_at)}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Statut</td><td style="color:#009A44;font-weight:700">LIVRÉ ✓</td></tr>
      </table>
      <div style="margin-top:20px;border-top:1px solid #eee;padding-top:12px;display:flex;justify-content:space-between">
        <div style="text-align:center;width:45%">
          <div style="height:40px;border-bottom:1px solid #333"></div>
          <div style="font-size:10px;color:#666;margin-top:4px">Signature marchand</div>
        </div>
        <div style="text-align:center;width:45%">
          <div style="height:40px;border-bottom:1px solid #333"></div>
          <div style="font-size:10px;color:#666;margin-top:4px">Signature livreur</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:12px;font-size:10px;color:#999">Ce bon est la preuve officielle de la livraison.</div>
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;overflow-y:auto;padding:20px';
  overlay.appendChild(bon);

  const actions = document.createElement('div');
  actions.style.cssText = 'text-align:center;margin-top:16px;display:flex;gap:12px;justify-content:center';
  const btnPrint = document.createElement('button');
  btnPrint.textContent = 'Imprimer';
  btnPrint.style.cssText = 'padding:12px 24px;background:#009A44;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer';
  btnPrint.onclick = () => window.print();
  const btnClose = document.createElement('button');
  btnClose.textContent = 'Fermer';
  btnClose.style.cssText = 'padding:12px 24px;background:#444;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer';
  btnClose.onclick = () => document.body.removeChild(overlay);
  actions.appendChild(btnPrint);
  actions.appendChild(btnClose);
  overlay.appendChild(actions);

  document.body.appendChild(overlay);
}

/* ===== ALERTES ===== */
async function envoyerAlerteL() {
  const mission = document.getElementById('l-al-mission').value;
  const type = document.getElementById('l-al-type').value;
  const desc = document.getElementById('l-al-desc').value.trim();
  if (!mission || !type) { toast('Choisissez la mission et le type d\'alerte', 'rouge'); return; }
  showLoading('Envoi...');
  const res = await api({ action: 'sendAlerte', mission_id: mission, from_role: 'livreur', from_nom: currentUser.nom, type, description: desc });
  hideLoading();
  if (res.ok) { toast('Alerte envoyée', 'vt'); renderLAlertes(); document.getElementById('l-al-desc').value = ''; }
  else toast(res.error || 'Erreur', 'rouge');
}

async function envoyerAlerteM() {
  const liv = document.getElementById('m-al-liv').value;
  const type = document.getElementById('m-al-type').value;
  const msg = document.getElementById('m-al-msg').value.trim();
  if (!liv || !type) { toast('Choisissez la livraison et le type', 'rouge'); return; }
  showLoading('Envoi...');
  const res = await api({ action: 'sendAlerte', mission_id: liv, from_role: 'marchand', from_nom: currentUser.nom, type, description: msg });
  hideLoading();
  if (res.ok) { toast('Alerte envoyée', 'vt'); renderMAlertes(); document.getElementById('m-al-msg').value = ''; }
  else toast(res.error || 'Erreur', 'rouge');
}

function renderLAlertes() {
  const el = document.getElementById('l-al-sent');
  const mes = alertes.filter(a => a.from_role === 'livreur');
  el.innerHTML = mes.length ? mes.map(alerteCard).join('') : emptyState('🔔', 'Aucune alerte envoyée');
}

function renderMAlertes() {
  const el = document.getElementById('m-al-recues');
  const recues = alertes.filter(a => a.from_role === 'livreur');
  el.innerHTML = recues.length ? recues.map(alerteCard).join('') : emptyState('🔔', 'Aucune alerte de vos livreurs');
}

function alerteCard(a) {
  return `
  <div class="alerte-card ${a.lu ? '' : 'non-lue'}">
    <div class="al-top">
      <span class="al-type">${a.type}</span>
      <span class="al-date">${fmtDate(a.created_at)}</span>
    </div>
    <div class="al-mission">Mission : ${a.mission_id}</div>
    ${a.description ? `<div class="al-desc">${a.description}</div>` : ''}
  </div>`;
}

/* ===== RAPPORT MENSUEL ===== */
function genRapport() {
  const mois = parseInt(document.getElementById('m-mois').value);
  const mes = missions.filter(m => m.marchand_id === currentUser.id && new Date(m.created_at).getMonth() === mois);
  const livres = mes.filter(m => m.status === 'livre');
  const annules = mes.filter(m => m.status === 'annule');
  const ca = livres.reduce((s, m) => s + (m.frais || 0), 0);
  const communes = {};
  mes.forEach(m => { communes[m.commune] = (communes[m.commune] || 0) + 1; });
  const topCommune = Object.entries(communes).sort((a, b) => b[1] - a[1])[0];

  const el = document.getElementById('m-rapport-result');
  el.innerHTML = `
  <div class="card">
    <div class="card-title">Résumé du mois</div>
    <div class="rapport-row"><span>Total livraisons</span><strong>${mes.length}</strong></div>
    <div class="rapport-row"><span>Livrées avec succès</span><strong style="color:var(--vt)">${livres.length}</strong></div>
    <div class="rapport-row"><span>Annulées / Échec</span><strong style="color:#e53">${annules.length}</strong></div>
    <div class="rapport-row"><span>Volume total FCFA</span><strong style="color:var(--or)">${ca.toLocaleString('fr-FR')}</strong></div>
    ${topCommune ? `<div class="rapport-row"><span>Zone principale</span><strong>${topCommune[0]} (${topCommune[1]})</strong></div>` : ''}
    <div class="rapport-row"><span>Taux de succès</span><strong>${mes.length ? Math.round(livres.length / mes.length * 100) : 0}%</strong></div>
  </div>`;
}

/* ===== PROFIL LIVREUR ===== */
function renderLProfil() {
  const mes = missions.filter(m => m.livreur_id === currentUser.id);
  const livres = mes.filter(m => m.status === 'livre');
  const ca = livres.reduce((s, m) => s + (m.frais || 0), 0);
  const el = document.getElementById('l-stats');
  el.innerHTML = `
    <div class="rapport-row"><span>Missions totales</span><strong>${mes.length}</strong></div>
    <div class="rapport-row"><span>Livrées</span><strong style="color:var(--vt)">${livres.length}</strong></div>
    <div class="rapport-row"><span>CA total FCFA</span><strong style="color:var(--or)">${ca.toLocaleString('fr-FR')}</strong></div>
    <div class="rapport-row"><span>Note</span><strong>★ ${parseFloat(currentUser.note || 5).toFixed(1)}</strong></div>
    <div class="rapport-row"><span>Statut</span><strong>${currentUser.verifie ? '✓ Vérifié' : 'Non vérifié'}</strong></div>
  `;
  renderPlanBadge('l');
}

/* ===== TRIAL BAR ===== */
function renderTrialBar() {
  if (!currentUser) return;
  const isGratuit = currentUser.plan === 'gratuit';
  const trialsIds = currentUser.role === 'marchand' ? 'm-trial' : 'l-trial';
  const el = document.getElementById(trialsIds);
  if (!el) return;
  if (!isGratuit) { el.innerHTML = ''; return; }

  const start = new Date(currentUser.trial_start || currentUser.created_at || Date.now());
  const diff = Math.floor((Date.now() - start.getTime()) / 86400000);
  const remaining = TRIAL_DAYS - diff;

  if (remaining > 0) {
    el.innerHTML = `<div class="trial-bar">Période d'essai — <strong>${remaining} jours restants</strong> <button onclick="showUpgrade()" class="trial-btn">Passer Pro</button></div>`;
  } else {
    el.innerHTML = `<div class="trial-bar expired">Essai terminé — <button onclick="showUpgrade()" class="trial-btn">Activer Pro (2000 FCFA/mois)</button></div>`;
  }
}

function renderPlanBadge(role) {
  const id = role === 'livreur' ? 'l-plan' : 'm-plan';
  const el = document.getElementById(id);
  if (!el || !currentUser) return;
  if (currentUser.plan === 'pro') {
    el.innerHTML = `<div class="plan-badge pro">Plan Pro actif — GPS temps réel inclus</div>`;
  }
}

function showUpgrade() {
  const msg = encodeURIComponent(
    `Bonjour, je voudrais passer au plan Pro Livraison Pro (2000 FCFA/mois).\n` +
    `Mon ID : ${currentUser?.id}\n` +
    `Mon nom : ${currentUser?.nom}`
  );
  window.open('https://wa.me/33753902323?text=' + msg, '_blank');
}

/* ===== VÉRIFICATION CNI ===== */
function demanderVerification() {
  const msg = encodeURIComponent(
    `Bonjour, je souhaite faire vérifier mon compte Livraison Pro.\n` +
    `Mon ID : ${currentUser?.id}\n` +
    `Mon nom : ${currentUser?.nom}\n\n` +
    `Je vais envoyer mes photos CNI recto/verso.`
  );
  window.open('https://wa.me/33753902323?text=' + msg, '_blank');
}

/* ===== AIDE ===== */
function showAide(role) {
  const content = role === 'livreur' ? aidelivreur() : aideMarchand();
  document.getElementById('modal-aide-content').innerHTML = content;
  openModal('modal-aide');
}

function aideMarchand() {
  return `
  <div class="faq-item"><div class="faq-q">Comment créer une livraison ?</div><div class="faq-a">Allez dans l'onglet "Nouvelle" et remplissez le formulaire. Choisissez un livreur dans le catalogue ou entrez ses coordonnées manuellement.</div></div>
  <div class="faq-item"><div class="faq-q">Comment payer les frais ?</div><div class="faq-a">Les frais sont réglés directement entre vous et le livreur (Wave, MTN Money, espèces). Livraison Pro ne touche pas les paiements.</div></div>
  <div class="faq-item"><div class="faq-q">Comment obtenir le bon de livraison ?</div><div class="faq-a">Quand le livreur confirme la livraison, le bon est automatiquement généré depuis la fiche de la mission.</div></div>
  <div class="faq-item"><div class="faq-q">Contacter le support</div><div class="faq-a"><button class="btn btn-vt" onclick="waSupport()">Écrire sur WhatsApp</button></div></div>
  `;
}

function aidelivreur() {
  return `
  <div class="faq-item"><div class="faq-q">Comment recevoir des missions ?</div><div class="faq-a">Activez votre disponibilité sur l'écran d'accueil. Les marchands pourront vous trouver dans le catalogue. Vous serez contacté sur WhatsApp.</div></div>
  <div class="faq-item"><div class="faq-q">Comment confirmer une livraison ?</div><div class="faq-a">Sur la fiche de la mission, appuyez sur les boutons d'étapes : Accepter → Colis récupéré → En route → Livraison confirmée.</div></div>
  <div class="faq-item"><div class="faq-q">Comment me faire vérifier ?</div><div class="faq-a">Allez dans "Profil" et cliquez "Demander ma vérification". Envoyez votre CNI recto/verso sur WhatsApp. Traitement en 24h.</div></div>
  <div class="faq-item"><div class="faq-q">Contacter le support</div><div class="faq-a"><button class="btn btn-vt" onclick="waSupport()">Écrire sur WhatsApp</button></div></div>
  `;
}

function waSupport() {
  window.open('https://wa.me/33753902323?text=' + encodeURIComponent('Bonjour, j\'ai besoin d\'aide avec Livraison Pro.'), '_blank');
}

/* ===== DÉCONNEXION ===== */
function seDeconnecter() {
  if (!confirm('Se déconnecter ?')) return;
  localStorage.removeItem('lp_user');
  currentUser = null;
  missions = [];
  livreurs = [];
  alertes = [];
  selectedLivreur = null;
  document.getElementById('app').style.display = 'none';
  showOnboarding();
}

/* ===== VISITE GUIDÉE ===== */
const VISITE_MARCHAND = [
  { title: 'Bienvenue', body: 'Livraison Pro connecte vos livraisons à des livreurs vérifiés à Abidjan. Voici comment ça marche en 3 étapes.' },
  { title: '1. Créer une livraison', body: 'Onglet "Nouvelle" : entrez les infos du colis et choisissez un livreur dans notre catalogue de professionnels vérifiés.' },
  { title: '2. Suivre la livraison', body: 'Suivez l\'avancement en temps réel sur la fiche. Le livreur met à jour le statut à chaque étape.' },
  { title: '3. Bon de livraison', body: 'À la livraison, un bon officiel est généré automatiquement. C\'est votre preuve en cas de litige.' },
  { title: 'C\'est parti !', body: 'Créez votre première livraison maintenant. Le catalogue de livreurs vous attend.' },
];
const VISITE_LIVREUR = [
  { title: 'Bienvenue', body: 'Livraison Pro vous connecte à des marchands sérieux à Abidjan. Voici comment maximiser vos revenus.' },
  { title: '1. Activez votre dispo', body: 'Tous les matins, activez votre disponibilité. Les marchands vous voient dans le catalogue en temps réel.' },
  { title: '2. Acceptez des missions', body: 'Vous recevrez des missions par WhatsApp. Acceptez dans l\'app pour confirmer. Toutes vos étapes y sont tracées.' },
  { title: '3. Vérification CNI', body: 'Faites vérifier votre CNI pour obtenir le badge bleu. Les marchands choisissent en priorité les livreurs vérifiés.' },
  { title: 'C\'est parti !', body: 'Activez votre disponibilité et commencez à recevoir des missions dès aujourd\'hui.' },
];

let visiteStep = 0;
let visiteSteps = [];

function lancerVisite() {
  if (!currentUser) return;
  visiteSteps = currentUser.role === 'marchand' ? VISITE_MARCHAND : VISITE_LIVREUR;
  visiteStep = 0;
  showVisiteStep();
  document.getElementById('visite').style.display = 'flex';
}

function showVisiteStep() {
  const s = visiteSteps[visiteStep];
  const bar = document.getElementById('vp-bar');
  const content = document.getElementById('vc');
  const nav = document.getElementById('vn');
  const pct = ((visiteStep + 1) / visiteSteps.length) * 100;

  bar.innerHTML = `<div class="vp-fill" style="width:${pct}%"></div>`;
  content.innerHTML = `
    <div class="v-step">${visiteStep + 1} / ${visiteSteps.length}</div>
    <div class="v-title">${s.title}</div>
    <div class="v-body">${s.body}</div>
  `;
  nav.innerHTML = `
    ${visiteStep > 0 ? `<button class="btn btn-ghost" onclick="visiteBack()">Retour</button>` : '<div></div>'}
    <button class="btn btn-or" onclick="visiteNext()">${visiteStep < visiteSteps.length - 1 ? 'Suivant' : 'Terminer'}</button>
  `;
}

function visiteNext() {
  if (visiteStep < visiteSteps.length - 1) {
    visiteStep++;
    showVisiteStep();
  } else {
    fermerVisite();
  }
}

function visiteBack() {
  if (visiteStep > 0) { visiteStep--; showVisiteStep(); }
}

function fermerVisite() {
  document.getElementById('visite').style.display = 'none';
  const btn = currentUser?.role === 'marchand' ? document.getElementById('visite-btn-m') : document.getElementById('visite-btn-l');
  if (btn) btn.style.display = 'none';
}

/* ===== SVG ICONS ===== */
function svgHome() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function svgPlus() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
}
function svgBell() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;
}
function svgChart() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
}
function svgList() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
}
function svgUser() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}
function svgCheckCircle() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
}
function svgXCircle() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
}
function svgCheckBadge() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#009A44" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
}
