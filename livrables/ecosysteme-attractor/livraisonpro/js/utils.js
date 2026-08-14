/* ===== LIVRAISON PRO — UTILITAIRES ===== */

/* ---- Toast ---- */
function toast(msg, type = '', duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ---- Loading ---- */
function showLoading(msg = 'Chargement...') {
  const el = document.getElementById('loading');
  const txt = document.getElementById('ld-txt');
  if (el) el.classList.add('show');
  if (txt) txt.textContent = msg;
}
function hideLoading() {
  const el = document.getElementById('loading');
  if (el) el.classList.remove('show');
}

/* ---- Format date ---- */
function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}

/* ---- Format téléphone ---- */
function valTel(t) {
  const c = t.replace(/\s/g, '');
  return /^(\+225)?[0-9]{10}$/.test(c) || /^\+2250[0-9]{9}$/.test(c);
}
function fmtTel(t) {
  let c = t.replace(/\s/g, '').replace(/^00225/, '+225').replace(/^225/, '+225');
  return c.startsWith('+') ? c : '+225' + c;
}

/* ---- Détection OS ---- */
function detectOS() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

/* ---- Empty state HTML ---- */
function emptyState(icon, text) {
  return `<div class="empty"><div class="empty-icon">${icon}</div><div class="empty-text">${text}</div></div>`;
}

/* ---- Copier dans le presse-papier ---- */
function copierLien(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => toast('Lien copié — envoyez à votre cliente', 'vt'));
  } else {
    toast(url);
  }
}

/* ---- Modal ---- */
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
});

/* ---- API Supabase ---- */
async function api(params) {
  const { action, ...data } = params;
  try {
    switch (action) {
      case 'createUser':    return await apiCreateUser(data);
      case 'getUser':       return await apiGetUser(data);
      case 'getMissions':   return await apiGetMissions(data);
      case 'getLivreurs':   return await apiGetLivreurs(data);
      case 'getAlertes':    return await apiGetAlertes(data);
      case 'updateDispo':   return await apiUpdateDispo(data);
      case 'createMission': return await apiCreateMission(data);
      case 'updateStatus':  return await apiUpdateStatus(data);
      case 'sendAlerte':    return await apiSendAlerte(data);
      default:              return { ok: false, error: 'Action inconnue: ' + action };
    }
  } catch (e) {
    console.error('[LP] api error:', action, e);
    return { ok: false, error: e.message || 'Erreur réseau' };
  }
}

// lp_users n'est plus accessible en direct. Mesure du 12/08/2026 : la clé
// publique lisait toute la table et pouvait modifier n'importe quelle ligne,
// donc changer le téléphone d'un livreur ou se déclarer vérifié. Tout passe
// désormais par des fonctions qui n'exposent que le nécessaire, et les champs
// de confiance (plan, note, vérifié, rôle) sont posés côté serveur.
async function apiCreateUser({ nom, tel, role, commune, vehicule, zones }) {
  const { data, error } = await sb.rpc('lp_creer_compte', {
    p_nom: nom, p_tel: tel, p_role: role,
    p_commune: commune || null, p_vehicule: vehicule || null, p_zones: zones || null,
  });
  if (error) {
    if ((error.message || '').includes('existe déjà')) return { ok: false, error: 'Ce numéro existe déjà' };
    return { ok: false, error: error.message };
  }
  return { ok: true, user: data };
}

async function apiGetUser({ tel }) {
  // Un numéro exact renvoie une ligne. On ne peut plus balayer la table.
  const { data, error } = await sb.rpc('lp_user_par_tel', { p_tel: tel });
  if (error || !data) return { ok: false, error: 'Numéro non trouvé' };
  return { ok: true, user: data };
}

async function apiGetMissions({ userId }) {
  const { data, error } = await sb.from('lp_missions')
    .select('*')
    .or(`marchand_id.eq.${userId},livreur_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, missions: data || [] };
}

async function apiGetLivreurs({ commune }) {
  // Le filtrage par commune se fait maintenant côté serveur : filtrer après
  // coup obligeait à recevoir tous les livreurs de toutes les communes.
  const { data, error } = await sb.rpc('lp_livreurs_disponibles', { p_commune: commune || null });
  if (error) return { ok: false, error: error.message };
  return { ok: true, livreurs: data || [] };
}

async function apiGetAlertes({ userId }) {
  const { data: mMissions } = await sb.from('lp_missions').select('id')
    .or(`marchand_id.eq.${userId},livreur_id.eq.${userId}`);
  if (!mMissions || !mMissions.length) return { ok: true, alertes: [] };
  const ids = mMissions.map(m => m.id);
  const { data, error } = await sb.from('lp_alertes').select('*').in('mission_id', ids)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, alertes: data || [] };
}

async function apiUpdateDispo({ userId, tel, disponible }) {
  // L'identifiant seul ne suffit plus : il faut aussi le numéro, sinon
  // n'importe qui pouvait basculer la disponibilité d'un livreur inconnu.
  const { error } = await sb.rpc('lp_definir_disponibilite', {
    p_id: userId, p_tel: tel, p_disponible: disponible,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function apiCreateMission({
  marchand_id, marchand_nom, livreur_id, livreur_nom, livreur_tel,
  dest_nom, dest_tel, adresse_depart, adresse, commune, description,
  frais, mode_paiement, distance_km, date_souhaitee
}) {
  const { data, error } = await sb.from('lp_missions').insert({
    marchand_id, marchand_nom,
    livreur_id:     livreur_id     || null,
    livreur_nom:    livreur_nom    || null,
    livreur_tel:    livreur_tel    || null,
    dest_nom,
    dest_tel:       dest_tel       || null,
    adresse_depart: adresse_depart || null,
    adresse, commune,
    description:    description    || null,
    frais:          frais          || 0,
    mode_paiement:  mode_paiement  || null,
    distance_km:    distance_km    || 0,
    date_souhaitee: date_souhaitee || null,
    status: 'attente',
  }).select().single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, mission: data };
}

async function apiUpdateStatus({ id, status }) {
  const tsCol = { accepte: 'accepted_at', recupere: 'recupere_at', enroute: 'enroute_at', livre: 'livre_at' };
  const upd = { status };
  if (tsCol[status]) upd[tsCol[status]] = new Date().toISOString();
  const { error } = await sb.from('lp_missions').update(upd).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function apiSendAlerte({ mission_id, from_role, from_nom, type, description }) {
  const { error } = await sb.from('lp_alertes').insert({
    mission_id, from_role, from_nom, type,
    description: description || null,
    lu: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
