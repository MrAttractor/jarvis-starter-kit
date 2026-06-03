import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Logo, Btn, Input, Icon, Spinner } from '../components/ui';
import { InstallGuide, detectPlatform } from './InstallScreen';

// ─── Slide d'introduction ─────────────────────────────────────────────────────

const INTRO_SLIDE = {
  headline: "Bienvenue. Je suis Mr Attractor.",
  lines: [
    "Vous avez des clients à suivre.",
    "Des commandes à gérer.",
    "Des tâches qui s'accumulent.",
    "",
    "Je suis votre Chief of Staff — Mr Attractor.",
    "",
    "En quelques minutes, nous allons structurer",
    "ce que vous portez seul depuis trop longtemps.",
  ],
  cta: "Commencer",
};

// ─── Secteurs d'activité ──────────────────────────────────────────────────────

const SECTEURS = ["Vêtements", "Restauration", "Livraison", "Services", "Beauté", "Autre"];

// ─── Questions Chief of Staff ─────────────────────────────────────────────────

const QUESTIONS_COS = [
  {
    id: "commandes",
    text: "Comment recevez-vous vos commandes aujourd'hui ?",
    placeholder: "WhatsApp, Facebook, en direct, téléphone...",
  },
  {
    id: "clients",
    text: "Comment notez-vous vos clients en ce moment ?",
    placeholder: "Dans ma tête, sur papier, dans un carnet...",
  },
  {
    id: "taches",
    text: "Quelle tâche vous prend le plus de temps chaque semaine ?",
    placeholder: "Répondre aux messages, gérer les livraisons, faire les devis...",
  },
];

// ─── Composant slide avec animation machine à écrire ─────────────────────────

