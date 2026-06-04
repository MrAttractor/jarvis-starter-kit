import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK } from '../data';
import { supabase } from '../lib/supabase';
import { resolveAgentStatus } from '../lib/agentGating';
import { Card, SectionLabel, Icon, AppHeader, Btn } from '../components/ui';

// Prix par agent verrouillé — FCFA en primaire
const AGENT_PLAN_INFO = {
  carelle: { planLabel: 'Growth',  fcfa: '9 900 FCFA',    eur: '15 €'  },
  miriam:  { planLabel: 'Growth',  fcfa: '9 900 FCFA',    eur: '15 €'  },
  awa:     { planLabel: 'Growth',  fcfa: '9 900 FCFA',    eur: '15 €'  },
  serge:   { planLabel: 'Team',    fcfa: '≈ 25 500 FCFA', eur: '39 €'  },
  roland:  { planLabel: 'Team',    fcfa: '≈ 25 500 FCFA', eur: '39 €'  },
  kofi:    { planLabel: 'Team',    fcfa: '≈ 25 500 FCFA', eur: '39 €'  },
};

// ─── Helpers temps ─────────────────────────────────────────────────────────────

function getSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso)) / 86400000);
}

// ─── Teasers vivants ────────────────────────────────────────────────────────────

const TEASERS = {
  awa: {
    morning: [
      "Le matin, les prospects lisent leurs messages. C'est maintenant qu'il faut écrire.",
      "3 messages envoyés avant 10h valent mieux qu'une journée de doutes.",
      "Nouveaux prospects ou relances du jour ? Je prépare les messages maintenant.",
    ],
    afternoon: [
      "Un prospect sans réponse depuis ce matin ? Je prépare ta relance.",
      "L'après-midi, c'est le moment de fermer les deals ouverts. On s'y met ?",
      "Ton pipeline de vente : où est-ce que ça coince ? Dis-moi, je débloque.",
    ],
    evening: [
      "Avant de fermer la journée : combien de prospects tu as laissés sans réponse ?",
      "Les décisions d'achat se prennent souvent le soir. Ton message est prêt ?",
      "Une relance envoyée ce soir peut changer demain. Je l'écris pour toi.",
    ],
    night: [
      "Tu travailles tard. Un message rédigé maintenant sera envoyé demain matin.",
      "Ton pipeline de demain se prépare ce soir. Dis-moi qui relancer.",
    ],
    default: [
      "Dis-moi à qui tu veux vendre. Je prépare le message qui ouvre les portes.",
      "Un prospect en attente, c'est de l'argent qui dort. Donne-moi son profil.",
    ],
  },
  miriam: {
    morning: [
      "Un post publié avant midi touche 40% de plus. J'ai des idées pour aujourd'hui.",
      "Ta communauté est réveillée. Qu'est-ce qu'on leur raconte ce matin ?",
    ],
    afternoon: [
      "L'heure de pointe de scroll commence dans 2h. Ton post est prêt ?",
      "Qu'est-ce qu'on publie aujourd'hui ? Dis-moi ton actualité, je construis le post.",
    ],
    evening: [
      "Le soir, les gens scrollent le plus longtemps. Moment idéal pour un post émotionnel.",
    ],
    night: [
      "Tu réfléchis à ta stratégie contenu ? Je planifie ta semaine, toi tu valides.",
    ],
    default: [
      "Ta présence en ligne mérite mieux que ce que tu fais seul. 20 minutes, je m'en occupe.",
      "Dis-moi ce que tu as vendu cette semaine. Je le transforme en contenu.",
    ],
  },
  serge: {
    morning: [
      "Nouvelle journée. Donne-moi ce qui est dans ta tête — je trie les vraies urgences.",
      "Brief du jour prêt dès que tu veux. Dis-moi tes chantiers en cours.",
    ],
    afternoon: [
      "T'as combien de trucs en tête là ? Donne-les moi, je trie en 2 minutes.",
    ],
    evening: [
      "Avant de fermer la journée : qu'est-ce qui traîne depuis hier ?",
    ],
    night: [
      "T'as des tâches en suspens. Je les classe, tu dors tranquille.",
    ],
    default: [
      "T'as des tâches qui traînent. Je sais comment trier ça sans te noyer.",
    ],
  },
  roland: {
    morning: [
      "Début de semaine — c'est le bon moment de faire le point sur les marges.",
    ],
    afternoon: [
      "Tu vends à combien là ? Je te dis si tu es rentable — vrai chiffre.",
    ],
    evening: [
      "Bilan de semaine. Chiffres, marges, projection du mois.",
    ],
    night: [
      "Les bonnes décisions financières se préparent au calme. Qu'est-ce qu'on analyse ?",
    ],
    default: [
      "Tu as une activité. Est-ce qu'elle est vraiment rentable ? Je réponds maintenant.",
      "Donne-moi 3 chiffres : tes ventes, tes charges, ton prix. Je fais le reste.",
    ],
  },
  kofi: {
    morning: [
      "Une histoire racontée le matin reste toute la journée. Ta narrative du jour ?",
    ],
    afternoon: [
      "Campagne complète en 3 phases : script, posts, WhatsApp. Par où on commence ?",
    ],
    evening: [
      "Le soir, les émotions priment. C'est le moment du contenu qui crée de la loyauté.",
    ],
    night: [
      "Mon grand-père disait : une vérité bien racontée vaut mieux que dix prouvées.",
    ],
    default: [
      "Dis-moi ton activité et ta cible. Je te sors le script de ta campagne.",
      "Je ne fais pas des posts — je construis des récits qui créent de la loyauté.",
    ],
  },
  carelle: {
    morning: [
      "Brief de la semaine : quels projets sont en cours et lequel brûle le plus ?",
    ],
    afternoon: [
      "Trop de fronts ouverts ? Dis-moi tout. Je trie et je synchronise l'équipe.",
    ],
    evening: [
      "Bilan du jour : qu'est-ce qu'on ferme ce soir et qu'est-ce qu'on reporte ?",
    ],
    night: [
      "Je vois tout, je coordonne tout. Dis-moi où tu en es.",
    ],
    default: [
      "Quand tu as trop de fronts ouverts, c'est moi qui remets de l'ordre.",
      "Je pilote ton portefeuille de projets en entier. Dis-moi ce qui tourne.",
    ],
  },
};

