import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { resolveAgentStatus } from '../lib/agentGating';
import { Icon, Pill, Card, Btn, SectionLabel, Progress, AssistGlyph, Sheet } from '../components/ui';

const PLAN_MSG_LIMIT = { decouverte: 20, decouverte_eu: 20, gratuit: 20, growth: 100, growth_eu: 100 };

const TIPS = [
  { icon: "spark",  agent: null,     titre: "Commence toujours par \"Je veux que tu...\"",         corps: "C'est la formule magique. Dis exactement ce que tu attends, l'assistant produit sans poser 10 questions.",          action: null },
  { icon: "trend",  agent: "coach",  titre: "Dis à Mr Attractor qui tu veux convaincre",            corps: "Donne-lui un nom, un secteur et un contexte. Il te sort le message de prospection en 30 secondes. Tape sur le bouton vert pour l'envoyer directement sur WhatsApp.", action: "Parler à Mr Attractor" },
  { icon: "send",   agent: null,     titre: "Le bouton vert, c'est ta nouvelle arme",               corps: "Chaque réponse de l'équipe a un bouton vert en dessous. 1 tap = WhatsApp s'ouvre avec le message prêt. Tu choisis juste à qui l'envoyer.", action: null },
  { icon: "user",   agent: "coach",  titre: "Ton bras droit retient tout",                          corps: "Dis-lui ta situation une fois. Il construit sa mémoire de toi au fil des échanges. Plus tu parles, plus il te connaît et mieux il t'aide.", action: null },
  { icon: "coins",  agent: "roland", titre: "Tu sais vraiment combien tu gagnes ?",                 corps: "Roland peut calculer ta marge réelle en 2 minutes. Donne-lui ton prix de vente, ton coût et ton volume. Il te dit si tu es rentable — vrai chiffre.", action: "Parler à Roland" },
  { icon: "chat",   agent: "miriam", titre: "Miriam planifie ta semaine de contenu",                corps: "Dis-lui ton activité et ta cible. Elle te propose 3 posts pour la semaine, aux bons horaires pour ta zone. Tu valides, elle rédige.",          action: "Parler à Miriam" },
  { icon: "flag",   agent: "serge",  titre: "Vide ta tête en 2 minutes",                           corps: "Liste tout ce qui tourne dans ta tête à Serge — tâches, RDV, relances. Il trie par priorité et organise ta semaine. Tu restes concentré sur l'essentiel.", action: "Parler à Serge" },
  { icon: "bolt",   agent: null,     titre: "Invite 1 ami, gagne 5 messages de plus par jour",     corps: "Ton lien de parrainage est dans Profil. Chaque inscription via ton lien = +5 messages quotidiens pour toi, pour toujours.",                  action: "Voir le parrainage" },
  { icon: "target", agent: null,     titre: "PPSD : connais ta cible mieux qu'elle se connaît",    corps: "Problèmes, Peurs, Souhaits, Désirs. Quand l'équipe connaît ton PPSD, chaque message devient précis. Complète-le dans ton profil.",            action: null },
  { icon: "mega",   agent: "kofi",   titre: "Kofi construit ta campagne de A à Z",                 corps: "Film de marque, 7 posts séquencés, 3 broadcasts WhatsApp — tout calibré sur ton histoire et ta cible. Dis-lui ton activité et il commence.", action: "Parler à Kofi" },
  { icon: "check",  agent: null,     titre: "L'agenda, c'est ta colonne vertébrale",               corps: "Ajoute tes tâches du jour dans l'Agenda. Classe-les par priorité. Quand tu ouvres l'app, tu sais exactement par quoi commencer.",            action: null },
  { icon: "heart",  agent: null,     titre: "Nomme ton bras droit",                                corps: "Un assistant sans nom, c'est un outil. Un assistant avec un nom, c'est un partenaire. Va dans Profil et donne-lui un vrai nom.",               action: null },
];

