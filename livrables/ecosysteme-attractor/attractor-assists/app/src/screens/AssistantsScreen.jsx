import { useState, useEffect } from 'react';
import { MOCK } from '../data';
import { supabase } from '../lib/supabase';
import { Card, SectionLabel, Icon, AppHeader, Btn } from '../components/ui';

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

// ─── Teasers vivants (temps + données) ─────────────────────────────────────────

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
      "Planifie ta semaine éditoriale maintenant — c'est le meilleur moment.",
    ],
    afternoon: [
      "L'heure de pointe de scroll commence dans 2h. Ton post est prêt ?",
      "Un broadcast WhatsApp bien calibré en milieu d'après-midi, c'est maintenant.",
      "Qu'est-ce qu'on publie aujourd'hui ? Dis-moi ton actualité, je construis le post.",
    ],
    evening: [
      "Le soir, les gens scrollent le plus longtemps. Moment idéal pour un post émotionnel.",
      "Qu'est-ce qu'on célèbre cette semaine ? Je transforme ça en contenu qui fidélise.",
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
      "Lundi, c'est le jour de trier. Ta liste ? Je te sors les 3 vraies priorités.",
    ],
    afternoon: [
      "T'as combien de trucs en tête là ? Donne-les moi, je trie en 2 minutes.",
      "Audit rapide : qu'est-ce qui était prévu ce matin et n'a pas été fait ?",
    ],
    evening: [
      "Avant de fermer la journée : qu'est-ce qui traîne depuis hier ?",
      "Demain matin, tu veux commencer sur quoi ? Je te prépare le brief ce soir.",
    ],
    night: [
      "T'as des tâches en suspens. Je les classe, tu dors tranquille.",
    ],
    default: [
      "T'as des tâches qui traînent. Je sais comment trier ça sans te noyer.",
      "Dis-moi ce qui brûle. Je trie en ordre de priorité.",
    ],
  },
  roland: {
    morning: [
      "Début de semaine — c'est le bon moment de faire le point sur les marges.",
      "Tu sais combien tu as gagné la semaine dernière, net ? Je calcule ça.",
    ],
    afternoon: [
      "Tu vends à combien là ? Je te dis si tu es rentable — vrai chiffre.",
      "Mi-mois : projection de CA. Donne-moi tes ventes actuelles, je projette.",
    ],
    evening: [
      "Vendredi soir ? Bilan de semaine. Chiffres, marges, projection du mois.",
      "Avant de clore : tu veux savoir si tu es rentable cette semaine ?",
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
      "Tu veux lancer quelque chose ? Je construis la campagne avant que ta journée commence.",
    ],
    afternoon: [
      "L'après-midi, les gens lisent les histoires. Ton récit de marque est prêt ?",
      "Campagne complète en 3 phases : script, posts, WhatsApp. Par où on commence ?",
    ],
    evening: [
      "Le soir, les émotions priment. C'est le moment du contenu qui crée de la loyauté.",
      "Ta campagne de lancement — si tu la voulais pour cette semaine, on commence ce soir.",
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
      "Lundi coordination : dis-moi ce qui est ouvert, je priorise pour toi.",
    ],
    afternoon: [
      "Point mi-journée : qu'est-ce qui devait être fait ce matin et qui bloque ?",
      "Trop de fronts ouverts ? Dis-moi tout. Je trie et je synchronise l'équipe.",
    ],
    evening: [
      "Bilan du jour : qu'est-ce qu'on ferme ce soir et qu'est-ce qu'on reporte ?",
      "Brief de demain. Qu'est-ce qui est critique pour demain matin ?",
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
  // Override data-aware : Awa avec prospects en attente
  if (agentId === 'awa' && activity.pendingProspects > 0) {
    const n = activity.pendingProspects;
    return `Tu as ${n} prospect${n > 1 ? 's' : ''} en attente. Je peux préparer les relances maintenant.`;
  }
  // Journal récent pour cet agent
  const journalEntries = activity.journalByAgent?.[agentId] || [];
  if (journalEntries.length > 0) {
    return journalEntries[0].titre;
  }
  // Time-aware
  const slot = getSlot();
  const pool = TEASERS[agentId]?.[slot] || TEASERS[agentId]?.default || [];
  if (!pool.length) return null;
  // Stable dans la journée, change chaque jour
  const seed = new Date().getDate() + new Date().getMonth() * 31 + (agentId?.charCodeAt(0) || 0);
  return pool[seed % pool.length];
}

// ─── Badge logic ──────────────────────────────────────────────────────────────

function computeBadge(agentId, activity) {
  if (agentId === 'coach') return null;

  // Awa : nb prospects actifs
  if (agentId === 'awa' && activity.pendingProspects > 0) {
    return { type: 'count', value: activity.pendingProspects };
  }
  // Journal récent pour cet agent (il a agi)
  const journalEntries = activity.journalByAgent?.[agentId] || [];
  if (journalEntries.length > 0) {
    return { type: 'dot', color: 'growth' };
  }
  // Pas contacté depuis 3+ jours ou jamais → nudge orange
  const last = activity.lastContactByAgent?.[agentId];
  const d = daysSince(last);
  if (d === null || d >= 3) {
    return { type: 'dot', color: 'orange' };
  }
  return null;
}

// ─── Actions rapides par agent ────────────────────────────────────────────────

const QUICK_ACTIONS = {
  awa: [
    { label: "Écrire une relance", prefill: "Aide-moi à écrire une relance pour un prospect." },
    { label: "Closer un deal", prefill: "J'ai un prospect chaud. Aide-moi à le closer." },
  ],
  miriam: [
    { label: "Créer un post", prefill: "Crée-moi un post percutant pour aujourd'hui." },
    { label: "Planifier la semaine", prefill: "Planifie ma semaine éditoriale sur les réseaux." },
  ],
  serge: [
    { label: "Trier mes priorités", prefill: "J'ai plusieurs choses en tête. Aide-moi à trier mes priorités." },
    { label: "Brief du jour", prefill: "Prépare mon brief du jour et mes 3 priorités." },
  ],
  roland: [
    { label: "Suis-je rentable ?", prefill: "Aide-moi à vérifier si mon activité est rentable." },
    { label: "Projeter mon CA", prefill: "Aide-moi à projeter mon chiffre d'affaires du mois." },
  ],
  kofi: [
    { label: "Ma campagne", prefill: "Je veux lancer quelque chose. Construis ma campagne complète en 3 phases." },
    { label: "Mon récit de marque", prefill: "Construis ma signature narrative — le récit que les gens retiennent après m'avoir lu une seule fois." },
  ],
  carelle: [
    { label: "Point projets", prefill: "Fais-moi un point sur tous mes projets en cours." },
    { label: "Prioriser", prefill: "J'ai trop de fronts ouverts. Aide-moi à prioriser." },
  ],
};

// ─── Hook activité agents ─────────────────────────────────────────────────────

function useAgentActivity() {
  const [activity, setActivity] = useState({
    pendingProspects: 0,
    journalByAgent: {},
    lastContactByAgent: {},
  });

  useEffect(() => {
    // Last contact depuis localStorage (immédiat)
    const lastContactByAgent = {};
    MOCK.assistants.forEach(a => {
      const v = localStorage.getItem(`aa_last_contact_${a.id}`);
      if (v) lastContactByAgent[a.id] = v;
    });
    setActivity(prev => ({ ...prev, lastContactByAgent }));

    // Data Supabase
    const load = async () => {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 7);

        const [journalRes, prospectRes] = await Promise.all([
          supabase
            .from('journal_agent')
            .select('agent_id, type, titre, created_at')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('prospects')
            .select('id', { count: 'exact', head: true })
            .in('statut', ['nouveau', 'contacté', 'relancé']),
        ]);

        const journalByAgent = {};
        journalRes.data?.forEach(j => {
          if (!journalByAgent[j.agent_id]) journalByAgent[j.agent_id] = [];
          journalByAgent[j.agent_id].push(j);
        });

        setActivity(prev => ({
          ...prev,
          journalByAgent,
          pendingProspects: prospectRes.count || 0,
        }));
      } catch {
        // Graceful degradation : teasers time-aware fonctionnent sans data
      }
    };
    load();
  }, []);

  return activity;
}

