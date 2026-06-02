import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { Icon, AssistGlyph, TypingDots, Card, Pill, Sheet, Textarea } from '../components/ui';

// ─── Openers par agent ─────────────────────────────────────────────────────────

const OPENERS_AGENTS = {
  awa: (p, profile) => {
    const ouverture = profile?.ouverture || '';
    const activite  = profile?.activite  || '';
    const txt = (ouverture + ' ' + activite).toLowerCase();

    if (txt.includes('relance') || txt.includes('prospect'))
      return `Salut ${p}. Je suis Awa.\n\nJ'ai vu que tu cherches à relancer des prospects. Je prépare ton message maintenant — dis-moi juste : c'est pour quel type de client et depuis combien de temps tu attends ?`;
    if (txt.includes('client') || txt.includes('vente') || txt.includes('closing'))
      return `Salut ${p}. Je suis Awa.\n\nTu es en phase de vente. Donne-moi le nom ou le profil du client que tu veux convaincre — je te prépare l'approche complète : premier message, relance et closing.`;
    if (txt.includes('contenu') || txt.includes('post') || txt.includes('audience'))
      return `Salut ${p}. Je suis Awa.\n\nTu construis ton audience ? Bien. Je peux transformer tes followers en clients. Dis-moi ce que tu vends et à qui — je commence par ton message d'approche.`;

    return `Salut ${p}. Je suis Awa.\n\nJe ne fais pas de conseils — je rédige directement. Dis-moi qui tu veux convaincre et de quoi. Je prépare le message en moins d'une minute.`;
  },
  miriam: (p) => `Salut ${p}. Je suis Miriam. Posts, réponses, broadcasts — je gère ta présence digitale. Par quoi on commence ?`,
  serge:  (p) => `Salut ${p}. Je suis Serge. Dis-moi ce qui est dans ta tête en ce moment — tâches, rendez-vous, relances. Je trie et j'organise.`,
  roland: (p) => `Salut ${p}. Je suis Roland. Parle-moi de tes prix et tes ventes. Je te dis si tu es rentable ou pas.`,
  kofi:   (p) => `Salut ${p}. Je suis Kofi. Je transforme ce que tu fais en histoire qui vend.\n\nDis-moi : c'est quoi ton activité, et c'est qui ta cible ? Je construis ta campagne complète.`,
};

// Opener bras droit — contextuel selon le profil dominant
const buildCoachOpener = (profile, nomAss) => {
  const prenom    = profile?.prenom        || "toi";
  const ouverture = profile?.ouverture     || "";
  const memoire   = profile?.memoire_cache || "";
  const profil    = typeof window !== "undefined"
    ? (localStorage.getItem("aa_profil") || "entrepreneur")
    : "entrepreneur";

  // Utilisateur qui revient
  if (memoire) {
    return `Content de te revoir, ${prenom}. ${memoire}\n\nOn continue ou tu as autre chose en tête ?`;
  }

  // Intro commune
  const intro = ouverture
    ? `Salut ${prenom}. Je suis ${nomAss} — ton assistant IA, disponible maintenant.\n\nTu m'as dit que tu voulais : "${ouverture}". C'est exactement pour ça que je suis là.`
    : `Salut ${prenom}. Je suis ${nomAss} — ton assistant IA, disponible maintenant.`;

  // Présentation équipe selon le profil
  if (profil === "etudiant") {
    return `${intro}\n\nJe suis là pour t'aider à structurer tes idées, clarifier ton projet, avancer à ton rythme.\n\nOn a aussi une équipe si tu en as besoin : Awa (vente et prospection), Miriam (contenu), Serge (organisation), Roland (finances). Tout est dans "Mon équipe" — disponible quand tu es prêt.\n\nPar quoi tu veux commencer ?`;
  }

  if (profil === "salarie") {
    return `${intro}\n\nJe connais ta contrainte principale : le temps est limité. Je suis là pour t'aider à avancer sur ce qui compte — sans te noyer.\n\nSi ton projet grandit, tu as une équipe avec toi : Awa (prospects), Miriam (contenu), Serge (organisation), Roland (finances). Dans "Mon équipe".\n\nOn commence par quoi ?`;
  }

  if (profil === "mix") {
    return `${intro}\n\nTu jonglais entre ton emploi et ton projet — je sais que chaque heure compte. Je suis là pour que tu avances sans t'éparpiller.\n\nTon équipe complète est dans "Mon équipe" : Awa, Miriam, Serge, Roland — chacun dans son domaine.\n\nPar quoi tu veux qu'on commence ?`;
  }

  // Entrepreneur (défaut)
  return `${intro}\n\nVoilà comment on fonctionne ensemble :\n→ Moi : ton point de contact principal. Tout ce qui est dans ta tête, tu me le dis.\n→ Awa : tes relances et messages de prospection\n→ Miriam : tes posts et présence digitale\n→ Serge : ton organisation et planning\n→ Roland : tes marges et finances\nTu les trouves dans "Mon équipe".\n\nPar quoi tu veux qu'on commence ?`;
};

