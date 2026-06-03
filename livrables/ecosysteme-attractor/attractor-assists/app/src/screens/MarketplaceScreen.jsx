import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Sheet, Btn } from '../components/ui';

const CATEGORIES = [
  {
    id: 'services',
    label: 'Services',
    tagline: 'Consultants, créatifs, experts',
    accent: '#F25C05',
    bg: 'linear-gradient(135deg, #1A1714 0%, #2d1f14 100%)',
    subcategories: ['Consultant', 'Infographiste', 'Vidéaste', 'Photographe', 'Formateur', 'Développeur', 'Autre'],
    img: '/marketplace/services.jpg',
    Icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <path d="M12 12v4M10 14h4"/>
      </svg>
    ),
  },
  {
    id: 'ecommerce',
    label: 'E-commerçants',
    tagline: 'Cosmétique, couture, produits',
    accent: '#FFB300',
    bg: 'linear-gradient(135deg, #2a1f04 0%, #1a1714 100%)',
    subcategories: ['Cosmétique', 'Bien-être', 'Couture / Mode', 'Produits divers', 'Autre'],
    img: '/marketplace/ecommerce.jpg',
    Icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    id: 'food',
    label: 'Food',
    tagline: 'Restaurants, traiteurs, produits',
    accent: '#1E5631',
    bg: 'linear-gradient(135deg, #0d1f11 0%, #1a1714 100%)',
    subcategories: ['Restaurant', 'Traiteur', 'Produits alimentaires', 'Street food', 'Autre'],
    img: '/marketplace/food.jpg',
    Icon: () => (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2Z"/>
        <path d="M12 12 3 21"/>
      </svg>
    ),
  },
];

const ZONE_LABELS = { CI: 'Côte d\'Ivoire', EU: 'Europe', CI_EU: 'CI + EU', international: 'International' };

const CGV_CONTENT = `CONTRAT D'ENGAGEMENT — MARKETPLACE ATTRACTOR (v1.0)

1. PARTIES
Le présent contrat est conclu entre Mac Arthur Kouassi, entrepreneur individuel exerçant sous la marque Mr Attractor, SIRET 98377125400015 (ci-après « Attractor »), et le prestataire inscrit sur la Marketplace Attractor (ci-après « le Prestataire »).

2. OBJET
Le Prestataire souhaite rejoindre la Marketplace Attractor afin de se rendre visible auprès des utilisateurs de l'application Attractor Assists. L'inscription est entièrement gratuite.

3. ENGAGEMENT QUALITÉ
Le Prestataire s'engage à tenir les promesses affichées sur son profil : tarifs indiqués, délais annoncés, qualité des prestations décrites. Toute modification significative doit être signalée sans délai à Attractor.

4. INTERDICTION DES FAUSSES PROMESSES
Toute information trompeuse, promesse non tenue ou comportement nuisant à la réputation de la Marketplace entraîne la suspension immédiate du profil sans préavis. En cas de récidive ou de préjudice avéré causé à un utilisateur, le compte peut être supprimé définitivement.

5. DONNÉES PERSONNELLES (RGPD)
Données collectées : nom/marque, email, numéro WhatsApp, zone géographique, présentation, tarifs, lien externe, photo.
Finalité : affichage du profil sur la Marketplace, vérification avant publication, communication relative au compte.
Base légale : exécution du présent contrat (art. 6.1.b RGPD).
Durée de conservation : pendant toute la durée de l'inscription, puis 2 ans après désinscription.
Droits : accès, rectification, effacement, portabilité, opposition — à exercer par email à bonjour@agenceattractor.com.

6. DROIT DE RETRAIT
Le Prestataire peut demander sa désinscription à tout moment en envoyant un email à bonjour@agenceattractor.com. Le profil sera retiré dans un délai de 48h ouvrées.

7. CLAUSE DE SIGNATURE ÉLECTRONIQUE
En cliquant « J'accepte et je m'inscris », le Prestataire reconnaît avoir lu et accepté l'intégralité des présentes Conditions Générales, lesquelles valent contrat signé électroniquement conformément à l'article 1366 du Code civil français et à l'article 5 de la Loi ivoirienne n°2013-546 relative aux transactions électroniques.`;

// ─── Composants ────────────────────────────────────────────────────────────────

