import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, AppHeader } from '../components/ui';

/* ── Registre des questions (clé → config) ── */
const Q = {
  ppsd_premier_client: {
    question: "Comment as-tu eu ton premier client ? Qu'est-ce qui s'est passé ?",
    placeholder: "Raconte le contexte, comment il t'a trouvé, ce qu'il cherchait…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, lieux_cible: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('lieux_cible').eq('user_id', uid).single(); return data?.lieux_cible || ''; },
  },
  ppsd_ce_quils_disent: {
    question: "Quelle phrase tes clients répètent-ils souvent ? Quel problème revient dans leurs propres mots ?",
    placeholder: "Ex: 'Je n'ai pas le temps', 'Je ne sais pas comment trouver des clients'…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, problemes: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('problemes').eq('user_id', uid).single(); return data?.problemes || ''; },
  },
  ppsd_peur: {
    question: "Qu'est-ce qui empêche tes prospects de passer à l'achat ? Quelle est leur peur principale ?",
    placeholder: "Ex: peur de dépenser sans résultat, peur que ça ne marche pas pour eux…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, peurs: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('peurs').eq('user_id', uid).single(); return data?.peurs || ''; },
  },
  ppsd_reve: {
    question: "Si ton client idéal pouvait changer une seule chose dans son business ou sa vie, ce serait quoi ?",
    placeholder: "Ex: avoir plus de temps, gagner plus sans travailler plus, être reconnu dans son domaine…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, souhaits: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('souhaits').eq('user_id', uid).single(); return data?.souhaits || ''; },
  },
  ppsd_desir: {
    question: "Qu'est-ce que ton client désire profondément — pas juste ce qu'il veut, mais ce qu'il ressent au fond ?",
    placeholder: "Ex: être fier de lui, prouver que c'est possible, laisser une trace…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, desirs: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('desirs').eq('user_id', uid).single(); return data?.desirs || ''; },
  },
  ppsd_declencheurs: {
    question: "Sur quels sujets tes clients réagissent-ils le plus fort ? (likes, partages, commentaires, messages)",
    placeholder: "Ex: les témoignages de réussite, les conseils pratiques, les erreurs à éviter…",
    save: async (uid, val) => supabase.from('ppsd').upsert({ user_id: uid, declencheurs: val }, { onConflict: 'user_id' }),
    load: async (uid) => { const { data } = await supabase.from('ppsd').select('declencheurs').eq('user_id', uid).single(); return data?.declencheurs || ''; },
  },
  canal: {
    question: "Sur quel réseau sont principalement tes clients ?",
    placeholder: "Ex: Facebook, Instagram, WhatsApp, TikTok…",
    save: async (uid, val) => supabase.from('profiles').update({ canal_principal: val }).eq('id', uid),
    load: async (uid) => { const { data } = await supabase.from('profiles').select('canal_principal').eq('id', uid).single(); return data?.canal_principal || ''; },
  },
  offre: {
    question: "Décris ton produit ou service principal en une phrase. Qu'est-ce qu'il change pour ton client ?",
    placeholder: "Ex: j'aide les commerçants à doubler leurs ventes sans augmenter leur charge de travail…",
    save: async (uid, val) => supabase.from('profiles').update({ activite: val }).eq('id', uid),
    load: async (uid) => { const { data } = await supabase.from('profiles').select('activite').eq('id', uid).single(); return data?.activite || ''; },
  },
  challenge_contact: {
    type: 'challenge',
    message: "Tu n'as pas encore toutes les réponses ? C'est normal — et c'est une bonne nouvelle.",
    action: "Pense à un client que tu as servi récemment. Envoie-lui un message aujourd'hui et pose-lui une question directement liée à ce que tu lui as vendu : est-ce que ça lui a vraiment été utile ? Qu'est-ce qu'il changerait ? Ce qu'il va te dire va t'apprendre plus sur ta cible que n'importe quelle formation. Reviens ici compléter les champs quand tu as ses réponses.",
  },
};

