import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK } from '../data';
import { Pill, Btn, Icon, Sheet, Spinner, AppHeader } from '../components/ui';

// ─── Progression visuelle des tiers ──────────────────────────────────────────

const TIER_STEPS = [
  { id: 'gratuit',       label: 'Gratuit',     color: 'text-g400' },
  { id: 'growth',        label: 'Growth',      color: 'text-orange' },
  { id: 'team',          label: 'Team',        color: 'text-amber' },
  { id: 'personnalise',  label: 'Perso.',      color: 'text-white' },
];

function TierProgress({ currentId }) {
  const currentIdx = TIER_STEPS.findIndex(s => s.id === currentId);

  return (
    <div className="flex items-center gap-0 px-[18px] mb-5">
      {TIER_STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Cercle */}
          <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${i <= currentIdx ? '' : 'opacity-40'}`}>
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
              i === currentIdx
                ? 'bg-orange border-orange shadow-[0_0_10px_rgba(242,92,5,.5)]'
                : i < currentIdx
                  ? 'bg-growth/20 border-growth'
                  : 'bg-white/10 border-white/20'
            }`}>
              {i < currentIdx ? (
                <Icon name="check" size={12} stroke={3} className="text-growth" />
              ) : i === currentIdx ? (
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </div>
            <span className={`text-[9.5px] font-bold ${i === currentIdx ? 'text-orange' : i < currentIdx ? 'text-growth' : 'text-white/40'}`}>
              {step.label}
            </span>
          </div>
          {/* Ligne de connexion */}
          {i < TIER_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${i < currentIdx ? 'bg-growth/50' : 'bg-white/15'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Hero de la page ──────────────────────────────────────────────────────────

function PaliersHero({ currentId }) {
  return (
    <div className="relative overflow-hidden bg-charbon px-[18px] pt-5 pb-6">
      {/* Glow orange */}
      <div
        className="absolute bottom-0 right-4 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(242,92,5,0.4) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }}
      />

      {/* Badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <Icon name="bolt" size={13} className="text-amber" />
        <span className="text-[11px] font-bold text-amber uppercase tracking-[.1em]">4 paliers disponibles</span>
      </div>

      {/* Titre */}
      <h2 className="font-display font-extrabold text-[28px] leading-none text-white mb-1">Monte d'un cran.</h2>
      <p className="text-[13.5px] text-white/55 mb-5">4 niveaux. 1 seule direction.</p>

      {/* Progression */}
      <TierProgress currentId={currentId} />
    </div>
  );
}

// ─── Carte de forfait ─────────────────────────────────────────────────────────

function ForfaitCard({ f, userCount, onPick }) {
  const [open, setOpen] = useState(false);
  const isPersonnalise = f.id === 'personnalise';

  // Style par tier
  const cardStyle = {
    gratuit:      'bg-white border border-g200 shadow-soft',
    growth:       'bg-white border-[1.5px] border-orange/30 shadow-[0_6px_24px_-8px_rgba(242,92,5,.2)]',
    team:         'bg-charbon text-white shadow-[0_18px_40px_-18px_rgba(26,23,20,.6)]',
    personnalise: 'border-[1.5px] border-orange/40',
  }[f.id] || 'bg-white border border-g200';

  const personnaliseGradient = isPersonnalise
    ? { background: 'linear-gradient(135deg, #1A1714 70%, rgba(242,92,5,0.25))' }
    : {};

  const isDark = f.id === 'team' || isPersonnalise;

  return (
    <div className={`relative rounded-[22px] overflow-hidden ${cardStyle}`} style={personnaliseGradient}>

      {/* Badge promo en haut */}
      {(f.promo || f.badge) && (
        <div className="absolute -top-3 left-5 flex items-center gap-2 z-10">
          {f.promo && (
            <span className="bg-amber text-charbon font-display font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Icon name="bolt" size={12} /> {f.promo}
            </span>
          )}
          {f.badge && !f.promo && (
            <span className="bg-orange/15 text-orange font-bold text-[11px] px-3 py-1 rounded-full border border-orange/25">
              {f.badge}
            </span>
          )}
          {f.id === 'team' && userCount != null && (
            <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              {Math.max(0, 100 - userCount)} places restantes
            </span>
          )}
        </div>
      )}

      <div className="p-5 pt-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className={`font-display font-extrabold text-[19px] ${isDark ? 'text-white' : 'text-charbon'}`}>{f.name}</h3>
            <p className={`text-[12.5px] mt-0.5 ${isDark ? 'text-white/60' : 'text-g400'}`}>{f.tagline}</p>
          </div>
          {f.current && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-growth bg-growth/12 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" /> Actuel
            </span>
          )}
        </div>

        {/* Prix */}
        {!isPersonnalise ? (
          <div className="flex items-baseline gap-2 mt-4 mb-0.5">
            <span className={`font-display font-extrabold text-[34px] leading-none ${f.id === 'team' ? 'text-orange-light' : 'text-charbon'}`}>{f.eur}</span>
            <span className={`text-[13px] ${isDark ? 'text-white/50' : 'text-g400'}`}>{f.period}</span>
            {f.eurOld && (
              <span className="ml-1 bg-amber text-charbon text-[11px] font-extrabold px-2 py-0.5 rounded-full">-60%</span>
            )}
          </div>
        ) : (
          <div className="mt-4 mb-0.5">
            <span className="font-display font-extrabold text-[22px] text-orange">Sur devis</span>
          </div>
        )}

        {f.eurOld && (
          <div className={`text-[12px] mb-0.5 ${isDark ? 'text-white/40' : 'text-g400'}`}>
            Prix habituel : <span className="line-through">{f.eurOld}{f.period}</span> · Promo fondateurs
          </div>
        )}
        {f.fcfa && !isPersonnalise && (
          <div className={`text-[13px] font-semibold ${f.id === 'team' ? 'text-amber' : 'text-growth'}`}>{f.fcfa} {f.period}</div>
        )}
        {isPersonnalise && (
          <div className="text-[12px] text-orange/70 font-semibold">{f.fcfa}</div>
        )}

        {/* Features avec toggle */}
        <div className="mt-4">
          <button
            className={`flex items-center justify-between w-full mb-3 ${isDark ? 'text-white/70' : 'text-g400'}`}
            onClick={() => setOpen(o => !o)}
          >
            <span className="text-[11.5px] font-bold uppercase tracking-[.08em]">Ce qui est inclus</span>
            <Icon name={open ? 'chevdown' : 'chevron'} size={14} className={open ? 'rotate-90' : ''} />
          </button>

          {/* Toujours 2 features visibles, les autres dépliables */}
          <ul className="space-y-3">
            {(open ? f.features : f.features.slice(0, 2)).map((feat, i) => (
              <li key={i} className="flex gap-2.5">
                <Icon name="check" size={16} stroke={2.5} className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-orange-light' : f.id === 'growth' ? 'text-orange' : 'text-growth'}`} />
                <div>
                  <p className={`text-[13.5px] font-semibold leading-snug ${isDark ? 'text-white/90' : 'text-charbon'}`}>{feat.titre}</p>
                  <p className={`text-[12px] leading-snug mt-0.5 ${isDark ? 'text-white/45' : 'text-g400'}`}>{feat.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          {!open && f.features.length > 2 && (
            <button onClick={() => setOpen(true)}
              className={`mt-2 text-[12px] font-bold flex items-center gap-1 ${isDark ? 'text-white/50 hover:text-white/80' : 'text-g400 hover:text-charbon'} transition`}>
              +{f.features.length - 2} autres avantages <Icon name="chevdown" size={12} />
            </button>
          )}
        </div>

        {/* CTA */}
        <div className="mt-5">
          {f.current ? (
            <div className="w-full py-3.5 rounded-[14px] bg-growth/10 text-center">
              <span className="text-[14px] font-bold text-growth">Ton palier actuel</span>
            </div>
          ) : isPersonnalise ? (
            <button onClick={onPick}
              className="w-full py-3.5 rounded-[14px] text-white font-display font-extrabold text-[14px] active:scale-[.99] transition flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #F25C05, #D94703)', boxShadow: '0 8px 20px -6px rgba(242,92,5,.5)' }}>
              <Icon name="chat" size={15} />
              Parler à Carelle
            </button>
          ) : (
            <button onClick={onPick}
              className={`w-full py-3.5 rounded-[14px] font-display font-extrabold text-[14px] active:scale-[.99] transition flex items-center justify-center gap-2 ${
                f.id === 'team'
                  ? 'bg-orange text-white'
                  : 'bg-charbon text-white'
              }`}
              style={f.id === 'team' ? { boxShadow: '0 8px 20px -6px rgba(242,92,5,.5)' } : {}}>
              <Icon name="bolt" size={15} />
              Passer à {f.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen principal ─────────────────────────────────────────────────────────

export function PaliersScreen({ go, notify, profile }) {
  const [pay, setPay]             = useState(null);
  const [userCount, setUserCount] = useState(null);

  const currentPlan = profile?.plan_code || 'gratuit';
  const currentTier = MOCK.forfaits.find(f => f.id === currentPlan || f.current) || MOCK.forfaits[0];

  useEffect(() => {
    supabase.rpc('get_user_count')
      .then(({ data }) => { if (data) setUserCount(data); });
  }, []);

  const handlePick = (f) => {
    if (f.id === 'personnalise') {
      go('conversation', { assistant: 'carelle', prefill: "Je veux en savoir plus sur l'Application Personnalisée." });
      return;
    }
    if (f.current) {
      notify("C'est déjà ton palier actuel.");
      return;
    }
    setPay(f);
  };

  return (
    <div className="min-h-screen bg-sable">
      <AppHeader title="Tes paliers" sub="Monte d'un cran, débloque ton équipe" onBack={() => go('dashboard')} />

      {/* Hero + progression */}
      <PaliersHero currentId={currentTier?.id || 'gratuit'} />

      <div className="px-[18px] pb-6 flex flex-col gap-5 pt-4">
        {MOCK.forfaits.map(f => (
          <ForfaitCard key={f.id} f={f} userCount={userCount} onPick={() => handlePick(f)} />
        ))}

        {/* Garanties */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-center gap-2 text-[12px] text-g400">
            <Icon name="check" size={14} className="text-growth" />
            Sans frais d'installation · résiliable à tout moment
          </div>
          <p className="text-center text-[11px] text-g400 px-6">TVA non applicable, art. 293 B du CGI.</p>
        </div>
      </div>

      {pay && <PaymentSheet f={pay} onClose={() => setPay(null)} notify={notify} />}
    </div>
  );
}

// ─── Sheet de paiement ────────────────────────────────────────────────────────

function PaymentSheet({ f, onClose, notify }) {
  const [method, setMethod] = useState(null);
  const [state, setState]   = useState('choose');

  const pay = (m) => {
    if (m.id === 'xpaye') {
      notify('XPaye en cours d\'intégration — bientôt disponible !');
      return;
    }
    setMethod(m);
    setState('loading');
    setTimeout(() => setState('done'), 1700);
  };

  const methods = [
    { id: 'wave',  label: 'Wave',          desc: 'Mobile money CI',          color: '#1DC4F2', fg: '#053a4a' },
    { id: 'mtn',   label: 'MTN MoMo',      desc: 'Mobile money CI',          color: '#FFCC00', fg: '#3a3000' },
    { id: 'xpaye', label: 'XPaye',         desc: 'Paiement mobile CI · Bientôt', color: '#F25C05', fg: '#fff' },
    { id: 'card',  label: 'Carte bancaire',desc: 'Visa · Mastercard',         color: '#E7E1D8', fg: '#1A1714' },
  ];

  return (
    <Sheet onClose={onClose} title={state === 'done' ? 'Bienvenue !' : `Passer ${f.name}`}>
      {state === 'choose' && (
        <div className="flex flex-col gap-4">
          {/* Récap forfait */}
          <div className="bg-sable rounded-[16px] p-4 flex items-center justify-between border border-g200">
            <div>
              <div className="font-display font-bold text-[15px]">{f.name}</div>
              <div className="text-[12.5px] text-g400">{f.tagline}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-[20px] text-charbon">
                {f.eur}<span className="text-[12px] text-g400 font-normal">{f.period}</span>
              </div>
              <div className="text-[12px] text-growth font-semibold">{f.fcfa}</div>
            </div>
          </div>

          {/* Ce que tu débloque */}
          <div className="bg-orange/5 border border-orange/20 rounded-[14px] px-4 py-3">
            <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.08em] mb-2">Ce que tu débloque</p>
            <p className="text-[13px] text-charbon leading-relaxed">{f.features?.[0]?.titre}</p>
          </div>

          <p className="font-semibold text-[13.5px] text-charbon">Choisis ton moyen de paiement</p>

          <div className="flex flex-col gap-2.5">
            {methods.map(m => (
              <button key={m.id} onClick={() => pay(m)}
                className={`flex items-center gap-3.5 p-3.5 rounded-[16px] border-[1.5px] transition text-left ${
                  m.id === 'xpaye' ? 'border-orange/30 opacity-70' : 'border-g200 hover:border-orange active:scale-[.99]'
                }`}>
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center font-display font-extrabold text-[12px] flex-shrink-0"
                  style={{ background: m.color, color: m.fg }}>
                  {m.id === 'xpaye' ? 'XP' : m.label.split(' ')[0].slice(0, 4)}
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-[15px]">{m.label}</div>
                  <div className="text-[12px] text-g400">{m.desc}</div>
                </div>
                {m.id === 'xpaye' ? (
                  <span className="text-[10px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full">Bientôt</span>
                ) : (
                  <Icon name="chevron" size={18} className="text-g400" />
                )}
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] text-g400">Sans frais d'installation · TVA non applicable, art. 293 B du CGI.</p>
        </div>
      )}

      {state === 'loading' && (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-11 h-11" />
          <p className="font-display font-bold text-[15px]">Confirmation via {method?.label}…</p>
          <p className="text-[13px] text-g400">Valide la demande sur ton téléphone.</p>
        </div>
      )}

      {state === 'done' && (
        <div className="py-6 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-growth/12 flex items-center justify-center text-growth">
            <Icon name="check" size={34} stroke={2.5} />
          </div>
          <h3 className="font-display font-extrabold text-[20px]">Tu es {f.name} !</h3>
          <p className="text-[13.5px] text-g700 max-w-[280px]">
            Ton équipe est débloquée. On passe à la vitesse supérieure, comme nous.
          </p>
          <Btn className="w-full mt-2" iconRight="arrow" onClick={onClose}>C'est parti</Btn>
        </div>
      )}
    </Sheet>
  );
}
