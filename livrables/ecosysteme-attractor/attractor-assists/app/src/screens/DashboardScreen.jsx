import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui';

const PLAN_MSG_LIMIT = { decouverte: 20, decouverte_eu: 20, gratuit: 20, growth: 100, growth_eu: 100, bras_droit: null };

const HERO_CARDS = [
  {
    img: '/uploads/agents/carelle.jpg',
    overlay: 'linear-gradient(to bottom, rgba(242,92,5,0.35) 0%, rgba(242,92,5,0.92) 55%)',
    badge: 'Intelligence IA',
    title: 'Un assistant\nqui répond\n24h/24',
  },
  {
    img: '/marketplace/ecommerce.jpg',
    overlay: 'linear-gradient(to bottom, rgba(21,128,61,0.3) 0%, rgba(21,128,61,0.92) 55%)',
    badge: 'Commerce digital',
    title: 'Ta boutique\nvend même\nquand tu dors',
  },
  {
    img: '/uploads/photo-community.png',
    overlay: 'linear-gradient(to bottom, rgba(29,78,216,0.3) 0%, rgba(29,78,216,0.92) 55%)',
    badge: 'Carnet client',
    title: 'Tes clients\nsuivis sans\nExcel ni papier',
  },
  {
    img: '/marketplace/services.jpg',
    overlay: 'linear-gradient(to bottom, rgba(146,64,14,0.3) 0%, rgba(180,83,9,0.92) 55%)',
    badge: 'Fidélisation',
    title: 'Tes clients\nreviennent\nd\'eux-mêmes',
  },
  {
    img: '/marketplace/hero-founder.jpg',
    overlay: 'linear-gradient(to bottom, rgba(91,33,182,0.3) 0%, rgba(91,33,182,0.92) 55%)',
    badge: 'Automatisation',
    title: 'Réponds\ninstantané-\nment à tout',
  },
];

function fmtTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDay() {
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  return days[new Date().getDay()];
}

