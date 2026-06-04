import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Pill, Field, Input, SectionLabel, AppHeader, Icon, Btn, Spinner, Sheet, Textarea } from '../components/ui';
import { detectPlatform } from './InstallScreen';

export function ProfilScreen({ go, notify, dark, setDark, profile }) {
  const [zone, setZone]     = useState(profile?.zone        || 'CI');
  const [ton, setTon]       = useState(profile?.ton_prefere || 'Chaleureux');
  const [prenom, setPrenom] = useState(profile?.prenom      || '');
  const [nomAss, setNomAss] = useState(profile?.nom_assistant || 'Attractor');
  const [email, setEmail]   = useState('');
  const [saving, setSaving]           = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);

  const canInstall = !['installed', 'desktop'].includes(detectPlatform());
  const tons       = ['Chaleureux', 'Direct', 'Fun & rythmé', 'Pro'];
  const initials   = prenom ? prenom.slice(0, 2).toUpperCase() : 'AA';
  const PLAN_LABELS = {
    decouverte: 'Découverte · Gratuit', gratuit: 'Découverte · Gratuit',
    growth: 'Attractor Growth', team: 'Attractor Team', manager: 'Attractor Team',
    personnalise: 'Application Personnalisée',
  };
  const planLabel = PLAN_LABELS[profile?.plan_code] || 'Découverte · Gratuit';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback').insert({
          user_id: user.id,
          type:    feedbackType,
          message: feedbackText.trim(),
          context: { screen: 'profil', plan: profile?.plan_code, prenom: profile?.prenom },
        });
        setFeedbackOpen(false);
        setFeedbackText('');
        notify('Merci, c\'est bien reçu !');
      }
    } catch {
      notify('Erreur lors de l\'envoi');
    } finally {
      setFeedbackSending(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').update({
          prenom:        prenom.trim(),
          nom_assistant: nomAss.trim(),
          zone,
          ton_prefere:   ton,
        }).eq('id', user.id);
        if (error) throw error;
        notify('Profil mis à jour ✓');
      }
    } catch {
      notify('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sable">
      <AppHeader title="Profil" sub="Ton espace, à ton image" />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-orange/30 flex items-center justify-center font-display font-extrabold text-[22px] text-white"
            style={{ background: "linear-gradient(135deg,#FF7A2E,#F25C05)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-extrabold text-[18px] truncate">{prenom || 'Mon profil'}</h3>
            {email && <p className="text-[13px] text-g400 truncate">{email}</p>}
            <Pill tone="orange" className="mt-1.5">{planLabel}</Pill>
          </div>
        </Card>

        <SectionLabel>Préférences</SectionLabel>
        <Card className="p-5 flex flex-col gap-5">
          <Field label="Prénom">
            <Input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Ton prénom" />
          </Field>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Zone</span>
            <div className="flex gap-2">
              {[['CI', "🇨🇮 Côte d'Ivoire"], ['EU', '🇪🇺 Europe / diaspora']].map(([k, l]) => (
                <button key={k} onClick={() => setZone(k)}
                  className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${zone === k ? 'bg-orange text-white border-orange' : 'bg-white border-g200 text-g700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Ton de communication</span>
            <div className="flex flex-wrap gap-2">
              {tons.map(t => (
                <button key={t} onClick={() => setTon(t)}
                  className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${ton === t ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Field label="Nom de ton assistant" hint="Donne-lui un petit nom, ça crée le lien.">
            <Input value={nomAss} onChange={e => setNomAss(e.target.value)} placeholder="Ex : Aya, Max, Stella..." />
          </Field>
          <Btn onClick={save} disabled={saving} className="w-full" icon={saving ? undefined : 'check'}>
            {saving ? (
              <span className="flex items-center gap-2"><Spinner className="w-5 h-5" /> Sauvegarde...</span>
            ) : 'Enregistrer'}
          </Btn>
        </Card>

        <SectionLabel>Partager et gagner</SectionLabel>
        <ReferralCard profile={profile} notify={notify} />

        <SectionLabel>Application</SectionLabel>
        <Card className="p-2">
          <ToggleRow icon="moon" label="Mode sombre" on={dark} onClick={() => setDark(!dark)} />
          <NavRow icon="medal" label="Mes paliers & forfait" onClick={() => go('paliers')} />
          {canInstall && <NavRow icon="bolt" label="Installer l'app sur mon téléphone" onClick={() => go('install')} />}
          <NavRow icon="settings" label="Notifications" onClick={() => go('notifications')} />
          <NavRow icon="flag" label="Un bug ou une idée ?" onClick={() => setFeedbackOpen(true)} last />
        </Card>

        {feedbackOpen && (
          <Sheet title="Un bug ou une idée ?" onClose={() => setFeedbackOpen(false)}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {[['bug', 'Un bug'], ['besoin', 'Une idée']].map(([k, l]) => (
                  <button key={k} onClick={() => setFeedbackType(k)}
                    className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${feedbackType === k ? 'bg-charbon text-white border-charbon' : 'bg-white border-g200 text-g700'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <Textarea
                rows={4}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder={feedbackType === 'bug' ? "Décris ce qui ne fonctionne pas…" : "Qu'est-ce qui manque ou pourrait être mieux ?"}
              />
              <Btn onClick={sendFeedback} disabled={!feedbackText.trim() || feedbackSending} className="w-full">
                {feedbackSending ? 'Envoi…' : 'Envoyer'}
              </Btn>
            </div>
          </Sheet>
        )}

        <button onClick={() => go('logout')}
          className="w-full py-3.5 text-[14px] font-bold text-[#D64545] rounded-xl hover:bg-[#D64545]/8 transition">
          Se déconnecter
        </button>
        <p className="text-center text-[11px] text-g400 px-6 leading-relaxed">
          Attractor Assists · TVA non applicable, art. 293 B du CGI
        </p>
      </div>
    </div>
  );
}

function ReferralCard({ profile, notify }) {
  const code    = profile?.referral_code || '';
  const count   = profile?.referral_count || 0;
  const bonus   = count * 5;
  const appUrl  = 'https://assists.agenceattractor.com';
  const refLink = code ? `${appUrl}?ref=${code}` : appUrl;

  const copyLink = () => {
    navigator.clipboard?.writeText(refLink);
    notify('Lien copié !');
  };

  const shareWhatsApp = () => {
    const prenom = profile?.prenom || '';
    const text = encodeURIComponent(
      `${prenom ? `Salut, c'est ${prenom}. ` : ''}Je teste Attractor Assists — le bras droit IA gratuit pour les entrepreneurs. Rejoins-moi ici : ${refLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!code) return null;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
          <Icon name="send" size={20} className="text-orange" />
        </div>
        <div>
          <h3 className="font-display font-bold text-[15px] text-charbon">Invite et gagne des messages</h3>
          <p className="text-[12.5px] text-g400 leading-snug mt-0.5">
            +5 messages par jour pour chaque personne qui s'inscrit via ton lien.
          </p>
        </div>
      </div>

      {count > 0 && (
        <div className="flex items-center gap-3 bg-growth/8 border border-growth/20 rounded-[14px] px-4 py-3 mb-4">
          <Icon name="check" size={18} className="text-growth" />
          <div>
            <p className="text-[13.5px] font-bold text-charbon">
              {count} filleul{count > 1 ? 's' : ''} — +{bonus} messages/jour
            </p>
            <p className="text-[11.5px] text-g400">Continue à partager pour en gagner plus.</p>
          </div>
        </div>
      )}

      <div className="bg-sable border border-g200 rounded-[12px] px-3.5 py-3 flex items-center justify-between gap-2 mb-3">
        <span className="text-[13px] font-mono text-g700 truncate">{refLink}</span>
        <button onClick={copyLink} className="flex-shrink-0 text-orange font-bold text-[12.5px] flex items-center gap-1">
          <Icon name="copy" size={14} /> Copier
        </button>
      </div>

      <button onClick={shareWhatsApp}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[14px] font-bold text-[14.5px] text-white"
        style={{ background: '#25D366' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Partager sur WhatsApp
      </button>
    </Card>
  );
}

function ToggleRow({ icon, label, on, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-sable transition">
      <div className="w-9 h-9 rounded-lg bg-charbon/6 flex items-center justify-center text-charbon">
        <Icon name={icon} size={18} />
      </div>
      <span className="flex-1 text-left font-semibold text-[14.5px]">{label}</span>
      <span className={`w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-orange' : 'bg-g200'}`}>
        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

function NavRow({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-sable transition">
      <div className="w-9 h-9 rounded-lg bg-charbon/6 flex items-center justify-center text-charbon">
        <Icon name={icon} size={18} />
      </div>
      <span className="flex-1 text-left font-semibold text-[14.5px]">{label}</span>
      <Icon name="chevron" size={18} className="text-g400" />
    </button>
  );
}