function TipCard({ nomAss, go }) {
  const startIdx = useMemo(() => Math.floor(Date.now() / 86400000) % TIPS.length, []);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setOffset(o => (o + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  const idx = (startIdx + offset) % TIPS.length;
  const tip = TIPS[idx];
  const actionMap = {
    "Parler à Mr Attractor": () => go("conversation", { assistant: "coach" }),
    "Parler à Roland":       () => go("conversation", { assistant: "roland" }),
    "Parler à Miriam":       () => go("conversation", { assistant: "miriam" }),
    "Parler à Serge":        () => go("conversation", { assistant: "serge" }),
    "Parler à Kofi":         () => go("conversation", { assistant: "kofi" }),
    "Voir le parrainage":    () => go("profil"),
  };
  return (
    <div className="rounded-[20px] overflow-hidden border border-orange/20" style={{ background: "linear-gradient(135deg,#fff9f5,#fff3ec)" }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange/12 flex items-center justify-center flex-shrink-0">
              <Icon name={tip.icon} size={15} className="text-orange" />
            </div>
            <span className="text-[10.5px] font-bold text-orange uppercase tracking-[.1em]">Astuce du jour</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setOffset(i)}
                className={`rounded-full transition-all ${i === offset ? 'w-4 h-2 bg-orange' : 'w-2 h-2 bg-orange/30'}`}
              />
            ))}
          </div>
        </div>
        <h4 className="font-display font-extrabold text-[15px] text-charbon leading-snug">{tip.titre}</h4>
        <p className="text-[13px] text-g500 mt-1.5 leading-relaxed">{tip.corps}</p>
      </div>
      {tip.action && actionMap[tip.action] && (
        <button onClick={actionMap[tip.action]}
          className="w-full flex items-center justify-between px-4 py-3 border-t border-orange/15 bg-orange/5 active:bg-orange/10 transition">
          <span className="text-[13px] font-bold text-orange">{tip.action}</span>
          <Icon name="arrow" size={15} className="text-orange" />
        </button>
      )}
    </div>
  );
}

const CAPACITY_MSG = {
  miriam: (a, n) => `Pour toi, je peux rédiger tes posts de la semaine${a ? ' sur ' + a : ''}, répondre à ta communauté et envoyer tes broadcasts. ${n ? n + ' s\'en occupe' : 'Je m\'en occupe'} — tu n'as qu'à valider.`,
  serge:  (a, n) => `Pour toi, je peux organiser ta semaine${a ? ' autour de ' + a : ''} — tes priorités, tes relances en retard, tes actions urgentes. ${n ? n + ' te prépare' : 'Je te prépare'} un récap clair chaque matin.`,
  roland: (a, n) => `Pour toi, je peux calculer si ton prix actuel${a ? ' pour ' + a : ''} est juste et te dire combien tu devrais vraiment facturer pour être rentable. En 5 minutes.`,
};

