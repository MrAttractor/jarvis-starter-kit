import { useState } from 'react';
import { MOCK } from '../data';
import { Card, Pill, SectionLabel, Icon, AppHeader, Btn } from '../components/ui';

// ─── Teaser contextuel par agent ─────────────────────────────────────────────
// Chaque agent connaît le profil de l'utilisateur et parle à SA situation.

function buildTeaser(agentId, profile) {
  const txt = ((profile?.ouverture || '') + ' ' + (profile?.activite || '')).toLowerCase();

  const teasers = {
    awa: [
      { when: txt.includes('relance') || txt.includes('prospect'),
        msg: "J'ai vu que tu attends des réponses. Je peux écrire tes relances maintenant — sans pression, sans que ça fasse vendeur." },
      { when: txt.includes('client') || txt.includes('vente') || txt.includes('closing'),
        msg: "Tu m'as l'air d'être en phase de closing. Je prépare ton message d'approche pendant que tu lis ça." },
      { when: true,
        msg: "Dis-moi à qui tu veux vendre quelque chose. Je prépare le message qui ouvre les portes." },
    ],
    miriam: [
      { when: txt.includes('post') || txt.includes('contenu') || txt.includes('facebook') || txt.includes('instagram'),
        msg: "J'ai regardé ce que tu fais. J'ai 3 idées de posts pour cette semaine. Dis-moi si tu veux voir." },
      { when: txt.includes('visibilit') || txt.includes('audience'),
        msg: "Ta cible est en ligne. Elle attend juste le bon message. Je m'en occupe." },
      { when: true,
        msg: "Ta présence en ligne mérite mieux que ce que tu fais seul. Je peux t'en sortir en 20 minutes." },
    ],
    serge: [
      { when: txt.includes('organis') || txt.includes('agenda') || txt.includes('priorit'),
        msg: "T'as combien de trucs en tête là maintenant ? Donne-les moi. Je trie en 2 minutes." },
      { when: txt.includes('semaine') || txt.includes('planning') || txt.includes('chargé'),
        msg: "Je vois que tu jongleas avec beaucoup de choses. Ton brief de semaine est prêt dès que tu me le demandes." },
      { when: true,
        msg: "T'as des tâches qui traînent. Je sais comment trier ça sans te noyer." },
    ],
    roland: [
      { when: txt.includes('prix') || txt.includes('marge') || txt.includes('rentable'),
        msg: "Tu vends à combien là ? Je te dis si tu es rentable — vrai chiffre, pas une estimation." },
      { when: txt.includes('ca') || txt.includes("chiffre") || txt.includes('revenu') || txt.includes('argent'),
        msg: "Tu veux projeter ton CA du mois ? J'ai besoin de 3 chiffres, je fais le reste." },
      { when: true,
        msg: "Tu as une activité. Est-ce qu'elle est vraiment rentable ? Je peux répondre à ça maintenant." },
    ],
  };

  const list = teasers[agentId] || [];
  return list.find(t => t.when)?.msg || '';
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function AssistantsScreen({ go, notify, profile }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const coach     = MOCK.assistants.find(a => a.id === "coach");
  const actifs    = MOCK.assistants.filter(a => a.id !== "coach" && a.status === "actif");
  const verrous   = MOCK.assistants.filter(a => a.id !== "coach" && a.status === "verrouillé");

  return (
    <div className="min-h-full bg-sable pb-6">
      <AppHeader title="Mon équipe" sub="Chaque spécialiste à sa place." />

      <div className="px-[18px] flex flex-col gap-4">

        {/* Bras droit toujours en tête */}
        {coach && (
          <button onClick={() => go("conversation", { assistant: "coach" })}
            className="w-full flex items-center gap-4 p-4 bg-charbon text-white rounded-[20px] shadow-[0_10px_28px_-10px_rgba(26,23,20,.5)] active:scale-[.99] transition text-left">
            <div className="w-14 h-14 rounded-xl bg-orange flex items-center justify-center font-display font-extrabold text-[18px] flex-shrink-0 shadow-[0_6px_16px_-4px_rgba(242,92,5,.6)]">
              {(profile?.nom_assistant || "AA").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-[16px]">{profile?.nom_assistant || "Ton bras droit"}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-growth">
                  <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
                </span>
              </div>
              <p className="text-[12.5px] text-white/60 mt-0.5 truncate">
                {profile?.ouverture ? `"${profile.ouverture.slice(0, 50)}${profile.ouverture.length > 50 ? '…' : ''}"` : "Ton point de contact principal — disponible maintenant."}
              </p>
            </div>
            <Icon name="send" size={18} className="text-orange flex-shrink-0" />
          </button>
        )}

        {/* Actifs */}
        {actifs.length > 0 && (
          <>
            <SectionLabel>Disponibles</SectionLabel>
            {actifs.map(a => (
              <AgentCard key={a.id} a={a} profile={profile}
                onBio={() => setSelectedAgent(a)}
                onAction={() => go("conversation", { assistant: a.id })} />
            ))}
          </>
        )}

        {/* Verrouillés */}
        <SectionLabel className="mt-1">
          <span>Disponibles avec</span>
          <span className="ml-1 px-2 py-0.5 bg-orange/10 text-orange text-[11px] font-bold rounded-full">Manager</span>
        </SectionLabel>
        {verrous.map(a => (
          <AgentCard key={a.id} a={a} profile={profile} locked
            onBio={() => setSelectedAgent(a)}
            onAction={() => setSelectedAgent(a)} />
        ))}

      </div>

      {selectedAgent && (
        <AgentBioModal
          a={selectedAgent}
          profile={profile}
          onClose={() => setSelectedAgent(null)}
          onAction={() => {
            setSelectedAgent(null);
            if (selectedAgent.status === "verrouillé") go("paliers");
            else go("conversation", { assistant: selectedAgent.id });
          }}
        />
      )}
    </div>
  );
}

// ─── Carte agent ──────────────────────────────────────────────────────────────

function AgentCard({ a, locked, onAction, onBio, profile }) {
  const teaser = buildTeaser(a.id, profile);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3.5 p-4">
        {/* Photo */}
        <button onClick={onBio} className="flex-shrink-0 relative">
          <div className={`w-[56px] h-[56px] rounded-[14px] overflow-hidden ${locked ? "" : ""}`}>
            {a.photo ? (
              <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className={`w-full h-full bg-orange flex items-center justify-center text-white font-display font-extrabold text-[16px]`}>
                {a.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {locked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-charbon border-2 border-sable flex items-center justify-center">
              <Icon name="lock" size={10} className="text-white" />
            </div>
          )}
        </button>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-display font-extrabold text-[15px] text-charbon">{a.name}</h4>
              <p className="text-[11.5px] text-g400 font-medium">{a.role}</p>
            </div>
            {locked ? (
              <span className="flex-shrink-0 text-[11px] font-bold text-amber bg-amber/10 px-2.5 py-1 rounded-full">Manager</span>
            ) : (
              <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-growth">
                <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
              </span>
            )}
          </div>

          {/* Teaser */}
          {teaser && (
            <div className={`mt-2.5 rounded-[12px] px-3 py-2.5 ${locked ? "bg-amber/8 border border-amber/15" : "bg-orange/8 border border-orange/15"}`}>
              <p className={`text-[12.5px] leading-snug font-medium italic ${locked ? "text-[#8a6200]" : "text-[#a23c00]"}`}>
                "{teaser}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className={`flex border-t ${locked ? "border-g100" : "border-orange/10"}`}>
        <button onClick={onBio}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-bold text-g400 hover:text-charbon transition">
          <Icon name="user" size={14} />
          Voir le profil
        </button>
        <div className="w-px bg-g100" />
        <button onClick={onAction}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12.5px] font-bold transition ${
            locked ? "text-amber hover:text-[#8a6200]" : "text-orange hover:text-[#D94703]"
          }`}>
          <Icon name={locked ? "lock" : "send"} size={14} />
          {locked ? "Débloquer" : "Parler"}
        </button>
      </div>
    </Card>
  );
}

// ─── Modal bio ────────────────────────────────────────────────────────────────

function AgentBioModal({ a, profile, onClose, onAction }) {
  const teaser = buildTeaser(a.id, profile);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-charbon/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-[28px] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Photo hero */}
        <div className="relative h-[280px] flex-shrink-0">
          {a.photo ? (
            <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full bg-orange flex items-center justify-center">
              <span className="text-white font-display font-extrabold text-[64px]">{a.name.slice(0,1)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charbon/85 via-charbon/20 to-transparent" />

          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <Icon name="close" size={18} />
          </button>

          <div className="absolute bottom-4 left-5">
            <div className="text-[12px] font-bold text-white/70 uppercase tracking-wider">{a.role}</div>
            <h2 className="font-display font-extrabold text-[32px] text-white leading-tight">{a.name}</h2>
            {a.status !== "verrouillé" && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-growth mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />En ligne
              </span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">

          {/* Ce qu'elle ferait pour toi maintenant */}
          {teaser && (
            <div className="bg-sable rounded-[16px] p-4 border border-g200">
              <p className="text-[11.5px] font-bold text-g400 uppercase tracking-wider mb-2">Ce qu'elle ferait pour toi là</p>
              <p className="text-[14.5px] text-charbon leading-relaxed italic">"{teaser}"</p>
            </div>
          )}

          {a.bio && (
            <p className="text-[14.5px] text-charbon leading-relaxed">{a.bio}</p>
          )}

          {a.proactif && (
            <div className="bg-sable rounded-[16px] p-4">
              <p className="text-[11.5px] font-bold text-g400 uppercase tracking-wider mb-2">En mode Manager</p>
              <p className="text-[14px] text-charbon leading-relaxed">{a.proactif}</p>
            </div>
          )}

          <Btn className="w-full mt-1" iconRight={a.status === "verrouillé" ? "arrow" : "send"} onClick={onAction}>
            {a.status === "verrouillé" ? `Débloquer ${a.name} avec Manager` : `Parler à ${a.name}`}
          </Btn>
        </div>
      </div>
    </div>
  );
}
