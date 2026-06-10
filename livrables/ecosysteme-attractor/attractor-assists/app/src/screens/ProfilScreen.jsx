import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner, Sheet, Textarea } from '../components/ui';
import { detectPlatform } from './InstallScreen';

const PLAN_LABELS = {
  decouverte: 'Plan Gratuit', decouverte_eu: 'Plan Gratuit', gratuit: 'Plan Gratuit',
  growth: 'Plan Bras Droit', growth_eu: 'Plan Bras Droit', bras_droit: 'Plan Bras Droit',
  team: 'Plan Team', manager: 'Plan Team', personnalise: 'Plan Sur Mesure',
};
const PLAN_IS_PAID = ['growth', 'growth_eu', 'bras_droit', 'team', 'manager', 'personnalise'];

function Divider() {
  return <div className="h-px bg-g200 mx-4" />;
}

function SettingRow({ label, sub, value, actionLabel, onClick, children }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-g100 transition rounded-xl text-left">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-g400 uppercase tracking-[.08em]">{label}</div>
        {sub && <div className="text-[13.5px] font-semibold text-charbon mt-0.5">{sub}</div>}
        {children}
      </div>
      {actionLabel
        ? <span className="text-[13px] font-bold text-orange flex-shrink-0">{actionLabel}</span>
        : <Icon name="chevron" size={18} className="text-g300 flex-shrink-0" />
      }
    </button>
  );
}

