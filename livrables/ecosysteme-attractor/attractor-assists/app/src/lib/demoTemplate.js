// Génère une maquette HTML d'app métier personnalisée — localement, sans API
// Prend le profil utilisateur, retourne un string HTML complet

export function generateDemoHtml({ prenom = 'Vous', activite = 'votre activité', zone = 'CI' } = {}) {
  const brand = '#F25C05';
  const nom = prenom.charAt(0).toUpperCase() + prenom.slice(1);
  const isCI = zone !== 'EU';
  const currency = isCI ? 'FCFA' : '€';
  const revenue = isCI ? '1 240 000' : '1 890';
  const clients = '34';
  const pending = '7';
  const appName = `${nom} Pro`;

  // Détecter le secteur pour adapter le contenu
  const act = activite.toLowerCase();
  const isFood = act.includes('food') || act.includes('restau') || act.includes('traiteur') || act.includes('cuisine');
  const isLogistique = act.includes('livr') || act.includes('transport') || act.includes('colis');
  const isServices = act.includes('consult') || act.includes('coach') || act.includes('form') || act.includes('agence');

  const sectorLabel = isFood ? 'Commandes' : isLogistique ? 'Livraisons' : 'Dossiers';
  const sectorIcon = isFood ? '🍽️' : isLogistique ? '📦' : '📋';
  const clientLabel = isFood ? 'Tables / clients' : isLogistique ? 'Expéditeurs' : 'Clients';
  const actionLabel = isFood ? 'Nouvelle commande' : isLogistique ? 'Nouveau colis' : 'Nouveau dossier';

  const rows = isFood
    ? [
        { label: 'Table 4 — Menu découverte', status: 'En cours', color: '#F25C05' },
        { label: 'Commande emporter — Koffi A.', status: 'Prêt', color: '#22c55e' },
        { label: 'Réservation × 8 — Vendredi', status: 'Confirmé', color: '#22c55e' },
        { label: 'Livraison Plateau — Awa M.', status: 'En route', color: '#F59E0B' },
      ]
    : isLogistique
    ? [
        { label: 'Colis #1042 — Abidjan → Paris', status: 'En transit', color: '#F25C05' },
        { label: 'Colis #1043 — Paris → Dakar', status: 'Livré', color: '#22c55e' },
        { label: 'Colis #1044 — Lyon → Abidjan', status: 'En attente', color: '#6b7280' },
        { label: 'Colis #1045 — Bordeaux → Cotonou', status: 'En cours', color: '#F59E0B' },
      ]
    : [
        { label: 'Audit stratégique — Carelle S.', status: 'En cours', color: '#F25C05' },
        { label: 'Formation équipe — Groupe IVOIRE', status: 'Terminé', color: '#22c55e' },
        { label: 'Consulting Q3 — Maferima D.', status: 'À valider', color: '#F59E0B' },
        { label: 'Suivi mensuel — Kofi A.', status: 'Actif', color: '#22c55e' },
      ];

  const rowsHtml = rows.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0ebe4;">
      <span style="font-size:13px;color:#1a1714;font-weight:500;">${r.label}</span>
      <span style="font-size:11px;font-weight:700;color:${r.color};background:${r.color}18;padding:3px 8px;border-radius:20px;">${r.status}</span>
    </div>`).join('');

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${appName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .phone{width:100%;max-width:390px;min-height:100vh;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,0,0,.12);}
  .screen{flex:1;overflow-y:auto;padding-bottom:80px;}
  .topbar{background:#1a1714;padding:16px 18px 14px;display:flex;align-items:center;justify-content:space-between;}
  .topbar-title{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.3px;}
  .topbar-badge{background:#F25C05;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;}
  .tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:390px;background:#fff;border-top:1px solid #f0ebe4;display:flex;padding:8px 0 12px;}
  .tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;}
  .tab-icon{font-size:20px;}
  .tab-label{font-size:10px;color:#9b8f85;font-weight:500;}
  .tab.active .tab-label{color:#F25C05;font-weight:700;}
  .tab.active .tab-icon{filter:none;}
  .section{padding:18px;}
  .hero{background:linear-gradient(135deg,#1a1714,#2d2520);padding:20px 18px;position:relative;overflow:hidden;}
  .hero::after{content:'';position:absolute;top:-40px;right:-40px;width:140px;height:140px;background:#F25C05;opacity:.08;border-radius:50%;}
  .hero-greeting{color:#F5F0E8;opacity:.6;font-size:13px;font-weight:500;}
  .hero-name{color:#fff;font-size:22px;font-weight:800;margin:2px 0 12px;}
  .hero-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .kpi{background:rgba(255,255,255,.08);border-radius:12px;padding:12px;backdrop-filter:blur(4px);}
  .kpi-val{color:#fff;font-size:20px;font-weight:800;}
  .kpi-label{color:#F5F0E8;opacity:.55;font-size:11px;margin-top:2px;}
  .quick-actions{display:flex;gap:10px;padding:14px 18px;}
  .action-btn{flex:1;padding:12px 10px;border-radius:14px;font-size:13px;font-weight:700;text-align:center;border:none;cursor:pointer;}
  .action-btn.primary{background:#F25C05;color:#fff;}
  .action-btn.secondary{background:#f5f0e8;color:#1a1714;}
  .section-title{font-size:15px;font-weight:800;color:#1a1714;margin-bottom:12px;}
  .agent-card{background:linear-gradient(135deg,#1a1714,#2d2520);border-radius:16px;padding:16px;display:flex;align-items:center;gap:12px;margin-bottom:12px;}
  .agent-avatar{width:44px;height:44px;background:#F25C05;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
  .agent-info{flex:1;}
  .agent-name{color:#fff;font-size:14px;font-weight:700;}
  .agent-desc{color:#F5F0E8;opacity:.55;font-size:12px;margin-top:2px;}
  .agent-dot{width:8px;height:8px;background:#22c55e;border-radius:50%;flex-shrink:0;}
  .chat-bubble{background:#f5f0e8;border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:13px;color:#1a1714;line-height:1.5;margin-bottom:10px;}
  .chat-bubble.me{background:#F25C05;color:#fff;border-radius:16px 16px 4px 16px;margin-left:auto;max-width:78%;}
  .chat-input{background:#f5f0e8;border-radius:24px;padding:12px 16px;display:flex;align-items:center;gap:10px;margin:0 18px;}
  .chat-input-text{flex:1;font-size:13px;color:#9b8f85;}
  .chat-send{width:36px;height:36px;background:#F25C05;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;}
  .client-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0ebe4;}
  .client-avatar{width:36px;height:36px;background:#f5f0e8;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .client-name{font-size:13px;font-weight:600;color:#1a1714;}
  .client-meta{font-size:11px;color:#9b8f85;margin-top:1px;}
  .stat-card{background:#f5f0e8;border-radius:14px;padding:14px;margin-bottom:10px;}
  .stat-title{font-size:12px;color:#9b8f85;font-weight:600;margin-bottom:8px;}
  .stat-bar{background:#e8e2d8;border-radius:6px;height:8px;overflow:hidden;margin-bottom:4px;}
  .stat-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#F25C05,#FF8C42);}
  .stat-nums{display:flex;justify-content:space-between;font-size:11px;color:#9b8f85;}
</style>
</head>
<body>
<div class="phone">

<!-- SCREEN 1: ACCUEIL -->
<div class="screen" id="s1">
  <div class="hero">
    <div class="hero-greeting">Bonjour 👋</div>
    <div class="hero-name">${nom}</div>
    <div class="hero-kpis">
      <div class="kpi">
        <div class="kpi-val">${revenue}</div>
        <div class="kpi-label">CA ce mois · ${currency}</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">${clients}</div>
        <div class="kpi-label">${clientLabel} actifs</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">${pending}</div>
        <div class="kpi-label">${sectorLabel} en attente</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">94%</div>
        <div class="kpi-label">Satisfaction client</div>
      </div>
    </div>
  </div>
  <div class="quick-actions">
    <button class="action-btn primary" onclick="show(2)">+ ${actionLabel}</button>
    <button class="action-btn secondary" onclick="show(3)">Clients</button>
  </div>
  <div class="section">
    <div class="section-title">${sectorLabel} récents</div>
    ${rowsHtml}
  </div>
</div>

<!-- SCREEN 2: AGENT IA -->
<div class="screen" id="s2" style="display:none;">
  <div class="topbar">
    <div class="topbar-title">Agent IA · Mr Attractor</div>
    <div class="topbar-badge">En ligne</div>
  </div>
  <div class="section" style="display:flex;flex-direction:column;gap:10px;padding-top:16px;">
    <div class="agent-card">
      <div class="agent-avatar">🤖</div>
      <div class="agent-info">
        <div class="agent-name">Mr Attractor</div>
        <div class="agent-desc">Ton bras droit IA — disponible 24h/24</div>
      </div>
      <div class="agent-dot"></div>
    </div>
    <div class="chat-bubble">Bonjour ${nom} ! Je suis Mr Attractor, ton assistant IA. Comment puis-je t'aider avec ${activite} aujourd'hui ?</div>
    <div class="chat-bubble me">J'ai besoin d'un message de relance pour un client inactif depuis 2 semaines.</div>
    <div class="chat-bubble">Parfait. Je prépare ça maintenant.\n\n"Bonjour [Prénom], je voulais prendre de tes nouvelles. Comment se passe ton activité en ce moment ? On a de nouvelles offres qui pourraient t'intéresser…"\n\nVeux-tu que j'adapte ce message à ton client spécifique ?</div>
  </div>
  <div class="chat-input">
    <span class="chat-input-text">Envoyer un message…</span>
    <div class="chat-send">➤</div>
  </div>
</div>

<!-- SCREEN 3: CLIENTS -->
<div class="screen" id="s3" style="display:none;">
  <div class="topbar">
    <div class="topbar-title">${clientLabel}</div>
    <div class="topbar-badge">${clients} actifs</div>
  </div>
  <div class="section">
    <div class="section-title">Récents</div>
    ${['Awa Coulibaly', 'Kofi Asante', 'Maferima Diabaté', 'Carelle Soro', 'Roland Dje'].map((n, i) => `
    <div class="client-row">
      <div class="client-avatar">${n[0]}</div>
      <div style="flex:1">
        <div class="client-name">${n}</div>
        <div class="client-meta">Dernier contact : il y a ${[1, 3, 7, 2, 14][i]}j</div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${['#22c55e','#22c55e','#F59E0B','#22c55e','#ef4444'][i]};background:${['#22c55e','#22c55e','#F59E0B','#22c55e','#ef4444'][i]}18;padding:3px 8px;border-radius:20px;">${['Actif','Actif','À relancer','Actif','Inactif'][i]}</span>
    </div>`).join('')}
  </div>
</div>

<!-- SCREEN 4: RÉSULTATS -->
<div class="screen" id="s4" style="display:none;">
  <div class="topbar">
    <div class="topbar-title">Résultats</div>
  </div>
  <div class="section">
    <div class="section-title">Performance du mois</div>
    <div class="stat-card">
      <div class="stat-title">Chiffre d'affaires</div>
      <div class="stat-bar"><div class="stat-fill" style="width:78%"></div></div>
      <div class="stat-nums"><span>${revenue} ${currency}</span><span>Objectif : ${isCI ? '1 600 000' : '2 400'} ${currency}</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-title">${sectorLabel} complétés</div>
      <div class="stat-bar"><div class="stat-fill" style="width:85%"></div></div>
      <div class="stat-nums"><span>27 / 32</span><span>85%</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Nouveaux clients</div>
      <div class="stat-bar"><div class="stat-fill" style="width:60%"></div></div>
      <div class="stat-nums"><span>6 ce mois</span><span>+20% vs mois dernier</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Satisfaction clients</div>
      <div class="stat-bar"><div class="stat-fill" style="width:94%"></div></div>
      <div class="stat-nums"><span>94% positif</span><span>47 avis</span></div>
    </div>
  </div>
</div>

<!-- TABBAR -->
<div class="tabbar">
  <div class="tab active" id="t1" onclick="show(1)">
    <span class="tab-icon">🏠</span>
    <span class="tab-label">Accueil</span>
  </div>
  <div class="tab" id="t2" onclick="show(2)">
    <span class="tab-icon">🤖</span>
    <span class="tab-label">Agent IA</span>
  </div>
  <div class="tab" id="t3" onclick="show(3)">
    <span class="tab-icon">👥</span>
    <span class="tab-label">Clients</span>
  </div>
  <div class="tab" id="t4" onclick="show(4)">
    <span class="tab-icon">📊</span>
    <span class="tab-label">Résultats</span>
  </div>
</div>

</div>
<script>
function show(n){
  [1,2,3,4].forEach(i=>{
    document.getElementById('s'+i).style.display = i===n ? 'flex' : 'none';
    document.getElementById('s'+i).style.flexDirection = i===n ? 'column' : '';
    const t = document.getElementById('t'+i);
    t.classList.toggle('active', i===n);
  });
}
show(1);
</script>
</body>
</html>`;
}