/* ── Métadonnées des livres ── */
const BOOKS = [
  {
    id: 'framework',
    file: '/methode/framework.md',
    title: 'Framework ATTRACTOR',
    subtitle: 'La base de tout',
    desc: "Visibilité, offre irrésistible, PPSD. Le socle sur lequel tout repose.",
    num: '01',
    color: 'bg-orange text-white',
  },
  {
    id: '3-secrets',
    file: '/methode/3-secrets.txt',
    title: 'Les 3 Secrets',
    subtitle: 'Bientôt disponible',
    desc: "Communauté, visibilité, conviction de masse. Les fondations d'une marque qui dure.",
    num: '02',
    color: 'bg-growth text-white',
    comingSoon: true,
    teaser: "Comment Roger Fulgence Kassy a changé ma vision de la Marque. Un ebook sur la puissance du nom.",
  },
  {
    id: 'boost',
    file: '/methode/boost-ta-marque.txt',
    title: 'Boost ta Marque',
    subtitle: 'Bientôt disponible',
    desc: "Mindset, vision, positionnement. Les 4 dimensions pour DEVENIR une marque.",
    num: '03',
    color: 'bg-[#1a3a6e] text-white',
    comingSoon: true,
    teaser: "Le programme complet. De l'idée à la marque qui s'impose dans son couloir.",
  },
  {
    id: 'organisation',
    file: '/methode/organisation-7-jours.txt',
    title: 'Organisation 7 Jours',
    subtitle: 'Bientôt disponible',
    desc: "Koffi & Awa te guident pour documenter tes procédures et reprendre le contrôle.",
    num: '04',
    color: 'bg-[#5b21b6] text-white',
    comingSoon: true,
    teaser: "Comment passer d'une entreprise qui dépend de toi à un système qui tourne sans toi.",
  },
  {
    id: 'methode-2026',
    file: '/methode/methode-2026.txt',
    title: 'La Méthode ATTRACTOR',
    subtitle: 'Bientôt disponible',
    desc: "Le système complet. Tout ce que Mac Arthur a validé sur le terrain depuis 10 ans.",
    num: '05',
    color: 'bg-charbon text-white',
    comingSoon: true,
    teaser: "10 ans de terrain résumés en un système. Pour ceux qui veulent devenir le numéro 1 dans leur couloir.",
  },
];

/* ── Parser Markdown ── */
function parseMarkdown(raw) {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks = [];
  let paraLines = [];

  const flushPara = () => {
    if (paraLines.length) {
      const text = paraLines.join(' ').trim();
      if (text) blocks.push({ type: 'para', text: renderInline(text) });
      paraLines = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) { flushPara(); continue; }

    if (line.startsWith('# '))    { flushPara(); continue; }
    if (line.startsWith('## '))   { flushPara(); blocks.push({ type: 'h2', text: line.slice(3).trim() }); continue; }
    if (line.startsWith('### '))  { flushPara(); blocks.push({ type: 'h3', text: line.slice(4).trim() }); continue; }
    if (line.startsWith('---'))   { flushPara(); blocks.push({ type: 'divider' }); continue; }
    if (line.startsWith('> '))    { flushPara(); blocks.push({ type: 'quote', text: renderInline(line.slice(2).trim()) }); continue; }
    if (/^[-*] /.test(line))      { flushPara(); blocks.push({ type: 'li', text: renderInline(line.slice(2).trim()) }); continue; }
    if (/^\d+\. /.test(line))     { flushPara(); blocks.push({ type: 'li', text: renderInline(line.replace(/^\d+\.\s/, '').trim()) }); continue; }

    // Marqueurs de questions interactives : [Q:key]
    const qMatch = line.trim().match(/^\[Q:(\w+)\]$/);
    if (qMatch) {
      flushPara();
      const key = qMatch[1];
      const def = Q[key];
      if (def) blocks.push({ type: def.type === 'challenge' ? 'challenge' : 'question', key, ...def });
      continue;
    }

    paraLines.push(line.trim());
  }
  flushPara();
  return blocks;
}

function renderInline(text) {
  // On garde le texte brut — le gras sera rendu via un split côté JSX
  return text;
}


