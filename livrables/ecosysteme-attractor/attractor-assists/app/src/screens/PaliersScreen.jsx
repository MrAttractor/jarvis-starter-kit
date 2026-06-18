import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Sheet, Spinner } from '../components/ui';

// Mettre à false quand la période de lancement est terminée
const LANCEMENT_ACTIF = true;

// Numéro WhatsApp Mac Arthur (France) — à mettre à jour si besoin
const MA_WA = '2250576877070';

const PLANS = [
  {
    id: 'gratuit',
    name: 'Plan Gratuit',
    fcfa: '0 FCFA',
    eur: '0 €',
    period: '/mois',
    tagline: 'Pour démarrer et tester',
    features: [
      'Mini-site boutique partageable',
      'Catalogue produits illimité',
      'Gestion des commandes (20/mois)',
      '20 messages Assists / jour',
    ],
    locked: [
      'Commandes illimitées',
      'Fidelys — programme fidélité auto',
      'DMV quotidienne (action du jour)',
      'Assists illimité',
    ],
    cta: null, // pas de CTA si plan actuel
  },
  {
    id: 'bras_droit',
    name: 'Bras Droit',
    fcfa: '9 900 FCFA',
    eur: '15 €',
    period: '/mois',
    tagline: 'Ton assistant IA sans limite',
    badge: 'Recommandé',
    features: [
      'Commandes illimitées sur ton mini-site',
      'Fidelys — programme fidélité automatique',
      'Assists illimité (0 restriction)',
      'DMV quotidienne — action du jour personnalisée',
      'Mini-site boutique + catalogue illimité',
    ],
    locked: [],
    cta: 'Passer au Bras Droit',
  },
];

const UPSELLS = [
  {
    id: 'domaine',
    icon: 'send',
    title: 'Nom de domaine personnalisé',
    desc: 'Tu veux que ta boutique s\'appelle boutique.tonnom.com plutôt que assists…/b/slug ?',
    waText: 'Bonjour, je veux un nom de domaine personnalisé pour ma boutique Assists.',
  },
  {
    id: 'wa_business',
    icon: 'chat',
    title: 'Connexion WhatsApp Business',
    desc: 'Tu veux qu\'on connecte ton Assists directement à ton WhatsApp Business pour qu\'il réponde automatiquement ?',
    waText: 'Bonjour, je veux connecter mon Assists à mon WhatsApp Business.',
  },
];

// ─── Mapping méthode → channel PaiementPro ────────────────────────────────────

const CHANNEL_MAP = {
  wave:  'WAVECI',
  mtn:   'MOMOCI',
  xpaye: 'OMCIV2',
  card:  'CARD',
};

const PAY_METHODS = [
  { id: 'wave',  label: 'Wave',          desc: 'Mobile money CI',   color: '#1DC4F2', fg: '#053a4a' },
  { id: 'mtn',   label: 'MTN MoMo',      desc: 'Mobile money CI',   color: '#FFCC00', fg: '#3a3000' },
  { id: 'xpaye', label: 'Orange Money',  desc: 'Mobile money CI',   color: '#FF7A00', fg: '#fff'    },
  { id: 'card',  label: 'Carte bancaire',desc: 'Visa · Mastercard', color: '#E7E1D8', fg: '#1A1714' },
];

