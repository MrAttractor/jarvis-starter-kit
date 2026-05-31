import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Logo, Btn, Input, Spinner, Icon } from '../components/ui';

// Délais pour simuler la conversation en temps réel
const DELAY_FIRST_MSG  = 600;
const DELAY_RESEARCH   = 900;  // entre chaque étape de recherche
const DELAY_AFTER_RES  = 700;  // après la dernière étape avant l'insight
const DELAY_VICTOIRE   = 800;

// ─── Bulle de message ─────────────────────────────────────────────────────────

function Bubble({ from, children, className = "" }) {
  const isBot = from === "bot";
  return (
    <div className={`flex ${isBot ? "items-start gap-2.5" : "justify-end"} animate-[fadeUp_.25s_ease] ${className}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-orange flex-shrink-0 flex items-center justify-center text-white font-display font-extrabold text-[11px]">
          AA
        </div>
      )}
      <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed shadow-soft ${
        isBot
          ? "bg-white text-charbon border border-g200 rounded-tl-[4px]"
          : "bg-orange text-white rounded-tr-[4px]"
      }`}>
        {children}
      </div>
    </div>
  );
}

// ─── Étapes de recherche animées ──────────────────────────────────────────────

function ResearchSteps({ steps, visibleCount }) {
  return (
    <div className="flex flex-col gap-2 animate-[fadeUp_.3s_ease]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-orange flex-shrink-0 flex items-center justify-center text-white font-display font-extrabold text-[11px]">
          AA
        </div>
        <div className="bg-white border border-g200 rounded-2xl rounded-tl-[4px] px-4 py-3 shadow-soft w-full max-w-[82%]">
          <p className="text-[13px] font-bold text-charbon mb-2">Laisse-moi faire une lecture rapide...</p>
          <div className="flex flex-col gap-1.5">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-2 transition-all duration-300"
                style={{ opacity: i < visibleCount ? 1 : 0.2 }}
              >
                <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                  i < visibleCount ? "bg-growth text-white" : "bg-g200"
                }`}>
                  {i < visibleCount
                    ? <Icon name="check" size={10} stroke={2.5} />
                    : <span className="w-1.5 h-1.5 rounded-full bg-g400 block" />
                  }
                </div>
                <span className={`text-[12.5px] transition-colors ${i < visibleCount ? "text-charbon font-medium" : "text-g400"}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ActivationScreen({ profile, onDone }) {
  const prenom       = profile?.prenom        || "toi";
  const nomAssistant = profile?.nom_assistant  || "ton assistant";
  const initiales    = nomAssistant.slice(0, 2).toUpperCase();

  const [step, setStep]               = useState("loading");
  const [activationData, setActivation] = useState(null);
  const [msgs, setMsgs]               = useState([]);
  const [researchCount, setResearchCount] = useState(0);
  const [userInput, setUserInput]     = useState("");
  const [presenceUrl, setPresenceUrl] = useState("");
  const [presenceLoading, setPresenceLoading] = useState(false);
  const [presenceResult, setPresenceResult]   = useState(null);
  const [videTesteInput, setVideTesteInput]   = useState("");
  const scrollRef = useRef(null);

  const scroll = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  const addMsg = (from, text) => {
    setMsgs(prev => [...prev, { from, text }]);
    scroll();
  };

  // ── Chargement initial : appel Edge Function activation-sequence ────────────

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: ppsd } = user
          ? await supabase.from("ppsd").select("*").eq("user_id", user.id).single()
          : { data: null };

        const { data, error } = await supabase.functions.invoke("activation-sequence", {
          body: {
            prenom: profile?.prenom,
            ouverture: profile?.ouverture,
            activite: profile?.activite,
            cible: ppsd?.cible,
            probleme: ppsd?.problemes,
            souhait: ppsd?.souhaits,
            canal: profile?.canal_principal,
            profil: localStorage.getItem("aa_profil") || "entrepreneur",
          },
        });

        if (error || !data) throw new Error("Erreur activation");
        setActivation(data);
        setStep("mirroring");
      } catch {
        // Fallback si l'Edge Function échoue
        setActivation({
          couloir: "ventes",
          mirroring: `Tu m'as dit que tu voulais avancer dans ton business. Ce que j'entends derrière ça, c'est que tu as besoin d'un système qui travaille pour toi. On commence.`,
          research_steps: ["Analyse de ton secteur...", "Comportement de ta cible...", "Canaux les plus actifs..."],
          insight: "Je vois une activité qui a du potentiel. On va construire ensemble ce qui te manque pour passer au niveau supérieur.",
          victoire_label: "Donne-moi un lien — ta page Facebook, ton Instagram, ou ton site.",
          victoire_placeholder: "facebook.com/tonbusiness",
        });
        setStep("mirroring");
      }
    };
    init();
  }, []);

  // ── Affichage du mirroring après chargement ────────────────────────────────

  useEffect(() => {
    if (step !== "mirroring" || !activationData) return;
    const t = setTimeout(() => {
      addMsg("bot", activationData.mirroring);
      setStep("confirm");
    }, DELAY_FIRST_MSG);
    return () => clearTimeout(t);
  }, [step, activationData]);

  // ── Séquence de recherche ──────────────────────────────────────────────────

  useEffect(() => {
    if (step !== "research" || !activationData) return;
    const steps = activationData.research_steps || [];
    let count = 0;

    const next = () => {
      if (count < steps.length) {
        count++;
        setResearchCount(count);
        setTimeout(next, DELAY_RESEARCH);
      } else {
        setTimeout(() => {
          addMsg("bot", activationData.insight);
          const isOrg = activationData.couloir === "organisation";
          setTimeout(() => setStep(isOrg ? "vide_tete" : "presence_ask"), DELAY_AFTER_RES);
        }, DELAY_AFTER_RES);
      }
    };

    const t = setTimeout(next, 400);
    return () => clearTimeout(t);
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleConfirm = (confirmed) => {
    if (confirmed) {
      addMsg("me", "C'est ça.");
      setTimeout(() => setStep("research"), 400);
    } else {
      addMsg("me", "Je veux autre chose.");
      setTimeout(() => {
        addMsg("bot", "Pas de problème. Dis-moi ce que tu as en tête — on s'adapte à toi.");
        setStep("autre_chose");
      }, 400);
    }
  };

  const handleAutreChose = () => {
    if (userInput.trim().length < 3) return;
    addMsg("me", userInput);
    setUserInput("");
    setTimeout(() => setStep("research"), 400);
  };

  const handlePresence = async () => {
    if (!presenceUrl.trim()) return;
    addMsg("me", presenceUrl);
    setPresenceLoading(true);

    try {
      const { data } = await supabase.functions.invoke("analyze-presence", {
        body: {
          url: presenceUrl,
          activite: profile?.activite,
          cible: profile?.cible,
          profil_type: activationData?.couloir || "ventes",
        },
      });

      setPresenceResult(data);
      const analysisText = data
        ? `${data.strengths}\n\n${data.gap}\n\n${data.positioning}`
        : "J'ai regardé ta page. Il y a des choses à corriger pour mieux toucher ta cible.";

      addMsg("bot", analysisText);

      // Sauvegarder l'analyse présence dans le profil
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          presence_analyse: JSON.stringify(data),
        }).eq("id", user.id);
      }
    } catch {
      addMsg("bot", "J'ai eu du mal à accéder à ta page. Pas de souci — on continue sans ça.");
    }

    setPresenceLoading(false);
    setTimeout(() => setStep("victoire"), DELAY_VICTOIRE);
  };

  const handleVideTete = () => {
    if (videTesteInput.trim().length < 5) return;
    addMsg("me", videTesteInput);
    setVideTesteInput("");

    // Analyse des fuites (simple, basée sur le texte saisi)
    setTimeout(() => {
      addMsg("bot",
        "Je vois le pattern.\n\nTu refais les mêmes tâches chaque semaine sans les avoir documentées. C'est ça qui te vide — pas le volume de travail, le manque de système.\n\nOn commence par la tâche la plus répétitive. Une procédure en 5 étapes, et tu n'y penses plus jamais."
      );
      setTimeout(() => setStep("victoire"), DELAY_VICTOIRE);
    }, 800);
  };

  const handleVictoire = async () => {
    // Marquer l'activation comme faite
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ activation_done: true }).eq("id", user.id);
      }
    } catch {}
    onDone("conversation", { assistant: "coach" });
  };

  // ─── RENDU ────────────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sable gap-4">
        <Spinner className="w-10 h-10" />
        <p className="font-display font-bold text-[15px] text-charbon opacity-60">
          {nomAssistant} se prépare...
        </p>
      </div>
    );
  }

  const isOrg = activationData?.couloir === "organisation";

  return (
    <div className="min-h-screen flex flex-col bg-sable">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 bg-white border-b border-g200">
        <Logo size="sm" />
        <div className="flex items-center gap-3 mt-4">
          <div
            className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[13px] shadow-[0_0_0_3px_rgba(242,92,5,.2)]"
          >
            {initiales}
          </div>
          <div>
            <p className="font-display font-bold text-[15px] text-charbon">{nomAssistant}</p>
            <p className="text-[11.5px] text-growth font-semibold flex items-center gap-1">
              ● En train d'analyser ta situation
            </p>
          </div>
        </div>
      </div>

      {/* Zone conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Messages texte */}
        {msgs.map((m, i) => (
          <Bubble key={i} from={m.from}>
            {m.text.split("\n\n").map((p, j) => (
              <p key={j} className={j > 0 ? "mt-2" : ""}>{p}</p>
            ))}
          </Bubble>
        ))}

        {/* Étapes de recherche */}
        {step === "research" && activationData && (
          <ResearchSteps
            steps={activationData.research_steps}
            visibleCount={researchCount}
          />
        )}

        {/* Zone d'action selon l'étape */}

        {/* Confirmation */}
        {step === "confirm" && (
          <div className="flex gap-2.5 animate-[fadeUp_.3s_ease]">
            <Btn onClick={() => handleConfirm(true)} className="flex-1 !py-3">
              C'est ça
            </Btn>
            <button
              onClick={() => handleConfirm(false)}
              className="flex-1 py-3 rounded-xl border-[1.5px] border-g200 bg-white text-charbon font-display font-bold text-[14px] active:scale-[.98] transition"
            >
              Autre chose
            </button>
          </div>
        )}

        {/* Input libre si "autre chose" */}
        {step === "autre_chose" && (
          <div className="animate-[fadeUp_.3s_ease]">
            <textarea
              rows={3}
              placeholder="Dis-moi ce que tu as en tête..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="w-full bg-white border border-g200 rounded-[16px] px-4 py-3 text-[14.5px] text-charbon resize-none outline-none focus:ring-2 focus:ring-orange/20"
              autoFocus
            />
            <Btn
              onClick={handleAutreChose}
              className={`w-full mt-2.5 ${userInput.trim().length < 3 ? "opacity-40 pointer-events-none" : ""}`}
              iconRight="arrow"
            >
              On part là-dessus
            </Btn>
          </div>
        )}

        {/* Demande de lien présence (Ventes/Visibilité) */}
        {step === "presence_ask" && (
          <div className="animate-[fadeUp_.3s_ease]">
            <Bubble from="bot">
              <p>Donne-moi un lien maintenant.</p>
              <p className="mt-2 text-[13px] text-white/80">Ta page Facebook, ton Instagram, ou ton site. Je regarde ce que tu projettes en ce moment.</p>
            </Bubble>
            <div className="mt-3">
              <Input
                placeholder={activationData?.victoire_placeholder || "facebook.com/tonbusiness"}
                value={presenceUrl}
                onChange={e => setPresenceUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePresence()}
                autoFocus
              />
              <div className="flex gap-2 mt-2.5">
                <Btn
                  onClick={handlePresence}
                  className={`flex-1 ${!presenceUrl.trim() ? "opacity-40 pointer-events-none" : ""}`}
                  iconRight="arrow"
                >
                  {presenceLoading ? "Analyse en cours..." : "Analyser ma présence"}
                </Btn>
                <button
                  onClick={() => setStep("victoire")}
                  className="px-4 py-3 rounded-xl text-[13px] font-semibold text-g400 border border-g200 bg-white"
                >
                  Passer
                </button>
              </div>
              {presenceLoading && (
                <div className="flex items-center gap-2 mt-3 text-[12.5px] text-g400">
                  <Spinner className="w-4 h-4" />
                  Je regarde ta page...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vide-tête (Organisation) */}
        {step === "vide_tete" && (
          <div className="animate-[fadeUp_.3s_ease]">
            <Bubble from="bot">
              <p>Vide ta tête.</p>
              <p className="mt-2 text-[13px] text-white/80">Dis-moi les 5 choses qui occupent le plus ton esprit en ce moment — même si c'est du bazar.</p>
            </Bubble>
            <div className="mt-3">
              <textarea
                rows={4}
                placeholder="Ex : gérer les commandes WhatsApp, faire les devis, relancer les clients..."
                value={videTesteInput}
                onChange={e => setVideTesteInput(e.target.value)}
                className="w-full bg-white border border-g200 rounded-[16px] px-4 py-3 text-[14.5px] text-charbon resize-none outline-none focus:ring-2 focus:ring-orange/20"
                autoFocus
              />
              <Btn
                onClick={handleVideTete}
                className={`w-full mt-2.5 ${videTesteInput.trim().length < 5 ? "opacity-40 pointer-events-none" : ""}`}
                iconRight="spark"
              >
                Analyser mes fuites
              </Btn>
            </div>
          </div>
        )}

        {/* Victoire rapide */}
        {step === "victoire" && (
          <div className="animate-[fadeUp_.4s_ease]">
            <Bubble from="bot">
              <p className="font-bold text-charbon">{nomAssistant} est prêt, {prenom}.</p>
              <p className="mt-2">
                {isOrg
                  ? "On commence par documenter ta première procédure. 20 minutes. Tu n'y repenses plus jamais."
                  : "On crée ton premier contenu optimisé — basé sur ce que ta cible cherche vraiment."
                }
              </p>
              <p className="mt-2 text-[13px] text-white/80">
                La suite se construit au fil de tes besoins.
              </p>
            </Bubble>

            <div className="mt-4 p-4 bg-orange/8 border border-orange/15 rounded-[18px]">
              <p className="text-[13.5px] text-[#a23c00] font-semibold">
                {isOrg
                  ? "Mission du jour : ta première procédure en 5 étapes."
                  : "Mission du jour : ton premier post optimisé pour ta cible."
                }
              </p>
            </div>

            <Btn onClick={handleVictoire} className="w-full mt-4" iconRight="arrow">
              Lancer avec {nomAssistant}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
