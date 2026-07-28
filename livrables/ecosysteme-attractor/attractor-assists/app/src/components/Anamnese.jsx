// Le guidage qui construit l'assistant client de l'entrepreneur.
//
// C'est l'étape qui donne sa valeur au produit : sans ces réponses, l'assistant est
// généré à partir du seul prénom + activité, et répond comme un chatbot générique.
//
// Utilisé à deux endroits : dans le tunnel d'inscription (pleine page, obligatoire)
// et depuis le Profil (« Réapprendre », en modale).

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Input, Btn, Spinner } from './ui';

export const ANAMNESE_QUESTIONS = [
  { id: 'ce_quil_vend',   text: "Qu'est-ce que tu vends exactement ? (produits, services, prix si tu en as)", placeholder: "Ex : Farine infantile 1er et 2e âge, sachets 400g à 5 500 FCFA..." },
  { id: 'clients',        text: "Qui sont tes clients, et comment ils achètent chez toi d'habitude ?", placeholder: "Ex : Des mamans à Abidjan, elles commandent sur WhatsApp..." },
  { id: 'faq',            text: "Quelles questions reviennent le plus souvent de la part de tes clients ?", placeholder: "Ex : Vous livrez où ? C'est pour quel âge ? Comment je paye ?..." },
  { id: 'stock',          text: "Comment tu gères ton stock ?", placeholder: "Ex : Je compte chaque soir, je recommande au grossiste le lundi..." },
  // paiement et livraison sont AFFICHÉS aux clients sur la boutique, mot pour mot.
  { id: 'paiement',       text: "Comment tes clients te payent ?", placeholder: "Ex : Wave au 07 58 68 02 79, ou espèces à la livraison...", public: true },
  { id: 'livraison',      text: "Comment se passe la livraison ou la remise de commande ?", placeholder: "Ex : Je livre à Cocody sous 24h, ailleurs c'est Yango à ta charge...", public: true },
  { id: 'ce_qui_fatigue', text: "Qu'est-ce qui te prend le plus de temps avec tes clients, et que tu aimerais déléguer ?", placeholder: "Ex : Répondre 50 fois par jour aux mêmes questions..." },
];

/**
 * Enregistre l'anamnèse puis génère l'assistant client.
 * Les deux échouent ou réussissent ensemble : un assistant généré sans anamnèse
 * est un assistant vide, et c'est exactement ce qu'on répare.
 */
export async function saveAnamneseAndGenerate(answers) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('session perdue');

  const { error: anamneseErr } = await supabase.from('business_anamnese').upsert({
    user_id:        user.id,
    ce_quil_vend:   answers.ce_quil_vend,
    clients:        answers.clients,
    faq:            [answers.faq],   // colonne jsonb
    stock:          answers.stock,
    paiement:       answers.paiement,
    livraison:      answers.livraison,
    ce_qui_fatigue: answers.ce_qui_fatigue,
    updated_at:     new Date().toISOString(),
  });
  if (anamneseErr) throw anamneseErr;

  const { data: gen, error: genErr } = await supabase.functions.invoke('generate-client-assistant', {
    body: { user_id: user.id },
  });
  if (genErr || !gen?.slug) throw new Error('génération échouée');
  return gen;
}

// Reprise en cours de route. C'est la DERNIÈRE étape du tunnel, celle où l'on
// décroche le plus : quelqu'un qui fermait l'app à la question 5 repartait de la 1
// et abandonnait. Sauvegardé uniquement dans le tunnel (pas depuis le Profil, où
// « Réapprendre » doit repartir d'une page blanche).
const STORE_KEY = 'aa_anamnese_v1';

function lireBrouillon() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object') return null;
    const max = ANAMNESE_QUESTIONS.length - 1;
    return {
      qIdx:    Math.min(Math.max(0, Number(s.qIdx) || 0), max),
      answers: s.answers && typeof s.answers === 'object' ? s.answers : {},
      current: typeof s.current === 'string' ? s.current : '',
    };
  } catch { return null; }
}

/**
 * Les 7 questions, une par écran.
 * @param {(gen: {slug: string, url: string}) => void} onGenerated - assistant prêt
 * @param {() => void} [onClose] - si absent, pas de bouton fermer (tunnel : on ne saute pas l'étape)
 */
