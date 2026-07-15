import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';
import { boutiqueUrl } from '../lib/boutique';
import { synthese, PERIODS, fmtMoney } from '../lib/stats';

const STATUS_LABEL = { new: 'En attente', preparing: 'En cours', delivered: 'Livrée', cancelled: 'Annulée' };

/** Une mesure du business. `evol` en % vs la période précédente, null si incomparable. */
function Tuile({ label, valeur, evol, accent }) {
  const hausse = evol > 0;
  return (
    <div className="bg-white rounded-2xl border border-g200 p-3 shadow-soft min-w-0">
      <div className={`font-display font-extrabold text-[17px] leading-tight truncate ${accent ? 'text-orange' : 'text-charbon'}`}>
        {valeur}
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] text-g500 truncate">{label}</span>
        {evol !== null && evol !== undefined && evol !== 0 && (
          <span className={`text-[10.5px] font-bold flex-shrink-0 ${hausse ? 'text-vert' : 'text-g400'}`}>
            {hausse ? '+' : ''}{evol}%
          </span>
        )}
      </div>
    </div>
  );
}
const STATUS_COLOR = {
  new:       'bg-orange/10 text-orange',
  preparing: 'bg-amber/10 text-amber-600',
  delivered: 'bg-vert/10 text-vert',
  cancelled: 'bg-g100 text-g400',
};

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const MONTHLY_LIMIT = 20;

function PalierBanner({ count, go }) {
  const remaining = MONTHLY_LIMIT - count;
  if (count < 16) return null;
  const blocked = count >= MONTHLY_LIMIT;
  return (
    <div className={`mx-4 mb-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${blocked ? 'bg-red-50 border border-red-200' : 'bg-orange/8 border border-orange/20'}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-bold ${blocked ? 'text-red-600' : 'text-orange'}`}>
          {blocked ? 'Limite atteinte — boutique bloquée' : `${remaining} commande${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} ce mois`}
        </p>
        <p className="text-[11.5px] text-g500 mt-0.5">
          {blocked ? 'Les nouvelles commandes sont refusées jusqu\'à la fin du mois.' : 'Passe en Growth pour des commandes illimitées.'}
        </p>
      </div>
      <button
        onClick={() => go('paliers')}
        className="flex-shrink-0 px-3 py-2 rounded-xl bg-orange text-white text-[12px] font-bold active:opacity-80 transition"
      >
        Growth
      </button>
    </div>
  );
}

