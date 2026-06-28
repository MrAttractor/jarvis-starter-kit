import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Sheet, Input, Btn, Spinner } from '../components/ui';
import { generateDemoHtml } from '../lib/demoTemplate';

const PLAN_RANK = { gratuit: 0, decouverte: 0, decouverte_eu: 0, growth: 1, growth_eu: 1, team: 2, personnalise: 3 };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// ─── Anamnèse — comprendre l'activité pour générer l'assistant client ────────
const ANAMNESE_QUESTIONS = [
  { id: 'ce_quil_vend',   text: "Qu'est-ce que tu vends exactement ? (produits, services, prix si tu en as)", placeholder: "Ex : Farine infantile 1er et 2e âge, sachets 400g à 5 500 FCFA..." },
  { id: 'clients',        text: "Qui sont tes clients, et comment ils achètent chez toi d'habitude ?", placeholder: "Ex : Des mamans à Abidjan, elles commandent sur WhatsApp..." },
  { id: 'faq',            text: "Quelles questions reviennent le plus souvent de la part de tes clients ?", placeholder: "Ex : Vous livrez où ? C'est pour quel âge ? Comment je paye ?..." },
  { id: 'stock',          text: "Comment tu gères ton stock ?", placeholder: "Ex : Je compte chaque soir, je recommande au grossiste le lundi..." },
  { id: 'paiement',       text: "Comment tes clients te payent ?", placeholder: "Ex : Mobile Money Wave/Orange, espèces à la livraison..." },
  { id: 'livraison',      text: "Comment se passe la livraison ou la remise de commande ?", placeholder: "Ex : Je livre moi-même à Cocody, ailleurs c'est Yango/Wave..." },
  { id: 'ce_qui_fatigue', text: "Qu'est-ce qui te prend le plus de temps avec tes clients, et que tu aimerais déléguer ?", placeholder: "Ex : Répondre 50 fois par jour aux mêmes questions..." },
];

