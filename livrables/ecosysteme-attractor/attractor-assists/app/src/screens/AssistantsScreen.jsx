import { useState } from 'react';
import { MOCK } from '../data';
import { Card, Pill, SectionLabel, AssistGlyph, Icon, AppHeader, Btn } from '../components/ui';

export function AssistantsScreen({ go, notify, profile }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const actifs      = MOCK.assistants.filter(a => a.id !== "coach" && a.status === "actif");
  const verrouilles = MOCK.assistants.filter(a => a.id !== "coach" && a.status === "verrouillé");

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Mon équipe" sub="Chaque spécialiste à sa place." />
      <div className="px-[18px] pb-4 flex flex-col gap-3.5">

        <SectionLabel>Disponibles</SectionLabel>
        {actifs.map(a => (
          <AssistantCard key={a.id} a={a}
            onPhoto={() => setSelectedAgent(a)}
            onOpen={() => go("conversation", { assistant: a.id })} />
        ))}

        <SectionLabel className="mt-2">Disponibles avec Manager</SectionLabel>
        {verrouilles.map(a => (
          <AssistantCard key={a.id} a={a} locked
            onPhoto={() => setSelectedAgent(a)}
            onOpen={() => go("paliers")} />
        ))}

      </div>

      {selectedAgent && (
        <AgentBioModal
          a={selectedAgent}
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

function AssistantCard({ a, locked, onOpen, onPhoto }) {
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <button onClick={onPhoto} className="flex-shrink-0 focus:outline-none">
        {a.photo ? (
          <div className={`w-[52px] h-[52px] rounded-xl overflow-hidden relative ${locked ? "opacity-60 grayscale" : ""}`}>
            <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-charbon/30 rounded-xl">
                <Icon name="lock" size={14} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          <AssistGlyph accent={a.accent} icon={a.icon} size={52} locked={locked} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-display font-extrabold text-[15.5px]">{a.name}</h4>
          <span className="text-[12px] text-g400 font-medium">{a.role}</span>
        </div>
        <div className="mt-1">
          {locked
            ? <Pill tone="neutral" icon="lock">{a.plan}</Pill>
            : <Pill tone="growth">● Actif</Pill>
          }
        </div>
        <p className="text-[12.5px] text-g700 mt-1.5 leading-snug">{a.desc}</p>
      </div>

      <button
        onClick={onOpen}
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          locked
            ? "bg-charbon/6 text-charbon"
            : "bg-orange text-white shadow-[0_6px_14px_-5px_rgba(242,92,5,.6)]"
        }`}
      >
        <Icon name={locked ? "lock" : "send"} size={18} />
      </button>
    </Card>
  );
}

function AgentBioModal({ a, onClose, onAction }) {
  const accentColors = {
    orange: "from-orange to-[#D94703]",
    info:   "from-[#1a73e8] to-[#0d5bcc]",
    amber:  "from-amber to-[#d97706]",
    growth: "from-growth to-[#145c2e]",
    charbon:"from-charbon to-[#2a2320]",
  };
  const gradient = accentColors[a.accent] || accentColors.orange;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-charbon/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-[28px] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Photo + gradient overlay */}
        <div className="relative h-[280px] flex-shrink-0">
          {a.photo ? (
            <img src={a.photo} alt={a.name} className="w-full h-full object-cover object-top" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon name={a.icon} size={64} className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 via-charbon/20 to-transparent" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <Icon name="close" size={18} />
          </button>

          {/* Name + role on photo */}
          <div className="absolute bottom-4 left-5">
            <div className="text-[13px] font-bold text-white/70 uppercase tracking-wider">{a.role}</div>
            <h2 className="font-display font-extrabold text-[32px] text-white leading-tight">{a.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">
          {a.bio && (
            <p className="text-[15px] text-charbon leading-relaxed">{a.bio}</p>
          )}

          {a.proactif && (
            <div className="bg-sable rounded-[16px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full bg-${a.accent === "charbon" ? "charbon" : a.accent}`} />
                <span className="text-[12px] font-bold text-g700 uppercase tracking-wider">En mode Manager</span>
              </div>
              <p className="text-[14px] text-charbon leading-relaxed">{a.proactif}</p>
            </div>
          )}

          <Btn
            className="w-full mt-1"
            iconRight={a.status === "verrouillé" ? "arrow" : "send"}
            onClick={onAction}
          >
            {a.status === "verrouillé" ? `Débloquer ${a.name} avec Manager` : `Parler à ${a.name}`}
          </Btn>
        </div>
      </div>
    </div>
  );
}
