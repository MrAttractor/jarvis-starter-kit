import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LoginScreen from "./LoginScreen";
import { C, Ic } from "./theme";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CLIENTS = [
  { id:1, nom:"TechVision CI",    secteur:"Tech & Innovation",   tiktok:{ abonnes:12847, publis:18, contrat:16, vues:284500, engagement:8.4 }, facebook:{ abonnes:5430, publis:22, contrat:20, portee:145000, engagement:4.7 }, statut:"actif", color:C.gold },
  { id:2, nom:"CréaMarket",       secteur:"E-commerce",          tiktok:{ abonnes:8320, publis:14, contrat:16, vues:198000, engagement:6.1 }, facebook:{ abonnes:3210, publis:18, contrat:20, portee:89000,  engagement:3.9 }, statut:"actif", color:C.success },
  { id:3, nom:"BeautyPlus Abj",   secteur:"Beauté & Lifestyle",  tiktok:{ abonnes:24100, publis:16, contrat:16, vues:412000, engagement:11.2 }, facebook:{ abonnes:9870, publis:20, contrat:20, portee:234000, engagement:6.3 }, statut:"actif", color:C.tiktok },
  { id:4, nom:"Diallo Immo",      secteur:"Immobilier",          tiktok:{ abonnes:3440, publis:10, contrat:16, vues:78000, engagement:4.2 },  facebook:{ abonnes:2100, publis:12, contrat:20, portee:45000,  engagement:2.8 }, statut:"alerte", color:C.warn },
];

const MISSIONS = [
  { id:1, cadreur:"Konan Jean",     client:"TechVision CI",   desc:"Tournage produit plateau", contact:"M. Kouassi · +225 07 12 34 56", heure:"14h00", statut:"en_cours",  date:"Auj." },
  { id:2, cadreur:"Bamba Sékou",    client:"CréaMarket",      desc:"Shooting collection été",  contact:"Mme Traoré · +225 05 98 76 54", heure:"16h30", statut:"a_faire",   date:"Auj." },
  { id:3, cadreur:"Yao Christelle", client:"BeautyPlus Abj",  desc:"Interview fondatrice",     contact:"Mme Koné · +225 01 23 45 67",   heure:"10h00", statut:"termine",   date:"Hier" },
  { id:4, cadreur:"Konan Jean",     client:"Diallo Immo",     desc:"Visite virtuelle villa",   contact:"M. Diallo · +225 07 00 11 22",  heure:"09h00", statut:"echec",     date:"Hier", justif:"Client absent à l'heure prévue" },
  { id:5, cadreur:"Bamba Sékou",    client:"TechVision CI",   desc:"Event lancement produit",  contact:"M. Kouassi · +225 07 12 34 56", heure:"18h00", statut:"a_faire",   date:"Dem." },
];

const fmtNum = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : `${n}`;

const ROLES = [
  { value:"direction",     label:"Direction" },
  { value:"commercial",    label:"Commercial" },
  { value:"social_media",  label:"Social Media Management" },
  { value:"administration",label:"Administration" },
  { value:"production",    label:"Production" },
  { value:"community",     label:"Community Management" },
];
const roleLabel = (v) => ROLES.find(r => r.value === v)?.label || v;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Badge = ({ label, color = C.gold, dark = false, icon }) => (
  <span style={{ background: color, color: dark ? C.dark : C.white, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, display:"inline-flex", alignItems:"center", gap:4, letterSpacing:.5 }}>
    {icon && <Ic name={icon} size={10} color={dark ? C.dark : C.white} />}
    {label}
  </span>
);

const StatutBadge = ({ statut }) => {
  const cfg = {
    en_cours: { label:"En cours",  bg:C.warn,    icon:"clock" },
    a_faire:  { label:"À faire",   bg:C.muted,   icon:"clipboard" },
    termine:  { label:"Terminé",   bg:C.success, icon:"check" },
    echec:    { label:"Échec",     bg:C.danger,  icon:"x" },
    actif:    { label:"Actif",     bg:C.success },
    alerte:   { label:"Alerte",    bg:C.warn,    icon:"warning" },
    closing:  { label:"Closing",   bg:C.gold,    icon:"flame", dark:true },
    qualifie: { label:"Qualifié",  bg:C.blue,    icon:"check" },
    contact:  { label:"Contact",   bg:C.muted,   icon:"phone" },
    signe:    { label:"Signé",     bg:C.success, icon:"check" },
    perdu:    { label:"Perdu",     bg:C.danger,  icon:"x" },
    invite:   { label:"Invité",    bg:C.muted,   icon:"clock" },
    a_payer:  { label:"À payer",   bg:C.warn,    icon:"clock" },
    payee:    { label:"Payée",     bg:C.success, icon:"check" },
    retard:   { label:"En retard", bg:C.danger,  icon:"warning" },
  };
  const c = cfg[statut] || { label:statut, bg:C.muted };
  return <Badge label={c.label} color={c.bg} dark={c.dark} icon={c.icon} />;
};

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background:C.white, borderRadius:12, padding:"14px 16px", boxShadow:"0 2px 16px rgba(0,0,0,0.08)", cursor:onClick?"pointer":"default", transition:"transform .15s", ...style }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform="translateY(-2px)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform="none")}>
    {children}
  </div>
);

const DarkCard = ({ children, style = {}, accent }) => (
  <div style={{ background:C.card, borderRadius:12, padding:"14px 16px", border:`1px solid rgba(255,255,255,0.07)`, position:"relative", overflow:"hidden", ...style }}>
    {accent && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent, borderRadius:"12px 12px 0 0" }} />}
    {children}
  </div>
);

const KpiCard = ({ label, value, delta, accent = C.gold, dark = false }) => {
  const Wrap = dark ? DarkCard : Card;
  return (
    <Wrap accent={dark ? accent : null} style={{ textAlign:"center", padding:"14px 10px" }}>
      <div style={{ fontSize:26, fontWeight:900, color: dark ? accent : C.navy, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color: dark ? C.muted : C.muted, marginTop:4, fontWeight:600 }}>{label}</div>
      {delta && <div style={{ fontSize:9, color:C.success, marginTop:4, fontWeight:700 }}>▲ {delta}</div>}
    </Wrap>
  );
};

const SectionTitle = ({ title, sub, light, style }) => (
  <div style={{ marginBottom:16, ...style }}>
    <div style={{ fontSize:18, fontWeight:800, color: light ? C.white : C.navy, lineHeight:1.2 }}>{title}</div>
    {sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{sub}</div>}
  </div>
);

