import { useState } from 'react';
import { Icon, Spinner } from '../components/ui';

const MODULES = [
  {
    id: 'methode',
    titre: 'La Méthode ATTRACTOR',
    description: '6 étapes pour trouver ton couloir et y devenir numéro 1.',
    icon: 'target',
    tag: 'Fondations',
    tagColor: 'bg-orange/10 text-orange',
    file: '/methode/methode-2026.txt',
    prefill: 'Explique-moi la méthode ATTRACTOR en 5 points clés adaptés à mon activité.',
  },
  {
    id: 'organisation',
    titre: 'S\'organiser en 7 jours',
    description: 'Un challenge concret pour structurer ton activité semaine par semaine.',
    icon: 'clock',
    tag: 'Organisation',
    tagColor: 'bg-blue-50 text-blue-600',
    file: '/methode/organisation-7-jours.txt',
    prefill: 'Je veux me lancer dans le challenge organisation 7 jours. Guide-moi pour commencer aujourd\'hui.',
  },
  {
    id: 'marque',
    titre: 'Booster ta marque',
    description: 'Comment construire une identité forte qui attire les bons clients.',
    icon: 'flame',
    tag: 'Marketing',
    tagColor: 'bg-amber/15 text-[#9a6a00]',
    file: '/methode/boost-ta-marque.txt',
    prefill: 'Aide-moi à booster ma marque personnelle pour attirer plus de clients dans mon secteur.',
  },
  {
    id: '3secrets',
    titre: '3 secrets pour vendre plus',
    description: 'Les leviers psychologiques du closing qui transforment l\'intérêt en vente.',
    icon: 'coins',
    tag: 'Ventes',
    tagColor: 'bg-[#1E5631]/10 text-[#1E5631]',
    file: '/methode/3-secrets.txt',
    prefill: 'Donne-moi les 3 secrets pour mieux vendre et aide-moi à les appliquer à mon activité.',
  },
  {
    id: 'framework',
    titre: 'Framework PPSD',
    description: 'Problèmes, Peurs, Souhaits, Désirs — comprendre profondément tes clients.',
    icon: 'compass',
    tag: 'Stratégie',
    tagColor: 'bg-purple-50 text-purple-600',
    file: '/methode/framework.txt',
    prefill: 'Applique le framework PPSD à mon activité et aide-moi à mieux comprendre mes clients.',
  },
];

export function FormationScreen({ go }) {
  const [open, setOpen] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const openModule = async (mod) => {
    setOpen(mod);
    setContent('');
    setLoading(true);
    try {
      const res = await fetch(mod.file);
      if (res.ok) {
        const txt = await res.text();
        setContent(txt);
      } else {
        setContent('Contenu non disponible pour le moment.');
      }
    } catch {
      setContent('Contenu non disponible pour le moment.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-sable">
      {/* Header */}
      <div className="px-4 pt-14 pb-4 bg-sable">
        <button onClick={() => go('profil')} className="flex items-center gap-1.5 text-g500 text-[12.5px] font-bold mb-3 active:opacity-70">
          <Icon name="back" size={14} /> Retour
        </button>
        <div className="font-display font-extrabold text-[22px] text-charbon">Ma formation</div>
        <div className="text-[13px] text-g500 mt-0.5">{MODULES.length} modules · à ton rythme</div>
      </div>

      {/* Liste des modules */}
      <div className="px-4 pb-8 flex flex-col gap-3">
        {MODULES.map(mod => (
          <div key={mod.id} className="bg-white rounded-2xl border border-g200 overflow-hidden shadow-soft">
            <button
              onClick={() => openModule(mod)}
              className="w-full flex items-center gap-3.5 p-4 text-left active:bg-g50 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon name={mod.icon} size={22} className="text-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.tagColor}`}>{mod.tag}</span>
                </div>
                <div className="font-display font-bold text-[14.5px] text-charbon leading-snug">{mod.titre}</div>
                <div className="text-[12px] text-g500 mt-0.5 leading-snug">{mod.description}</div>
              </div>
              <Icon name="chevron" size={18} className="text-g400 flex-shrink-0" />
            </button>
          </div>
        ))}
      </div>

      {/* Sheet lecteur de module */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setOpen(null)}>
          <div
            className="w-full bg-white rounded-t-[28px] flex flex-col"
            style={{ maxHeight: '88vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header sheet */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-g200 flex-shrink-0">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${open.tagColor}`}>{open.tag}</span>
                <div className="font-display font-bold text-[17px] text-charbon mt-1">{open.titre}</div>
              </div>
              <button onClick={() => setOpen(null)} className="w-9 h-9 rounded-full bg-g100 flex items-center justify-center text-g700 flex-shrink-0">
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
              {loading ? (
                <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>
              ) : (
                <pre className="text-[13.5px] text-charbon leading-relaxed whitespace-pre-wrap font-sans">{content}</pre>
              )}
            </div>

            {/* CTA Assists */}
            <div className="p-5 pt-3 border-t border-g200 flex-shrink-0">
              <button
                onClick={() => { setOpen(null); go('conversation', { assistant: 'coach', prefill: open.prefill }); }}
                className="w-full py-3.5 rounded-2xl bg-orange text-white font-display font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] active:opacity-80 transition"
              >
                <Icon name="spark" size={18} />
                Poser une question à Assists
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