function AnamneseSheet({ profile, onClose, onGenerated }) {
  const [qIdx, setQIdx]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState('');
  const [step, setStep]       = useState('questions'); // questions | generating | error
  const q = ANAMNESE_QUESTIONS[qIdx];
  const progress = Math.round(((qIdx + 1) / ANAMNESE_QUESTIONS.length) * 100);

  const generate = async (data) => {
    setStep('generating');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session perdue');

      const { error: anamneseErr } = await supabase.from('business_anamnese').upsert({
        user_id:        user.id,
        ce_quil_vend:   data.ce_quil_vend,
        clients:        data.clients,
        faq:            [data.faq],
        stock:          data.stock,
        paiement:       data.paiement,
        livraison:      data.livraison,
        ce_qui_fatigue: data.ce_qui_fatigue,
        updated_at:     new Date().toISOString(),
      });
      if (anamneseErr) throw anamneseErr;

      const { data: gen, error: genErr } = await supabase.functions.invoke('generate-client-assistant', {
        body: { user_id: user.id },
      });
      if (genErr || !gen?.slug) throw new Error('génération échouée');
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
    if (qIdx < ANAMNESE_QUESTIONS.length - 1) setQIdx(qIdx + 1);
    else generate(next);
  };

  if (step === 'generating') {
    return (
      <Sheet title="On y est presque" onClose={() => {}}>
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <Spinner className="w-9 h-9" />
          <p className="font-display font-bold text-[15px] text-charbon">Carelle construit ton assistant client…</p>
          <p className="text-[13px] text-g400">Ça prend quelques secondes — il apprend tout ce que tu viens de lui dire.</p>
        </div>
      </Sheet>
    );
  }

  if (step === 'error') {
    return (
      <Sheet title="Petit souci" onClose={onClose}>
        <div className="flex flex-col gap-3">
          <p className="text-[14px] text-g500">La génération n'a pas abouti. Tes réponses sont enregistrées — réessaie dans un instant.</p>
          <Btn onClick={() => generate(answers)} className="w-full">Réessayer</Btn>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Génère ton assistant client" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[12px] font-bold text-g400 mb-1.5">Question {qIdx + 1} / {ANAMNESE_QUESTIONS.length}</p>
          <div className="h-[4px] bg-g100 rounded-full overflow-hidden">
            <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="font-display font-bold text-[16px] text-charbon leading-snug">{q.text}</p>
        <Input
          placeholder={q.placeholder}
          value={current}
          onChange={e => setCurrent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && current.trim().length >= 2 && submit()}
          autoFocus
        />
        <Btn onClick={submit} iconRight={qIdx < ANAMNESE_QUESTIONS.length - 1 ? 'arrow' : 'check'}
          className={`w-full ${current.trim().length < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
          {qIdx < ANAMNESE_QUESTIONS.length - 1 ? 'Suivant' : 'Générer mon assistant'}
        </Btn>
        <p className="text-[11.5px] text-g400 text-center">{profile?.prenom ? `${profile.prenom}, ` : ''}tes réponses servent uniquement à personnaliser l'assistant que tu vas partager à tes clients.</p>
      </div>
    </Sheet>
  );
}

function ClientAssistantCard({ profile, dark }) {
  const [open, setOpen]       = useState(false);
  const [link, setLink]       = useState(profile?.public_slug ? `https://demo.agenceattractor.com/${profile.public_slug}` : null);
  const [copied, setCopied]   = useState(false);
  const ready = !!profile?.client_assistant_ready && !!link;

  const copy = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (ready) {
    return (
      <div className={`rounded-[18px] p-4 ${dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-g200'}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <Icon name="spark" size={16} className="text-orange" />
          <p className={`font-display font-bold text-[14px] ${dark ? 'text-white' : 'text-charbon'}`}>Ton assistant client est en ligne</p>
        </div>
        <p className={`text-[12px] mb-3 ${dark ? 'text-white/50' : 'text-g400'}`}>Partage ce lien à tes clients — ils discutent directement avec ton assistant, sans installer quoi que ce soit.</p>
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-[12px] mb-2 ${dark ? 'bg-white/10' : 'bg-sable'}`}>
          <p className={`flex-1 text-[12px] truncate ${dark ? 'text-white/80' : 'text-g700'}`}>{link}</p>
          <button onClick={copy} className="flex-shrink-0 px-3 py-1.5 rounded-[10px] bg-orange text-white text-[11.5px] font-bold">
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>
        <button onClick={() => setOpen(true)} className={`text-[12px] font-semibold ${dark ? 'text-white/50' : 'text-g400'}`}>
          Régénérer avec de nouvelles infos
        </button>
        {open && <AnamneseSheet profile={profile} onClose={() => setOpen(false)} onGenerated={(g) => { setLink(g.url); setOpen(false); }} />}
      </div>
    );
  }

  return (
    <div className={`rounded-[18px] p-4 ${dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-g200'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name="spark" size={16} className="text-orange" />
        <p className={`font-display font-bold text-[14px] ${dark ? 'text-white' : 'text-charbon'}`}>Génère ton assistant client</p>
      </div>
      <p className={`text-[12px] mb-3 leading-relaxed ${dark ? 'text-white/50' : 'text-g400'}`}>
        Réponds à 7 questions sur ton activité. Carelle construit ton assistant personnalisé — un lien unique que tu partages à tes clients pour qu'ils commandent et posent leurs questions, même quand tu es occupé.
      </p>
      <button onClick={() => setOpen(true)}
        className="w-full py-3 rounded-[12px] bg-orange text-white font-display font-bold text-[13px] flex items-center justify-center gap-2">
        <Icon name="spark" size={15} /> Générer mon assistant client
      </button>
      {open && <AnamneseSheet profile={profile} onClose={() => setOpen(false)} onGenerated={(g) => { setLink(g.url); setOpen(false); }} />}
    </div>
  );
}

export default function MonAppScreen({ go, profile }) {
  const hasMaquette = profile?.demo_url === 'generated' || (profile?.demo_url && profile.demo_url.startsWith('http'));
  const maquetteUrl = profile?.id ? `${SUPABASE_URL}/functions/v1/serve-maquette?uid=${profile.id}` : null;
  // HTML local pour le mode démo — évite la dépendance à serve-maquette et à SQL 0025
  const localDemoHtml = hasMaquette ? generateDemoHtml({
    prenom:   profile?.prenom   || 'Vous',
    activite: profile?.activite || 'votre activité',
    zone:     profile?.zone     || 'CI',
  }) : null;
  const planCode = profile?.plan_code || 'gratuit';
  const isPaid   = (PLAN_RANK[planCode] ?? 0) >= 1;
  const prenom   = profile?.prenom || '';

  if (!hasMaquette) {
    return (
      <div className="min-h-screen bg-sable flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center">
          <Icon name="grid" size={32} className="text-orange" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-[22px] text-charbon">Ton app n'est pas encore créée</h2>
          <p className="text-[14px] text-g400 mt-2 leading-relaxed">Parle à Carelle pour générer ta maquette gratuite en 2 minutes.</p>
        </div>
        <button
          onClick={() => go('conversation', { assistant: 'carelle', mode: 'demo', prefill: "Je veux voir une démo d'application pour mon activité." })}
          className="w-full py-4 rounded-[16px] bg-orange text-white font-display font-extrabold text-[15px] flex items-center justify-center gap-2">
          <Icon name="spark" size={18} /> Créer ma maquette
        </button>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen bg-sable pb-8">
        <div className="px-5 pt-6 pb-4">
          <h1 className="font-display font-extrabold text-[26px] text-charbon">Mon App</h1>
          <p className="text-[13px] text-g400 mt-1">Ton espace personnel — actif et opérationnel.</p>
        </div>

        <div className="px-5 mb-4">
          <ClientAssistantCard profile={profile} dark={false} />
        </div>

        <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src={maquetteUrl}
            title="Mon App"
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        </div>

        <div className="px-5 mt-4 flex flex-col gap-3">
          <button
            onClick={() => go('conversation', { assistant: 'carelle' })}
            className="w-full py-3.5 rounded-[14px] bg-charbon text-white font-display font-extrabold text-[14px] flex items-center justify-center gap-2">
            <Icon name="send" size={16} className="text-amber" /> Parler à Carelle
          </button>
          <button
            onClick={() => go('paliers')}
            className="w-full py-3 rounded-[14px] border border-g200 bg-white text-charbon font-display font-bold text-[13px] flex items-center justify-center gap-2">
            <Icon name="grid" size={14} /> Voir les formules
          </button>
        </div>
      </div>
    );
  }

  // Mode démo — utilisateur gratuit avec maquette générée
  return (
    <div className="min-h-screen bg-charbon flex flex-col pb-24">
      {/* Bannière démo */}
      <div className="px-4 py-3 bg-orange/90 flex items-center gap-2">
        <Icon name="spark" size={14} className="text-white flex-shrink-0" />
        <p className="text-[12px] font-bold text-white leading-tight">
          Aperçu démo · Données fictives · Aucune mémoire enregistrée
        </p>
      </div>

      <div className="px-4 pt-4 pb-2">
        <h2 className="font-display font-extrabold text-[20px] text-white">
          {prenom ? `L'app de ${prenom}` : 'Ton app'}
          <span className="ml-2 text-[13px] font-normal text-white/40">· Aperçu</span>
        </h2>
        <p className="text-[12px] text-white/50 mt-1">Voici à quoi ressemblerait ton application. Active-la pour la rendre réelle.</p>
      </div>

      <div className="px-4 pb-3">
        <ClientAssistantCard profile={profile} dark={true} />
      </div>

      {/* Iframe maquette — srcDoc local en priorité, fallback serve-maquette si disponible */}
      <div className="flex-1 mx-4 rounded-[16px] overflow-hidden border border-white/10" style={{ minHeight: 400 }}>
        <iframe
          srcDoc={localDemoHtml || undefined}
          src={localDemoHtml ? undefined : maquetteUrl}
          title="Aperçu maquette"
          className="w-full h-full border-0"
          style={{ minHeight: 400 }}
          allow="fullscreen"
        />
      </div>

      {/* CTA fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-charbon/95 backdrop-blur-sm border-t border-white/10">
        <button
          onClick={() => go('paliers')}
          className="w-full py-4 rounded-[16px] font-display font-extrabold text-[15px] text-charbon flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#FFC107,#FFB300)', boxShadow: '0 8px 20px -6px rgba(255,193,7,.5)' }}>
          <Icon name="spark" size={18} /> Activer la vraie version
        </button>
        <p className="text-center text-[11px] text-white/40 mt-2">À partir de 9 900 FCFA / 15€ / mois</p>
      </div>
    </div>
  );
}
