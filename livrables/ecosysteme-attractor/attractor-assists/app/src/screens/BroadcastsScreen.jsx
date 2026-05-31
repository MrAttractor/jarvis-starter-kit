import { useState } from 'react';
import { Card, Btn, Pill, SectionLabel, Field, Textarea, AppHeader, Icon } from '../components/ui';

export function BroadcastsScreen({ go, notify }) {
  const [msg, setMsg] = useState("");
  const [audience, setAudience] = useState("Tous mes contacts");
  const [when, setWhen] = useState("now");
  const locked = true;
  const planned = [
    { t: "Promo bissap −20 %", aud: "Tous · 312 contacts", when: "Demain · 11:00", on: "WhatsApp" },
    { t: "Nouveau parfum gingembre", aud: "Clients fidèles · 84", when: "Sam · 09:00", on: "Instagram" },
  ];

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Broadcasts" sub="Parle à toute ta communauté d'un coup" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        {locked && (
          <button onClick={() => go("paliers")} className="rounded-[20px] p-4 text-white text-left flex items-center gap-3" style={{ background: "linear-gradient(120deg,#1F1B18,#2a2320)" }}>
            <div className="w-11 h-11 rounded-xl bg-amber/20 flex items-center justify-center text-amber flex-shrink-0"><Icon name="lock" size={22} /></div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-[14.5px]">Fonction palier Manager</h4>
              <p className="text-[12.5px] text-white/70">Compose ici en démo · passe Manager pour envoyer.</p>
            </div>
            <Icon name="chevron" size={18} className="text-amber" />
          </button>
        )}

        <Card className="p-5 flex flex-col gap-4">
          <Field label="Ton message">
            <Textarea rows={4} placeholder="Salut la famille ! Cette semaine chez Aya…" value={msg} onChange={e => setMsg(e.target.value)} />
            <div className="flex justify-between mt-1.5">
              <span className="text-[11.5px] text-g400">{msg.length} caractères</span>
              <button onClick={() => go("axes")} className="text-[12px] font-bold text-orange flex items-center gap-1"><Icon name="spark" size={13} /> Aide-moi à écrire</button>
            </div>
          </Field>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Audience</span>
            <div className="flex flex-wrap gap-2">
              {["Tous mes contacts", "Clients fidèles", "Prospects"].map(x => (
                <button key={x} onClick={() => setAudience(x)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${audience === x ? "bg-orange text-white border-orange" : "bg-white border-g200 text-g700"}`}>{x}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="block font-semibold text-[13.5px] mb-2">Quand ?</span>
            <div className="flex gap-2">
              {[["now", "Maintenant"], ["later", "Planifier"]].map(([k, l]) => (
                <button key={k} onClick={() => setWhen(k)} className={`flex-1 py-3 rounded-xl text-[13.5px] font-bold border-[1.5px] transition ${when === k ? "bg-charbon text-white border-charbon" : "bg-white border-g200 text-g700"}`}>{l}</button>
              ))}
            </div>
          </div>
          <Btn className="w-full" icon={locked ? "lock" : "send"} onClick={() => locked ? go("paliers") : notify("Broadcast envoyé ✓")}>
            {locked ? "Débloquer l'envoi (Manager)" : "Envoyer le broadcast"}
          </Btn>
        </Card>

        <SectionLabel>Planifiés (aperçu)</SectionLabel>
        {planned.map((b, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0"><Icon name="mega" size={20} /></div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-[14px] truncate">{b.t}</h4>
              <p className="text-[12px] text-g400">{b.aud} · {b.on}</p>
            </div>
            <Pill tone="amber" icon="clock">{b.when}</Pill>
          </Card>
        ))}
      </div>
    </div>
  );
}
