// ============ Screens 4, 5 : Mes assistants + Conversation ============

// ---------------- 4. MES ASSISTANTS ----------------
function AssistantsScreen({ go, notify }) {
  const [config, setConfig] = React.useState(null); // assistant being configured
  return (
    <div className="min-h-full bg-sable">
      <AppHeader title="Tes bras droits" sub="Ton équipe IA, prête à produire" />
      <div className="px-[18px] pb-4 flex flex-col gap-3.5">
        {/* active group */}
        <SectionLabel>Disponibles maintenant</SectionLabel>
        {MOCK.assistants.filter(a => a.status === "actif").map(a => (
          <AssistantCard key={a.id} a={a} onOpen={() => go("conversation", { assistant: a.id })} onConfig={() => setConfig(a)} />
        ))}

        <SectionLabel className="mt-2">Débloquer avec un palier</SectionLabel>
        {MOCK.assistants.filter(a => a.status === "verrouillé").map(a => (
          <AssistantCard key={a.id} a={a} locked onOpen={() => go("paliers")} />
        ))}

        {/* create */}
        <button onClick={() => setConfig({ id: "new", name: "", role: "", accent: "orange", icon: "spark", desc: "" })}
          className="mt-2 rounded-[20px] border-2 border-dashed border-orange/40 bg-orange/5 p-5 flex items-center gap-3.5 text-left hover:bg-orange/8 transition">
          <div className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center"><Icon name="plus" size={22} /></div>
          <div>
            <h4 className="font-display font-extrabold text-[15px] text-charbon">Créer un assistant sur-mesure</h4>
            <p className="text-[12.5px] text-g700">Donne-lui un rôle, un nom et un ton.</p>
          </div>
        </button>
      </div>

      {config && <ConfigSheet a={config} onClose={() => setConfig(null)} onSave={() => { setConfig(null); notify("Assistant configuré ✓"); }} />}
    </div>
  );
}

function AssistantCard({ a, locked, onOpen, onConfig }) {
  return (
    <Card className="p-4 flex items-center gap-3.5">
      <AssistGlyph accent={a.accent} icon={a.icon} size={50} locked={locked} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-display font-extrabold text-[15.5px]">{a.name}</h4>
          {locked ? <Pill tone="neutral" icon="lock">{a.plan}</Pill> : <Pill tone="growth">● Actif</Pill>}
        </div>
        <p className="text-[12.5px] text-g700 mt-0.5 leading-snug">{a.desc}</p>
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button onClick={onOpen} className={`w-10 h-10 rounded-xl flex items-center justify-center ${locked ? "bg-charbon/6 text-charbon" : "bg-orange text-white shadow-[0_6px_14px_-5px_rgba(242,92,5,.6)]"}`}>
          <Icon name={locked ? "lock" : "send"} size={18} />
        </button>
        {onConfig && <button onClick={onConfig} className="w-10 h-10 rounded-xl bg-white border border-g200 flex items-center justify-center text-g700"><Icon name="settings" size={17} /></button>}
      </div>
    </Card>
  );
}

function ConfigSheet({ a, onClose, onSave }) {
  const [name, setName] = React.useState(a.name);
  const [role, setRole] = React.useState(a.role || "");
  const [ton, setTon] = React.useState("Chaleureux");
  const isNew = a.id === "new";
  return (
    <Sheet onClose={onClose} title={isNew ? "Nouvel assistant" : `Configurer ${a.name}`}>
      <div className="flex flex-col gap-4">
        {!isNew && (
          <div className="flex items-center gap-3 bg-sable rounded-xl p-3">
            <AssistGlyph accent={a.accent} icon={a.icon} size={44} />
            <p className="text-[13px] text-g700 leading-snug">{a.desc}</p>
          </div>
        )}
        <Field label="Nom de l'assistant"><Input placeholder="Ex : Koffi le vendeur" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Son rôle"><Input placeholder="Ex : rédige mes pubs WhatsApp" value={role} onChange={e => setRole(e.target.value)} /></Field>
        <div>
          <span className="block font-semibold text-[13.5px] mb-2">Ton</span>
          <div className="flex flex-wrap gap-2">
            {["Chaleureux", "Direct", "Fun & rythmé", "Pro"].map(t => (
              <button key={t} onClick={() => setTon(t)} className={`px-3.5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] transition ${ton === t ? "bg-orange text-white border-orange" : "bg-white border-g200 text-g700"}`}>{t}</button>
            ))}
          </div>
        </div>
        <Btn className="w-full mt-1" icon="check" onClick={onSave}>{isNew ? "Créer mon assistant" : "Enregistrer"}</Btn>
      </div>
    </Sheet>
  );
}

