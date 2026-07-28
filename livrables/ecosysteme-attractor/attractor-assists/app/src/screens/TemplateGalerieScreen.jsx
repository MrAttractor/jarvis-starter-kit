import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Spinner } from '../components/ui';
import { previewUrl as previewBoutiqueUrl } from '../lib/boutique';

const TEMPLATES = [
  {
    id: '1a',
    nom: 'Grille',
    accroche: 'Compact, familier, efficace',
    palette: { bg: '#FAF6F0', brand: '#1A1714', accent: '#F2A33D' },
    mockup: 'grille',
  },
  {
    id: '1b',
    nom: 'Liste',
    accroche: 'Plus d\'infos, scroll fluide',
    palette: { bg: '#F3F8F4', brand: '#1B3A2F', accent: '#FF6B35' },
    mockup: 'liste',
  },
  {
    id: '1c',
    nom: 'Magazine',
    accroche: 'Impact visuel, look premium',
    palette: { bg: '#FAF8F4', brand: '#0F0A1A', accent: '#C9A84C' },
    mockup: 'magazine',
  },
];

// Aperçu = la vraie boutique de l'utilisateur (ses propres produits, ses couleurs),
// affichée dans le modèle survolé sans rien écrire en base (?preview=).
// Les 3 modèles sont désormais la même page : plus de dépendance à demo-site.
const previewUrl = (tpl, slug) => previewBoutiqueUrl(slug, tpl.id);

function MockupGrille({ palette }) {
  const { bg, brand, accent } = palette;
  const cards = [accent, brand, accent, brand];
  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg, padding: 8, gap: 6 }}>
      {/* header */}
      <div style={{ background: brand, borderRadius: 6, height: 28, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, opacity: 0.9 }} />
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }} />
      </div>
      {/* grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ borderRadius: 6, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: `${c}22` }} />
            <div style={{ padding: '4px 5px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ height: 5, borderRadius: 2, background: brand, opacity: 0.7, width: '75%' }} />
              <div style={{ height: 5, borderRadius: 2, background: accent, width: '50%' }} />
              <div style={{ alignSelf: 'flex-end', width: 16, height: 16, borderRadius: '50%', background: accent }} />
            </div>
          </div>
        ))}
      </div>
      {/* nav */}
      <div style={{ background: '#fff', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: i===0 ? accent : '#E5E5E5' }} />)}
      </div>
    </div>
  );
}

function MockupListe({ palette }) {
  const { bg, brand, accent } = palette;
  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg, padding: 8, gap: 5 }}>
      <div style={{ background: brand, borderRadius: 6, height: 28, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, opacity: 0.9 }} />
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }} />
      </div>
      {/* search */}
      <div style={{ background: '#fff', borderRadius: 6, height: 20, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', padding: '0 7px', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid rgba(0,0,0,0.2)` }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.1)' }} />
      </div>
      {/* rows */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 6, padding: '5px 6px', alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 5, background: `${accent}33`, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ height: 4, borderRadius: 2, background: brand, opacity: 0.7, width: '70%' }} />
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)', width: '90%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
              <div style={{ height: 5, width: '35%', borderRadius: 2, background: accent }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent }} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ background: '#fff', borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 'auto' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: i===0 ? accent : '#E5E5E5' }} />)}
      </div>
    </div>
  );
}