export function DashboardScreen({ go, notify, profile }) {
  const [dmvToday, setDmvToday]       = useState(null);
  const [dmvCopied, setDmvCopied]     = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [staleCount, setStaleCount]   = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [usedToday, setUsedToday]     = useState(0);
  const [inputText, setInputText]     = useState('');
  const [time, setTime]               = useState(fmtTime());
  const inputRef = useRef(null);

  const first    = profile?.prenom        || 'toi';
  const nomAss   = profile?.nom_assistant || 'Assists';
  const planCode = profile?.plan_code     || 'gratuit';
  const initials = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();

  const referralBonus = (profile?.referral_count || 0) * 5;
  const msgLimit   = PLAN_MSG_LIMIT[planCode] != null ? PLAN_MSG_LIMIT[planCode] + referralBonus : null;
  const remaining  = msgLimit !== null ? Math.max(0, msgLimit - usedToday) : null;
  const isGratuit  = msgLimit !== null;

  // Suggestions proactivité selon contexte
  const proSuggestions = [
    ordersCount > 0 && { label: `Traiter les ${ordersCount} commande${ordersCount > 1 ? 's' : ''} en attente`, go: 'commandes', params: {} },
    staleCount > 0  && { label: `Relancer ${staleCount} client${staleCount > 1 ? 's' : ''} inactif${staleCount > 1 ? 's' : ''}`, go: 'conversation', params: { assistant: 'coach', prefill: 'Aide-moi à relancer mes clients inactifs avec un message sympa.' } },
    { label: 'Préparer un message promo pour aujourd\'hui', go: 'conversation', params: { assistant: 'coach', prefill: 'Aide-moi à préparer un message de promotion pour aujourd\'hui.' } },
  ].filter(Boolean).slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => setTime(fmtTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const today = new Date().toISOString().slice(0, 10);

        const [dmvRes, ordersRes, carnetRes, notifsRes, usageRes] = await Promise.all([
          supabase.from('dmv_queue').select('insight,message_wa,contenu,secteur').eq('user_id', user.id).eq('jour', today).maybeSingle(),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'new'),
          supabase.from('carnet_affaires').select('id,statut,type,derniere_interaction').eq('user_id', user.id),
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('lu', false),
          supabase.from('usage_daily').select('nb_messages').eq('user_id', user.id).eq('jour', today).maybeSingle(),
        ]);

        if (dmvRes.data)  setDmvToday(dmvRes.data);
        setOrdersCount(ordersRes.count || 0);
        if (carnetRes.data) {
          const cutoff = Date.now() - 14 * 86400000;
          setStaleCount(carnetRes.data.filter(e =>
            e.type === 'client' && e.statut === 'actif' &&
            new Date(e.derniere_interaction).getTime() < cutoff
          ).length);
        }
        setUnreadNotifs(notifsRes.count || 0);
        if (usageRes.data) setUsedToday(usageRes.data.nb_messages);
      } catch {}
    };
    load();
  }, []);

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setDmvCopied(true);
      notify('Message copié');
      setTimeout(() => setDmvCopied(false), 2000);
    });
  };

  const submitInput = (text) => {
    if (!text.trim()) return;
    setInputText('');
    go('conversation', { assistant: 'coach', prefill: text.trim() });
  };

  return (
    <div className="flex flex-col h-full bg-sable">
      {/* AppBar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-sable">
        <button
          onClick={() => go('profil')}
          className="w-11 h-11 rounded-full bg-charbon text-white flex items-center justify-center font-display font-extrabold text-[15px] flex-shrink-0"
        >
          {initials}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[17px] text-charbon leading-tight truncate">
            Bonjour {first}
          </div>
          <div className="text-[12px] text-g500">{fmtDay()} · {time}</div>
        </div>
        <button
          onClick={() => go('notifications')}
          className="relative w-10 h-10 rounded-full bg-white border border-g200 flex items-center justify-center flex-shrink-0 active:bg-g100 transition"
        >
          <Icon name="bell" size={18} className="text-charbon" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange border-2 border-white" />
          )}
        </button>
      </div>

      {/* Hero défilant */}
      <div className="overflow-hidden flex-shrink-0" style={{ position: 'relative', paddingTop: 12, paddingBottom: 4 }}>
        <div
          style={{
            display: 'flex',
            paddingLeft: 16,
            animation: 'heroSlide 24s linear infinite',
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {[...HERO_CARDS, ...HERO_CARDS].map((card, i) => (
            <div
              key={i}
              style={{
                width: 192,
                height: 130,
                borderRadius: 20,
                marginRight: 12,
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 6px 20px -6px rgba(0,0,0,0.32)',
              }}
            >
              <img
                src={card.img}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: card.overlay }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 14px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>
                  {card.badge}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1.25, whiteSpace: 'pre-line' }}>
                  {card.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: '100%', background: 'linear-gradient(to right, var(--color-sable,#FAF6F0), transparent)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: '100%', background: 'linear-gradient(to left, var(--color-sable,#FAF6F0), transparent)', pointerEvents: 'none', zIndex: 2 }} />
        <style>{`@keyframes heroSlide { 0% { transform: translateX(0); } 100% { transform: translateX(-1020px); } }`}</style>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Card "Action marketing à la demande" */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-[var(--shadow-card,0_6px_20px_-10px_rgba(26,23,20,.22))]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-bold text-orange uppercase tracking-[.12em]">
              Action marketing à la demande
            </span>
            {dmvToday?.secteur && (
              <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-orange/8 text-orange border border-orange/15">
                {dmvToday.secteur}
              </span>
            )}
          </div>

          {dmvToday?.insight ? (
            <>
              <p className="text-[14px] leading-snug text-charbon font-semibold mb-3">
                {dmvToday.insight}
              </p>
              {dmvToday.message_wa && (
                <div className="border border-g200 rounded-xl p-3 mb-3 bg-sable">
                  <div className="text-[10.5px] font-bold text-g500 mb-1.5">Message prêt</div>
                  <p className="text-[13px] text-g700 leading-relaxed">{dmvToday.message_wa}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => dmvToday.message_wa && copyMessage(dmvToday.message_wa)}
                  className="flex-1 py-2.5 rounded-xl bg-orange text-white text-[13px] font-bold flex items-center justify-center gap-2 active:opacity-80 transition shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]"
                >
                  <Icon name={dmvCopied ? 'check' : 'copy'} size={14} />
                  {dmvCopied ? 'Copié !' : 'Copier le message'}
                </button>
                <button
                  onClick={() => go('conversation', { assistant: 'coach', prefill: 'Modifier le message : ' + (dmvToday.message_wa || '') })}
                  className="px-4 py-2.5 rounded-xl border border-g200 text-[13px] font-bold text-g700 active:bg-g100 transition"
                >
                  Modifier
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Génère-moi un post pour aujourd\'hui', prefill: 'Génère-moi un post engageant pour aujourd\'hui adapté à mon activité.' },
                { label: 'Message promo à envoyer maintenant', prefill: 'Rédige-moi un message promotionnel à envoyer à mes clients WhatsApp maintenant.' },
                { label: 'Idée de contenu cette semaine', prefill: 'Donne-moi 3 idées de contenu pour cette semaine qui vont attirer des clients.' },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => go('conversation', { assistant: 'coach', prefill: s.prefill })}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-sable border border-g200 text-left active:bg-g100 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-orange/12 text-orange text-[10px] font-bold flex items-center justify-center flex-shrink-0">→</span>
                  <span className="text-[13px] font-semibold text-charbon">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card proactivité (plan Gratuit uniquement) */}
        {isGratuit && remaining !== null && remaining <= msgLimit * 0.4 && proSuggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
            <p className="text-[12.5px] font-bold text-g500 mb-2.5">
              Il te reste <span className="text-charbon font-extrabold">{remaining}</span> message{remaining !== 1 ? 's' : ''} aujourd'hui. Voici ce que je te suggère :
            </p>
            <div className="flex flex-col gap-2">
              {proSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => go(s.go, s.params)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sable border border-g200 text-left active:bg-g100 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-orange/10 text-orange text-[10px] font-bold flex items-center justify-center flex-shrink-0">→</span>
                  <span className="text-[12.5px] font-semibold text-charbon">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* StatStrip tappable */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => go('commandes')}
            className="bg-white rounded-2xl border border-g200 p-3.5 shadow-soft text-left active:bg-g100 transition"
          >
            <div className="flex items-start justify-between">
              <div className="font-display font-extrabold text-[24px] text-charbon leading-none">{ordersCount}</div>
              {ordersCount > 0 && <span className="w-2 h-2 rounded-full bg-orange mt-1.5 flex-shrink-0" />}
            </div>
            <div className="text-[12px] text-g500 mt-1.5 font-medium">Commandes en attente</div>
          </button>

          <button
            onClick={() => go('fidelys')}
            className="bg-white rounded-2xl border border-g200 p-3.5 shadow-soft text-left active:bg-g100 transition"
          >
            <div className="flex items-start justify-between">
              <div className="font-display font-extrabold text-[24px] text-charbon leading-none">{staleCount}</div>
              {staleCount > 0 && <span className="w-2 h-2 rounded-full bg-amber mt-1.5 flex-shrink-0" />}
            </div>
            <div className="text-[12px] text-g500 mt-1.5 font-medium">Clientes à relancer</div>
          </button>
        </div>

        {/* Input Assists */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
          <div className="font-display font-bold text-[14.5px] text-charbon mb-3">Qu'est-ce qu'on règle aujourd'hui ?</div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitInput(inputText)}
              placeholder="Dis-moi…"
              className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[14px] text-charbon placeholder:text-g400 outline-none focus:border-orange transition"
            />
            <button
              onClick={() => go('dump')}
              className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center flex-shrink-0 active:opacity-80 transition shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]"
            >
              <Icon name="mic" size={20} />
            </button>
          </div>
          {inputText.trim() && (
            <button
              onClick={() => submitInput(inputText)}
              className="w-full mt-2.5 py-2.5 rounded-xl bg-charbon text-white text-[13px] font-bold active:opacity-80 transition"
            >
              Envoyer à {nomAss}
            </button>
          )}
        </div>

        {/* Lien boutique rapide */}
        {profile?.public_slug && (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10.5px] font-bold text-g400 uppercase tracking-[.1em]">Mon lien boutique</span>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-vert/10 text-vert">Actif</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-sable rounded-xl border border-g200 mb-3">
              <Icon name="bolt" size={13} className="text-vert flex-shrink-0" />
              <span className="text-[12.5px] font-bold text-charbon truncate flex-1">
                assists.agenceattractor.com/b/{profile.public_slug}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/b/${profile.public_slug}`);
                  notify('Lien copié !');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-charbon text-white text-[12.5px] font-bold active:opacity-80 transition"
              >
                <Icon name="copy" size={13} /> Copier
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/b/${profile.public_slug}`;
                  const text = encodeURIComponent(`Commande ici 👇\n${url}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-charbon text-[12.5px] font-bold active:bg-g100 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Partager WA
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Bras Droit (plan Gratuit) */}
        {isGratuit && (
          <button
            onClick={() => go('paliers')}
            className="w-full rounded-2xl p-4 text-left text-white active:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
          >
            <div className="font-display font-extrabold text-[15px]">Passer au Bras Droit</div>
            <div className="text-[12.5px] text-white/80 mt-0.5">Assists illimité · DMV · Fidelys · 9 900 FCFA/mois</div>
          </button>
        )}
      </div>
    </div>
  );
}