// ---------------- 5. CONVERSATION ----------------
function ConversationScreen({ go, notify, params }) {
  const a = MOCK.assistants.find(x => x.id === (params && params.assistant)) || MOCK.assistants[0];
  const [msgs, setMsgs] = React.useState([
    { from: "bot", text: `Salut Aya 👊 Moi c'est ${a.name}. On va rendre ton bissap impossible à refuser. Je te prépare un argumentaire AIDA, prêt à copier ?` },
  ]);
  const [typing, setTyping] = React.useState(false);
  const [input, setInput] = React.useState("");
  const scroller = React.useRef();

  React.useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { from: "me", text }]); setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: "bot", text: "C'est prêt 🔥 Voici ton argumentaire AIDA. Tu peux le copier tel quel pour WhatsApp ou Insta :" }, { from: "bot", deliverable: AIDA_DELIVERABLE }]);
    }, 1600);
  };

  const suggestions = ["Rédige mon argumentaire AIDA", "Donne-moi 3 idées de posts", "Écris un message WhatsApp de relance"];

  return (
    <div className="min-h-full flex flex-col bg-sable">
      {/* header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 bg-white border-b border-g200 sticky top-0 z-10">
        <button onClick={() => go("assistants")} className="w-10 h-10 rounded-full hover:bg-sable flex items-center justify-center text-charbon"><Icon name="back" size={20} /></button>
        <AssistGlyph accent={a.accent} icon={a.icon} size={42} />
        <div className="flex-1">
          <h3 className="font-display font-extrabold text-[16px] leading-tight">{a.name}</h3>
          <div className="text-[12px] text-growth font-semibold flex items-center gap-1">● En ligne · {a.role}</div>
        </div>
        <button onClick={() => notify("Conversation enregistrée")} className="w-10 h-10 rounded-full hover:bg-sable flex items-center justify-center text-g700"><Icon name="settings" size={18} /></button>
      </div>

      {/* messages */}
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
        {msgs.map((m, i) => m.deliverable ? <DeliverableCard key={i} d={m.deliverable} notify={notify} /> : <Bubble key={i} from={m.from}>{m.text}</Bubble>)}
        {typing && <div className="self-start bg-white border border-g200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft"><TypingDots /></div>}
      </div>

      {/* suggestions */}
      {msgs.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {suggestions.map(s => <button key={s} onClick={() => send(s)} className="flex-shrink-0 px-3.5 py-2 rounded-full bg-white border border-g200 text-[12.5px] font-semibold text-g700 hover:border-orange/50 transition">{s}</button>)}
        </div>
      )}

      {/* input */}
      <div className="px-4 py-3 bg-white border-t border-g200 flex items-center gap-2.5">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Écris à ton assistant…" className="flex-1 bg-sable rounded-full px-4 py-3 text-[14.5px] outline-none focus:ring-2 focus:ring-orange/20" />
        <button onClick={() => send(input)} className="w-11 h-11 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_6px_16px_-5px_rgba(242,92,5,.6)] active:scale-95 transition flex-shrink-0"><Icon name="send" size={19} /></button>
      </div>
    </div>
  );
}

function Bubble({ from, children }) {
  const me = from === "me";
  return (
    <div className={`max-w-[82%] px-4 py-3 text-[14.5px] leading-relaxed shadow-soft animate-[fadeUp_.25s_ease] ${me ? "self-end bg-orange text-white rounded-2xl rounded-br-md" : "self-start bg-white text-charbon border border-g200 rounded-2xl rounded-bl-md"}`}>
      {children}
    </div>
  );
}

function DeliverableCard({ d, notify }) {
  return (
    <div className="self-start w-full max-w-[92%] animate-[fadeUp_.3s_ease]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-charbon text-white">
          <span className="font-display font-bold text-[13px] flex items-center gap-2"><Icon name="spark" size={16} className="text-amber" /> {d.title}</span>
          <Pill tone="white" className="!py-0.5">{d.tag}</Pill>
        </div>
        <div className="p-4 space-y-3">
          {d.blocks.map((b, i) => (
            <div key={i}>
              <div className="text-[11px] font-bold tracking-wider uppercase text-orange mb-1">{b.k}</div>
              <p className="text-[14px] text-charbon leading-relaxed">{b.v}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <Btn variant="primary" className="flex-1 !py-3 !text-[14px]" icon="copy" onClick={() => notify("Copié ✓ — prêt à coller")}>Copier le texte</Btn>
          <button onClick={() => notify("Régénéré")} className="w-12 rounded-xl border-[1.5px] border-g200 flex items-center justify-center text-g700 hover:border-orange/50"><Icon name="refresh" size={19} /></button>
        </div>
      </Card>
    </div>
  );
}

const AIDA_DELIVERABLE = {
  title: "Argumentaire AIDA", tag: "Bissap",
  blocks: [
    { k: "Attention", v: "Abidjan, il fait 33° et tu bois encore du soda chimique ? 🥵" },
    { k: "Intérêt", v: "Chez Aya, c'est du bissap 100 % maison, frais du jour, zéro conservateur. Le vrai goût de chez nous." },
    { k: "Désir", v: "Imagine : ta pause déj' fraîche, saine, livrée au bureau en 30 min. Tes collègues vont demander ton plug." },
    { k: "Action", v: "Commande ton Pack 6 aujourd'hui : −20 % les 48h + livraison offerte. Écris-nous « BISSAP » sur WhatsApp 👉" },
  ],
};

// ---------------- Sheet (bottom sheet / modal) ----------------
function Sheet({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-charbon/50 backdrop-blur-[2px] animate-[fade_.2s_ease]"></div>
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[480px] bg-white rounded-t-[26px] lg:rounded-[26px] p-5 pb-7 shadow-2xl animate-[slideUp_.28s_cubic-bezier(.2,.9,.3,1)] max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-extrabold text-[19px]">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-sable flex items-center justify-center text-g700"><Icon name="close" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { AssistantsScreen, ConversationScreen, Sheet });
