import { useState, useEffect, useRef } from 'react';
import { Icon, AppHeader } from '../components/ui';

const BOOKS = [
  {
    id: 'framework',
    file: '/methode/framework.txt',
    title: 'Framework ATTRACTOR',
    subtitle: 'La base de tout',
    desc: 'Visibilité, offre irrésistible, PPSD. Le socle sur lequel tout repose.',
    color: 'from-orange to-orange-light',
    icon: '🧭',
  },
  {
    id: '3-secrets',
    file: '/methode/3-secrets.txt',
    title: 'Les 3 Secrets',
    subtitle: 'Bâtir une Marque puissante',
    desc: 'Communauté, visibilité, conviction de masse. Les fondations d\'une marque qui dure.',
    color: 'from-[#1E5631] to-[#2d7a47]',
    icon: '🔑',
  },
  {
    id: 'boost',
    file: '/methode/boost-ta-marque.txt',
    title: 'Boost ta Marque',
    subtitle: 'Programme complet',
    desc: 'Mindset, vision, positionnement. Les 4 dimensions pour DEVENIR une marque.',
    color: 'from-[#1a3a6e] to-[#2550a0]',
    icon: '🚀',
  },
  {
    id: 'organisation',
    file: '/methode/organisation-7-jours.txt',
    title: 'Organisation 7 Jours',
    subtitle: 'Manuel de procédures',
    desc: 'Koffi & Awa te guident pour documenter tes procédures et reprendre le contrôle.',
    color: 'from-[#7c3aed] to-[#a855f7]',
    icon: '📋',
  },
  {
    id: 'methode-2026',
    file: '/methode/methode-2026.txt',
    title: 'La Méthode ATTRACTOR',
    subtitle: 'Version 2026',
    desc: 'Le système complet. Tout ce que Mac Arthur a validé sur le terrain depuis 10 ans.',
    color: 'from-charbon to-[#3a342e]',
    icon: '⚡',
  },
];

function parseContent(text) {
  const lines = text.split('\n');
  const blocks = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length) { blocks.push({ type: 'para', text: current.join(' ') }); current = []; }
      continue;
    }
    const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length > 4 && /[A-ZÀ-Ü]/.test(trimmed);
    if (isHeading) {
      if (current.length) { blocks.push({ type: 'para', text: current.join(' ') }); current = []; }
      blocks.push({ type: 'heading', text: trimmed });
    } else {
      current.push(trimmed);
    }
  }
  if (current.length) blocks.push({ type: 'para', text: current.join(' ') });
  return blocks;
}

export function MéthodeScreen({ go }) {
  const [reading, setReading] = useState(null); // book en cours de lecture
  const [content, setContent] = useState([]);
  const [loadErr, setLoadErr] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);

  const openBook = async (book) => {
    setReading(book);
    setContent([]);
    setLoadErr(false);
    setProgress(0);
    try {
      const res = await fetch(book.file);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setContent(parseContent(text));
    } catch {
      setLoadErr(true);
    }
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setProgress(Math.min(100, Math.round(pct * 100)));
  };

  if (reading) {
    return (
      <div className="min-h-full bg-sable flex flex-col">
        {/* Header avec barre de progression */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-g200">
          <div className="px-[18px] pt-5 pb-3 flex items-center gap-3">
            <button onClick={() => setReading(null)} className="w-9 h-9 rounded-full bg-sable flex items-center justify-center flex-shrink-0">
              <Icon name="back" size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-display font-extrabold text-[15px] truncate">{reading.title}</div>
              <div className="text-[11px] text-g400">{reading.subtitle}</div>
            </div>
            <span className="text-[12px] font-bold text-orange flex-shrink-0">{progress}%</span>
          </div>
          {/* Barre de progression */}
          <div className="h-[3px] bg-g200">
            <div className="h-full bg-orange transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Contenu */}
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-[22px] py-6 flex flex-col gap-4">
          {loadErr ? (
            <p className="text-center text-[13px] text-g400 py-12">Impossible de charger ce contenu.</p>
          ) : content.length === 0 ? (
            <p className="text-center text-[13px] text-g400 py-12">Chargement…</p>
          ) : (
            content.map((block, i) =>
              block.type === 'heading' ? (
                <h2 key={i} className="font-display font-extrabold text-[16px] text-charbon mt-4 first:mt-0 leading-snug">
                  {block.text}
                </h2>
              ) : (
                <p key={i} className="text-[14px] text-g700 leading-relaxed">
                  {block.text}
                </p>
              )
            )
          )}
          <div className="h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-sable pb-6">
      <AppHeader title="La Méthode" sub="Écrits de Mac Arthur · Accès libre" onBack={() => go('dashboard')} />

      <div className="px-[18px] flex flex-col gap-3">
        <p className="text-[13px] text-g400 leading-relaxed mb-1">
          10 ans de terrain, condensés pour toi. Lis à ton rythme.
        </p>

        {BOOKS.map(book => (
          <button key={book.id} onClick={() => openBook(book)}
            className="w-full text-left rounded-[20px] overflow-hidden shadow-soft border border-g200 active:scale-[.99] transition">
            {/* Bandeau coloré */}
            <div className={`bg-gradient-to-r ${book.color} px-5 py-4 flex items-center gap-3`}>
              <span className="text-[28px] leading-none">{book.icon}</span>
              <div>
                <div className="font-display font-extrabold text-[16px] text-white leading-tight">{book.title}</div>
                <div className="text-[12px] text-white/75 mt-0.5">{book.subtitle}</div>
              </div>
              <Icon name="arrow" size={18} className="ml-auto text-white/60 flex-shrink-0" />
            </div>
            {/* Description */}
            <div className="bg-white px-5 py-3">
              <p className="text-[13px] text-g700 leading-snug">{book.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
