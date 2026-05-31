import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { Icon, Pill, Card, Btn, SectionLabel, Progress, AssistGlyph, Sheet } from '../components/ui';

const PLAN_MSG_LIMIT = { decouverte: 20, decouverte_eu: 20 };

const CAPACITY_MSG = {
  miriam: (a, n) => `Pour toi, je peux rédiger tes posts de la semaine${a ? ' sur ' + a : ''}, répondre à ta communauté et envoyer tes broadcasts. ${n ? n + ' s\'en occupe' : 'Je m\'en occupe'} — tu n'as qu'à valider.`,
  serge:  (a, n) => `Pour toi, je peux organiser ta semaine${a ? ' autour de ' + a : ''} — tes priorités, tes relances en retard, tes actions urgentes. ${n ? n + ' te prépare' : 'Je te prépare'} un récap clair chaque matin.`,
  roland: (a, n) => `Pour toi, je peux calculer si ton prix actuel${a ? ' pour ' + a : ''} est juste et te dire combien tu devrais vraiment facturer pour être rentable. En 5 minutes.`,
};

export function DashboardScreen({ go, notify, profile }) {
  const [gamif, setGamif]           = useState(null);
  const [usedToday, setUsedToday]   = useState(0);
  const [ppsdDone, setPpsdDone]     = useState(false);
  const [lockedSheet, setLockedSheet] = useState(null);
  const [userCount, setUserCount]   = useState(null);

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
        const [gamifRes, usageRes, ppsdRes, countRes] = await Promise.all([
          supabase.from('gamification').select('streak,niveau,xp').eq('user_id', user.id).maybeSingle(),
          supabase.from('usage_daily').select('nb_messages').eq('user_id', user.id).eq('jour', today).maybeSingle(),
          supabase.from('ppsd').select('user_id').eq('user_id', user.id).maybeSingle(),
          supabase.rpc('get_user_count'),
        ]);
        if (gamifRes.data) setGamif(gamifRes.data);
        if (usageRes.data) setUsedToday(usageRes.data.nb_messages);
        if (ppsdRes.data)  setPpsdDone(true);
        if (countRes.data) setUserCount(countRes.data);
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

  const handleAssistant = (a) => {
    if (a.status !== 'verrouillé') { go('conversation', { assistant: a.id }); return; }
    const msgFn = CAPACITY_MSG[a.id];
    if (msgFn) setLockedSheet({ assistant: a, msg: msgFn(activite, nomAss) });
    else go('paliers');
  };

  return (
    <div className="min-h-full bg-sable pb-2">
      {/* warm header */}
      <div className="relative overflow-hidden text-white rounded-b-[26px] px-5 pt-7 pb-7"
        style={{ background: "linear-gradient(150deg,#FF7A2E 0%,#F25C05 52%,#D94703 100%)" }}>
        <div className="absolute -right-16 -top-12 w-52 h-52 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }} />
        <div className="relative flex items-center justify-between">
          <button onClick={() => go("profil")} className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center font-display font-extrabold text-[17px]"
              style={{ background: "repeating-linear-gradient(45deg,#c95a1a,#c95a1a 6px,#b54f15 6px,#b54f15 12px)" }}>
              {initials}
            </div>
            <div>
              <div className="text-[13px] opacity-90 font-medium">Bonjour</div>
              <div className="font-display font-extrabold text-[19px] leading-tight whitespace-nowrap">
                {first || 'Entrepreneur'}
              </div>
            </div>
          </button>
          {streak > 0 && (
            <Pill tone="white" icon="flame" className="backdrop-blur-sm !py-2">{streak} jours</Pill>
          )}
        </div>

        <div className="relative mt-6">
          <Pill tone="white" icon="bolt" className="backdrop-blur-sm">
            {nomAss} · ton bras droit
          </Pill>
          <h2 className="font-display font-extrabold text-[24px] leading-[1.16] tracking-tight mt-3">
            Conçu pour devenir ta doublure et te décharger mentalement.
          </h2>
        </div>

        {msgLimit !== null && (
          <button onClick={() => go("paliers")} className="relative w-full text-left mt-5 bg-charbon/20 rounded-xl px-3.5 py-3 active:scale-[.99] transition">
            <div className="flex justify-between items-baseline text-[12.5px] font-semibold">
              <span>Messages du jour</span>
              <span><b className="font-display text-[14px]">{remaining}</b> / {msgLimit} restants</span>
            </div>
            <div className="h-[7px] bg-white/25 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-[width]" style={{ width: `${(remaining / msgLimit) * 100}%` }} />
            </div>
          </button>
        )}
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

        <SectionLabel>Prochaine action</SectionLabel>
        <div className="relative overflow-hidden rounded-[20px] p-5 text-white"
          style={{ background: "linear-gradient(135deg,#1F1B18,#2a2320)" }}>
          <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(242,92,5,.35),transparent 70%)" }} />
          <div className="relative">
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-orange-light">On enchaîne</span>
                <h3 className="font-display font-extrabold text-[19px] leading-snug mt-2">
              Dis à {nomAss} ce dont tu as besoin.
            </h3>
            <p className="text-[13px] text-white/70 mt-2 max-w-[260px] leading-relaxed">
              Une tâche, une question, un projet — il s'adapte à toi. Maintenant.
            </p>
            <Btn className="w-full mt-4" iconRight="arrow" onClick={() => go("conversation", { assistant: "coach" })}>
              Lancer avec {nomAss}
            </Btn>
          </div>
        </div>

        <button onClick={() => go("agenda")}
          className="flex items-center justify-between p-4 bg-white rounded-[18px] border border-g200 shadow-soft active:scale-[.99] transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <Icon name="check" size={20} className="text-orange" />
            </div>
            <div>
              <p className="font-display font-bold text-[14.5px] text-charbon">Mon agenda</p>
              <p className="text-[12px] text-g400">Tâches · priorités · suivi</p>
            </div>
          </div>
          <Icon name="chevron" size={18} className="text-g300" />
        </button>

        <SectionLabel action={<button onClick={() => go("assistants")} className="text-[12px] font-bold text-orange">Tout voir</button>}>
          Ton équipe
        </SectionLabel>
        <div className="flex gap-3 overflow-x-auto pb-1.5 -mx-[18px] px-[18px]" style={{ scrollbarWidth: "none" }}>
          {MOCK.assistants.slice(0, 4).map(a => {
            const locked = a.status === "verrouillé";
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
                <div className={`text-[11px] font-bold mt-2 flex items-center gap-1 ${locked ? "text-g400" : "text-growth"}`}>
                  {locked ? <><Icon name="lock" size={12} /> {a.plan}</> : <>● Actif</>}
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
