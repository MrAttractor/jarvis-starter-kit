import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { Icon, AssistGlyph, TypingDots, Card, Pill, Sheet, Textarea } from '../components/ui';
import { generateDemoHtml } from '../lib/demoTemplate';

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
  maryline: (p) => `Salut ${p} ! Moi c'est Maryline.\n\nMon rôle : t'emmener par la main dans tout ce qu'on peut faire ici — une fonctionnalité à la fois, jusqu'à ce que ça clique vraiment pour toi. Pas de mode d'emploi, pas de liste.\n\nT'as une question sur quelque chose que t'as vu dans l'app, ou tu veux qu'on commence par ce qui peut t'aider le plus en ce moment ?`,
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

// Modal WhatsApp vs Attractor Assists
function WhatsAppModal({ onClose, onCTA }) {
  const avantages = [
    { icon: '🤖', titre: 'Agent IA intégré', desc: 'Répond à tes clients automatiquement, 24h/24, même quand tu dors.' },
    { icon: '📊', titre: 'Tableau de bord', desc: 'Tes chiffres, tes clients, tes commandes — tout en un coup d\'oeil.' },
    { icon: '🔔', titre: 'Relances automatiques', desc: 'Plus jamais un client oublié. L\'app relance à ta place.' },
    { icon: '📦', titre: 'Gestion métier', desc: 'Commandes, livraisons, dossiers — organisés et suivis automatiquement.' },
  ];
  const limites = [
    'Messages perdus dans les groupes',
    'Impossible de retrouver un ancien client',
    'Pas de suivi des paiements',
    'Tu gères tout manuellement',
    'Zéro statistique sur ton activité',
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full bg-sable rounded-t-[28px] max-h-[90vh] overflow-y-auto pb-8"
        onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-g200" />
        </div>
        {/* Header */}
        <div className="px-5 pb-4 border-b border-g200">
          <p className="text-[11px] font-bold text-orange uppercase tracking-widest mb-1">Pourquoi pas WhatsApp ?</p>
          <h2 className="font-display font-extrabold text-[20px] text-charbon leading-tight">
            WhatsApp gère des messages.<br/>
            <span className="text-orange">Ton app gère ton business.</span>
          </h2>
        </div>
        {/* Limites WA */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[18px]">💬</span>
            <p className="text-[12px] font-bold text-g400 uppercase tracking-wider">Avec WhatsApp seul</p>
          </div>
          <div className="flex flex-col gap-2">
            {limites.map((l, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[14px] flex-shrink-0">✗</span>
                <p className="text-[13px] text-g500">{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Avantages */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[18px]">⚡</span>
            <p className="text-[12px] font-bold text-orange uppercase tracking-wider">Avec ton app Attractor</p>
          </div>
          <div className="flex flex-col gap-3">
            {avantages.map((a, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-[14px] p-3 shadow-[0_1px_4px_rgba(0,0,0,.06)]">
                <span className="text-[22px] flex-shrink-0">{a.icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-charbon">{a.titre}</p>
                  <p className="text-[12px] text-g400 mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div className="px-5">
          <button onClick={onCTA}
            className="w-full py-4 rounded-[16px] bg-orange text-white font-display font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(242,92,5,.5)]">
            <Icon name="spark" size={18} /> Activer mon app
          </button>
          <button onClick={onClose}
            className="w-full py-3 mt-2 text-[13px] text-g400 font-medium">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Card résultat démo maquette — 2 axes commerciaux
// showWAModal est géré au niveau parent pour éviter le clipping du fixed modal dans un overflow container
function DemoResultCard({ url, onSousHerberge, onFamilleA, onShowWA }) {
  return (
    <div className="self-start max-w-[92%] animate-[fadeUp_.3s_ease]">
      <div className="bg-charbon rounded-[20px] overflow-hidden shadow-[0_12px_32px_-10px_rgba(26,23,20,.5)]">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-growth animate-pulse" />
            <span className="text-[11px] font-bold text-growth uppercase tracking-[.1em]">Ta démo est prête</span>
          </div>
          <a href={url} target="_blank" rel="noreferrer"
            className="flex items-center justify-between px-4 py-3 bg-white/10 rounded-[12px] border border-white/15 mb-3 active:bg-white/15 transition">
            <span className="text-[13.5px] font-bold text-white truncate mr-2">Voir ma démo</span>
            <Icon name="arrow" size={16} className="text-orange flex-shrink-0" />
          </a>
          {/* Texte de vente — résultat, pas l'app */}
          <div className="mb-3 flex flex-col gap-1.5">
            <p className="text-[12.5px] text-white/60 leading-relaxed">WhatsApp vous permet de parler à vos clients.</p>
            <p className="text-[12.5px] text-white/90 font-semibold leading-relaxed">Assist vous aide à les convertir, les suivre, les fidéliser et développer votre entreprise.</p>
            <p className="text-[12px] text-white/50 leading-relaxed italic">Ne changez pas vos habitudes. Ajoutez simplement l'intelligence qui manquait à WhatsApp.</p>
          </div>
          {/* Lien "Pourquoi pas WhatsApp ?" */}
          <button onClick={onShowWA}
            className="flex items-center gap-1.5 mb-2 active:opacity-70 transition">
            <span className="text-[12px] text-white/40 underline underline-offset-2">Pourquoi pas WhatsApp ?</span>
          </button>
          <p className="text-[11.5px] text-white/50 mb-2">Choisis ton niveau :</p>
        </div>

          {/* Axe 1 — Sous hébergé */}
          <button onClick={onSousHerberge}
            className="w-full flex items-center justify-between px-4 py-4 bg-orange/15 border-t border-white/10 active:bg-orange/25 transition">
            <div className="text-left">
              <p className="text-[13px] font-bold text-orange">L'app hébergée chez nous</p>
              <p className="text-[11.5px] text-white/60 mt-0.5">Nos couleurs · déployée en 48h</p>
              <p className="text-[11px] font-bold text-amber mt-1">À partir de 9 900 FCFA / 15€ / mois</p>
            </div>
            <div className="flex-shrink-0 ml-3 px-2.5 py-1.5 rounded-[10px] bg-orange text-white text-[11px] font-bold">
              L'avoir
            </div>
          </button>

          {/* Axe 2 — App à son effigie */}
          <button onClick={onFamilleA}
            className="w-full flex items-center justify-between px-4 py-4 border-t border-white/10 active:bg-white/5 transition">
            <div className="text-left">
              <p className="text-[13px] font-bold text-amber">L'app à tes couleurs</p>
              <p className="text-[11.5px] text-white/60 mt-0.5">Ton logo · ta marque · tes agents</p>
              <p className="text-[11px] font-bold text-white/40 mt-1">Sur devis · Famille A</p>
            </div>
            <div className="flex-shrink-0 ml-3 px-2.5 py-1.5 rounded-[10px] bg-amber/20 border border-amber/40 text-amber text-[11px] font-bold">
              En parler
            </div>
          </button>
      </div>
    </div>
  );
}

// Nombre de lignes visibles avant troncature pour les agents passifs
const TRUNCATE_AFTER_CHARS = 320;

// â”€â”€â”€ Composant bulle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderText(text) {
  return text.split("\n\n").map((p, j) => (
    <p key={j} className={j > 0 ? "mt-2" : ""}>
      {p.split("\n").map((line, k) => k === 0 ? line : [<br key={k} />, line])}
    </p>
  ));
}

function Bubble({ from, children, ts }) {
  const me = from === "me";
  const time = ts ? new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className={`max-w-[82%] animate-[fadeUp_.25s_ease] ${me ? "self-end" : "self-start"}`}>
      <div
        className={me ? "text-white" : "text-charbon"}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.45,
          padding: '8px 12px 6px',
          borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: me ? '#F25C05' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,.12)',
        }}
      >
        {children}
        {time && (
          <div style={{ fontSize: 11, marginTop: 3, textAlign: 'right', opacity: me ? 0.7 : 0.45, lineHeight: 1 }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Bulle tronquée avec gradient (agents passifs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TruncatedBubble({ text, agentPlan, onUpgrade }) {
  const isLong = text.length > TRUNCATE_AFTER_CHARS;
  const visible = isLong ? text.slice(0, TRUNCATE_AFTER_CHARS) : text;

  return (
    <div className="self-start max-w-[82%] animate-[fadeUp_.25s_ease]">
      <div className="relative bg-white text-charbon border border-g200/60 rounded-[18px] rounded-bl-[5px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.10)]">
        <div className="px-4 py-3 text-[14.5px] leading-relaxed">
          {visible.split("\n\n").map((p, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {p.split("\n").map((line, k) => k === 0 ? line : [<br key={k} />, line])}
            </p>
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
  const a          = MOCK.assistants.find(x => x.id === (params?.assistant)) || MOCK.assistants[0];
  const first      = profile?.prenom        || "Champion";
  const nomAss     = profile?.nom_assistant || a.name;
  const isLocked   = LOCKED_AGENTS.includes(a.id);
  const isDemoMode     = params?.mode === 'demo'      && a.id === 'carelle';
  const isFamilleAMode = params?.mode === 'famille-a' && a.id === 'carelle';

  const demoOpener = `Salut ${first} ! Je suis Carelle.\n\nJe vais générer une maquette personnalisée de ton application en quelques minutes. Je te pose 4 questions rapides.\n\nCommençons : ton activité exacte et ta ville ?`;

  const opener = isDemoMode
    ? demoOpener
    : a.id === "coach"
      ? buildCoachOpener(profile, isLocked ? a.name : nomAss)
      : (OPENERS_AGENTS[a.id] || OPENERS_AGENTS.awa)(first, profile);

  const [msgs, setMsgs]               = useState([{ from: "bot", text: opener, ts: Date.now() }]);
  const [typing, setTyping]           = useState(false);
  const [input, setInput]             = useState("");
  const [ppsd, setPpsd]               = useState(null);
  const [userId, setUserId]           = useState(null);
  const [flagOpen, setFlagOpen]       = useState(false);
  const [flagText, setFlagText]       = useState("");
  const [demoProspectId, setDemoProspectId] = useState(null);
  const [demoGenerating, setDemoGenerating] = useState(false);
  const [demoUrl, setDemoUrl]         = useState(null);
  const [maquetteReady, setMaquetteReady]   = useState(false);
  const [showWAModal, setShowWAModal]       = useState(false);
  const scroller            = useRef();
  const prefillSent         = useRef(false);
  const demoProspectCreated = useRef(false);
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


  // Créer le prospect en base au premier message démo
  const createDemoProspect = async (uid) => {
    if (demoProspectCreated.current) return;
    demoProspectCreated.current = true;
    try {
      const { data } = await supabase.from('prospects').insert({
        prenom:       profile?.prenom || 'Inconnu',
        activite:     profile?.activite || '',
        besoin:       "Démo app — via Attractor Assists",
        zone:         profile?.zone || 'CI',
        type_projet:  'C',
        statut:       'nouveau',
        contexte:     `user_id:${uid}`,
      }).select('id').single();
      if (data?.id) setDemoProspectId(data.id);
    } catch {}
  };

  const saveDemoUrl = (_url) => {
    // La sauvegarde (demo_url + demo_html) est faite dans generate-maquette — rien à faire ici
  };

  // Générer la maquette localement (pas d'API — template JS personnalisé)
  const generateDemoMaquette = async () => {
    if (demoGenerating) return;
    setDemoGenerating(true);
    try {
      const html = generateDemoHtml({
        prenom:   profile?.prenom   || 'Vous',
        activite: profile?.activite || 'votre activité',
        zone:     profile?.zone     || 'CI',
      });
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      setDemoUrl(blobUrl);

      // Sauvegarder en base — demo_url séparé de demo_html pour éviter l'échec global si SQL 0025 pas encore appliqué
      if (userId) {
        supabase.from('profiles').update({ demo_url: 'generated' }).eq('id', userId).catch(() => {});
        supabase.from('profiles').update({ demo_html: html }).eq('id', userId).catch(() => {});
      }

      // Journal prospect (fire-and-forget)
      if (demoProspectId) {
        supabase.from('journal_agent').insert([
          { agent_id: 'awa', type: 'prospect_qualifie', contenu: `Demo générée pour ${profile?.prenom || 'Inconnu'} (${profile?.activite || 'N/C'}).`, prospect_id: demoProspectId },
        ]).catch(() => {});
      }
    } catch (err) {
      console.error('generateDemoMaquette failed:', err);
      setMsgs(m => [...m, { from: 'bot', text: `Oops, la génération a échoué. Réessaie dans un instant.` }]);
    } finally {
      setDemoGenerating(false);
    }
  };

  const send = async (text) => {
    if (!text?.trim()) return;

    const userMsg = { from: "me", text: text.trim(), ts: Date.now() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setTyping(true);

    // Tracking : créer le prospect au premier message en mode démo
    if (isDemoMode && userId && !demoProspectCreated.current) {
      createDemoProspect(userId);
    }

    // Mode famille-a : scraper l'URL si l'utilisateur en envoie une
    if (isFamilleAMode) {
      const urlMatch = text.trim().match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        supabase.functions.invoke('analyze-presence', {
          body: { url: urlMatch[0], user_id: userId },
        }).then(({ data: presData }) => {
          if (presData?.analyse) {
            setMsgs(m => [...m, {
              from: 'bot',
              text: `[ANALYSE SITE] ${presData.analyse}`,
              ts: Date.now(),
            }]);
          }
        }).catch(() => {});
      }
    }

    try {
      const history = newMsgs.filter((m, i) => !(i === 0 && m.from === "bot"));

      const chatMode = isDemoMode ? 'demo' : isFamilleAMode ? 'famille-a' : undefined;

      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          messages: history,
          assistant_id: a.id,
          ...(chatMode ? { mode: chatMode } : {}),
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
      // Détecter et stripper le marker [[PRÊTE]] (fin du diagnostic démo)
      let replyText = data.reply;
      if (isDemoMode && replyText.includes('[[PRÊTE]]')) {
        replyText = replyText.replace('[[PRÊTE]]', '').trim();
        setMaquetteReady(true);
      }
      setMsgs(m => [...m, { from: "bot", text: replyText, passive: isLocked }]);

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
    a.id === "coach"   ? ["Aide-moi à trouver ma cible", "Construis mon offre irrésistible", "Prépare mon argumentaire AIDA"] :
    a.id === "awa"     ? ["Rédige mon message de prospection", "Aide-moi à relancer un prospect", "Crée une séquence de closing"] :
    a.id === "miriam"  ? ["Rédige mon post Facebook de cette semaine", "Planifie 3 broadcasts WhatsApp", "Aide-moi à répondre à ma communauté"] :
    a.id === "serge"   ? ["Organise ma semaine", "Quelles sont mes priorités aujourd'hui ?", "J'ai des relances en retard"] :
    a.id === "kofi"    ? ["Construis ma campagne de lancement", "Écris mon film de marque", "Prépare ma séquence WhatsApp"] :
    a.id === "carelle" ? ["Fais le point sur mes projets", "Génère une maquette pour mon activité", "Priorise mes chantiers du mois"] :
    a.id === "maryline"? ["Montre-moi ce que l'app peut faire", "J'ai une question sur une fonctionnalité", "Par où commencer ?"] :
                         ["Mon prix est-il bon ?", "Aide-moi à calculer ma marge", "Je veux augmenter mes tarifs"];

  return (
    <div className="flex flex-col bg-sable overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200 sticky top-0 z-10">
        <button onClick={() => go("assistants")} className="w-10 h-10 rounded-full hover:bg-sable flex items-center justify-center text-charbon">
          <Icon name="back" size={20} />
        </button>
        {a.photo ? (
          <div className="w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-orange/30 flex-shrink-0">
            <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
          </div>
        ) : (
          <AssistGlyph accent={a.accent} icon={a.icon} size={42} />
        )}
        <div className="flex-1">
          <h3 className="font-display font-extrabold text-[16px] leading-tight">{a.id === "coach" ? nomAss : a.name}</h3>
          <div className={`text-[12px] font-semibold flex items-center gap-1 ${isLocked ? "text-amber" : isDemoMode ? "text-amber" : "text-growth"}`}>
            {isLocked ? "● Mode aperçu" : isDemoMode ? "● Mode Démo" : "● En ligne"} · {a.role}
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
      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2" style={{ scrollbarWidth: "none", background: '#EAE4D9' }}>
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
                <Bubble from={m.from} ts={m.ts}>
                  {renderText(m.text)}
                </Bubble>
              </div>
            )
        )}
        {typing && (
          <div className="self-start bg-white border border-g200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
            <TypingDots />
          </div>
        )}

        {/* Card résultat démo */}
        {isDemoMode && demoUrl && (
          <DemoResultCard
            url={demoUrl}
            onSousHerberge={() => { saveDemoUrl(demoUrl); go('mon-app'); }}
            onFamilleA={() => go('conversation', { assistant: 'carelle', mode: 'famille-a', prefill: "Je veux une application personnalisée avec mes propres couleurs et mon logo." })}
            onShowWA={() => setShowWAModal(true)}
          />
        )}
      </div>

      {/* Bouton flottant "Générer ma maquette" — [[PRÊTE]] en primaire, fallback après 5 msgs utilisateur */}
      {isDemoMode && (maquetteReady || (msgs.filter(m => m.from === 'me').length >= 5 && !typing)) && !demoUrl && (
        <div className="px-4 pb-2">
          <button
            onClick={generateDemoMaquette}
            disabled={demoGenerating}
            className="w-full py-3.5 rounded-[14px] font-display font-extrabold text-[14px] text-charbon flex items-center justify-center gap-2 active:scale-[.99] transition disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FFC107,#FFB300)', boxShadow: '0 8px 20px -6px rgba(255,193,7,.5)' }}
          >
            {demoGenerating
              ? <><span className="w-4 h-4 rounded-full border-2 border-charbon/30 border-t-charbon animate-spin" /> Carelle prépare ta maquette…</>
              : <><Icon name="spark" size={16} /> Générer ma maquette</>
            }
          </button>
        </div>
      )}

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

      {/* Input — style WhatsApp */}
      <div className="flex-shrink-0 px-3 py-2 flex items-end gap-2" style={{ background: '#f0f2f5', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex-1 bg-white rounded-[24px] flex items-center px-4" style={{ minHeight: 46, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Message..."
            className="flex-1 bg-transparent py-3 text-[15px] outline-none text-charbon placeholder-g400"
            style={{ fontWeight: 400, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          />
        </div>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="w-[46px] h-[46px] rounded-full bg-orange text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition"
          style={{ boxShadow: '0 2px 8px rgba(242,92,5,.4)' }}
        >
          <Icon name="send" size={20} />
        </button>
      </div>

      {/* Modal WhatsApp — rendu à la racine pour éviter le clipping dans overflow containers */}
      {showWAModal && (
        <WhatsAppModal
          onClose={() => setShowWAModal(false)}
          onCTA={() => { setShowWAModal(false); saveDemoUrl(demoUrl); go('mon-app'); }}
        />
      )}
    </div>
  );
}

