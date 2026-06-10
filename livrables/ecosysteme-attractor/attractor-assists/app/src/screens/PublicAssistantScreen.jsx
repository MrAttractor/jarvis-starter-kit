import { useState, useRef, useEffect } from 'react';
import { Icon, Logo, TypingDots, Spinner } from '../components/ui';

// ─── Machine à états : splash → catalogue → chat → paiement → confirmation ───

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
          fontSize: 15, fontWeight: 400, lineHeight: 1.45,
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

function Stepper({ step }) {
  const steps = ['Panier', 'Livraison', 'Paiement', 'Confirmé'];
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-g200">
      {steps.map((s, i) => {
        const done    = i < step;
        const current = i === step;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 text-[11.5px] font-bold ${current ? 'text-orange' : done ? 'text-vert' : 'text-g400'}`}>
              <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border ${
                done ? 'bg-vert border-vert text-white' :
                current ? 'border-orange text-orange bg-white' :
                'border-g200 text-g400'
              }`}>
                {done ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-4 h-px mx-1 ${i < step ? 'bg-vert' : 'bg-g200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: 'wave',   label: 'Wave',          color: '#1A86FF', sub: 'Paiement mobile rapide' },
  { id: 'mtn',    label: 'MTN MoMo',      color: '#FFCC00', sub: 'Mobile Money MTN' },
  { id: 'orange', label: 'Orange Money',  color: '#FF6600', sub: 'Paiement Orange' },
  { id: 'cb',     label: 'Carte bancaire', color: '#1E5631', sub: 'Visa / Mastercard' },
];

export function PublicAssistantScreen({ slug }) {
  const [appState, setAppState] = useState('loading'); // loading|notfound|splash|catalogue|chat|paiement|confirmation
  const [owner, setOwner]   = useState(null);
  const [produits, setProduits] = useState([]);
  const [cart, setCart]     = useState([]); // [{id, nom, prix, qty}]
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const [contact, setContact]     = useState(null);
  const [askContact, setAskContact] = useState(false);
  const [contactPrenom, setContactPrenom] = useState('');
  const [contactWA, setContactWA]     = useState('');
  const [payMethod, setPayMethod]   = useState('wave');
  const [orderId, setOrderId]       = useState(null);
  const [filterCat, setFilterCat]   = useState('Tout');
  const conversationIdRef = useRef(null);
  const scroller = useRef(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Charger le profil owner
        const res = await fetch(`${SUPABASE_URL}/functions/v1/public-assistant?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json?.error) { setAppState('notfound'); return; }
        setOwner(json);

        // Charger les produits via Supabase REST
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        const prodRes = await fetch(
          `${SUPABASE_URL}/rest/v1/produits_user?select=id,nom,prix,categorie,photo_url,actif&actif=eq.true&user_id=eq.${encodeURIComponent(json.user_id || '')}`,
          { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
        );
        if (!cancelled && prodRes.ok) {
          const prods = await prodRes.json();
          setProduits(prods || []);
        }

        if (!cancelled) setAppState('splash');
      } catch {
        if (!cancelled) setAppState('notfound');
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  // ── Cart helpers ──────────────────────────────────────────────────────────────

  const cartTotal = cart.reduce((s, i) => s + i.prix * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (prod) => {
    setCart(c => {
      const existing = c.find(i => i.id === prod.id);
      if (existing) return c.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: prod.id, nom: prod.nom, prix: prod.prix || 0, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(c => {
      const existing = c.find(i => i.id === id);
      if (!existing || existing.qty <= 1) return c.filter(i => i.id !== id);
      return c.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  // ── Chat send ─────────────────────────────────────────────────────────────────

  const send = async (text) => {
    if (!text?.trim() || typing) return;
    const userMsg = { from: 'me', text: text.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setTyping(true);

    const nbClientMsgs = newMsgs.filter(m => m.from === 'me').length;
    if (!contact && !askContact && nbClientMsgs === 2) setAskContact(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.filter((m, i) => !(i === 0 && m.from === 'bot')),
          mode: 'public',
          slug,
          client_contact: contact ? `${contact.prenom}${contact.whatsapp ? ' — ' + contact.whatsapp : ''}` : null,
          conversation_id: conversationIdRef.current,
          cart: cart.length > 0 ? cart : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.reply) throw new Error('no reply');
      conversationIdRef.current = data.conversation_id || conversationIdRef.current;
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: data.reply }]);

      // Si la réponse signale que la livraison est confirmée, passer au paiement
      if (data.ready_for_payment) setAppState('paiement');
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

  // ── Paiement ──────────────────────────────────────────────────────────────────

  const handlePayment = async () => {
    try {
      const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      // Créer la commande
      const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          slug,
          owner_id: owner?.user_id,
          client_name: contact?.prenom || 'Client',
          client_wa: contact?.whatsapp || null,
          items: cart,
          total_fcfa: cartTotal,
          status: 'new',
        }),
      });
      if (orderRes.ok) {
        const [order] = await orderRes.json();
        setOrderId(order?.id);
      }
    } catch {}
    setAppState('confirmation');
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────────

  if (appState === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-sable">
      <Spinner className="w-9 h-9" />
    </div>
  );

  if (appState === 'notfound') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sable px-6 text-center gap-3">
      <Logo size="sm" />
      <h2 className="font-display font-extrabold text-[20px] text-charbon mt-2">Ce lien n'est plus actif</h2>
      <p className="text-[14px] text-g400">Vérifie le lien que ton contact t'a partagé.</p>
    </div>
  );

  const boutiqueName = owner?.prenom ? `Chez ${owner.prenom}` : (owner?.activite || 'Ma Boutique');
  const assistantName = owner?.nom_assistant || 'Assistant';

  // ── SPLASH ────────────────────────────────────────────────────────────────────

  if (appState === 'splash') return (
    <div className="min-h-screen flex flex-col bg-sable">
      {/* Cover */}
      <div
        className="w-full flex-shrink-0 flex items-end px-5 pb-8 pt-20 text-white relative overflow-hidden"
        style={{ minHeight: 260, background: 'linear-gradient(160deg,#FF7A2E 0%,#F25C05 40%,#1A1714 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-display font-extrabold text-[20px] mb-3">
            {boutiqueName.slice(0, 1)}
          </div>
          <h1 className="font-display font-extrabold text-[28px] leading-[1.2]">{boutiqueName}</h1>
          {owner?.activite && <p className="text-[13px] text-white/70 mt-1">{owner.activite}</p>}
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-10 flex flex-col gap-4">
        <button
          onClick={() => setAppState('catalogue')}
          className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[16px] shadow-[0_8px_24px_-8px_rgba(242,92,5,.65)] active:opacity-85 transition"
        >
          Commander maintenant
        </button>

        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="send" size={16} className="text-vert flex-shrink-0" />
            <span className="font-display font-bold text-[13.5px] text-charbon">Livraison & horaires</span>
          </div>
          <p className="text-[13px] text-g500 leading-relaxed">
            Commandez via ce lien, {assistantName} gère tout. Je confirme votre commande sur WhatsApp.
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10.5px] text-g400">Propulsé par <span className="font-bold text-charbon">Attractor Assists</span></p>
        </div>
      </div>
    </div>
  );

  // ── CATALOGUE ─────────────────────────────────────────────────────────────────

  const categories = ['Tout', ...new Set(produits.map(p => p.categorie).filter(Boolean))];

  if (appState === 'catalogue') return (
    <div className="flex flex-col bg-sable" style={{ height: '100dvh' }}>
      {/* AppBar */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-3 bg-white border-b border-g200">
        <button onClick={() => setAppState('splash')} className="w-8 h-8 flex items-center justify-center">
          <Icon name="back" size={20} className="text-charbon" />
        </button>
        <div className="flex-1">
          <div className="font-display font-bold text-[16px] text-charbon">{boutiqueName}</div>
          <div className="text-[11.5px] text-vert font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-vert inline-block" /> En ligne
          </div>
        </div>
      </div>

      {/* Chips */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto bg-white border-b border-g200" style={{ scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap border transition flex-shrink-0 ${
              filterCat === c ? 'bg-charbon text-white border-charbon' : 'bg-white text-g700 border-g200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28" style={{ scrollbarWidth: 'none' }}>
        {produits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-[14px] text-g500">Le catalogue est en cours de chargement…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {produits.filter(p => filterCat === 'Tout' || p.categorie === filterCat).map(p => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
                  <div className="w-full aspect-square bg-g100 flex items-center justify-center">
                    {p.photo_url
                      ? <img src={p.photo_url} alt={p.nom} className="w-full h-full object-cover" />
                      : <Icon name="camera" size={28} className="text-g400" />
                    }
                  </div>
                  <div className="p-2.5">
                    <div className="font-display font-bold text-[13px] text-charbon leading-tight">{p.nom}</div>
                    <div className="text-[12px] font-bold text-orange mt-1">{(p.prix || 0).toLocaleString('fr-FR')} F</div>
                    {inCart ? (
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 rounded-full border border-g200 text-[16px] flex items-center justify-center active:bg-g100">−</button>
                        <span className="font-bold text-[13px] text-charbon">{inCart.qty}</span>
                        <button onClick={() => addToCart(p)} className="w-7 h-7 rounded-full bg-orange text-white text-[16px] flex items-center justify-center">+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="mt-2 w-full py-1.5 rounded-lg bg-orange/10 text-orange text-[12px] font-bold active:bg-orange/20 transition"
                      >
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panier flottant */}
      {cartCount > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <button
            onClick={() => {
              const cartText = cart.map(i => `${i.qty}× ${i.nom}`).join(', ');
              setMsgs([{ from: 'bot', text: `Bonjour ! J'ai bien noté ton panier : ${cartText}. Montant total : ${cartTotal.toLocaleString('fr-FR')} F. Pour quelle adresse de livraison ?` }]);
              setAppState('chat');
            }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,.5)]"
            style={{ background: 'linear-gradient(135deg,#1A1714,#2a2320)' }}
          >
            <span className="font-display font-bold text-[14px]">
              {cartCount} article{cartCount > 1 ? 's' : ''} · {cartTotal.toLocaleString('fr-FR')} F
            </span>
            <span className="font-display font-bold text-orange text-[13px]">Commander →</span>
          </button>
        </div>
      )}
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────────────────────────

  if (appState === 'chat') return (
    <div className="flex flex-col bg-sable overflow-hidden" style={{ height: '100dvh' }}>
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200">
        <button onClick={() => setAppState('catalogue')} className="w-8 h-8 flex items-center justify-center">
          <Icon name="back" size={20} className="text-charbon" />
        </button>
        <div className="flex-1">
          <h3 className="font-display font-extrabold text-[15px] text-charbon">{assistantName}</h3>
          <div className="text-[11.5px] font-semibold text-vert flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-vert inline-block" /> En ligne
          </div>
        </div>
      </div>
      <Stepper step={1} />

      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2" style={{ scrollbarWidth: 'none', background: '#EAE4D9' }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 w-full ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
            <Bubble from={m.from}>{renderText(m.text)}</Bubble>
          </div>
        ))}

        {askContact && (
          <div className="self-start max-w-[88%] bg-white border border-orange/30 rounded-[16px] p-3.5 shadow-soft animate-[fadeUp_.25s_ease]">
            <p className="text-[13px] font-bold text-charbon mb-2">Pour confirmer ta commande</p>
            <input value={contactPrenom} onChange={e => setContactPrenom(e.target.value)}
              placeholder="Ton prénom" className="w-full mb-2 px-3 py-2 rounded-[10px] border border-g200 text-[13px] outline-none" />
            <input value={contactWA} onChange={e => setContactWA(e.target.value)}
              placeholder="Ton WhatsApp (ex : +225 07…)" className="w-full mb-2 px-3 py-2 rounded-[10px] border border-g200 text-[13px] outline-none" />
            <div className="flex gap-2">
              <button onClick={saveContact} disabled={!contactPrenom.trim()}
                className="flex-1 py-2 rounded-[10px] bg-orange text-white text-[12.5px] font-bold disabled:opacity-40">Continuer</button>
              <button onClick={() => setAskContact(false)} className="px-3 py-2 rounded-[10px] text-[12.5px] text-g400 font-semibold">Plus tard</button>
            </div>
          </div>
        )}

        {typing && (
          <div className="self-start bg-white border border-g200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
            <TypingDots />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-3 py-2 flex items-end gap-2" style={{ background: '#f0f2f5', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex-1 bg-white rounded-[24px] flex items-center px-4" style={{ minHeight: 46, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Écris ton message..."
            className="flex-1 bg-transparent py-3 text-[15px] outline-none text-charbon"
          />
        </div>
        <button onClick={() => send(input)} disabled={!input.trim() || typing}
          className="w-[46px] h-[46px] rounded-full bg-orange text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition"
          style={{ boxShadow: '0 2px 8px rgba(242,92,5,.4)' }}>
          <Icon name="send" size={20} />
        </button>
      </div>

      {/* Bouton passer au paiement (si livraison discutée) */}
      <button
        onClick={() => setAppState('paiement')}
        className="px-4 py-3 bg-white border-t border-g200 text-[13px] font-bold text-orange text-center active:bg-g100 transition"
      >
        Confirmer la livraison et payer →
      </button>
    </div>
  );

  // ── PAIEMENT ──────────────────────────────────────────────────────────────────

  if (appState === 'paiement') return (
    <div className="flex flex-col bg-sable" style={{ height: '100dvh' }}>
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200">
        <button onClick={() => setAppState('chat')} className="w-8 h-8 flex items-center justify-center">
          <Icon name="back" size={20} className="text-charbon" />
        </button>
        <div className="font-display font-bold text-[16px] text-charbon">Paiement</div>
      </div>
      <Stepper step={2} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {/* Récap */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
          <div className="text-[11px] font-bold text-g500 uppercase tracking-[.08em] mb-2">Récap commande</div>
          {cart.map(i => (
            <div key={i.id} className="flex justify-between text-[13.5px] py-1">
              <span className="text-charbon">{i.qty}× {i.nom}</span>
              <span className="font-bold text-charbon">{(i.prix * i.qty).toLocaleString('fr-FR')} F</span>
            </div>
          ))}
          <div className="flex justify-between text-[15px] font-extrabold text-charbon pt-2 mt-1 border-t border-g200">
            <span>Total</span>
            <span className="text-orange">{cartTotal.toLocaleString('fr-FR')} F</span>
          </div>
        </div>

        {/* Méthodes */}
        <div className="text-[11px] font-bold text-g500 uppercase tracking-[.08em] px-1">Choisir le paiement</div>
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => setPayMethod(m.id)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition ${
              payMethod === m.id ? 'border-orange bg-white shadow-[0_0_0_3px_rgba(242,92,5,.12)]' : 'border-g200 bg-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.color + '18' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-[14px] text-charbon">{m.label}</div>
              <div className="text-[11.5px] text-g500">{m.sub}</div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === m.id ? 'border-orange' : 'border-g200'}`}>
              {payMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-orange" />}
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 pt-3 bg-white border-t border-g200">
        <button
          onClick={handlePayment}
          className="w-full py-4 rounded-2xl text-white font-display font-bold text-[16px] shadow-[0_8px_24px_-8px_rgba(242,92,5,.6)] active:opacity-85 transition"
          style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
        >
          Payer {cartTotal.toLocaleString('fr-FR')} F · {PAYMENT_METHODS.find(m => m.id === payMethod)?.label}
        </button>
      </div>
    </div>
  );

  // ── CONFIRMATION ──────────────────────────────────────────────────────────────

  if (appState === 'confirmation') return (
    <div className="min-h-screen flex flex-col bg-sable px-5 pt-14 pb-10 items-center justify-center text-center gap-5">
      <div className="w-20 h-20 rounded-3xl bg-vert/10 flex items-center justify-center">
        <Icon name="check" size={36} className="text-vert" />
      </div>
      <div>
        <h1 className="font-display font-extrabold text-[26px] text-charbon leading-[1.2] mb-2">Commande confirmée !</h1>
        {orderId && <p className="text-[12.5px] text-g500 mb-1">#{orderId.slice(-6).toUpperCase()}</p>}
        <p className="text-[14px] text-g500 leading-relaxed mt-1">
          {contact?.whatsapp ? `Je t'envoie la confirmation sur WhatsApp.` : `Ton entrepreneur va préparer ta commande.`}
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-g200 p-4 shadow-soft text-left">
        <div className="text-[11px] font-bold text-g500 uppercase tracking-[.08em] mb-2">Ta commande</div>
        {cart.map(i => (
          <div key={i.id} className="flex justify-between text-[13px] py-1">
            <span className="text-charbon">{i.qty}× {i.nom}</span>
            <span className="font-bold text-charbon">{(i.prix * i.qty).toLocaleString('fr-FR')} F</span>
          </div>
        ))}
        <div className="flex justify-between font-extrabold text-[14px] text-charbon pt-2 mt-1 border-t border-g200">
          <span>Total</span>
          <span className="text-orange">{cartTotal.toLocaleString('fr-FR')} F</span>
        </div>
      </div>

      {contact?.whatsapp && (
        <a
          href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Bonjour, j\'ai passé ma commande sur ta boutique Assists !')}`}
          target="_blank" rel="noreferrer"
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-display font-bold text-[15px] text-white"
          style={{ background: '#25D366' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Suivre ma commande sur WhatsApp
        </a>
      )}
      <p className="text-[10.5px] text-g400">Propulsé par <span className="font-bold text-charbon">Attractor Assists</span></p>
    </div>
  );

  return null;
}
