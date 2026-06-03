import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Sheet, Btn, AppHeader } from '../components/ui';

const CATEGORIES = [
  { id: 'tous',         label: 'Tous'         },
  { id: 'dev',          label: 'Dev'          },
  { id: 'design',       label: 'Design'       },
  { id: 'marketing',    label: 'Marketing'    },
  { id: 'finance',      label: 'Finance'      },
  { id: 'logistique',   label: 'Logistique'   },
  { id: 'autre',        label: 'Autre'        },
];

const CAT_COLOR = {
  dev:        'bg-blue-100 text-blue-700',
  design:     'bg-purple-100 text-purple-700',
  marketing:  'bg-orange/10 text-orange',
  finance:    'bg-growth/10 text-growth',
  logistique: 'bg-amber/10 text-amber-700',
  autre:      'bg-g200 text-g500',
};

function PrestaCard({ p, onContact }) {
  return (
    <div className="bg-white rounded-[20px] border border-g200 shadow-soft overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {p.photo_url ? (
          <img src={p.photo_url} alt={p.nom} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-orange/15 flex items-center justify-center font-display font-extrabold text-[17px] text-orange flex-shrink-0">
            {p.nom.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-extrabold text-[15px] text-charbon leading-tight">{p.nom}</h3>
              {p.specialite && <p className="text-[12px] text-g500 mt-0.5">{p.specialite}</p>}
            </div>
            <span className={`flex-shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${CAT_COLOR[p.categorie] || CAT_COLOR.autre}`}>
              {p.categorie}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {p.zone && (
              <span className="text-[11px] text-g400 flex items-center gap-1">
                <Icon name="target" size={11} className="text-g400" />
                {p.zone === 'CI_EU' ? 'CI + EU' : p.zone}
              </span>
            )}
            {p.tarif_indicatif && (
              <span className="text-[11px] text-g400 flex items-center gap-1">
                <Icon name="coins" size={11} className="text-g400" />
                {p.tarif_indicatif}
              </span>
            )}
          </div>
        </div>
      </div>

      {p.presentation && (
        <p className="px-4 pb-3 text-[12.5px] text-g500 leading-relaxed border-t border-g100 pt-3">
          {p.presentation.length > 120 ? p.presentation.slice(0, 120) + '…' : p.presentation}
        </p>
      )}

      <div className="flex border-t border-g100">
        {p.whatsapp && (
          <button
            onClick={() => onContact(p)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-white active:opacity-80 transition"
            style={{ background: '#25D366' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Contacter
          </button>
        )}
        {p.lien && (
          <a href={p.lien} target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold text-charbon border-l border-g100 active:bg-sable transition">
            Voir <Icon name="arrow" size={14} className="text-g400" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Formulaire inscription prestataire ────────────────────────────────────────

function InscriptionSheet({ onClose, notify }) {
  const [form, setForm] = useState({
    nom: '', categorie: 'dev', specialite: '', presentation: '',
    tarif_indicatif: '', zone: 'CI', whatsapp: '', lien: '', photo_url: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.nom.trim() || !form.whatsapp.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('prestataires').insert({
        ...form,
        statut: 'en_attente',
      });
      if (error) throw error;
      notify('Demande envoyée ! Nous te contacterons sur WhatsApp pour valider ton profil.');
      onClose();
    } catch {
      notify('Erreur lors de l\'envoi. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <p className="text-[11.5px] font-bold text-g400 uppercase tracking-[.08em] mb-1.5">{label}</p>
      {children}
    </div>
  );

  return (
    <Sheet onClose={onClose} title="Rejoindre le catalogue">
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-g500">Remplis ce formulaire. Nous vérifions ton profil sur WhatsApp avant publication — généralement sous 24h.</p>

        <Field label="Ton nom / marque *">
          <input value={form.nom} onChange={e => set('nom', e.target.value)}
            placeholder="Ex : Koffi Dev Studio"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20" />
        </Field>

        <Field label="Catégorie *">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.id !== 'tous').map(c => (
              <button key={c.id} onClick={() => set('categorie', c.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${form.categorie === c.id ? 'bg-orange text-white border-orange' : 'bg-white text-g500 border-g200'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Spécialité">
          <input value={form.specialite} onChange={e => set('specialite', e.target.value)}
            placeholder="Ex : Apps React, e-commerce, SEO…"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20" />
        </Field>

        <Field label="Présentation courte">
          <textarea value={form.presentation} onChange={e => set('presentation', e.target.value)}
            rows={3} placeholder="Ce que tu fais et ce qui te différencie…"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20 resize-none" />
        </Field>

        <Field label="Tarif indicatif">
          <input value={form.tarif_indicatif} onChange={e => set('tarif_indicatif', e.target.value)}
            placeholder="Ex : à partir de 50 000 FCFA / 80€"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20" />
        </Field>

        <Field label="Zone">
          <div className="flex gap-2 flex-wrap">
            {[{v:'CI',l:'Côte d\'Ivoire'},{v:'EU',l:'Europe'},{v:'CI_EU',l:'CI + EU'},{v:'international',l:'International'}].map(z => (
              <button key={z.v} onClick={() => set('zone', z.v)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${form.zone === z.v ? 'bg-orange text-white border-orange' : 'bg-white text-g500 border-g200'}`}>
                {z.l}
              </button>
            ))}
          </div>
        </Field>

        <Field label="WhatsApp * (format international)">
          <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
            placeholder="+225 07 00 00 00 00 ou +33 6 00 00 00 00"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20" />
          <p className="text-[11px] text-g400 mt-1">Obligatoire — sert uniquement à vérifier ton profil avant publication.</p>
        </Field>

        <Field label="Lien (portfolio, site, Instagram…)">
          <input value={form.lien} onChange={e => set('lien', e.target.value)}
            placeholder="https://…"
            className="w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20" />
        </Field>

        <Btn
          onClick={submit}
          disabled={!form.nom.trim() || !form.whatsapp.trim() || saving}
          iconRight="arrow"
          className="w-full"
        >
          {saving ? 'Envoi…' : 'Envoyer ma demande'}
        </Btn>
        <p className="text-center text-[11px] text-g400">Délai de validation : 24–48h · aucun frais</p>
      </div>
    </Sheet>
  );
}

// ─── Screen principal ──────────────────────────────────────────────────────────

export function MarketplaceScreen({ go, notify }) {
  const [prestataires, setPrestataires] = useState([]);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('prestataires')
          .select('*')
          .eq('statut', 'visible')
          .order('created_at', { ascending: false });
        setPrestataires(data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = activeFilter === 'tous'
    ? prestataires
    : prestataires.filter(p => p.categorie === activeFilter);

  const handleContact = (p) => {
    const msg = `Bonjour ${p.nom}, j'ai trouvé ton profil sur Attractor Assists. Je voudrais discuter de mon projet.`;
    const num = p.whatsapp.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-sable pb-6">

      {/* Hero */}
      <div className="relative overflow-hidden bg-charbon px-[18px] pt-5 pb-7">
        <div className="absolute bottom-0 right-4 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(242,92,5,0.35) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }} />
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-growth animate-pulse" />
          <span className="text-[11px] font-bold text-growth uppercase tracking-[.1em]">
            {prestataires.length} expert{prestataires.length !== 1 ? 's' : ''} disponible{prestataires.length !== 1 ? 's' : ''}
          </span>
        </div>
        <h2 className="font-display font-extrabold text-[28px] leading-none text-white mb-1">Ton réseau de confiance.</h2>
        <p className="text-[13.5px] text-white/55">Des prestataires vérifiés, prêts à intervenir sur ton projet.</p>
      </div>

      {/* Filtres */}
      <div className="overflow-x-auto flex gap-2 px-[18px] py-4" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveFilter(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[12.5px] font-bold transition ${activeFilter === c.id ? 'bg-orange text-white shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]' : 'bg-white border border-g200 text-g500'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="px-[18px] flex flex-col gap-4">
        {loading ? (
          <div className="py-10 flex justify-center">
            <span className="w-8 h-8 rounded-full border-2 border-g200 border-t-orange animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display font-bold text-[16px] text-charbon mb-2">Aucun prestataire dans cette catégorie.</p>
            <p className="text-[13px] text-g400">Tu es prestataire ? Rejoins le catalogue en dessous.</p>
          </div>
        ) : (
          filtered.map(p => (
            <PrestaCard key={p.id} p={p} onContact={handleContact} />
          ))
        )}

        {/* CTA inscription */}
        <div className="mt-4 rounded-[20px] overflow-hidden border-[1.5px] border-orange/30"
          style={{ background: 'linear-gradient(135deg,#fff9f5,#fff3ec)' }}>
          <div className="p-5">
            <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.08em] mb-2">Tu es prestataire ?</p>
            <h3 className="font-display font-extrabold text-[18px] text-charbon mb-1">Rejoins le catalogue.</h3>
            <p className="text-[13px] text-g500 mb-4">Gratuit. Visible par tous les utilisateurs Attractor. Vérification WhatsApp avant publication.</p>
            <Btn iconRight="arrow" onClick={() => setShowForm(true)} className="w-full">
              Déposer mon profil
            </Btn>
          </div>
        </div>
      </div>

      {showForm && <InscriptionSheet onClose={() => setShowForm(false)} notify={notify} />}
    </div>
  );
}