// Agents verrouillés = mode passif interactif
const LOCKED_AGENTS = ["miriam", "serge", "roland", "kofi"];

// Nombre de lignes visibles avant troncature pour les agents passifs
const TRUNCATE_AFTER_CHARS = 320;

// â”€â”€â”€ Composant bulle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Bubble({ from, children }) {
  const me = from === "me";
  return (
    <div className={`max-w-[82%] px-4 py-3 text-[14.5px] leading-relaxed shadow-soft animate-[fadeUp_.25s_ease] ${
      me
        ? "self-end bg-orange text-white rounded-2xl rounded-br-md"
        : "self-start bg-white text-charbon border border-g200 rounded-2xl rounded-bl-md"
    }`}>
      {children}
    </div>
  );
}

// â”€â”€â”€ Bulle tronquée avec gradient (agents passifs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TruncatedBubble({ text, agentPlan, onUpgrade }) {
  const isLong = text.length > TRUNCATE_AFTER_CHARS;
  const visible = isLong ? text.slice(0, TRUNCATE_AFTER_CHARS) : text;

  return (
    <div className="self-start max-w-[82%] animate-[fadeUp_.25s_ease]">
      <div className="relative bg-white text-charbon border border-g200 rounded-2xl rounded-bl-md overflow-hidden shadow-soft">
        <div className="px-4 py-3 text-[14.5px] leading-relaxed">
          {visible.split("\n\n").map((p, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>{p}</p>
          ))}
        </div>
        {isLong && (
          <div className="absolute bottom-0 left-0 right-0">
            <div style={{ height: 60, background: "linear-gradient(to bottom, transparent, white)" }} />
          </div>
        )}
      </div>
      {isLong && (
        <button
          onClick={onUpgrade}
          className="mt-2 w-full text-left px-4 py-3 bg-orange/8 border border-orange/20 rounded-xl"
        >
          <p className="text-[13px] text-[#a23c00] font-semibold">
            Voir la suite et travailler en profondeur → Plan {agentPlan}
          </p>
        </button>
      )}
    </div>
  );
}