const BientotBanner = () => (
  <div style={{ background:"rgba(245,197,24,0.1)", border:`1px solid rgba(245,197,24,0.35)`, borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
    <Ic name="warning" size={16} color={C.gold} />
    <div style={{ fontSize:11, color:C.gold, fontWeight:600, lineHeight:1.4 }}>Aperçu — données de démonstration. Ce module réel arrive dans les prochains jours.</div>
  </div>
);

// ─── TOPBAR ────────────────────────────────────────────────────────────────────
const TopBar = ({ view, onNotif, notifCount, initiale, onLogout, titleOverride }) => {
  const titles = {
    dashboard: "Dashboard", clients:"Clients", missions:"Missions",
    commercial:"Commercial", rh:"Équipe & RH", rapport:"Rapports"
  };
  return (
    <div style={{ background:C.navy, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,.4)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:3, height:22, background:C.gold, borderRadius:2 }} />
        <div>
          <div style={{ fontSize:8, color:C.gold, fontWeight:700, letterSpacing:2 }}>LS XPERTISE</div>
          <div style={{ fontSize:14, fontWeight:800, color:C.white, lineHeight:1.1 }}>{titleOverride || titles[view]}</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div onClick={onNotif} style={{ position:"relative", cursor:"pointer" }}>
          <Ic name="bell" size={18} color={C.white} />
          {notifCount > 0 && <div style={{ position:"absolute", top:-4, right:-4, background:C.danger, color:"#fff", fontSize:8, fontWeight:700, width:14, height:14, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{notifCount}</div>}
        </div>
        <div onClick={onLogout} title="Se déconnecter" style={{ width:32, height:32, borderRadius:"50%", background:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.dark, cursor:"pointer" }}>{initiale}</div>
      </div>
    </div>
  );
};

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
const NavBar = ({ view, setView, role }) => {
  const ceoNav = [
    { key:"dashboard", icon:"home",  label:"Accueil" },
    { key:"clients",   icon:"chart", label:"Clients" },
    { key:"missions",  icon:"video", label:"Missions" },
    { key:"commercial",icon:"trend", label:"Ventes" },
    { key:"rh",        icon:"people",label:"Équipe" },
  ];
  const cadreurNav = [
    { key:"dashboard", icon:"home",  label:"Accueil" },
    { key:"missions",  icon:"video", label:"Missions" },
  ];
  const nav = role === "cadreur" ? cadreurNav : ceoNav;
  return (
    <div style={{ background:C.dark, display:"flex", justifyContent:"space-around", padding:"8px 0 4px", position:"fixed", bottom:0, left:0, right:0, zIndex:100, maxWidth:390, margin:"0 auto", borderTop:`1px solid ${C.card}` }}>
      {nav.map(n => (
        <button key={n.key} onClick={() => setView(n.key)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, opacity: view===n.key ? 1 : 0.45, transition:"opacity .2s" }}>
          <Ic name={n.icon} size={20} color={view===n.key ? C.gold : C.muted} />
          <span style={{ fontSize:9, color: view===n.key ? C.gold : C.muted, fontWeight: view===n.key ? 700 : 400 }}>{n.label}</span>
          {view===n.key && <div style={{ width:20, height:2, background:C.gold, borderRadius:1 }} />}
        </button>
      ))}
    </div>
  );
};

// ─── VIEWS ────────────────────────────────────────────────────────────────────

// DASHBOARD CEO
const DashboardView = ({ setView, membre }) => {
  const [clients, setClients] = useState(null);

  useEffect(() => {
    supabase.from("lsx_clients").select("*").order("created_at", { ascending:false }).then(({ data }) => setClients(data || []));
  }, []);

  const prenom = (membre?.nom || "").split(" ")[0] || "toi";
  const today = new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
  const closingList = (clients || []).filter(p => p.statut === "closing");
  const nbActifs = (clients || []).filter(p => p.statut !== "signe" && p.statut !== "perdu").length;
  const nbQualifies = (clients || []).filter(p => p.statut === "qualifie").length;
  const nbSignes = (clients || []).filter(p => p.statut === "signe").length;

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      {/* Greeting */}
      <div style={{ background:`linear-gradient(135deg, ${C.blue}, ${C.navy})`, borderRadius:14, padding:"16px 18px", marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-20, top:-20, width:100, height:100, borderRadius:"50%", background:"rgba(245,197,24,0.1)" }} />
        <div style={{ fontSize:13, color:C.light, marginBottom:2 }}>Bonjour, {prenom}</div>
        <div style={{ fontSize:20, fontWeight:800, color:C.white, lineHeight:1.2, textTransform:"capitalize" }}>{today}</div>
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Ton pipeline, en direct.</div>
      </div>

      {clients === null ? (
        <div style={{ color:C.muted, fontSize:13, marginBottom:16 }}>Chargement…</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <KpiCard label="Pipeline actif" value={nbActifs} accent={C.gold} dark />
          <KpiCard label="Closing en cours" value={closingList.length} accent={C.success} dark />
          <KpiCard label="Qualifiés" value={nbQualifies} accent={C.blue} dark />
          <KpiCard label="Signés" value={nbSignes} accent={C.success} dark />
        </div>
      )}

      {/* Quick actions */}
      <SectionTitle title="Actions rapides" light />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {[
          { icon:"trend", label:"Pipeline", sub:`${closingList.length} closing`, action:"commercial", color:C.success },
          { icon:"people", label:"Équipe", sub:"Bientôt", action:"rh", color:C.blue },
          { icon:"chart", label:"Clients", sub:"Bientôt", action:"clients", color:C.gold },
          { icon:"video", label:"Missions", sub:"Bientôt", action:"missions", color:C.tiktok },
        ].map(a => (
          <DarkCard key={a.action} accent={a.color} style={{ cursor:"pointer" }} onClick={() => setView(a.action)}>
            <div style={{ marginBottom:6 }}><Ic name={a.icon} size={22} color={a.color} /></div>
            <div style={{ fontSize:12, fontWeight:700, color:C.white }}>{a.label}</div>
            <div style={{ fontSize:10, color:C.muted }}>{a.sub}</div>
          </DarkCard>
        ))}
      </div>

      {/* Derniers ajouts au pipeline */}
      {clients && clients.length > 0 && (
        <>
          <SectionTitle title="Derniers ajouts" light />
          {clients.slice(0, 3).map(p => (
            <DarkCard key={p.id} style={{ marginBottom:10, cursor:"pointer" }} onClick={() => setView("commercial")}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.white }}>{p.nom}</div>
                  {p.secteur && <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{p.secteur}</div>}
                </div>
                <StatutBadge statut={p.statut} />
              </div>
            </DarkCard>
          ))}
        </>
      )}

      {/* Alerte prospect */}
      {closingList.length > 0 && (
        <div style={{ background:`linear-gradient(135deg, ${C.gold}, ${C.gold2})`, borderRadius:12, padding:"14px 16px", marginTop:16, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => setView("commercial")}>
          <Ic name="flame" size={24} color={C.dark} />
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:C.dark }}>Closing imminent !</div>
            <div style={{ fontSize:10, color:C.dark, opacity:.75 }}>{closingList[0].nom} attend la suite</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:16, color:C.dark }}>→</div>
        </div>
      )}
    </div>
  );
};