function getLivingTeaser(agentId, activity) {
  if (agentId === 'awa' && activity.pendingProspects > 0) {
    const n = activity.pendingProspects;
    return `Tu as ${n} prospect${n > 1 ? 's' : ''} en attente. Je peux préparer les relances maintenant.`;
  }
  const journalEntries = activity.journalByAgent?.[agentId] || [];
  if (journalEntries.length > 0) return journalEntries[0].titre;
  const slot = getSlot();
  const pool = TEASERS[agentId]?.[slot] || TEASERS[agentId]?.default || [];
  if (!pool.length) return null;
  const seed = new Date().getDate() + new Date().getMonth() * 31 + (agentId?.charCodeAt(0) || 0);
  return pool[seed % pool.length];
}

function computeBadge(agentId, activity) {
  if (agentId === 'coach') return null;
  if (agentId === 'awa' && activity.pendingProspects > 0) return { type: 'count', value: activity.pendingProspects };
  const journalEntries = activity.journalByAgent?.[agentId] || [];
  if (journalEntries.length > 0) return { type: 'dot', color: 'growth' };
  const last = activity.lastContactByAgent?.[agentId];
  const d = daysSince(last);
  if (d === null || d >= 3) return { type: 'dot', color: 'orange' };
  return null;
}

const QUICK_ACTIONS = {
  awa:    [{ label: "Écrire une relance", prefill: "Aide-moi à écrire une relance pour un prospect." }, { label: "Closer un deal", prefill: "J'ai un prospect chaud. Aide-moi à le closer." }],
  miriam: [{ label: "Créer un post", prefill: "Crée-moi un post percutant pour aujourd'hui." }, { label: "Planifier la semaine", prefill: "Planifie ma semaine éditoriale sur les réseaux." }],
  serge:  [{ label: "Trier mes priorités", prefill: "J'ai plusieurs choses en tête. Aide-moi à trier mes priorités." }, { label: "Brief du jour", prefill: "Prépare mon brief du jour et mes 3 priorités." }],
  roland: [{ label: "Suis-je rentable ?", prefill: "Aide-moi à vérifier si mon activité est rentable." }, { label: "Projeter mon CA", prefill: "Aide-moi à projeter mon chiffre d'affaires du mois." }],
  kofi:   [{ label: "Ma campagne", prefill: "Je veux lancer quelque chose. Construis ma campagne complète en 3 phases." }, { label: "Mon récit de marque", prefill: "Construis ma signature narrative." }],
  carelle:[{ label: "Point projets", prefill: "Fais-moi un point sur tous mes projets en cours." }, { label: "Prioriser", prefill: "J'ai trop de fronts ouverts. Aide-moi à prioriser." }],
};

