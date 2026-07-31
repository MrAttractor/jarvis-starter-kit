// ============ Screens 1–2 : Accueil/connexion + Onboarding ============

// ---------------- 1. ACCUEIL / CONNEXION (hero) ----------------
function LoginScreen({ onAuthed }) {
  const [step, setStep] = React.useState("intro"); // intro | email | otp | loading
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState(["", "", "", ""]);
  const [err, setErr] = React.useState("");
  const refs = [React.useRef(), React.useRef(), React.useRef(), React.useRef()];

  const submitEmail = () => {
    if (!/.+@.+\..+/.test(email)) { setErr("Entre un email valide pour recevoir ton code."); return; }
    setErr(""); setStep("otp");
    setTimeout(() => refs[0].current && refs[0].current.focus(), 200);
  };
  const onCode = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 3) refs[i + 1].current.focus();
  };
  const verify = () => {
    if (code.join("").length < 4) { setErr("Saisis les 4 chiffres reçus."); return; }
    setErr(""); setStep("loading");
    setTimeout(() => onAuthed(), 1400);
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* hero image */}
      <div className="absolute inset-0">
        <image-slot id="aa-hero" style={{ width: "100%", height: "100%", display: "block" }} shape="rect"
          placeholder="Photo entrepreneur·e ivoirien·ne — lumière chaude, fierté"></image-slot>
      </div>
      {/* warm gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,7,.30) 0%, rgba(20,12,7,.10) 30%, rgba(217,71,3,.55) 72%, rgba(160,46,0,.95) 100%)" }}></div>
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(255,122,46,.25), transparent 60%)" }}></div>

      {/* content */}
      <div className="relative z-10 flex flex-col min-h-screen px-7 pt-12 pb-9">
        <Logo light size="md" />

        {step === "intro" && (
          <div className="mt-auto animate-[fadeUp_.4s_ease]">
            <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Gratuit · sans carte</Pill>
            <h1 className="font-display font-extrabold text-[36px] leading-[1.06] tracking-tight mt-4">
              Ton bras droit IA.<br />Il <span className="text-amber">produit</span> à ta place.
            </h1>
            <p className="text-[15.5px] text-white/85 mt-4 max-w-[330px] leading-relaxed">
              Argumentaires, posts, offres, messages — prêts à copier. On avance avec toi, comme nous.
            </p>
            <div className="mt-7 space-y-3">
              <Btn className="w-full" iconRight="arrow" onClick={() => setStep("email")}>Démarrer gratuitement</Btn>
              <button onClick={() => setStep("email")} className="w-full text-center text-[14px] font-semibold text-white/85 py-2 hover:text-white">
                J'ai déjà un compte
              </button>
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => setStep("intro")} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">On y va. C'est quoi ton email ?</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Je t'envoie un code à 4 chiffres, pas de mot de passe à retenir.</p>
            <div className="bg-white rounded-[20px] p-5 text-charbon shadow-xl">
              <Field label="Ton email">
                <Input type="email" inputMode="email" placeholder="prenom@exemple.ci" value={email}
                  onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitEmail()} autoFocus />
              </Field>
              {err && <p className="text-[12.5px] text-[#D64545] font-semibold mt-2 flex items-center gap-1.5"><Icon name="warn" size={14} />{err}</p>}
              <Btn className="w-full mt-4" iconRight="arrow" onClick={submitEmail}>Recevoir mon code</Btn>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => { setStep("email"); setErr(""); }} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">Entre ton code</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Envoyé à <b className="text-white">{email}</b> · <span className="text-amber font-semibold">(démo : tape 4 chiffres)</span></p>
            <div className="bg-white rounded-[20px] p-5 text-charbon shadow-xl">
              <div className="flex gap-3 justify-between">
                {code.map((c, i) => (
                  <input key={i} ref={refs[i]} value={c} inputMode="numeric" maxLength={1}
                    onChange={(e) => onCode(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs[i - 1].current.focus(); if (e.key === "Enter") verify(); }}
                    className="w-full aspect-square text-center font-display font-extrabold text-[26px] bg-sable border-[1.5px] border-g200 rounded-xl outline-none focus:border-orange focus:ring-4 focus:ring-orange/12" />
                ))}
              </div>
              {err && <p className="text-[12.5px] text-[#D64545] font-semibold mt-3 flex items-center gap-1.5"><Icon name="warn" size={14} />{err}</p>}
              <Btn className="w-full mt-4" iconRight="arrow" onClick={verify}>Entrer dans l'app</Btn>
              <button className="w-full text-center text-[13px] font-semibold text-g400 mt-3 hover:text-orange">Renvoyer le code</button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="m-auto flex flex-col items-center gap-4 animate-[fadeUp_.2s_ease]">
            <Spinner className="w-12 h-12 !border-white/30 !border-t-white" />
            <p className="font-display font-bold text-[17px]">On prépare ton espace…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- 2. ONBOARDING (ikigai léger + PPSD) ----------------