function PaymentSheet({ onClose, notify }) {
  const [state, setState]   = useState('choose'); // choose | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const pay = async (m) => {
    setState('loading');
    setErrorMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('init-payment', {
        body: { plan_id: 'bras_droit', channel: CHANNEL_MAP[m.id] ?? m.id },
      });
      if (error) {
        let msg = error.message;
        try { const b = await error.context?.json?.(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }
      if (!data?.url) throw new Error(data?.error ?? 'URL de paiement non reçue');
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e.message ?? 'Une erreur est survenue.');
      setState('error');
    }
  };

  return (
    <Sheet onClose={onClose} title="Passer au Bras Droit">
      {state === 'choose' && (
        <div className="flex flex-col gap-4">
          <div className="bg-sable rounded-2xl p-4 flex items-center justify-between border border-g200">
            <div>
              <div className="font-display font-bold text-[15px] text-charbon">Bras Droit</div>
              <div className="text-[12.5px] text-g400">Assists illimité · DMV · Fidelys</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-[20px] text-orange">9 900 FCFA</div>
              <div className="text-[12px] text-g400">15 €/mois</div>
            </div>
          </div>

          <p className="font-semibold text-[13.5px] text-charbon">Choisis ton moyen de paiement</p>

          <div className="flex flex-col gap-2.5">
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => pay(m)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border-[1.5px] border-g200 active:border-orange active:scale-[.99] transition text-left">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center font-display font-extrabold text-[11px] flex-shrink-0"
                  style={{ background: m.color, color: m.fg }}>
                  {m.label.split(' ')[0].slice(0, 4)}
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-[15px] text-charbon">{m.label}</div>
                  <div className="text-[12px] text-g400">{m.desc}</div>
                </div>
                <Icon name="chevron" size={18} className="text-g400" />
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] text-g400 px-4">Sans frais d'installation · résiliable à tout moment · TVA non applicable, art. 293 B du CGI.</p>
        </div>
      )}

      {state === 'loading' && (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-11 h-11" />
          <p className="font-display font-bold text-[15px] text-charbon">Connexion au paiement…</p>
          <p className="text-[13px] text-g400">Tu vas être redirigé vers la page de paiement sécurisée.</p>
        </div>
      )}

      {state === 'error' && (
        <div className="py-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Icon name="close" size={28} className="text-red-500" />
          </div>
          <h3 className="font-display font-extrabold text-[18px] text-charbon">Une erreur est survenue</h3>
          <p className="text-[13px] text-g400 max-w-[260px]">{errorMsg}</p>
          <button onClick={() => setState('choose')}
            className="w-full mt-1 py-3 rounded-2xl bg-charbon text-white font-bold text-[14px]">
            Réessayer
          </button>
        </div>
      )}
    </Sheet>
  );
}

// ─── Sheet essai gratuit ──────────────────────────────────────────────────────

const TRIAL_FEATURES = [
  { icon: 'chat', text: 'Assists illimité — pose autant de questions que tu veux' },
  { icon: 'target', text: 'DMV quotidienne — une action concrète chaque matin' },
  { icon: 'star', text: 'Fidelys — programme de fidélité pour tes clients' },
  { icon: 'compass', text: 'Agent Veille & Prospection' },
  { icon: 'bolt', text: 'Mini-site boutique complet' },
];