export function DashboardScreen({ go, notify, profile }) {
  const [gamif, setGamif]             = useState(null);
  const [usedToday, setUsedToday]     = useState(0);
  const [ppsdDone, setPpsdDone]       = useState(false);
  const [lockedSheet, setLockedSheet] = useState(null);
  const [userCount, setUserCount]     = useState(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [carnetCount, setCarnetCount] = useState(0);
  const [staleCount, setStaleCount]   = useState(0);

  const first    = profile?.prenom        || '';
  const nomAss   = profile?.nom_assistant || 'Attractor';
  const activite = profile?.activite      || '';
  const planCode = profile?.plan_code     || 'decouverte';
  const initials = first ? first.slice(0, 2).toUpperCase() : 'AA';

  const referralBonus = (profile?.referral_count || 0) * 5;
  const msgLimit  = PLAN_MSG_LIMIT[planCode] != null ? PLAN_MSG_LIMIT[planCode] + referralBonus : null;
  const remaining = msgLimit !== null ? Math.max(0, msgLimit - usedToday) : null;
  const streak    = gamif?.streak  ?? 0;
  const niveau    = gamif?.niveau  ?? 1;

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const today = new Date().toISOString().slice(0, 10);
        const [gamifRes, usageRes, ppsdRes, countRes, notifsRes, carnetRes] = await Promise.all([
          supabase.from('gamification').select('streak,niveau,xp').eq('user_id', user.id).maybeSingle(),
          supabase.from('usage_daily').select('nb_messages').eq('user_id', user.id).eq('jour', today).maybeSingle(),
          supabase.from('ppsd').select('user_id').eq('user_id', user.id).maybeSingle(),
          supabase.rpc('get_user_count'),
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('lu', false),
          supabase.from('carnet_affaires').select('id,statut,type,derniere_interaction').eq('user_id', user.id),
        ]);
        if (gamifRes.data) setGamif(gamifRes.data);
        if (usageRes.data) setUsedToday(usageRes.data.nb_messages);
        if (ppsdRes.data)  setPpsdDone(true);
        if (countRes.data) setUserCount(countRes.data);
        setUnreadNotifs(notifsRes.count || 0);
        if (carnetRes.data) {
          setCarnetCount(carnetRes.data.length);
          const cutoff = Date.now() - 14 * 86400000;
          setStaleCount(carnetRes.data.filter(e =>
            e.type === 'client' && e.statut === 'actif' &&
            new Date(e.derniere_interaction).getTime() < cutoff
          ).length);
        }
      } catch {}
    };
    load();
  }, []);

  const milestones = [
    { id: 1, label: 'Installé',        state: 'done' },
    { id: 2, label: '1re session',     state: 'done' },
    { id: 3, label: 'En rythme',       state: streak >= 3 ? 'done' : 'now' },
    { id: 4, label: 'Pilotage auto',   state: streak >= 7 ? 'done' : 'todo' },
  ];
  const progPct = (milestones.filter(m => m.state === 'done').length / milestones.length) * 100;

  const resolvedAssistants = MOCK.assistants.map(a => ({
    ...a,
    status: resolveAgentStatus(a.id, planCode),
  }));

  const handleAssistant = (a) => {
    if (a.status === 'actif')    { go('conversation', { assistant: a.id }); return; }
    if (a.status === 'demo')     { go('conversation', { assistant: a.id, mode: 'demo', prefill: "Je veux voir une démo d'application pour mon activité." }); return; }
    const msgFn = CAPACITY_MSG[a.id];
    if (msgFn) setLockedSheet({ assistant: a, msg: msgFn(activite, nomAss) });
    else go('paliers');
  };

  // Salutation selon l'heure
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonne après-midi' : hour < 22 ? 'Bonne soirée' : 'Bonne nuit';
  const dayLabel = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];

  return (
    <div className="min-h-screen bg-sable pb-2">

      {/* ── Hero immersif ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-b-[32px]" style={{ minHeight: 260 }}>

        {/* Image de fond (texture humaine, apaisante) */}
        <img
          src="/uploads/photo-paliers.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.18 }}
        />

        {/* Dégradé principal : orange chaud en haut → charbon profond en bas */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(165deg, #FF7A2E 0%, #F25C05 30%, #c94e04 55%, #1A1714 100%)'
        }} />

        {/* Halo lumineux droit (respiration) */}
        <div className="absolute -right-12 -top-10 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 65%)' }} />

        {/* Halo bas-gauche (ancre chaleureuse) */}
        <div className="absolute -left-8 bottom-0 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,122,46,.25) 0%, transparent 70%)' }} />

        {/* Contenu */}
        <div className="relative px-5 pt-7 pb-8 text-white flex flex-col gap-0">

          {/* Barre top : avatar + notifs */}
          <div className="flex items-center justify-between">
            <button onClick={() => go('profil')} className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-full border-[1.5px] border-white/50 flex items-center justify-center font-display font-extrabold text-[16px] bg-white/15 backdrop-blur-sm">
                {initials}
              </div>
              <div>
                <div className="text-[11px] text-white/65 font-medium tracking-wide">{dayLabel} · {greeting}</div>
                <div className="font-display font-extrabold text-[17px] leading-tight">
                  {first || 'Entrepreneur'}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                  <Icon name="flame" size={13} className="text-amber" />
                  <span className="text-[11.5px] font-bold text-white">{streak}j</span>
                </div>
              )}
              <button onClick={() => go('notifications')}
                className="relative w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/15 flex items-center justify-center active:scale-95 transition">
                <Icon name="bolt" size={17} className="text-white" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#FF3B30] border-2 border-transparent flex items-center justify-center text-[10px] font-extrabold text-white px-1">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Message principal — espace mental */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <span className="text-[11px] font-bold text-white/65 uppercase tracking-[.12em]">{nomAss} · ton bras droit</span>
            </div>
            <h2 className="font-display font-extrabold text-[26px] leading-[1.18] tracking-tight">
              Qu'est-ce qu'on règle<br />aujourd'hui ?
            </h2>
            <p className="text-[13px] text-white/55 mt-2 leading-relaxed">
              Dis, dicte ou tape — l'équipe est prête.
            </p>
          </div>

          {/* Barre messages si plan limité */}
          {msgLimit !== null && (
            <button onClick={() => go('paliers')}
              className="mt-5 w-full text-left bg-black/20 backdrop-blur-sm rounded-[14px] px-3.5 py-3 border border-white/10 active:scale-[.99] transition">
              <div className="flex justify-between items-baseline text-[12px] font-semibold">
                <span className="text-white/70">Messages du jour</span>
                <span className="text-white"><b className="font-display text-[13.5px]">{remaining}</b><span className="text-white/50"> / {msgLimit}</span></span>
              </div>
              <div className="h-[5px] bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-white/80 rounded-full transition-[width]"
                  style={{ width: `${(remaining / msgLimit) * 100}%` }} />
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="px-[18px] pt-5 flex flex-col gap-4">
        <SectionLabel>Ta progression</SectionLabel>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssistGlyph accent="growth" icon="medal" size={38} />
              <div className="min-w-0">
                <h3 className="font-display font-extrabold text-[15px] leading-tight whitespace-nowrap truncate">
                  Palier {niveau} · En route
                </h3>
                {activite && (
                  <div className="text-[12px] text-g400 font-medium truncate">
                    « {activite.length > 40 ? activite.slice(0, 40) + '…' : activite} »
                  </div>
                )}
              </div>
            </div>
            <Pill tone="growth" className="flex-shrink-0 whitespace-nowrap">▲ +{niveau}</Pill>
          </div>
          <Progress value={progPct} className="my-4" />
          <div className="flex justify-between">
            {milestones.map(ms => (
              <button
                key={ms.id}
                onClick={() => ms.state === 'now' && go('conversation', { assistant: 'coach' })}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition
                  ${ms.state === 'done' ? 'bg-growth border-growth text-white'
                    : ms.state === 'now' ? 'bg-white border-orange text-orange shadow-[0_0_0_4px_rgba(242,92,5,.13)]'
                    : 'bg-white border-g200 text-g400'}`}>
                  {ms.state === 'done' ? <Icon name="check" size={14} stroke={2.6} /> : ms.id}
                </span>
                <span className={`text-[10.5px] font-semibold text-center leading-tight ${ms.state === 'todo' ? 'text-g400' : 'text-g700'}`}>
                  {ms.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* ── Bloc micro central ─────────────────────────────────────── */}
        <button
          onClick={() => go('dump')}
          className="w-full text-left relative overflow-hidden rounded-[24px] px-5 py-6 text-white active:scale-[.99] transition"
          style={{ background: "linear-gradient(135deg,#1F1B18,#2a2320)" }}
        >
          {/* Glow orange animé */}
          <div className="absolute -right-6 -bottom-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(242,92,5,.4),transparent 70%)", animation: "glowPulse 3s ease-in-out infinite" }} />
          <div className="relative flex items-center gap-5">
            {/* Icône micro */}
            <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 0 6px rgba(242,92,5,.12), 0 0 0 12px rgba(242,92,5,.06)", animation: "glowPulse 3s ease-in-out infinite" }}>
              <Icon name="mic" size={28} className="text-orange" />
            </div>
            <div>
              <p className="font-display font-extrabold text-[18px] leading-snug">
                Besoin de te vider la tête ?
              </p>
              <p className="text-[13px] text-white/60 mt-1 leading-relaxed">
                Parle à {nomAss} — il va gérer.
              </p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                <span className="text-[11.5px] font-bold text-orange">Appuyer pour parler</span>
              </div>
            </div>
          </div>
        </button>

        {/* Conseil automatique : clients inactifs */}
        {staleCount > 0 && (
          <button onClick={() => go('carnet')}
            className="flex items-center gap-3 p-4 rounded-[18px] border border-amber-200 bg-amber-50 active:scale-[.99] transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="clock" size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-display font-bold text-[14px] text-charbon">
                {staleCount} client{staleCount > 1 ? 's' : ''} à relancer
              </p>
              <p className="text-[12px] text-amber-600 font-medium">Pas de contact depuis 14+ jours</p>
            </div>
            <Icon name="chevron" size={18} className="text-amber-400" />
          </button>
        )}

        {/* Quick actions : Suivi Clients + Agenda */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => go('carnet')}
            className="flex flex-col gap-2 p-4 bg-white rounded-[18px] border border-g200 shadow-soft active:scale-[.98] transition text-left">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <Icon name="users" size={20} className="text-orange" />
            </div>
            <div>
              <p className="font-display font-bold text-[14px] text-charbon">Suivi Clients</p>
              <p className="text-[11.5px] text-g400">{carnetCount} contact{carnetCount !== 1 ? 's' : ''}</p>
            </div>
          </button>

          <button onClick={() => go('agenda')}
            className="flex flex-col gap-2 p-4 bg-white rounded-[18px] border border-g200 shadow-soft active:scale-[.98] transition text-left">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <Icon name="check" size={20} className="text-orange" />
            </div>
            <div>
              <p className="font-display font-bold text-[14px] text-charbon">Agenda</p>
              <p className="text-[11.5px] text-g400">Calendrier · priorités</p>
            </div>
          </button>
        </div>

        {/* La Méthode ATTRACTOR */}
        <button onClick={() => go("methode")}
          className="flex items-center justify-between p-4 rounded-[18px] border border-orange/25 active:scale-[.99] transition"
          style={{ background: "linear-gradient(135deg,#fff9f5,#fff3ec)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/15 flex items-center justify-center text-[20px]">📖</div>
            <div className="text-left">
              <div className="font-display font-extrabold text-[14px] text-charbon">La Méthode ATTRACTOR</div>
              <div className="text-[12px] text-g400 mt-0.5">5 écrits · Accès libre</div>
            </div>
          </div>
          <Icon name="arrow" size={18} className="text-orange flex-shrink-0" />
        </button>

        <TipCard nomAss={nomAss} go={go} />

        <SectionLabel action={<button onClick={() => go("assistants")} className="text-[12px] font-bold text-orange">Tout voir</button>}>
          Ton équipe
        </SectionLabel>
        <div className="flex gap-3 overflow-x-auto pb-1.5 -mx-[18px] px-[18px]" style={{ scrollbarWidth: "none" }}>
          {resolvedAssistants.slice(0, 4).map(a => {
            const locked = a.status === "verrouille";
            const isDemo = a.status === "demo";
            const displayName = a.id === "coach" ? nomAss : a.name;
            return (
              <button key={a.id} onClick={() => handleAssistant(a)}
                className="min-w-[140px] text-left bg-white border border-g200 rounded-xl p-3.5 shadow-soft active:scale-[.98] transition">
                {a.photo
                  ? <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ${locked ? "opacity-60 grayscale" : ""}`}><img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" /></div>
                  : <AssistGlyph accent={a.accent} icon={a.icon} size={40} locked={locked} />
                }
                <h4 className="font-display font-bold text-[14px] mt-2.5">{displayName}</h4>
                <div className="text-[11.5px] text-g400">{a.role}</div>
                <div className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${locked ? "text-g400" : isDemo ? "text-amber" : "text-growth"}`}>
                  {locked ? <><Icon name="lock" size={12} /> Plan Team</> : isDemo ? <><Icon name="spark" size={12} /> Démo gratuite</> : <>● Actif</>}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={() => go("paliers")} className="relative overflow-hidden rounded-[20px] text-white text-left flex items-stretch"
          style={{ background: "linear-gradient(120deg,rgba(30,86,49,.96),rgba(20,60,35,.96))" }}>
          <div className="absolute -right-5 -top-8 w-32 h-32 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(255,179,0,.30),transparent 70%)" }} />
          <div className="w-[88px] flex-shrink-0 self-stretch overflow-hidden">
            <img src="/uploads/photo-community.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative p-4 flex-1">
            <h4 className="font-display font-extrabold text-[15px] leading-tight">
              {userCount ? `${userCount} testeur${userCount > 1 ? 's' : ''} en cours` : 'Testeurs en cours'}
            </h4>
            <p className="text-[12px] text-white/80 mt-1 leading-snug">Tu fais partie des premiers. Merci de construire ça avec nous.</p>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber mt-2">
              Voir comment on peut t'aider <Icon name="chevron" size={14} />
            </span>
          </div>
        </button>
      </div>

      {lockedSheet && (
        <Sheet onClose={() => setLockedSheet(null)} title={`Ce que ${lockedSheet.assistant.name} peut faire pour toi`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-sable rounded-[16px]">
              <AssistGlyph accent={lockedSheet.assistant.accent} icon={lockedSheet.assistant.icon} size={44} />
              <div>
                <p className="font-display font-bold text-[15px] text-charbon">{lockedSheet.assistant.name}</p>
                <p className="text-[12px] text-g400">{lockedSheet.assistant.role}</p>
              </div>
            </div>
            <p className="text-[15px] text-charbon leading-relaxed">{lockedSheet.msg}</p>
            <div className="p-3.5 bg-orange/8 border border-orange/15 rounded-[14px]">
              <p className="text-[13px] text-[#a23c00]">
                Disponible avec le forfait <span className="font-bold">{lockedSheet.assistant.plan}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Btn onClick={() => { setLockedSheet(null); go('paliers'); }} className="w-full" iconRight="arrow">
                Voir le forfait {lockedSheet.assistant.plan}
              </Btn>
              <button onClick={() => setLockedSheet(null)} className="text-center text-[13px] text-g400 font-semibold py-2">
                Pas maintenant
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
