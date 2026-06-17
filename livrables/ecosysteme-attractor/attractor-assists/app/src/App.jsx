import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Icon, Logo, useToast, Sheet, Spinner } from './components/ui';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { AssistantsScreen } from './screens/AssistantsScreen';
import { ConversationScreen } from './screens/ConversationScreen';
import { AxesScreen } from './screens/AxesScreen';
import { InstallGuide, detectPlatform } from './screens/InstallScreen';
import { ActivationScreen } from './screens/ActivationScreen';
import { BroadcastsScreen } from './screens/BroadcastsScreen';
import { PaliersScreen } from './screens/PaliersScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { AdminScreen } from './screens/AdminScreen';
import { MacCockpitScreen } from './screens/MacCockpitScreen';
import { MéthodeScreen } from './screens/MéthodeScreen';
import { CarnetAffairesScreen } from './screens/CarnetAffairesScreen';
import { DechargeVocaleScreen } from './screens/DechargeVocaleScreen';
import { MarketplaceScreen } from './screens/MarketplaceScreen';
import MonAppScreen from './screens/MonAppScreen';
import { PublicAssistantScreen } from './screens/PublicAssistantScreen';
import { FidelysScreen } from './screens/FidelysScreen';
import { CatalogueScreen } from './screens/CatalogueScreen';
import { CommandesScreen } from './screens/CommandesScreen';
import { TemplateGalerieScreen } from './screens/TemplateGalerieScreen';
import { FormationScreen } from './screens/FormationScreen';

const TABS_V3 = [
  { id: "dashboard",  label: "Assists",   icon: "chat"    },
  { id: "catalogue",  label: "Catalogue", icon: "grid"    },
  { id: "commandes",  label: "Commandes", icon: "package" },
  { id: "profil",     label: "Profil",    icon: "user"    },
];
const TABS_ADMIN = [
  { id: "dashboard",   label: "Accueil",    icon: "home"   },
  { id: "assistants",  label: "Mon équipe", icon: "users"  },
  { id: "marketplace", label: "Marketplace",icon: "grid"   },
  { id: "cockpit",     label: "Cockpit",    icon: "bolt"   },
  { id: "profil",      label: "Profil",     icon: "user"   },
];