function OnboardingScreen({ onDone }) {
  const [step, setStep] = React.useState(0);
  const total = 5;
  const [data, setData] = React.useState({ first: "", secteur: "", love: [], cible: "", probleme: "", souhait: "" });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggleLove = (v) => set("love", data.love.includes(v) ? data.love.filter(x => x !== v) : [...data.love, v]);

  const next = () => step < total - 1 ? setStep(step + 1) : onDone();
  const pct = Math.round(((step + 1) / total) * 100);

  const secteurs = ["Restauration", "Mode & beauté", "Services", "E-commerce", "Artisanat", "Autre"];
  const loves = ["Le contact client", "Créer / fabriquer", "Vendre & convaincre", "Organiser", "Le digital", "Former les autres"];

  const canNext = [
    data.first.trim().length > 1,
    !!data.secteur,
    data.love.length > 0,
    data.cible.trim().length > 2,
    data.probleme.trim().length > 2 && data.souhait.trim().length > 2,
  ][step];

  return (
    <div className="min-h-screen flex flex-col bg-sable">
      {/* top bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <span className="text-[13px] font-bold text-g400">{step + 1} / {total}</span>
        </div>
        <Progress value={pct} tone="orange" />
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col">
        {step === 0 && (
          <Step title="On fait connaissance 👋" sub="Dis-moi ton prénom, je vais te tutoyer et t'appeler par ton nom.">
            <Field label="Ton prénom"><Input placeholder="Aya" value={data.first} onChange={e => set("first", e.target.value)} autoFocus /></Field>
            <ReassureNote>Pas de jargon, pas de cours. Ici on produit, pas on révise.</ReassureNote>
          </Step>
        )}
        {step === 1 && (
          <Step title={`Ton activité, ${data.first || "champion"} ?`} sub="Choisis ton terrain de jeu. On adaptera tout à ton secteur.">
            <ChipGrid options={secteurs} value={[data.secteur]} onPick={v => set("secteur", v)} single />
          </Step>
        )}
        {step === 2 && (
          <Step title="Qu'est-ce qui te fait vibrer ?" sub="Ton couloir d'appel commence par ce que tu aimes faire (choisis-en plusieurs).">
            <ChipGrid options={loves} value={data.love} onPick={toggleLove} />
          </Step>
        )}
        {step === 3 && (
          <Step title="Maintenant, ta cible." sub="La vraie question de tout : à qui tu vends ? Décris-la en une phrase.">
            <Field label="Ma cible, c'est…" hint="Ex : jeunes actifs d'Abidjan qui veulent manger sain au bureau.">
              <Textarea rows={3} placeholder="Décris ta cible idéale…" value={data.cible} onChange={e => set("cible", e.target.value)} autoFocus />
            </Field>
          </Step>
        )}
        {step === 4 && (
          <Step title="Dans sa tête (PPSD)" sub="Deux infos clés sur ta cible. Le reste, on le construira ensemble.">
            <Field label="Son plus gros problème"><Textarea rows={2} placeholder="Ce qui l'empêche de dormir…" value={data.probleme} onChange={e => set("probleme", e.target.value)} /></Field>
            <div className="h-3" />
            <Field label="Ce qu'elle souhaite vraiment"><Textarea rows={2} placeholder="Le résultat qu'elle rêve d'avoir…" value={data.souhait} onChange={e => set("souhait", e.target.value)} /></Field>
            <ReassureNote tone="growth"><b>Bien joué.</b> Avec ça, je peux déjà te rédiger tes premiers argumentaires.</ReassureNote>
          </Step>
        )}

        <div className="mt-auto pt-6 flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="w-12 h-12 flex-shrink-0 rounded-xl border-[1.5px] border-charbon/15 flex items-center justify-center text-charbon hover:bg-charbon hover:text-white transition">
              <Icon name="back" size={20} />
            </button>
          )}
          <Btn className={`flex-1 ${!canNext ? "opacity-40 pointer-events-none" : ""}`} iconRight={step === total - 1 ? "spark" : "arrow"} onClick={next}>
            {step === total - 1 ? "Terminer & découvrir mon espace" : "Continuer"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Step({ title, sub, children }) {
  return (
    <div className="animate-[fadeUp_.3s_ease] pt-2">
      <h2 className="font-display font-extrabold text-[27px] leading-[1.12] tracking-tight text-charbon">{title}</h2>
      <p className="text-[14.5px] text-g700 mt-2.5 mb-6 leading-relaxed max-w-[320px]">{sub}</p>
      {children}
    </div>
  );
}
function ChipGrid({ options, value, onPick, single }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map(o => {
        const on = value.includes(o);
        return (
          <button key={o} onClick={() => onPick(o)}
            className={`px-4 py-3 rounded-xl font-semibold text-[14px] border-[1.5px] transition-all active:scale-95 ${on ? "bg-orange text-white border-orange shadow-[0_6px_16px_-6px_rgba(242,92,5,.5)]" : "bg-white text-charbon border-g200 hover:border-orange/50"}`}>
            {single && on && <Icon name="check" size={15} stroke={2.6} className="inline mr-1.5 -mt-0.5" />}{o}
          </button>
        );
      })}
    </div>
  );
}
function ReassureNote({ children, tone = "orange" }) {
  const c = tone === "growth" ? "bg-growth/8 text-growth border-growth/15" : "bg-orange/8 text-[#a23c00] border-orange/12";
  return <div className={`mt-6 rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${c}`}>{children}</div>;
}

Object.assign(window, { LoginScreen, OnboardingScreen });
