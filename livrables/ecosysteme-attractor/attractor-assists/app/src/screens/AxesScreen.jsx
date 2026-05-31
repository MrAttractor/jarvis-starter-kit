import { useState } from 'react';
import { MOCK, AIDA_DELIVERABLE, PASA_DELIVERABLE } from '../data';
import { Card, Btn, SectionLabel, Pill, Field, Input, Spinner, AppHeader, Icon } from '../components/ui';

export function AxesScreen({ go, notify }) {
  const [framework, setFramework] = useState("AIDA");
  const [channel, setChannel] = useState("WhatsApp");
  const [angle, setAngle] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | result | error
  const channels = ["WhatsApp", "Instagram", "Facebook", "TikTok"];

  const generate = () => {
    setState("loading");
    setTimeout(() => {
      if (angle.trim().toLowerCase() === "bug") { setState("error"); return; }
      setState("result");
    }, 1700);
  };
  const result = framework === "AIDA" ? AIDA_DELIVERABLE : PASA_DELIVERABLE;

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Axes de communication" sub="Tes argumentaires prêts à copier" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        <Card className="p-5 flex flex-col gap-5">
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Méthode</span>
            <div className="grid grid-cols-2 gap-2.5">
              {[["AIDA", "Attention · Intérêt · Désir · Action"], ["PASA", "Problème · Agitation · Souhait · Action"]].map(([k, d]) => (
                <button key={k} onClick={() => setFramework(k)} className={`text-left p-3.5 rounded-xl border-[1.5px] transition ${framework === k ? "bg-orange/8 border-orange" : "bg-white border-g200"}`}>
                  <div className={`font-display font-extrabold text-[16px] ${framework === k ? "text-orange" : "text-charbon"}`}>{k}</div>
                  <div className="text-[11px] text-g400 leading-tight mt-1">{d}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Réseau</span>
            <div className="flex flex-wrap gap-2">
              {channels.map(c => <button key={c} onClick={() => setChannel(c)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${channel === c ? "bg-charbon text-white border-charbon" : "bg-white border-g200 text-g700"}`}>{c}</button>)}
            </div>
          </div>
          <Field label="Angle (optionnel)" hint="Laisse vide pour partir de ta MasterSheet.">
            <Input placeholder="Ex : promo de lancement, fraîcheur, livraison rapide…" value={angle} onChange={e => setAngle(e.target.value)} />
          </Field>
          <Btn className="w-full" icon="spark" onClick={generate}>Générer mon argumentaire</Btn>
        </Card>

        {state === "loading" && (
          <Card className="p-8 flex flex-col items-center gap-3 text-center">
            <Spinner className="w-10 h-10" />
            <p className="font-display font-bold text-[15px] text-charbon">{MOCK.user.assistantName} rédige ton {framework}…</p>
            <p className="text-[13px] text-g400">On puise dans ta cible et ton offre.</p>
          </Card>
        )}

        {state === "error" && (
          <Card className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D64545]/10 flex items-center justify-center text-[#D64545]"><Icon name="warn" size={24} /></div>
            <p className="font-display font-bold text-[15px]">Oups, ça a coincé.</p>
            <p className="text-[13px] text-g400 max-w-[260px]">La génération n'a pas abouti. Réessaie, ton crédit n'a pas été touché.</p>
            <Btn variant="ghost" icon="refresh" onClick={generate}>Réessayer</Btn>
          </Card>
        )}

        {state === "result" && (
          <div className="animate-[fadeUp_.3s_ease]">
            <SectionLabel className="mb-3" action={<Pill tone="info">{channel}</Pill>}>Résultat — {framework}</SectionLabel>
            <Card className="overflow-hidden">
              <div className="p-4 space-y-3">
                {result.blocks.map((b, i) => (
                  <div key={i} className="pb-3 border-b border-g200 last:border-0 last:pb-0">
                    <div className="text-[11px] font-bold tracking-wider uppercase text-orange mb-1">{b.k}</div>
                    <p className="text-[14px] text-charbon leading-relaxed">{b.v}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <Btn className="flex-1 !py-3 !text-[14px]" icon="copy" onClick={() => notify("Copié ✓ — prêt à coller")}>Copier</Btn>
                <button onClick={() => notify("Variante générée")} className="w-12 rounded-xl border-[1.5px] border-g200 flex items-center justify-center text-g700 hover:border-orange/50"><Icon name="refresh" size={19} /></button>
                <button onClick={() => go("broadcasts")} className="w-12 rounded-xl border-[1.5px] border-g200 flex items-center justify-center text-g700 hover:border-orange/50"><Icon name="mega" size={19} /></button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
