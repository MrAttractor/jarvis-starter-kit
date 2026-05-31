import { useState } from 'react';
import { MOCK } from '../data';
import { Pill, Btn, Icon, Sheet, Spinner, AppHeader } from '../components/ui';

export function PaliersScreen({ go, notify }) {
  const [pay, setPay] = useState(null);

  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Tes paliers" sub="Monte d'un cran, débloque ton équipe" onBack={() => go("dashboard")} />
      <div className="px-[18px] pb-4 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-[20px]" style={{ minHeight: 150 }}>
          <div className="absolute inset-0">
            <img src="/uploads/photo-paliers.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(20,12,7,.15),rgba(217,71,3,.85))" }} />
          <div className="relative p-5 pt-12 text-white">
            <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Promo flash en cours</Pill>
            <h3 className="font-display font-extrabold text-[21px] leading-tight mt-2">Deviens le #1 de ton couloir.</h3>
          </div>
        </div>

        {MOCK.forfaits.map(f => (
          <ForfaitCard key={f.id} f={f} onPick={() => f.current ? notify("C'est déjà ton palier") : setPay(f)} />
        ))}

        <div className="flex items-center justify-center gap-2 text-[12px] text-g400 mt-1">
          <Icon name="check" size={15} className="text-growth" /> Sans frais d'installation · résiliable à tout moment
        </div>
        <p className="text-center text-[11px] text-g400 px-6">TVA non applicable, art. 293 B du CGI.</p>
      </div>

      {pay && <PaymentSheet f={pay} onClose={() => setPay(null)} notify={notify} />}
    </div>
  );
}

function ForfaitCard({ f, onPick }) {
  return (
    <div className={`relative rounded-[20px] p-5 ${f.highlight ? "bg-charbon text-white shadow-[0_18px_40px_-18px_rgba(26,23,20,.6)]" : "bg-white border border-g200 shadow-soft"}`}>
      {f.highlight && (
        <div className="absolute -top-3 left-5">
          <span className="bg-amber text-charbon font-display font-extrabold text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
            <Icon name="bolt" size={13} /> {f.promo}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-display font-extrabold text-[19px] ${f.highlight ? "text-white" : "text-charbon"}`}>{f.name}</h3>
          <p className={`text-[12.5px] mt-0.5 ${f.highlight ? "text-white/70" : "text-g400"}`}>{f.tagline}</p>
        </div>
        {f.current && <Pill tone="growth">Actuel</Pill>}
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        {f.eurOld && <span className="font-display text-[18px] line-through text-g400">{f.eurOld}</span>}
        <span className={`font-display font-extrabold text-[34px] leading-none ${f.highlight ? "text-orange-light" : "text-charbon"}`}>{f.eur}</span>
        <span className={`text-[13px] ${f.highlight ? "text-white/60" : "text-g400"}`}>{f.period}</span>
      </div>
      <div className={`text-[13px] font-semibold mt-0.5 ${f.highlight ? "text-amber" : "text-growth"}`}>{f.fcfa} {f.eur !== "0 €" ? f.period : ""}</div>
      <ul className="mt-4 space-y-2.5">
        {f.features.map((x, i) => (
          <li key={i} className={`flex gap-2.5 text-[13.5px] ${f.highlight ? "text-white/90" : "text-g700"}`}>
            <Icon name="check" size={17} stroke={2.4} className={`${f.highlight ? "text-orange-light" : "text-growth"} flex-shrink-0 mt-0.5`} />{x}
          </li>
        ))}
      </ul>
      <Btn
        variant={f.current ? "ghost" : f.highlight ? "primary" : "secondary"}
        className={`w-full mt-5 ${f.current ? "opacity-70" : ""}`}
        iconRight={f.current ? null : "arrow"}
        onClick={onPick}>
        {f.current ? "Ton palier actuel" : `Passer ${f.name}`}
      </Btn>
    </div>
  );
}

function PaymentSheet({ f, onClose, notify }) {
  const [method, setMethod] = useState(null);
  const [state, setState] = useState("choose");
  const pay = (m) => { setMethod(m); setState("loading"); setTimeout(() => setState("done"), 1700); };
  const methods = [
    { id: "wave", label: "Wave", desc: "Mobile money", color: "#1DC4F2", fg: "#053a4a" },
    { id: "mtn",  label: "MTN MoMo", desc: "Mobile money", color: "#FFCC00", fg: "#3a3000" },
    { id: "card", label: "Carte bancaire", desc: "Visa · Mastercard", color: "#E7E1D8", fg: "#1A1714" },
  ];

  return (
    <Sheet onClose={onClose} title={state === "done" ? "Bienvenue ! 🎉" : `Passer ${f.name}`}>
      {state === "choose" && (
        <div className="flex flex-col gap-4">
          <div className="bg-sable rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[15px]">{f.name}</div>
              <div className="text-[12.5px] text-g400">{f.tagline}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-extrabold text-[20px] text-charbon">{f.eur}<span className="text-[12px] text-g400 font-normal">{f.period}</span></div>
              <div className="text-[12px] text-growth font-semibold">{f.fcfa}</div>
            </div>
          </div>
          <span className="font-semibold text-[13.5px]">Choisis ton moyen de paiement</span>
          <div className="flex flex-col gap-2.5">
            {methods.map(m => (
              <button key={m.id} onClick={() => pay(m)} className="flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] border-g200 hover:border-orange transition text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-[13px]" style={{ background: m.color, color: m.fg }}>{m.label.split(" ")[0].slice(0, 4)}</div>
                <div className="flex-1">
                  <div className="font-display font-bold text-[15px]">{m.label}</div>
                  <div className="text-[12px] text-g400">{m.desc}</div>
                </div>
                <Icon name="chevron" size={18} className="text-g400" />
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-g400">Sans frais d'installation · TVA non applicable, art. 293 B du CGI.</p>
        </div>
      )}
      {state === "loading" && (
        <div className="py-10 flex flex-col items-center gap-3 text-center">
          <Spinner className="w-11 h-11" />
          <p className="font-display font-bold text-[15px]">Confirmation via {method.label}…</p>
          <p className="text-[13px] text-g400">Valide la demande sur ton téléphone.</p>
        </div>
      )}
      {state === "done" && (
        <div className="py-6 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-growth/12 flex items-center justify-center text-growth"><Icon name="check" size={34} stroke={2.5} /></div>
          <h3 className="font-display font-extrabold text-[20px]">Tu es {f.name} !</h3>
          <p className="text-[13.5px] text-g700 max-w-[280px]">Ton équipe est débloquée. On passe à la vitesse supérieure, comme nous. 🔥</p>
          <Btn className="w-full mt-2" iconRight="arrow" onClick={onClose}>C'est parti</Btn>
        </div>
      )}
    </Sheet>
  );
}
