// ============ Screens 3, 7, 10 : Tableau de bord · MasterSheet · Profil ============

// ---------------- 3. TABLEAU DE BORD ----------------
function DashboardScreen({ go, notify }) {
  const u = MOCK.user, m = MOCK.messages;
  const remaining = m.limit - m.used;
  const progPct = 72;
  return (
    <div className="min-h-full bg-sable pb-2">
      {/* warm header */}
      <div className="relative overflow-hidden text-white rounded-b-[26px] px-5 pt-7 pb-7"
        style={{ background: "linear-gradient(150deg,#FF7A2E 0%,#F25C05 52%,#D94703 100%)" }}>
        <div className="absolute -right-16 -top-12 w-52 h-52 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }}></div>
        <div className="relative flex items-center justify-between">
          <button onClick={() => go("profil")} className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center font-display font-extrabold text-[17px]"
              style={{ background: "repeating-linear-gradient(45deg,#c95a1a,#c95a1a 6px,#b54f15 6px,#b54f15 12px)" }}>{u.initials}</div>
            <div>
              <div className="text-[13px] opacity-90 font-medium">Bonjour 👋</div>
              <div className="font-display font-extrabold text-[19px] leading-tight whitespace-nowrap">{u.name}</div>
            </div>
          </button>
          <Pill tone="white" icon="flame" className="backdrop-blur-sm !py-2">{u.streak} jours</Pill>
        </div>

        <div className="relative mt-6">
          <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Ton bras droit IA · gratuit</Pill>
          <h2 className="font-display font-extrabold text-[24px] leading-[1.16] tracking-tight mt-3">
            On avance, <span style={{ textDecoration: "underline 3px rgba(255,255,255,.5)", textUnderlineOffset: "4px" }}>comme nous</span>.<br />Aujourd'hui on attaque ton offre.
          </h2>
        </div>

        {/* message meter */}
        <button onClick={() => go("paliers")} className="relative w-full text-left mt-5 bg-charbon/20 rounded-xl px-3.5 py-3 active:scale-[.99] transition">
          <div className="flex justify-between items-baseline text-[12.5px] font-semibold">
            <span>Messages du jour</span>
            <span><b className="font-display text-[14px]">{remaining}</b> / {m.limit} restants</span>
          </div>
          <div className="h-[7px] bg-white/25 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${(remaining / m.limit) * 100}%` }}></div>
          </div>
        </button>
      </div>

      {/* body */}
      <div className="px-[18px] pt-5 flex flex-col gap-4">
        <SectionLabel action={<button onClick={() => go("onboarding")} className="text-[12px] font-bold text-orange">Voir</button>}>Ta progression</SectionLabel>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssistGlyph accent="growth" icon="medal" size={38} />
              <div className="min-w-0">
                <h3 className="font-display font-extrabold text-[15px] leading-tight whitespace-nowrap truncate">Palier {u.palier} · {MOCK.palierName}</h3>
                <div className="text-[12px] text-g400 font-medium truncate">Marque « {MOCK.brand.name} »</div>
              </div>
            </div>
            <Pill tone="growth" className="flex-shrink-0 whitespace-nowrap">▲ +1</Pill>
          </div>
          <Progress value={progPct} className="my-4" />
          <div className="flex justify-between">
            {MOCK.milestones.map(ms => (
              <button key={ms.id} onClick={() => go(ms.state === "now" ? "axes" : "onboarding")} className="flex flex-col items-center gap-1.5 flex-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition
                  ${ms.state === "done" ? "bg-growth border-growth text-white" : ms.state === "now" ? "bg-white border-orange text-orange shadow-[0_0_0_4px_rgba(242,92,5,.13)]" : "bg-white border-g200 text-g400"}`}>
                  {ms.state === "done" ? <Icon name="check" size={14} stroke={2.6} /> : ms.id}
                </span>
                <span className={`text-[10.5px] font-semibold text-center leading-tight ${ms.state === "todo" ? "text-g400" : "text-g700"}`}>{ms.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <SectionLabel>Prochaine action</SectionLabel>
        <div className="relative overflow-hidden rounded-[20px] p-5 text-white" style={{ background: "linear-gradient(135deg,#1F1B18,#2a2320)" }}>
          <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle,rgba(242,92,5,.35),transparent 70%)" }}></div>
          <div className="relative">
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-orange-light">On enchaîne</span>
            <h3 className="font-display font-extrabold text-[19px] leading-snug mt-2">Crée ton offre irrésistible</h3>
            <p className="text-[13px] text-white/70 mt-2 max-w-[260px] leading-relaxed">Produit principal + bonus + urgence pour ton bissap maison. Je te la rédige, prête à publier.</p>
            <Btn className="w-full mt-4" iconRight="arrow" onClick={() => go("conversation", { assistant: "coach" })}>Lancer avec mon assistant</Btn>
          </div>
        </div>

        <SectionLabel action={<button onClick={() => go("assistants")} className="text-[12px] font-bold text-orange">Tout voir</button>}>Tes bras droits</SectionLabel>
        <div className="flex gap-3 overflow-x-auto pb-1.5 -mx-[18px] px-[18px]" style={{ scrollbarWidth: "none" }}>
          {MOCK.assistants.slice(0, 4).map(a => {
            const locked = a.status === "verrouillé";
            return (
              <button key={a.id} onClick={() => locked ? go("paliers") : go("conversation", { assistant: a.id })}
                className="min-w-[140px] text-left bg-white border border-g200 rounded-xl p-3.5 shadow-soft active:scale-[.98] transition">
                <AssistGlyph accent={a.accent} icon={a.icon} size={40} locked={locked} />
                <h4 className="font-display font-bold text-[14px] mt-2.5">{a.name}</h4>
                <div className="text-[11.5px] text-g400">{a.role}</div>
                <div className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${locked ? "text-g400" : "text-growth"}`}>
                  {locked ? <><Icon name="lock" size={12} /> {a.plan}</> : <>● Actif</>}
                </div>
              </button>
            );
          })}
        </div>

        {/* community banner with photo slot */}
        <button onClick={() => go("paliers")} className="relative overflow-hidden rounded-[20px] text-white text-left flex items-stretch"
          style={{ background: "linear-gradient(120deg,rgba(30,86,49,.96),rgba(20,60,35,.96))" }}>
          <div className="absolute -right-5 -top-8 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,179,0,.30),transparent 70%)" }}></div>
          <div className="w-[88px] flex-shrink-0 self-stretch">
            <image-slot id="aa-community" style={{ width: "100%", height: "100%", display: "block" }} shape="rect"
              placeholder="Photo communauté"></image-slot>
          </div>
          <div className="relative p-4 flex-1">
            <h4 className="font-display font-extrabold text-[15px] leading-tight">3 240 entrepreneurs avancent avec toi</h4>
            <p className="text-[12px] text-white/80 mt-1 leading-snug">Tu n'es plus seul·e. On construit ton couloir, ensemble.</p>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber mt-2">Rejoindre les Bras Droits <Icon name="chevron" size={14} /></span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ---------------- 7. MASTERSHEET ----------------