// ─── Strip d'activité en haut ─────────────────────────────────────────────────

function ActivityStrip({ activity }) {
  const items = [];

  if (activity.pendingProspects > 0) {
    const n = activity.pendingProspects;
    items.push({
      label: 'Awa',
      text: `${n} prospect${n > 1 ? 's' : ''} en attente`,
      urgent: true,
    });
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
        <div key={i} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-[12px] border shadow-soft ${
          item.urgent ? 'bg-orange/5 border-orange/25' : 'bg-white border-g200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.urgent ? 'bg-orange animate-pulse' : 'bg-growth'}`} />
          <span className={`text-[11.5px] font-bold ${item.urgent ? 'text-orange' : 'text-charbon'}`}>{item.label}</span>
          <span className="text-[11px] text-g400">·</span>
          <span className="text-[11.5px] text-g400 max-w-[140px] truncate">{item.text}</span>
        </div>
      ))}
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
  return (
    <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${color} border-2 border-sable animate-pulse`} />
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function AssistantsScreen({ go, notify, profile }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const activity = useAgentActivity();

  const coach   = MOCK.assistants.find(a => a.id === 'coach');
  const actifs  = MOCK.assistants.filter(a => a.id !== 'coach' && a.status === 'actif');
  const verrous = MOCK.assistants.filter(a => a.id !== 'coach' && a.status === 'verrouillé');

  const handleTalk = (agentId, prefill) => {
    localStorage.setItem(`aa_last_contact_${agentId}`, new Date().toISOString());
    go('conversation', { assistant: agentId, ...(prefill ? { prefill } : {}) });
  };

  return (
    <div className="min-h-screen bg-sable pb-6">
      <AppHeader title="Mon équipe" sub="Chaque spécialiste à sa place." />

      <div className="flex flex-col gap-4">

        <ActivityStrip activity={activity} />

        <div className="px-[18px] flex flex-col gap-4">

          {/* Bras droit */}
          {coach && (
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
          )}

          {actifs.length > 0 && (
            <>
              <SectionLabel>Disponibles</SectionLabel>
              {actifs.map((a, i) => (
                <AgentCard key={a.id} a={a} activity={activity} animIndex={i + 1}
                  onBio={() => setSelectedAgent(a)}
                  onAction={(prefill) => handleTalk(a.id, prefill)} />
              ))}
            </>
          )}

          <SectionLabel className="mt-1">
            <span>Disponibles avec</span>
            <span className="ml-1 px-2 py-0.5 bg-orange/10 text-orange text-[11px] font-bold rounded-full">Manager</span>
          </SectionLabel>
          {verrous.map((a, i) => (
            <AgentCard key={a.id} a={a} activity={activity} locked animIndex={actifs.length + i + 2}
              onBio={() => setSelectedAgent(a)}
              onAction={() => setSelectedAgent(a)} />
          ))}

        </div>
      </div>

      {selectedAgent && (
        <AgentBioModal
          a={selectedAgent}
          activity={activity}
          onClose={() => setSelectedAgent(null)}
          onAction={(prefill) => {
            setSelectedAgent(null);
            if (selectedAgent.status === 'verrouillé') go('paliers');
            else handleTalk(selectedAgent.id, prefill);
          }}
        />
      )}
    </div>
  );
}

// ─── Carte agent ──────────────────────────────────────────────────────────────

function AgentCard({ a, locked, onAction, onBio, activity, animIndex = 0 }) {
  const teaser      = getLivingTeaser(a.id, activity);
  const badge       = locked ? null : computeBadge(a.id, activity);
  const quickActions = locked ? [] : (QUICK_ACTIONS[a.id] || []);

  return (
    <Card className="overflow-hidden"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${animIndex * 65}ms` }}>
      <div className="flex items-start gap-3.5 p-4">

        {/* Photo + badge */}
        <button onClick={onBio} className="flex-shrink-0 relative">
          <div className="w-[56px] h-[56px] rounded-[14px] overflow-hidden">
            {a.photo ? (
              <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[16px]">
                {a.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {locked ? (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-charbon border-2 border-sable flex items-center justify-center">
              <Icon name="lock" size={10} className="text-white" />
            </div>
          ) : (
            <AgentBadge badge={badge} />
          )}
        </button>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-display font-extrabold text-[15px] text-charbon">{a.name}</h4>
              <p className="text-[11.5px] text-g400 font-medium">{a.role}</p>
            </div>
            {locked ? (
              <span className="flex-shrink-0 text-[11px] font-bold text-amber bg-amber/10 px-2.5 py-1 rounded-full">Manager</span>
            ) : (
              <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-growth">
                <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
              </span>
            )}
          </div>

          {/* Teaser vivant */}
          {teaser && (
            <div className={`mt-2.5 rounded-[12px] px-3 py-2.5 ${locked ? 'bg-amber/8 border border-amber/15' : 'bg-orange/8 border border-orange/15'}`}>
              <p className={`text-[12.5px] leading-snug font-medium italic ${locked ? 'text-[#8a6200]' : 'text-[#a23c00]'}`}>
                "{teaser}"
              </p>
            </div>
          )}

          {/* Quick actions — agents actifs seulement */}
          {quickActions.length > 0 && (
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {quickActions.map((qa, i) => (
                <button key={i} onClick={() => onAction(qa.prefill)}
                  className="text-[11px] font-bold text-orange bg-orange/8 border border-orange/20 px-2.5 py-1.5 rounded-full active:scale-95 transition">
                  {qa.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className={`flex border-t ${locked ? 'border-g100' : 'border-orange/10'}`}>
        <button onClick={onBio}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-bold text-g400 hover:text-charbon transition">
          <Icon name="user" size={14} />
          Voir le profil
        </button>
        <div className="w-px bg-g100" />
        <button onClick={() => onAction()}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-bold transition ${
            locked ? 'text-amber hover:text-[#8a6200]' : 'text-orange hover:text-[#D94703]'
          }`}>
          <Icon name={locked ? 'lock' : 'send'} size={14} />
          {locked ? 'Débloquer' : 'Parler'}
        </button>
      </div>
    </Card>
  );
}

// ─── Modal bio ────────────────────────────────────────────────────────────────

function AgentBioModal({ a, activity, onClose, onAction }) {
  const teaser      = getLivingTeaser(a.id, activity);
  const badge       = a.status !== 'verrouillé' ? computeBadge(a.id, activity) : null;
  const quickActions = a.status !== 'verrouillé' ? (QUICK_ACTIONS[a.id] || []) : [];

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

          {/* Badge dans la photo */}
          {badge && (
            <div className="absolute top-4 left-4">
              {badge.type === 'count' ? (
                <span className="bg-orange text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow">
                  {badge.value} en attente
                </span>
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  badge.color === 'growth'
                    ? 'bg-growth/20 text-growth'
                    : 'bg-orange/20 text-orange'
                }`}>
                  {badge.color === 'growth' ? 'Action récente' : 'Disponible'}
                </span>
              )}
            </div>
          )}

          <div className="absolute bottom-4 left-5">
            <div className="text-[12px] font-bold text-white/70 uppercase tracking-wider">{a.role}</div>
            <h2 className="font-display font-extrabold text-[32px] text-white leading-tight">{a.name}</h2>
            {a.status !== 'verrouillé' && (
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

          {a.bio && (
            <p className="text-[14.5px] text-charbon leading-relaxed">{a.bio}</p>
          )}

          {/* Actions rapides dans la modal */}
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

          {a.status === 'verrouillé' && (
            <div className="bg-charbon rounded-[16px] p-4 flex items-start gap-3">
              <Icon name="lock" size={16} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-white">Disponible avec le plan Manager</p>
                <p className="text-[12px] text-white/60 mt-0.5">
                  29€/mois · <span className="line-through text-white/40">99€</span> · Promo fondateurs
                </p>
              </div>
            </div>
          )}

          <Btn className="w-full mt-1" iconRight={a.status === 'verrouillé' ? 'arrow' : 'send'}
            onClick={() => onAction()}>
            {a.status === 'verrouillé' ? `Débloquer ${a.name} — 29€/mois` : `Parler à ${a.name}`}
          </Btn>
        </div>
      </div>
    </div>
  );
}