function MockupMagazine({ palette }) {
  const { bg, brand, accent } = palette;
  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg, padding: 8, gap: 5 }}>
      {/* hero */}
      <div style={{ background: `linear-gradient(135deg, ${brand}, ${brand}CC)`, borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 56 }}>
        <div style={{ width: 32, height: 5, borderRadius: 2, background: accent, marginBottom: 4 }} />
        <div style={{ width: '70%', height: 8, borderRadius: 3, background: 'rgba(255,255,255,0.85)' }} />
        <div style={{ width: '50%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)', marginTop: 3 }} />
      </div>
      {/* chips */}
      <div style={{ display: 'flex', gap: 4 }}>
        {['Tout','Sérums','Huiles'].map((c,i)=>(
          <div key={i} style={{ padding: '2px 7px', borderRadius: 10, background: i===0 ? brand : '#fff', border: `1px solid ${i===0 ? brand : 'rgba(0,0,0,0.1)'}`, fontSize: 1 }}>
            <div style={{ width: i===0?14:18, height: 4, borderRadius: 2, background: i===0?accent:'rgba(0,0,0,0.2)' }} />
          </div>
        ))}
      </div>
      {/* featured */}
      <div style={{ background: '#fff', borderRadius: 7, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ height: 30, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 6, borderRadius: 3, background: accent, opacity: 0.5 }} />
        </div>
        <div style={{ padding: '4px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: brand, opacity: 0.7 }} />
            <div style={{ width: 24, height: 5, borderRadius: 2, background: accent }} />
          </div>
          <div style={{ background: brand, borderRadius: 5, padding: '3px 7px', display: 'flex', gap: 3, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: 1, background: accent }} />
            <div style={{ width: 18, height: 4, borderRadius: 2, background: accent, opacity: 0.8 }} />
          </div>
        </div>
      </div>
      {/* mini grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[0,1].map(i=>(
          <div key={i} style={{ background: '#fff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ height: 22, background: `${accent}18` }} />
            <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ height: 4, borderRadius: 2, background: brand, opacity: 0.6, width: '80%' }} />
              <div style={{ height: 4, borderRadius: 2, background: accent, width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: brand, borderRadius: 6, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 'auto' }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: i===0 ? accent : 'rgba(255,255,255,0.2)' }} />)}
      </div>
    </div>
  );
}

const MOCKUP_MAP = {
  grille:   MockupGrille,
  liste:    MockupListe,
  magazine: MockupMagazine,
};

export function TemplateGalerieScreen({ go, notify, profile }) {
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [chosen, setChosen]       = useState(profile?.template_choisi || null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const slug = profile?.public_slug || null;

  const voir = (tpl) => {
    const url = previewUrl(tpl, slug);
    if (!url) { notify('Ta boutique doit être configurée avant de prévisualiser un modèle'); return; }
    setIframeLoaded(false);
    setPreview({ ...tpl, url });
  };

  const choisir = async (tpl) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ template_choisi: tpl.id }).eq('id', user.id);
      }
      setChosen(tpl.id);
      notify(`Modèle "${tpl.nom}" sélectionné`);
      setPreview(null);
    } catch {
      notify('Erreur lors de la sélection');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-sable">

      {/* ── AppBar ── */}
      <div className="flex items-center gap-3 px-4 pt-safe pb-4 bg-sable flex-shrink-0">
        {/* On revient au Catalogue, d'où l'on vient — pas au Dashboard. */}
        <button onClick={() => go('catalogue')} aria-label="Retour au catalogue" className="w-11 h-11 rounded-xl bg-white border border-g200 flex items-center justify-center flex-shrink-0 active:bg-g100 transition">
          <Icon name="back" size={19} className="text-charbon" />
        </button>
        <div className="min-w-0">
          <div className="font-display font-bold text-[19px] text-charbon truncate">Modèles de boutique</div>
          <div className="text-[12px] text-g500 mt-0.5 truncate">Prévisualise et choisis ta mise en page</div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>

        {TEMPLATES.map(tpl => {
          const Mockup = MOCKUP_MAP[tpl.mockup];
          const isChosen = chosen === tpl.id;
          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-[20px] border overflow-hidden shadow-soft transition ${
                isChosen ? 'border-orange shadow-[0_0_0_2px_rgba(242,92,5,0.25)]' : 'border-g200'
              }`}
            >
              {/* Aperçu CSS */}
              <div
                className="relative cursor-pointer active:opacity-90 transition"
                style={{ height: 220 }}
                onClick={() => voir(tpl)}
              >
                <Mockup palette={tpl.palette} />

                {/* Overlay "Prévisualiser" */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="flex items-center gap-2 bg-white text-charbon px-4 py-2 rounded-xl font-display font-bold text-[13px] shadow-lg">
                    <Icon name="eye" size={15} />
                    Prévisualiser
                  </div>
                </div>

                {/* Badge choisi */}
                {isChosen && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange text-white px-3 py-1.5 rounded-full font-bold text-[11px] shadow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                    Sélectionné
                  </div>
                )}
              </div>

              {/* Infos + actions */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display font-bold text-[15px] text-charbon truncate">{tpl.nom}</div>
                  <div className="text-[12px] text-g500 mt-0.5 truncate">{tpl.accroche}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => voir(tpl)}
                    className="flex items-center gap-1.5 h-11 px-3 rounded-xl border border-g200 bg-sable text-charbon text-[12.5px] font-bold active:bg-g100 transition"
                  >
                    <Icon name="eye" size={13} />
                    Voir
                  </button>
                  {!isChosen && (
                    <button
                      onClick={() => choisir(tpl)}
                      disabled={loading}
                      className="h-11 px-3.5 rounded-xl bg-orange text-white text-[12.5px] font-bold active:opacity-80 transition disabled:opacity-50"
                    >
                      Choisir
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <p className="text-center text-[11.5px] text-g400 px-4 leading-relaxed">
          Le contenu, les couleurs et le nom de ta boutique sont personnalisés automatiquement selon ton profil.
        </p>
      </div>

      {/* ── Prévisualisation plein écran ── */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0A1A' }}>

          {/* Barre de contrôle */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'rgba(15,10,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setPreview(null)}
              className="flex items-center gap-1.5 h-11 pr-2 text-white/70 font-bold text-[13px] active:text-white transition flex-shrink-0"
            >
              <Icon name="back" size={16} className="text-white/70" />
              Retour
            </button>
            <div className="flex-1 text-center">
              <span className="text-white font-display font-bold text-[14px]">Modèle {preview.nom}</span>
            </div>
            <button
              onClick={() => choisir(preview)}
              disabled={loading || chosen === preview.id}
              className="flex items-center gap-1.5 bg-orange text-white h-11 px-4 rounded-xl font-display font-bold text-[13px] active:opacity-80 transition disabled:opacity-50 flex-shrink-0"
            >
              {loading
                ? <Spinner className="w-4 h-4 border-white" />
                : chosen === preview.id
                  ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> Choisi</>
                  : 'Choisir'
              }
            </button>
          </div>

          {/* Indicateur de chargement */}
          {!iframeLoaded && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="w-8 h-8 border-white/40" />
                <p className="text-white/50 text-[13px]">Chargement du modèle…</p>
              </div>
            </div>
          )}

          {/* iframe */}
          <iframe
            src={preview.url}
            className="border-none"
            style={{
              flex: 1,
              width: '100%',
              display: iframeLoaded ? 'block' : 'none',
            }}
            onLoad={() => setIframeLoaded(true)}
            title={`Modèle ${preview.nom}`}
          />
        </div>
      )}
    </div>
  );
}
