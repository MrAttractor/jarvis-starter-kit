import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, AppHeader, Card, SectionLabel, Btn, Pill, Textarea, Sheet } from '../components/ui';

// Détecte les utilisateurs qui méritent qu'on leur écrive
function flagsFor(u) {
  const flags = [];
  const daysSince = u.last_seen
    ? (Date.now() - new Date(u.last_seen).getTime()) / 86400000
    : Infinity;
  const daysSinceSignup = u.created_at
    ? (Date.now() - new Date(u.created_at).getTime()) / 86400000
    : 0;
  if (!u.onboarding_done && daysSinceSignup > 2) flags.push({ label: 'Pas activé', color: 'text-[#D64545] bg-red-50' });
  if (u.onboarding_done && daysSince > 3 && daysSince < 14) flags.push({ label: 'Inactif 3j+', color: 'text-amber bg-amber/10' });
  return flags;
}

const SEGMENTS = [
  { id: 'all',        label: 'Tous les utilisateurs',  filter: () => true },
  { id: 'incomplete', label: 'Onboarding incomplet',   filter: p => !p.onboarding_done },
  { id: 'decouverte', label: 'Plan Découverte',        filter: p => p.plan_code === 'decouverte' || !p.plan_code },
  { id: 'manager',    label: 'Plan Manager',           filter: p => p.plan_code === 'manager' },
  { id: 'ci',         label: 'Zone Côte d\'Ivoire',    filter: p => p.zone === 'CI' },
  { id: 'eu',         label: 'Zone Europe / diaspora', filter: p => p.zone === 'EU' },
  { id: 'inactive',   label: 'Inactifs (7j+)',         filter: p => !p.last_seen || (Date.now() - new Date(p.last_seen).getTime()) > 7 * 86400000 },
];

const NOTIF_TYPES = [
  { id: 'info',    label: 'Info',   color: 'bg-orange/10 text-orange' },
  { id: 'success', label: 'Succès', color: 'bg-growth/10 text-growth' },
  { id: 'alert',   label: 'Alerte', color: 'bg-amber/10 text-amber' },
  { id: 'agent',   label: 'Agent',  color: 'bg-blue-100 text-blue-600' },
];

const FB_FILTERS = [
  { id: 'all',    label: 'Tous' },
  { id: 'bug',    label: 'Bug' },
  { id: 'besoin', label: 'Besoin' },
  { id: 'autre',  label: 'Autre' },
];

function isOnline(last_seen) {
  if (!last_seen) return false;
  return (Date.now() - new Date(last_seen).getTime()) < 5 * 60 * 1000;
}
function isRecent(last_seen) {
  if (!last_seen) return false;
  return (Date.now() - new Date(last_seen).getTime()) < 30 * 60 * 1000;
}

