import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui';

const PLAN_MSG_LIMIT = { decouverte: 20, decouverte_eu: 20, gratuit: 20, growth: 100, growth_eu: 100, bras_droit: null };

const HERO_CARDS = [
  {
    img: '/uploads/agents/carelle.jpg',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(242,92,5,0.72) 52%, rgba(200,50,0,0.95) 100%)',
    badge: 'Intelligence IA',
    title: 'Un assistant qui\nrÃ©pond Ã  ta place',
  },
  {
    img: '/marketplace/ecommerce.jpg',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(21,128,61,0.72) 52%, rgba(14,90,40,0.95) 100%)',
    badge: 'Commerce digital',
    title: 'Ta boutique vend\nmÃªme quand tu dors',
  },
  {
    img: '/uploads/photo-community.png',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(29,78,216,0.72) 52%, rgba(20,50,180,0.95) 100%)',
    badge: 'Carnet client',
    title: 'Tes clients suivis\nsans Excel ni papier',
  },
  {
    img: '/marketplace/services.jpg',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(146,64,14,0.72) 52%, rgba(110,45,5,0.95) 100%)',
    badge: 'FidÃ©lisation',
    title: 'Tes clients reviennent\nd\'eux-mÃªmes',
  },
  {
    img: '/marketplace/hero-founder.jpg',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(91,33,182,0.72) 52%, rgba(60,15,140,0.95) 100%)',
    badge: 'Automatisation',
    title: 'RÃ©ponds instantanÃ©ment\nÃ  toutes les demandes',
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
  const [heroIdx, setHeroIdx]         = useState(0);
  const inputRef = useRef(null);

  const first    = profile?.prenom        || 'toi';
  const nomAss   = profile?.nom_assistant || 'Assists';
  const planCode = profile?.plan_code     || 'gratuit';
  const initials = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();

  const referralBonus = (profile?.referral_count || 0) * 5;
  const msgLimit   = PLAN_MSG_LIMIT[planCode] != null ? PLAN_MSG_LIMIT[planCode] + referralBonus : null;
  const remaining  = msgLimit !== null ? Math.max(0, msgLimit - usedToday) : null;
  const isGratuit  = msgLimit !== null;

  // Suggestions proactivitÃ© selon contexte
  const proSuggestions = [
    ordersCount > 0 && { label: `Traiter les ${ordersCount} commande${ordersCount > 1 ? 's' : ''} en attente`, go: 'commandes', params: {} },
    staleCount > 0  && { label: `Relancer ${staleCount} client${staleCount > 1 ? 's' : ''} inactif${staleCount > 1 ? 's' : ''}`, go: 'conversation', params: { assistant: 'coach', prefill: 'Aide-moi Ã  relancer mes clients inactifs avec un message sympa.' } },
    { label: 'PrÃ©parer un message promo pour aujourd\'hui', go: 'conversation', params: { assistant: 'coach', prefill: 'Aide-moi Ã  prÃ©parer un message de promotion pour aujourd\'hui.' } },
  ].filter(Boolean).slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => setTime(fmtTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_CARDS.length), 4500);
    return () => clearInterval(t);
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
      notify('Message copiÃ©');
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
          <div className="text-[12px] text-g500">{fmtDay()} Â· {time}</div>
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

      {/* Hero slideshow */}
      <div style={{ position: 'relative', height: 224, overflow: 'hidden', flexShrink: 0 }}>
        {/* Track */}
        <div style={{
          display: 'flex',
          width: `${HERO_CARDS.length * 100}%`,
          height: '100%',
          transform: `translateX(-${heroIdx * (100 / HERO_CARDS.length)}%)`,
          transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)',
        }}>
          {HERO_CARDS.map((card, i) => (
            <div key={i} style={{ width: `${100 / HERO_CARDS.length}%`, height: '100%', position: 'relative', flexShrink: 0 }}>
              <img
                src={card.img}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: card.overlay }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 22px' }}>
                <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.14)', borderRadius: 20, padding: '3px 10px', marginBottom: 9, backdropFilter: 'blur(6px)' }}>
                  {card.badge}
                </div>
                <div style={{ fontSize: 21, fontWeight: 800, color: 'white', lineHeight: 1.2, whiteSpace: 'pre-line', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
                  {card.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 16, right: 18, display: 'flex', gap: 5, alignItems: 'center' }}>
          {HERO_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              style={{
                width: i === heroIdx ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: 'white',
                opacity: i === heroIdx ? 1 : 0.4,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s ease',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Astuces WhatsApp Business â€” permanent */}
        <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5 border-b border-g200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" className="flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[10.5px] font-bold text-g500 uppercase tracking-[.1em]">Vendre avec WhatsApp Business</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            {[
              { n: '1', t: 'Obtiens ton lien boutique â†’ onglet Profil si ce n\'est pas encore fait' },
              { n: '2', t: 'Colle ce lien dans ton message d\'accueil WhatsApp Business' },
              { n: '3', t: 'Active le message automatique WA : "Salut ! Commande ici ðŸ‘‡ [lien]"' },
              { n: '4', t: 'Tes clientes commandent, Assists gÃ¨re les rÃ©ponses pour toi' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#25D366]/12 text-[#1a9e4e] text-[11px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{item.n}</span>
                <p className="text-[13px] text-charbon leading-snug">{item.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card proactivitÃ© (plan Gratuit uniquement) */}
        {isGratuit && remaining !== null && remaining <= msgLimit * 0.4 && proSuggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
            <p className="text-[12.5px] font-bold text-g500 mb-2.5">
              Il te reste <span className="text-charbon font-extrabold">{remaining}</span> message{remaining !== 1 ? 's' : ''} aujourd'hui. Voici ce que je te suggÃ¨re :
            </p>
            <div className="flex flex-col gap-2">
              {proSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => go(s.go, s.params)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sable border border-g200 text-left active:bg-g100 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-orange/10 text-orange text-[10px] font-bold flex items-center justify-center flex-shrink-0">â†’</span>
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
            <div className="text-[12px] text-g500 mt-1.5 font-medium">Clientes Ã  relancer</div>
          </button>
        </div>

        {/* Input Assists */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
          <div className="font-display font-bold text-[14.5px] text-charbon mb-3">Qu'est-ce qu'on rÃ¨gle aujourd'hui ?</div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitInput(inputText)}
              placeholder="Dis-moiâ€¦"
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
              Envoyer Ã  {nomAss}
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
                  notify('Lien copiÃ© !');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-charbon text-white text-[12.5px] font-bold active:opacity-80 transition"
              >
                <Icon name="copy" size={13} /> Copier
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/b/${profile.public_slug}`;
                  const text = encodeURIComponent(`Commande ici ðŸ‘‡\n${url}`);
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
            <div className="text-[12.5px] text-white/80 mt-0.5">Assists illimitÃ© Â· DMV Â· Fidelys Â· 9 900 FCFA/mois</div>
          </button>
        )}
      </div>
    </div>
  );
}