/* ── Composant question interactive ── */
function QuestionBlock({ questionDef, userId }) {
  const [answer, setAnswer]     = useState('');
  const [existing, setExisting] = useState('');
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!userId || !questionDef.load) return;
    questionDef.load(userId).then(v => { if (v) setExisting(v); });
  }, [userId]);

  const handleSave = async () => {
    if (!answer.trim() || !userId) return;
    setSaving(true);
    await questionDef.save(userId, answer.trim());
    setExisting(answer.trim());
    setAnswer('');
    setSaved(true);
    setSaving(false);
  };

  return (
    <div className="border border-orange/25 rounded-[18px] p-4 flex flex-col gap-3" style={{ background: 'rgba(242,92,5,0.04)' }}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-orange flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <p className="font-display font-bold text-[11px] text-orange uppercase tracking-widest">À toi de jouer</p>
      </div>
      <p className="font-display font-semibold text-[15px] text-charbon leading-snug">{questionDef.question}</p>

      {existing && !saved && (
        <div className="bg-white border border-g200 rounded-xl px-3 py-2">
          <p className="text-[11px] text-g400 mb-0.5">Déjà noté</p>
          <p className="text-[13px] text-g700 leading-snug">{existing}</p>
        </div>
      )}

      <textarea
        value={answer}
        onChange={e => { setAnswer(e.target.value); setSaved(false); }}
        placeholder={questionDef.placeholder}
        rows={2}
        className="w-full bg-white border-[1.5px] border-g200 rounded-xl px-3 py-2.5 text-[13.5px] outline-none focus:border-orange resize-none transition"
      />

      <div className="flex items-center justify-between gap-3">
        {saved
          ? <span className="text-[12px] text-growth font-semibold">Enregistré — Awa s'en souvient</span>
          : <span className="text-[11px] text-g400">Ta réponse enrichit ton dossier client</span>
        }
        <button
          onClick={handleSave}
          disabled={!answer.trim() || saving}
          className="flex-shrink-0 bg-orange text-white font-bold text-[13px] px-4 py-2 rounded-xl disabled:opacity-40 transition active:scale-95">
          {saving ? '…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

/* ── Rendu inline bold ── */
function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="font-bold text-charbon">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

/* ── Écran principal ── */
export function MéthodeScreen({ go }) {
  const [reading, setReading]   = useState(null);
  const [content, setContent]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadErr, setLoadErr]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId]     = useState(null);
  const [votes, setVotes]       = useState({});
  const [voting, setVoting]     = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUserId(user.id); });
    loadVotes();
  }, []);

  const loadVotes = async () => {
    const { data } = await supabase.from('methode_votes').select('book_id, count').then(r => r).catch(() => ({ data: null }));
    if (data) {
      const map = {};
      data.forEach(v => { map[v.book_id] = v.count; });
      setVotes(map);
    }
  };

  const vote = async (bookId) => {
    if (!userId || voting) return;
    setVoting(bookId);
    await supabase.from('methode_votes').upsert({ user_id: userId, book_id: bookId }, { onConflict: 'user_id,book_id' }).catch(() => {});
    setVotes(v => ({ ...v, [bookId]: (v[bookId] || 0) + 1 }));
    setVoting(null);
  };

  const openBook = async (book) => {
    setReading(book);
    setContent([]);
    setLoadErr(false);
    setLoading(true);
    setProgress(0);
    try {
      const res = await fetch(book.file);
      if (!res.ok) throw new Error();
      const text = await res.text();
      const blocks = parseMarkdown(text);
      setContent(blocks);
    } catch { setLoadErr(true); }
    setLoading(false);
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setProgress(Math.min(100, Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100)));
  };

  /* ── Lecture ── */
  if (reading) {
    return (
      <div className="min-h-full bg-sable flex flex-col">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-g200">
          <div className="px-[18px] pt-5 pb-3 flex items-center gap-3">
            <button onClick={() => setReading(null)} className="w-9 h-9 rounded-full bg-sable flex items-center justify-center flex-shrink-0">
              <Icon name="back" size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-display font-extrabold text-[15px] text-charbon truncate">{reading.title}</div>
              <div className="text-[11px] text-g400">{reading.subtitle}</div>
            </div>
            <span className="text-[12px] font-bold text-orange flex-shrink-0">{progress}%</span>
          </div>
          <div className="h-[3px] bg-g200">
            <div className="h-full bg-orange transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-6 py-8 flex flex-col gap-6 max-w-[640px] mx-auto">
            {loading && <p className="text-center text-[14px] text-g400 py-16">Chargement…</p>}
            {loadErr && <p className="text-center text-[14px] text-g400 py-16">Impossible de charger ce contenu.</p>}

            {!loading && !loadErr && content.map((block, i) => {
              if (block.type === 'h2') return (
                <div key={i} className="mt-4 first:mt-0 flex flex-col gap-2">
                  <div className="w-8 h-[3px] bg-orange rounded-full" />
                  <h2 className="font-display font-extrabold text-[19px] text-charbon leading-snug">
                    <InlineText text={block.text} />
                  </h2>
                </div>
              );

              if (block.type === 'h3') return (
                <h3 key={i} className="font-display font-bold text-[16px] text-charbon mt-2 leading-snug">
                  <InlineText text={block.text} />
                </h3>
              );

              if (block.type === 'divider') return (
                <div key={i} className="border-t border-g200 my-2" />
              );

              if (block.type === 'quote') return (
                <div key={i} className="border-l-4 border-orange pl-4 py-1">
                  <p className="text-[14.5px] text-g700 italic leading-[1.8]">
                    <InlineText text={block.text} />
                  </p>
                </div>
              );

              if (block.type === 'li') return (
                <div key={i} className="flex gap-3 items-start -mt-3">
                  <span className="text-orange font-extrabold text-[14px] mt-[4px] flex-shrink-0">→</span>
                  <p className="text-[15px] text-g700 leading-[1.8]"><InlineText text={block.text} /></p>
                </div>
              );

              if (block.type === 'question') return (
                <QuestionBlock key={`q-${i}-${block.key}`} questionDef={block} userId={userId} />
              );

              if (block.type === 'challenge') return (
                <div key={i} className="bg-charbon rounded-[18px] p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber flex-shrink-0" />
                    <p className="font-display font-bold text-[11px] text-amber uppercase tracking-widest">Défi</p>
                  </div>
                  <p className="text-[14px] text-white/75 leading-relaxed">{block.message}</p>
                  <p className="text-[14.5px] text-white font-medium leading-[1.75]">{block.action}</p>
                </div>
              );

              return (
                <p key={i} className="text-[15px] text-g700 leading-[1.85]">
                  <InlineText text={block.text} />
                </p>
              );
            })}
            <div className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Liste des livres ── */
  return (
    <div className="min-h-full bg-sable pb-6">
      <AppHeader title="La Méthode" sub="Écrits de Mac Arthur · Accès libre" onBack={() => go('dashboard')} />

      <div className="px-[18px] flex flex-col gap-3">
        <p className="text-[13px] text-g400 leading-relaxed mb-1">
          10 ans de terrain, condensés pour toi. Lis à ton rythme.
        </p>

        {BOOKS.map(book => (
          <div key={book.id}>
            {book.comingSoon ? (
              <div className="bg-white border border-g200 rounded-[20px] shadow-soft overflow-hidden opacity-80">
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-[15px] flex-shrink-0 ${book.color} opacity-40`}>
                    {book.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-display font-extrabold text-[15px] text-g400 leading-snug">{book.title}</div>
                      <span className="text-[10px] font-bold bg-g100 text-g500 px-2 py-0.5 rounded-full flex-shrink-0">Bientôt</span>
                    </div>
                    <p className="text-[12.5px] text-g400 mt-1 leading-snug">{book.teaser}</p>
                  </div>
                </div>
                <button
                  onClick={() => vote(book.id)}
                  disabled={!!voting}
                  className="w-full border-t border-g200 px-4 py-3 flex items-center justify-between bg-sable/50 active:bg-g100 transition">
                  <span className="text-[13px] font-bold text-orange">
                    {votes[book.id] ? `${votes[book.id]} personne${votes[book.id] > 1 ? 's attendent' : ' attend'} ce livre` : 'Je veux ce livre en premier'}
                  </span>
                  <Icon name="arrow" size={16} className="text-orange flex-shrink-0" />
                </button>
              </div>
            ) : (
              <button onClick={() => openBook(book)}
                className="w-full text-left bg-white border border-g200 rounded-[20px] shadow-soft p-4 flex items-center gap-4 active:scale-[.99] transition">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-[15px] flex-shrink-0 ${book.color}`}>
                  {book.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-extrabold text-[15px] text-charbon leading-snug">{book.title}</div>
                  <div className="text-[11.5px] text-orange font-semibold mt-0.5">{book.subtitle}</div>
                  <div className="text-[12.5px] text-g400 mt-1 leading-snug line-clamp-2">{book.desc}</div>
                </div>
                <Icon name="chevron" size={18} className="text-g300 flex-shrink-0" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