export function CommandesScreen({ go, notify, profile }) {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('new');
  const [period, setPeriod]         = useState('today');
  const [expanded, setExpanded]     = useState(null);
  const [monthlyCount, setMonthlyCount] = useState(0);

  const isGratuit = !profile?.plan_tier || profile.plan_tier === 'gratuit';

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    loadOrders();

    if (isGratuit) {
      supabase.rpc('get_monthly_order_count').then(({ data }) => {
        if (data != null) setMonthlyCount(data);
      }).catch(() => {});
    }

    if (!profile?.id) return;

    const channel = supabase
      .channel('commandes-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `owner_id=eq.${profile.id}` },
        (payload) => {
          setOrders(prev => [payload.new, ...prev]);
          const o = payload.new;
          const body = `${o.client_name || 'Nouveau client'} • ${(o.total_fcfa || 0).toLocaleString('fr-FR')} F`;
          notify(`Nouvelle commande — ${body}`);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouvelle commande !', {
              body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'new-order',
              vibrate: [200, 100, 200],
            });
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `owner_id=eq.${profile.id}` },
        (payload) => { setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o)); }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders', filter: `owner_id=eq.${profile.id}` },
        (payload) => { setOrders(prev => prev.filter(o => o.id !== payload.old.id)); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    const msgs = { preparing: 'Commande validée', delivered: 'Commande livrée', cancelled: 'Commande annulée' };
    notify(msgs[status] || 'Statut mis à jour');
    setExpanded(null);
    loadOrders();
  };

  // Synthèse de la période — calculée par lib/stats.js, la même source que le coach
  const s = synthese(orders, period);

  const TABS = ['new', 'preparing', 'delivered'];
  const filtered = orders.filter(o => o.status === tab);
  const enAttente = s.enAttente;

  return (
    <div className="flex flex-col h-full bg-sable">

      {/* Header */}
      <div className="px-4 pt-14 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-bold text-[20px] text-charbon">Tableau de bord</div>
          {enAttente > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-orange text-white text-[12px] font-bold">
              {enAttente} en attente
            </span>
          )}
        </div>

        {/* Sélecteur période */}
        <div className="flex bg-g100 rounded-xl p-1 gap-1 mb-3">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-1.5 rounded-lg text-[12.5px] font-bold transition ${
                period === p.key ? 'bg-white text-charbon shadow-soft' : 'text-g500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats — les 4 chiffres tiennent ensemble : plus de tuile qui en cache une autre */}
        <div className="grid grid-cols-2 gap-2">
          <Tuile label="Chiffre d'affaires" valeur={fmtMoney(s.ca)} evol={s.evolution.ca} accent />
          <Tuile label="Commandes" valeur={String(s.commandes)} evol={s.evolution.commandes} />
          <Tuile label="Panier moyen" valeur={s.panierMoyen ? fmtMoney(s.panierMoyen) : '—'} />
          <Tuile label="Clients" valeur={String(s.clients)} />
        </div>

        {/* Top produits — la donnée était dans chaque commande, jamais additionnée */}
        {s.top.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl border border-g200 p-3 shadow-soft">
            <div className="text-[11px] font-bold text-g400 uppercase tracking-[.08em] mb-2">Ce qui se vend</div>
            <div className="flex flex-col gap-1.5">
              {s.top.map((p, i) => (
                <div key={p.nom} className="flex items-center gap-2.5">
                  <span className="w-4 text-[11px] font-bold text-g400 flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 text-[13px] text-charbon truncate">{p.nom}</span>
                  <span className="text-[12px] text-g400 flex-shrink-0">{p.qty} vendu{p.qty > 1 ? 's' : ''}</span>
                  <span className="text-[12.5px] font-bold text-charbon flex-shrink-0 tabular-nums">{fmtMoney(p.ca)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Banner quota gratuit */}
      {isGratuit && <PalierBanner count={monthlyCount} go={go} />}

      {/* Tabs statut */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex bg-g100 rounded-xl p-1 gap-1">
          {TABS.map(t => {
            const count = orders.filter(o => o.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition ${
                  tab === t ? 'bg-white text-charbon shadow-soft' : 'text-g500'
                }`}
              >
                {STATUS_LABEL[t]}{count > 0 ? ` · ${count}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} profile={profile} notify={notify} />
        ) : (
          filtered.map(o => (
            <OrderCard
              key={o.id}
              order={o}
              expanded={expanded === o.id}
              onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
              onStatus={updateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Carte commande ────────────────────────────────────────────────────────────

function OrderCard({ order: o, expanded, onToggle, onStatus }) {
  const items = Array.isArray(o.items) ? o.items : [];
  const preview = items.slice(0, 2).map(i => `${i.qty || 1}× ${i.nom}`).join(', ');
  const more    = items.length > 2 ? ` +${items.length - 2}` : '';
  const isToday = new Date(o.created_at).toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
      {/* Ligne principale — tappable pour expand */}
      <button className="w-full text-left p-4" onClick={onToggle}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-display font-bold text-[14.5px] text-charbon leading-tight">
            {o.client_name || 'Client'}
          </span>
          <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] || STATUS_COLOR.new}`}>
            {STATUS_LABEL[o.status]}
          </span>
        </div>
        {preview && (
          <p className="text-[13px] text-g500 mb-2 leading-snug">{preview}{more}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-[14px] text-orange">
            {o.total_fcfa ? `${o.total_fcfa.toLocaleString('fr-FR')} F` : '—'}
          </span>
          <span className="text-[11.5px] text-g400">
            {isToday ? fmtTime(o.created_at) : fmtDate(o.created_at)}
            {' · '}
            <span className={`transition-transform inline-block ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </span>
        </div>
      </button>

      {/* Détail expandé */}
      {expanded && (
        <div className="border-t border-g200 px-4 py-3 bg-sable flex flex-col gap-3">
          {/* Items complets */}
          {items.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-1.5">Détail commande</p>
              <div className="flex flex-col gap-1">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[13.5px] text-charbon">{item.qty || 1}× {item.nom}</span>
                    {item.prix_unit && (
                      <span className="text-[13px] font-semibold text-g600">
                        {((item.prix_unit || 0) * (item.qty || 1)).toLocaleString('fr-FR')} F
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adresse livraison */}
          {o.delivery_address && (
            <div>
              <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-1">Livraison</p>
              <p className="text-[13.5px] text-charbon">{o.delivery_address}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {o.client_wa && (
              <a
                href={`https://wa.me/${o.client_wa.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-vert/30 text-vert text-[13px] font-bold"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a9e4e">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {o.status === 'new' && (
              <button
                onClick={() => onStatus(o.id, 'preparing')}
                className="flex-1 py-2 rounded-xl bg-orange text-white text-[13px] font-bold shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]"
              >
                Valider
              </button>
            )}
            {o.status === 'preparing' && (
              <button
                onClick={() => onStatus(o.id, 'delivered')}
                className="flex-1 py-2 rounded-xl bg-vert text-white text-[13px] font-bold"
              >
                Marquer livrée
              </button>
            )}
            {(o.status === 'new' || o.status === 'preparing') && (
              <button
                onClick={() => onStatus(o.id, 'cancelled')}
                className="px-3.5 py-2 rounded-xl border border-g200 text-g400 text-[13px] font-bold"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── État vide ─────────────────────────────────────────────────────────────────

function EmptyState({ tab, profile, notify }) {
  if (tab === 'delivered') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="font-display font-bold text-[15px] text-charbon">Pas encore de livraisons</p>
        <p className="text-[13px] text-g500">Elles apparaîtront ici une fois livrées.</p>
      </div>
    );
  }

  if (tab === 'preparing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <p className="font-display font-bold text-[15px] text-charbon">Rien en cours</p>
        <p className="text-[13px] text-g500">Valide une commande en attente pour la voir ici.</p>
      </div>
    );
  }

  // tab === 'new' — état vide principal
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-g100 flex items-center justify-center">
        <Icon name="package" size={28} className="text-g400" />
      </div>
      <div>
        <p className="font-display font-bold text-[16px] text-charbon mb-1">Aucune commande pour l'instant</p>
        <p className="text-[13px] text-g500 leading-relaxed max-w-[240px] mx-auto">
          Partage ton lien boutique pour que tes clients commencent à commander.
        </p>
      </div>
      {profile?.public_slug && (
        <button
          onClick={() => {
            const url = boutiqueUrl(profile.public_slug);
            if (navigator.share) {
              navigator.share({ title: 'Commande ici', url }).catch(() => {});
            } else {
              navigator.clipboard.writeText(url);
              notify('Lien copié !');
            }
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-charbon text-white text-[13.5px] font-bold shadow-[0_4px_14px_-4px_rgba(26,23,20,.4)]"
        >
          <Icon name="bolt" size={15} />
          Partager mon lien boutique
        </button>
      )}
    </div>
  );
}
