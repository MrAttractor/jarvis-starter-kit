import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';

function isPlanGrowthOrPro(profile) {
  if (!profile) return false;
  const tier = profile.plan_tier;
  if (tier && tier !== 'gratuit') return true;
  // compat plan_code legacy
  return ['bras_droit','growth','growth_eu','team','manager','personnalise','pro'].includes(profile.plan_code);
}

export function FidelysScreen({ go, notify, profile }) {
  const [clients, setClients]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rewardAfter, setRewardAfter] = useState(5);
  const [rewardLabel, setRewardLabel] = useState('Commande offerte');
  const [editReward, setEditReward]   = useState(false);
  const [savingReward, setSavingReward] = useState(false);

  const unlocked = isPlanGrowthOrPro(profile);

  useEffect(() => {
    if (!unlocked) return;
    setRewardAfter(profile?.fidelys_reward_after || 5);
    setRewardLabel(profile?.fidelys_reward_label || 'Commande offerte');
    load();
  }, [unlocked]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('boutique_clients')
        .select('*')
        .order('commandes_count', { ascending: false });
      setClients(data || []);
    } catch {}
    setLoading(false);
  };

  const saveReward = async () => {
    setSavingReward(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({
        fidelys_reward_after: rewardAfter,
        fidelys_reward_label: rewardLabel.trim() || 'Commande offerte',
      }).eq('id', user.id);
      setEditReward(false);
      notify('Récompense enregistrée.');
    } catch { notify('Erreur — réessaie.'); }
    setSavingReward(false);
  };

  // ── Gate : plan gratuit ──────────────────────────────────────────────────────

  if (!unlocked) return (
    <div className="flex flex-col h-full bg-sable px-5 pt-safe pb-10">
      <button onClick={() => go('profil')} className="flex items-center gap-2 h-11 pr-3 -ml-1 text-g500 text-[13px] mb-4 self-start">
        <Icon name="back" size={16} /> Retour
      </button>
      <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center">
          <Icon name="star" size={28} className="text-orange" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-[22px] text-charbon mb-2">Fidelys</h2>
          <p className="text-[14px] text-g500 max-w-[280px] mx-auto leading-relaxed">
            Fais revenir tes clients en récompensant leur fidélité. Automatique depuis ton mini-site.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-g200 p-4 w-full text-left shadow-soft">
          {[
            'Suivi automatique de chaque client qui commande',
            'Alerte quand un client mérite sa récompense',
            'Carte fidélité visible sur ton mini-site',
          ].map((f, i) => (
            <div key={i} className={`flex items-start gap-2.5 py-3 ${i < 2 ? 'border-b border-g100' : ''}`}>
              <Icon name="check" size={14} className="text-vert mt-0.5 flex-shrink-0" />
              <span className="text-[13px] text-charbon">{f}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => go('paliers')}
          className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] active:opacity-85 transition"
        >
          Passer à Growth — 9 900 FCFA / 15 €
        </button>
      </div>
    </div>
  );

  // ── Écran principal (Growth / Pro) ───────────────────────────────────────────

  const totalCommandes = clients.reduce((s, c) => s + c.commandes_count, 0);
  const rewardReady    = clients.filter(c => c.commandes_count >= rewardAfter && c.commandes_count % rewardAfter === 0);

  return (
    <div className="flex flex-col h-full bg-sable">

      {/* Header gradient */}
      <div className="px-5 pt-safe pb-5 flex-shrink-0"
        style={{ background: 'linear-gradient(150deg, #1E5631 0%, #2d7a47 60%, #F25C05 100%)' }}>
        {/* Même retour que sur la version verrouillée : l'écran s'ouvre depuis le Profil. */}
        <button onClick={() => go('profil')} aria-label="Retour" className="flex items-center gap-1.5 h-11 pr-3 -ml-1 mb-1 text-white/75 text-[13px] font-semibold active:text-white transition">
          <Icon name="back" size={17} /> Retour
        </button>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/60 text-[11px] font-bold tracking-widest uppercase mb-1">Attractor</p>
            <h1 className="text-white font-display font-bold text-[26px] leading-none">Fidelys</h1>
            <p className="text-white/70 text-[12.5px] mt-1">Fidélise · Récompense · Fais revenir</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <Icon name="star" size={22} className="text-white" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Clients',   value: clients.length },
            { label: 'Commandes', value: totalCommandes },
            { label: 'À récomp.', value: rewardReady.length },
          ].map((k, i) => (
            <div key={i} className="bg-white/15 rounded-xl p-3">
              <div className="text-white font-display font-bold text-[20px] leading-none">{k.value}</div>
              <div className="text-white/65 text-[10.5px] mt-1 leading-tight">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {/* Alerte récompenses prêtes */}
        {rewardReady.length > 0 && (
          <div className="bg-orange/8 border border-orange/25 rounded-2xl p-4">
            <p className="text-[13px] font-display font-bold text-orange mb-1.5">
              {rewardReady.length} client{rewardReady.length > 1 ? 's' : ''} à récompenser
            </p>
            {rewardReady.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-[13px] text-charbon">{c.client_name || c.client_contact}</span>
                {c.client_contact && (
                  <a
                    href={`https://wa.me/${c.client_contact.replace(/\D/g, '')}?text=${encodeURIComponent(`Tu as atteint ${rewardAfter} commandes chez nous ! Tu as droit à : ${rewardLabel}`)}`}
                    target="_blank" rel="noreferrer"
                    className="text-[11.5px] font-bold text-vert"
                  >
                    Notifier WA
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Config récompense */}
        <div className="bg-white rounded-2xl border border-g200 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-[14px] text-charbon">Ma récompense</p>
            <button
              onClick={() => setEditReward(!editReward)}
              className="text-[12px] font-bold text-orange"
            >
              {editReward ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          {editReward ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-g500 uppercase tracking-wider block mb-1.5">
                  Après combien de commandes ?
                </label>
                <input
                  type="number"
                  value={rewardAfter}
                  min="2"
                  max="20"
                  onChange={e => setRewardAfter(Math.max(2, Math.min(20, parseInt(e.target.value) || 5)))}
                  className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[16px] text-charbon outline-none focus:border-orange"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-g500 uppercase tracking-wider block mb-1.5">
                  Quelle récompense ?
                </label>
                <input
                  type="text"
                  value={rewardLabel}
                  onChange={e => setRewardLabel(e.target.value)}
                  placeholder="Ex : Transport offert"
                  className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[16px] text-charbon outline-none focus:border-orange"
                />
              </div>
              <button
                onClick={saveReward}
                disabled={savingReward || !rewardLabel.trim()}
                className="w-full py-3 rounded-xl bg-orange text-white font-display font-bold text-[14px] disabled:opacity-50 transition"
              >
                {savingReward ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          ) : (
            <div className="bg-sable rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="text-center flex-shrink-0">
                <div className="font-display font-extrabold text-[26px] text-orange leading-none">{rewardAfter}</div>
                <div className="text-[10.5px] text-g500">commandes</div>
              </div>
              <div className="w-px h-10 bg-g200" />
              <div>
                <div className="font-display font-bold text-[14px] text-charbon">{rewardLabel}</div>
                <div className="text-[11.5px] text-g400">offert à chaque palier</div>
              </div>
            </div>
          )}
        </div>

        {/* Liste clients */}
        <div>
          <p className="text-[11px] font-bold text-g500 uppercase tracking-wider mb-3">
            Clients ({clients.length})
          </p>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-g200 p-8 text-center shadow-soft">
              <div className="w-14 h-14 rounded-full bg-g100 flex items-center justify-center mx-auto mb-3">
                <Icon name="users" size={24} className="text-g300" />
              </div>
              <p className="font-display font-bold text-[14.5px] text-charbon mb-1">Aucun client encore</p>
              <p className="text-[12.5px] text-g500 max-w-[220px] mx-auto leading-relaxed">
                Ils apparaîtront ici automatiquement dès leur première commande sur ton site.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.map(c => {
                const progression  = c.commandes_count % rewardAfter;
                const pct          = Math.round((progression / rewardAfter) * 100);
                const earned       = Math.floor(c.commandes_count / rewardAfter);
                const nextIn       = rewardAfter - progression;
                const isReady      = progression === 0 && c.commandes_count > 0;
                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-2xl border shadow-soft p-4 ${isReady ? 'border-orange/40' : 'border-g200'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-[15px] text-white flex-shrink-0 ${isReady ? 'bg-orange' : 'bg-charbon'}`}>
                        {(c.client_name || c.client_contact || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-[14px] text-charbon truncate">
                          {c.client_name || c.client_contact}
                        </div>
                        {c.client_name && (
                          <div className="text-[11.5px] text-g400 truncate">{c.client_contact}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-bold text-[17px] text-charbon">{c.commandes_count}</div>
                        <div className="text-[10px] text-g400">cmd</div>
                      </div>
                    </div>

                    <div className="h-1.5 bg-g100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${isReady ? 'bg-orange' : 'bg-vert'}`}
                        style={{ width: isReady ? '100%' : `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {isReady ? (
                        <p className="text-[12px] font-bold text-orange">Récompense disponible !</p>
                      ) : (
                        <p className="text-[11.5px] text-g400">
                          {earned > 0 ? `${earned} récompense${earned > 1 ? 's' : ''} · ` : ''}
                          {nextIn} cmd{nextIn > 1 ? 's' : ''} pour {rewardLabel}
                        </p>
                      )}
                      {isReady && c.client_contact && (
                        <a
                          href={`https://wa.me/${c.client_contact.replace(/\D/g, '')}?text=${encodeURIComponent(`Bravo ! Tu as atteint ${rewardAfter} commandes. Tu as droit à : ${rewardLabel} 🎉`)}`}
                          target="_blank" rel="noreferrer"
                          className="text-[11.5px] font-bold text-vert"
                        >
                          Notifier WA
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
