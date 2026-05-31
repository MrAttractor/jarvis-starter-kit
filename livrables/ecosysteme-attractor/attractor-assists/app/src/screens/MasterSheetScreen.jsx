import { useState } from 'react';
import { MOCK } from '../data';
import { Card, Btn, Pill, SectionLabel, AppHeader, Icon } from '../components/ui';

export function MasterSheetScreen({ go, notify }) {
  const [tab, setTab] = useState("cible");
  const p = MOCK.ppsd, b = MOCK.brand, o = MOCK.offre;
  const tabs = [{ id: "cible", label: "Ta cible" }, { id: "marque", label: "Ta marque" }, { id: "offre", label: "Ton offre" }];

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="MasterSheet" sub="Tout ce qu'on sait, rangé proprement"
        right={<button onClick={() => notify("Export simulé ✓")} className="w-10 h-10 rounded-full bg-white border border-g200 flex items-center justify-center text-charbon shadow-soft"><Icon name="copy" size={18} /></button>} />

      <div className="px-[18px] sticky top-0 z-10 bg-sable/95 backdrop-blur pb-2 pt-1">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-g200">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition ${tab === t.id ? "bg-orange text-white shadow-[0_4px_12px_-4px_rgba(242,92,5,.5)]" : "text-g700"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="px-[18px] pt-3 pb-4 flex flex-col gap-4">
        {tab === "cible" && (
          <>
            <PpsdCard tone="error" icon="warn" title="Problèmes" items={p.problemes} />
            <PpsdCard tone="amber" icon="bolt" title="Peurs" items={p.peurs} />
            <PpsdCard tone="info" icon="heart" title="Souhaits" items={p.souhaits} />
            <PpsdCard tone="growth" icon="spark" title="Désirs" items={p.desirs} />
            <div className="grid grid-cols-2 gap-3">
              <MiniCard icon="target" title="Où la trouver" items={p.ou} />
              <MiniCard icon="bolt" title="Déclencheurs" items={p.declencheurs} />
            </div>
          </>
        )}
        {tab === "marque" && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-extrabold text-[17px]">Identité de marque</h3>
              <button onClick={() => notify("Édition simulée")} className="text-orange"><Icon name="edit" size={18} /></button>
            </div>
            <Row label="Nom" value={b.name} />
            <Row label="Secteur" value={b.secteur} />
            <Row label="Promesse" value={b.promesse} />
            <Row label="Ville" value={b.ville} last />
          </Card>
        )}
        {tab === "offre" && (
          <>
            <Card className="p-5">
              <SectionLabel className="mb-3">Produit principal</SectionLabel>
              <p className="font-display font-bold text-[16px] text-charbon">{o.principal}</p>
            </Card>
            <Card className="p-5">
              <SectionLabel className="mb-3">Bonus</SectionLabel>
              <ul className="space-y-2.5">
                {o.bonus.map((x, i) => <li key={i} className="flex gap-2.5 text-[14px] text-g700"><Icon name="check" size={18} stroke={2.4} className="text-growth flex-shrink-0 mt-0.5" />{x}</li>)}
              </ul>
            </Card>
            <div className="rounded-[20px] border-2 border-dashed border-orange/40 bg-orange/5 p-5">
              <div className="flex items-center gap-2 text-orange font-display font-bold text-[14px] mb-1.5"><Icon name="clock" size={18} /> Limiteur d'urgence</div>
              <p className="text-[14px] text-[#a23c00] leading-relaxed">{o.urgence}</p>
            </div>
            <Btn variant="ghost" className="w-full" icon="spark" onClick={() => go("axes")}>Générer un argumentaire depuis ça</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function PpsdCard({ tone, icon, title, items }) {
  const c = { error: "#D64545", amber: "#9a6a00", info: "#2B6CB0", growth: "#1E5631" }[tone];
  const bg = { error: "rgba(214,69,69,.10)", amber: "rgba(255,179,0,.16)", info: "rgba(43,108,176,.10)", growth: "rgba(30,86,49,.10)" }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg, color: c }}><Icon name={icon} size={18} /></div>
        <h3 className="font-display font-extrabold text-[16px]">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((x, i) => <li key={i} className="flex gap-2.5 text-[14px] text-g700 leading-snug"><span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />{x}</li>)}
      </ul>
    </Card>
  );
}

function MiniCard({ icon, title, items }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2.5 text-charbon"><Icon name={icon} size={16} className="text-orange" /><h4 className="font-display font-bold text-[13px]">{title}</h4></div>
      <ul className="space-y-1.5">{items.map((x, i) => <li key={i} className="text-[12.5px] text-g700 leading-snug">· {x}</li>)}</ul>
    </Card>
  );
}

function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between gap-4 py-3 ${last ? "" : "border-b border-g200"}`}>
      <span className="text-[13px] text-g400 font-medium flex-shrink-0">{label}</span>
      <span className="text-[14px] text-charbon font-semibold text-right">{value}</span>
    </div>
  );
}
