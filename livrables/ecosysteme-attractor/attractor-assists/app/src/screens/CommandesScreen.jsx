import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui';

const STATUS_LABELS = { new: 'Nouvelle', preparing: 'En prépa', delivered: 'Livrée', cancelled: 'Annulée' };
const STATUS_COLORS = {
  new:       'bg-orange/10 text-orange',
  preparing: 'bg-amber/10 text-amber-600',
  delivered: 'bg-vert/10 text-vert',
  cancelled: 'bg-g100 text-g400',
};
const TABS_DEF = ['new', 'preparing', 'delivered'];
const TAB_LABELS = { new: 'En attente', preparing: 'En cours', delivered: 'Livrées' };

export function CommandesScreen({ go, notify, profile }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('new');

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

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    notify(status === 'preparing' ? 'Commande validée' : 'Commande livrée');
    loadOrders();
  };

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const caToday = todayOrders.reduce((sum, o) => sum + (o.total_fcfa || 0), 0);
  const enAttente = orders.filter(o => o.status === 'new').length;
  const filtered = orders.filter(o => o.status === tab);

  return (
    <div className="flex flex-col h-full bg-sable">
      {/* Stats header */}
      <div className="px-4 pt-14 pb-3">
        <div className="font-display font-bold text-[22px] text-charbon mb-3">Commandes</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-g200 p-3 shadow-soft">
            <div className="font-display font-extrabold text-[17px] text-orange leading-tight">
              {caToday.toLocaleString('fr-FR')} <span className="text-[11px] font-bold">F</span>
            </div>
            <div className="text-[11.5px] text-g500 mt-0.5">CA du jour</div>
          </div>
          <div className="bg-white rounded-2xl border border-g200 p-3 shadow-soft">
            <div className="font-display font-extrabold text-[17px] text-charbon">{todayOrders.length}</div>
            <div className="text-[11.5px] text-g500 mt-0.5">Commandes</div>
          </div>
          <div className="bg-white rounded-2xl border border-g200 p-3 shadow-soft">
            <div className="font-display font-extrabold text-[17px] text-charbon">{enAttente}</div>
            <div className="text-[11.5px] text-g500 mt-0.5">En attente</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-2">
        <div className="flex bg-g100 rounded-xl p-1 gap-1">
          {TABS_DEF.map(t => {
            const count = orders.filter(o => o.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-[12.5px] font-bold transition ${
                  tab === t ? 'bg-white text-charbon shadow-soft' : 'text-g500'
                }`}
              >
                {TAB_LABELS[t]}{count > 0 ? ` · ${count}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste commandes */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="font-display font-bold text-[15px] text-charbon">Aucune commande ici</p>
            <p className="text-[13px] text-g500">Les commandes de tes clients apparaîtront ici.</p>
          </div>
        ) : (
          filtered.map(o => {
            const items = Array.isArray(o.items) ? o.items : [];
            const itemsText = items.map(i => `${i.qty || 1}× ${i.nom}`).join(' · ');
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-[14.5px] text-charbon">{o.client_name || 'Client'}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || STATUS_COLORS.new}`}>
                    {STATUS_LABELS[o.status] || o.status} · {new Date(o.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {itemsText && <p className="text-[13px] text-g500 mb-2.5">{itemsText}</p>}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-orange">
                    {o.total_fcfa ? `${o.total_fcfa.toLocaleString('fr-FR')} F` : '—'}
                  </span>
                  <div className="flex gap-2">
                    {o.client_wa && (
                      <a
                        href={`https://wa.me/${o.client_wa.replace(/\D/g, '')}`}
                        target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-vert/30 text-vert text-[12px] font-bold"
                      >
                        WA
                      </a>
                    )}
                    {o.status === 'new' && (
                      <button
                        onClick={() => updateStatus(o.id, 'preparing')}
                        className="px-3 py-1.5 rounded-lg bg-orange text-white text-[12px] font-bold shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]"
                      >
                        Valider
                      </button>
                    )}
                    {o.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(o.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-vert text-white text-[12px] font-bold"
                      >
                        Marquer livré
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
