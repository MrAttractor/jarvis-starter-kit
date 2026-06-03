import { useState } from 'react';
import { Logo, Btn } from '../components/ui';

export function detectPlatform() {
  const ua = navigator.userAgent || '';
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) return 'installed';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  if (!isIOS && !isAndroid) return 'desktop';
  if (isIOS) return /CriOS|FxiOS/i.test(ua) ? 'ios-not-safari' : 'ios';
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'android-chrome';
  return 'android-other';
}

const CONFIG = {
  ios: {
    badge: 'iPhone · Safari',
    steps: [
      { icon: 'share',    title: "Tape l'icône Partager",                  detail: 'Le carré avec la flèche, en bas de Safari' },
      { icon: 'plus-box', title: 'Sélectionne "Sur l\'écran d\'accueil"', detail: 'Fais défiler vers le bas si besoin' },
      { icon: 'check',    title: 'Tape "Ajouter" en haut à droite',        detail: "Et c'est bon — Attractor est sur ton téléphone !" },
    ],
  },
  'ios-not-safari': {
    badge: 'iPhone · ouvre Safari',
    steps: [
      { icon: 'globe',    title: 'Ouvre cette page dans Safari',                   detail: "Seul Safari permet l'installation sur iPhone" },
      { icon: 'share',    title: 'Tape le bouton Partager',                        detail: 'Le carré avec la flèche en bas de Safari' },
      { icon: 'plus-box', title: '"Sur l\'écran d\'accueil" puis "Ajouter"',       detail: '' },
    ],
  },
  'android-chrome': {
    badge: 'Android · Chrome',
    steps: [
      { icon: 'dots',     title: 'Tape les 3 points en haut à droite',    detail: 'Coin supérieur droit de Chrome' },
      { icon: 'plus-box', title: "Tape \"Installer l'application\"",       detail: 'Ou "Ajouter à l\'écran d\'accueil"' },
      { icon: 'check',    title: "Confirme l'installation",                detail: '' },
    ],
  },
  samsung: {
    badge: 'Android · Samsung Internet',
    steps: [
      { icon: 'menu',     title: "Tape les 3 lignes en bas de l'écran",   detail: 'La barre de navigation Samsung Internet' },
      { icon: 'plus-box', title: 'Sélectionne "Installer"',               detail: 'Dans le menu qui apparaît' },
      { icon: 'check',    title: 'Confirme',                              detail: '' },
    ],
  },
  'android-other': {
    badge: 'Android',
    steps: [
      { icon: 'dots',     title: 'Ouvre le menu de ton navigateur',                detail: 'Les 3 points ou les 3 lignes' },
      { icon: 'plus-box', title: 'Cherche "Ajouter à l\'écran d\'accueil"',       detail: '' },
      { icon: 'check',    title: "Confirme l'installation",                        detail: '' },
    ],
  },
};

// ── Icônes des étapes ─────────────────────────────────────────────────────────

function StepIcon({ name }) {
  const paths = {
    share: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M12 11V5M9.5 7.5 12 5l2.5 2.5"/></>,
    'plus-box': <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="M7.5 12.5 10.5 15.5 16.5 9"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 3c-2.5 3.5-2.5 9.5 0 18M12 3c2.5 3.5 2.5 9.5 0 18"/></>,
    dots: <><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  }[name];

  if (!paths) return null;
  return (
    <div className="flex-shrink-0 w-9 h-9 bg-orange/10 rounded-[10px] flex items-center justify-center text-orange">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {paths}
      </svg>
    </div>
  );
}

// ── Illustrations SVG ─────────────────────────────────────────────────────────

