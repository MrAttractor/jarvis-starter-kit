import { useState, useRef, useEffect } from 'react';
import { Icon, Logo, TypingDots, Spinner } from '../components/ui';

// ─── Chat public minimal — sans login, sans navigation interne ───────────────
// Ouvert via assists.agenceattractor.com/?c={slug} : un client externe discute
// avec l'assistant que SON entrepreneur a généré pour lui.

function renderText(text) {
  return text.split("\n\n").map((p, j) => (
    <p key={j} className={j > 0 ? "mt-2" : ""}>
      {p.split("\n").map((line, k) => k === 0 ? line : [<br key={k} />, line])}
    </p>
  ));
}

function Bubble({ from, children }) {
  const me = from === "me";
  return (
    <div className={`max-w-[82%] animate-[fadeUp_.25s_ease] ${me ? "self-end" : "self-start"}`}>
      <div
        className={me ? "text-white" : "text-charbon"}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.45,
          padding: '8px 12px',
          borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: me ? '#F25C05' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,.12)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PublicAssistantScreen({ slug }) {
  const [loadState, setLoadState] = useState('loading'); // loading | ready | notfound
  const [owner, setOwner] = useState(null);
  const [contact, setContact] = useState(null);     // { prenom, whatsapp } une fois récupéré
  const [askContact, setAskContact] = useState(false);
  const [contactPrenom, setContactPrenom] = useState('');
  const [contactWA, setContactWA] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const conversationIdRef = useRef(null);
  const scroller = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
        const res = await fetch(`${SUPABASE_URL}/functions/v1/public-assistant?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json?.error) { setLoadState('notfound'); return; }
        setOwner(json);
        setMsgs([{ from: 'bot', text: `Salut ! Je suis ${json.nom_assistant || 'l\'assistant'} de ${json.prenom || 'cette activité'}${json.activite ? ` (${json.activite})` : ''}. Comment je peux t'aider aujourd'hui ?` }]);
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('notfound');
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  const send = async (text) => {
    if (!text?.trim() || typing) return;
    const userMsg = { from: 'me', text: text.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setTyping(true);

    // Après le 2e message du client, on demande prénom + WhatsApp en douceur (une seule fois)
    const nbClientMsgs = newMsgs.filter(m => m.from === 'me').length;
    if (!contact && !askContact && nbClientMsgs === 2) setAskContact(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.filter((m, i) => !(i === 0 && m.from === 'bot')),
          mode: 'public',
          slug,
          client_contact: contact ? `${contact.prenom}${contact.whatsapp ? ' — ' + contact.whatsapp : ''}` : null,
          conversation_id: conversationIdRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.reply) throw new Error('no reply');
      conversationIdRef.current = data.conversation_id || conversationIdRef.current;
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: data.reply }]);
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: "Je reviens vers toi dans un instant. Réessaie." }]);
    }
  };

  const saveContact = () => {
    if (!contactPrenom.trim()) return;
    setContact({ prenom: contactPrenom.trim(), whatsapp: contactWA.trim() });
    setAskContact(false);
  };

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sable">
        <Spinner className="w-9 h-9" />
      </div>
    );
  }

  if (loadState === 'notfound') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sable px-6 text-center gap-3">
        <Logo size="sm" />
        <h2 className="font-display font-extrabold text-[20px] text-charbon mt-2">Ce lien n'est plus actif</h2>
        <p className="text-[14px] text-g400">Vérifie le lien que ton contact t'a partagé, ou redemande-lui un lien à jour.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-sable overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header minimal */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200 sticky top-0 z-10">
        <div className="w-[42px] h-[42px] rounded-full bg-orange/12 flex items-center justify-center flex-shrink-0">
          <Icon name="spark" size={20} className="text-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-extrabold text-[16px] leading-tight truncate">{owner?.nom_assistant || 'Assistant'}</h3>
          <div className="text-[12px] font-semibold text-growth flex items-center gap-1">
            ● En ligne · {owner?.prenom ? `assistant de ${owner.prenom}` : 'assistant business'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2" style={{ scrollbarWidth: 'none', background: '#EAE4D9' }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 w-full ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
            <Bubble from={m.from}>{renderText(m.text)}</Bubble>
          </div>
        ))}

        {askContact && (
          <div className="self-start max-w-[88%] bg-white border border-orange/30 rounded-[16px] p-3.5 shadow-soft animate-[fadeUp_.25s_ease]">
            <p className="text-[13px] font-bold text-charbon mb-2">Pour que je puisse te recontacter si besoin</p>
            <input
              value={contactPrenom}
              onChange={e => setContactPrenom(e.target.value)}
              placeholder="Ton prénom"
              className="w-full mb-2 px-3 py-2 rounded-[10px] border border-g200 text-[13px] outline-none"
            />
            <input
              value={contactWA}
              onChange={e => setContactWA(e.target.value)}
              placeholder="Ton WhatsApp (optionnel)"
              className="w-full mb-2 px-3 py-2 rounded-[10px] border border-g200 text-[13px] outline-none"
            />
            <div className="flex gap-2">
              <button onClick={saveContact} disabled={!contactPrenom.trim()}
                className="flex-1 py-2 rounded-[10px] bg-orange text-white text-[12.5px] font-bold disabled:opacity-40">
                Continuer
              </button>
              <button onClick={() => setAskContact(false)} className="px-3 py-2 rounded-[10px] text-[12.5px] text-g400 font-semibold">
                Plus tard
              </button>
            </div>
          </div>
        )}

        {typing && (
          <div className="self-start bg-white border border-g200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
            <TypingDots />
          </div>
        )}
      </div>

      {/* Input style WhatsApp */}
      <div className="flex-shrink-0 px-3 py-2 flex items-end gap-2" style={{ background: '#f0f2f5', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex-1 bg-white rounded-[24px] flex items-center px-4" style={{ minHeight: 46, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Écris ton message..."
            className="flex-1 bg-transparent py-3 text-[15px] outline-none text-charbon placeholder-g400"
            style={{ fontWeight: 400, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          />
        </div>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="w-[46px] h-[46px] rounded-full bg-orange text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition"
          style={{ boxShadow: '0 2px 8px rgba(242,92,5,.4)' }}
        >
          <Icon name="send" size={20} />
        </button>
      </div>

      {/* Footer discret — pas de vente, juste l'attribution */}
      <div className="text-center py-2 bg-sable">
        <p className="text-[10.5px] text-g400">Propulsé par <span className="font-bold text-charbon">Attractor Assists</span></p>
      </div>
    </div>
  );
}
