import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, Pill, Field, Input, SectionLabel, AppHeader, Icon, Btn, Spinner } from '../components/ui';
import { detectPlatform } from './InstallScreen';

export function ProfilScreen({ go, notify, dark, setDark, profile }) {
  const [zone, setZone]     = useState(profile?.zone        || 'CI');
  const [ton, setTon]       = useState(profile?.ton_prefere || 'Chaleureux');
  const [prenom, setPrenom] = useState(profile?.prenom      || '');
  const [nomAss, setNomAss] = useState(profile?.nom_assistant || 'Attractor');
  const [email, setEmail]   = useState('');
  const [saving, setSaving] = useState(false);

  const canInstall = !['installed', 'desktop'].includes(detectPlatform());
  const tons       = ['Chaleureux', 'Direct', 'Fun & rythmé', 'Pro'];
  const initials   = prenom ? prenom.slice(0, 2).toUpperCase() : 'AA';
  const planLabel  = profile?.plan_code === 'decouverte' || !profile?.plan_code
    ? 'Découverte · Gratuit'
    : profile?.plan_code;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

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
    <div className="min-h-full bg-sable">
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
            <span className="block font-semibold text-[13.5px] mb-2">Ton préféré de ton assistant</span>
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

        <SectionLabel>Application</SectionLabel>
        <Card className="p-2">
          <ToggleRow icon="moon" label="Mode sombre" on={dark} onClick={() => setDark(!dark)} />
          <NavRow icon="medal" label="Mes paliers & forfait" onClick={() => go('paliers')} />
          {canInstall && <NavRow icon="bolt" label="Installer l'app sur mon téléphone" onClick={() => go('install')} />}
          <NavRow icon="settings" label="Notifications" onClick={() => notify('Bientôt disponible')} last />
        </Card>

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
