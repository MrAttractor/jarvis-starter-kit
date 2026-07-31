// ============ App shell : routing · bottom nav · sidebar · FAB ============

const TABS = [
  { id: "dashboard", label: "Accueil", icon: "home" },
  { id: "mastersheet", label: "MasterSheet", icon: "sheet" },
  { id: "assistants", label: "Assistants", icon: "bot" },
  { id: "profil", label: "Profil", icon: "user" },
];

function App() {
  const [phase, setPhase] = React.useState("login"); // login | onboarding | app
  const [screen, setScreen] = React.useState("dashboard");
  const [params, setParams] = React.useState({});
  const [dark, setDark] = React.useState(false);
  const [fab, setFab] = React.useState(false);
  const [toastNode, notify] = useToast();

  const go = (s, p = {}) => {
    if (s === "logout") { setPhase("login"); setScreen("dashboard"); return; }
    if (s === "onboarding") { setPhase("onboarding"); return; }
    setParams(p); setScreen(s);
    const scroller = document.getElementById("aa-scroll");
    if (scroller) scroller.scrollTop = 0;
  };

  // ---- auth / onboarding (full-bleed) ----
  if (phase === "login") return <Frame dark={dark}><LoginScreen onAuthed={() => setPhase("onboarding")} />{toastNode}</Frame>;
  if (phase === "onboarding") return <Frame dark={dark}><OnboardingScreen onDone={() => { setPhase("app"); setScreen("dashboard"); }} />{toastNode}</Frame>;

  const screens = {
    dashboard: <DashboardScreen go={go} notify={notify} />,
    mastersheet: <MasterSheetScreen go={go} notify={notify} />,
    assistants: <AssistantsScreen go={go} notify={notify} />,
    profil: <ProfilScreen go={go} notify={notify} dark={dark} setDark={setDark} />,
    conversation: <ConversationScreen go={go} notify={notify} params={params} />,
    axes: <AxesScreen go={go} notify={notify} />,
    broadcasts: <BroadcastsScreen go={go} notify={notify} />,
    paliers: <PaliersScreen go={go} notify={notify} />,
  };
  const isConversation = screen === "conversation";
  const activeTab = TABS.find(t => t.id === screen) ? screen : "dashboard";

  return (
    <Frame dark={dark}>
      <div className="lg:flex lg:justify-center lg:gap-6 lg:py-6 lg:px-6 lg:min-h-screen">
        {/* desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[244px] flex-shrink-0 sticky top-6 self-start h-[calc(100vh-3rem)]">
          <div className="bg-white rounded-[24px] border border-g200 shadow-soft p-5 flex flex-col h-full">
            <div className="px-1 mb-7"><Logo size="md" /></div>
            <nav className="flex flex-col gap-1.5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => go(t.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-display font-bold text-[14.5px] transition ${activeTab === t.id ? "bg-orange text-white shadow-[0_8px_18px_-7px_rgba(242,92,5,.6)]" : "text-g700 hover:bg-sable"}`}>
                  <Icon name={t.icon} size={20} />{t.label}
                </button>
              ))}
            </nav>
            <button onClick={() => go("conversation", { assistant: "coach" })} className="mt-6 flex items-center gap-3 px-3.5 py-3 rounded-xl bg-charbon text-white font-display font-bold text-[14.5px]">
              <Icon name="spark" size={20} className="text-amber" /> Parler à mon coach
            </button>
            <div className="mt-auto">
              <button onClick={() => go("paliers")} className="w-full rounded-xl p-4 text-left text-white" style={{ background: "linear-gradient(135deg,#FF7A2E,#F25C05)" }}>
                <div className="font-display font-extrabold text-[14px]">Passe Manager</div>
                <div className="text-[12px] text-white/85 mt-0.5">Toute ton équipe IA · −70 %</div>
              </button>
            </div>
          </div>
        </aside>

        {/* main column */}
        <div className="relative w-full lg:max-w-[460px] flex-shrink-0">
          <div className="bg-sable lg:rounded-[28px] lg:overflow-hidden lg:border lg:border-g200 lg:shadow-[0_24px_60px_-30px_rgba(26,23,20,.35)] h-screen lg:h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div id="aa-scroll" className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {screens[screen]}
              {!isConversation && <div className="h-24 lg:h-4"></div>}
            </div>

            {/* bottom nav (mobile) */}
            {!isConversation && (
              <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white/92 backdrop-blur-xl border-t border-g200 flex items-center justify-around px-2 pt-2 pb-6 z-30">
                {TABS.slice(0, 2).map(t => <NavBtn key={t.id} t={t} active={activeTab === t.id} onClick={() => go(t.id)} />)}
                <button onClick={() => setFab(true)} className="w-14 h-14 -mt-7 rounded-full bg-orange text-white flex items-center justify-center shadow-[0_10px_22px_-6px_rgba(242,92,5,.7)] border-[3px] border-sable flex-shrink-0 active:scale-95 transition">
                  <Icon name="plus" size={26} />
                </button>
                {TABS.slice(2).map(t => <NavBtn key={t.id} t={t} active={activeTab === t.id} onClick={() => go(t.id)} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB action sheet */}
      {fab && (
        <Sheet onClose={() => setFab(false)} title="On produit quoi ?">
          <div className="flex flex-col gap-2.5">
            {[
              { ic: "spark", t: "Un argumentaire", d: "AIDA ou PASA, prêt à copier", go: "axes" },
              { ic: "chat", t: "Parler à un assistant", d: "Brainstorm & livrables", go: "conversation", p: { assistant: "coach" } },
              { ic: "mega", t: "Un broadcast", d: "Message à ta communauté", go: "broadcasts" },
            ].map(x => (
              <button key={x.t} onClick={() => { setFab(false); go(x.go, x.p || {}); }} className="flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] border-g200 hover:border-orange transition text-left">
                <div className="w-11 h-11 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0"><Icon name={x.ic} size={21} /></div>
                <div><div className="font-display font-bold text-[15px]">{x.t}</div><div className="text-[12.5px] text-g400">{x.d}</div></div>
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {toastNode}
    </Frame>
  );
}

function NavBtn({ t, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 ${active ? "text-orange" : "text-g400"}`}>
      <Icon name={t.icon} size={22} stroke={active ? 2.2 : 1.9} />
      <span className="text-[10px] font-bold">{t.label}</span>
    </button>
  );
}

// outer frame — handles dark theme + desktop backdrop
function Frame({ dark, children }) {
  return (
    <div className={`${dark ? "theme-dark" : ""} min-h-screen`} style={{ background: dark ? "#0c0907" : undefined }}>
      <div className="lg:bg-[#1a120c] min-h-screen">{children}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
