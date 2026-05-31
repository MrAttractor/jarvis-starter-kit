import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Logo, Btn, Input, Textarea, Icon, Spinner } from '../components/ui';
import { InstallGuide, detectPlatform } from './InstallScreen';

// ─── ACTE 1 : Slides "je te comprends" ───────────────────────────────────────

const EMPATHY_SLIDES = [
  {
    headline: "Tu portes tout sur tes épaules.",
    lines: [
      "Ton activité.",
      "Tes clients.",
      "Tes ventes.",
      "Tes projets.",
      "Tes responsabilités.",
      "",
      "Chaque jour tu avances.",
      "",
      "Mais à force de tout gérer seul,\nla fatigue s'installe et ton esprit finit par saturer.",
    ],
    cta: "C'est moi",
  },
  {
    headline: "Le problème n'est pas ton potentiel.",
    lines: [
      "Tu as des idées.",
      "Tu as des compétences.",
      "Tu as de l'ambition.",
      "",
      "Ce qui te ralentit, c'est le manque de structure,\nde méthode et de soutien au quotidien.",
      "",
      "Un entrepreneur ne devrait pas passer\nson temps à éteindre des incendies.",
    ],
    cta: "Exactement",
  },
  {
    headline: "ATTRACTOR est là pour t'accompagner.",
    lines: [
      "Organise tes idées.",
      "Clarifie tes objectifs.",
      "Passe à l'action avec plus de sérénité.",
      "",
      "Trouve ton couloir.",
      "Construis ton rythme.",
      "Progresse chaque jour.",
      "",
      "Le monde n'attend pas que tu sois parfait.",
      "",
      "Il attend que tu révèles ce dont tu es capable.",
    ],
    cta: "Commencer maintenant",
  },
];

// ─── ACTE 2 : Questions de l'anamnèse ────────────────────────────────────────

const QUESTIONS = [
  {
    id: "activite",
    text: "C'est quoi ton activité ? En une phrase, comme tu l'expliquerais à quelqu'un dans la rue.",
    placeholder: "Ex : je vends des tenues wax sur commande à Abidjan",
    multiline: true,
  },
  {
    id: "cible",
    text: "Et tu t'adresses à qui exactement ?",
    placeholder: "Ex : jeunes actives d'Abidjan qui veulent être stylées sans se ruiner",
    multiline: true,
  },
  {
    id: "probleme",
    text: "Leur plus gros problème — ce qui les empêche de dormir — c'est quoi ?",
    placeholder: "Ce qui les freine, ce qu'elles redoutent...",
    multiline: true,
  },
  {
    id: "souhait",
    text: "Et ce qu'elles veulent vraiment, le résultat idéal si tout marchait, c'est quoi ?",
    placeholder: "Le changement qu'elles espèrent...",
    multiline: true,
  },
  {
    id: "canal",
    text: "Dernière chose. Où est-ce que ta cible passe le plus de temps ?",
    placeholder: "Facebook / Instagram / WhatsApp / TikTok...",
    multiline: false,
  },
];

// ─── Composant slide avec animation machine à écrire ─────────────────────────