export function ProfilScreen({ go, notify, dark, setDark, profile }) {
  const [nomAss, setNomAss]   = useState(profile?.nom_assistant || '');
  const [prenom, setPrenom]   = useState(profile?.prenom || '');
  const [activite, setActivite] = useState(profile?.activite || '');
  const [email, setEmail]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [sheetOpen, setSheetOpen] = useState(null);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  const canInstall  = !['installed', 'desktop'].includes(detectPlatform());
  const planCode    = profile?.plan_code || 'gratuit';
  const planLabel   = PLAN_LABELS[planCode] || 'Plan Gratuit';
  const isPaid      = PLAN_IS_PAID.includes(planCode);
  const initials    = (profile?.prenom || 'AA').slice(0, 2).toUpperCase();
  const slug        = profile?.public_slug;
  const boutiqueUrl = slug ? `${window.location.origin}/b/${slug}` : null;
  const refCode     = profile?.referral_code;
  const refCount    = profile?.referral_count || 0;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const saveField = async (fields) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update(fields).eq('id', user.id);
        notify('Sauvegardé');
      }
    } catch { notify('Erreur lors de la sauvegarde'); }
    setSaving(false);
  };

  const copyBoutique = () => {
    if (!boutiqueUrl) return;
    navigator.clipboard.writeText(boutiqueUrl);
    notify('Lien copié !');
  };

  const shareWA = () => {
    if (!boutiqueUrl) return;
    const text = encodeURIComponent(`Commande ici 👇\n${boutiqueUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback').insert({
          user_id: user.id, type: feedbackType,
          message: feedbackText.trim(),
          context: { screen: 'profil', plan: planCode, prenom: profile?.prenom },
        });
        setSheetOpen(null); setFeedbackText('');
        notify('Merci, c\'est bien reçu !');
      }
    } catch { notify('Erreur lors de l\'envoi'); }
    setFeedbackSending(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-sable pb-10">

      {/* Hero profil */}
      <div className="relative px-4 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-[60px] h-[60px] rounded-[20px] flex items-center justify-center font-display font-extrabold text-[20px] text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[19px] text-charbon leading-tight">{profile?.prenom || 'Mon profil'}</div>
            <div className="text-[12.5px] text-g400 mt-0.5 truncate">{profile?.activite || 'Ton activité'}</div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${isPaid ? 'bg-vert/10 text-vert' : 'bg-g100 text-g500'}`}>
            {isPaid ? 'Bras Droit' : 'Gratuit'}
          </span>
        </div>
      </div>

      {/* Raccourcis rapides */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: 'chat', label: 'Assists', screen: 'conversation' },
            { icon: 'package', label: 'Catalogue', screen: 'catalogue' },
            { icon: 'users', label: 'Clients', screen: 'carnet' },
            { icon: 'star', label: 'Fidelys', screen: 'fidelys' },
          ].map(({ icon, label, screen }) => (
            <button
              key={screen}
              onClick={() => go(screen)}
              className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-2xl border border-g200 shadow-soft active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center">
                <Icon name={icon} size={18} className="text-orange" />
              </div>
              <span className="text-[11px] font-bold text-charbon">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">

        {/* Carte boutique */}
        {boutiqueUrl ? (
          <div className="bg-white rounded-2xl border border-g200 shadow-soft overflow-hidden">
            <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Ma boutique</div>
                <div className="text-[13px] font-bold text-orange mt-0.5 truncate">/b/{slug}</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-vert/10 flex items-center justify-center">
                <Icon name="check" size={16} className="text-vert" />
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-3.5">
              <button
                onClick={copyBoutique}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <Icon name="copy" size={13} /> Copier
              </button>
              <button
                onClick={shareWA}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-g200 text-[12.5px] font-bold text-charbon bg-sable active:bg-g100 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WA
              </button>
              <button
                onClick={() => go('mon-app')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-orange/30 text-[12.5px] font-bold text-orange bg-orange/5 active:bg-orange/10 transition"
              >
                <Icon name="settings" size={13} /> Modifier
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => go('mon-app')}
            className="w-full rounded-2xl overflow-hidden shadow-soft active:scale-[.98] transition"
            style={{ background: 'linear-gradient(135deg,#FF7A2E,#F25C05)' }}
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon name="bolt" size={22} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-display font-extrabold text-[15px] text-white">Créer ma boutique</div>
                <div className="text-[12px] text-white/75 mt-0.5">Reçois des commandes par lien WhatsApp</div>
              </div>
              <Icon name="chevron" size={18} className="text-white/60 flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Plan + upgrade */}
        {!isPaid && (
          <button
            onClick={() => go('paliers')}
            className="w-full rounded-2xl border border-orange/25 px-4 py-3.5 flex items-center gap-3 bg-orange/5 active:bg-orange/10 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-orange/15 flex items-center justify-center flex-shrink-0">
              <Icon name="bolt" size={18} className="text-orange" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-display font-bold text-[14px] text-charbon">Passer en Bras Droit</div>
              <div className="text-[12px] text-g500 mt-0.5">Assists illimité · 9 900 FCFA/mois</div>
            </div>
            <span className="text-[12px] font-bold text-orange bg-orange/10 px-2.5 py-1 rounded-full flex-shrink-0">Upgrader</span>
          </button>
        )}

        {/* Outils */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Formation & méthode</span>
          </div>
          <SettingRow label="Ma formation" sub="5 modules · À ton rythme" onClick={() => go('formation')} />
          <Divider />
          <SettingRow label="La Méthode" sub="Framework interactif" onClick={() => go('methode')} />
          <Divider />
          <SettingRow label="Mon agenda" sub="Calendrier & priorités" onClick={() => go('agenda')} />
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Configuration</span>
          </div>

          <SettingRow
            label="Mon activité"
            actionLabel="Modifier"
            onClick={() => setSheetOpen('activite')}
          >
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-g100 text-[12.5px] font-semibold text-charbon mt-1">
              {profile?.activite || 'Non défini'}
            </span>
          </SettingRow>
          <Divider />

          <SettingRow
            label="Mon bras droit"
            sub={profile?.nom_assistant || 'Non nommé'}
            actionLabel="Renommer"
            onClick={() => setSheetOpen('bras_droit')}
          />
          <Divider />

          {isPaid && (
            <SettingRow label="Mon plan" sub={planLabel} onClick={() => go('paliers')} />
          )}

          {refCode && (
            <>
              {isPaid && <Divider />}
              <SettingRow
                label="Parrainage"
                onClick={() => {
                  const link = `${window.location.origin}?ref=${refCode}`;
                  navigator.clipboard.writeText(link);
                  notify('Lien de parrainage copié !');
                }}
              >
                <div className="text-[12.5px] font-semibold text-charbon mt-0.5">
                  {refCount} filleul{refCount !== 1 ? 's' : ''} · gagne 1 mois Bras Droit
                </div>
              </SettingRow>
            </>
          )}
        </div>

        {/* Application */}
        <div className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold text-g400 uppercase tracking-[.1em]">Application</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13.5px] font-semibold text-charbon">Mode sombre</span>
            <button
              onClick={() => setDark(!dark)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${dark ? 'bg-orange' : 'bg-g200'}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <Divider />
          {canInstall && (
            <>
              <SettingRow label="Installer l'app" sub="Ajouter à l'écran d'accueil" onClick={() => go('install')} />
              <Divider />
            </>
          )}
          <SettingRow label="Notifications" onClick={() => go('notifications')} />
          <Divider />
          <SettingRow label="Un bug ou une idée ?" onClick={() => setSheetOpen('feedback')} />
        </div>

        <button
          onClick={() => go('logout')}
          className="w-full py-3.5 text-[14px] font-bold text-[#D64545] rounded-xl bg-white border border-g200 active:bg-[#D64545]/8 transition mt-1"
        >
          Se déconnecter
        </button>
        <p className="text-center text-[11px] text-g400 px-6 leading-relaxed">
          Attractor Assists · Agence Attractor
        </p>
      </div>

      {/* Sheet — renommer bras droit */}
      {sheetOpen === 'bras_droit' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Renommer ton bras droit</div>
            <input
              type="text"
              value={nomAss}
              onChange={e => setNomAss(e.target.value)}
              placeholder="Ex : Aya, Max, Stella…"
              className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[15px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={() => { saveField({ nom_assistant: nomAss.trim() }); setSheetOpen(null); }}
              disabled={saving || !nomAss.trim()}
              className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] disabled:opacity-50"
            >
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Sheet — modifier activité */}
      {sheetOpen === 'activite' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Mon activité</div>
            <input
              type="text"
              value={activite}
              onChange={e => setActivite(e.target.value)}
              placeholder="Ex : Restauration · Abidjan"
              className="w-full px-4 py-3.5 rounded-xl border border-g200 bg-sable text-[15px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={() => { saveField({ activite: activite.trim() }); setSheetOpen(null); }}
              disabled={saving || !activite.trim()}
              className="w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.6)] disabled:opacity-50"
            >
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Sheet — feedback */}
      {sheetOpen === 'feedback' && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setSheetOpen(null)}>
          <div className="w-full bg-white rounded-t-[28px] p-6 pb-10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-g200 mx-auto mb-1" />
            <div className="font-display font-bold text-[17px] text-charbon">Un bug ou une idée ?</div>
            <div className="flex gap-2">
              {[['bug', 'Un bug'], ['besoin', 'Une idée']].map(([k, l]) => (
                <button key={k} onClick={() => setFeedbackType(k)}
                  className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${feedbackType === k ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
                  {l}
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder={feedbackType === 'bug' ? 'Décris ce qui ne fonctionne pas…' : 'Qu\'est-ce qui manque ou pourrait être mieux ?'}
              className="w-full px-4 py-3 rounded-xl border border-g200 bg-sable text-[14px] text-charbon outline-none focus:border-orange resize-none"
            />
            <button
              onClick={sendFeedback}
              disabled={!feedbackText.trim() || feedbackSending}
              className="w-full py-4 rounded-2xl bg-charbon text-white font-display font-bold text-[15px] disabled:opacity-50"
            >
              {feedbackSending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
