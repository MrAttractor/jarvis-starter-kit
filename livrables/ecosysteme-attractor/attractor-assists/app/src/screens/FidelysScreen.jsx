import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sheet, Spinner } from '../components/ui';

const TIERS = [
  { name: 'Bronze', min: 0,    color: '#CD7F32' },
  { name: 'Argent', min: 200,  color: '#A8A9AD' },
  { name: 'Or',     min: 500,  color: '#FFD700' },
  { name: 'Élite',  min: 1000, color: '#F25C05' },
];
const FREE_LIMIT = 10;

function getTier(pts) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (pts >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

function daysBetween(d1, d2) {
  return Math.ceil((d2 - d1) / 86400000);
}

function StarIcon({ size = 24, color = 'white', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PlusIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UsersIcon({ size = 24, color = '#9A938B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function FidelysScreen({ go, notify, profile }) {
  const [program, setProgram]   = useState(null);
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [addSheet, setAddSheet] = useState(false);
  const [form, setForm]         = useState({ prenom: '', telephone: '' });
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);

  const isFree  = !profile?.plan_code || profile.plan_code === 'gratuit';
  const atLimit = isFree && clients.length >= FREE_LIMIT;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: prog } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prog) {
        const { data: created } = await supabase
          .from('loyalty_programs')
          .insert({ user_id: user.id, business_name: profile?.activite || 'Mon business' })
          .select()
          .single();
        prog = created;
      }
      setProgram(prog);

      const { data: cls } = await supabase
        .from('loyalty_clients')
        .select('*')
        .eq('program_id', prog.id)
        .order('points', { ascending: false });
      setClients(cls || []);
    } catch (e) {
      console.error('Fidelys load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!form.prenom.trim() || !program) return;
    if (atLimit) { notify('Limite atteinte. Passe à Growth pour continuer.'); setAddSheet(false); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('loyalty_clients')
        .insert({ program_id: program.id, user_id: user.id, prenom: form.prenom.trim(), telephone: form.telephone.trim() || null, tag: 'nouveau' })
        .select()
        .single();
      if (error) throw error;
      setClients(c => [data, ...c]);
      setForm({ prenom: '', telephone: '' });
      setAddSheet(false);
      notify(`${data.prenom} ajouté.`);
    } catch { notify('Erreur — réessaie.'); }
    finally { setSaving(false); }
  };

  const givePoints = async (client) => {
    const pts = program?.points_per_purchase || 10;
    const newPts = client.points + pts;
    try {
      await Promise.all([
        supabase.from('loyalty_transactions').insert({ client_id: client.id, program_id: program.id, points: pts, description: 'Achat' }),
        supabase.from('loyalty_clients').update({ points: newPts, last_visit: new Date().toISOString() }).eq('id', client.id),
      ]);
      setClients(c => c.map(x => x.id === client.id ? { ...x, points: newPts } : x).sort((a, b) => b.points - a.points));
      notify(`+${pts} pts pour ${client.prenom} !`);
    } catch { notify('Erreur points.'); }
  };

  const copyLink = () => {
    const slug = profile?.slug || profile?.id?.slice(0, 8) || 'mon-lien';
    navigator.clipboard.writeText(`https://assists.agenceattractor.com/b/${slug}/fidelys`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPoints  = clients.reduce((s, c) => s + c.points, 0);
  const now          = Date.now();
  const inactifCount = clients.filter(c => daysBetween(new Date(c.last_visit), now) > 30).length;

  const birthdayAlerts = clients.filter(c => {
    if (!c.birthday) return false;
    const bd = new Date(c.birthday);
    const bdThisYear = new Date(new Date().getFullYear(), bd.getMonth(), bd.getDate());
    const diff = daysBetween(now, bdThisYear);
    return diff >= 0 && diff <= 7;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sable">
      <Spinner className="w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-sable pb-32">

      {/* Header gradient */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(150deg, #1E5631 0%, #2d7a47 50%, #F25C05 100%)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/60 text-[11px] font-display font-bold tracking-widest uppercase mb-1">Attractor</p>
            <h1 className="text-white font-display font-bold text-[30px] leading-none">Fidelys</h1>
            <p className="text-white/75 text-[13px] mt-1.5">Fidélise · Récompense · Fais revenir</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mt-1">
            <StarIcon size={26} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Clients', value: clients.length + (isFree ? `/${FREE_LIMIT}` : '') },
            { label: 'Points distribués', value: totalPoints >= 1000 ? `${(totalPoints / 1000).toFixed(1)}k` : totalPoints },
            { label: 'Inactifs +30j', value: inactifCount },
          ].map((k, i) => (
            <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3">
              <div className="text-white font-display font-bold text-[20px] leading-none">{k.value}</div>
              <div className="text-white/65 text-[10.5px] mt-1 leading-tight">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-3.5">

        {/* Lien fidélité */}
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-[10.5px] font-display font-bold text-g500 uppercase tracking-wider mb-2.5">Lien carte fidélité</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-sable rounded-xl px-3 py-2.5 overflow-hidden">
              <p className="text-[11.5px] text-g700 font-mono truncate">
                assists.agenceattractor.com/b/{profile?.slug || profile?.id?.slice(0, 8) || '...'}/fidelys
              </p>
            </div>
            <button
              onClick={copyLink}
              className="flex-shrink-0 px-3.5 py-2.5 rounded-xl text-[12px] font-display font-bold transition-colors"
              style={{ background: copied ? '#1E5631' : '#F25C05', color: 'white' }}
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <p className="text-[11px] text-g400 mt-2">Partage ce lien à tes clients pour qu'ils consultent leurs points.</p>
        </div>

        {/* Alerte anniversaires */}
        {birthdayAlerts.length > 0 && (
          <div className="bg-amber/8 border border-amber/25 rounded-2xl p-4">
            <p className="text-[12px] font-display font-bold text-charbon mb-2">
              Anniversaires dans 7 jours
            </p>
            <div className="space-y-1">
              {birthdayAlerts.map(c => {
                const bd = new Date(c.birthday);
                const bdThisYear = new Date(new Date().getFullYear(), bd.getMonth(), bd.getDate());
                const diff = daysBetween(now, bdThisYear);
                return (
                  <p key={c.id} className="text-[13px] text-charbon">
                    🎂 {c.prenom} — dans {diff} jour{diff > 1 ? 's' : ''}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Alerte inactifs */}
        {inactifCount > 0 && (
          <div className="bg-orange/6 border border-orange/15 rounded-2xl p-4">
            <p className="text-[13px] font-display font-bold text-orange">
              {inactifCount} client{inactifCount > 1 ? 's' : ''} inactif{inactifCount > 1 ? 's' : ''} depuis +30 jours
            </p>
            <p className="text-[12px] text-g500 mt-0.5">
              Envoie-leur des points bonus ou un message de relance pour les faire revenir.
            </p>
          </div>
        )}

        {/* Gate plan gratuit */}
        {isFree && clients.length >= 8 && (
          <div className="bg-growth/8 border border-growth/20 rounded-2xl p-4">
            <p className="text-[13px] font-display font-bold text-growth mb-1">
              Tu approches la limite — {clients.length}/{FREE_LIMIT} clients
            </p>
            <p className="text-[12px] text-g500 mb-3">
              Passe à Growth pour des clients illimités et la fidélisation automatique.
            </p>
            <button
              onClick={() => go('paliers')}
              className="bg-growth text-white text-[12px] font-display font-bold px-4 py-2 rounded-xl"
            >
              Voir Growth
            </button>
          </div>
        )}

        {/* Liste clients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-[16px] text-charbon">Tes clients</h2>
            <button
              onClick={() => atLimit ? go('paliers') : setAddSheet(true)}
              className="flex items-center gap-1.5 text-white text-[12px] font-display font-bold px-3 py-2 rounded-xl"
              style={{ background: '#F25C05' }}
            >
              <PlusIcon size={13} />
              Ajouter
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-soft">
              <div className="w-14 h-14 rounded-full bg-sable flex items-center justify-center mx-auto mb-3">
                <UsersIcon />
              </div>
              <p className="text-g400 text-[13px]">Aucun client encore.</p>
              <p className="text-g400 text-[12px] mt-1">Ajoute ton premier client pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map(c => {
                const tier = getTier(c.points);
                const nextTier = TIERS.find(t => t.min > c.points);
                const ptsToNext = nextTier ? nextTier.min - c.points : 0;
                return (
                  <div key={c.id} className="bg-white rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-[15px] text-white"
                        style={{ background: tier.color }}
                      >
                        {c.prenom.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-[14px] text-charbon">{c.prenom}</span>
                          {c.tag === 'vip' && (
                            <span className="bg-amber/15 text-amber text-[10px] font-bold px-1.5 py-0.5 rounded-full">VIP</span>
                          )}
                          {c.tag === 'nouveau' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#1E563115', color: '#1E5631' }}>Nouveau</span>
                          )}
                          {c.tag === 'inactif' && (
                            <span className="bg-g200 text-g500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Inactif</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[12px] text-g400">{c.points} pts</span>
                          <span className="text-g200 text-[10px]">·</span>
                          <span className="text-[11px] font-bold" style={{ color: tier.color }}>{tier.name}</span>
                          {nextTier && (
                            <span className="text-[11px] text-g400">{ptsToNext} pts vers {nextTier.name}</span>
                          )}
                        </div>
                      </div>

                      {/* +points button */}
                      <button
                        onClick={() => givePoints(c)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{ background: '#F25C0515', color: '#F25C05' }}
                        title={`+${program?.points_per_purchase || 10} pts`}
                      >
                        <PlusIcon size={16} color="#F25C05" />
                      </button>
                    </div>

                    {/* Progress bar vers le prochain tier */}
                    {nextTier && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-g100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              background: tier.color,
                              width: `${Math.min(100, ((c.points - getTier(c.points).min) / (nextTier.min - getTier(c.points).min)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sheet ajout client */}
      {addSheet && (
        <Sheet onClose={() => setAddSheet(false)} title="Nouveau client">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-display font-bold text-g500 uppercase tracking-wider">
                Prénom *
              </label>
              <input
                className="mt-1.5 w-full px-4 py-3 bg-sable border border-g200 rounded-xl text-[14px] text-charbon focus:outline-none focus:border-orange"
                placeholder="Ex : Aya"
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] font-display font-bold text-g500 uppercase tracking-wider">
                Téléphone (optionnel)
              </label>
              <input
                className="mt-1.5 w-full px-4 py-3 bg-sable border border-g200 rounded-xl text-[14px] text-charbon focus:outline-none focus:border-orange"
                placeholder="+225 07..."
                value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                inputMode="tel"
              />
            </div>
            <button
              onClick={addClient}
              disabled={saving || !form.prenom.trim()}
              className="w-full text-white font-display font-bold text-[15px] py-3.5 rounded-xl disabled:opacity-50 transition-opacity"
              style={{ background: '#F25C05' }}
            >
              {saving ? 'Ajout...' : 'Ajouter le client'}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