function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export function AdminScreen({ go, notify }) {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [newUserAlert, setNewUserAlert] = useState(null);
  const [section, setSection]     = useState('users'); // 'users' | 'feedbacks' | 'miroir' | 'prospects'

  // MIROIR
  const [miroir, setMiroir]           = useState([]);
  const [miroirLoading, setMiroirLoading] = useState(false);
  const [decisions, setDecisions]     = useState([]);
  const [dSujet, setDSujet]           = useState('');
  const [dContexte, setDContexte]     = useState('');
  const [dSending, setDSending]       = useState(false);

  // PROSPECTS
  const [prospects, setProspects]         = useState([]);
  const [journal, setJournal]             = useState([]);
  const [prospectsLoading, setProspectsLoading] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [prospectSeq, setProspectSeq]     = useState(null);
  const [seqLoading, setSeqLoading]       = useState(false);
  const [copiedIdx, setCopiedIdx]         = useState(null);
  // Formulaire nouveau prospect
  const [pPrenom, setPPrenom]   = useState('');
  const [pActivite, setPActivite] = useState('');
  const [pBesoin, setPBesoin]   = useState('');
  const [pContexte, setPContexte] = useState('');
  const [pCanal, setPCanal]     = useState('WhatsApp');
  const [pZone, setPZone]       = useState('CI');
  const [pWa, setPWa]           = useState('');
  const [pSaving, setPSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Détail utilisateur
  const [selectedUser, setSelectedUser]   = useState(null);
  const [userDetail, setUserDetail]       = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Chat admin ↔ user
  const [chatMsgs, setChatMsgs]   = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [unreadFrom, setUnreadFrom]   = useState(new Set()); // user_ids ayant envoyé une réponse non lue
  const chatChannelRef = useRef(null);
  const chatBottomRef  = useRef(null);

  // Feedbacks
  const [feedbacks, setFeedbacks]   = useState([]);
  const [fbLoading, setFbLoading]   = useState(false);
  const [fbFilter, setFbFilter]     = useState('all');

  // Broadcast
  const [bTitle, setBTitle]     = useState('');
  const [bBody, setBBody]       = useState('');
  const [bType, setBType]       = useState('info');
  const [bSeg, setBSeg]         = useState('all');
  const [bSending, setBSending] = useState(false);

  // Filtres liste
  const [filterPlan, setFilterPlan] = useState('all');
  const [search, setSearch]         = useState('');
  const [watchOpen, setWatchOpen]   = useState(true);

  const channelRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, prenom, zone, plan_code, statut, onboarding_done, created_at, referral_count, last_seen')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      notify('Erreur chargement — policy admin manquante ?');
      console.error(e);
    }
    setLoading(false);
  };

  const loadFeedbacks = async () => {
    setFbLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (e) {
      console.error('feedbacks', e);
    }
    setFbLoading(false);
  };

  const loadMiroir = async () => {
    setMiroirLoading(true);
    try {
      const [{ data: ref }, { data: dec }] = await Promise.all([
        supabase.from('methode_miroir').select('*').order('created_at', { ascending: false }).limit(60),
        supabase.from('decisions').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setMiroir(ref || []);
      setDecisions(dec || []);
    } catch (e) { console.error('miroir', e); }
    setMiroirLoading(false);
  };

  const addDecision = async (statut) => {
    if (!dSujet.trim() || !dContexte.trim() || dSending) return;
    setDSending(true);
    const { error } = await supabase.from('decisions').insert({
      sujet: dSujet.trim(), contexte: dContexte.trim(), statut,
    });
    if (error) { notify('Erreur — vérifie la policy decisions'); setDSending(false); return; }
    notify(`Décision ${statut} enregistrée — MIROIR va l'analyser`);
    setDSujet(''); setDContexte('');
    await loadMiroir();
    setDSending(false);
  };

  // ─── PROSPECTS ─────────────────────────────────────────────
  const loadProspects = async () => {
    setProspectsLoading(true);
    try {
      const [{ data: pros }, { data: jnl }] = await Promise.all([
        supabase.from('prospects').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('journal_agent').select('*').order('created_at', { ascending: false }).limit(30),
      ]);
      setProspects(pros || []);
      setJournal(jnl || []);
    } catch (e) { console.error('prospects', e); }
    setProspectsLoading(false);
  };

  const saveProspect = async () => {
    if (!pPrenom.trim() || pSaving) return;
    setPSaving(true);
    const { data, error } = await supabase.from('prospects').insert({
      prenom: pPrenom.trim(), activite: pActivite.trim(), besoin: pBesoin.trim(),
      contexte: pContexte.trim(), canal: pCanal, zone: pZone, whatsapp: pWa.trim(),
    }).select().single();
    if (error) { notify('Erreur enregistrement prospect'); setPSaving(false); return; }
    setProspects(prev => [data, ...prev]);
    setPPrenom(''); setPActivite(''); setPBesoin(''); setPContexte(''); setPWa('');
    setShowForm(false);
    setPSaving(false);
    // Déclencher immédiatement la séquence
    generateSequence(data);
  };

  const generateSequence = async (prospect) => {
    setSelectedProspect(prospect);
    setProspectSeq(null);
    setSeqLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sequence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ prospect_id: prospect.id }),
      });
      const d = await res.json();
      if (d.messages) {
        setProspectSeq(d);
        await loadProspects();
      } else {
        notify('Erreur génération séquence');
      }
    } catch (e) { notify('Erreur réseau'); }
    setSeqLoading(false);
  };

  const loadExistingSeq = async (prospect) => {
    setSelectedProspect(prospect);
    setProspectSeq(null);
    setSeqLoading(true);
    try {
      const { data } = await supabase
        .from('sequences_vente').select('*')
        .eq('prospect_id', prospect.id)
        .order('created_at', { ascending: false })
        .limit(1).single();
      if (data) setProspectSeq({ messages: data.messages });
    } catch {}
    setSeqLoading(false);
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  };

  const resolveArbitrage = async (id) => {
    await supabase.from('methode_miroir').update({ arbitre: true }).eq('id', id);
    setMiroir(prev => prev.map(m => m.id === id ? { ...m, arbitre: true } : m));
  };

  const markHandled = async (id) => {
    const { error } = await supabase.from('feedback').update({ status: 'traité' }).eq('id', id);
    if (error) { notify('Erreur — policy update manquante ?'); return; }
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'traité' } : f));
  };

  // Charge les messages non lus des users (réponses à l'admin)
  const loadUnread = async () => {
    const { data } = await supabase
      .from('admin_chats')
      .select('user_id')
      .eq('sender', 'user')
      .eq('lu', false);
    if (data) setUnreadFrom(new Set(data.map(m => m.user_id)));
  };

  // Ouvre le chat pour un user spécifique
  const openChat = async (userId) => {
    const { data } = await supabase
      .from('admin_chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    setChatMsgs(data || []);
    // Marquer les réponses user comme lues
    await supabase.from('admin_chats').update({ lu: true }).eq('user_id', userId).eq('sender', 'user');
    setUnreadFrom(prev => { const s = new Set(prev); s.delete(userId); return s; });

    // Realtime pour ce chat
    chatChannelRef.current?.unsubscribe();
    chatChannelRef.current = supabase
      .channel(`admin-chat-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_chats', filter: `user_id=eq.${userId}` }, (payload) => {
        setChatMsgs(prev => [...prev, payload.new]);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .subscribe();
  };

  const sendChat = async (userId, prenom) => {
    if (!chatInput.trim() || chatSending) return;
    setChatSending(true);
    const msg = chatInput.trim();
    setChatInput('');
    try {
      // Insérer dans admin_chats
      const { data: inserted } = await supabase.from('admin_chats').insert({
        user_id: userId, sender: 'admin', message: msg,
      }).select().single();
      if (inserted) setChatMsgs(prev => [...prev, inserted]);
      // Notifier l'utilisateur
      await supabase.from('notifications').insert({
        user_id: userId, type: 'message',
        titre: 'Message de Mac Arthur',
        corps: msg,
      });
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch { notify('Erreur lors de l\'envoi'); }
    setChatSending(false);
  };

  useEffect(() => {
    load();
    loadFeedbacks();
    loadMiroir();
    loadProspects();
    loadUnread();

    channelRef.current = supabase
      .channel('admin-new-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const u = payload.new;
        setNewUserAlert(u.prenom || 'Nouvel utilisateur');
        setUsers(prev => [u, ...prev]);
        setTimeout(() => setNewUserAlert(null), 6000);
      })
      .subscribe();

    // Écoute les nouvelles réponses users en temps réel
    supabase
      .channel('admin-chat-replies')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_chats', filter: 'sender=eq.user' }, (payload) => {
        const uid = payload.new.user_id;
        setUnreadFrom(prev => new Set([...prev, uid]));
        // Alerte visuelle si la Sheet n'est pas ouverte sur ce user
        setSelectedUser(prev => {
          if (!prev || prev.id !== uid) notify(`Réponse de ${payload.new.user_id.slice(0, 6)}…`);
          return prev;
        });
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      chatChannelRef.current?.unsubscribe();
    };
  }, []);

  const sendBroadcast = async () => {
    if (!bTitle.trim() || !bBody.trim()) return;
    setBSending(true);
    try {
      const seg = SEGMENTS.find(s => s.id === bSeg);
      const targets = users.filter(u => u.onboarding_done && seg.filter(u));
      if (targets.length === 0) { notify('Aucun utilisateur dans ce segment.'); setBSending(false); return; }
      const inserts = targets.map(u => ({ user_id: u.id, type: bType, titre: bTitle.trim(), corps: bBody.trim() }));
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
    const matchPlan =
      filterPlan === 'all'        ? true :
      filterPlan === 'incomplete' ? !u.onboarding_done :
      filterPlan === 'decouverte' ? (u.plan_code === 'decouverte' || !u.plan_code) :
      u.plan_code === filterPlan;
    const matchSearch = !search || (u.prenom || '').toLowerCase().includes(search.toLowerCase());
    return matchPlan && matchSearch;
  });

  const filteredFeedbacks = fbFilter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.type === fbFilter);

  const pendingCount = feedbacks.filter(f => f.status === 'nouveau').length;

  // MIROIR — données dérivées
  const arbitrer   = miroir.filter(m => m.a_arbitrer && !m.arbitre);
  const referentiel = miroir.filter(m => m.type !== 'CONTRADICTION' || m.arbitre);
  const categories  = [...new Set(referentiel.map(m => m.categorie))].sort();
  const decNonTraitees = decisions.filter(d => !d.traite).length;

  const stats = {
    total:     users.length,
    onboarded: users.filter(u => u.onboarding_done).length,
    online:    users.filter(u => isOnline(u.last_seen)).length,
    newWeek:   users.filter(u => u.created_at && (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length,
    activRate: users.length > 0 ? Math.round(users.filter(u => u.onboarding_done).length / users.length * 100) : 0,
  };

  const getUserName = (user_id) => users.find(u => u.id === user_id)?.prenom || '—';

  const openDetail = async (u) => {
    setSelectedUser(u);
    setUserDetail(null);
    setDetailLoading(true);
    setChatMsgs([]);
    setChatInput('');
    try {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', u.id).single(),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', u.id),
      ]);
      setUserDetail({ ...profile, conv_count: count ?? null });
      await openChat(u.id);
    } catch (e) {
      console.error(e);
    }
    setDetailLoading(false);
    setTimeout(() => chatBottomRef.current?.scrollIntoView(), 100);
  };

  return (
    <>
    <div className="min-h-full bg-sable pb-6">
      <AppHeader title="Pilotage" sub="Vue admin — confidentiel" onBack={() => go('profil')} />

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
            { label: 'Total inscrits',      val: stats.total,     icon: 'user',  tone: 'bg-orange/10 text-orange',       sub: null },
            { label: 'Onboarding terminé',  val: stats.onboarded, icon: 'check', tone: 'bg-growth/10 text-growth',       sub: stats.total > 0 ? `${stats.activRate}% d'activation` : null },
            { label: 'En ligne maintenant', val: stats.online,    icon: 'bolt',  tone: 'bg-[#25D366]/10 text-[#25D366]', sub: null },
            { label: 'Nouveaux (7j)',        val: stats.newWeek,   icon: 'trend', tone: 'bg-info/10 text-info',           sub: null },
          ].map(s => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                <Icon name={s.icon} size={17} />
              </div>
              <div>
                <div className="font-display font-extrabold text-[22px] leading-none">{loading ? '…' : s.val}</div>
                <div className="text-[11px] text-g400 mt-0.5 leading-tight">{s.label}</div>
                {s.sub && <div className="text-[10px] text-g300 mt-0.5">{s.sub}</div>}
              </div>
            </Card>
          ))}
        </div>

        {/* Broadcast */}
        <SectionLabel>Envoyer un message</SectionLabel>
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {NOTIF_TYPES.map(t => (
              <button key={t.id} onClick={() => setBType(t.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border-[1.5px] transition ${bType === t.id ? t.color + ' border-current' : 'border-g200 text-g500'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <select value={bSeg} onChange={e => setBSeg(e.target.value)}
            className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition">
            {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <input value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="Titre du message"
            className="w-full bg-white border-[1.5px] border-g200 rounded-xl px-4 py-3 text-[14.5px] outline-none focus:border-orange transition" />

          <Textarea rows={3} value={bBody} onChange={e => setBBody(e.target.value)} placeholder="Corps du message…" />

          {bSeg !== 'all' && (
            <p className="text-[12px] text-g400">
              Cible estimée : <b className="text-charbon">
                {users.filter(u => u.onboarding_done && SEGMENTS.find(s => s.id === bSeg).filter(u)).length} utilisateurs
              </b>
            </p>
          )}

          <Btn onClick={sendBroadcast} disabled={!bTitle.trim() || !bBody.trim() || bSending} className="w-full" icon="send">
            {bSending ? 'Envoi en cours…' : 'Envoyer la notification'}
          </Btn>
        </Card>

        {/* Onglets */}
        <div className="flex gap-2">
          <button onClick={() => setSection('users')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-[1.5px] transition ${section === 'users' ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
            Users ({filteredUsers.length})
          </button>
          <button onClick={() => setSection('feedbacks')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-[1.5px] transition relative ${section === 'feedbacks' ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
            Feedback
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D64545] text-white text-[10px] font-extrabold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button onClick={() => { setSection('miroir'); loadMiroir(); }}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-[1.5px] transition relative ${section === 'miroir' ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
            Miroir
            {arbitrer.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber text-charbon text-[10px] font-extrabold flex items-center justify-center">
                {arbitrer.length}
              </span>
            )}
          </button>
          <button onClick={() => { setSection('prospects'); loadProspects(); }}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-[1.5px] transition relative ${section === 'prospects' ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
            Awa
            {prospects.filter(p => p.statut === 'nouveau').length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange text-white text-[10px] font-extrabold flex items-center justify-center">
                {prospects.filter(p => p.statut === 'nouveau').length}
              </span>
            )}
          </button>
        </div>

        {/* ── Section Utilisateurs ── */}
        {section === 'users' && (
          <>
            {/* Panneau À surveiller */}
            {(() => {
              const flagged = users.filter(u => flagsFor(u).length > 0 || unreadFrom.has(u.id));
              if (flagged.length === 0) return null;
              return (
                <div className="rounded-[16px] border border-amber/30 overflow-hidden">
                  <button
                    onClick={() => setWatchOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-amber/8 text-left">
                    <div className="flex items-center gap-2">
                      <Icon name="bolt" size={15} className="text-amber" />
                      <span className="text-[13px] font-bold text-charbon">À surveiller</span>
                      <span className="bg-amber/20 text-amber text-[11px] font-extrabold px-2 py-0.5 rounded-full">{flagged.length}</span>
                    </div>
                    <Icon name={watchOpen ? 'close' : 'arrow'} size={14} className="text-g400" />
                  </button>
                  {watchOpen && (
                    <div className="flex flex-col divide-y divide-g100">
                      {flagged.map(u => {
                        const flags = flagsFor(u);
                        const hasReply = unreadFrom.has(u.id);
                        return (
                          <button key={u.id} onClick={() => openDetail(u)}
                            className="flex items-center gap-3 px-4 py-2.5 bg-white text-left hover:bg-sable transition">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-[11px] font-bold text-orange">
                                {(u.prenom || '?').slice(0, 2).toUpperCase()}
                              </div>
                              {hasReply && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] font-bold text-charbon">{u.prenom || '—'}</span>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {hasReply && (
                                  <span className="text-[10.5px] font-bold text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded-full">A répondu</span>
                                )}
                                {flags.map(f => (
                                  <span key={f.label} className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ${f.color}`}>{f.label}</span>
                                ))}
                              </div>
                            </div>
                            <Icon name="send" size={13} className="text-orange flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-[18px] px-[18px]" style={{ scrollbarWidth: 'none' }}>
              {[['all','Tous'],['incomplete','Incomplet'],['decouverte','Découverte'],['manager','Manager']].map(([k,l]) => (
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
                {filteredUsers.map(u => {
                  const online = isOnline(u.last_seen);
                  const recent = isRecent(u.last_seen);
                  return (
                    <Card key={u.id} onClick={() => openDetail(u)} className={`px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[.99] transition ${online ? 'border-[#25D366]/40' : unreadFrom.has(u.id) ? 'border-orange/40' : ''}`}>
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-orange/15 flex items-center justify-center font-display font-extrabold text-[13px] text-orange">
                          {(u.prenom || '?').slice(0, 2).toUpperCase()}
                        </div>
                        {online  && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white" />}
                        {!online && recent && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber border-2 border-white" />}
                        {unreadFrom.has(u.id) && !online && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">!</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] truncate">{u.prenom || '(sans prénom)'}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-g400">{u.zone || '—'}</span>
                          <span className="text-g300">·</span>
                          <span className={`text-[11px] font-medium ${online ? 'text-[#25D366]' : recent ? 'text-amber' : 'text-g400'}`}>
                            {online ? 'En ligne' : u.last_seen ? timeAgo(u.last_seen) : 'Jamais connecté'}
                          </span>
                          {u.referral_count > 0 && <span className="text-[11px] text-growth font-bold">{u.referral_count} filleuls</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Pill tone={u.plan_code === 'manager' ? 'amber' : u.plan_code === 'brasdroit' ? 'growth' : 'neutral'} className="text-[10px]">
                          {u.plan_code || 'découverte'}
                        </Pill>
                        {!u.onboarding_done && <span className="text-[10px] text-[#D64545] font-semibold">incomplet</span>}
                      </div>
                    </Card>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-[13px] text-g400 py-6">Aucun utilisateur trouvé.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Section PROSPECTS (Awa) ── */}
        {section === 'prospects' && (
          <>
            {/* Journal agents — fil d'activité */}
            {journal.length > 0 && (
              <>
                <SectionLabel>Travaux des agents</SectionLabel>
                <div className="flex flex-col gap-2">
                  {journal.slice(0, 6).map(j => (
                    <div key={j.id} className="flex items-start gap-3 bg-white border border-g200 rounded-[14px] px-4 py-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                        j.agent_id === 'awa'    ? 'bg-orange/10 text-orange' :
                        j.agent_id === 'miroir' ? 'bg-charbon/5 text-charbon' :
                        j.agent_id === 'kofi'   ? 'bg-info/10 text-info' : 'bg-g100 text-g500'
                      }`}>{(j.agent_id || 'SYS').slice(0,3).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-charbon leading-snug">{j.titre}</p>
                        {j.details?.synthese && (
                          <p className="text-[11.5px] text-g400 mt-0.5 leading-snug line-clamp-2">{j.details.synthese}</p>
                        )}
                        {j.details?.notes && (
                          <p className="text-[11.5px] text-g400 mt-0.5 leading-snug line-clamp-2">{j.details.notes}</p>
                        )}
                      </div>
                      <span className="text-[10.5px] text-g300 flex-shrink-0">{timeAgo(j.created_at)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Bouton ajouter prospect */}
            <button onClick={() => setShowForm(o => !o)}
              className={`w-full py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${showForm ? 'bg-charbon text-white border-charbon' : 'bg-orange/10 text-orange border-orange/30'}`}>
              {showForm ? 'Fermer le formulaire' : '+ Nouveau prospect → séquence Awa'}
            </button>

            {/* Formulaire nouveau prospect */}
            {showForm && (
              <Card className="p-4 flex flex-col gap-3">
                <input value={pPrenom} onChange={e => setPPrenom(e.target.value)} placeholder="Prénom *"
                  className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
                <input value={pActivite} onChange={e => setPActivite(e.target.value)} placeholder="Activité / secteur"
                  className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
                <textarea value={pBesoin} onChange={e => setPBesoin(e.target.value)} rows={2}
                  placeholder="Ce dont il a besoin (ex : une app métier, du coaching, visibilité…)"
                  className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] resize-none outline-none focus:border-orange transition" />
                <textarea value={pContexte} onChange={e => setPContexte(e.target.value)} rows={2}
                  placeholder="Contexte — budget, objection, historique, comment tu l'as connu…"
                  className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] resize-none outline-none focus:border-orange transition" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={pCanal} onChange={e => setPCanal(e.target.value)}
                    className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none">
                    {['WhatsApp','Facebook','Instagram','LinkedIn','Email','Autre'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={pZone} onChange={e => setPZone(e.target.value)}
                    className="w-full bg-sable border border-g200 rounded-xl px-3 py-3 text-[13.5px] text-charbon outline-none">
                    {['CI','EU','MA','SN','CM','Autre'].map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
                <input value={pWa} onChange={e => setPWa(e.target.value)} placeholder="Numéro WhatsApp"
                  className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange transition" />
                <button onClick={saveProspect} disabled={!pPrenom.trim() || pSaving}
                  className="w-full py-3 rounded-xl bg-orange text-white text-[14px] font-bold disabled:opacity-40 active:scale-[.98] transition">
                  {pSaving ? 'Enregistrement + génération…' : 'Enregistrer et générer la séquence Awa'}
                </button>
              </Card>
            )}

            {/* Liste des prospects */}
            {prospectsLoading ? (
              <div className="py-8 text-center text-[13px] text-g400">Chargement…</div>
            ) : prospects.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="text-[13px] text-g400">Aucun prospect pour l'instant.</p>
                <p className="text-[12px] text-g300 mt-1">Ajoute ton premier prospect — Awa génère la séquence complète.</p>
              </Card>
            ) : (
              <>
                <SectionLabel>Pipeline ({prospects.length})</SectionLabel>
                <div className="flex flex-col gap-2">
                  {prospects.map(p => {
                    const statusStyle = {
                      nouveau:   'bg-orange/10 text-orange',
                      contacté:  'bg-info/10 text-info',
                      relancé:   'bg-amber/10 text-amber',
                      closé:     'bg-growth/10 text-growth',
                      perdu:     'bg-g100 text-g400',
                    }[p.statut] || 'bg-g100 text-g500';
                    return (
                      <Card key={p.id} onClick={() => loadExistingSeq(p)}
                        className="px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[.99] transition">
                        <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center font-display font-extrabold text-[14px] text-orange flex-shrink-0">
                          {p.prenom.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[14px]">{p.prenom}</div>
                          <div className="text-[12px] text-g400 truncate">{p.activite || p.besoin || '—'}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusStyle}`}>{p.statut}</span>
                          <span className="text-[10px] text-g300">{p.canal}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Section MIROIR ── */}
        {section === 'miroir' && (
          <>
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Principes', val: referentiel.length, tone: 'bg-charbon/5 text-charbon' },
                { label: 'En attente', val: decNonTraitees,    tone: 'bg-amber/10 text-amber' },
                { label: 'À arbitrer', val: arbitrer.length,   tone: arbitrer.length > 0 ? 'bg-[#D64545]/10 text-[#D64545]' : 'bg-charbon/5 text-charbon' },
              ].map(s => (
                <Card key={s.label} className="p-3 text-center">
                  <div className={`text-[22px] font-display font-extrabold ${s.tone.split(' ')[1]}`}>{miroirLoading ? '…' : s.val}</div>
                  <div className="text-[10px] text-g400 mt-0.5">{s.label}</div>
                </Card>
              ))}
            </div>

            {/* À arbitrer — urgent */}
            {arbitrer.length > 0 && (
              <>
                <SectionLabel>À arbitrer — ta décision est requise</SectionLabel>
                {arbitrer.map(m => (
                  <Card key={m.id} className="p-4 border-amber/30 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber uppercase tracking-wider">Contradiction détectée</span>
                      <span className="text-[11px] text-g400">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="text-[13.5px] text-charbon font-semibold leading-snug">{m.principe_detecte}</p>
                    <div className="bg-amber/8 rounded-xl px-3 py-2.5 border border-amber/15">
                      <p className="text-[12px] font-bold text-amber mb-1">Question pour toi</p>
                      <p className="text-[13px] text-charbon leading-snug">{m.a_arbitrer}</p>
                    </div>
                    <p className="text-[11.5px] text-g400 italic">Preuve : {m.preuve}</p>
                    <button onClick={() => resolveArbitrage(m.id)}
                      className="w-full py-2.5 rounded-xl bg-charbon text-white text-[13px] font-bold active:scale-[.98] transition">
                      Arbitré — marquer comme résolu
                    </button>
                  </Card>
                ))}
              </>
            )}

            {/* Nouvelle décision */}
            <SectionLabel>Nouvelle décision</SectionLabel>
            <Card className="p-4 flex flex-col gap-3">
              <input value={dSujet} onChange={e => setDSujet(e.target.value)}
                placeholder="Sujet — ex : Ne pas accepter les projets sans acompte"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[14px] text-charbon outline-none focus:border-orange transition" />
              <textarea value={dContexte} onChange={e => setDContexte(e.target.value)}
                rows={3} placeholder="Contexte — enjeu + options + pourquoi cette décision"
                className="w-full bg-sable border border-g200 rounded-xl px-4 py-3 text-[13.5px] text-charbon outline-none focus:border-orange transition resize-none" />
              <div className="flex gap-2">
                <button onClick={() => addDecision('VALIDE')} disabled={!dSujet.trim() || !dContexte.trim() || dSending}
                  className="flex-1 py-3 rounded-xl bg-growth text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition">
                  Validé
                </button>
                <button onClick={() => addDecision('REJETE')} disabled={!dSujet.trim() || !dContexte.trim() || dSending}
                  className="flex-1 py-3 rounded-xl bg-[#D64545] text-white text-[13px] font-bold disabled:opacity-40 active:scale-[.98] transition">
                  Rejeté
                </button>
              </div>
              {decNonTraitees > 0 && (
                <p className="text-[11.5px] text-g400 text-center">{decNonTraitees} décision{decNonTraitees > 1 ? 's' : ''} en attente d'analyse MIROIR (réveil toutes les 30 min)</p>
              )}
            </Card>

            {/* Référentiel actif */}
            {miroirLoading ? (
              <div className="py-8 text-center text-[13px] text-g400">Chargement…</div>
            ) : referentiel.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="text-[13px] text-g400">Référentiel vide — commence par ajouter des décisions.</p>
                <p className="text-[12px] text-g300 mt-1">MIROIR les analysera au prochain réveil.</p>
              </Card>
            ) : (
              <>
                <SectionLabel>Référentiel actif ({referentiel.length} principes)</SectionLabel>
                {categories.map(cat => (
                  <div key={cat} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-px flex-1 bg-g200" />
                      <span className="text-[10px] font-bold text-g400 uppercase tracking-widest px-2">{cat}</span>
                      <div className="h-px flex-1 bg-g200" />
                    </div>
                    {referentiel.filter(m => m.categorie === cat).map(m => (
                      <Card key={m.id} className="px-4 py-3 flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13.5px] text-charbon font-semibold leading-snug flex-1">{m.principe_detecte}</p>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              m.type === 'NOUVEAU'       ? 'bg-orange/10 text-orange' :
                              m.type === 'CONFIRMATION'  ? 'bg-growth/10 text-growth' :
                              m.type === 'NUANCE'        ? 'bg-info/10 text-info' :
                                                           'bg-amber/10 text-amber'
                            }`}>{m.type}</span>
                            <span className={`text-[10px] font-medium ${
                              m.confiance === 'haute' ? 'text-growth' :
                              m.confiance === 'faible' ? 'text-[#D64545]' : 'text-g400'
                            }`}>{m.confiance}</span>
                          </div>
                        </div>
                        <p className="text-[12px] text-g400 leading-snug">{m.referentiel}</p>
                        {m.preuve && <p className="text-[11px] text-g300 italic leading-snug">"{m.preuve.slice(0, 100)}{m.preuve.length > 100 ? '…' : ''}"</p>}
                      </Card>
                    ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Section Feedbacks ── */}
        {section === 'feedbacks' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-[18px] px-[18px]" style={{ scrollbarWidth: 'none' }}>
              {FB_FILTERS.map(f => (
                <button key={f.id} onClick={() => setFbFilter(f.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-bold border-[1.5px] transition ${fbFilter === f.id ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {fbLoading ? (
              <div className="py-8 text-center text-[13px] text-g400">Chargement…</div>
            ) : filteredFeedbacks.length === 0 ? (
              <p className="text-center text-[13px] text-g400 py-8">Aucun feedback pour l'instant.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredFeedbacks.map(fb => {
                  const ctx    = fb.context || {};
                  const isPending = fb.status === 'nouveau';
                  const typeStyle =
                    fb.type === 'bug'    ? 'bg-red-100 text-red-600' :
                    fb.type === 'besoin' ? 'bg-blue-100 text-blue-600' :
                                           'bg-g100 text-g500';
                  return (
                    <Card key={fb.id} className={`px-4 py-3 flex flex-col gap-2 ${isPending ? 'border-orange/30' : 'opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${typeStyle}`}>{fb.type}</span>
                          <span className="text-[12px] font-bold text-charbon truncate">{getUserName(fb.user_id)}</span>
                          <span className="text-[11px] text-g400 flex-shrink-0">{timeAgo(fb.created_at)}</span>
                        </div>
                        {isPending ? (
                          <button onClick={() => markHandled(fb.id)}
                            className="flex-shrink-0 text-[11px] font-bold text-growth border border-growth/40 rounded-full px-2.5 py-1 hover:bg-growth/10 transition">
                            Traité
                          </button>
                        ) : (
                          <span className="text-[10px] text-g400 font-medium flex-shrink-0">traité</span>
                        )}
                      </div>
                      <p className="text-[13px] text-charbon leading-snug">{fb.message}</p>
                      {ctx.agent_id && (
                        <p className="text-[11px] text-g400">
                          Agent : {ctx.agent_id}{ctx.nb_messages ? ` · ${ctx.nb_messages} msg` : ''}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>

    {/* Sheet séquence Awa */}
    {selectedProspect && section === 'prospects' && (
      <Sheet title={`Séquence — ${selectedProspect.prenom}`} onClose={() => { setSelectedProspect(null); setProspectSeq(null); }}>
        {seqLoading ? (
          <div className="py-10 text-center">
            <div className="text-[13px] text-g400 mb-2">Awa prépare la séquence…</div>
            <div className="text-[11px] text-g300">Ça prend 10-15 secondes</div>
          </div>
        ) : !prospectSeq ? (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-g400 text-center py-4">Pas encore de séquence pour ce prospect.</p>
            <button onClick={() => generateSequence(selectedProspect)}
              className="w-full py-3 rounded-xl bg-orange text-white text-[14px] font-bold active:scale-[.98] transition">
              Générer la séquence Awa
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Infos prospect */}
            <div className="bg-sable rounded-xl px-4 py-3 flex flex-col gap-1">
              {selectedProspect.activite && <p className="text-[12.5px] text-g400"><b className="text-charbon">Activité :</b> {selectedProspect.activite}</p>}
              {selectedProspect.besoin && <p className="text-[12.5px] text-g400"><b className="text-charbon">Besoin :</b> {selectedProspect.besoin}</p>}
              {selectedProspect.whatsapp && <p className="text-[12.5px] text-g400"><b className="text-charbon">WA :</b> {selectedProspect.whatsapp}</p>}
            </div>

            {/* Messages */}
            {(prospectSeq.messages || []).map((m, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold text-orange">Étape {m.etape}</span>
                    <span className="text-[12px] text-g400 ml-2">{m.titre}</span>
                  </div>
                  <span className="text-[10.5px] text-g300 bg-g100 rounded-full px-2 py-0.5">{m.delai}</span>
                </div>
                <div className="bg-white border border-g200 rounded-[14px] px-4 py-3">
                  <p className="text-[13.5px] text-charbon leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyMessage(m.message, idx)}
                    className={`flex-1 py-2.5 rounded-xl text-[12.5px] font-bold border-[1.5px] transition ${
                      copiedIdx === idx ? 'bg-growth text-white border-growth' : 'bg-white border-g200 text-g700 hover:border-orange hover:text-orange'
                    }`}>
                    {copiedIdx === idx ? 'Copié !' : 'Copier le message'}
                  </button>
                  {selectedProspect.whatsapp && (
                    <a href={`https://wa.me/${selectedProspect.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(m.message)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366] text-white text-[12.5px] font-bold">
                      <Icon name="send" size={13} />WA
                    </a>
                  )}
                </div>
              </div>
            ))}

            {prospectSeq.notes && (
              <div className="bg-orange/8 border border-orange/20 rounded-xl px-4 py-3">
                <p className="text-[11.5px] font-bold text-orange mb-1">Note d'Awa</p>
                <p className="text-[13px] text-charbon leading-snug italic">{prospectSeq.notes}</p>
              </div>
            )}

            <button onClick={() => generateSequence(selectedProspect)}
              className="w-full py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-g500 hover:border-orange hover:text-orange transition">
              Regénérer une nouvelle séquence
            </button>
          </div>
        )}
      </Sheet>
    )}

    {/* Sheet détail utilisateur */}
    {selectedUser && (
      <Sheet title={userDetail?.prenom || selectedUser.prenom || 'Utilisateur'} onClose={() => setSelectedUser(null)}>
        {detailLoading || !userDetail ? (
          <div className="py-10 text-center text-[13px] text-g400">Chargement…</div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* En-tête */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-orange/15 flex items-center justify-center font-display font-extrabold text-[20px] text-orange flex-shrink-0">
                {(userDetail.prenom || '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-display font-extrabold text-[18px]">{userDetail.prenom || '—'}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Pill tone={userDetail.plan_code === 'manager' ? 'amber' : userDetail.plan_code === 'brasdroit' ? 'growth' : 'neutral'}>
                    {userDetail.plan_code || 'découverte'}
                  </Pill>
                  <span className="text-[12px] text-g400">{userDetail.zone || '—'}</span>
                  {userDetail.role === 'admin' && (
                    <span className="text-[11px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full">admin</span>
                  )}
                </div>
              </div>
            </div>

            {/* Activité */}
            <div>
              <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Activité</p>
              <div className="flex flex-col gap-1.5">
                <DetailRow label="Inscrit" value={userDetail.created_at ? new Date(userDetail.created_at).toLocaleDateString('fr-FR') : '—'} />
                <DetailRow label="Dernière connexion" value={userDetail.last_seen ? timeAgo(userDetail.last_seen) : 'Jamais'} />
                <DetailRow label="Onboarding" value={userDetail.onboarding_done ? 'Terminé' : 'Incomplet'} valueColor={userDetail.onboarding_done ? 'text-growth' : 'text-[#D64545]'} />
                <DetailRow label="Activation" value={userDetail.activation_done ? 'Faite' : 'Non faite'} valueColor={userDetail.activation_done ? 'text-growth' : 'text-g400'} />
                {userDetail.conv_count !== null && <DetailRow label="Conversations" value={String(userDetail.conv_count)} />}
                {userDetail.referral_count > 0 && <DetailRow label="Filleuls" value={`${userDetail.referral_count} (code : ${userDetail.referral_code || '—'})`} />}
              </div>
            </div>

            {/* Profil */}
            {(userDetail.activite || userDetail.canal_principal) && (
              <div>
                <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Profil</p>
                <div className="flex flex-col gap-1.5">
                  {userDetail.activite && <DetailRow label="Activité" value={userDetail.activite} />}
                  {userDetail.canal_principal && <DetailRow label="Canal principal" value={userDetail.canal_principal} />}
                  {userDetail.nom_assistant && <DetailRow label="Nom assistant" value={userDetail.nom_assistant} />}
                </div>
              </div>
            )}

            {/* Ouverture */}
            {userDetail.ouverture && (
              <div>
                <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Question d'ouverture</p>
                <div className="bg-sable rounded-xl px-4 py-3 text-[13px] text-charbon leading-relaxed italic">
                  "{userDetail.ouverture}"
                </div>
              </div>
            )}

            {/* Mémoire */}
            {userDetail.memoire_cache && (
              <div>
                <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Ce que l'assistant sait</p>
                <div className="bg-sable rounded-xl px-4 py-3 text-[12.5px] text-charbon leading-relaxed max-h-[160px] overflow-y-auto">
                  {userDetail.memoire_cache}
                </div>
              </div>
            )}

            {/* Chat admin ↔ user */}
            <div>
              <p className="text-[11px] font-bold text-g400 uppercase tracking-wide mb-2">Échange direct</p>

              {/* Historique */}
              {chatMsgs.length > 0 && (
                <div className="flex flex-col gap-2 mb-3 max-h-[220px] overflow-y-auto">
                  {chatMsgs.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-[14px] px-3 py-2 text-[13px] leading-snug ${
                        m.sender === 'admin'
                          ? 'bg-orange text-white rounded-br-[4px]'
                          : 'bg-sable text-charbon border border-g200 rounded-bl-[4px]'
                      }`}>
                        {m.message}
                        <div className={`text-[10px] mt-1 ${m.sender === 'admin' ? 'text-white/60' : 'text-g400'}`}>
                          {timeAgo(m.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 items-end">
                <Textarea
                  rows={2}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Écrire à ${userDetail.prenom || 'cet utilisateur'}…`}
                  className="flex-1 text-[13.5px]"
                />
                <button
                  onClick={() => sendChat(selectedUser.id, userDetail.prenom)}
                  disabled={!chatInput.trim() || chatSending}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange flex items-center justify-center disabled:opacity-40 transition">
                  <Icon name="send" size={16} className="text-white" />
                </button>
              </div>
            </div>

          </div>
        )}
      </Sheet>
    )}
    </>
  );
}

function DetailRow({ label, value, valueColor = 'text-charbon' }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[12.5px] text-g400 flex-shrink-0">{label}</span>
      <span className={`text-[12.5px] font-medium text-right ${valueColor}`}>{value}</span>
    </div>
  );
}
