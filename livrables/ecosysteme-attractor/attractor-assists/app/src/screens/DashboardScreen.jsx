import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, TypingDots } from '../components/ui';

function fmtTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDay() {
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  return days[new Date().getDay()];
}

function renderText(text) {
  return text.split('\n\n').map((p, j) => (
    <p key={j} className={j > 0 ? 'mt-2' : ''}>
      {p.split('\n').map((line, k) => k === 0 ? line : [<br key={k} />, line])}
    </p>
  ));
}

function Bubble({ from, children, ts }) {
  const me = from === 'me';
  const time = ts ? new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className={`max-w-[82%] animate-[fadeUp_.25s_ease] ${me ? 'self-end' : 'self-start'}`}>
      <div
        className={me ? 'text-white' : 'text-charbon'}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.5,
          padding: '9px 13px 7px',
          borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: me ? '#F25C05' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,.10)',
        }}
      >
        {children}
        {time && (
          <div style={{ fontSize: 11, marginTop: 4, textAlign: 'right', opacity: me ? 0.65 : 0.4, lineHeight: 1 }}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  'Vide-tête : dis-moi ce qui tourne dans ma tête',
  'Plan du jour',
  'Clients à relancer',
  'Aide-moi à préparer un message de vente',
];

function buildOpener(profile) {
  const prenom  = profile?.prenom || 'toi';
  const memoire = profile?.memoire_cache || '';
  const jour    = fmtDay();

  if (memoire) {
    return `Content de te revoir, ${prenom}.\n\n${memoire}\n\nOn continue ou tu as autre chose en tête ?`;
  }
  return `${jour}. Qu'est-ce qu'on règle aujourd'hui, ${prenom} ?`;
}

export function DashboardScreen({ go, notify, profile }) {
  const first    = profile?.prenom || 'toi';
  const initials = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();

  const [msgs, setMsgs]           = useState(null); // null = pas encore initialisé
  const [typing, setTyping]       = useState(false);
  const [input, setInput]         = useState('');
  const [time, setTime]           = useState(fmtTime());
  const [ordersCount, setOrders]  = useState(0);
  const [staleCount, setStale]    = useState(0);
  const [unreadNotifs, setNotifs] = useState(0);
  const [userId, setUserId]       = useState(null);

  const scroller   = useRef();
  const inputRef   = useRef();
  const sessionId  = useRef(`jarvis-${Date.now()}`);

  // Horloge
  useEffect(() => {
    const t = setInterval(() => setTime(fmtTime()), 30000);
    return () => clearInterval(t);
  }, []);

  // Chargement initial : userId + stats + opener
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const today = new Date().toISOString().slice(0, 10);
        const [ordersRes, carnetRes, notifsRes] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'new'),
          supabase.from('carnet_affaires').select('id,statut,type,derniere_interaction').eq('user_id', user.id),
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('lu', false),
        ]);

        setOrders(ordersRes.count || 0);
        if (carnetRes.data) {
          const cutoff = Date.now() - 14 * 86400000;
          setStale(carnetRes.data.filter(e =>
            e.type === 'client' && e.statut === 'actif' &&
            new Date(e.derniere_interaction).getTime() < cutoff
          ).length);
        }
        setNotifs(notifsRes.count || 0);
      } catch {}
    };
    load();
  }, []);

  // Initialiser le chat avec l'opener une fois le profil chargé
  useEffect(() => {
    if (profile && msgs === null) {
      setMsgs([{ from: 'bot', text: buildOpener(profile), ts: Date.now() }]);
    }
  }, [profile, msgs]);

  // Scroll automatique
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, typing]);

  // Extraction mémoires au démontage (>= 4 échanges)
  useEffect(() => {
    return () => {
      if (!userId || !msgs) return;
      const real = msgs.filter((m, i) => !(i === 0 && m.from === 'bot'));
      if (real.length >= 4) {
        const formatted = real.map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }));
        supabase.functions.invoke('extract-memories', {
          body: { user_id: userId, session_id: sessionId.current, messages: formatted },
        }).catch(() => {});
      }
    };
  }, [msgs, userId]);

  const send = async (text) => {
    if (!text?.trim() || typing) return;

    const userMsg = { from: 'me', text: text.trim(), ts: Date.now() };
    const newMsgs = [...(msgs || []), userMsg];
    setMsgs(newMsgs);
    setInput('');
    setTyping(true);

    try {
      const history = newMsgs.filter((m, i) => !(i === 0 && m.from === 'bot'));

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages:      history,
          assistant_id:  'coach',
          profile: {
            prenom:          profile?.prenom          || undefined,
            nom_assistant:   profile?.nom_assistant   || undefined,
            activite:        profile?.activite        || undefined,
            canal_principal: profile?.canal_principal || undefined,
            zone:            profile?.zone            || undefined,
            ton_prefere:     profile?.ton_prefere     || undefined,
          },
          memoire_cache: profile?.memoire_cache || '',
          user_id:       userId,
        },
      });

      if (error || !data?.reply) throw new Error('Pas de réponse');
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: data.reply, ts: Date.now() }]);

      // Sauvegarder le nouveau résumé mémoire
      if (data.nouveau_resume && userId) {
        supabase.from('profiles').update({ memoire_cache: data.nouveau_resume }).eq('id', userId).catch(() => {});
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: 'Je reviens dans un instant. Réessaie.', ts: Date.now() }]);
    }
  };

  return (
    <div className="flex flex-col bg-sable overflow-hidden" style={{ height: '100%' }}>

      {/* AppBar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-g200 flex-shrink-0">
        <button
          onClick={() => go('profil')}
          className="w-10 h-10 rounded-full bg-charbon text-white flex items-center justify-center font-display font-extrabold text-[14px] flex-shrink-0"
        >
          {initials}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[16px] text-charbon leading-tight">Mon Assists</div>
          <div className="text-[12px] text-g400 font-medium">{fmtDay()} · {time}</div>
        </div>
        <button
          onClick={() => go('notifications')}
          className="relative w-10 h-10 rounded-full border border-g200 flex items-center justify-center flex-shrink-0 active:bg-sable transition"
        >
          <Icon name="bell" size={18} className="text-charbon" />
          {unreadNotifs > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange border-2 border-white" />
          )}
        </button>
      </div>

      {/* Barre stats compacte */}
      {(ordersCount > 0 || staleCount > 0 || profile?.public_slug) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-g200 flex-shrink-0">
          {ordersCount > 0 && (
            <button
              onClick={() => go('commandes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange/10 border border-orange/20 active:bg-orange/15 transition"
            >
              <span className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />
              <span className="text-[12px] font-bold text-orange">{ordersCount} commande{ordersCount > 1 ? 's' : ''}</span>
            </button>
          )}
          {staleCount > 0 && (
            <button
              onClick={() => go('fidelys')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20 active:bg-amber/15 transition"
            >
              <span className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
              <span className="text-[12px] font-bold text-[#92400e]">{staleCount} à relancer</span>
            </button>
          )}
          {profile?.public_slug && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/b/${profile.public_slug}`);
                notify('Lien boutique copié !');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vert/10 border border-vert/20 active:bg-vert/15 transition ml-auto"
            >
              <Icon name="bolt" size={12} className="text-vert" />
              <span className="text-[12px] font-bold text-vert">Copier mon lien</span>
            </button>
          )}
        </div>
      )}

      {/* Zone messages */}
      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2"
        style={{ scrollbarWidth: 'none', background: '#EAE4D9' }}
      >
        {(msgs || []).map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 w-full ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
            <Bubble from={m.from} ts={m.ts}>
              {renderText(m.text)}
            </Bubble>
          </div>
        ))}
        {typing && (
          <div className="self-start bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
            <TypingDots />
          </div>
        )}
      </div>

      {/* Suggestions (premier message uniquement) */}
      {msgs && msgs.length <= 1 && (
        <div
          className="flex-shrink-0 px-3 pb-2 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', background: '#EAE4D9', paddingTop: 4 }}
        >
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="flex-shrink-0 px-3.5 py-2 rounded-full bg-white border border-g200 text-[12.5px] font-semibold text-charbon active:border-orange/50 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input WhatsApp-style */}
      <div
        className="flex-shrink-0 px-3 py-2 flex items-end gap-2"
        style={{ background: '#f0f2f5', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <div
          className="flex-1 bg-white rounded-[24px] flex items-center px-4"
          style={{ minHeight: 46, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Dis-moi ce qui est dans ta tête…"
            className="flex-1 bg-transparent py-3 text-[15px] outline-none text-charbon placeholder-g400"
            style={{ fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
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
    </div>
  );
}