// CLIENTS & KPIs
const ClientsView = () => {
  const [selected, setSelected] = useState(null);
  const [platform, setPlatform] = useState("tiktok");

  if (selected) {
    const cl = selected;
    const data = cl[platform];
    const ratio = data.publis / data.contrat;
    return (
      <div style={{ padding:"16px 16px 90px" }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.gold, fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Retour</button>

        {/* Client header */}
        <div style={{ background:`linear-gradient(135deg, ${C.blue}, ${C.navy})`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:C.gold, fontWeight:700, letterSpacing:1, marginBottom:4 }}>CLIENT</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.white }}>{cl.nom}</div>
          <div style={{ fontSize:11, color:C.muted }}>{cl.secteur}</div>
          <div style={{ marginTop:10 }}><StatutBadge statut={cl.statut} /></div>
        </div>

        {/* Platform toggle */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
          {["tiktok","facebook"].map(p => (
            <button key={p} onClick={() => setPlatform(p)} style={{ background: platform===p ? (p==="tiktok"?C.tiktok:C.fb) : C.card, color:C.white, border:"none", borderRadius:10, padding:"10px", fontWeight:700, fontSize:12, cursor:"pointer", transition:"background .2s" }}>
              {p==="tiktok" ? "TikTok" : "Facebook"}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          <KpiCard dark label="Abonnés" value={fmtNum(data.abonnes)} accent={platform==="tiktok"?C.tiktok:C.fb} />
          <KpiCard dark label="Publications" value={data.publis} accent={platform==="tiktok"?C.tiktok:C.fb} />
          <KpiCard dark label={platform==="tiktok"?"Vues totales":"Portée totale"} value={fmtNum(platform==="tiktok"?data.vues:data.portee)} accent={platform==="tiktok"?C.tiktok:C.fb} />
          <KpiCard dark label="Engagement" value={`${data.engagement}%`} accent={platform==="tiktok"?C.tiktok:C.fb} />
        </div>

        {/* Conformité contrat */}
        <DarkCard accent={ratio>=1?C.success:C.warn} style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:6, fontWeight:700 }}>CONFORMITÉ CONTRAT</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:13, color:C.white, fontWeight:700 }}>{data.publis} / {data.contrat} publications</div>
            <Badge label={ratio>=1?"Respecté":"En retard"} color={ratio>=1?C.success:C.warn} icon={ratio>=1?"check":undefined} />
          </div>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:8, height:8, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(ratio*100,100)}%`, background:ratio>=1?C.success:C.warn, borderRadius:8, transition:"width .6s" }} />
          </div>
        </DarkCard>

        <button style={{ width:"100%", background:C.gold, border:"none", borderRadius:10, padding:"13px", fontWeight:800, fontSize:13, cursor:"pointer", color:C.dark, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Ic name="doc" size={15} color={C.dark} /> Générer rapport mensuel
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <BientotBanner />
      <SectionTitle title="Mes clients" sub={`${CLIENTS.length} comptes actifs`} light />
      {CLIENTS.map(cl => {
        const conformTT = cl.tiktok.publis >= cl.tiktok.contrat;
        const conformFB = cl.facebook.publis >= cl.facebook.contrat;
        return (
          <DarkCard key={cl.id} accent={cl.color} style={{ marginBottom:12, cursor:"pointer" }} onClick={() => setSelected(cl)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.white }}>{cl.nom}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{cl.secteur}</div>
              </div>
              <StatutBadge statut={cl.statut} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontSize:9, color:C.tiktok, fontWeight:700, marginBottom:3 }}>TIKTOK</div>
                <div style={{ fontSize:13, fontWeight:800, color:C.white }}>{fmtNum(cl.tiktok.abonnes)}</div>
                <div style={{ fontSize:9, color: conformTT?C.success:C.warn, display:"flex", alignItems:"center", gap:3 }}>{cl.tiktok.publis}/{cl.tiktok.contrat} publis <Ic name={conformTT?"check":"warning"} size={10} color={conformTT?C.success:C.warn} /></div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontSize:9, color:C.fb, fontWeight:700, marginBottom:3 }}>FACEBOOK</div>
                <div style={{ fontSize:13, fontWeight:800, color:C.white }}>{fmtNum(cl.facebook.abonnes)}</div>
                <div style={{ fontSize:9, color: conformFB?C.success:C.warn, display:"flex", alignItems:"center", gap:3 }}>{cl.facebook.publis}/{cl.facebook.contrat} publis <Ic name={conformFB?"check":"warning"} size={10} color={conformFB?C.success:C.warn} /></div>
              </div>
            </div>
            <div style={{ textAlign:"right", marginTop:8, fontSize:10, color:C.gold, fontWeight:700 }}>Voir détails →</div>
          </DarkCard>
        );
      })}
    </div>
  );
};

// MISSIONS
const MissionsView = ({ role = "ceo" }) => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(null);
  const [localStatuts, setLocalStatuts] = useState({});

  const cadreurName = "Konan Jean";
  const displayed = role === "cadreur"
    ? MISSIONS.filter(m => m.cadreur === cadreurName)
    : filter === "all" ? MISSIONS : MISSIONS.filter(m => m.statut === filter);

  const getStatut = (m) => localStatuts[m.id] || m.statut;

  const handleAction = (mId, newStatut) => {
    setLocalStatuts(prev => ({ ...prev, [mId]: newStatut }));
    setShowConfirm(null);
    setSelected(null);
  };

  if (selected) {
    const m = { ...selected, statut: getStatut(selected) };
    return (
      <div style={{ padding:"16px 16px 90px" }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.gold, fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Retour</button>

        <div style={{ background:`linear-gradient(135deg,${C.blue},${C.navy})`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:C.gold, fontWeight:700, letterSpacing:1, marginBottom:4 }}>MISSION</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.white }}>{m.desc}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{m.client} · {m.heure}</div>
          <div style={{ marginTop:10 }}><StatutBadge statut={m.statut} /></div>
        </div>

        <DarkCard style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:8 }}>INFORMATIONS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", gap:10 }}><Ic name="person" size={16} color={C.gold} /><div><div style={{ fontSize:10, color:C.muted }}>Cadreur</div><div style={{ fontSize:13, color:C.white, fontWeight:600 }}>{m.cadreur}</div></div></div>
            <div style={{ display:"flex", gap:10 }}><Ic name="pin" size={16} color={C.gold} /><div><div style={{ fontSize:10, color:C.muted }}>Contact sur place</div><div style={{ fontSize:13, color:C.white, fontWeight:600 }}>{m.contact}</div></div></div>
            <div style={{ display:"flex", gap:10 }}><Ic name="clock" size={16} color={C.gold} /><div><div style={{ fontSize:10, color:C.muted }}>Heure</div><div style={{ fontSize:13, color:C.white, fontWeight:600 }}>{m.heure} — {m.date}</div></div></div>
          </div>
        </DarkCard>

        {m.justif && (
          <div style={{ background:"rgba(239,68,68,0.12)", border:`1px solid ${C.danger}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
            <div style={{ fontSize:10, color:C.danger, fontWeight:700 }}>JUSTIFICATIF D'ÉCHEC</div>
            <div style={{ fontSize:12, color:C.white, marginTop:4 }}>{m.justif}</div>
          </div>
        )}

        {/* Action buttons */}
        {m.statut !== "termine" && m.statut !== "echec" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => handleAction(m.id, "termine")} style={{ background:C.success, border:"none", borderRadius:10, padding:13, fontWeight:800, fontSize:13, cursor:"pointer", color:C.white, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="check" size={15} color={C.white} /> Marquer comme terminé</button>
            <button onClick={() => handleAction(m.id, "en_cours")} style={{ background:C.warn, border:"none", borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer", color:C.dark, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="clock" size={15} color={C.dark} /> En cours</button>
            <button onClick={() => setShowConfirm(m.id)} style={{ background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer", color:C.danger, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="x" size={15} color={C.danger} /> Signaler un échec</button>
          </div>
        )}

        {showConfirm === m.id && (
          <div style={{ marginTop:12, background:C.card, borderRadius:10, padding:14 }}>
            <div style={{ fontSize:12, color:C.white, fontWeight:700, marginBottom:8 }}>Motif de l'échec :</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {["Client absent", "Matériel défaillant", "Accès refusé", "Autre"].map(r => (
                <button key={r} onClick={() => handleAction(m.id, "echec")} style={{ background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:C.danger, fontWeight:600, fontSize:12, textAlign:"left" }}>{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <BientotBanner />
      <SectionTitle title={role==="cadreur" ? `Mes missions — ${cadreurName}` : "Toutes les missions"} sub="Appuyez sur une mission pour les détails" light />

      {/* Date badge */}
      <div style={{ background:C.card, borderRadius:8, padding:"8px 12px", textAlign:"center", fontSize:11, fontWeight:700, color:C.gold, marginBottom:14 }}>
        Mercredi 28 Mai 2025
      </div>

      {/* Filter (CEO only) */}
      {role === "ceo" && (
        <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
          {[["all","Tout"],["en_cours","En cours"],["a_faire","À faire"],["termine","Terminées"],["echec","Échecs"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ background: filter===k?C.gold:C.card, color: filter===k?C.dark:C.muted, border:"none", borderRadius:20, padding:"6px 14px", fontWeight:700, fontSize:10, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
          ))}
        </div>
      )}

      {displayed.map(m => {
        const statut = getStatut(m);
        return (
          <div key={m.id} onClick={() => setSelected(m)} style={{ background:C.card, borderRadius:12, padding:"14px 16px", marginBottom:10, borderLeft:`3px solid ${statut==="termine"?C.success:statut==="echec"?C.danger:statut==="en_cours"?C.warn:C.muted}`, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{m.client}</div>
              <StatutBadge statut={statut} />
            </div>
            <div style={{ fontSize:11, color:C.muted }}>{m.desc}</div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
              <div style={{ fontSize:10, color:C.light, display:"flex", alignItems:"center", gap:4 }}><Ic name="person" size={11} color={C.light} /> {m.cadreur} · {m.heure}</div>
              <div style={{ fontSize:10, color:C.muted }}>{m.date}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// COMMERCIAL
const MOTIFS_PERDU = ["Plus de budget", "Parti chez un concurrent", "Injoignable", "Autre"];

const CommercialView = ({ membre, scope = "all" }) => {
  const [clients, setClients] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom:"", secteur:"", contact_nom:"", contact_tel:"", notes:"" });
  const [saving, setSaving] = useState(false);
  const [showPerdu, setShowPerdu] = useState(false);

  const stages = [
    { key:"contact",  label:"Contact",  color:C.muted },
    { key:"qualifie", label:"Qualifié", color:C.blue },
    { key:"closing",  label:"Closing",  color:C.gold },
  ];

  const load = async () => {
    let q = supabase.from("lsx_clients").select("*").order("created_at", { ascending:false });
    if (scope === "own") q = q.eq("created_by", membre.user_id);
    const { data } = await q;
    setClients(data || []);
  };

  useEffect(() => { load(); }, []);

  const ajouterProspect = async () => {
    if (!form.nom.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("lsx_clients").insert({
      nom: form.nom.trim(),
      secteur: form.secteur.trim() || null,
      contact_nom: form.contact_nom.trim() || null,
      contact_tel: form.contact_tel.trim() || null,
      notes: form.notes.trim() || null,
      created_by: membre.user_id,
    }).select().single();
    if (!error && data) {
      await supabase.from("lsx_dossier_transitions").insert({ client_id: data.id, statut_avant: null, statut_apres: "contact", created_by: membre.user_id });
      setForm({ nom:"", secteur:"", contact_nom:"", contact_tel:"", notes:"" });
      setShowForm(false);
      await load();
    }
    setSaving(false);
  };

  const changerStatut = async (client, nouveauStatut, note) => {
    await supabase.from("lsx_clients").update({ statut: nouveauStatut, updated_at: new Date().toISOString() }).eq("id", client.id);
    await supabase.from("lsx_dossier_transitions").insert({ client_id: client.id, statut_avant: client.statut, statut_apres: nouveauStatut, note: note || null, created_by: membre.user_id });
    setSelected({ ...client, statut: nouveauStatut });
    setShowPerdu(false);
    await load();
  };

  if (clients === null) {
    return <div style={{ padding:"16px 16px 90px", color:C.muted, fontSize:13 }}>Chargement…</div>;
  }

  if (selected) {
    const p = selected;
    const isClosing = p.statut === "closing";
    return (
      <div style={{ padding:"16px 16px 90px" }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.gold, fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Retour</button>

        <div style={{ background:isClosing?`linear-gradient(135deg,${C.gold2},${C.gold})`:`linear-gradient(135deg,${C.blue},${C.navy})`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:isClosing?C.dark:C.gold, fontWeight:700, letterSpacing:1, marginBottom:4 }}>CLIENT / PROSPECT</div>
          <div style={{ fontSize:18, fontWeight:800, color:isClosing?C.dark:C.white }}>{p.nom}</div>
          {p.secteur && <div style={{ fontSize:11, color:isClosing?"rgba(0,0,0,0.5)":C.muted, marginTop:2 }}>{p.secteur}</div>}
          <div style={{ marginTop:10 }}><StatutBadge statut={p.statut} /></div>
        </div>

        {(p.contact_nom || p.contact_tel || p.notes) && (
          <DarkCard style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:8 }}>CONTACT</div>
            {p.contact_nom && <div style={{ fontSize:14, color:C.white, fontWeight:700 }}>{p.contact_nom}</div>}
            {p.contact_tel && <div style={{ fontSize:12, color:C.gold, marginTop:4 }}>{p.contact_tel}</div>}
            {p.notes && <div style={{ fontSize:12, color:C.muted, marginTop:8, fontStyle:"italic" }}>"{p.notes}"</div>}
          </DarkCard>
        )}

        {p.statut === "contact" && (
          <button onClick={() => changerStatut(p, "qualifie")} style={{ width:"100%", background:C.blue, border:"none", borderRadius:10, padding:14, fontWeight:800, fontSize:14, cursor:"pointer", color:C.white, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Ic name="check" size={15} color={C.white} /> Marquer Qualifié
          </button>
        )}
        {p.statut === "qualifie" && (
          <button onClick={() => changerStatut(p, "closing")} style={{ width:"100%", background:C.gold, border:"none", borderRadius:10, padding:14, fontWeight:800, fontSize:14, cursor:"pointer", color:C.dark, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Ic name="flame" size={15} color={C.dark} /> Marquer Closing
          </button>
        )}
        {p.statut === "closing" && (
          <button onClick={() => changerStatut(p, "signe")} style={{ width:"100%", background:C.success, border:"none", borderRadius:10, padding:14, fontWeight:800, fontSize:14, cursor:"pointer", color:C.white, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Ic name="check" size={15} color={C.white} /> Marquer Signé
          </button>
        )}
        {p.statut === "signe" && (
          <div style={{ background:"rgba(34,197,94,0.15)", border:`1px solid ${C.success}`, borderRadius:10, padding:12, marginBottom:10, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Ic name="check" size={14} color={C.success} />
            <div style={{ fontSize:12, color:C.success, fontWeight:700 }}>Client signé</div>
          </div>
        )}

        {p.statut !== "signe" && p.statut !== "perdu" && !showPerdu && (
          <button onClick={() => setShowPerdu(true)} style={{ width:"100%", background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer", color:C.danger, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Ic name="x" size={14} color={C.danger} /> Marquer perdu
          </button>
        )}
        {showPerdu && (
          <DarkCard>
            <div style={{ fontSize:12, color:C.white, fontWeight:700, marginBottom:8 }}>Motif :</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {MOTIFS_PERDU.map(m => (
                <button key={m} onClick={() => changerStatut(p, "perdu", m)} style={{ background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:C.danger, fontWeight:600, fontSize:12, textAlign:"left" }}>{m}</button>
              ))}
            </div>
          </DarkCard>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <SectionTitle title={scope === "own" ? "Mon pipeline" : "Pipeline commercial"} sub={`${clients.length} client${clients.length>1?"s":""}/prospect${clients.length>1?"s":""}`} light style={{ marginBottom:0 }} />
        <button onClick={() => setShowForm(v => !v)} style={{ background:C.gold, border:"none", borderRadius:10, padding:"10px 14px", fontWeight:800, fontSize:12, cursor:"pointer", color:C.dark }}>+ Prospect</button>
      </div>

      {showForm && (
        <DarkCard style={{ marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input placeholder="Nom du prospect *" value={form.nom} onChange={e => setForm({ ...form, nom:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input placeholder="Secteur" value={form.secteur} onChange={e => setForm({ ...form, secteur:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input placeholder="Nom du contact" value={form.contact_nom} onChange={e => setForm({ ...form, contact_nom:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input placeholder="Téléphone" value={form.contact_tel} onChange={e => setForm({ ...form, contact_tel:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes:e.target.value })} rows={2} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit", resize:"vertical" }} />
            <button onClick={ajouterProspect} disabled={saving || !form.nom.trim()} style={{ background: saving || !form.nom.trim() ? C.card2 : C.gold, border:"none", borderRadius:8, padding:12, fontWeight:800, fontSize:13, cursor: saving?"not-allowed":"pointer", color:C.dark }}>
              {saving ? "Ajout…" : "Ajouter au pipeline"}
            </button>
          </div>
        </DarkCard>
      )}

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        {stages.map(s => (
          <DarkCard key={s.key} accent={s.color} style={{ textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{clients.filter(p=>p.statut===s.key).length}</div>
            <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>{s.label}</div>
          </DarkCard>
        ))}
      </div>

      {clients.length === 0 && !showForm && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:C.muted, fontSize:13 }}>Aucun prospect pour l'instant. Ajoute le premier avec "+ Prospect".</div>
      )}

      {stages.map(stage => {
        const list = clients.filter(p => p.statut === stage.key);
        if (!list.length) return null;
        return (
          <div key={stage.key} style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:stage.color }} />
              <div style={{ fontSize:11, fontWeight:700, color:stage.color, letterSpacing:1 }}>{stage.label.toUpperCase()} ({list.length})</div>
            </div>
            {list.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{ background:C.card, borderRadius:12, padding:"14px 16px", marginBottom:10, borderLeft:`3px solid ${stage.color}`, cursor:"pointer" }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{p.nom}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{[p.secteur, p.contact_nom].filter(Boolean).join(" · ")}</div>
                {p.notes && <div style={{ fontSize:10, color:C.muted, marginTop:8, fontStyle:"italic" }}>{p.notes}</div>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ADMINISTRATION — factures / paiements
const AdministrationView = ({ membre }) => {
  const [factures, setFactures] = useState(null);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id:"", type:"facture", montant:"", date_echeance:"" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await supabase.from("lsx_factures").select("*, client:lsx_clients(nom)").order("date_echeance", { ascending:true });
    setFactures(data || []);
    const { data: cl } = await supabase.from("lsx_clients").select("id, nom").eq("statut", "signe").order("nom");
    setClients(cl || []);
  };

  useEffect(() => { load(); }, []);

  const ajouter = async () => {
    if (!form.client_id || !form.montant) { setErr("Client et montant requis."); return; }
    setErr(""); setSaving(true);
    const { error } = await supabase.from("lsx_factures").insert({
      client_id: form.client_id,
      type: form.type,
      montant: parseFloat(form.montant),
      date_echeance: form.date_echeance || null,
      created_by: membre.user_id,
    });
    setSaving(false);
    if (error) { setErr("Erreur : " + error.message); return; }
    setForm({ client_id:"", type:"facture", montant:"", date_echeance:"" });
    setShowForm(false);
    await load();
  };

  const marquerPayee = async (f) => {
    await supabase.from("lsx_factures").update({ statut:"payee", updated_at:new Date().toISOString() }).eq("id", f.id);
    await load();
  };

  if (factures === null) {
    return <div style={{ padding:"16px 16px 40px", color:C.muted, fontSize:13 }}>Chargement…</div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const enRetard = (f) => f.statut === "a_payer" && f.date_echeance && f.date_echeance < today;
  const enAttente = factures.filter(f => f.statut === "a_payer" && !enRetard(f));
  const retard = factures.filter(f => f.statut === "retard" || enRetard(f));
  const payees = factures.filter(f => f.statut === "payee");
  const fmtMontant = (n) => `${Number(n).toLocaleString("fr-FR")} FCFA`;

  const FactureCard = ({ f }) => (
    <DarkCard accent={f.statut === "retard" || enRetard(f) ? C.danger : f.statut === "payee" ? C.success : C.warn} style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{f.client?.nom || "Client"}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2, textTransform:"capitalize" }}>{f.type}{f.date_echeance ? ` · échéance ${new Date(f.date_echeance).toLocaleDateString("fr-FR")}` : ""}</div>
        </div>
        <StatutBadge statut={enRetard(f) ? "retard" : f.statut} />
      </div>
      <div style={{ fontSize:16, fontWeight:800, color:C.gold, marginTop:8 }}>{fmtMontant(f.montant)}</div>
      {f.statut !== "payee" && (
        <button onClick={() => marquerPayee(f)} style={{ marginTop:10, width:"100%", background:C.success, border:"none", borderRadius:8, padding:10, fontWeight:700, fontSize:12, cursor:"pointer", color:C.white }}>Marquer payée</button>
      )}
    </DarkCard>
  );

  return (
    <div style={{ padding:"16px 16px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <SectionTitle title="Administration" sub={`${factures.length} document${factures.length>1?"s":""}`} light style={{ marginBottom:0 }} />
        <button onClick={() => setShowForm(v => !v)} style={{ background:C.gold, border:"none", borderRadius:10, padding:"10px 14px", fontWeight:800, fontSize:12, cursor:"pointer", color:C.dark }}>+ Facture</button>
      </div>

      {showForm && (
        <DarkCard style={{ marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              <option value="">Client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm({ ...form, type:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              <option value="devis">Devis</option>
              <option value="facture">Facture</option>
              <option value="paiement">Paiement</option>
            </select>
            <input type="number" placeholder="Montant (FCFA)" value={form.montant} onChange={e => setForm({ ...form, montant:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input type="date" value={form.date_echeance} onChange={e => setForm({ ...form, date_echeance:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            {err && <div style={{ fontSize:12, color:C.danger }}>{err}</div>}
            <button onClick={ajouter} disabled={saving || !form.client_id || !form.montant} style={{ background: saving || !form.client_id || !form.montant ? C.card2 : C.gold, border:"none", borderRadius:8, padding:12, fontWeight:800, fontSize:13, cursor: saving?"not-allowed":"pointer", color:C.dark }}>
              {saving ? "Ajout…" : "Créer"}
            </button>
          </div>
        </DarkCard>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        <DarkCard accent={C.warn} style={{ textAlign:"center", padding:"12px 8px" }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.warn }}>{enAttente.length}</div>
          <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>En attente</div>
        </DarkCard>
        <DarkCard accent={C.danger} style={{ textAlign:"center", padding:"12px 8px" }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.danger }}>{retard.length}</div>
          <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>En retard</div>
        </DarkCard>
        <DarkCard accent={C.success} style={{ textAlign:"center", padding:"12px 8px" }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.success }}>{payees.length}</div>
          <div style={{ fontSize:9, color:C.muted, fontWeight:600 }}>Payées</div>
        </DarkCard>
      </div>

      {factures.length === 0 && !showForm && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:C.muted, fontSize:13 }}>Aucun document pour l'instant. Ajoute le premier avec "+ Facture".</div>
      )}

      {retard.length > 0 && (<>
        <SectionTitle title="En retard" light style={{ marginBottom:10 }} />
        {retard.map(f => <FactureCard key={f.id} f={f} />)}
      </>)}
      {enAttente.length > 0 && (<>
        <SectionTitle title="En attente" light style={{ marginBottom:10 }} />
        {enAttente.map(f => <FactureCard key={f.id} f={f} />)}
      </>)}
      {payees.length > 0 && (<>
        <SectionTitle title="Payées" light style={{ marginBottom:10 }} />
        {payees.map(f => <FactureCard key={f.id} f={f} />)}
      </>)}
    </div>
  );
};

// PRODUCTION — missions réelles (table lsx_missions), filtrées sur l'assigné
const ProductionView = ({ membre }) => {
  const [missions, setMissions] = useState(null);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ client_id:"", titre:"", date_mission:"", heure:"" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await supabase.from("lsx_missions").select("*, client:lsx_clients(nom)").eq("assigne_a", membre.user_id).order("date_mission", { ascending:true });
    setMissions(data || []);
    const { data: cl } = await supabase.from("lsx_clients").select("id, nom").eq("statut", "signe").order("nom");
    setClients(cl || []);
  };

  useEffect(() => { load(); }, []);

  const ajouter = async () => {
    if (!form.titre.trim()) { setErr("Titre requis."); return; }
    setErr(""); setSaving(true);
    const { error } = await supabase.from("lsx_missions").insert({
      client_id: form.client_id || null,
      titre: form.titre.trim(),
      date_mission: form.date_mission || new Date().toISOString().slice(0, 10),
      heure: form.heure.trim() || null,
      assigne_a: membre.user_id,
      created_by: membre.user_id,
    });
    setSaving(false);
    if (error) { setErr("Erreur : " + error.message); return; }
    setForm({ client_id:"", titre:"", date_mission:"", heure:"" });
    setShowForm(false);
    await load();
  };

  const changerStatut = async (m, statut, justif) => {
    await supabase.from("lsx_missions").update({ statut, justif: justif || null }).eq("id", m.id);
    setSelected(null);
    setShowConfirm(false);
    await load();
  };

  if (missions === null) {
    return <div style={{ padding:"16px 16px 40px", color:C.muted, fontSize:13 }}>Chargement…</div>;
  }

  if (selected) {
    const m = selected;
    return (
      <div style={{ padding:"16px 16px 40px" }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.gold, fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:12, padding:0 }}>← Retour</button>

        <div style={{ background:`linear-gradient(135deg,${C.blue},${C.navy})`, borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:C.gold, fontWeight:700, letterSpacing:1, marginBottom:4 }}>MISSION</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.white }}>{m.titre}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{m.client?.nom || "Sans client"} · {m.heure || "—"}</div>
          <div style={{ marginTop:10 }}><StatutBadge statut={m.statut} /></div>
        </div>

        {m.justif && (
          <div style={{ background:"rgba(239,68,68,0.12)", border:`1px solid ${C.danger}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
            <div style={{ fontSize:10, color:C.danger, fontWeight:700 }}>JUSTIFICATIF D'ÉCHEC</div>
            <div style={{ fontSize:12, color:C.white, marginTop:4 }}>{m.justif}</div>
          </div>
        )}

        {m.statut !== "termine" && m.statut !== "echec" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => changerStatut(m, "termine")} style={{ background:C.success, border:"none", borderRadius:10, padding:13, fontWeight:800, fontSize:13, cursor:"pointer", color:C.white, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="check" size={15} color={C.white} /> Marquer comme terminé</button>
            <button onClick={() => changerStatut(m, "en_cours")} style={{ background:C.warn, border:"none", borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer", color:C.dark, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="clock" size={15} color={C.dark} /> En cours</button>
            <button onClick={() => setShowConfirm(true)} style={{ background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:10, padding:13, fontWeight:700, fontSize:13, cursor:"pointer", color:C.danger, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Ic name="x" size={15} color={C.danger} /> Signaler un échec</button>
          </div>
        )}

        {showConfirm && (
          <div style={{ marginTop:12, background:C.card, borderRadius:10, padding:14 }}>
            <div style={{ fontSize:12, color:C.white, fontWeight:700, marginBottom:8 }}>Motif de l'échec :</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {["Client absent", "Matériel défaillant", "Accès refusé", "Autre"].map(r => (
                <button key={r} onClick={() => changerStatut(m, "echec", r)} style={{ background:"rgba(239,68,68,0.15)", border:`1px solid ${C.danger}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:C.danger, fontWeight:600, fontSize:12, textAlign:"left" }}>{r}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:"16px 16px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <SectionTitle title="Mes missions" sub={`${missions.length} mission${missions.length>1?"s":""}`} light style={{ marginBottom:0 }} />
        <button onClick={() => setShowForm(v => !v)} style={{ background:C.gold, border:"none", borderRadius:10, padding:"10px 14px", fontWeight:800, fontSize:12, cursor:"pointer", color:C.dark }}>+ Mission</button>
      </div>

      {showForm && (
        <DarkCard style={{ marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input placeholder="Titre (ex. Tournage produit)" value={form.titre} onChange={e => setForm({ ...form, titre:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              <option value="">Client (optionnel)…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <input type="date" value={form.date_mission} onChange={e => setForm({ ...form, date_mission:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input placeholder="Heure (ex. 14h00)" value={form.heure} onChange={e => setForm({ ...form, heure:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            {err && <div style={{ fontSize:12, color:C.danger }}>{err}</div>}
            <button onClick={ajouter} disabled={saving || !form.titre.trim()} style={{ background: saving || !form.titre.trim() ? C.card2 : C.gold, border:"none", borderRadius:8, padding:12, fontWeight:800, fontSize:13, cursor: saving?"not-allowed":"pointer", color:C.dark }}>
              {saving ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </DarkCard>
      )}

      {missions.length === 0 && !showForm && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:C.muted, fontSize:13 }}>Aucune mission pour l'instant. Ajoute la première avec "+ Mission".</div>
      )}

      {missions.map(m => (
        <div key={m.id} onClick={() => setSelected(m)} style={{ background:C.card, borderRadius:12, padding:"14px 16px", marginBottom:10, borderLeft:`3px solid ${m.statut==="termine"?C.success:m.statut==="echec"?C.danger:m.statut==="en_cours"?C.warn:C.muted}`, cursor:"pointer" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{m.titre}</div>
            <StatutBadge statut={m.statut} />
          </div>
          <div style={{ fontSize:11, color:C.muted }}>{m.client?.nom || "Sans client"}</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
            <div style={{ fontSize:10, color:C.light }}>{m.heure || ""}</div>
            <div style={{ fontSize:10, color:C.muted }}>{new Date(m.date_mission).toLocaleDateString("fr-FR")}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// SOCIAL MEDIA MGMT / COMMUNITY MGMT — tâches réelles (table lsx_taches)
// Pas de calendrier éditorial/publication réel : intégration API réseaux sociaux, explicitement V2 (CONCEPTION-DMV.md section 6)
const TachesView = ({ membre }) => {
  const [taches, setTaches] = useState(null);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const isCommunity = membre.role === "community";
  const [form, setForm] = useState({ client_id:"", titre:"", type: isCommunity ? "publication" : "strategie" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const typeOptions = isCommunity
    ? [["publication","Publication"],["general","Général"]]
    : [["strategie","Stratégie"],["editorial","Éditorial"],["general","Général"]];

  const load = async () => {
    const { data } = await supabase.from("lsx_taches").select("*, client:lsx_clients(nom)").eq("assigne_a", membre.user_id).order("created_at", { ascending:false });
    setTaches(data || []);
    const { data: cl } = await supabase.from("lsx_clients").select("id, nom").eq("statut", "signe").order("nom");
    setClients(cl || []);
  };

  useEffect(() => { load(); }, []);

  const ajouter = async () => {
    if (!form.titre.trim()) { setErr("Titre requis."); return; }
    setErr(""); setSaving(true);
    const { error } = await supabase.from("lsx_taches").insert({
      client_id: form.client_id || null,
      titre: form.titre.trim(),
      type: form.type,
      assigne_a: membre.user_id,
      created_by: membre.user_id,
    });
    setSaving(false);
    if (error) { setErr("Erreur : " + error.message); return; }
    setForm({ client_id:"", titre:"", type: isCommunity ? "publication" : "strategie" });
    setShowForm(false);
    await load();
  };

  const changerStatut = async (t, statut) => {
    await supabase.from("lsx_taches").update({ statut }).eq("id", t.id);
    await load();
  };

  if (taches === null) {
    return <div style={{ padding:"16px 16px 40px", color:C.muted, fontSize:13 }}>Chargement…</div>;
  }

  const enCours = taches.filter(t => t.statut !== "termine");
  const terminees = taches.filter(t => t.statut === "termine");

  const TacheCard = ({ t }) => (
    <DarkCard accent={t.statut==="termine"?C.success:t.statut==="en_cours"?C.warn:C.muted} style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{t.titre}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2, textTransform:"capitalize" }}>{t.type}{t.client?.nom ? ` · ${t.client.nom}` : ""}</div>
        </div>
        <StatutBadge statut={t.statut} />
      </div>
      {t.statut !== "termine" && (
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          {t.statut !== "en_cours" && <button onClick={() => changerStatut(t, "en_cours")} style={{ flex:1, background:C.warn, border:"none", borderRadius:8, padding:9, fontWeight:700, fontSize:11, cursor:"pointer", color:C.dark }}>En cours</button>}
          <button onClick={() => changerStatut(t, "termine")} style={{ flex:1, background:C.success, border:"none", borderRadius:8, padding:9, fontWeight:700, fontSize:11, cursor:"pointer", color:C.white }}>Terminer</button>
        </div>
      )}
    </DarkCard>
  );

  return (
    <div style={{ padding:"16px 16px 40px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <SectionTitle title="Mes tâches" sub={`${taches.length} tâche${taches.length>1?"s":""}`} light style={{ marginBottom:0 }} />
        <button onClick={() => setShowForm(v => !v)} style={{ background:C.gold, border:"none", borderRadius:10, padding:"10px 14px", fontWeight:800, fontSize:12, cursor:"pointer", color:C.dark }}>+ Tâche</button>
      </div>

      {showForm && (
        <DarkCard style={{ marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input placeholder="Titre" value={form.titre} onChange={e => setForm({ ...form, titre:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <select value={form.type} onChange={e => setForm({ ...form, type:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              {typeOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              <option value="">Client (optionnel)…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            {err && <div style={{ fontSize:12, color:C.danger }}>{err}</div>}
            <button onClick={ajouter} disabled={saving || !form.titre.trim()} style={{ background: saving || !form.titre.trim() ? C.card2 : C.gold, border:"none", borderRadius:8, padding:12, fontWeight:800, fontSize:13, cursor: saving?"not-allowed":"pointer", color:C.dark }}>
              {saving ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </DarkCard>
      )}

      {taches.length === 0 && !showForm && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:C.muted, fontSize:13 }}>Aucune tâche pour l'instant. Ajoute la première avec "+ Tâche".</div>
      )}

      {enCours.length > 0 && (<>
        <SectionTitle title="À faire" light style={{ marginBottom:10 }} />
        {enCours.map(t => <TacheCard key={t.id} t={t} />)}
      </>)}
      {terminees.length > 0 && (<>
        <SectionTitle title="Terminées" light style={{ marginBottom:10 }} />
        {terminees.map(t => <TacheCard key={t.id} t={t} />)}
      </>)}
    </div>
  );
};

// RH & PAIE
const EquipeView = ({ membre }) => {
  const [membres, setMembres] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom:"", email:"", role:"commercial" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await supabase.from("lsx_equipe_membres").select("*").order("created_at", { ascending:true });
    setMembres(data || []);
  };

  useEffect(() => { load(); }, []);

  const inviter = async () => {
    if (!form.nom.trim() || !/.+@.+\..+/.test(form.email)) { setErr("Nom et email valide requis."); return; }
    setErr(""); setSaving(true);
    const { error } = await supabase.from("lsx_equipe_membres").insert({
      agence_id: membre.agence_id,
      nom: form.nom.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
    });
    setSaving(false);
    if (error) { setErr(error.message.includes("duplicate") ? "Cet email est déjà invité." : "Erreur : " + error.message); return; }
    setForm({ nom:"", email:"", role:"commercial" });
    setShowForm(false);
    await load();
  };

  if (membres === null) {
    return <div style={{ padding:"16px 16px 90px", color:C.muted, fontSize:13 }}>Chargement…</div>;
  }

  return (
    <div style={{ padding:"16px 16px 90px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
        <SectionTitle title="Mon équipe" sub={`${membres.length} membre${membres.length>1?"s":""}`} light style={{ marginBottom:0 }} />
        <button onClick={() => setShowForm(v => !v)} style={{ background:C.gold, border:"none", borderRadius:10, padding:"10px 14px", fontWeight:800, fontSize:12, cursor:"pointer", color:C.dark }}>+ Inviter</button>
      </div>

      {showForm && (
        <DarkCard style={{ marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }} />
            <select value={form.role} onChange={e => setForm({ ...form, role:e.target.value })} style={{ background:C.dark, border:`1px solid ${C.card2}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:13, fontFamily:"inherit" }}>
              {ROLES.filter(r => r.value !== "direction").map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {err && <div style={{ fontSize:12, color:C.danger }}>{err}</div>}
            <button onClick={inviter} disabled={saving} style={{ background: saving ? C.card2 : C.gold, border:"none", borderRadius:8, padding:12, fontWeight:800, fontSize:13, cursor: saving?"not-allowed":"pointer", color:C.dark }}>
              {saving ? "Envoi…" : "Créer l'invitation"}
            </button>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>La personne se connecte ensuite avec cet email sur le même lien que toi (aucun lien spécial à envoyer, juste le lien de l'app).</div>
          </div>
        </DarkCard>
      )}

      {membres.map(m => (
        <DarkCard key={m.id} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:C.card2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:`2px solid ${C.gold}` }}>
                {(m.nom || m.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{m.nom || m.email}{m.user_id === membre.user_id && <span style={{ color:C.muted, fontWeight:600 }}> · toi</span>}</div>
                <div style={{ fontSize:10, color:C.muted }}>{roleLabel(m.role)}</div>
              </div>
            </div>
            <StatutBadge statut={m.statut} />
          </div>
        </DarkCard>
      ))}
    </div>
  );
};

const EspaceRoleView = ({ membre, onLogout }) => (
  <div style={{ minHeight:"100vh", background:C.dark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, maxWidth:390, margin:"0 auto" }}>
    <Ic name="clock" size={30} color={C.gold} />
    <div style={{ fontSize:10, color:C.gold, fontWeight:700, letterSpacing:2, marginTop:16 }}>LS XPERTISE</div>
    <div style={{ fontSize:20, fontWeight:900, color:C.white, textAlign:"center", marginTop:6 }}>Bonjour {membre.nom || membre.email}</div>
    <div style={{ fontSize:13, color:C.light, textAlign:"center", marginTop:8, maxWidth:280, lineHeight:1.5 }}>
      Ton espace <b style={{ color:C.gold }}>{roleLabel(membre.role)}</b> arrive bientôt. Lyle a déjà activé ton accès, les outils de ton rôle seront branchés dans les prochains jours.
    </div>
    <button onClick={onLogout} style={{ marginTop:24, background:"none", border:`1px solid ${C.card2}`, borderRadius:10, padding:"10px 18px", color:C.muted, fontWeight:600, fontSize:12, cursor:"pointer" }}>Se déconnecter</button>
  </div>
);

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
const NotifPanel = ({ onClose }) => {
  const notifs = [
    { icon:"flame",   text:"Sanogo Frères SARL prêt pour closing", time:"Il y a 5 min", color:C.gold },
    { icon:"warning", text:"Mission Diallo Immo marquée ÉCHEC — Konan Jean", time:"Il y a 45 min", color:C.danger },
    { icon:"check",   text:"Mission BeautyPlus terminée par Yao Christelle", time:"Hier 14h22", color:C.success },
    { icon:"chart",   text:"Rapport TechVision CI prêt à envoyer", time:"Hier 10h00", color:C.blue },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", maxWidth:390, margin:"0 auto" }}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ background:C.navy, borderRadius:"20px 20px 0 0", padding:"16px", paddingBottom:40 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:15, fontWeight:800, color:C.white }}>Notifications</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
        {notifs.map((n, i) => (
          <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.card}`, alignItems:"flex-start" }}>
            <Ic name={n.icon} size={20} color={n.color} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:C.white, lineHeight:1.4 }}>{n.text}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{n.time}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:"50%", background:n.color, marginTop:3, flexShrink:0 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [membre, setMembre] = useState(null);
  const [view, setView] = useState("dashboard");
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthChecked(true); return; }
      const { data } = await supabase.rpc("lsx_claim_invite");
      const m = Array.isArray(data) ? data[0] : null;
      if (m) setMembre(m);
      else await supabase.auth.signOut();
      setAuthChecked(true);
    })();
  }, []);

  if (!authChecked) return <div style={{ minHeight:"100vh", background:C.dark }} />;
  if (!membre) return <LoginScreen onAuthed={(m) => { setMembre(m); setView("dashboard"); }} />;

  const initiale = (membre.nom || membre.email || "?").charAt(0).toUpperCase();
  const logout = async () => { await supabase.auth.signOut(); setMembre(null); setView("dashboard"); };

  if (membre.role !== "direction") {
    const roleContent = {
      commercial:     <CommercialView membre={membre} scope="own" />,
      administration: <AdministrationView membre={membre} />,
      production:     <ProductionView membre={membre} />,
      social_media:   <TachesView membre={membre} />,
      community:      <TachesView membre={membre} />,
    }[membre.role];

    if (!roleContent) return <EspaceRoleView membre={membre} onLogout={logout} />;

    return (
      <div style={{ maxWidth:390, margin:"0 auto", background:C.dark, minHeight:"100vh", fontFamily:"'Poppins', sans-serif", position:"relative", overflow:"hidden" }}>
        <TopBar titleOverride={roleLabel(membre.role)} initiale={initiale} onLogout={logout} onNotif={() => {}} notifCount={0} />
        {roleContent}
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "dashboard":  return <DashboardView setView={setView} membre={membre} />;
      case "clients":    return <ClientsView />;
      case "missions":   return <MissionsView role="ceo" />;
      case "commercial": return <CommercialView membre={membre} />;
      case "rh":         return <EquipeView membre={membre} />;
      default:           return <DashboardView setView={setView} membre={membre} />;
    }
  };

  return (
    <div style={{ maxWidth:390, margin:"0 auto", background:C.dark, minHeight:"100vh", fontFamily:"'Poppins', sans-serif", position:"relative", overflow:"hidden" }}>
      <TopBar view={view} onNotif={() => setShowNotif(true)} notifCount={2} initiale={initiale} onLogout={logout} />
      <div style={{ background: view==="clients"||view==="missions"||view==="commercial"||view==="rh" ? C.dark : C.dark }}>
        {renderView()}
      </div>
      <NavBar view={view} setView={setView} role={membre.role} />
      {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
    </div>
  );
}
