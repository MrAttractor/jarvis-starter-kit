import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, AppHeader, Card, SectionLabel, Btn, Pill, Textarea } from '../components/ui';

const SEGMENTS = [
  { id: 'all',        label: 'Tous les utilisateurs',   filter: () => true },
  { id: 'decouverte', label: 'Plan Découverte',          filter: p => p.plan_code === 'decouverte' || !p.plan_code },
  { id: 'manager',    label: 'Plan Manager',             filter: p => p.plan_code === 'manager' },
  { id: 'ci',         label: 'Zone Côte d\'Ivoire',      filter: p => p.zone === 'CI' },
  { id: 'eu',         label: 'Zone Europe / diaspora',   filter: p => p.zone === 'EU' },
  { id: 'inactive',   label: 'Inactifs (7j+)',           filter: (p, today) => {
    if (!p.last_seen) return true;
    return (Date.now() - new Date(p.last_seen).getTime()) > 7 * 86400000;
  }},
];

const NOTIF_TYPES = [
  { id: 'info',    label: 'Info',    color: 'bg-orange/10 text-orange' },
  { id: 'success', label: 'Succès',  color: 'bg-growth/10 text-growth' },
  { id: 'alert',   label: 'Alerte',  color: 'bg-amber/10 text-amber' },
  { id: 'agent',   label: 'Agent',   color: 'bg-blue-100 text-blue-600' },
];

