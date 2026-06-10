import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui';

const PLAN_MSG_LIMIT = { decouverte: 20, decouverte_eu: 20, gratuit: 20, growth: 100, growth_eu: 100, bras_droit: null };

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

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Card "On fait quoi aujourd'hui boss ?" */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-[var(--shadow-card,0_6px_20px_-10px_rgba(26,23,20,.22))]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-bold text-orange uppercase tracking-[.12em]">
              On fait quoi aujourd'hui boss ?
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
            <div className="py-3 text-center">
              <p className="text-[13.5px] text-g500">
                {nomAss} prépare ton action du jour…
              </p>
              <button
                onClick={() => go('conversation', { assistant: 'coach', prefill: 'Donne-moi mon action du jour pour booster mes ventes.' })}
                className="mt-3 px-4 py-2 rounded-xl bg-orange text-white text-[13px] font-bold active:opacity-80 transition"
              >
                Demander à {nomAss}
              </button>
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
          <button
            onClick={() => {
              const url = `${window.location.origin}?c=${profile.public_slug}`;
              navigator.clipboard.writeText(url);
              notify('Lien copié !');
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-g200 shadow-soft active:bg-g100 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-vert/10 flex items-center justify-center flex-shrink-0">
              <Icon name="send" size={18} className="text-vert" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[13.5px] text-charbon">Mon lien boutique</div>
              <div className="text-[12px] text-vert truncate">/b/{profile.public_slug}</div>
            </div>
            <Icon name="copy" size={16} className="text-g400 flex-shrink-0" />
          </button>
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
