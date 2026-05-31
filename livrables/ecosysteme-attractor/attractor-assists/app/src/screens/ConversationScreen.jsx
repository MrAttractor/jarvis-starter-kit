import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { Icon, AssistGlyph, TypingDots, Card, Pill } from '../components/ui';

// ─── Openers personnalisés par agent ─────────────────────────────────────────

const OPENERS = {
  coach:  (p, n) => `Salut ${p}. Je suis ${n}. Qu'est-ce qu'on attaque aujourd'hui ?`,
  awa:    (p)    => `Salut ${p}. Je suis Awa. Dis-moi qui tu veux convaincre — un client, un partenaire, une audience. Je prépare le message.`,
  miriam: (p)    => `Salut ${p}. Je suis Miriam. Posts, réponses, broadcasts — je gère ta présence digitale. Par quoi on commence ?`,
  serge:  (p)    => `Salut ${p}. Je suis Serge. Dis-moi ce qui est dans ta tête en ce moment — tâches, rendez-vous, relances. Je trie et j'organise.`,
  roland: (p)    => `Salut ${p}. Je suis Roland. Parle-moi de tes prix et tes ventes. Je te dis si tu es rentable ou pas.`,
};

// Agents verrouillés = mode passif interactif
const LOCKED_AGENTS = ["miriam", "serge", "roland"];

// Nombre de lignes visibles avant troncature pour les agents passifs
const TRUNCATE_AFTER_CHARS = 320;

// ─── Composant bulle ──────────────────────────────────────────────────────────

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

// ─── Bulle tronquée avec gradient (agents passifs) ────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────────────────

export function ConversationScreen({ go, notify, params, profile }) {
  const a        = MOCK.assistants.find(x => x.id === (params?.assistant)) || MOCK.assistants[0];
  const first    = profile?.prenom        || "Champion";
  const nomAss   = profile?.nom_assistant || a.name;
  const isLocked = LOCKED_AGENTS.includes(a.id);

  const openerFn = OPENERS[a.id] || OPENERS.coach;
  const opener   = openerFn(first, isLocked ? a.name : nomAss);

  const [msgs, setMsgs]     = useState([{ from: "bot", text: opener }]);
  const [typing, setTyping] = useState(false);
  const [input, setInput]   = useState("");
  const [ppsd, setPpsd]     = useState(null);
  const scroller            = useRef();
  const prefillSent         = useRef(false);

  // Charger le PPSD pour le contexte
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("ppsd").select("*").eq("user_id", user.id).single();
        setPpsd(data);
      } catch {}
    };
    load();
  }, []);

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
          },
          ppsd:          ppsd || {},
          memoire_cache: profile?.memoire_cache || "",
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
                        ["Mon prix est-il bon ?", "Aide-moi à calculer ma marge", "Je veux augmenter mes tarifs"];

  return (
    <div className="min-h-full flex flex-col bg-sable">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200 sticky top-0 z-10">
        <button onClick={() => go("assistants")} className="w-10 h-10 rounded-full hover:bg-sable flex items-center justify-center text-charbon">
          <Icon name="back" size={20} />
        </button>
        <AssistGlyph accent={a.accent} icon={a.icon} size={42} />
        <div className="flex-1">
          <h3 className="font-display font-extrabold text-[16px] leading-tight">{a.id === "coach" ? nomAss : a.name}</h3>
          <div className={`text-[12px] font-semibold flex items-center gap-1 ${isLocked ? "text-amber" : "text-growth"}`}>
            {isLocked ? "● Mode aperçu" : "● En ligne"} · {a.role}
          </div>
        </div>
        {isLocked && (
          <button onClick={() => go("paliers")} className="px-3 py-1.5 rounded-full bg-orange text-white text-[12px] font-bold">
            Débloquer
          </button>
        )}
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
            : <Bubble key={i} from={m.from}>
                {m.text.split("\n\n").map((p, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>{p}</p>
                ))}
              </Bubble>
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

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-g200 flex items-center gap-2.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder={`Écris à ${isLocked ? a.name : nomAss}…`}
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
