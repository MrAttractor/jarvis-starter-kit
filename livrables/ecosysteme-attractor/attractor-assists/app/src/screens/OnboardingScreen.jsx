import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';
import { InstallGuide, detectPlatform } from './InstallScreen';

// ── Composant barre de progression (étapes 5-8) ──────────────────────────────

function ProgressBar({ step, total = 4 }) {
  return (
    <div className="flex gap-1.5 px-4">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-orange' : 'bg-g200'}`} />
      ))}
    </div>
  );
}

// ── Bulle chat Assists ────────────────────────────────────────────────────────

function AssistBubble({ text, avatar = 'A' }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full bg-charbon text-white flex items-center justify-center font-display font-bold text-[12px] flex-shrink-0">
        {avatar}
      </div>
      <div className="bg-white px-4 py-3 rounded-[18px] rounded-tl-[4px] max-w-[82%] shadow-soft border border-g200">
        <p className="text-[14.5px] text-charbon leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-orange text-white px-4 py-2.5 rounded-[18px] rounded-tr-[4px] max-w-[82%] text-[14px] font-medium leading-relaxed">
        {text}
      </div>
    </div>
  );
}

// ── Bouton principal ──────────────────────────────────────────────────────────

function PrimaryBtn({ onClick, disabled, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 transition ${className}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function OnboardingScreen({ onDone, installPromptRef }) {
  const [phase, setPhase]       = useState('welcome');  // welcome|training|install|bapteme|anamnese|style|upload|validation|pret
  const [nomAss, setNomAss]     = useState('');
  const [prenom, setPrenom]     = useState('');
  const [baptemeQ, setBaptemeQ] = useState(0); // 0=attente prenom 1=attente nom_ass 2=done
  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // [{role:'assist'|'user', text}]
  const [anamnQ, setAnamnQ]     = useState(0); // 0..2
  const [anamnData, setAnamnData] = useState({});
  const [styleMsg, setStyleMsg]   = useState('');
  const [produits, setProduits]   = useState([]); // [{nom, prix, actif}]
  const [newProd, setNewProd]     = useState({ nom: '', prix: '' });
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState('');
  const inputRef = useRef(null);
  const chatRef  = useRef(null);

  // Questions anamnèse
  const ANAMN_QUESTIONS = [
    'Tu fais quoi exactement ? Décris-moi ton activité en quelques mots.',
    'Tu travailles où ? (Ville, quartier, ou tu livres partout ?)',
    'Tes clientes, elles commandent comment en ce moment ? (WhatsApp, en direct, réseaux sociaux…)',
  ];
  const ANAMN_KEYS = ['activite', 'zone', 'clients'];

  const assistName = nomAss || 'Assists';

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, phase]);

  // ── Sauvegarde finale ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveErr('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session perdue');

      const referralCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();

      await supabase.from('profiles').update({
        prenom: prenom.trim() || null,
        nom_assistant: (nomAss || 'Assists').trim(),
        activite: anamnData.activite || null,
        zone: anamnData.zone || null,
        onboarding_done: true,
        referral_code: referralCode,
      }).eq('id', user.id);

      if (Object.keys(anamnData).length > 0 || styleMsg) {
        await supabase.from('business_anamnese').upsert({
          user_id: user.id,
          clients: anamnData.clients || null,
          ce_quil_vend: styleMsg || null,
          activite_detectee: anamnData.activite || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }

      const actifsOnly = produits.filter(p => p.actif);
      if (actifsOnly.length > 0) {
        await supabase.from('produits_user').insert(
          actifsOnly.map(p => ({
            user_id: user.id,
            nom: p.nom.trim(),
            prix: parseInt(p.prix) || 0,
            actif: true,
          }))
        );
      }

      supabase.functions.invoke('generate-client-assistant', { body: { user_id: user.id } })
        .then(() => {}).catch(() => {});

      const refCode = localStorage.getItem('aa_ref');
      if (refCode && refCode !== referralCode) {
        const { data: referrer } = await supabase
          .from('profiles').select('id, referral_count')
          .eq('referral_code', refCode).neq('id', user.id).single();
        if (referrer) {
          await Promise.all([
            supabase.from('profiles').update({ referred_by: refCode }).eq('id', user.id),
            supabase.from('profiles').update({ referral_count: (referrer.referral_count || 0) + 1 }).eq('id', referrer.id),
          ]);
        }
        localStorage.removeItem('aa_ref');
      }

      setPhase('pret');
    } catch {
      setSaveErr('Une erreur est survenue. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  // ── 1. Welcome ───────────────────────────────────────────────────────────────

  if (phase === 'welcome') return (
    <div className="min-h-screen flex flex-col bg-sable px-5 pt-14 pb-10">
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-charbon flex items-center justify-center">
          <Icon name="spark" size={26} className="text-orange" />
        </div>
        <div>
          <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.12em] mb-3">
            Bienvenue dans Attractor Assists
          </p>
          <h1 className="font-display font-extrabold text-[28px] text-charbon leading-[1.2] mb-4">
            Ton bras droit IA est là.
          </h1>
          <div className="flex flex-col gap-3">
            {[
              { icon: 'chat',  text: 'Tu parles, il gère. Commandes, relances, messages — en 1 clic.' },
              { icon: 'send',  text: 'Tes clientes commandent sur ta boutique en ligne. Tu n\'as rien à faire.' },
              { icon: 'spark', text: 'Il apprend ton style et travaille exactement comme toi, en mieux.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-g200">
                <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} size={16} className="text-orange" />
                </div>
                <p className="text-[13.5px] text-charbon leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PrimaryBtn onClick={() => setPhase('training')}>
        Allons-y →
      </PrimaryBtn>
    </div>
  );

  // ── 2. Training WA + Assists ──────────────────────────────────────────────────

  if (phase === 'training') return (
    <div className="min-h-screen flex flex-col bg-sable">
      <div className="px-5 pt-14 pb-4">
        <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.12em] mb-2">Le tandem qui gagne</p>
        <h2 className="font-display font-extrabold text-[24px] text-charbon leading-[1.2]">
          WhatsApp + Assists,<br/>c'est ça la magie.
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
        {/* Comparatif WA vs Assists */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 py-3 border-b border-g200 bg-g100">
            <p className="text-[12px] font-bold text-g500 uppercase tracking-[.08em]">WhatsApp seul</p>
          </div>
          {[
            'Tu perds des commandes la nuit (tu dors, les clientes commandent)',
            'Tu réponds manuellement à chaque message',
            'Tu ne te souviens pas de tout',
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-g100 last:border-0">
              <span className="text-[14px] text-[#D64545] flex-shrink-0 mt-0.5">✕</span>
              <p className="text-[13px] text-g700">{t}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-vert/30 overflow-hidden shadow-soft">
          <div className="px-4 py-3 border-b border-vert/15 bg-vert/5">
            <p className="text-[12px] font-bold text-vert uppercase tracking-[.08em]">WhatsApp + Assists</p>
          </div>
          {[
            'Assists prend les commandes 24h/24 — même quand tu dors',
            'Il relance automatiquement les clientes inactives',
            'Il mémorise chaque cliente, chaque commande',
            'Tu ouvres l\'app le matin : tout est prêt',
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-vert/10 last:border-0">
              <span className="text-[14px] text-vert flex-shrink-0 mt-0.5">✓</span>
              <p className="text-[13px] text-charbon">{t}</p>
            </div>
          ))}
        </div>

        {/* Mini tuto */}
        <div className="bg-charbon rounded-2xl p-4 text-white">
          <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.1em] mb-3">Comment faire</p>
          {[
            { n: '1', t: 'Termine cet onboarding → ton lien boutique est prêt' },
            { n: '2', t: 'Copie ce lien dans ton message d\'accueil WhatsApp Business' },
            { n: '3', t: 'Active le message auto WA : "Salut ! Commande ici 👇"' },
            { n: '4', t: 'Tes clientes commandent, Assists gère tout' },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="w-6 h-6 rounded-full bg-orange text-white text-[11.5px] font-bold flex items-center justify-center flex-shrink-0">{item.n}</span>
              <p className="text-[13px] text-white/85 leading-snug">{item.t}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-10 pt-3">
        <PrimaryBtn onClick={() => setPhase('install')}>
          Continuer
        </PrimaryBtn>
      </div>
    </div>
  );

  // ── 3. Install guide ──────────────────────────────────────────────────────────

  if (phase === 'install') {
    const platform = detectPlatform();
    if (platform === 'installed' || platform === 'desktop') {
      setPhase('bapteme');
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <InstallGuide
            platform={platform}
            prenom={prenom}
            nomAssistant={assistName}
            installPromptRef={installPromptRef}
            onDone={() => setPhase('bapteme')}
          />
        </div>
        <div className="px-5 pb-10">
          <button
            onClick={() => setPhase('bapteme')}
            className="w-full py-3 text-[13px] font-semibold text-g500"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    );
  }

  // ── 4. Baptême mutuel ─────────────────────────────────────────────────────────

  const handleBaptemeSubmit = () => {
    if (!inputVal.trim()) return;
    if (baptemeQ === 0) {
      // Prenom
      const val = inputVal.trim();
      setPrenom(val);
      setChatHistory(h => [...h,
        { role: 'user', text: val },
        { role: 'assist', text: `Bien reçu, ${val} ! Et toi, tu veux m'appeler comment ? Donne-moi un petit nom — c'est toi le patron.` }
      ]);
      setInputVal('');
      setBaptemeQ(1);
    } else if (baptemeQ === 1) {
      // Nom assistant
      const val = inputVal.trim();
      setNomAss(val);
      setChatHistory(h => [...h,
        { role: 'user', text: val },
        { role: 'assist', text: `${val}, j'adore ! On va faire du bon travail ensemble. Maintenant dis-moi tout sur ton activité — je vais m'adapter à toi.` }
      ]);
      setInputVal('');
      setBaptemeQ(2);
    }
  };

  if (phase === 'bapteme') {
    const initHistory = chatHistory.length === 0 ? [
      { role: 'assist', text: 'Bonjour ! Je suis ton nouveau bras droit. Avant de commencer, j\'ai besoin de te connaître. Comment tu veux que je t\'appelle ?' }
    ] : chatHistory;

    return (
      <div className="min-h-screen flex flex-col bg-chatbg">
        {/* AppBar */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-g200">
          <div className="w-9 h-9 rounded-full bg-charbon text-white flex items-center justify-center font-display font-bold text-[13px] flex-shrink-0">A</div>
          <div>
            <div className="font-display font-bold text-[15px] text-charbon">Assists</div>
            <div className="text-[11.5px] text-vert font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-vert inline-block" /> En ligne
            </div>
          </div>
        </div>

        {/* Chat */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3" style={{ scrollbarWidth: 'none', background: '#EAE4D9' }}>
          {initHistory.map((m, i) => (
            m.role === 'assist'
              ? <AssistBubble key={i} text={m.text} />
              : <UserBubble key={i} text={m.text} />
          ))}

          {baptemeQ === 2 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => { setPhase('anamnese'); setAnamnQ(0); setChatHistory([]); }}
                className="px-6 py-3 rounded-2xl bg-orange text-white font-bold text-[14px] shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:opacity-80 transition"
              >
                Continuer
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        {baptemeQ < 2 && (
          <div className="px-4 pb-8 pt-3 bg-white border-t border-g200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBaptemeSubmit()}
              placeholder={baptemeQ === 0 ? 'Mon prénom ou surnom…' : 'Le nom de mon Assists…'}
              className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={handleBaptemeSubmit}
              disabled={!inputVal.trim()}
              className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center disabled:opacity-40 active:opacity-80 transition"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 5. Anamnèse ───────────────────────────────────────────────────────────────

  const handleAnamnSubmit = () => {
    if (!inputVal.trim()) return;
    const key = ANAMN_KEYS[anamnQ];
    const val = inputVal.trim();
    const newData = { ...anamnData, [key]: val };
    setAnamnData(newData);

    const newHistory = [...chatHistory, { role: 'user', text: val }];

    if (anamnQ < ANAMN_QUESTIONS.length - 1) {
      newHistory.push({ role: 'assist', text: ANAMN_QUESTIONS[anamnQ + 1] });
      setChatHistory(newHistory);
      setAnamnQ(anamnQ + 1);
    } else {
      // Anamnèse done
      newHistory.push({ role: 'assist', text: `Parfait ! Maintenant montre-moi comment tu écris. Envoie-moi un vrai message que tu enverrais à une cliente — comme si c'était WhatsApp.` });
      setChatHistory(newHistory);
      setPhase('style');
    }
    setInputVal('');
  };

  if (phase === 'anamnese') {
    const initHistory = chatHistory.length === 0 ? [
      { role: 'assist', text: ANAMN_QUESTIONS[0] }
    ] : chatHistory;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#EAE4D9' }}>
        <div className="px-4 pt-12 pb-3 bg-white border-b border-g200">
          <ProgressBar step={1} />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-charbon text-white flex items-center justify-center font-display font-bold text-[12px] flex-shrink-0">
              {(nomAss || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-display font-bold text-[14px] text-charbon">{assistName}</div>
              <div className="text-[11px] text-g400">Question {anamnQ + 1}/{ANAMN_QUESTIONS.length}</div>
            </div>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {initHistory.map((m, i) => (
            m.role === 'assist'
              ? <AssistBubble key={i} text={m.text} avatar={(nomAss || 'A').slice(0, 1).toUpperCase()} />
              : <UserBubble key={i} text={m.text} />
          ))}
        </div>

        <div className="px-4 pb-8 pt-3 bg-white border-t border-g200 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnamnSubmit()}
            placeholder="Réponds librement…"
            className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon outline-none focus:border-orange"
            autoFocus
          />
          <button
            onClick={handleAnamnSubmit}
            disabled={!inputVal.trim()}
            className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center disabled:opacity-40 active:opacity-80 transition"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── 6. Style ──────────────────────────────────────────────────────────────────

  if (phase === 'style') {
    const styleHistory = chatHistory.length > 0 ? chatHistory : [
      { role: 'assist', text: `Je vais apprendre à écrire comme toi, ${prenom}. Envoie-moi un vrai message que tu enverrais à une cliente — comme si c'était WhatsApp.` }
    ];

    const submitStyle = () => {
      if (!inputVal.trim()) return;
      const val = inputVal.trim();
      setStyleMsg(val);
      setChatHistory([...styleHistory, { role: 'user', text: val }, {
        role: 'assist', text: `Top ! J'ai capté ton style. Maintenant, montre-moi ce que tu vends — je vais créer ta boutique.`
      }]);
      setInputVal('');
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#EAE4D9' }}>
        <div className="px-4 pt-12 pb-3 bg-white border-b border-g200">
          <ProgressBar step={2} />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-charbon text-white flex items-center justify-center font-display font-bold text-[12px] flex-shrink-0">
              {(nomAss || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="font-display font-bold text-[14px] text-charbon">{assistName}</div>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {styleHistory.map((m, i) => (
            m.role === 'assist'
              ? <AssistBubble key={i} text={m.text} avatar={(nomAss || 'A').slice(0, 1).toUpperCase()} />
              : <UserBubble key={i} text={m.text} />
          ))}
          {styleMsg && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => { setPhase('upload'); setChatHistory([]); }}
                className="px-6 py-3 rounded-2xl bg-orange text-white font-bold text-[14px] shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:opacity-80 transition"
              >
                Créer ma boutique →
              </button>
            </div>
          )}
        </div>

        {!styleMsg && (
          <div className="px-4 pb-8 pt-3 bg-white border-t border-g200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitStyle()}
              placeholder="Ecris comme tu écrirais à ta cliente…"
              className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={submitStyle}
              disabled={!inputVal.trim()}
              className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center disabled:opacity-40 active:opacity-80 transition"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 7. Upload catalogue ───────────────────────────────────────────────────────

  const addProduit = () => {
    if (!newProd.nom.trim()) return;
    setProduits(p => [...p, { ...newProd, actif: true, id: Date.now() }]);
    setNewProd({ nom: '', prix: '' });
  };

  if (phase === 'upload') return (
    <div className="min-h-screen flex flex-col bg-sable">
      <div className="px-4 pt-12 pb-3 border-b border-g200 bg-white">
        <ProgressBar step={3} />
        <h2 className="font-display font-bold text-[19px] text-charbon mt-3">Crée ta boutique</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">Ajoute tes produits ou services.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {produits.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-g200 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] text-charbon">{p.nom}</div>
              {p.prix && <div className="text-[12.5px] text-orange font-semibold">{parseInt(p.prix).toLocaleString('fr-FR')} F</div>}
            </div>
            <button
              onClick={() => setProduits(ps => ps.filter((_, j) => j !== i))}
              className="w-8 h-8 rounded-lg bg-g100 flex items-center justify-center text-g400 active:bg-g200"
            >
              ×
            </button>
          </div>
        ))}

        <div className="bg-white rounded-xl border border-g200 p-4 flex flex-col gap-2.5">
          <input
            type="text"
            value={newProd.nom}
            onChange={e => setNewProd(p => ({ ...p, nom: e.target.value }))}
            placeholder="Nom du produit (ex : Attiéké poisson)"
            className="w-full px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon outline-none focus:border-orange"
          />
          <input
            type="number"
            value={newProd.prix}
            onChange={e => setNewProd(p => ({ ...p, prix: e.target.value }))}
            placeholder="Prix en FCFA (ex : 2000)"
            className="w-full px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon outline-none focus:border-orange"
          />
          <button
            onClick={addProduit}
            disabled={!newProd.nom.trim()}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-g200 text-[13px] font-bold text-g500 disabled:opacity-40 active:bg-g100 transition"
          >
            + Ajouter ce produit
          </button>
        </div>
      </div>

      <div className="px-4 pb-10 pt-3 flex flex-col gap-2">
        <PrimaryBtn
          onClick={() => setPhase('validation')}
          disabled={produits.length === 0}
        >
          Valider mon catalogue ({produits.length})
        </PrimaryBtn>
        {produits.length === 0 && (
          <button
            onClick={() => setPhase('validation')}
            className="text-center text-[13px] text-g400 font-semibold py-2"
          >
            Passer (j'ajouterai plus tard)
          </button>
        )}
      </div>
    </div>
  );

  // ── 8. Validation catalogue ───────────────────────────────────────────────────

  if (phase === 'validation') return (
    <div className="min-h-screen flex flex-col bg-sable">
      <div className="px-4 pt-12 pb-3 border-b border-g200 bg-white">
        <ProgressBar step={4} />
        <h2 className="font-display font-bold text-[19px] text-charbon mt-3">Valide ton catalogue</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">Active ou désactive chaque produit.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5" style={{ scrollbarWidth: 'none' }}>
        {produits.length === 0 ? (
          <div className="text-center py-12 text-g500 text-[14px]">
            Aucun produit ajouté.<br />Ton catalogue sera vide pour l'instant.
          </div>
        ) : (
          produits.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-g200 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] text-charbon">{p.nom}</div>
                {p.prix && <div className="text-[12.5px] text-orange">{parseInt(p.prix).toLocaleString('fr-FR')} F</div>}
              </div>
              <button
                onClick={() => setProduits(ps => ps.map((item, j) => j === i ? { ...item, actif: !item.actif } : item))}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition ${
                  p.actif ? 'bg-vert/10 text-vert' : 'bg-g100 text-g400'
                }`}
              >
                {p.actif ? 'Actif' : 'Inactif'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-4 pb-10 pt-3">
        <PrimaryBtn onClick={handleSave} disabled={saving}>
          {saving ? 'Création en cours…' : `Lancer mon Assists ${assistName ? '— ' + assistName : ''}`}
        </PrimaryBtn>
        {saveErr && <p className="text-center text-[12.5px] text-red-500 mt-2">{saveErr}</p>}
      </div>
    </div>
  );

  // ── 9. Prêt ───────────────────────────────────────────────────────────────────

  if (phase === 'pret') return (
    <div className="min-h-screen flex flex-col bg-sable px-5 pt-14 pb-10">
      <div className="flex-1 flex flex-col justify-center items-center gap-5 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)', boxShadow: '0 12px 32px -8px rgba(242,92,5,.6)' }}
        >
          <Icon name="check" size={36} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-[28px] text-charbon leading-[1.2] mb-3">
            {assistName || 'Ton bras droit'} est prêt !
          </h1>
          <p className="text-[14.5px] text-g500 leading-relaxed max-w-[280px] mx-auto">
            Tout est configuré. {prenom || 'Toi'} et {assistName || 'Assists'}, vous êtes une équipe maintenant.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          {[
            { icon: 'chat',  label: 'Parle à ' + (assistName || 'Assists') },
            { icon: 'grid',  label: 'Voir mon catalogue' },
            { icon: 'send',  label: 'Partager ma boutique' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-g200 px-4 py-3 shadow-soft">
              <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-orange" />
              </div>
              <span className="font-semibold text-[14px] text-charbon">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onDone}>
        Entrer dans mon Assists
      </PrimaryBtn>
    </div>
  );

  return null;
}