function TypewriterSlide({ slide, onNext }) {
  const [typed, setTyped]           = useState('');
  const [visibleLines, setVisible]  = useState([]);
  const [animDone, setAnimDone]     = useState(false);
  const [cursor, setCursor]         = useState(true);
  const skipRef                     = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    skipRef.current = false;
    setTyped('');
    setVisible([]);
    setAnimDone(false);

    let i = 0;
    const typeTimer = setInterval(() => {
      if (skipRef.current) { clearInterval(typeTimer); setTyped(slide.headline); revealAll(); return; }
      if (i < slide.headline.length) { setTyped(slide.headline.slice(0, i + 1)); i++; }
      else { clearInterval(typeTimer); revealLines(); }
    }, 36);

    return () => clearInterval(typeTimer);
  }, [slide]);

  const revealLines = () => {
    let i = 0;
    const t = setInterval(() => {
      if (skipRef.current || i >= slide.lines.length) { clearInterval(t); if (!skipRef.current) setAnimDone(true); return; }
      setVisible(prev => [...prev, i]);
      i++;
    }, 300);
  };

  const revealAll = () => { setVisible(slide.lines.map((_, i) => i)); setAnimDone(true); };

  const handleSkip = () => { if (animDone) return; skipRef.current = true; setTyped(slide.headline); revealAll(); };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 15% 85%,rgba(242,92,5,.28),transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(242,92,5,.10),transparent 50%),#0c0907" }}
      onClick={handleSkip}
    >
      <div className="relative z-10 flex flex-col min-h-screen px-7 pt-12 pb-10">
        <Logo light size="sm" />

        <div className="flex-1 flex flex-col justify-center pt-6">
          <p className="font-display font-extrabold text-[26px] leading-[1.2] tracking-tight mb-6">
            {typed}
            {!animDone && (
              <span className="inline-block w-[2px] h-[1em] bg-orange ml-[2px] align-middle"
                style={{ opacity: cursor ? 1 : 0, transition: 'opacity .1s' }} />
            )}
          </p>

          <div className="flex flex-col gap-1">
            {slide.lines.map((line, i) => (
              <p key={i}
                className="text-[16px] leading-[1.6] text-white/85 whitespace-pre-line transition-all duration-300"
                style={{ opacity: visibleLines.includes(i) ? 1 : 0, transform: visibleLines.includes(i) ? 'translateY(0)' : 'translateY(6px)' }}>
                {line === "" ? " " : line}
              </p>
            ))}
          </div>
        </div>

        <div
          className="transition-all duration-500"
          style={{ opacity: animDone ? 1 : 0, transform: animDone ? 'translateY(0)' : 'translateY(12px)', pointerEvents: animDone ? 'auto' : 'none' }}
          onClick={e => e.stopPropagation()}
        >
          <Btn onClick={onNext} className="w-full" iconRight="arrow">{slide.cta}</Btn>
          {!animDone && <p className="text-center text-[12px] text-white/40 mt-3">Touche l'écran pour passer</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function OnboardingScreen({ onDone, installPromptRef }) {
  const [phase, setPhase]                 = useState("intro");
  const [installPlatform, setInstallPlatform] = useState(null);
  const [prenom, setPrenom]               = useState("");
  const [secteur, setSecteur]             = useState("");
  const [secteurCustom, setSecteurCustom] = useState("");
  const [qIdx, setQIdx]                   = useState(0);
  const [answers, setAnswers]             = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [quickWinNom, setQuickWinNom]     = useState("");
  const [quickWinContact, setQuickWinContact] = useState("");
  const [quickWinDone, setQuickWinDone]   = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveErr, setSaveErr]             = useState("");

  // ── NAVIGATION ──────────────────────────────────────────────────────────────

  const submitAnswer = () => {
    if (currentAnswer.trim().length < 2) return;
    const q = QUESTIONS_COS[qIdx];
    const newAnswers = { ...answers, [q.id]: currentAnswer.trim() };
    setAnswers(newAnswers);
    setCurrentAnswer("");
    if (qIdx < QUESTIONS_COS.length - 1) setQIdx(qIdx + 1);
    else { finalizeOnboarding(newAnswers); setPhase("quickwin"); }
  };

  const submitSecteur = (val) => { setSecteur(val); setPhase("questions"); setQIdx(0); setCurrentAnswer(""); };

  // ── SAUVEGARDE ───────────────────────────────────────────────────────────────

  const finalizeOnboarding = async (data) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("session perdue");

      const activite = secteur === "Autre" && secteurCustom.trim() ? secteurCustom.trim() : secteur;
      const referralCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();
      const ouverture = [data.commandes, data.clients, data.taches].filter(Boolean).join(' | ');

      await Promise.all([
        supabase.from("profiles").update({
          prenom: prenom.trim(),
          nom_assistant: "Attractor",
          activite,
          ouverture,
          onboarding_done: true,
          referral_code: referralCode,
        }).eq("id", user.id),
        supabase.from("ppsd").upsert({
          user_id: user.id,
          problemes: data.taches,
          souhaits: "Déléguer les tâches répétitives et organiser mon activité",
          updated_at: new Date().toISOString(),
        }),
      ]);

      const refCode = localStorage.getItem('aa_ref');
      if (refCode && refCode !== referralCode) {
        const { data: referrer } = await supabase
          .from('profiles').select('id, referral_count')
          .eq('referral_code', refCode).neq('id', user.id).single();
        if (referrer) {
          await Promise.all([
            supabase.from('profiles').update({ referred_by: refCode }).eq('id', user.id),
            supabase.from('profiles').update({ referral_count: (referrer.referral_count || 0) + 1 }).eq('id', referrer.id),
          ]);
        }
        localStorage.removeItem('aa_ref');
      }
    } catch {
      setSaveErr("Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const saveQuickWin = async () => {
    if (!quickWinNom.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("carnet_affaires").insert({
          user_id: user.id,
          type: "client",
          nom: quickWinNom.trim(),
          contact: quickWinContact.trim() || null,
          statut: "actif",
          derniere_interaction: new Date().toISOString(),
        });
      }
    } catch {}
    setQuickWinDone(true);
  };

  const handleEquipeDone = () => {
    const platform = detectPlatform();
    if (platform === 'installed' || platform === 'desktop') onDone();
    else { setInstallPlatform(platform); setPhase('install'); }
  };

  // ── RENDU ────────────────────────────────────────────────────────────────────

  if (phase === "intro") return <TypewriterSlide slide={INTRO_SLIDE} onNext={() => setPhase("prenom")} />;

  if (phase === "install") return (
    <InstallGuide platform={installPlatform} prenom={prenom} nomAssistant="Attractor"
      installPromptRef={installPromptRef} onDone={onDone} />
  );

  // ── Prénom ───────────────────────────────────────────────────────────────────

  if (phase === "prenom") return (
    <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
      <Logo size="sm" />
      <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
        <p className="text-[12px] font-bold text-orange uppercase tracking-widest mb-4">Faisons connaissance</p>
        <h2 className="font-display font-extrabold text-[26px] leading-[1.2] text-charbon">Quel est votre prénom ?</h2>
        <p className="text-[15px] text-g500 mt-2 leading-relaxed">Je personalise votre espace avec votre nom.</p>
        <div className="mt-6">
          <Input
            placeholder="Ex : Awa, Koffi, Joël, Mariam..."
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && prenom.trim().length >= 2 && setPhase("activite")}
            autoFocus
          />
        </div>
      </div>
      <Btn onClick={() => setPhase("activite")} iconRight="arrow"
        className={`w-full mt-6 ${prenom.trim().length < 2 ? "opacity-40 pointer-events-none" : ""}`}>
        Continuer
      </Btn>
    </div>
  );

  // ── Secteur d'activité ────────────────────────────────────────────────────────

  if (phase === "activite") return (
    <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
      <Logo size="sm" />
      <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
        <p className="text-[12px] font-bold text-orange uppercase tracking-widest mb-3">Votre activité</p>
        <h2 className="font-display font-extrabold text-[26px] leading-[1.2] text-charbon">
          {prenom}, dans quel secteur êtes-vous ?
        </h2>
        <p className="text-[15px] text-g500 mt-2 mb-8 leading-relaxed">
          Cela me permet d'adapter mes conseils à votre métier.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SECTEURS.map(s => (
            <button key={s} onClick={() => s === "Autre" ? setSecteur("Autre") : submitSecteur(s)}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 bg-white rounded-[18px] border-[1.5px] transition-all active:scale-[.97] text-center
                ${secteur === s ? "border-orange shadow-[0_0_0_3px_rgba(242,92,5,.12)]" : "border-g200 hover:border-orange/40"}`}>
              <span className="font-display font-bold text-[14px] text-charbon">{s}</span>
            </button>
          ))}
        </div>
        {secteur === "Autre" && (
          <div className="mt-4">
            <Input placeholder="Décrivez votre activité..." value={secteurCustom}
              onChange={e => setSecteurCustom(e.target.value)} autoFocus />
            <Btn onClick={() => submitSecteur("Autre")} iconRight="arrow"
              className={`w-full mt-3 ${secteurCustom.trim().length < 2 ? "opacity-40 pointer-events-none" : ""}`}>
              Continuer
            </Btn>
          </div>
        )}
      </div>
    </div>
  );

  // ── Questions conversationnelles ──────────────────────────────────────────────

  if (phase === "questions") {
    const q = QUESTIONS_COS[qIdx];
    const progress = Math.round(((qIdx + 1) / QUESTIONS_COS.length) * 100);

    return (
      <div className="min-h-screen flex flex-col bg-sable">
        <div className="px-6 pt-6 pb-4 bg-white border-b border-g200">
          <Logo size="sm" />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[13px] flex-shrink-0">
              MA
            </div>
            <div>
              <p className="font-display font-bold text-[14.5px] text-charbon">Mr Attractor</p>
              <p className="text-[11px] text-g400">Question {qIdx + 1} / {QUESTIONS_COS.length}</p>
            </div>
          </div>
          <div className="mt-3 h-[4px] bg-g100 rounded-full overflow-hidden">
            <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 px-5 py-6 flex flex-col gap-4 overflow-y-auto">
          {Object.values(answers).slice(-2).map((val, i) => (
            <div key={i} className="flex justify-end animate-[fadeUp_.25s_ease]">
              <div className="bg-orange text-white px-4 py-2.5 rounded-[18px] rounded-tr-[4px] max-w-[82%] text-[14px] font-medium leading-relaxed">{val}</div>
            </div>
          ))}
          <div className="flex items-start gap-2.5 animate-[fadeUp_.3s_ease]">
            <div className="w-9 h-9 rounded-full bg-orange flex-shrink-0 flex items-center justify-center text-white font-display font-extrabold text-[12px]">MA</div>
            <div className="bg-white px-4 py-3 rounded-[18px] rounded-tl-[4px] max-w-[82%] shadow-soft border border-g200">
              <p className="text-[14.5px] text-charbon leading-relaxed">{q.text}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-g200">
          <Input placeholder={q.placeholder} value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && currentAnswer.trim().length >= 2 && submitAnswer()}
            autoFocus />
          <Btn onClick={submitAnswer}
            className={`w-full mt-3 ${currentAnswer.trim().length < 2 ? "opacity-40 pointer-events-none" : ""}`}
            iconRight={qIdx < QUESTIONS_COS.length - 1 ? "arrow" : "check"}>
            {qIdx < QUESTIONS_COS.length - 1 ? "Suivant" : "Terminer"}
          </Btn>
        </div>
      </div>
    );
  }

  // ── Quick win : premier client dans le carnet ─────────────────────────────────

  if (phase === "quickwin") return (
    <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
      <Logo size="sm" />
      <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
        {!quickWinDone ? (
          <>
            <div className="w-12 h-12 rounded-[14px] bg-orange/12 flex items-center justify-center mb-5">
              <Icon name="users" size={24} className="text-orange" />
            </div>
            <h2 className="font-display font-extrabold text-[24px] leading-[1.2] text-charbon">
              Je crée votre carnet de clients.
            </h2>
            <p className="text-[15px] text-g500 mt-3 leading-relaxed">
              Ajoutons votre premier client maintenant — c'est votre Quick Win.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Input placeholder="Nom du client (ex : Mama Adjoua)" value={quickWinNom}
                onChange={e => setQuickWinNom(e.target.value)} autoFocus />
              <Input placeholder="WhatsApp ou téléphone (optionnel)" value={quickWinContact}
                onChange={e => setQuickWinContact(e.target.value)} />
            </div>
            <p className="text-[12px] text-g400 mt-3">Vous pourrez en ajouter d'autres depuis l'application.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-orange/12 flex items-center justify-center mb-5">
              <Icon name="check" size={28} className="text-orange" stroke={2.5} />
            </div>
            <h2 className="font-display font-extrabold text-[24px] leading-[1.2] text-charbon">
              {quickWinNom} est dans votre carnet.
            </h2>
            <p className="text-[15px] text-g500 mt-3 leading-relaxed">
              Votre Chief of Staff a commencé à organiser votre activité.
            </p>
            <div className="mt-5 p-4 bg-white rounded-[18px] border border-g200 shadow-soft flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[13px] flex-shrink-0">
                {quickWinNom.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-bold text-[15px] text-charbon">{quickWinNom}</p>
                <p className="text-[12px] text-green-600 font-semibold">● Client actif</p>
              </div>
            </div>
          </>
        )}
        {saveErr && <p className="mt-3 text-[12.5px] text-red-500 font-semibold">{saveErr}</p>}
      </div>

      {!quickWinDone ? (
        <div className="flex flex-col gap-2.5">
          <Btn onClick={saveQuickWin} iconRight="check"
            className={`w-full ${!quickWinNom.trim() ? "opacity-40 pointer-events-none" : ""}`}>
            Ajouter ce client
          </Btn>
          <button onClick={() => setPhase("equipe")} className="text-center text-[13px] text-g400 font-semibold py-2">
            Passer cette étape
          </button>
        </div>
      ) : (
        <Btn onClick={() => setPhase("equipe")} iconRight="arrow" className="w-full">
          Voir mon équipe
        </Btn>
      )}

      {saving && (
        <div className="absolute inset-0 bg-sable/60 flex items-center justify-center">
          <Spinner className="w-8 h-8" />
        </div>
      )}
    </div>
  );

  // ── Présentation de l'équipe ──────────────────────────────────────────────────

  if (phase === "equipe") {
    const TEAM = [
      { initiales: "MA", name: "Mr Attractor", role: "Chief of Staff · Organise votre activité", tier: "Gratuit", accent: "#F25C05" },
      { initiales: "AW", name: "Awa", role: "Relances & ventes", tier: "Attractor Growth", accent: "#8B5CF6" },
      { initiales: "MR", name: "Miriam + équipe", role: "Marketing, Finance, Organisation", tier: "Attractor Team", accent: "#1E5631" },
    ];
    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />
        <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
          <p className="text-[12px] font-bold text-orange uppercase tracking-widest mb-3">Votre équipe</p>
          <h2 className="font-display font-extrabold text-[26px] leading-[1.2] text-charbon mb-2">
            {prenom}, voici qui travaille avec vous.
          </h2>
          <p className="text-[15px] text-g500 mb-7 leading-relaxed">Je coordonne tout. Vous donnez les instructions.</p>
          <div className="flex flex-col gap-3">
            {TEAM.map((a, i) => (
              <div key={i} className={`p-4 rounded-[18px] border flex items-center gap-3.5 ${i === 0 ? "bg-charbon border-charbon/0" : "bg-white border-g200"}`}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-display font-extrabold text-[13px] flex-shrink-0"
                  style={{ background: a.accent }}>
                  {a.initiales}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-display font-bold text-[15px] ${i === 0 ? "text-white" : "text-charbon"}`}>{a.name}</p>
                  <p className={`text-[12px] mt-0.5 ${i === 0 ? "text-white/70" : "text-g400"}`}>{a.role}</p>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  i === 0 ? "bg-orange text-white" : "bg-g100 text-g500"
                }`}>{a.tier}</span>
              </div>
            ))}
          </div>
        </div>
        <Btn onClick={handleEquipeDone} iconRight="arrow" className="w-full mt-6">
          Entrer dans mon espace
        </Btn>
      </div>
    );
  }

  return null;
}