// ─── Hook activité agents ─────────────────────────────────────────────────────

function useAgentActivity() {
  const [activity, setActivity] = useState({ pendingProspects: 0, journalByAgent: {}, lastContactByAgent: {} });

  useEffect(() => {
    const lastContactByAgent = {};
    MOCK.assistants.forEach(a => {
      const v = localStorage.getItem(`aa_last_contact_${a.id}`);
      if (v) lastContactByAgent[a.id] = v;
    });
    setActivity(prev => ({ ...prev, lastContactByAgent }));

    const load = async () => {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const [journalRes, prospectRes] = await Promise.all([
          supabase.from('journal_agent').select('agent_id, type, titre, created_at').gte('created_at', since.toISOString()).order('created_at', { ascending: false }).limit(20),
          supabase.from('prospects').select('id', { count: 'exact', head: true }).in('statut', ['nouveau', 'contacté', 'relancé']),
        ]);
        const journalByAgent = {};
        journalRes.data?.forEach(j => {
          if (!journalByAgent[j.agent_id]) journalByAgent[j.agent_id] = [];
          journalByAgent[j.agent_id].push(j);
        });
        setActivity(prev => ({ ...prev, journalByAgent, pendingProspects: prospectRes.count || 0 }));
      } catch { /* graceful degradation */ }
    };
    load();
  }, []);

  return activity;
}

// ─── Strip d'activité ─────────────────────────────────────────────────────────