function PhoneIllustration({ platform }) {
  if (platform === 'ios' || platform === 'ios-not-safari') {
    return (
      <div className="relative inline-block">
        <svg width="280" height="60" viewBox="0 0 280 60" fill="none">
          <rect x="1" y="1" width="278" height="58" rx="12" fill="white" stroke="#e2e0da" strokeWidth="1.5"/>
          {/* Back arrow */}
          <path d="M22 28l-6 4 6 4" stroke="#c5c2bb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Forward arrow */}
          <path d="M40 28l6 4-6 4" stroke="#c5c2bb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          {/* URL bar */}
          <rect x="54" y="21" width="112" height="18" rx="9" fill="#f5f4f0"/>
          {/* SHARE — highlighted */}
          <rect x="178" y="16" width="30" height="28" rx="7" fill="#FFF0E8" stroke="#F25C05" strokeWidth="1.5"/>
          <rect x="184" y="26" width="18" height="12" rx="3" stroke="#F25C05" strokeWidth="1.5"/>
          <path d="M193 26v-9M190 20l3-3 3 3" stroke="#F25C05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Tap ring */}
          <circle cx="193" cy="30" r="21" stroke="#F25C05" strokeWidth="1.5" strokeDasharray="5 3"/>
          {/* Bookmarks */}
          <path d="M224 20v18l7-4 7 4V20z" stroke="#c5c2bb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Tabs */}
          <rect x="256" y="22" width="16" height="14" rx="4" stroke="#c5c2bb" strokeWidth="1.5"/>
        </svg>
        <span className="absolute top-[-9px] left-[171px] bg-orange text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap">
          Tape ici
        </span>
      </div>
    );
  }

  if (platform === 'android-chrome' || platform === 'android-other') {
    return (
      <div className="relative inline-block">
        <svg width="280" height="54" viewBox="0 0 280 54" fill="none">
          <rect x="1" y="1" width="278" height="52" rx="12" fill="#f5f4f0" stroke="#e2e0da" strokeWidth="1.5"/>
          {/* URL bar */}
          <rect x="12" y="12" width="210" height="30" rx="10" fill="white" stroke="#e2e0da" strokeWidth="1"/>
          <circle cx="28" cy="27" r="6" fill="#e2e0da"/>
          <rect x="40" y="23" width="90" height="8" rx="4" fill="#e2e0da"/>
          {/* 3 DOTS — highlighted */}
          <circle cx="250" cy="27" r="19" fill="#FFF0E8" stroke="#F25C05" strokeWidth="1.5"/>
          <circle cx="244" cy="27" r="2.5" fill="#F25C05"/>
          <circle cx="250" cy="27" r="2.5" fill="#F25C05"/>
          <circle cx="256" cy="27" r="2.5" fill="#F25C05"/>
          {/* Tap ring */}
          <circle cx="250" cy="27" r="25" stroke="#F25C05" strokeWidth="1.5" strokeDasharray="5 3"/>
        </svg>
        <span className="absolute top-[2px] right-[-10px] bg-orange text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap">
          Tape ici
        </span>
      </div>
    );
  }

  if (platform === 'samsung') {
    return (
      <div className="relative inline-block">
        <svg width="280" height="56" viewBox="0 0 280 56" fill="none">
          <rect x="1" y="1" width="278" height="54" rx="12" fill="#f5f4f0" stroke="#e2e0da" strokeWidth="1.5"/>
          {/* Back */}
          <path d="M40 26l-8 5 8 5" stroke="#c5c2bb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Home circle */}
          <circle cx="140" cy="28" r="9" stroke="#c5c2bb" strokeWidth="1.8"/>
          {/* HAMBURGER — highlighted */}
          <circle cx="240" cy="28" r="19" fill="#FFF0E8" stroke="#F25C05" strokeWidth="1.5"/>
          <path d="M230 23h20M230 28h20M230 33h20" stroke="#F25C05" strokeWidth="2" strokeLinecap="round"/>
          {/* Tap ring */}
          <circle cx="240" cy="28" r="25" stroke="#F25C05" strokeWidth="1.5" strokeDasharray="5 3"/>
        </svg>
        <span className="absolute bottom-[5px] right-[-10px] bg-orange text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md pointer-events-none whitespace-nowrap">
          Tape ici
        </span>
      </div>
    );
  }

  return null;
}

// ── Étape numérotée ───────────────────────────────────────────────────────────

