// ============ Screens 6, 8, 9 : Axes de comm · Broadcasts · Paliers & facturation ============

// ---------------- 6. AXES DE COMMUNICATION (AIDA / PASA) ----------------
function AxesScreen({ go, notify }) {
  const [framework, setFramework] = React.useState("AIDA");
  const [channel, setChannel] = React.useState("WhatsApp");
  const [angle, setAngle] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | loading | result | error
  const channels = ["WhatsApp", "Instagram", "Facebook", "TikTok"];

  const generate = () => {
    setState("loading");
    setTimeout(() => {
      // simulate occasional error
      if (angle.trim().toLowerCase() === "bug") { setState("error"); return; }
      setState("result");
    }, 1700);
  };
  const result = framework === "AIDA" ? AIDA_DELIVERABLE : PASA_DELIVERABLE;

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Axes de communication" sub="Tes argumentaires prêts à copier" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        <Card className="p-5 flex flex-col gap-5">
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Méthode</span>
            <div className="grid grid-cols-2 gap-2.5">
              {[["AIDA", "Attention · Intérêt · Désir · Action"], ["PASA", "Problème · Agitation · Souhait · Action"]].map(([k, d]) => (
                <button key={k} onClick={() => setFramework(k)} className={`text-left p-3.5 rounded-xl border-[1.5px] transition ${framework === k ? "bg-orange/8 border-orange" : "bg-white border-g200"}`}>
                  <div className={`font-display font-extrabold text-[16px] ${framework === k ? "text-orange" : "text-charbon"}`}>{k}</div>
                  <div className="text-[11px] text-g400 leading-tight mt-1">{d}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Réseau</span>
            <div className="flex flex-wrap gap-2">
              {channels.map(c => <button key={c} onClick={() => setChannel(c)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${channel === c ? "bg-charbon text-white border-charbon" : "bg-white border-g200 text-g700"}`}>{c}</button>)}
            </div>
          </div>
          <Field label="Angle (optionnel)" hint="Laisse vide pour partir de ta MasterSheet.">
            <Input placeholder="Ex : promo de lancement, fraîcheur, livraison rapide…" value={angle} onChange={e => setAngle(e.target.value)} />
          </Field>
          <Btn className="w-full" icon="spark" onClick={generate}>Générer mon argumentaire</Btn>
        </Card>

        {state === "loading" && (
          <Card className="p-8 flex flex-col items-center gap-3 text-center">
            <Spinner className="w-10 h-10" />
            <p className="font-display font-bold text-[15px] text-charbon">{MOCK.user.assistantName} rédige ton {framework}…</p>
            <p className="text-[13px] text-g400">On puise dans ta cible et ton offre.</p>
          </Card>
        )}
        {state === "error" && (
          <Card className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D64545]/10 flex items-center justify-center text-[#D64545]"><Icon name="warn" size={24} /></div>
            <p className="font-display font-bold text-[15px]">Oups, ça a coincé.</p>
            <p className="text-[13px] text-g400 max-w-[260px]">La génération n'a pas abouti. Réessaie, ton crédit n'a pas été touché.</p>
            <Btn variant="ghost" icon="refresh" onClick={generate}>Réessayer</Btn>
          </Card>
        )}
        {state === "result" && (
          <div className="animate-[fadeUp_.3s_ease]">
            <SectionLabel className="mb-3" action={<Pill tone="info">{channel}</Pill>}>Résultat — {framework}</SectionLabel>
            <Card className="overflow-hidden">
              <div className="p-4 space-y-3">
                {result.blocks.map((b, i) => (
                  <div key={i} className="pb-3 border-b border-g200 last:border-0 last:pb-0">
                    <div className="text-[11px] font-bold tracking-wider uppercase text-orange mb-1">{b.k}</div>
                    <p className="text-[14px] text-charbon leading-relaxed">{b.v}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <Btn className="flex-1 !py-3 !text-[14px]" icon="copy" onClick={() => notify("Copié ✓ — prêt à coller")}>Copier</Btn>
                <button onClick={() => notify("Variante générée")} className="w-12 rounded-xl border-[1.5px] border-g200 flex items-center justify-center text-g700 hover:border-orange/50"><Icon name="refresh" size={19} /></button>
                <button onClick={() => go("broadcasts")} className="w-12 rounded-xl border-[1.5px] border-g200 flex items-center justify-center text-g700 hover:border-orange/50"><Icon name="mega" size={19} /></button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
const PASA_DELIVERABLE = {
  title: "Argumentaire PASA", tag: "Bissap",
  blocks: [
    { k: "Problème", v: "Tu veux boire sain au boulot mais y'a que des sodas sucrés autour de toi." },
    { k: "Agitation", v: "Chaque midi, tu fais un choix : ta santé ou ta soif. Et le sucre, sur le long terme, ça pardonne pas." },
    { k: "Souhait", v: "Et si une boisson naturelle, fraîche et ivoirienne arrivait direct à ton bureau ?" },
    { k: "Action", v: "Chez Aya livre ton Pack 6 de bissap maison aujourd'hui. Écris « BISSAP » sur WhatsApp, on s'occupe du reste." },
  ],
};

// ---------------- 8. BROADCASTS ----------------
function BroadcastsScreen({ go, notify }) {
  const [msg, setMsg] = React.useState("");
  const [audience, setAudience] = React.useState("Tous mes contacts");
  const [when, setWhen] = React.useState("now");
  const locked = true; // Découverte
  const planned = [
    { t: "Promo bissap −20 %", aud: "Tous · 312 contacts", when: "Demain · 11:00", on: "WhatsApp" },
    { t: "Nouveau parfum gingembre", aud: "Clients fidèles · 84", when: "Sam · 09:00", on: "Instagram" },
  ];
  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Broadcasts" sub="Parle à toute ta communauté d'un coup" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        {locked && (
          <button onClick={() => go("paliers")} className="rounded-[20px] p-4 text-white text-left flex items-center gap-3" style={{ background: "linear-gradient(120deg,#1F1B18,#2a2320)" }}>
            <div className="w-11 h-11 rounded-xl bg-amber/20 flex items-center justify-center text-amber flex-shrink-0"><Icon name="lock" size={22} /></div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-[14.5px]">Fonction palier Manager</h4>
              <p className="text-[12.5px] text-white/70">Compose ici en démo · passe Manager pour envoyer.</p>
            </div>
            <Icon name="chevron" size={18} className="text-amber" />
          </button>
        )}

        <Card className="p-5 flex flex-col gap-4">
          <Field label="Ton message">
            <Textarea rows={4} placeholder="Salut la famille ! Cette semaine chez Aya…" value={msg} onChange={e => setMsg(e.target.value)} />
            <div className="flex justify-between mt-1.5"><span className="text-[11.5px] text-g400">{msg.length} caractères</span><button onClick={() => go("axes")} className="text-[12px] font-bold text-orange flex items-center gap-1"><Icon name="spark" size={13} /> Aide-moi à écrire</button></div>
          </Field>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Audience</span>
            <div className="flex flex-wrap gap-2">
              {["Tous mes contacts", "Clients fidèles", "Prospects"].map(x => <button key={x} onClick={() => setAudience(x)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${audience === x ? "bg-orange text-white border-orange" : "bg-white border-g200 text-g700"}`}>{x}</button>)}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Quand ?</span>
            <div className="flex gap-2">
              {[["now", "Maintenant"], ["later", "Planifier"]].map(([k, l]) => <button key={k} onClick={() => setWhen(k)} className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${when === k ? "bg-charbon text-white border-charbon" : "bg-white border-g200 text-g700"}`}>{l}</button>)}
            </div>
          </div>
          <Btn className="w-full" icon={locked ? "lock" : "send"} onClick={() => locked ? go("paliers") : notify("Broadcast envoyé ✓")}>
            {locked ? "Débloquer l'envoi (Manager)" : "Envoyer le broadcast"}
          </Btn>
        </Card>

        <SectionLabel>Planifiés (aperçu)</SectionLabel>
        {planned.map((b, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0"><Icon name="mega" size={20} /></div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-[14px] truncate">{b.t}</h4>
              <p className="text-[12px] text-g400">{b.aud} · {b.on}</p>
            </div>
            <Pill tone="amber" icon="clock">{b.when}</Pill>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------- 9. PALIERS & UPSELL + FACTURATION ----------------
function PaliersScreen({ go, notify }) {
  const [pay, setPay] = React.useState(null); // forfait being purchased
  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Tes paliers" sub="Monte d'un cran, débloque ton équipe" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        {/* warm visual banner */}
        <div className="relative overflow-hidden rounded-[20px]" style={{ minHeight: 150 }}>
          <div className="absolute inset-0">
            <image-slot id="aa-paliers" style={{ width: "100%", height: "100%", display: "block" }} shape="rect" placeholder="Photo entrepreneur·e fier·e — réussite"></image-slot>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(20,12,7,.15),rgba(217,71,3,.85))" }}></div>
          <div className="relative p-5 pt-12 text-white">
            <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Promo flash en cours</Pill>
            <h3 className="font-display font-extrabold text-[21px] leading-tight mt-2">Deviens le #1 de ton couloir.</h3>
          </div>
        </div>

        {MOCK.forfaits.map(f => <ForfaitCard key={f.id} f={f} onPick={() => f.current ? notify("C'est déjà ton palier") : f.tbd ? notify("Tarif Bras Droit bientôt communiqué") : setPay(f)} />)}

        <div className="flex items-center justify-center gap-2 text-[12px] text-g400 mt-1">
          <Icon name="check" size={15} className="text-growth" /> Sans frais d'installation · résiliable à tout moment
        </div>
        <p className="text-center text-[11px] text-g400 px-6">TVA non applicable, art. 293 B du CGI.</p>
      </div>

      {pay && <PaymentSheet f={pay} onClose={() => setPay(null)} notify={notify} />}
    </div>
  );
}

function ForfaitCard({ f, onPick }) {
  return (
    <div className={`relative rounded-[20px] p-5 ${f.highlight ? "bg-charbon text-white shadow-[0_18px_40px_-18px_rgba(26,23,20,.6)]" : "bg-white border border-g200 shadow-soft"}`}>
      {f.highlight && <div className="absolute -top-3 left-5"><span className="bg-amber text-charbon font-display font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1"><Icon name="bolt" size={13} /> {f.promo}</span></div>}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-display font-extrabold text-[19px] ${f.highlight ? "text-white" : "text-charbon"}`}>{f.name}</h3>
          <p className={`text-[12.5px] mt-0.5 ${f.highlight ? "text-white/70" : "text-g400"}`}>{f.tagline}</p>
        </div>
        {f.current && <Pill tone="growth">Actuel</Pill>}
      </div>
      {f.tbd ? (
        <div className="mt-4">
          <span className="inline-block font-display font-bold text-[14px] text-g700 bg-charbon/6 px-3 py-1.5 rounded-lg">Tarif à venir</span>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mt-4">
            {f.eurOld && <span className="font-display text-[18px] line-through text-g400">{f.eurOld}</span>}
            <span className={`font-display font-extrabold text-[34px] leading-none ${f.highlight ? "text-orange-light" : "text-charbon"}`}>{f.eur}</span>
            <span className={`text-[13px] ${f.highlight ? "text-white/60" : "text-g400"}`}>{f.period}</span>
          </div>
          <div className={`text-[13px] font-semibold mt-0.5 ${f.highlight ? "text-amber" : "text-growth"}`}>{f.fcfa} {f.eur !== "0 €" ? f.period : ""}</div>
        </>
      )}
      <ul className="mt-4 space-y-2.5">
        {f.features.map((x, i) => (
          <li key={i} className={`flex gap-2.5 text-[13.5px] ${f.highlight ? "text-white/90" : "text-g700"}`}>
            <Icon name="check" size={17} stroke={2.4} className={f.highlight ? "text-orange-light flex-shrink-0 mt-0.5" : "text-growth flex-shrink-0 mt-0.5"} />{x}
          </li>
        ))}
      </ul>
      <Btn variant={f.current ? "ghost" : f.tbd ? "ghost" : f.highlight ? "primary" : "secondary"} className={`w-full mt-5 ${f.current || f.tbd ? "opacity-70" : ""}`} iconRight={f.current || f.tbd ? null : "arrow"} onClick={onPick}>
        {f.current ? "Ton palier actuel" : f.tbd ? "Bientôt disponible" : `Passer ${f.name}`}
      </Btn>
    </div>
  );
}

function PaymentSheet({ f, onClose, notify }) {
  const [method, setMethod] = React.useState(null);
  const [state, setState] = React.useState("choose"); // choose | loading | done
  const pay = (m) => { setMethod(m); setState("loading"); setTimeout(() => setState("done"), 1700); };
  const methods = [
    { id: "wave", label: "Wave", desc: "Mobile money", color: "#1DC4F2", fg: "#053a4a" },
    { id: "mtn", label: "MTN MoMo", desc: "Mobile money", color: "#FFCC00", fg: "#3a3000" },
    { id: "card", label: "Carte bancaire", desc: "Visa · Mastercard", color: "#E7E1D8", fg: "#1A1714" },
  ];
  return (
    <Sheet onClose={onClose} title={state === "done" ? "Bienvenue ! 🎉" : `Passer ${f.name}`}>
      {state === "choose" && (
        <div className="flex flex-col gap-4">
          <div className="bg-sable rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[15px]">{f.name}</div>
              <div className="text-[12.5px] text-g400">{f.tagline}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-[20px] text-charbon">{f.eur}<span className="text-[12px] text-g400 font-normal">{f.period}</span></div>
              <div className="text-[12px] text-growth font-semibold">{f.fcfa}</div>
            </div>
          </div>
          <span className="font-semibold text-[13.5px]">Choisis ton moyen de paiement</span>
          <div className="flex flex-col gap-2.5">
            {methods.map(m => (
              <button key={m.id} onClick={() => pay(m)} className="flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] border-g200 hover:border-orange transition text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-[13px]" style={{ background: m.color, color: m.fg }}>{m.label.split(" ")[0].slice(0, 4)}</div>
                <div className="flex-1"><div className="font-display font-bold text-[15px]">{m.label}</div><div className="text-[12px] text-g400">{m.desc}</div></div>
                <Icon name="chevron" size={18} className="text-g400" />
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-g400">Sans frais d'installation · TVA non applicable, art. 293 B du CGI.</p>
        </div>
      )}
      {state === "loading" && (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-11 h-11" />
          <p className="font-display font-bold text-[15px]">Confirmation via {method.label}…</p>
          <p className="text-[13px] text-g400">Valide la demande sur ton téléphone.</p>
        </div>
      )}
      {state === "done" && (
        <div className="py-6 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-growth/12 flex items-center justify-center text-growth"><Icon name="check" size={34} stroke={2.5} /></div>
          <h3 className="font-display font-extrabold text-[20px]">Tu es {f.name} !</h3>
          <p className="text-[13.5px] text-g700 max-w-[280px]">Ton équipe est débloquée. On passe à la vitesse supérieure, comme nous. 🔥</p>
          <Btn className="w-full mt-2" iconRight="arrow" onClick={onClose}>C'est parti</Btn>
        </div>
      )}
    </Sheet>
  );
}

Object.assign(window, { AxesScreen, BroadcastsScreen, PaliersScreen });
