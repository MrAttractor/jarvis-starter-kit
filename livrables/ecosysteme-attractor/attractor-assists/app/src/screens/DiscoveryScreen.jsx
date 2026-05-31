import { Logo, Btn } from '../components/ui';

const COULOIRS = [
  {
    id: 'organisation',
    emoji: '🗂',
    label: 'Organisation',
    tagline: 'Vide ta tête, retrouve le contrôle',
    desc: (activite) =>
      activite
        ? `Organise ${activite} en 7 jours. Un vrai système — pas une liste de plus.`
        : 'Construis un système pour que ton business avance même sans toi.',
    cta: 'Démarrer le Challenge 7 jours',
    prefill: "Je veux démarrer le challenge 7 jours pour organiser mon business",
    forProfils: ['salarie', 'mix'],
  },
  {
    id: 'visibilite',
    emoji: '👁',
    label: 'Visibilité',
    tagline: 'Parle à tes vrais clients',
    desc: (activite) =>
      activite
        ? `Construis le message qui fait que les bons clients pour ${activite} te trouvent.`
        : "Arrête de parler dans le vide. Touche enfin ta vraie cible.",
    cta: 'Définir ma cible (PPSD)',
    prefill: "Je veux définir ma cible et construire mon PPSD",
    forProfils: ['etudiant'],
  },
  {
    id: 'ventes',
    emoji: '💰',
    label: 'Ventes',
    tagline: 'Construis une offre irrésistible',
    desc: (activite) =>
      activite
        ? `Arrête d'afficher les prix de ${activite}. Montre une valeur que tes clients ne peuvent pas refuser.`
        : "Arrête d'afficher tes prix. Montre une valeur que tes clients ne peuvent pas refuser.",
    cta: 'Construire mon offre',
    prefill: "Je veux construire mon offre irrésistible",
    forProfils: ['entrepreneur'],
  },
];

const PRIORITY = {
  entrepreneur: 'ventes',
  salarie: 'organisation',
  mix: 'organisation',
  etudiant: 'visibilite',
};

export function DiscoveryScreen({ profile, onDone }) {
  const prenom       = profile?.prenom        || 'toi';
  const nomAssistant = profile?.nom_assistant  || 'ton assistant';
  const activite     = profile?.activite       || '';
  const initiales    = nomAssistant.slice(0, 2).toUpperCase();

  const savedProfil   = localStorage.getItem('aa_profil');
  const recommendedId = PRIORITY[savedProfil] || 'visibilite';

  const handleChoix = (couloir) => {
    onDone('conversation', { assistant: 'coach', prefill: couloir.prefill });
  };

  return (
    <div className="min-h-screen flex flex-col bg-sable">
      {/* Header sombre */}
      <div
        className="px-6 pt-10 pb-8 text-white"
        style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(242,92,5,.30), transparent 55%), radial-gradient(ellipse at 80% 10%, rgba(242,92,5,.12), transparent 50%), #0c0907" }}
      >
        <Logo light size="sm" />

        <div className="flex items-center gap-3 mt-8">
          <div className="w-12 h-12 rounded-full bg-orange flex items-center justify-center font-display font-extrabold text-[17px] text-white flex-shrink-0 shadow-[0_0_0_3px_rgba(242,92,5,.3)]">
            {initiales}
          </div>
          <div>
            <p className="font-display font-bold text-[17px] leading-tight">
              Bienvenue, {prenom}.
            </p>
            <p className="text-white/60 text-[13.5px] mt-0.5">
              {nomAssistant} est chargé et prêt.
            </p>
          </div>
        </div>

        <p className="text-white/80 text-[15px] mt-5 leading-relaxed">
          Voici les <span className="text-white font-bold">3 chantiers</span> sur lesquels
          on peut progresser ensemble — tout de suite.
        </p>
      </div>

      {/* Couloirs */}
      <div className="flex-1 px-5 py-6 flex flex-col gap-3 animate-[fadeUp_.4s_ease]">
        {COULOIRS.map((c) => {
          const isRecommended = c.id === recommendedId;
          return (
            <div
              key={c.id}
              className={`bg-white rounded-[20px] p-5 flex flex-col gap-3 transition-all ${
                isRecommended
                  ? 'border-[2px] border-orange shadow-[0_4px_20px_-6px_rgba(242,92,5,.25)]'
                  : 'border border-g200 shadow-soft'
              }`}
            >
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[26px] leading-none">{c.emoji}</span>
                  <div>
                    <p className="font-display font-extrabold text-[15.5px] text-charbon leading-tight">
                      {c.label}
                    </p>
                    <p className="text-[12.5px] text-g400 mt-0.5">{c.tagline}</p>
                  </div>
                </div>
                {isRecommended && (
                  <span className="flex-shrink-0 text-[10.5px] font-bold text-orange bg-orange/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Pour toi ✓
                  </span>
                )}
              </div>

              {/* Description personnalisée */}
              <p className="text-[13.5px] text-g700 leading-relaxed">
                {c.desc(activite)}
              </p>

              {/* CTA */}
              <Btn
                onClick={() => handleChoix(c)}
                variant={isRecommended ? 'primary' : 'ghost'}
                className="w-full mt-1"
                iconRight="arrow"
              >
                {c.cta}
              </Btn>
            </div>
          );
        })}
      </div>

      {/* Skip */}
      <div className="px-5 pb-10 text-center">
        <button
          onClick={() => onDone('dashboard')}
          className="text-[13px] text-g400 font-semibold py-2 active:opacity-70 transition"
        >
          Explorer mon espace directement
        </button>
      </div>
    </div>
  );
}