function TypewriterSlide({ slide, slideIdx, total, onNext }) {
  const [typed, setTyped] = useState('');
  const [visibleLines, setVisibleLines] = useState([]);
  const [animDone, setAnimDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  const skipRef = useRef(false);

  // Clignotement du curseur
  useEffect(() => {
    const t = setInterval(() => setCursor(v => !v), 500);
    return () => clearInterval(t);
  }, []);

  // Machine à écrire sur le headline
  useEffect(() => {
    skipRef.current = false;
    setTyped('');
    setVisibleLines([]);
    setAnimDone(false);

    let i = 0;
    const SPEED = 36; // ms par caractère

    const typeTimer = setInterval(() => {
      if (skipRef.current) {
        clearInterval(typeTimer);
        setTyped(slide.headline);
        revealAllLines();
        return;
      }
      if (i < slide.headline.length) {
        setTyped(slide.headline.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeTimer);
        revealLines();
      }
    }, SPEED);

    return () => clearInterval(typeTimer);
  }, [slide]);

  const revealLines = () => {
    let i = 0;
    const DELAY = 320; // ms entre chaque ligne
    const lineTimer = setInterval(() => {
      if (skipRef.current || i >= slide.lines.length) {
        clearInterval(lineTimer);
        if (!skipRef.current) setAnimDone(true);
        return;
      }
      setVisibleLines(prev => [...prev, i]);
      i++;
    }, DELAY);
  };

  const revealAllLines = () => {
    setVisibleLines(slide.lines.map((_, i) => i));
    setAnimDone(true);
  };

  const handleSkip = () => {
    if (animDone) return;
    skipRef.current = true;
    setTyped(slide.headline);
    revealAllLines();
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 15% 85%, rgba(242,92,5,.28), transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(242,92,5,.10), transparent 50%), #0c0907",
      }}
      onClick={handleSkip}
    >
      {/* Slot image de fond — ajouter src plus tard */}
      {/* <img src="/uploads/slide-bg.jpg" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity" /> */}

      <div className="relative z-10 flex flex-col min-h-screen px-7 pt-12 pb-10">
        <Logo light size="sm" />

        <div className="flex-1 flex flex-col justify-center pt-6">
          {/* Headline — machine à écrire */}
          <p className="font-display font-extrabold text-[26px] leading-[1.2] tracking-tight mb-6">
            {typed}
            {!animDone && (
              <span
                className="inline-block w-[2px] h-[1em] bg-orange ml-[2px] align-middle"
                style={{ opacity: cursor ? 1 : 0, transition: 'opacity .1s' }}
              />
            )}
          </p>

          {/* Lignes révélées une par une */}
          <div className="flex flex-col gap-1">
            {slide.lines.map((line, i) => (
              <p
                key={i}
                className="text-[16px] leading-[1.6] text-white/85 whitespace-pre-line transition-all duration-300"
                style={{
                  opacity: visibleLines.includes(i) ? 1 : 0,
                  transform: visibleLines.includes(i) ? 'translateY(0)' : 'translateY(6px)',
                }}
              >
                {line === "" ? " " : line}
              </p>
            ))}
          </div>
        </div>

        {/* Indicateurs de progression */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-[3px] rounded-full transition-all duration-300"
              style={{
                width: i === slideIdx ? 28 : 8,
                background: i === slideIdx ? '#F25C05' : 'rgba(255,255,255,.25)',
              }}
            />
          ))}
        </div>

        {/* CTA — apparaît une fois l'animation terminée */}
        <div
          className="transition-all duration-500"
          style={{ opacity: animDone ? 1 : 0, transform: animDone ? 'translateY(0)' : 'translateY(12px)', pointerEvents: animDone ? 'auto' : 'none' }}
          onClick={e => e.stopPropagation()}
        >
          <Btn onClick={onNext} className="w-full" iconRight="arrow">
            {slide.cta}
          </Btn>
          {!animDone && (
            <p className="text-center text-[12px] text-white/40 mt-3">
              Touche l'écran pour passer
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Livrable immédiat — appel Edge Function ─────────────────────────────────

async function genererLivrable(supabaseClient, { prenom, activite, cible, probleme, souhait, canal, ouverture, profil }) {
  const { data, error } = await supabaseClient.functions.invoke("generate-livrable", {
    body: { prenom, activite, cible, probleme, souhait, canal, ouverture, profil },
  });
  if (error || !data?.post) throw new Error(error?.message || "Réponse vide");
  return data.post;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function OnboardingScreen({ onDone, installPromptRef }) {
  const [phase, setPhase] = useState("empathy");
  const [installPlatform, setInstallPlatform] = useState(null);
  const [profil, setProfil] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const [ouverture, setOuverture] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nomAssistant, setNomAssistant] = useState("");
  const [nomStep, setNomStep] = useState("prenom"); // prenom | assistant
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [livrable, setLivrable] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // ── NAVIGATION ──────────────────────────────────────────────────────────────

  const nextSlide = () => {
    if (slideIdx < EMPATHY_SLIDES.length - 1) setSlideIdx(slideIdx + 1);
    else setPhase("ouverture");
  };

  const submitOuverture = () => {
    if (ouverture.trim().length < 5) return;
    setPhase("nommer");
    setNomStep("prenom");
  };

  const submitNomStep = () => {
    if (nomStep === "prenom") {
      if (prenom.trim().length < 2) return;
      setNomStep("assistant");
    } else {
      if (!nomAssistant.trim()) return;
      setPhase("profil");
    }
  };

  const submitProfil = (value) => {
    setProfil(value);
    setPhase("anamnese");
    setQIdx(0);
    setCurrentAnswer("");
  };

  const submitAnswer = () => {
    if (currentAnswer.trim().length < 2) return;
    const q = QUESTIONS[qIdx];
    const newAnswers = { ...answers, [q.id]: currentAnswer.trim() };
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      finalizeOnboarding(newAnswers);
    }
  };

  // ── SAUVEGARDE + LIVRABLE ────────────────────────────────────────────────────

  const finalizeOnboarding = async (data) => {
    setSaving(true);
    setPhase("livrable");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("session perdue");
      if (profil) localStorage.setItem('aa_profil', profil);

      // Sauvegarde profil + PPSD en parallèle avec génération du livrable
      const [postResult] = await Promise.all([
        genererLivrable(supabase, {
          prenom,
          activite: data.activite,
          cible: data.cible,
          probleme: data.probleme,
          souhait: data.souhait,
          canal: data.canal,
          ouverture,
          profil,
        }),
        supabase.from("profiles").update({
          prenom: prenom.trim(),
          nom_assistant: nomAssistant.trim(),
          activite: data.activite,
          canal_principal: data.canal,
          ouverture: ouverture.trim(),
          onboarding_done: true,
        }).eq("id", user.id),
        supabase.from("ppsd").upsert({
          user_id: user.id,
          cible: data.cible,
          problemes: data.probleme,
          souhaits: data.souhait,
          updated_at: new Date().toISOString(),
        }),
      ]);

      setLivrable(postResult);
    } catch (err) {
      setSaveErr("Une erreur est survenue. Réessaie ou continue.");
    } finally {
      setSaving(false);
    }
  };

  const handleLivrableDone = () => {
    const platform = detectPlatform();
    if (platform === 'installed' || platform === 'desktop') {
      onDone();
    } else {
      setInstallPlatform(platform);
      setPhase('install');
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(livrable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── RENDU ────────────────────────────────────────────────────────────────────

  // ACTE 1 — Slides empathie
  if (phase === "empathy") {
    return (
      <TypewriterSlide
        key={slideIdx}
        slide={EMPATHY_SLIDES[slideIdx]}
        slideIdx={slideIdx}
        total={EMPATHY_SLIDES.length}
        onNext={nextSlide}
      />
    );
  }

  // ACTE 2a — Question d'ouverture
  if (phase === "ouverture") {
    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />
        <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
          <p className="text-[12px] font-bold text-orange uppercase tracking-widest mb-4">
            La vraie question
          </p>
          <h2 className="font-display font-extrabold text-[24px] leading-[1.2] text-charbon">
            Et si tu avais un bras droit professionnel dispo 24h/24...
          </h2>
          <p className="font-display font-extrabold text-[24px] leading-[1.2] text-orange mt-1">
            qu'est-ce que tu aimerais qu'il fasse pour toi ? Là. Maintenant.
          </p>
          <div className="mt-6">
            <Textarea
              rows={4}
              placeholder="Relancer mes prospects, préparer mes posts, m'aider à organiser..."
              value={ouverture}
              onChange={(e) => setOuverture(e.target.value)}
              autoFocus
            />
            <p className="text-[12px] text-g400 mt-2">
              Pas de bonne ou mauvaise réponse. C'est ta vérité qui compte.
            </p>
          </div>
        </div>
        <Btn
          onClick={submitOuverture}
          className={`w-full mt-6 ${ouverture.trim().length < 5 ? "opacity-40 pointer-events-none" : ""}`}
          iconRight="arrow"
        >
          Continuer
        </Btn>
      </div>
    );
  }

  // ACTE 2b — Nommer (prénom + nom de l'assistant)
  if (phase === "nommer") {
    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />
        <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
          {nomStep === "prenom" ? (
            <>
              <div className="text-[40px] mb-4">👋</div>
              <h2 className="font-display font-extrabold text-[26px] leading-[1.15] text-charbon">
                On fait connaissance.
              </h2>
              <p className="text-[16px] text-g700 mt-3 leading-relaxed">
                C'est quoi ton prénom ?
              </p>
              <div className="mt-6">
                <Input
                  placeholder="Ex : Awa, Koffi, Joël..."
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && prenom.trim().length >= 2 && submitNomStep()}
                  autoFocus
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-[40px] mb-4">🤝</div>
              <h2 className="font-display font-extrabold text-[26px] leading-[1.15] text-charbon">
                {prenom}, on va travailler ensemble.
              </h2>
              <p className="text-[16px] text-g700 mt-3 leading-relaxed">
                C'est ton assistant pour l'instant.{" "}
                <span className="font-bold text-orange">Un jour, il sera ton bras droit.</span>
                <br />Comment tu veux l'appeler ?
              </p>
              <div className="mt-6">
                <Input
                  placeholder="Ex : Aya, Max, Stella, Junior..."
                  value={nomAssistant}
                  onChange={(e) => setNomAssistant(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && nomAssistant.trim() && submitNomStep()}
                  autoFocus
                />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["Aya", "Kofi", "Max", "Stella", "Junior"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNomAssistant(n)}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-bold border-[1.5px] transition-all active:scale-95 ${
                        nomAssistant === n
                          ? "bg-orange text-white border-orange"
                          : "bg-white text-charbon border-g200 hover:border-orange/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <Btn
          onClick={submitNomStep}
          className={`w-full mt-6 ${
            (nomStep === "prenom" && prenom.trim().length < 2) ||
            (nomStep === "assistant" && !nomAssistant.trim())
              ? "opacity-40 pointer-events-none"
              : ""
          }`}
          iconRight="arrow"
        >
          {nomStep === "assistant"
            ? `C'est parti avec ${nomAssistant || "mon assistant"} →`
            : "Continuer"}
        </Btn>
      </div>
    );
  }

  // ACTE 2c — Profil dominant (branching)
  if (phase === "profil") {
    const PROFILS = [
      { id: "entrepreneur", emoji: "🚀", label: "J'ai mon business",   sub: "Entrepreneur · Fondateur" },
      { id: "salarie",      emoji: "💼", label: "Je suis salarié(e)",  sub: "Employé(e) · Fonctionnaire" },
      { id: "etudiant",     emoji: "🎓", label: "Je me forme",          sub: "Étudiant(e) · En apprentissage" },
      { id: "mix",          emoji: "⚡", label: "Les deux à la fois",  sub: "Salarié(e) + entrepreneur(e)" },
    ];

    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />
        <div className="flex-1 flex flex-col justify-center animate-[fadeUp_.4s_ease]">
          <p className="text-[12px] font-bold text-orange uppercase tracking-widest mb-3">
            Dis-moi qui tu es
          </p>
          <h2 className="font-display font-extrabold text-[26px] leading-[1.2] text-charbon mb-2">
            {prenom}, tu es plutôt…
          </h2>
          <p className="text-[15px] text-g700 mb-8 leading-relaxed">
            Ça m'aide à t'accompagner exactement comme il faut.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PROFILS.map((p) => (
              <button
                key={p.id}
                onClick={() => submitProfil(p.id)}
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-[20px] border-[1.5px] border-g200 hover:border-orange active:scale-[.96] transition-all duration-150 text-center"
              >
                <span className="text-[34px] leading-none">{p.emoji}</span>
                <span className="font-display font-bold text-[13.5px] text-charbon leading-tight">{p.label}</span>
                <span className="text-[11.5px] text-g400 leading-tight">{p.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTE 2c — Anamnèse conversationnelle
  if (phase === "anamnese") {
    const q = QUESTIONS[qIdx];
    const progress = Math.round(((qIdx + 1) / QUESTIONS.length) * 100);
    const initiales = nomAssistant.slice(0, 2).toUpperCase();

    return (
      <div className="min-h-screen flex flex-col bg-sable">
        {/* Header assistant */}
        <div className="px-6 pt-6 pb-4 bg-white border-b border-g200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[13px] flex-shrink-0">
              {initiales}
            </div>
            <div>
              <p className="font-display font-bold text-[14.5px] text-charbon">{nomAssistant}</p>
              <p className="text-[11px] text-g400">Question {qIdx + 1} / {QUESTIONS.length}</p>
            </div>
          </div>
          <div className="mt-3 h-[4px] bg-g100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Zone conversation */}
        <div className="flex-1 px-5 py-6 flex flex-col gap-4 overflow-y-auto">
          {/* Réponses précédentes */}
          {Object.values(answers).slice(-2).map((val, i) => (
            <div key={i} className="flex justify-end animate-[fadeUp_.25s_ease]">
              <div className="bg-orange text-white px-4 py-2.5 rounded-[18px] rounded-tr-[4px] max-w-[82%] text-[14px] font-medium leading-relaxed">
                {val}
              </div>
            </div>
          ))}

          {/* Question courante */}
          <div className="flex items-start gap-2.5 animate-[fadeUp_.3s_ease]">
            <div className="w-9 h-9 rounded-full bg-orange flex-shrink-0 flex items-center justify-center text-white font-display font-extrabold text-[12px]">
              {initiales}
            </div>
            <div className="bg-white px-4 py-3 rounded-[18px] rounded-tl-[4px] max-w-[82%] shadow-soft border border-g200">
              <p className="text-[14.5px] text-charbon leading-relaxed">{q.text}</p>
            </div>
          </div>
        </div>

        {/* Zone saisie */}
        <div className="px-5 pb-8 pt-4 bg-white border-t border-g200">
          {q.multiline ? (
            <Textarea
              rows={2}
              placeholder={q.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              autoFocus
            />
          ) : (
            <Input
              placeholder={q.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                currentAnswer.trim().length >= 2 &&
                submitAnswer()
              }
              autoFocus
            />
          )}
          <Btn
            onClick={submitAnswer}
            className={`w-full mt-3 ${
              currentAnswer.trim().length < 2 ? "opacity-40 pointer-events-none" : ""
            }`}
            iconRight={qIdx < QUESTIONS.length - 1 ? "arrow" : "spark"}
          >
            {qIdx < QUESTIONS.length - 1 ? "Envoyer" : "Voir mon premier livrable"}
          </Btn>
        </div>
      </div>
    );
  }

  // ACTE 3 — Premier livrable immédiat
  if (phase === "livrable") {
    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />

        {saving ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-[fadeUp_.3s_ease]">
            <Spinner className="w-10 h-10" />
            <p className="font-display font-bold text-[16px] text-charbon">
              {nomAssistant} analyse ce que tu viens de partager…
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col animate-[fadeUp_.4s_ease]">
            <div className="mt-5 mb-4">
              <p className="font-display font-bold text-[18px] text-charbon leading-snug">
                J'ai analysé ce que tu m'as dit.
              </p>
              <p className="text-[13.5px] text-g400 mt-1 leading-relaxed">
                Voici ce que j'ai appris sur ta situation — et ton premier message prêt à publier.
                Tu peux modifier, ajouter ou retirer ce que tu veux.
              </p>
            </div>

            <Textarea
              rows={10}
              value={livrable}
              onChange={e => setLivrable(e.target.value)}
              className="bg-white rounded-[20px] border border-g200 p-5 shadow-soft text-[14.5px] text-charbon leading-relaxed resize-none w-full"
            />

            <button
              onClick={handleCopy}
              className="mt-3 flex items-center gap-2 text-[13px] font-bold text-orange self-start transition active:scale-95"
            >
              <Icon name={copied ? "check" : "copy"} size={15} />
              {copied ? "Copié !" : "Copier"}
            </button>

            <div className="mt-5 p-4 rounded-[18px] bg-orange/8 border border-orange/15">
              <p className="text-[14px] text-[#a23c00] leading-relaxed">
                <b>{nomAssistant} est prêt, {prenom}.</b> La suite se construit
                au fil de tes besoins — une tâche à la fois.
              </p>
            </div>

            {saveErr && (
              <p className="mt-3 text-[12.5px] text-[#D64545] font-semibold flex items-center gap-1.5">
                <Icon name="warn" size={14} />
                {saveErr}
              </p>
            )}
          </div>
        )}

        {!saving && (
          <Btn onClick={handleLivrableDone} className="w-full mt-6" iconRight="arrow">
            Découvrir mon espace
          </Btn>
        )}
      </div>
    );
  }

  if (phase === 'install') {
    return (
      <InstallGuide
        platform={installPlatform}
        prenom={prenom}
        nomAssistant={nomAssistant}
        installPromptRef={installPromptRef}
        onDone={onDone}
      />
    );
  }

  return null;
}
