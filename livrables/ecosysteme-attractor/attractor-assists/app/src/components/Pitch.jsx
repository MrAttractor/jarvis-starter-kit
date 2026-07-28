// « Ce que je fais pour toi » — trois volets courts.
//
// Remplace la vidéo Mac Arthur de 5 min prévue par le concept V3 (décision 5) :
// la vidéo n'a jamais été tournée, et l'écran de bienvenue seul ne portait pas
// la promesse. Même intention (humaniser l'entrée, expliquer avant de demander),
// sans dépendre d'un tournage.
//
// Ouvert depuis l'écran d'accueil du tunnel et depuis le Profil.

import { useState } from 'react';
import { Icon } from './ui';

const VOLETS = [
  {
    icon: 'compass',
    titre: 'Je viens de 23 ans de terrain',
    texte: "Mac Arthur est entrepreneur depuis 23 ans. Il a mis dans ma tête sa façon de travailler, ses erreurs et ce qu'il en a tiré. Je ne suis pas un logiciel de plus, je suis sa méthode, à ton service.",
  },
  {
    icon: 'chat',
    titre: 'Je te vide la tête',
    texte: "Dis-moi ce qui tourne dans ta tête, à l'écrit ou à la voix, en vrac. J'en sors ce que tu dois faire aujourd'hui, les clients à relancer et ce qui peut attendre. Tu arrêtes de tout porter tout seul.",
  },
  {
    icon: 'package',
    titre: 'Je prends tes commandes',
    texte: "Tu reçois un lien de boutique à partager sur WhatsApp. Tes clients y voient tes produits, commandent, posent leurs questions. Tu reçois la commande, même quand tu dors.",
  },
];

export function PitchModal({ onClose, onStart }) {
  const [i, setI] = useState(0);
  const v = VOLETS[i];
  const dernier = i === VOLETS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(26,23,20,.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full lg:max-w-[440px] bg-sable rounded-t-[28px] lg:rounded-[28px] px-5 pt-4 pb-8 max-h-[92vh] overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-1 rounded-full bg-g200" />
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-g500 active:bg-g100 transition"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center mb-4">
          <Icon name={v.icon} size={24} className="text-orange" />
        </div>

        <h2 className="font-display font-extrabold text-[22px] text-charbon leading-[1.2]">{v.titre}</h2>
        <p className="text-[15px] text-g700 leading-relaxed mt-2.5 min-h-[110px]">{v.texte}</p>

        {/* Repères de position, tappables */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          {VOLETS.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`Volet ${n + 1}`}
              className="h-11 flex items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${n === i ? 'w-7 bg-orange' : 'w-3 bg-g200'}`}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {i > 0 && (
            <button
              onClick={() => setI(i - 1)}
              className="min-h-[52px] px-5 rounded-2xl border border-g200 bg-white text-charbon font-display font-bold text-[14px] active:bg-g100 transition"
            >
              Précédent
            </button>
          )}
          <button
            onClick={() => (dernier ? (onStart ? onStart() : onClose()) : setI(i + 1))}
            className="flex-1 min-h-[52px] rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] active:opacity-85 transition"
          >
            {dernier ? (onStart ? 'On y va' : 'Compris') : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