function InstallStep({ number, icon, title, detail }) {
  return (
    <div className="flex items-start gap-3.5 p-3.5 bg-white rounded-[16px] border border-g200">
      <div className="w-7 h-7 rounded-full bg-orange text-white font-display font-extrabold text-[13px] flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-[14.5px] text-charbon leading-snug">{title}</p>
        {detail && <p className="text-[12.5px] text-g400 mt-0.5 leading-snug">{detail}</p>}
      </div>
      <StepIcon name={icon} />
    </div>
  );
}

// ── Guide d'installation ──────────────────────────────────────────────────────

export function InstallGuide({ platform, prenom, nomAssistant, installPromptRef, onDone }) {
  const [installing, setInstalling] = useState(false);

  if (platform === 'installed') {
    return (
      <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
        <Logo size="sm" />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-[fadeUp_.4s_ease]">
          <div className="w-20 h-20 rounded-full bg-orange/10 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F25C05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/><path d="M7.5 12.5 10.5 15.5 16.5 9"/>
            </svg>
          </div>
          <div className="text-center">
            <h2 className="font-display font-extrabold text-[22px] text-charbon">C'est déjà fait !</h2>
            <p className="text-[15px] text-g700 mt-2">Attractor est sur ton écran d'accueil.</p>
          </div>
        </div>
        <Btn onClick={onDone} className="w-full" iconRight="arrow">Retour</Btn>
      </div>
    );
  }

  const config = CONFIG[platform] || CONFIG['android-other'];
  const canNativeInstall = platform === 'android-chrome' && !!installPromptRef?.current;

  const handleNativeInstall = async () => {
    if (!installPromptRef?.current) { onDone(); return; }
    setInstalling(true);
    try {
      installPromptRef.current.prompt();
      await installPromptRef.current.userChoice;
      installPromptRef.current = null;
    } catch {}
    setInstalling(false);
    onDone();
  };

  return (
    <div className="min-h-screen flex flex-col bg-sable px-6 pt-10 pb-8">
      <Logo size="sm" />

      <div className="flex-1 flex flex-col mt-5 animate-[fadeUp_.4s_ease]">
        {/* App icon hero */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-[20px] border border-g200 shadow-soft">
          <img src="/icon-192.png" alt="Attractor" className="w-16 h-16 rounded-[18px] shadow-[0_6px_20px_-4px_rgba(242,92,5,.4)]" />
          <div>
            <p className="font-display font-extrabold text-[18px] text-charbon">Attractor</p>
            <p className="text-[12.5px] text-g400 mt-0.5">Votre Chief of Staff numérique</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange" />
              <span className="text-[11.5px] font-bold text-orange">{config.badge}</span>
            </div>
          </div>
        </div>

        <h2 className="font-display font-extrabold text-[24px] leading-[1.2] text-charbon">
          Une dernière étape, {prenom}.
        </h2>
        <p className="text-[15px] text-g700 mt-2 mb-6 leading-relaxed">
          Installe l'app sur ton écran d'accueil.{' '}
          <span className="font-bold text-charbon">Mr Attractor sera disponible en 1 tap, tout le temps.</span>
        </p>

        <div className="flex justify-center mb-6 overflow-x-auto">
          <PhoneIllustration platform={platform} />
        </div>

        {canNativeInstall ? (
          <div className="p-4 bg-orange/8 border border-orange/20 rounded-[18px]">
            <p className="text-[14px] text-[#a23c00] leading-relaxed">
              <span className="font-bold">Bonne nouvelle :</span> ton navigateur peut
              installer l'app en un tap. Appuie sur le bouton ci-dessous.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {config.steps.map((s, i) => (
              <InstallStep key={i} number={i + 1} {...s} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {canNativeInstall ? (
          <Btn onClick={handleNativeInstall} className="w-full" disabled={installing}>
            {installing ? 'Installation…' : `Installer ${nomAssistant} maintenant`}
          </Btn>
        ) : (
          <Btn onClick={onDone} className="w-full" iconRight="arrow">
            C'est fait, on entre !
          </Btn>
        )}
        <button
          onClick={onDone}
          className="text-center text-[13px] text-g400 font-semibold py-2 active:opacity-70 transition"
        >
          {canNativeInstall ? "Passer pour l'instant" : 'Je le ferai plus tard'}
        </button>
      </div>
    </div>
  );
}
