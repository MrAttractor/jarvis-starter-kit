import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AppHeader, Icon } from '../components/ui';

const TYPE_CONFIG = {
  info:    { icon: "bolt",    bg: "bg-orange/10",  text: "text-orange"  },
  success: { icon: "check",   bg: "bg-growth/10",  text: "text-growth"  },
  alert:   { icon: "flame",   bg: "bg-amber/10",   text: "text-amber"   },
  agent:   { icon: "bot",     bg: "bg-info/10",    text: "text-info"    },
  message: { icon: "user",    bg: "bg-charbon/8",  text: "text-charbon" },
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
  const [notifs, setNotifs]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [replyId, setReplyId]       = useState(null); // id notif en cours de réponse
  const [replyText, setReplyText]   = useState('');
  const [replySending, setReplySending] = useState(false);
  const currentUserId = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId.current = user.id;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      setNotifs(data || []);
      setLoading(false);
      await supabase.from('notifications').update({ lu: true }).eq('user_id', user.id).eq('lu', false);
    };
    load();
  }, []);

  const sendReply = async (notif) => {
    if (!replyText.trim() || replySending) return;
    setReplySending(true);
    const uid = currentUserId.current;
    if (uid) {
      await supabase.from('admin_chats').insert({
        user_id: uid,
        sender: 'user',
        message: replyText.trim(),
      });
    }
    setReplyText('');
    setReplyId(null);
    setReplySending(false);
  };

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
          const isAdminMsg = n.type === 'message';
          return (
            <div key={n.id} className={`bg-white rounded-[16px] shadow-soft border overflow-hidden ${n.lu ? 'border-g100' : isAdminMsg ? 'border-charbon/25' : 'border-orange/25'}`}>
              <div className="p-4 flex items-start gap-3">
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

              {/* Répondre — uniquement pour les messages admin */}
              {isAdminMsg && (
                <div className="border-t border-g100">
                  {replyId === n.id ? (
                    <div className="p-3 flex gap-2 items-end">
                      <textarea
                        autoFocus
                        rows={2}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Ta réponse…"
                        className="flex-1 resize-none rounded-xl bg-sable border border-g200 px-3 py-2 text-[13px] text-charbon outline-none focus:border-charbon transition"
                      />
                      <button
                        onClick={() => sendReply(n)}
                        disabled={!replyText.trim() || replySending}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-charbon flex items-center justify-center disabled:opacity-40">
                        <Icon name="send" size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setReplyId(n.id); setReplyText(''); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-bold text-charbon hover:bg-sable transition">
                      <Icon name="send" size={13} />
                      Répondre à Mac Arthur
                    </button>
                  )}
                </div>
              )}
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
