import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppHeader, Icon } from '../components/ui';

const TYPE_CONFIG = {
  info:    { icon: "bolt",    bg: "bg-orange/10",  text: "text-orange"  },
  success: { icon: "check",   bg: "bg-growth/10",  text: "text-growth"  },
  alert:   { icon: "flame",   bg: "bg-amber/10",   text: "text-amber"   },
  agent:   { icon: "bot",     bg: "bg-info/10",    text: "text-info"    },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export function NotificationsScreen({ go }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      setNotifs(data || []);
      setLoading(false);
      // Marquer tout comme lu
      await supabase.from('notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false);
    };
    load();
  }, []);

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Notifications" onBack={() => go('dashboard')} />
      <div className="px-[18px] flex flex-col gap-2 pb-4">
        {loading && (
          <div className="flex items-center justify-center py-16 text-g400 text-[14px]">Chargement…</div>
        )}
        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-g100 flex items-center justify-center">
              <Icon name="bolt" size={22} className="text-g300" />
            </div>
            <p className="font-display font-bold text-[15px] text-charbon">Aucune notification</p>
            <p className="text-[13px] text-g400 max-w-[220px]">Ton équipe te préviendra ici quand quelque chose mérite ton attention.</p>
          </div>
        )}
        {notifs.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
          return (
            <div key={n.id} className={`bg-white rounded-[16px] p-4 flex items-start gap-3 shadow-soft border ${n.lu ? 'border-g100' : 'border-orange/25'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon name={cfg.icon} size={17} className={cfg.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-display font-bold text-[14px] ${n.lu ? 'text-g700' : 'text-charbon'}`}>{n.titre}</p>
                  {!n.lu && <span className="w-2 h-2 rounded-full bg-orange flex-shrink-0" />}
                </div>
                {n.corps && <p className="text-[12.5px] text-g400 mt-0.5 leading-snug">{n.corps}</p>}
                <p className="text-[11px] text-g300 mt-1.5">{timeAgo(n.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook utilitaire pour le badge de notifications
export async function getUnreadCount(userId) {
  if (!userId) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('lu', false);
  return count || 0;
}
