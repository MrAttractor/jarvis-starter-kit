import { Icon } from '../components/ui';

const PLAN_RANK = { gratuit: 0, decouverte: 0, decouverte_eu: 0, growth: 1, growth_eu: 1, team: 2, personnalise: 3 };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export default function MonAppScreen({ go, profile }) {
  const hasMaquette = profile?.demo_url === 'generated' || (profile?.demo_url && profile.demo_url.startsWith('http'));
  const maquetteUrl = profile?.id ? `${SUPABASE_URL}/functions/v1/serve-maquette?uid=${profile.id}` : null;
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

      {/* Iframe maquette */}
      <div className="flex-1 mx-4 rounded-[16px] overflow-hidden border border-white/10" style={{ minHeight: 400 }}>
        <iframe
          src={maquetteUrl}
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