function TrialSheet({ onClose, notify, onActivated }) {
  const [state, setState] = useState('offer'); // offer | loading | success

  const activate = async () => {
    setState('loading');
    try {
      const { data, error } = await supabase.functions.invoke('activate-trial', { body: {} });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setState('success');
      setTimeout(() => { onActivated?.(); onClose(); }, 2200);
    } catch (e) {
      notify(e?.message || 'Erreur lors de l\'activation');
      setState('offer');
    }
  };

  return (
    <Sheet onClose={onClose} title="">
      {state === 'offer' && (
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center pb-1">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-1"
              style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
            >
              <Icon name="bolt" size={28} />
            </div>
            <div className="font-display font-extrabold text-[22px] text-charbon">Bras Droit OFFERT</div>
            <p className="text-[13.5px] text-g500 max-w-[280px] leading-relaxed">
              Toutes les fonctionnalités débloquées pendant <strong className="text-charbon">30 jours</strong> — sans carte bancaire.
            </p>
          </div>

          {/* Features */}
          <div className="bg-sable rounded-2xl p-4 flex flex-col gap-3">
            {TRIAL_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={15} className="text-orange" />
                </div>
                <span className="text-[13px] text-charbon font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={activate}
            className="w-full py-4 rounded-2xl bg-orange text-white font-display font-extrabold text-[16px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] active:opacity-85 transition"
            style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
          >
            Activer maintenant — GRATUIT
          </button>

          <p className="text-center text-[11px] text-g400 leading-relaxed px-2">
            Après 30 jours, tu repasses automatiquement sur le plan gratuit.
            Aucun prélèvement automatique.
          </p>
        </div>
      )}

      {state === 'loading' && (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-10 h-10" />
          <p className="font-display font-bold text-[15px] text-charbon">Activation en cours…</p>
        </div>
      )}

      {state === 'success' && (
        <div className="py-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-vert/10 flex items-center justify-center">
            <Icon name="check" size={32} className="text-vert" />
          </div>
          <div className="font-display font-extrabold text-[20px] text-charbon">Bras Droit activé !</div>
          <p className="text-[13.5px] text-g500 max-w-[260px] leading-relaxed">
            Toutes les fonctionnalités sont débloquées pour 30 jours. Profites-en.
          </p>
        </div>
      )}
    </Sheet>
  );
}

// ─── Screen principal ─────────────────────────────────────────────────────────

export function PaliersScreen({ go, notify, profile, onPlanChange }) {
  const [showPayment, setShowPayment] = useState(false);
  const [showTrial, setShowTrial] = useState(false);

  const currentPlan = profile?.plan_tier ||
    (['bras_droit','growth','growth_eu','team','manager','personnalise'].includes(profile?.plan_code) ? 'growth' : 'gratuit');
  const isBrasDroit = currentPlan === 'growth' || currentPlan === 'pro';
  const isTrial     = !!profile?.trial_activated_at && !profile?.trial_expires_at?.passed;
  const alreadyTrialed = !!profile?.trial_activated_at;

  return (
    <div className="flex flex-col bg-sable" style={{ minHeight: '100dvh' }}>
      {/* AppBar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-sable">
        <button onClick={() => go('profil')} className="w-8 h-8 flex items-center justify-center">
          <Icon name="back" size={20} className="text-charbon" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-extrabold text-[20px] text-charbon">Mes plans</h1>
        </div>
      </div>

      <div className="px-4 pb-10 flex flex-col gap-4">
        {/* Hero */}
        <div
          className="rounded-2xl p-5 text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#1A1714 60%,#2a2018)' }}
        >
          <div className="absolute right-4 top-4 w-24 h-24 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #F25C05 0%, transparent 70%)' }} />
          <div className="text-[11px] font-bold text-white/50 uppercase tracking-[.12em] mb-1">Assists V3</div>
          <h2 className="font-display font-extrabold text-[22px] leading-tight mb-1">Ton bras droit IA.</h2>
          <p className="text-[13px] text-white/60">Deux plans simples, zéro surprise.</p>
        </div>

        {/* Plan Gratuit */}
        {PLANS.filter(p => p.id === 'gratuit').map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className={`bg-white rounded-2xl border p-5 shadow-soft ${isCurrent ? 'border-g300' : 'border-g200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-extrabold text-[18px] text-charbon">{plan.name}</h3>
                  <p className="text-[12px] text-g500 mt-0.5">{plan.tagline}</p>
                </div>
                {isCurrent && (
                  <span className="flex-shrink-0 text-[11px] font-bold text-vert bg-vert/10 px-2.5 py-1 rounded-full border border-vert/20">
                    Plan actuel
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display font-extrabold text-[30px] text-charbon leading-none">{plan.fcfa}</span>
                <span className="text-[12px] text-g400">{plan.period}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon name="check" size={15} className="text-vert flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-charbon">{f}</span>
                  </li>
                ))}
                {plan.locked.map((f, i) => (
                  <li key={`l${i}`} className="flex items-start gap-2 opacity-40">
                    <Icon name="close" size={15} className="text-g400 flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-g500">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-g200 text-center text-[12px] text-g500 font-semibold">
                Gratuit à vie
              </div>
            </div>
          );
        })}

        {/* Plan Bras Droit */}
        {PLANS.filter(p => p.id === 'bras_droit').map(plan => (
          <div key={plan.id} className="relative pt-3">
            {/* Badge */}
            <div className="absolute -top-0 left-5 z-10">
              {LANCEMENT_ACTIF && !isBrasDroit && !alreadyTrialed ? (
                <span className="bg-vert text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md tracking-wide">
                  OFFERT
                </span>
              ) : (
                <span className="bg-orange text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
                  {plan.badge}
                </span>
              )}
            </div>

            <div
              className="rounded-2xl p-5 text-white overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #FF7A2E 0%, #F25C05 60%, #C24700 100%)', boxShadow: '0 12px 32px -12px rgba(242,92,5,.55)' }}
            >
              <div className="absolute right-3 bottom-3 w-32 h-32 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-extrabold text-[18px] text-white">{plan.name}</h3>
                  <p className="text-[12px] text-white/70 mt-0.5">{plan.tagline}</p>
                </div>
                {isBrasDroit && (
                  <span className="flex-shrink-0 text-[11px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
                    Plan actuel
                  </span>
                )}
              </div>

              {/* Prix — OFFERT pendant le lancement */}
              {LANCEMENT_ACTIF && !isBrasDroit && !alreadyTrialed ? (
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display font-extrabold text-[34px] text-white leading-none">OFFERT</span>
                  <div>
                    <div className="text-[11px] text-white/70 line-through">{plan.fcfa}/mois</div>
                    <div className="text-[11px] text-white/90 font-bold">pendant 1 mois</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display font-extrabold text-[30px] text-white leading-none">{plan.fcfa}</span>
                  <span className="text-[12px] text-white/70">{plan.period}</span>
                  <span className="text-[12px] text-white/50 ml-1">({plan.eur}{plan.period})</span>
                </div>
              )}

              <ul className="space-y-2 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon name="check" size={15} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              {isBrasDroit ? (
                <div className="py-3 rounded-xl bg-white/20 text-center text-[14px] font-bold text-white">
                  Ton plan actuel
                </div>
              ) : LANCEMENT_ACTIF && !alreadyTrialed ? (
                <button
                  onClick={() => setShowTrial(true)}
                  className="w-full py-3.5 rounded-xl bg-white font-display font-extrabold text-[15px] active:opacity-85 transition shadow-[0_4px_12px_rgba(0,0,0,.15)]"
                  style={{ color: '#22c55e' }}
                >
                  Activer gratuitement — 1 mois offert
                </button>
              ) : (
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3.5 rounded-xl bg-white text-orange font-display font-extrabold text-[15px] active:opacity-85 transition shadow-[0_4px_12px_rgba(0,0,0,.15)]"
                >
                  Passer au Bras Droit
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Upsells sur mesure */}
        <div className="mt-2">
          <div className="text-[11px] font-bold text-g500 uppercase tracking-[.1em] px-1 mb-3">Sur mesure</div>
          <div className="flex flex-col gap-3">
            {UPSELLS.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-charbon/5 flex items-center justify-center flex-shrink-0">
                    <Icon name={u.icon} size={18} className="text-charbon" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[14px] text-charbon">{u.title}</div>
                    <p className="text-[12.5px] text-g500 mt-0.5 leading-relaxed">{u.desc}</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${MA_WA}?text=${encodeURIComponent(u.waText)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-charbon/20 text-[13px] font-bold text-charbon active:bg-g100 transition"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Nous contacter
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Garantie */}
        <div className="flex flex-col items-center gap-1.5 mt-2 text-center">
          <p className="text-[12px] text-g400 flex items-center gap-1.5">
            <Icon name="check" size={13} className="text-vert" />
            Sans frais d'installation · résiliable à tout moment
          </p>
          <p className="text-[11px] text-g400">TVA non applicable, art. 293 B du CGI.</p>
        </div>
      </div>

      {showPayment && <PaymentSheet onClose={() => setShowPayment(false)} notify={notify} />}
      {showTrial && (
        <TrialSheet
          onClose={() => setShowTrial(false)}
          notify={notify}
          onActivated={() => { notify('Bras Droit activé — 30 jours offerts !'); go('dashboard'); }}
        />
      )}
    </div>
  );
}