function ActivityStrip({ activity }) {
  const items = [];
  if (activity.pendingProspects > 0) {
    const n = activity.pendingProspects;
    items.push({ label: 'Awa', text: `${n} prospect${n > 1 ? 's' : ''} en attente`, urgent: true });
  }
  Object.entries(activity.journalByAgent || {}).forEach(([agentId, entries]) => {
    if (entries.length > 0) {
      const name = MOCK.assistants.find(a => a.id === agentId)?.name || agentId;
      items.push({ label: name, text: entries[0].titre, urgent: false });
    }
  });
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto flex gap-2 px-[18px] pb-1" style={{ scrollbarWidth: 'none' }}>
      {items.map((item, i) => (
        <div key={i} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-[12px] border shadow-soft ${item.urgent ? 'bg-orange/5 border-orange/25' : 'bg-white border-g200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.urgent ? 'bg-orange animate-pulse' : 'bg-growth'}`} />
          <span className={`text-[11.5px] font-bold ${item.urgent ? 'text-orange' : 'text-charbon'}`}>{item.label}</span>
          <span className="text-[11px] text-g400">·</span>
          <span className="text-[11.5px] text-g400 max-w-[140px] truncate">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function TeamHero({ agents, onAvatarClick }) {
  const specialists = agents.filter(a => a.id !== 'coach' && a.id !== 'maryline');
  const activeCount = specialists.filter(a => a.status === 'actif').length;

  return (
    <div className="relative overflow-hidden bg-charbon px-[18px] pt-6 pb-8">
      {/* Glow orange bas-droite */}
      <div
        className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(242,92,5,0.35) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }}
      />

      {/* Pill statut */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2 h-2 rounded-full bg-growth animate-pulse" />
        <span className="text-[11.5px] font-bold text-growth uppercase tracking-[.1em]">{activeCount} spécialistes en ligne</span>
      </div>

      {/* Titre */}
      <h2 className="font-display font-extrabold text-[30px] leading-none text-white mb-1">Ton équipe.</h2>
      <p className="text-[14px] text-white/60 mb-5">Chaque expert à sa place. Disponible 24h/24.</p>

      {/* Avatars circulaires scrollables */}
      <div className="overflow-x-auto flex gap-3 pb-1" style={{ scrollbarWidth: 'none' }}>
        {specialists.map(a => (
          <button key={a.id} onClick={() => onAvatarClick(a)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition">
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${a.status === 'verrouille' ? 'border-amber/50 opacity-60' : a.status === 'demo' ? 'border-amber/70' : 'border-orange/70'}`}>
              {a.photo ? (
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-orange flex items-center justify-center font-display font-extrabold text-white text-[14px]">
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {a.status === 'verrouille' && (
                <div className="absolute inset-0 flex items-center justify-center bg-charbon/50">
                  <Icon name="lock" size={10} className="text-amber" />
                </div>
              )}
              {a.status === 'demo' && (
                <div className="absolute inset-0 flex items-center justify-center bg-amber/20">
                  <Icon name="spark" size={10} className="text-amber" />
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-white/70">{a.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Slide agent ──────────────────────────────────────────────────────────────

function AgentSlide({ a, activity, onTalk, onUnlock, onBio, width }) {
  const teaser    = getLivingTeaser(a.id, activity);
  const locked    = a.status === 'verrouille';
  const isDemo    = a.status === 'demo';
  const badge     = !locked ? computeBadge(a.id, activity) : null;
  const actions   = !locked && !isDemo ? (QUICK_ACTIONS[a.id] || []) : [];

  return (
    <div style={{ width, flexShrink: 0, scrollSnapAlign: 'start' }} className="px-[18px]">
      <div className="relative rounded-[24px] overflow-hidden" style={{ minHeight: 400 }}>

        {/* Photo background */}
        {a.photo ? (
          <img src={a.photo} alt={a.name} className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 bg-orange flex items-center justify-center">
            <span className="text-white font-display font-extrabold text-[80px] opacity-30">{a.name.slice(0, 1)}</span>
          </div>
        )}

        {/* Gradient overlay bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-charbon via-charbon/60 to-transparent" />

        {/* Overlay amber si verrouillé */}
        {locked && <div className="absolute inset-0 bg-charbon/40" />}

        {/* Badge haut gauche */}
        <div className="absolute top-4 left-4">
          {locked ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charbon/70 backdrop-blur-sm border border-amber/30 text-amber text-[11px] font-bold">
              <Icon name="lock" size={10} /> Plan {AGENT_PLAN_INFO[a.id]?.planLabel || 'Team'}
            </span>
          ) : isDemo ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/20 backdrop-blur-sm border border-amber/50 text-amber text-[11px] font-bold">
              <Icon name="spark" size={10} /> Essai gratuit
            </span>
          ) : badge?.type === 'count' ? (
            <span className="px-3 py-1.5 rounded-full bg-orange text-white text-[11px] font-extrabold shadow">
              {badge.value} en attente
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charbon/70 backdrop-blur-sm border border-growth/30 text-growth text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" /> En ligne
            </span>
          )}
        </div>

        {/* Contenu bas */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Rôle + Nom */}
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-[.12em] mb-1">{a.role}</p>
          <h3 className="font-display font-extrabold text-[30px] leading-none text-white mb-3">{a.name}</h3>

          {/* Teaser ou proactif */}
          {(teaser || a.proactif) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-[14px] px-4 py-3 mb-3 border border-white/15">
              <p className="text-[12.5px] text-white/90 leading-snug italic">
                "{teaser || a.proactif?.slice(0, 100)}{(!teaser && a.proactif?.length > 100) ? '…' : ''}"
              </p>
            </div>
          )}

          {/* Quick actions */}
          {actions.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {actions.map((qa, i) => (
                <button key={i} onClick={() => onTalk(qa.prefill)}
                  className="text-[11.5px] font-bold text-white bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 rounded-full active:scale-95 transition">
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* CTA principal */}
          {locked ? (
            <button onClick={onUnlock}
              className="w-full py-3.5 rounded-[14px] bg-amber text-charbon font-display font-extrabold text-[14px] active:scale-[.99] transition flex items-center justify-center gap-2">
              <Icon name="bolt" size={15} />
              Voir la formule
            </button>
          ) : isDemo ? (
            <button onClick={() => onTalk("Je veux voir une démo d'application pour mon activité.", 'demo')}
              className="w-full py-3.5 rounded-[14px] text-charbon font-display font-extrabold text-[14px] active:scale-[.99] transition flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#FFC107,#FFB300)', boxShadow: '0 8px 20px -6px rgba(255,193,7,.5)' }}>
              <Icon name="spark" size={15} />
              Voir mon app personnalisée
            </button>
          ) : (
            <button onClick={() => onTalk()}
              className="w-full py-3.5 rounded-[14px] bg-orange text-white font-display font-extrabold text-[14px] active:scale-[.99] transition flex items-center justify-center gap-2"
              style={{ boxShadow: '0 8px 20px -6px rgba(242,92,5,.6)' }}>
              <Icon name="send" size={15} />
              Parler à {a.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Carousel agents ──────────────────────────────────────────────────────────

function AgentCarousel({ agents, activity, onTalk, onUnlock, onBio }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setSlideWidth(containerRef.current.offsetWidth);
    }
    const observer = new ResizeObserver(entries => {
      setSlideWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((idx) => {
    if (!scrollRef.current || !slideWidth) return;
    scrollRef.current.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
    setActiveIdx(idx);
  }, [slideWidth]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !slideWidth) return;
    const idx = Math.round(scrollRef.current.scrollLeft / slideWidth);
    setActiveIdx(idx);
  }, [slideWidth]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Slides */}
      <div
        id="carousel-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {agents.map((a, i) => (
          <AgentSlide
            key={a.id}
            a={a}
            activity={activity}
            width={slideWidth || '100%'}
            onTalk={(prefill, mode) => {
              localStorage.setItem(`aa_last_contact_${a.id}`, new Date().toISOString());
              onTalk(a.id, prefill, mode);
            }}
            onUnlock={() => onUnlock(a)}
            onBio={() => onBio(a)}
          />
        ))}
      </div>

      {/* Dots + navigation */}
      <div className="flex items-center justify-center gap-3 mt-4 px-[18px]">
        <button
          onClick={() => goTo(Math.max(0, activeIdx - 1))}
          className="w-8 h-8 rounded-full bg-white border border-g200 shadow-soft flex items-center justify-center active:scale-95 transition disabled:opacity-30"
          disabled={activeIdx === 0}
        >
          <Icon name="chevron" size={14} className="text-charbon rotate-180" />
        </button>

        <div className="flex items-center gap-1.5">
          {agents.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${i === activeIdx ? 'w-6 h-2.5 bg-orange' : 'w-2.5 h-2.5 bg-g200'}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(Math.min(agents.length - 1, activeIdx + 1))}
          className="w-8 h-8 rounded-full bg-white border border-g200 shadow-soft flex items-center justify-center active:scale-95 transition disabled:opacity-30"
          disabled={activeIdx === agents.length - 1}
        >
          <Icon name="chevron" size={14} className="text-charbon" />
        </button>
      </div>

      {/* Nom de l'agent actif */}
      <p className="text-center text-[12px] text-g400 mt-2 font-medium">
        {agents[activeIdx]?.name} · {agents[activeIdx]?.role}
      </p>
    </div>
  );
}

// ─── Badge visuel ─────────────────────────────────────────────────────────────

function AgentBadge({ badge }) {
  if (!badge) return null;
  if (badge.type === 'count') {
    return (
      <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-orange border-2 border-sable flex items-center justify-center">
        <span className="text-[10px] font-extrabold text-white leading-none">{badge.value > 9 ? '9+' : badge.value}</span>
      </div>
    );
  }
  const color = badge.color === 'growth' ? 'bg-growth' : 'bg-orange';
  return <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${color} border-2 border-sable animate-pulse`} />;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function AssistantsScreen({ go, notify, profile }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const activity = useAgentActivity();

  const planCode   = profile?.plan_code || 'gratuit';
  const resolvedAssistants = MOCK.assistants.map(a => ({
    ...a,
    status: resolveAgentStatus(a.id, planCode),
  }));

  const coach          = resolvedAssistants.find(a => a.id === 'coach');
  const carelle        = resolvedAssistants.find(a => a.id === 'carelle');
  const specialists    = resolvedAssistants.filter(a => a.id !== 'coach' && a.id !== 'maryline');
  // Carousel : tous sauf coach, maryline et carelle (carelle est sur l'Accueil)
  const carouselAgents = resolvedAssistants.filter(a => !['coach', 'maryline', 'carelle'].includes(a.id));

  const handleTalk = (agentId, prefill, mode) => {
    localStorage.setItem(`aa_last_contact_${agentId}`, new Date().toISOString());
    go('conversation', {
      assistant: agentId,
      ...(prefill ? { prefill } : {}),
      ...(mode    ? { mode }   : {}),
    });
  };

  const scrollToCarousel = () => {
    document.getElementById('team-carousel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-sable pb-6">

      {/* Hero + avatars */}
      <TeamHero
        agents={resolvedAssistants}
        onAvatarClick={(a) => {
          scrollToCarousel();
          // scroll carousel to this agent's slide
          const idx = specialists.findIndex(s => s.id === a.id);
          if (idx >= 0) {
            setTimeout(() => {
              const el = document.getElementById('carousel-scroll');
              const w = el?.offsetWidth;
              if (el && w) el.scrollTo({ left: idx * w, behavior: 'smooth' });
            }, 300);
          }
        }}
      />

      <div className="flex flex-col gap-5 pt-5">

        {/* ActivityStrip */}
        <ActivityStrip activity={activity} />

        {/* Bras droit épinglé */}
        {coach && (
          <div className="px-[18px]">
            <SectionLabel className="mb-3">Ton bras droit</SectionLabel>
            <button onClick={() => handleTalk('coach')}
              className="w-full flex items-center gap-4 p-4 bg-charbon text-white rounded-[20px] shadow-[0_10px_28px_-10px_rgba(26,23,20,.5)] active:scale-[.99] transition text-left">
              <div className="w-14 h-14 rounded-xl bg-orange flex items-center justify-center font-display font-extrabold text-[18px] flex-shrink-0 shadow-[0_6px_16px_-4px_rgba(242,92,5,.6)]">
                {(profile?.nom_assistant || 'AA').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-[16px]">{profile?.nom_assistant || 'Ton bras droit'}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-growth">
                    <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
                  </span>
                </div>
                <p className="text-[12.5px] text-white/60 mt-0.5 truncate">
                  {profile?.ouverture
                    ? `"${profile.ouverture.slice(0, 50)}${profile.ouverture.length > 50 ? '…' : ''}"`
                    : 'Ton point de contact principal — disponible maintenant.'}
                </p>
              </div>
              <Icon name="send" size={18} className="text-orange flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Carousel des spécialistes (Carelle est sur l'Accueil) */}
        <div id="team-carousel">
          <div className="px-[18px] mb-3">
            <SectionLabel>
              <span>Ton équipe de spécialistes</span>
              <span className="ml-2 px-2 py-0.5 bg-orange/10 text-orange text-[10.5px] font-bold rounded-full">{carouselAgents.length} experts</span>
            </SectionLabel>
            <p className="text-[12px] text-g400 mt-1">Swipe pour découvrir chaque spécialiste.</p>
          </div>

          <AgentCarousel
            agents={carouselAgents}
            activity={activity}
            onTalk={handleTalk}
            onUnlock={(a) => { setSelectedAgent(a); }}
            onBio={(a) => setSelectedAgent(a)}
          />
        </div>

      </div>

      {/* Modal bio */}
      {selectedAgent && (
        <AgentBioModal
          a={selectedAgent}
          activity={activity}
          onClose={() => setSelectedAgent(null)}
          onAction={(prefill, mode) => {
            setSelectedAgent(null);
            if (selectedAgent.status === 'verrouille') go('paliers');
            else handleTalk(selectedAgent.id, prefill, mode);
          }}
        />
      )}
    </div>
  );
}

// ─── Modal bio (inchangée) ────────────────────────────────────────────────────

function AgentBioModal({ a, activity, onClose, onAction }) {
  const teaser      = getLivingTeaser(a.id, activity);
  const locked      = a.status === 'verrouille';
  const isDemo      = a.status === 'demo';
  const badge       = !locked ? computeBadge(a.id, activity) : null;
  const quickActions = (!locked && !isDemo) ? (QUICK_ACTIONS[a.id] || []) : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-charbon/60 backdrop-blur-sm"
        style={{ animation: 'fade 0.25s ease both' }}
        onClick={onClose} />

      <div className="relative bg-white rounded-t-[28px] max-h-[92vh] flex flex-col"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>

        <div className="relative h-[200px] flex-shrink-0 overflow-hidden rounded-t-[28px]">
          {a.photo ? (
            <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full bg-orange flex items-center justify-center">
              <span className="text-white font-display font-extrabold text-[64px]">{a.name.slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charbon/85 via-charbon/20 to-transparent" />

          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <Icon name="close" size={18} />
          </button>

          {badge && (
            <div className="absolute top-4 left-4">
              {badge.type === 'count' ? (
                <span className="bg-orange text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow">{badge.value} en attente</span>
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.color === 'growth' ? 'bg-growth/20 text-growth' : 'bg-orange/20 text-orange'}`}>
                  {badge.color === 'growth' ? 'Action récente' : 'Disponible'}
                </span>
              )}
            </div>
          )}

          <div className="absolute bottom-4 left-5">
            <div className="text-[12px] font-bold text-white/70 uppercase tracking-wider">{a.role}</div>
            <h2 className="font-display font-extrabold text-[32px] text-white leading-tight">{a.name}</h2>
            {a.status !== 'verrouille' && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-growth mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 pb-24 flex flex-col gap-4"
          style={{ WebkitOverflowScrolling: 'touch' }}>

          {teaser && (
            <div className="bg-sable rounded-[16px] p-4 border border-g200">
              <p className="text-[11.5px] font-bold text-g400 uppercase tracking-wider mb-2">
                {a.genre === 'f' ? "Ce qu'elle ferait pour toi là" : "Ce qu'il ferait pour toi là"}
              </p>
              <p className="text-[14.5px] text-charbon leading-relaxed italic">"{teaser}"</p>
            </div>
          )}

          {a.proactif && (
            <div>
              <p className="text-[11.5px] font-bold text-g400 uppercase tracking-wider mb-2">Ce que je fais pour toi</p>
              <p className="text-[14px] text-charbon leading-relaxed">{a.proactif}</p>
            </div>
          )}

          {a.bio && (
            <p className="text-[14.5px] text-charbon leading-relaxed">{a.bio}</p>
          )}

          {quickActions.length > 0 && (
            <div>
              <p className="text-[11.5px] font-bold text-g400 uppercase tracking-wider mb-3">Actions rapides</p>
              <div className="flex flex-col gap-2">
                {quickActions.map((qa, i) => (
                  <button key={i} onClick={() => onAction(qa.prefill)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-orange/5 border border-orange/20 rounded-[14px] active:scale-[.99] transition text-left">
                    <span className="text-[14px] font-bold text-orange">{qa.label}</span>
                    <Icon name="arrow" size={14} className="text-orange" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {locked && (
            <div className="bg-charbon rounded-[16px] p-4 flex items-start gap-3">
              <Icon name="lock" size={16} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-white">Dispo dans le plan {AGENT_PLAN_INFO[a.id]?.planLabel || 'Team'}</p>
                <p className="text-[12px] text-white/60 mt-0.5">Découvre la formule pour débloquer {a.name}.</p>
              </div>
            </div>
          )}

          {isDemo && (
            <div className="bg-amber/10 border border-amber/30 rounded-[16px] p-4 flex items-start gap-3">
              <Icon name="spark" size={16} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-charbon">Démo gratuite disponible</p>
                <p className="text-[12px] text-g500 mt-0.5">Carelle génère une maquette personnalisée pour ton activité. Gratuit, sans engagement.</p>
              </div>
            </div>
          )}

          <Btn
            className="w-full mt-1"
            iconRight={locked ? 'arrow' : 'send'}
            onClick={() => onAction(isDemo ? "Je veux voir une démo d'application pour mon activité." : undefined, isDemo ? 'demo' : undefined)}>
            {locked ? 'Voir la formule' : isDemo ? 'Voir mon app personnalisée' : `Parler à ${a.name}`}
          </Btn>
        </div>
      </div>
    </div>
  );
}