function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export function AdminScreen({ go, notify }) {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newUserAlert, setNewUserAlert] = useState(null);

  // Broadcast state
  const [bTitle, setBTitle]   = useState('');
  const [bBody, setBBody]     = useState('');
  const [bType, setBType]     = useState('info');
  const [bSeg, setBSeg]       = useState('all');
  const [bSending, setBSending] = useState(false);

  // Filtre liste
  const [filterPlan, setFilterPlan] = useState('all');
  const [search, setSearch]         = useState('');

  const channelRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, zone, plan_code, statut, onboarding_done, created_at, referral_count')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Realtime : alerte quand nouvel utilisateur
    channelRef.current = supabase
      .channel('admin-new-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const u = payload.new;
        setNewUserAlert(u.prenom || 'Nouvel utilisateur');
        setUsers(prev => [u, ...prev]);
        setTimeout(() => setNewUserAlert(null), 6000);
      })
      .subscribe();

    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  const sendBroadcast = async () => {
    if (!bTitle.trim() || !bBody.trim()) return;
    setBSending(true);
    try {
      const seg = SEGMENTS.find(s => s.id === bSeg);
      const today = new Date().toISOString().slice(0, 10);
      const targets = users.filter(u => u.onboarding_done && seg.filter(u, today));

      if (targets.length === 0) { notify('Aucun utilisateur dans ce segment.'); setBSending(false); return; }

      const inserts = targets.map(u => ({
        user_id: u.id,
        type:    bType,
        titre:   bTitle.trim(),
        corps:   bBody.trim(),
      }));

      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;

      notify(`Envoyé à ${targets.length} utilisateur${targets.length > 1 ? 's' : ''} ✓`);
      setBTitle(''); setBBody('');
    } catch {
      notify('Erreur lors de l\'envoi');
    }
    setBSending(false);
  };

  const filteredUsers = users.filter(u => {
    const matchPlan = filterPlan === 'all' || u.plan_code === filterPlan || (filterPlan === 'decouverte' && !u.plan_code);
    const matchSearch = !search || (u.prenom || '').toLowerCase().includes(search.toLowerCase());
    return matchPlan && matchSearch;
  });

  const stats = {
    total:    users.length,
    onboarded: users.filter(u => u.onboarding_done).length,
    manager:  users.filter(u => u.plan_code === 'manager').length,
    newWeek:  users.filter(u => u.created_at && (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length,
  };

  return (
    <div className="min-h-full bg-sable pb-6">
      <AppHeader title="Pilotage" sub="Vue admin — confidentiel" onBack={() => go('profil')} />

      {/* Alerte nouvel utilisateur */}
      {newUserAlert && (
        <div className="mx-[18px] mb-3 flex items-center gap-3 bg-growth text-white px-4 py-3 rounded-[14px] shadow-lg animate-[fadeUp_.3s_ease]">
          <Icon name="user" size={18} />
          <span className="font-bold text-[14px]">Nouvel utilisateur : {newUserAlert}</span>
        </div>
      )}

      <div className="px-[18px] flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total inscrits',    val: stats.total,     icon: 'user',   tone: 'bg-orange/10 text-orange' },
            { label: 'Ont fini l\'onboarding', val: stats.onboarded, icon: 'check', tone: 'bg-growth/10 text-growth' },
            { label: 'Plan Manager',      val: stats.manager,   icon: 'bolt',   tone: 'bg-amber/10 text-amber' },
            { label: 'Nouveaux (7j)',     val: stats.newWeek,   icon: 'trend',  tone: 'bg-info/10 text-info' },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                <Icon name={s.icon} size={17} />
              </div>
              <div>
                <div className="font-display font-extrabold text-[22px] leading-none">{loading ? '…' : s.val}</div>
                <div className="text-[11px] text-g400 mt-0.5 leading-tight">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Broadcast */}
        <SectionLabel>Envoyer un message</SectionLabel>
        <Card className="p-4 flex flex-col gap-3">
          {/* Type */}
          <div className="flex gap-2 flex-wrap">
            {NOTIF_TYPES.map(t => (
              <button key={t.id} onClick={() => setBType(t.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border-[1.5px] transition ${bType === t.id ? t.color + ' border-current' : 'border-g200 text-g500'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Segment */}
          <select value={bSeg} onChange={e => setBSeg(e.target.value)}
            className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition">
            {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <input value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="Titre du message"
            className="w-full bg-white border-[1.5px] border-g200 rounded-xl px-4 py-3 text-[14.5px] outline-none focus:border-orange transition" />

          <Textarea rows={3} value={bBody} onChange={e => setBBody(e.target.value)}
            placeholder="Corps du message…" />

          {(bSeg !== 'all') && (
            <p className="text-[12px] text-g400">
              Cible estimée : <b className="text-charbon">{users.filter(u => {
                const seg = SEGMENTS.find(s => s.id === bSeg);
                return u.onboarding_done && seg.filter(u);
              }).length} utilisateurs</b>
            </p>
          )}

          <Btn onClick={sendBroadcast} disabled={!bTitle.trim() || !bBody.trim() || bSending} className="w-full" icon="send">
            {bSending ? 'Envoi en cours…' : `Envoyer la notification`}
          </Btn>
        </Card>

        {/* Liste utilisateurs */}
        <SectionLabel>
          Utilisateurs
          <span className="ml-2 text-[11px] font-normal text-g400">({filteredUsers.length})</span>
        </SectionLabel>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-[18px] px-[18px]" style={{ scrollbarWidth: 'none' }}>
          {[['all','Tous'],['decouverte','Découverte'],['manager','Manager']].map(([k,l]) => (
            <button key={k} onClick={() => setFilterPlan(k)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-bold border-[1.5px] transition ${filterPlan === k ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="bg-white border border-g200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="target" size={16} className="text-g400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un prénom…"
            className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-g400" />
        </div>

        {loading ? (
          <div className="py-8 text-center text-[13px] text-g400">Chargement…</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredUsers.map(u => (
              <Card key={u.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange/15 flex items-center justify-center font-display font-extrabold text-[13px] text-orange flex-shrink-0">
                  {(u.prenom || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] truncate">{u.prenom || '(sans prénom)'}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-g400">{u.zone || '—'}</span>
                    <span className="text-g300">·</span>
                    <span className="text-[11px] text-g400">{timeAgo(u.created_at)}</span>
                    {u.referral_count > 0 && <span className="text-[11px] text-growth font-bold">{u.referral_count} filleuls</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Pill tone={u.plan_code === 'manager' ? 'amber' : u.plan_code === 'brasdroit' ? 'growth' : 'neutral'}
                    className="text-[10px]">
                    {u.plan_code || 'découverte'}
                  </Pill>
                  {!u.onboarding_done && <span className="text-[10px] text-g400">onboarding incomplet</span>}
                </div>
              </Card>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-[13px] text-g400 py-6">Aucun utilisateur trouvé.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
