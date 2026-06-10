import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { Icon, Logo, useToast, Sheet, Spinner } from './components/ui';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { MasterSheetScreen } from './screens/MasterSheetScreen';
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
  const [fab, setFab] = useState(false);
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

  if (phase === "login")      return <Frame dark={dark}><LoginScreen key={loginKey} onAuthed={loadProfile} />{toastNode}</Frame>;
  if (phase === "onboarding") return <Frame dark={dark}><OnboardingScreen onDone={loadProfile} installPromptRef={deferredPromptRef} />{toastNode}</Frame>;
  if (phase === "activation") return <Frame dark={dark}><ActivationScreen profile={profile} onDone={doneActivation} />{toastNode}</Frame>;

  const screens = {
    dashboard:   <DashboardScreen go={go} notify={notify} profile={profile} />,
    assistants:  <DashboardScreen go={go} notify={notify} profile={profile} />,
    catalogue:   <CatalogueScreen go={go} notify={notify} profile={profile} />,
    commandes:   <CommandesScreen go={go} notify={notify} profile={profile} />,
    profil:      <ProfilScreen go={go} notify={notify} dark={dark} setDark={handleSetDark} profile={profile} />,
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
  const COCKPIT_SECTIONS = ['carelle', 'pipeline', 'hub', 'veille', 'intel'];
  const SUBSCREEN_PARENT = {
    paliers: 'profil', methode: 'profil', notifications: 'profil', install: 'profil',
    fidelys: 'profil', agenda: 'profil', carnet: 'profil', formation: 'profil',
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
            {!isAdmin && (
              <button onClick={() => go("conversation", { assistant: "coach" })} className="mt-6 flex items-center gap-3 px-3.5 py-3 rounded-xl bg-charbon text-white font-display font-bold text-[14.5px]">
                <Icon name="spark" size={20} className="text-amber" /> Parler à {profile?.nom_assistant || 'mon Assists'}
              </button>
            )}
            {!isAdmin && profile?.plan_code !== 'bras_droit' && (
              <div className="mt-auto">
                <button onClick={() => go("paliers")} className="w-full rounded-xl p-4 text-left text-white" style={{ background: "linear-gradient(135deg,#FF7A2E,#F25C05)" }}>
                  <div className="font-display font-extrabold text-[14px]">Passer au Bras Droit</div>
                  <div className="text-[12px] text-white/85 mt-0.5">Assists illimité · 9 900 FCFA/mois</div>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* main column */}
        <div className="relative w-full lg:max-w-[460px] flex-shrink-0">
          <div className="bg-sable lg:rounded-[28px] lg:overflow-hidden lg:border lg:border-g200 lg:shadow-[0_24px_60px_-30px_rgba(26,23,20,.35)] h-screen lg:h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div id="aa-scroll" className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {screens[screen]}
              {!isConversation && <div className="h-24 lg:h-4" />}
            </div>

            {/* bottom nav mobile */}
            {!isConversation && (
              <div className={`lg:hidden absolute bottom-0 left-0 right-0 bg-white/92 backdrop-blur-xl border-t border-g200 flex items-center justify-around px-2 pt-2 pb-6 z-30`}>
                {TABS.map(t => (
                  <NavBtn key={t.id} t={t} active={activeTab === t.id} onClick={() => go(t.id)} />
                ))}
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
              { ic: "chat",  t: "Parler à un assistant", d: "Brainstorm & livrables", go: "conversation", p: { assistant: "coach" } },
              { ic: "mega",  t: "Un broadcast", d: "Message à ta communauté", go: "broadcasts" },
            ].map(x => (
              <button key={x.t} onClick={() => { setFab(false); go(x.go, x.p || {}); }} className="flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] border-g200 hover:border-orange transition text-left">
                <div className="w-11 h-11 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0"><Icon name={x.ic} size={21} /></div>
                <div>
                  <div className="font-display font-bold text-[15px]">{x.t}</div>
                  <div className="text-[12.5px] text-g400">{x.d}</div>
                </div>
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {screen !== 'conversation' && !isAdmin && <MarylineBubble go={go} dark={dark} />}
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

function MarylineBubble({ go, dark }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const bubbleBg    = dark ? '#1F1B18' : '#FFFFFF';
  const bubbleBorder = dark ? '#2e2823' : '#E8E2D9';
  const tailColor   = dark ? '#1F1B18' : '#FFFFFF';
  const textColor   = dark ? '#F5F0E8' : '#1A1714';
  const subColor    = dark ? '#6b6057' : '#9CA3AF';
  return (
    <div style={{ position: 'fixed', bottom: 90, right: 16, zIndex: 40, maxWidth: 270 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #F25C05', boxShadow: '0 2px 8px rgba(242,92,5,.3)' }}>
          <img src="/uploads/agents/hawa.jpg" alt="Maryline" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ position: 'absolute', bottom: 10, left: -6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `8px solid ${tailColor}`, filter: 'drop-shadow(-1px 1px 0px rgba(0,0,0,.06))' }} />
          <button
            onClick={() => go('conversation', { assistant: 'maryline' })}
            style={{ display: 'block', width: '100%', background: bubbleBg, border: `1px solid ${bubbleBorder}`, borderRadius: '18px 18px 18px 6px', padding: '10px 14px', textAlign: 'left', boxShadow: '0 4px 20px -4px rgba(26,23,20,.18)', cursor: 'pointer' }}
          >
            <div style={{ fontWeight: 700, fontSize: 11.5, color: '#F25C05', marginBottom: 4 }}>Maryline</div>
            <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
              Si tu as le moindre soucis ou si tu veux savoir tout ce qu'on peut faire ensemble ... demande moi
            </div>
            <div style={{ fontSize: 11, color: subColor, textAlign: 'right', marginTop: 4 }}>maintenant</div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#6B7280', color: 'white', border: `2px solid ${bubbleBg}`, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: 1 }}
          >×</button>
        </div>
      </div>
    </div>
  );
}

function Frame({ dark, children }) {
  return (
    <div className={`${dark ? "theme-dark" : ""} min-h-screen`} style={{ background: dark ? "#0c0907" : undefined }}>
      <div className="lg:bg-[#1a120c] min-h-screen" style={dark ? { background: "#0c0907" } : {}}>{children}</div>
    </div>
  );
}