export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | login | onboarding | app
  const [publicSlug, setPublicSlug] = useState(null); // ?c={slug} → assistant client public, sans auth
  const [loginKey, setLoginKey] = useState(0);   // force remount LoginScreen si loadProfile échoue
  const deferredPromptRef = useRef(null);
  const paymentReturnRef = useRef(null); // plan_id si retour paiement
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [params, setParams] = useState({});
  const [dark, setDark] = useState(() => localStorage.getItem('aa-dark') === '1');
  const handleSetDark = (val) => { localStorage.setItem('aa-dark', val ? '1' : '0'); setDark(val); };
  const [toastNode, notify] = useToast();
  const [navBadges, setNavBadges] = useState({ assistants: 0, marketplace: 0 });

  // Toast de confirmation paiement après chargement du profil
  useEffect(() => {
    if (phase === 'app' && paymentReturnRef.current) {
      const plan = paymentReturnRef.current;
      paymentReturnRef.current = null;
      notify(`Paiement confirmé. Bienvenue sur ${plan} !`);
    }
  }, [phase]);

  const loadProfile = async () => {
    try {
      // getSession() lit le localStorage sans appel réseau → fonctionne sur WiFi lent/captif
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoginKey(k => k + 1); setPhase("login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      supabase.rpc('ping_last_seen').then(() => {}, () => {});
      // Admin : bypass onboarding/activation, dashboard direct
      if (prof?.role === 'admin') {
        setScreen("dashboard");
        setPhase("app");
        return;
      }
      if (!prof?.onboarding_done) {
        setPhase("onboarding");
      } else if (!prof?.activation_done) {
        setPhase("activation");
      } else {
        setPhase("app");
      }
    } catch (e) {
      console.error("loadProfile error:", e);
      setLoginKey(k => k + 1);
      setPhase("login");
    }
  };

  const doneActivation = async (screen = "dashboard", params = {}) => {
    setScreen(screen);
    setParams(params);
    setPhase("app");
  };

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); deferredPromptRef.current = e; };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Lien public assistant client (?c={slug}) — bascule AVANT toute logique d'auth
    const urlParams = new URLSearchParams(window.location.search);
    const c = urlParams.get('c');
    if (c) { setPublicSlug(c); return; }

    // Détection retour paiement XPaye (?payment_done=1&plan=growth)
    if (urlParams.get('payment_done') === '1') {
      paymentReturnRef.current = urlParams.get('plan') ?? 'nouveau palier';
      window.history.replaceState({}, '', window.location.pathname);
    }
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") loadProfile();
      if (event === "SIGNED_OUT") { setProfile(null); setPhase("login"); setScreen("dashboard"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [{ count: mktCount }] = await Promise.all([
          supabase.from('prestataires').select('id', { count: 'exact', head: true }).eq('statut', 'visible'),
        ]);
        setNavBadges(b => ({ ...b, assistants: 6, marketplace: mktCount || 0 }));
      } catch {}
    };
    loadBadges();
  }, []);

  const go = (s, p = {}) => {
    if (s === "logout") { supabase.auth.signOut(); return; }
    if (s === "onboarding") { setPhase("onboarding"); return; }
    setParams(p); setScreen(s);
    const scroller = document.getElementById("aa-scroll");
    if (scroller) scroller.scrollTop = 0;
  };

  // Lien public assistant client — écran isolé, sans auth ni navigation interne
  if (publicSlug) return <Frame dark={false}><PublicAssistantScreen slug={publicSlug} /></Frame>;

  if (phase === "loading") return (
    <Frame dark={false}>
      <div className="min-h-screen flex items-center justify-center bg-sable">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-10 h-10" />
          <p className="font-display font-bold text-[15px] text-charbon opacity-50">Chargement…</p>
        </div>
      </div>
    </Frame>
  );

  if (phase === "login")      return <Frame dark={dark}><MobileFrame><LoginScreen key={loginKey} onAuthed={loadProfile} /></MobileFrame>{toastNode}</Frame>;
  if (phase === "onboarding") return <Frame dark={dark}><MobileFrame><OnboardingScreen onDone={loadProfile} installPromptRef={deferredPromptRef} /></MobileFrame>{toastNode}</Frame>;
  if (phase === "activation") return <Frame dark={dark}><MobileFrame><ActivationScreen profile={profile} onDone={doneActivation} /></MobileFrame>{toastNode}</Frame>;

  const screens = {
    dashboard:   <DashboardScreen go={go} notify={notify} profile={profile} />,
    assistants:  <DashboardScreen go={go} notify={notify} profile={profile} />,
    catalogue:   <CatalogueScreen go={go} notify={notify} profile={profile} />,
    commandes:   <CommandesScreen go={go} notify={notify} profile={profile} />,
    profil:      <ProfilScreen go={go} notify={notify} dark={dark} setDark={handleSetDark} profile={profile} reloadProfile={loadProfile} />,
    conversation:<ConversationScreen key={`${params?.assistant||'coach'}-${params?.mode||'default'}`} go={go} notify={notify} params={params} profile={profile} />,
    axes:        <AxesScreen go={go} notify={notify} />,
    broadcasts:  <BroadcastsScreen go={go} notify={notify} />,
    paliers:     <PaliersScreen go={go} notify={notify} profile={profile} />,
    agenda:        <AgendaScreen go={go} profile={profile} />,
    notifications: <NotificationsScreen go={go} />,
    admin:         <AdminScreen go={go} notify={notify} />,
    cockpit:  <MacCockpitScreen go={go} notify={notify} section="cockpit"  profile={profile} />,
    carelle:  <MacCockpitScreen go={go} notify={notify} section="carelle"  profile={profile} />,
    pipeline: <MacCockpitScreen go={go} notify={notify} section="pipeline" profile={profile} />,
    hub:      <MacCockpitScreen go={go} notify={notify} section="hub"      profile={profile} />,
    veille:   <MacCockpitScreen go={go} notify={notify} section="veille"   profile={profile} />,
    intel:    <MacCockpitScreen go={go} notify={notify} section="intel"    profile={profile} />,
    methode:       <MéthodeScreen go={go} />,
    formation:     <FormationScreen go={go} />,
    carnet:        <CarnetAffairesScreen go={go} />,
    dump:          <DechargeVocaleScreen go={go} profile={profile} />,
    fidelys:       <FidelysScreen go={go} notify={notify} profile={profile} />,
    marketplace:   <MarketplaceScreen go={go} notify={notify} />,
    'mon-app':     <MonAppScreen go={go} profile={profile} />,
    'galerie-templates': <TemplateGalerieScreen go={go} notify={notify} profile={profile} />,
    install:     <InstallGuide
                   platform={detectPlatform()}
                   prenom={profile?.prenom || ''}
                   nomAssistant={profile?.nom_assistant || 'ton assistant'}
                   installPromptRef={deferredPromptRef}
                   onDone={() => go('profil')}
                 />,
  };
  const isAdmin   = profile?.role === 'admin';
  const TABS = isAdmin ? TABS_ADMIN : TABS_V3;
  const isConversation = screen === "conversation";
  const isChat = screen === "dashboard" || screen === "conversation";
  const COCKPIT_SECTIONS = ['carelle', 'pipeline', 'hub', 'veille', 'intel'];
  const SUBSCREEN_PARENT = {
    paliers: 'profil', methode: 'profil', notifications: 'profil', install: 'profil',
    fidelys: 'profil', agenda: 'profil', carnet: 'profil', formation: 'profil',
    'galerie-templates': 'catalogue',
    conversation: 'dashboard', dump: 'dashboard',
    axes: 'dashboard', broadcasts: 'dashboard',
  };
  const activeTab = TABS.find(t => t.id === screen)
    ? screen
    : (isAdmin && COCKPIT_SECTIONS.includes(screen) ? 'cockpit'
      : (SUBSCREEN_PARENT[screen] || 'dashboard'));

  return (
    <Frame dark={dark}>
      <div className="lg:flex lg:justify-center lg:gap-6 lg:py-6 lg:px-6 lg:min-h-screen">
        {/* desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[244px] flex-shrink-0 sticky top-6 self-start h-[calc(100vh-3rem)]">
          <div className="bg-white rounded-[24px] border border-g200 shadow-soft p-5 flex flex-col h-full">
            <div className="px-1 mb-7"><Logo size="md" /></div>
            <nav className="flex flex-col gap-1.5">
              {TABS.map(t => {
                const badge = !isAdmin && navBadges[t.id];
                return (
                  <button key={t.id} onClick={() => go(t.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-display font-bold text-[14.5px] transition ${activeTab === t.id ? "bg-orange text-white shadow-[0_8px_18px_-7px_rgba(242,92,5,.6)]" : "text-g700 hover:bg-sable"}`}>
                    <div className="relative flex-shrink-0">
                      <Icon name={t.icon} size={20} />
                      {badge > 0 && (
                        <span className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center px-1 leading-none ${activeTab === t.id ? "bg-white text-orange" : "bg-orange text-white"}`}>
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </div>
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* main column */}
        <div className="relative w-full lg:max-w-[460px] flex-shrink-0">
          <div className="bg-sable lg:rounded-[28px] lg:overflow-hidden lg:border lg:border-g200 lg:shadow-[0_24px_60px_-30px_rgba(26,23,20,.35)] h-[100dvh] lg:h-[calc(100dvh-3rem)] flex flex-col overflow-hidden">
            <div id="aa-scroll" className={`flex-1 ${isChat ? 'overflow-hidden' : 'overflow-y-auto'}`} style={{ scrollbarWidth: "none" }}>
              {screens[screen]}
              {!isChat && <div className="h-4" />}
            </div>

            {/* bottom nav mobile — dans le flux flex, pas absolute */}
            {!isConversation && (
              <div className="lg:hidden flex-shrink-0 bg-white/92 backdrop-blur-xl border-t border-g200 flex items-center justify-around px-2 pt-2" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                {TABS.map(t => (
                  <NavBtn key={t.id} t={t} active={activeTab === t.id} onClick={() => go(t.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toastNode}
    </Frame>
  );
}

function NavBtn({ t, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 ${active ? "text-orange" : "text-g400"}`}>
      <div className="relative">
        <Icon name={t.icon} size={22} stroke={active ? 2.2 : 1.9} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-orange text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold">{t.label}</span>
    </button>
  );
}

function MobileFrame({ children }) {
  return (
    <div className="lg:flex lg:justify-center lg:items-center lg:min-h-screen">
      <div className="w-full lg:max-w-[460px] lg:h-[calc(100dvh-3rem)] lg:rounded-[28px] lg:overflow-hidden lg:shadow-[0_24px_60px_-30px_rgba(26,23,20,.5)]">
        {children}
      </div>
    </div>
  );
}

function Frame({ dark, children }) {
  return (
    <div className={`${dark ? "theme-dark" : ""} h-full overflow-hidden`} style={{ background: dark ? "#0c0907" : undefined }}>
      <div className="lg:bg-[#1a120c] h-full overflow-hidden" style={dark ? { background: "#0c0907" } : {}}>{children}</div>
    </div>
  );
}