export function Anamnese({ profile, onGenerated, onClose }) {
  const persist  = !onClose;                       // le tunnel, pas la modale du Profil
  const reprise  = persist ? lireBrouillon() : null;

  const [qIdx, setQIdx]       = useState(reprise?.qIdx ?? 0);
  const [answers, setAnswers] = useState(reprise?.answers ?? {});
  const [current, setCurrent] = useState(reprise?.current ?? '');
  const [step, setStep]       = useState('questions'); // questions | generating | error

  // Enregistré à chaque frappe : fermer l'onglet ne joue aucun événement fiable
  // sur mobile, on ne peut pas compter sur un cleanup au démontage.
  useEffect(() => {
    if (!persist) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ qIdx, answers, current })); } catch {}
  }, [persist, qIdx, answers, current]);

  const q = ANAMNESE_QUESTIONS[qIdx];
  const isLast = qIdx === ANAMNESE_QUESTIONS.length - 1;
  const progress = Math.round(((qIdx + 1) / ANAMNESE_QUESTIONS.length) * 100);

  const generate = async (data) => {
    setStep('generating');
    try {
      const gen = await saveAnamneseAndGenerate(data);
      // Le brouillon n'a plus lieu d'être : l'assistant existe.
      try { localStorage.removeItem(STORE_KEY); } catch {}
      onGenerated(gen);
    } catch {
      setStep('error');
    }
  };

  const submit = () => {
    if (current.trim().length < 2) return;
    const next = { ...answers, [q.id]: current.trim() };
    setAnswers(next);
    setCurrent('');
    if (isLast) generate(next);
    else setQIdx(qIdx + 1);
  };

  const back = () => {
    if (qIdx === 0) return;
    const prev = ANAMNESE_QUESTIONS[qIdx - 1];
    setCurrent(answers[prev.id] || '');
    setQIdx(qIdx - 1);
  };

  if (step === 'generating') return (
    <div className="flex flex-col items-center text-center gap-3 py-10">
      <Spinner className="w-9 h-9" />
      <p className="font-display font-bold text-[15px] text-charbon">Ton assistant se construit…</p>
      <p className="text-[13px] text-g400 max-w-[280px]">Il apprend tout ce que tu viens de lui dire. Quelques secondes.</p>
    </div>
  );

  if (step === 'error') return (
    <div className="flex flex-col gap-3 py-6">
      <p className="text-[14px] text-g500">La génération n'a pas abouti. Tes réponses sont enregistrées, tu ne les perds pas.</p>
      <Btn onClick={() => generate(answers)} className="w-full">Réessayer</Btn>
      {onClose && <button onClick={onClose} className="text-[13px] text-g400 underline">Plus tard</button>}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[12px] font-bold text-g400">Question {qIdx + 1} / {ANAMNESE_QUESTIONS.length}</p>
          {qIdx > 0 && (
            <button onClick={back} className="text-[12px] text-g400 flex items-center gap-1 hover:text-charbon">
              <Icon name="back" size={12} /> Retour
            </button>
          )}
        </div>
        <div className="h-[4px] bg-g100 rounded-full overflow-hidden">
          <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="font-display font-bold text-[16px] text-charbon leading-snug">{q.text}</p>

      <Input
        placeholder={q.placeholder}
        value={current}
        onChange={e => setCurrent(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        autoFocus
      />

      {q.public && (
        <p className="text-[11.5px] text-g400 leading-snug -mt-1">
          Ta réponse s'affichera telle quelle sur ta boutique, tes clients la liront.
        </p>
      )}

      <Btn onClick={submit} iconRight={isLast ? 'check' : 'arrow'}
        className={`w-full ${current.trim().length < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
        {isLast ? 'Créer mon assistant' : 'Suivant'}
      </Btn>

      <p className="text-[11.5px] text-g400 text-center leading-snug">
        {profile?.prenom ? `${profile.prenom}, p` : 'P'}lus tu es précis, plus ton assistant répond juste à tes clients.
      </p>
    </div>
  );
}