// â”€â”€â”€ Composant principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ConversationScreen({ go, notify, params, profile }) {
  const a        = MOCK.assistants.find(x => x.id === (params?.assistant)) || MOCK.assistants[0];
  const first    = profile?.prenom        || "Champion";
  const nomAss   = profile?.nom_assistant || a.name;
  const isLocked = LOCKED_AGENTS.includes(a.id);

  const opener = a.id === "coach"
    ? buildCoachOpener(profile, isLocked ? a.name : nomAss)
    : (OPENERS_AGENTS[a.id] || OPENERS_AGENTS.awa)(first, profile);

  const [msgs, setMsgs]           = useState([{ from: "bot", text: opener }]);
  const [typing, setTyping]       = useState(false);
  const [input, setInput]         = useState("");
  const [ppsd, setPpsd]           = useState(null);
  const [userId, setUserId]       = useState(null);
  const [flagOpen, setFlagOpen]   = useState(false);
  const [flagText, setFlagText]   = useState("");
  const scroller            = useRef();
  const prefillSent         = useRef(false);
  const sessionId           = useRef(`session-${Date.now()}`);

  // Charger le PPSD et l'user_id
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from("ppsd").select("*").eq("user_id", user.id).single();
        setPpsd(data);
      } catch {}
    };
    load();
  }, []);

  // Extraire les mémoires quand l'utilisateur quitte la conversation (>= 4 messages)
  useEffect(() => {
    return () => {
      const realMsgs = msgs.filter((m, i) => !(i === 0 && m.from === "bot"));
      if (realMsgs.length >= 4 && userId) {
        const formatted = realMsgs.map(m => ({ role: m.from === "me" ? "user" : "assistant", content: m.text }));
        supabase.functions.invoke("extract-memories", {
          body: { user_id: userId, session_id: sessionId.current, messages: formatted },
        }).catch(() => {});
      }
    };
  }, [msgs, userId]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  // Préfill automatique
  useEffect(() => {
    if (params?.prefill && !prefillSent.current) {
      prefillSent.current = true;
      const t = setTimeout(() => send(params.prefill), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const sendFlag = async () => {
    if (!flagText.trim() || !userId) return;
    try {
      await supabase.from('feedback').insert({
        user_id: userId,
        type:    'bug',
        message: flagText.trim(),
        context: { screen: 'conversation', agent_id: a.id, nb_messages: msgs.length },
      });
      setFlagOpen(false);
      setFlagText('');
    } catch {}
  };

  const sendToWhatsApp = async (text) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    if (userId) {
      try {
        await supabase.from('whatsapp_messages').insert({
          user_id:      userId,
          assistant_id: a.id,
          message_text: text,
        });
      } catch {}
    }
  };

  const send = async (text) => {
    if (!text?.trim()) return;

    const userMsg = { from: "me", text: text.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setTyping(true);

    try {
      const history = newMsgs.filter((m, i) => !(i === 0 && m.from === "bot"));

      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          messages: history,
          assistant_id: a.id,
          profile: {
            prenom:          profile?.prenom,
            nom_assistant:   profile?.nom_assistant,
            activite:        profile?.activite,
            canal_principal: profile?.canal_principal,
            ouverture:       profile?.ouverture,
            zone:            profile?.zone,
            ton_prefere:     profile?.ton_prefere,
            profil_type:     localStorage.getItem("aa_profil") || "entrepreneur",
          },
          ppsd:          ppsd || {},
          memoire_cache: profile?.memoire_cache || "",
          user_id:       userId,
        },
      });

      if (error || !data?.reply) throw new Error("Pas de réponse");
      setTyping(false);
      setMsgs(m => [...m, { from: "bot", text: data.reply, passive: isLocked }]);

      // Sauvegarder la mémoire courte si générée
      if (data.nouveau_resume) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("profiles")
              .update({ memoire_cache: data.nouveau_resume })
              .eq("id", user.id);
          }
        } catch {}
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { from: "bot", text: "Je reviens vers toi dans un instant. Réessaie." }]);
    }
  };

  const suggestions =
    a.id === "coach"  ? ["Aide-moi à trouver ma cible", "Construis mon offre", "Prépare mon argumentaire AIDA"] :
    a.id === "awa"    ? ["Rédige mon message de prospection", "Aide-moi à relancer un prospect", "Crée un argumentaire WhatsApp"] :
    a.id === "miriam" ? ["Rédige mon post Facebook de cette semaine", "Planifie 3 broadcasts WhatsApp", "Aide-moi à répondre à ma communauté"] :
    a.id === "serge"  ? ["Organise ma semaine", "Quelles sont mes priorités aujourd'hui ?", "J'ai des relances en retard"] :
    a.id === "kofi"   ? ["Construis ma campagne de lancement", "Ã‰cris mon film de marque", "Prépare ma séquence WhatsApp"] :
                        ["Mon prix est-il bon ?", "Aide-moi à calculer ma marge", "Je veux augmenter mes tarifs"];

  return (
    <div className="min-h-screen flex flex-col bg-sable">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200 sticky top-0 z-10">
        <button onClick={() => go("assistants")} className="w-10 h-10 rounded-full hover:bg-sable flex items-center justify-center text-charbon">
          <Icon name="back" size={20} />
        </button>
        <AssistGlyph accent={a.accent} icon={a.icon} size={42} />
        <div className="flex-1">
          <h3 className="font-display font-extrabold text-[16px] leading-tight">{a.id === "coach" ? nomAss : a.name}</h3>
          <div className={`text-[12px] font-semibold flex items-center gap-1 ${isLocked ? "text-amber" : "text-growth"}`}>
            {isLocked ? "â— Mode aperçu" : "â— En ligne"} Â· {a.role}
          </div>
        </div>
        {isLocked && (
          <button onClick={() => go("paliers")} className="px-3 py-1.5 rounded-full bg-orange text-white text-[12px] font-bold">
            Débloquer
          </button>
        )}
        <button onClick={() => setFlagOpen(true)} className="w-9 h-9 rounded-full hover:bg-sable flex items-center justify-center text-g400 flex-shrink-0">
          <Icon name="flag" size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
        {msgs.map((m, i) =>
          m.passive && m.from === "bot"
            ? <TruncatedBubble
                key={i}
                text={m.text}
                agentPlan={a.plan}
                onUpgrade={() => go("paliers")}
              />
            : (
              <div key={i} className={`flex flex-col gap-1 w-full ${m.from === "me" ? "items-end" : "items-start"}`}>
                <Bubble from={m.from}>
                  {m.text.split("\n\n").map((p, j) => (
                    <p key={j} className={j > 0 ? "mt-2" : ""}>{p}</p>
                  ))}
                </Bubble>
                {m.from === "bot" && i > 0 && (
                  <button
                    onClick={() => sendToWhatsApp(m.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-white active:scale-95 transition ml-1"
                    style={{ background: "#25D366" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Envoyer sur WhatsApp
                  </button>
                )}
              </div>
            )
        )}
        {typing && (
          <div className="self-start bg-white border border-g200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
            <TypingDots />
          </div>
        )}
      </div>

      {/* Suggestions (premier message uniquement) */}
      {msgs.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} className="flex-shrink-0 px-3.5 py-2 rounded-full bg-white border border-g200 text-[12.5px] font-semibold text-g700 hover:border-orange/50 transition">
              {s}
            </button>
          ))}
        </div>
      )}

      {flagOpen && (
        <Sheet title="Signaler un problème" onClose={() => setFlagOpen(false)}>
          <div className="flex flex-col gap-4">
            <Textarea
              rows={3}
              value={flagText}
              onChange={e => setFlagText(e.target.value)}
              placeholder="Décris ce qui ne fonctionne pas dans cette conversation…"
            />
            <button
              onClick={sendFlag}
              disabled={!flagText.trim()}
              className="w-full py-3.5 rounded-xl bg-charbon text-white font-bold text-[15px] disabled:opacity-40 transition active:scale-[.98]"
            >
              Envoyer
            </button>
          </div>
        </Sheet>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-g200 flex items-center gap-2.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder={`Ã‰cris à ${isLocked ? a.name : nomAss}…`}
          className="flex-1 bg-sable rounded-full px-4 py-3 text-[14.5px] outline-none focus:ring-2 focus:ring-orange/20"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="w-11 h-11 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-5px_rgba(242,92,5,.6)] active:scale-95 transition flex-shrink-0 disabled:opacity-40"
        >
          <Icon name="send" size={19} />
        </button>
      </div>
    </div>
  );
}