function MasterSheetScreen({ go, notify }) {
  const [tab, setTab] = React.useState("cible");
  const p = MOCK.ppsd, b = MOCK.brand, o = MOCK.offre;
  const tabs = [{ id: "cible", label: "Ta cible" }, { id: "marque", label: "Ta marque" }, { id: "offre", label: "Ton offre" }];

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="MasterSheet" sub="Tout ce qu'on sait, rangé proprement"
        right={<button onClick={() => notify("Export simulé ✓")} className="w-10 h-10 rounded-full bg-white border border-g200 flex items-center justify-center text-charbon shadow-soft"><Icon name="copy" size={18} /></button>} />

      <div className="px-[18px] sticky top-0 z-10 bg-sable/95 backdrop-blur pb-2 pt-1">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-g200">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition ${tab === t.id ? "bg-orange text-white shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]" : "text-g700"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="px-[18px] pt-3 pb-4 flex flex-col gap-4">
        {tab === "cible" && (
          <>
            <PpsdCard tone="error" icon="warn" title="Problèmes" items={p.problemes} />
            <PpsdCard tone="amber" icon="bolt" title="Peurs" items={p.peurs} />
            <PpsdCard tone="info" icon="heart" title="Souhaits" items={p.souhaits} />
            <PpsdCard tone="growth" icon="spark" title="Désirs" items={p.desirs} />
            <div className="grid grid-cols-2 gap-3">
              <MiniCard icon="target" title="Où la trouver" items={p.ou} />
              <MiniCard icon="bolt" title="Déclencheurs" items={p.declencheurs} />
            </div>
          </>
        )}
        {tab === "marque" && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-extrabold text-[17px]">Identité de marque</h3>
              <button onClick={() => notify("Édition simulée")} className="text-orange"><Icon name="edit" size={18} /></button>
            </div>
            <Row label="Nom" value={b.name} />
            <Row label="Secteur" value={b.secteur} />
            <Row label="Promesse" value={b.promesse} />
            <Row label="Ville" value={b.ville} last />
          </Card>
        )}
        {tab === "offre" && (
          <>
            <Card className="p-5">
              <SectionLabel className="mb-3">Produit principal</SectionLabel>
              <p className="font-display font-bold text-[16px] text-charbon">{o.principal}</p>
            </Card>
            <Card className="p-5">
              <SectionLabel className="mb-3">Bonus</SectionLabel>
              <ul className="space-y-2.5">
                {o.bonus.map((x, i) => <li key={i} className="flex gap-2.5 text-[14px] text-g700"><Icon name="check" size={18} stroke={2.4} className="text-growth flex-shrink-0 mt-0.5" />{x}</li>)}
              </ul>
            </Card>
            <div className="rounded-[20px] border-2 border-dashed border-orange/40 bg-orange/5 p-5">
              <div className="flex items-center gap-2 text-orange font-display font-bold text-[14px] mb-1.5"><Icon name="clock" size={18} /> Limiteur d'urgence</div>
              <p className="text-[14px] text-[#a23c00] leading-relaxed">{o.urgence}</p>
            </div>
            <Btn variant="ghost" className="w-full" icon="spark" onClick={() => go("axes")}>Générer un argumentaire depuis ça</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function PpsdCard({ tone, icon, title, items }) {
  const c = { error: "#D64545", amber: "#9a6a00", info: "#2B6CB0", growth: "#1E5631" }[tone];
  const bg = { error: "rgba(214,69,69,.10)", amber: "rgba(255,179,0,.16)", info: "rgba(43,108,176,.10)", growth: "rgba(30,86,49,.10)" }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg, color: c }}><Icon name={icon} size={18} /></div>
        <h3 className="font-display font-extrabold text-[16px]">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((x, i) => <li key={i} className="flex gap-2.5 text-[14px] text-g700 leading-snug"><span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }}></span>{x}</li>)}
      </ul>
    </Card>
  );
}
function MiniCard({ icon, title, items }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2.5 text-charbon"><Icon name={icon} size={16} className="text-orange" /><h4 className="font-display font-bold text-[13px]">{title}</h4></div>
      <ul className="space-y-1.5">{items.map((x, i) => <li key={i} className="text-[12.5px] text-g700 leading-snug">· {x}</li>)}</ul>
    </Card>
  );
}
function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between gap-4 py-3 ${last ? "" : "border-b border-g200"}`}>
      <span className="text-[13px] text-g400 font-medium flex-shrink-0">{label}</span>
      <span className="text-[14px] text-charbon font-semibold text-right">{value}</span>
    </div>
  );
}

// ---------------- 10. PROFIL / PARAMÈTRES ----------------
function ProfilScreen({ go, notify, dark, setDark }) {
  const u = MOCK.user;
  const [zone, setZone] = React.useState("CI");
  const [ton, setTon] = React.useState("Chaleureux");
  const [aName, setAName] = React.useState(u.assistantName);
  const tons = ["Chaleureux", "Direct", "Fun & rythmé", "Pro"];

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Profil" sub="Ton espace, à ton image" />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        {/* identity */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-orange/30 flex items-center justify-center font-display font-extrabold text-[22px] text-white"
            style={{ background: "linear-gradient(135deg,#FF7A2E,#F25C05)" }}>{u.initials}</div>
          <div className="flex-1">
            <h3 className="font-display font-extrabold text-[18px]">{u.name}</h3>
            <p className="text-[13px] text-g400">{u.email}</p>
            <Pill tone="orange" className="mt-1.5">Palier {u.palier} · {u.plan}</Pill>
          </div>
        </Card>

        <SectionLabel>Préférences</SectionLabel>
        <Card className="p-5 flex flex-col gap-5">
          <Field label="Prénom"><Input value={u.first} onChange={() => {}} /></Field>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Zone</span>
            <div className="flex gap-2">
              {[["CI", "🇨🇮 Côte d'Ivoire"], ["EU", "🇪🇺 Europe / diaspora"]].map(([k, l]) => (
                <button key={k} onClick={() => setZone(k)} className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${zone === k ? "bg-orange text-white border-orange" : "bg-white border-g200 text-g700"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Ton préféré de ton assistant</span>
            <div className="flex flex-wrap gap-2">
              {tons.map(t => <button key={t} onClick={() => setTon(t)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${ton === t ? "bg-charbon text-white border-charbon" : "bg-white border-g200 text-g700"}`}>{t}</button>)}
            </div>
          </div>
          <Field label="Nom de ton assistant" hint="Donne-lui un petit nom, ça crée le lien."><Input value={aName} onChange={e => setAName(e.target.value)} /></Field>
        </Card>

        <SectionLabel>Application</SectionLabel>
        <Card className="p-2">
          <ToggleRow icon="moon" label="Mode sombre" on={dark} onClick={() => setDark(!dark)} />
          <NavRow icon="medal" label="Mes paliers & forfait" onClick={() => go("paliers")} />
          <NavRow icon="settings" label="Notifications" onClick={() => notify("Bientôt disponible")} last />
        </Card>

        <button onClick={() => go("logout")} className="w-full py-3.5 text-[14px] font-bold text-[#D64545] rounded-xl hover:bg-[#D64545]/8 transition">Se déconnecter</button>
        <p className="text-center text-[11px] text-g400 px-6 leading-relaxed">Attractor Assists · TVA non applicable, art. 293 B du CGI</p>
      </div>
    </div>
  );
}
function ToggleRow({ icon, label, on, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-sable transition">
      <div className="w-9 h-9 rounded-lg bg-charbon/6 flex items-center justify-center text-charbon"><Icon name={icon} size={18} /></div>
      <span className="flex-1 text-left font-semibold text-[14.5px]">{label}</span>
      <span className={`w-12 h-7 rounded-full p-1 transition ${on ? "bg-orange" : "bg-g200"}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`}></span></span>
    </button>
  );
}
function NavRow({ icon, label, onClick, last }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-sable transition ${last ? "" : ""}`}>
      <div className="w-9 h-9 rounded-lg bg-charbon/6 flex items-center justify-center text-charbon"><Icon name={icon} size={18} /></div>
      <span className="flex-1 text-left font-semibold text-[14.5px]">{label}</span>
      <Icon name="chevron" size={18} className="text-g400" />
    </button>
  );
}

// ---------------- shared app header ----------------
function AppHeader({ title, sub, right, onBack }) {
  return (
    <div className="px-[18px] pt-7 pb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {onBack && <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-g200 flex items-center justify-center text-charbon shadow-soft -ml-1"><Icon name="back" size={20} /></button>}
        <div>
          <h1 className="font-display font-extrabold text-[26px] leading-tight tracking-tight text-charbon">{title}</h1>
          {sub && <p className="text-[13.5px] text-g400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { DashboardScreen, MasterSheetScreen, ProfilScreen, AppHeader });