function CategoryCard({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-[18px] overflow-hidden flex-shrink-0 transition-all duration-200 active:scale-95 ${active ? 'ring-2 ring-offset-2' : ''}`}
      style={{ width: 'calc(33.33% - 8px)', minWidth: 104, aspectRatio: '4/3', ringColor: cat.accent }}
    >
      <img
        src={cat.img}
        alt={cat.label}
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      {/* Gradient léger pour lisibilité du texte — l'image reste visible */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,23,20,0.82) 0%, rgba(26,23,20,0.35) 55%, rgba(26,23,20,0.15) 100%)' }} />
      {/* Fallback CSS si image absente */}
      <div className="absolute inset-0 -z-10" style={{ background: cat.bg }} />

      {active && (
        <div className="absolute inset-0 rounded-[18px] pointer-events-none"
          style={{ boxShadow: `0 0 0 2.5px ${cat.accent} inset` }} />
      )}

      <div className="relative z-10 flex flex-col items-end justify-end h-full p-3 gap-1 w-full">
        <div className="text-left w-full">
          <p className="font-display font-extrabold text-white text-[13px] leading-none drop-shadow">{cat.label}</p>
          <p className="text-white/55 text-[10px] mt-1 leading-tight">{cat.tagline}</p>
        </div>
      </div>
    </button>
  );
}

function PrestaCard({ p, onContact }) {
  const cat = CATEGORIES.find(c => c.id === p.categorie_principale);
  const accentColor = cat?.accent || '#F25C05';

  const pricingLabel = () => {
    if (p.pricing_type === 'devis') return 'Sur devis';
    if (p.pricing_details?.montant) return `${p.pricing_details.montant}${p.pricing_details.unite ? ' ' + p.pricing_details.unite : ''}`;
    if (p.tarif_indicatif && p.tarif_indicatif !== 'Sur devis') return p.tarif_indicatif;
    return null;
  };

  const label = pricingLabel();
  const subcat = p.sous_categorie || p.specialite || p.categorie;

  return (
    <div className="bg-white rounded-[20px] border border-g200 shadow-soft overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {p.photo_url ? (
          <img src={p.photo_url} alt={p.nom}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold text-[17px] flex-shrink-0"
            style={{ background: `${accentColor}20`, color: accentColor }}>
            {p.nom.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-extrabold text-[15px] text-charbon leading-tight">{p.nom}</h3>
            {subcat && (
              <span className="flex-shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}18`, color: accentColor }}>
                {subcat}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {p.zone && (
              <span className="text-[11px] text-g400 flex items-center gap-1">
                <Icon name="target" size={11} className="text-g400" />
                {ZONE_LABELS[p.zone] || p.zone}
              </span>
            )}
            {label && (
              <span className="text-[11px] font-bold flex items-center gap-1"
                style={{ color: p.pricing_type === 'devis' ? '#9A938B' : accentColor }}>
                <Icon name="coins" size={11} />
                {label}
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
          <button onClick={() => onContact(p)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-white active:opacity-80 transition"
            style={{ background: '#25D366' }}>
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

// ─── Formulaire inscription multi-étapes ──────────────────────────────────────

const INIT_FORM = {
  categorie_principale: '', sous_categorie: '',
  nom: '', email: '', whatsapp: '', presentation: '',
  zone: 'CI', lien: '', photo_url: '',
  pricing_type: 'detail',
  pricing_desc: '', pricing_montant: '', pricing_unite: '',
};

function InscriptionFlow({ onClose, notify }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INIT_FORM);
  const [saving, setSaving] = useState(false);
  const cgvRef = useRef(null);
  const [cgvRead, setCgvRead] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const cat = CATEGORIES.find(c => c.id === form.categorie_principale);

  const canNext = () => {
    if (step === 1) return form.categorie_principale && form.sous_categorie;
    if (step === 2) return form.nom.trim() && form.email.trim() && form.whatsapp.trim();
    if (step === 3) return form.pricing_type === 'devis' || form.pricing_montant.trim();
    return false;
  };

  const handleCgvScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) setCgvRead(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const pricing_details = form.pricing_type === 'detail' ? {
        description: form.pricing_desc.trim() || null,
        montant: form.pricing_montant.trim(),
        unite: form.pricing_unite.trim() || null,
      } : null;

      const { data, error } = await supabase.functions.invoke('marketplace-signup', {
        body: {
          nom: form.nom.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          categorie_principale: form.categorie_principale,
          sous_categorie: form.sous_categorie,
          presentation: form.presentation.trim(),
          pricing_type: form.pricing_type,
          pricing_details,
          zone: form.zone,
          lien: form.lien.trim(),
          photo_url: form.photo_url.trim(),
        },
      });

      if (error) throw error;

      notify('Inscription envoyée — contrat reçu par email');
      onClose();
    } catch (err) {
      notify('Erreur lors de l\'inscription. Réessaie.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, required, children }) => (
    <div>
      <p className="text-[11.5px] font-bold text-g400 uppercase tracking-[.08em] mb-1.5">
        {label}{required && <span className="text-orange ml-0.5">*</span>}
      </p>
      {children}
    </div>
  );

  const inputCls = "w-full px-4 py-3 rounded-[12px] bg-sable border border-g200 text-[14px] outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/40 transition";

  return (
    <Sheet onClose={onClose} title={`M'inscrire — étape ${step}/4`}>
      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className={`flex-1 h-1 rounded-full transition-all duration-300 ${n <= step ? 'bg-orange' : 'bg-g200'}`} />
        ))}
      </div>

      {/* ── Step 1 : Catégorie ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] font-display font-bold text-charbon">Dans quelle famille tu interviens ?</p>
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { set('categorie_principale', c.id); set('sous_categorie', ''); }}
                className={`flex-1 rounded-[14px] p-3 flex flex-col items-center gap-1.5 border-[1.5px] transition ${form.categorie_principale === c.id ? 'border-orange bg-orange/5' : 'border-g200 bg-white'}`}>
                <c.Icon />
                <span className="text-[11px] font-bold text-charbon leading-tight text-center">{c.label}</span>
              </button>
            ))}
          </div>

          {cat && (
            <div>
              <p className="text-[12px] font-bold text-g400 uppercase tracking-[.08em] mb-2">Sous-catégorie</p>
              <div className="flex flex-wrap gap-2">
                {cat.subcategories.map(s => (
                  <button key={s} onClick={() => set('sous_categorie', s)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${form.sous_categorie === s ? 'text-white border-orange' : 'bg-white text-g500 border-g200'}`}
                    style={form.sous_categorie === s ? { background: cat.accent, borderColor: cat.accent } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Btn onClick={() => setStep(2)} disabled={!canNext()} iconRight="arrow" className="w-full mt-2">
            Suivant
          </Btn>
        </div>
      )}

      {/* ── Step 2 : Infos pro ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] font-display font-bold text-charbon">Tes infos professionnelles</p>

          <Field label="Nom / Marque" required>
            <input value={form.nom} onChange={e => set('nom', e.target.value)}
              placeholder="Ex : Koffi Dev Studio" className={inputCls} />
          </Field>

          <Field label="Email" required>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="ton@email.com" className={inputCls} />
            <p className="text-[11px] text-g400 mt-1">Pour recevoir ton contrat signé</p>
          </Field>

          <Field label="WhatsApp" required>
            <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
              placeholder="+225 07 00 00 00 00 ou +33 6 00 00 00" className={inputCls} />
            <p className="text-[11px] text-g400 mt-1">Format international · Visible sur ton profil</p>
          </Field>

          <Field label="Présentation courte">
            <textarea value={form.presentation} onChange={e => set('presentation', e.target.value)}
              rows={3} placeholder="Ce que tu fais et ce qui te différencie…"
              className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Zone d'intervention">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(ZONE_LABELS).map(([v, l]) => (
                <button key={v} onClick={() => set('zone', v)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${form.zone === v ? 'bg-orange text-white border-orange' : 'bg-white text-g500 border-g200'}`}>
                  {l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Lien (portfolio, site, Instagram…)">
            <input value={form.lien} onChange={e => set('lien', e.target.value)}
              placeholder="https://…" className={inputCls} />
          </Field>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-[1.5px] border-g200 font-display font-bold text-[14px] text-g500">
              Retour
            </button>
            <Btn onClick={() => setStep(3)} disabled={!canNext()} iconRight="arrow" className="flex-[2]">
              Suivant
            </Btn>
          </div>
        </div>
      )}

      {/* ── Step 3 : Tarification ── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] font-display font-bold text-charbon">Comment tu affiches tes tarifs ?</p>

          <div className="flex flex-col gap-2">
            {[
              { v: 'detail', l: 'Je détaille mes tarifs', d: 'Recommandé — les clients voient ton prix directement' },
              { v: 'devis', l: 'Je préfère être contacté', d: 'Ton profil affichera "Sur devis"' },
            ].map(opt => (
              <button key={opt.v} onClick={() => set('pricing_type', opt.v)}
                className={`w-full text-left p-4 rounded-[14px] border-[1.5px] transition ${form.pricing_type === opt.v ? 'border-orange bg-orange/5' : 'border-g200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-[14px] text-charbon">{opt.l}</p>
                  {opt.v === 'detail' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-growth/10 text-growth">Recommandé</span>
                  )}
                </div>
                <p className="text-[12px] text-g400 mt-0.5">{opt.d}</p>
              </button>
            ))}
          </div>

          {form.pricing_type === 'detail' && (
            <div className="flex flex-col gap-3 p-4 rounded-[14px] bg-sable border border-g200">
              <Field label="Description du service">
                <input value={form.pricing_desc} onChange={e => set('pricing_desc', e.target.value)}
                  placeholder="Ex : Création de logo complet" className={inputCls} />
              </Field>
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <Field label="Montant *">
                    <input value={form.pricing_montant} onChange={e => set('pricing_montant', e.target.value)}
                      placeholder="Ex : 50 000 FCFA ou 80€" className={inputCls} />
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Unité">
                    <input value={form.pricing_unite} onChange={e => set('pricing_unite', e.target.value)}
                      placeholder="/projet" className={inputCls} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border-[1.5px] border-g200 font-display font-bold text-[14px] text-g500">
              Retour
            </button>
            <Btn onClick={() => setStep(4)} disabled={!canNext()} iconRight="arrow" className="flex-[2]">
              Suivant
            </Btn>
          </div>
        </div>
      )}

      {/* ── Step 4 : CGV ── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[13.5px] font-display font-bold text-charbon mb-1">Contrat d'engagement</p>
            <p className="text-[12px] text-g400">Lis le contrat jusqu'en bas pour l'accepter.</p>
          </div>

          <div
            ref={cgvRef}
            onScroll={handleCgvScroll}
            className="h-48 overflow-y-auto rounded-[14px] bg-sable border border-g200 p-4 text-[12px] text-g700 leading-relaxed whitespace-pre-wrap"
            style={{ scrollbarWidth: 'thin' }}
          >
            {CGV_CONTENT}
          </div>

          <div className={`rounded-[14px] p-3.5 border-[1.5px] transition ${cgvRead ? 'border-growth/50 bg-growth/5' : 'border-g200 bg-sable'}`}>
            <div className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 border-[1.5px] ${cgvRead ? 'bg-growth border-growth' : 'border-g200'}`}>
                {cgvRead && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17l9-10"/>
                  </svg>
                )}
              </div>
              <p className="text-[12px] text-g700 leading-snug">
                {cgvRead
                  ? <><strong className="text-charbon">Contrat lu.</strong> En cliquant "J'accepte", tu signes électroniquement ce contrat.</>
                  : 'Fais défiler jusqu\'en bas pour activer l\'acceptation.'}
              </p>
            </div>
          </div>

          <div className="rounded-[12px] bg-orange/8 border border-orange/20 p-3 text-[11.5px] text-orange font-semibold text-center">
            En cliquant "J'accepte et je m'inscris", tu signes ce contrat électroniquement.
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border-[1.5px] border-g200 font-display font-bold text-[14px] text-g500">
              Retour
            </button>
            <Btn
              onClick={submit}
              disabled={!cgvRead || saving}
              className="flex-[2]"
              iconRight={saving ? undefined : "check"}
            >
              {saving ? 'Envoi…' : "J'accepte et je m'inscris"}
            </Btn>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ─── Screen principal ──────────────────────────────────────────────────────────

export function MarketplaceScreen({ go, notify }) {
  const [prestataires, setPrestataires] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const handleCategoryClick = (catId) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      setActiveSubcat(null);
    } else {
      setActiveCategory(catId);
      setActiveSubcat(null);
    }
  };

  const filtered = prestataires.filter(p => {
    if (!activeCategory) return true;
    const matchCat = p.categorie_principale === activeCategory || p.categorie === activeCategory;
    if (!matchCat) return false;
    if (!activeSubcat) return true;
    return p.sous_categorie === activeSubcat || p.specialite === activeSubcat;
  });

  const handleContact = (p) => {
    const msg = `Bonjour ${p.nom}, j'ai trouvé ton profil sur la Marketplace Attractor. Je voudrais en savoir plus sur tes services.`;
    const num = p.whatsapp.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-sable pb-6">

      {/* Hero */}
      <div className="relative overflow-hidden bg-charbon" style={{ minHeight: 160 }}>
        {/* Photo Mac Arthur cadrée à droite */}
        <img
          src="/marketplace/hero-founder.jpg"
          alt="Mac Arthur"
          className="absolute right-0 top-0 h-full object-cover object-top"
          style={{ width: '52%', opacity: 0.55 }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        {/* Gradient de gauche pour lisibilité */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #1A1714 45%, rgba(26,23,20,0.6) 75%, rgba(26,23,20,0.1) 100%)' }} />
        {/* Glow orange bas-gauche */}
        <div className="absolute bottom-0 left-4 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(242,92,5,0.3) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }} />

        <div className="relative z-10 px-[18px] pt-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-orange/80 uppercase tracking-[.12em]">Marketplace Attractor</p>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-growth/40 text-growth bg-growth/10">
              Gratuit
            </span>
          </div>
          <h2 className="font-display font-extrabold text-[26px] leading-none text-white mb-2">
            Trouve les bons acteurs.
          </h2>
          <p className="text-[13px] text-white/50 leading-snug max-w-[200px]">
            Services, e-commerce et food — profils vérifiés.
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />
            <span className="text-[11px] text-white/50">
              {prestataires.length} profil{prestataires.length !== 1 ? 's' : ''} disponible{prestataires.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="px-[18px] py-4">
        <div className="flex gap-2 justify-between">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              active={activeCategory === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>

        {/* Sous-catégories */}
        {currentCat && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveSubcat(null)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition ${!activeSubcat ? 'text-white border-orange' : 'bg-white text-g500 border-g200'}`}
              style={!activeSubcat ? { background: currentCat.accent, borderColor: currentCat.accent } : {}}>
              Tous
            </button>
            {currentCat.subcategories.map(s => (
              <button key={s} onClick={() => setActiveSubcat(activeSubcat === s ? null : s)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition ${activeSubcat === s ? 'text-white border-orange' : 'bg-white text-g500 border-g200'}`}
                style={activeSubcat === s ? { background: currentCat.accent, borderColor: currentCat.accent } : {}}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="px-[18px] flex flex-col gap-4">
        {loading ? (
          <div className="py-10 flex justify-center">
            <span className="w-8 h-8 rounded-full border-2 border-g200 border-t-orange animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display font-bold text-[16px] text-charbon mb-2">
              {activeCategory ? `Aucun profil dans cette catégorie.` : 'La Marketplace arrive bientôt.'}
            </p>
            <p className="text-[13px] text-g400">
              {activeCategory ? 'Tu es le premier ? Inscris-toi juste en dessous.' : 'Sois parmi les premiers inscrits.'}
            </p>
          </div>
        ) : (
          filtered.map(p => (
            <PrestaCard key={p.id} p={p} onContact={handleContact} />
          ))
        )}

        {/* CTA inscription */}
        <div className="mt-2 rounded-[20px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1714 0%, #2d1f14 100%)' }}>
          <div className="p-5">
            <p className="text-[11px] font-bold text-orange/70 uppercase tracking-[.1em] mb-2">Tu vends ou tu proposes un service ?</p>
            <h3 className="font-display font-extrabold text-[18px] text-white mb-1">
              Rejoins la Marketplace.
            </h3>
            <p className="text-[13px] text-white/50 mb-4 leading-snug">
              Gratuit. Visible par tous les utilisateurs Attractor Assists. Profil vérifié avant publication.
            </p>
            <Btn variant="ghost" iconRight="arrow" onClick={() => setShowForm(true)} className="w-full">
              M'inscrire gratuitement
            </Btn>
          </div>
        </div>
      </div>

      {showForm && <InscriptionFlow onClose={() => setShowForm(false)} notify={notify} />}
    </div>
  );
}
