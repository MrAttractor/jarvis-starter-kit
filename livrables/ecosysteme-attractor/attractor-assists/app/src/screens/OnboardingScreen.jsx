import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui';
import { InstallGuide, detectPlatform } from './InstallScreen';
import { Anamnese } from '../components/Anamnese';
import { PitchModal } from '../components/Pitch';
import { checkSlug } from '../lib/slug';
import { boutiqueUrl } from '../lib/boutique';

// L'ordre réel du tunnel. La barre de progression le lit : avant, elle annonçait
// « 4 étapes » alors qu'il y en a 8, et affichait 4/4 sur l'écran des produits
// PUIS encore 4/4 sur les 7 questions. L'entrepreneur se croyait arrivé et
// abandonnait à la dernière marche.
const TUNNEL = ['bapteme', 'profil_type', 'anamnese', 'template', 'slug', 'whatsapp', 'upload', 'assistant'];

// D'où l'on revient. Pas de retour depuis `bapteme` (début) ni depuis `assistant`
// (le profil et les produits sont déjà écrits en base à ce stade).
const PREV_PHASE = {
  profil_type: 'bapteme',
  anamnese:    'profil_type',
  template:    'anamnese',
  slug:        'template',
  whatsapp:    'slug',
  upload:      'whatsapp',
};

function ProgressBar({ phase }) {
  const idx = TUNNEL.indexOf(phase) + 1;
  if (idx < 1) return null;
  // Pas de padding horizontal ici : les en-têtes qui l'appellent portent déjà
  // le leur, la barre se retrouvait en retrait de 32 px sous des titres à 16 px.
  return (
    <div>
      <div className="flex gap-1.5">
        {TUNNEL.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < idx ? 'bg-orange' : 'bg-g200'}`} />
        ))}
      </div>
      <p className="text-[11px] font-bold text-g400 mt-1.5">Étape {idx} sur {TUNNEL.length}</p>
    </div>
  );
}

/** Le retour d'une étape à l'autre. Absent, l'entrepreneur qui se trompe de
    modèle ou de lien n'a que la fermeture de l'app comme issue. */
function BackBtn({ onClick }) {
  if (!onClick) return null;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-11 pr-3 -ml-1 text-[13.5px] font-semibold text-g500 active:text-charbon transition"
    >
      <Icon name="back" size={17} /> Retour
    </button>
  );
}

function AssistBubble({ text }) {
  return (
    <div className="flex items-start gap-2.5">
      <img
        src="/uploads/agents/carelle.jpg"
        alt="Assists"
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-g200"
      />
      <div className="bg-white px-4 py-3 rounded-[18px] rounded-tl-[4px] max-w-[82%] shadow-soft border border-g200">
        <p className="text-[14.5px] text-charbon leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-orange text-white px-4 py-2.5 rounded-[18px] rounded-tr-[4px] max-w-[82%] text-[14px] font-medium leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.55)] disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 transition ${className}`}
    >
      {children}
    </button>
  );
}

const TEMPLATES = [
  { id: '1a', name: 'Classique', desc: 'Grille de produits, style épuré' },
  { id: '1b', name: 'Liste',     desc: 'Détail vertical, idéal restauration' },
  { id: '1c', name: 'Magazine',  desc: 'Hero immersif, beauté et mode' },
];

const COLOR_PALETTE = [
  { hex: '#FF6B35', label: 'Orange' },
  { hex: '#1B3A2F', label: 'Vert'   },
  { hex: '#2563EB', label: 'Bleu'   },
  { hex: '#9333EA', label: 'Violet' },
  { hex: '#DB2777', label: 'Rose'   },
  { hex: '#C9A84C', label: 'Or'     },
];

function TemplatePreview({ id, color }) {
  if (id === '1a') return (
    <div style={{ background: '#1a1714', height: 88, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}33`, border: `1.5px solid ${color}`, flexShrink: 0 }} />
        <div>
          <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.75)', borderRadius: 3, marginBottom: 4 }} />
          <div style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ height: 30, borderRadius: 6, background: i === 0 ? color : 'rgba(255,255,255,0.13)' }} />
        ))}
      </div>
    </div>
  );

  if (id === '1b') return (
    <div style={{ background: '#1B3A2F', height: 88, padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}33`, border: `1.5px solid ${color}`, flexShrink: 0 }} />
        <div style={{ width: 56, height: 6, background: 'rgba(255,255,255,0.8)', borderRadius: 3 }} />
      </div>
      {[0,1].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 7px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: i === 0 ? color : 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '60%', height: 5, background: 'rgba(255,255,255,0.75)', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ width: '35%', height: 4, background: color, borderRadius: 2, opacity: 0.85 }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ height: 88, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F0A1A,#2A0A20)', flex: '0 0 56px', padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
        <div style={{ display: 'inline-flex', background: color, borderRadius: 10, padding: '2px 8px', alignSelf: 'flex-start' }}>
          <div style={{ width: 30, height: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 2 }} />
        </div>
        <div style={{ width: 72, height: 7, background: '#fff', borderRadius: 3 }} />
      </div>
      <div style={{ background: '#FAF8F4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 5, flex: 1 }}>
        {[0,1].map(i => (
          <div key={i} style={{ borderRadius: 4, background: i === 0 ? color : '#e5e7eb', opacity: i === 0 ? 0.9 : 1 }} />
        ))}
      </div>
    </div>
  );
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20);
}

// Le numéro part dans un lien wa.me : chiffres uniquement, indicatif pays compris.
function normalizeWa(v) {
  return (v || '').replace(/\D/g, '');
}

const LOCAL_KEY = 'aa_onboarding_v1';

export function OnboardingScreen({ onDone, installPromptRef }) {
  const [phase, setPhase]         = useState('welcome');
  const [nomAss, setNomAss]       = useState('');
  const [prenom, setPrenom]       = useState('');
  const [baptemeQ, setBaptemeQ]   = useState(0);
  const [inputVal, setInputVal]   = useState('');
  // Deux fils de discussion distincts. Ils partageaient la même variable, donc
  // revenir sur l'anamnèse effaçait le baptême et inversement.
  const [chatHistory, setChatHistory] = useState([]);
  const [anamnHistory, setAnamnHistory] = useState([]);
  const [profilType, setProfilType]   = useState('');
  const [anamnQ, setAnamnQ]       = useState(0);
  const [anamnData, setAnamnData] = useState({});
  const [produits, setProduits]   = useState([]);
  const [newProd, setNewProd]     = useState({ nom: '', prix: '' });
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState('');
  const [templateId, setTemplateId] = useState('1a');
  const [brandColor, setBrandColor] = useState('#FF6B35');
  const [whatsapp, setWhatsapp]     = useState('');
  const [showPitch, setShowPitch]   = useState(false);

  // Slug
  const [slug, setSlug]                   = useState('');
  const [slugChecking, setSlugChecking]   = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(null);
  const [slugError, setSlugError]         = useState('');

  const inputRef  = useRef(null);
  const chatRef   = useRef(null);
  const photoRef  = useRef(null);
  const [photoTarget,    setPhotoTarget]    = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [lastPhotoFiles, setLastPhotoFiles] = useState({});
  const [cleaningIndex,  setCleaningIndex]  = useState(null);
  const [cleanStatus,    setCleanStatus]    = useState('');

  const ANAMN_QUESTIONS = [
    'Tu fais quoi exactement ? Dis-moi ton activité en quelques mots.',
    'Tu travailles où ? Ville, quartier, ou tu livres partout ?',
  ];
  const ANAMN_KEYS = ['activite', 'zone'];

  const assistName = nomAss || 'Assists';

  const scrollChat = () => {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 50);
  };

  // Vérification disponibilité slug (debounce 600ms).
  // Passe par slug_available() : forme + mots réservés + unicité en un appel,
  // sans exposer de lignes de `profiles` au rôle anon.
  useEffect(() => {
    if (!slug || slug.length < 3) { setIsSlugAvailable(null); setSlugError(''); return; }
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      const { ok, error } = await checkSlug(slug);
      setIsSlugAvailable(ok);
      setSlugError(error || '');
      setSlugChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [slug]);

  // Restaurer la progression depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);
      if (!s?.phase || ['welcome', 'pret', 'install'].includes(s.phase)) return;
      if (s.prenom)      setPrenom(s.prenom);
      if (s.nomAss)      setNomAss(s.nomAss);
      if (s.profilType)  setProfilType(s.profilType);
      if (s.anamnData)   setAnamnData(s.anamnData);
      if (s.anamnQ !== undefined) setAnamnQ(s.anamnQ);
      if (s.baptemeQ !== undefined) setBaptemeQ(s.baptemeQ);
      if (s.chatHistory)  setChatHistory(s.chatHistory);
      if (s.anamnHistory) setAnamnHistory(s.anamnHistory);
      if (s.templateId)  setTemplateId(s.templateId);
      if (s.brandColor)  setBrandColor(s.brandColor);
      if (s.slug)        setSlug(s.slug);
      if (s.whatsapp)    setWhatsapp(s.whatsapp);
      if (s.produits)    setProduits(s.produits);
      setPhase(s.phase);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder la progression à chaque changement d'état significatif
  useEffect(() => {
    // Après « pret », le compte est marqué terminé : plus rien à reprendre.
    if (['welcome', 'pret', 'install'].includes(phase)) {
      localStorage.removeItem(LOCAL_KEY);
      return;
    }
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({
        phase, prenom, nomAss, profilType, anamnData, anamnQ, baptemeQ,
        chatHistory, anamnHistory, templateId, brandColor, slug, whatsapp, produits,
      }));
    } catch {}
  }, [phase, prenom, nomAss, profilType, anamnData, anamnQ, baptemeQ, chatHistory, anamnHistory, templateId, brandColor, slug, whatsapp, produits]);

  /** Revenir à l'étape précédente du tunnel. */
  const goBack = () => {
    const prev = PREV_PHASE[phase];
    if (prev) { setInputVal(''); setPhase(prev); }
  };

  // ── Upload photo produit ──────────────────────────────────────────────────────

  const handlePhotoUpload = async (file) => {
    if (!file || photoTarget === null) return;
    setPhotoUploading(true);
    setLastPhotoFiles(f => ({ ...f, [photoTarget]: file }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('catalogue-photos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('catalogue-photos').getPublicUrl(path);
      setProduits(ps => ps.map((p, i) => i === photoTarget ? { ...p, photo_url: publicUrl } : p));
    } catch {}
    setPhotoUploading(false);
    setPhotoTarget(null);
  };

  const handleCleanPhoto = async (index) => {
    const source = lastPhotoFiles[index] || produits[index]?.photo_url;
    if (!source) return;
    setCleaningIndex(index);
    setCleanStatus('');
    try {
      const { cleanPhotoBackground } = await import('../lib/photoUtils');
      const cleanedBlob = await cleanPhotoBackground(source, setCleanStatus);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const path = `${user.id}/${Date.now()}_clean.jpg`;
      await supabase.storage.from('catalogue-photos').upload(path, cleanedBlob, { upsert: true, contentType: 'image/jpeg' });
      const { data: { publicUrl } } = supabase.storage.from('catalogue-photos').getPublicUrl(path);
      setProduits(ps => ps.map((p, i) => i === index ? { ...p, photo_url: publicUrl } : p));
      setLastPhotoFiles(f => { const n = { ...f }; delete n[index]; return n; });
    } catch {}
    setCleaningIndex(null);
    setCleanStatus('');
  };

  // ── Sauvegarde de la boutique, puis anamnèse ───────────────────────────────────

  // Écrit le profil et le catalogue, puis envoie vers les 7 questions.
  // `onboarding_done` n'est PAS posé ici : tant que l'assistant n'existe pas, la
  // boutique n'a rien à répondre aux clients. Si l'entrepreneur ferme l'app entre
  // les deux, il reprend au même endroit (progression en localStorage) au lieu
  // d'atterrir dans l'app avec une boutique muette.
  const handleSave = async () => {
    setSaving(true);
    setSaveErr('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session perdue');

      const referralCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();
      const sourceAcquisition = localStorage.getItem('aa_src') || null;

      const { error: profileErr } = await supabase.from('profiles').update({
        prenom:              prenom.trim() || '',
        nom_assistant:       (nomAss || 'Assists').trim(),
        activite:            anamnData.activite || null,
        zone:                anamnData.zone?.trim() || '',
        profil_type:         profilType || 'entrepreneur',
        referral_code:       referralCode,
        public_slug:         slug.trim() || null,
        whatsapp:            normalizeWa(whatsapp),
        template_choisi:     templateId || '1a',
        brand_color:         brandColor || '#FF6B35',
        source_acquisition:  sourceAcquisition,
      }).eq('id', user.id);
      if (profileErr) throw profileErr;

      if (sourceAcquisition) localStorage.removeItem('aa_src');

      // Produits saisis pendant l'onboarding. Insérés une seule fois : on ne
      // revient pas sur cette phase une fois passée à l'anamnèse.
      const actifsOnly = produits.filter(p => p.actif);
      if (actifsOnly.length > 0) {
        const { error: prodErr } = await supabase.from('produits_user').insert(
          actifsOnly.map(p => ({
            user_id:   user.id,
            nom:       p.nom.trim(),
            prix:      parseInt(p.prix) || 0,
            unite:     'unité',
            actif:     true,
            photo_url: p.photo_url || null,
          }))
        );
        if (prodErr) throw prodErr;
      }

      // Non-bloquant : échec silencieux si pas de parrain
      try {
        const refCode = localStorage.getItem('aa_ref');
        if (refCode && refCode !== referralCode) {
          const { data: referrer } = await supabase
            .from('profiles').select('id, referral_count')
            .eq('referral_code', refCode).neq('id', user.id).maybeSingle();
          if (referrer) {
            await Promise.all([
              supabase.from('profiles').update({ referred_by: refCode }).eq('id', user.id),
              supabase.from('profiles').update({ referral_count: (referrer.referral_count || 0) + 1 }).eq('id', referrer.id),
            ]);
          }
          localStorage.removeItem('aa_ref');
        }
      } catch { /* referral optionnel */ }

      setPhase('assistant');
    } catch (err) {
      console.error('[Onboarding] handleSave error:', err);
      setSaveErr('Une erreur est survenue. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  // L'assistant client est prêt : le tunnel est terminé pour de bon.
  const finishOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('session perdue');
      const { error } = await supabase.from('profiles')
        .update({ onboarding_done: true })
        .eq('id', user.id);
      if (error) throw error;
      localStorage.removeItem(LOCAL_KEY);
      setPhase('pret');
    } catch (err) {
      console.error('[Onboarding] finishOnboarding error:', err);
      setSaveErr('Ton assistant est créé, mais la finalisation a échoué. Réessaie.');
    }
  };

  // ── 1. Welcome ─────────────────────────────────────────────────────────────────

  if (phase === 'welcome') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: 300 }}>
        <img src="/uploads/agents/carelle.jpg" alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,23,20,0) 30%, rgba(26,23,20,0.85) 100%)' }} />
        <div className="absolute bottom-0 left-0 px-5 pb-5">
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-[.14em] mb-1">Attractor Assists</p>
          <h1 className="font-display font-extrabold text-[30px] text-white leading-[1.15]">Ton bras droit IA.</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-2.5">
          {[
            { icon: 'chat',  text: 'Parle-lui comme à un collaborateur. Il gère tes commandes, relances et messages.' },
            { icon: 'send',  text: 'Tes clients commandent sur ton lien boutique. Tu reçois les alertes — sans effort manuel.' },
            { icon: 'spark', text: 'Plus tu l\'utilises, plus il comprend ton activité et anticipe ce dont tu as besoin.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-g200 shadow-soft">
              <div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-orange" />
              </div>
              <p className="text-[13.5px] text-charbon leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
        <PrimaryBtn onClick={() => setPhase('bapteme')}>Commencer</PrimaryBtn>
        <button
          onClick={() => setShowPitch(true)}
          className="w-full min-h-[44px] text-[13.5px] font-semibold text-g500 active:text-charbon transition"
        >
          Ce que je fais pour toi, en 30 secondes
        </button>
      </div>
      {showPitch && (
        <PitchModal
          onClose={() => setShowPitch(false)}
          onStart={() => { setShowPitch(false); setPhase('bapteme'); }}
        />
      )}
    </div>
  );

  // ── 2. Install ─────────────────────────────────────────────────────────────────
  // Déplacée APRÈS « Ta boutique est en ligne ». Demander d'installer une app
  // avant d'avoir livré la moindre valeur était un point de fuite : maintenant
  // l'entrepreneur a son lien en main, et le guide connaît son prénom et le nom
  // qu'il a donné à son assistant.

  if (phase === 'install') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <InstallGuide
            platform={detectPlatform()}
            prenom={prenom}
            nomAssistant={assistName}
            installPromptRef={installPromptRef}
            onDone={onDone}
          />
        </div>
        <div className="px-5 pb-10 flex-shrink-0">
          <button onClick={onDone} className="w-full min-h-[44px] py-3 text-[13px] font-semibold text-g500">
            Plus tard, entrer dans mon Assists
          </button>
        </div>
      </div>
    );
  }

  // ── 3. Baptême ─────────────────────────────────────────────────────────────────

  // La question d'ouverture n'était affichée que tant que le fil était vide :
  // à la première réponse, elle disparaissait de la conversation.
  const BAPTEME_OPENER = `C'est quoi ton prénom ?`;

  const handleBaptemeSubmit = () => {
    if (!inputVal.trim()) return;
    const val = inputVal.trim();
    if (baptemeQ === 0) {
      setPrenom(val);
      setChatHistory(h => [
        ...(h.length ? h : [{ role: 'assist', text: BAPTEME_OPENER }]),
        { role: 'user', text: val },
        { role: 'assist', text: `${val}, c'est noté. Et toi, tu veux m'appeler comment ? Donne-moi un nom — c'est toi le patron.` },
      ]);
      setInputVal('');
      setBaptemeQ(1);
      scrollChat();
    } else if (baptemeQ === 1) {
      setNomAss(val);
      setChatHistory(h => [...h,
        { role: 'user', text: val },
        // Ne demande plus l'activité ici : le champ de saisie disparaît juste
        // après, l'entrepreneur restait devant une question sans pouvoir répondre.
        { role: 'assist', text: `${val}. On va bien s'entendre. Deux ou trois questions et je saurai comment t'aider.` },
      ]);
      setInputVal('');
      setBaptemeQ(2);
      scrollChat();
    }
  };

  if (phase === 'bapteme') {
    const initHistory = chatHistory.length === 0
      ? [{ role: 'assist', text: BAPTEME_OPENER }]
      : chatHistory;

    return (
      <div className="h-full flex flex-col" style={{ background: '#EAE4D9' }}>
        <div className="px-4 pt-safe pb-3 bg-white border-b border-g200">
          <ProgressBar phase={phase} />
          <div className="flex items-center gap-3 mt-3">
            <img src="/uploads/agents/carelle.jpg" alt="Assists" className="w-9 h-9 rounded-full object-cover border border-g200 flex-shrink-0" />
            <div>
              <div className="font-display font-bold text-[15px] text-charbon">Assists</div>
              <div className="text-[11.5px] text-vert font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-vert inline-block" /> En ligne
              </div>
            </div>
          </div>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {initHistory.map((m, i) => (
            m.role === 'assist'
              ? <AssistBubble key={i} text={m.text} />
              : <UserBubble key={i} text={m.text} />
          ))}
          {baptemeQ === 2 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setPhase('profil_type')}
                className="px-6 py-3 rounded-2xl bg-orange text-white font-bold text-[14px] shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:opacity-80 transition"
              >
                Continuer
              </button>
            </div>
          )}
        </div>
        {baptemeQ < 2 && (
          <div className="px-4 pb-8 pt-3 bg-white border-t border-g200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBaptemeSubmit()}
              placeholder="Tape ta réponse…"
              className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[16px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={handleBaptemeSubmit}
              disabled={!inputVal.trim()}
              className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:opacity-80 transition"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 4. Profil type ─────────────────────────────────────────────────────────────

  if (phase === 'profil_type') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="pt-safe pb-3 bg-white border-b border-g200 flex-shrink-0">
        <ProgressBar phase={phase} />
        <div className="px-4 mt-1"><BackBtn onClick={goBack} /></div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-6 flex flex-col" style={{ scrollbarWidth: 'none' }}>
      <div className="mb-8">
        <p className="text-[11.5px] font-bold text-orange uppercase tracking-[.12em] mb-2">Une question rapide</p>
        <h2 className="font-display font-extrabold text-[22px] text-charbon leading-[1.25]">Tu es dans quelle situation ?</h2>
        <p className="text-[13px] text-g500 mt-1.5">Ça m'aide à adapter mes conseils à ta réalité.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { key: 'entrepreneur', label: 'J\'ai une activité qui tourne',    sub: 'Ventes actives, clients en cours' },
          { key: 'mix',          label: 'Salarié avec un projet à côté',     sub: 'Je construis quelque chose en parallèle' },
          { key: 'etudiant',     label: 'Je développe mon projet',           sub: 'En démarrage ou phase de test' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setProfilType(opt.key)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition ${
              profilType === opt.key ? 'border-orange bg-orange/5 shadow-[0_0_0_3px_rgba(242,92,5,.12)]' : 'border-g200 bg-white'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${profilType === opt.key ? 'border-orange' : 'border-g300'}`}>
              {profilType === opt.key && <div className="w-2.5 h-2.5 rounded-full bg-orange" />}
            </div>
            <div>
              <div className="font-display font-bold text-[14.5px] text-charbon">{opt.label}</div>
              <div className="text-[12px] text-g500 mt-0.5">{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-auto pt-8 pb-10">
        {/* Ne réinitialise plus l'anamnèse : revenir ici puis repartir effaçait
            les réponses déjà données. */}
        <PrimaryBtn onClick={() => setPhase('anamnese')} disabled={!profilType}>
          Continuer
        </PrimaryBtn>
      </div>
      </div>
    </div>
  );

  // ── 5. Anamnèse ────────────────────────────────────────────────────────────────

  const handleAnamnSubmit = () => {
    if (!inputVal.trim()) return;
    const val  = inputVal.trim();
    const key  = ANAMN_KEYS[anamnQ];
    const newData = { ...anamnData, [key]: val };
    setAnamnData(newData);
    const nextQ = anamnQ + 1;
    const suite = nextQ < ANAMN_QUESTIONS.length
      ? ANAMN_QUESTIONS[nextQ]
      : `Bien reçu. Maintenant montre-moi ce que tu vends — je vais configurer ta boutique.`;
    setAnamnHistory(h => [
      ...(h.length ? h : [{ role: 'assist', text: ANAMN_QUESTIONS[0] }]),
      { role: 'user', text: val },
      { role: 'assist', text: suite },
    ]);
    setAnamnQ(nextQ);
    setInputVal('');
    scrollChat();
  };

  if (phase === 'anamnese') {
    const initHistory = anamnHistory.length === 0
      ? [{ role: 'assist', text: ANAMN_QUESTIONS[0] }]
      : anamnHistory;
    const done = anamnQ >= ANAMN_QUESTIONS.length;

    return (
      <div className="h-full flex flex-col" style={{ background: '#EAE4D9' }}>
        <div className="px-4 pt-safe pb-3 bg-white border-b border-g200">
          <ProgressBar phase={phase} />
          <div className="flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/uploads/agents/carelle.jpg" alt="" className="w-8 h-8 rounded-full object-cover border border-g200 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-display font-bold text-[14px] text-charbon truncate">{assistName}</div>
                <div className="text-[11px] text-g400">Question {Math.min(anamnQ + 1, ANAMN_QUESTIONS.length)}/{ANAMN_QUESTIONS.length}</div>
              </div>
            </div>
            <BackBtn onClick={goBack} />
          </div>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {initHistory.map((m, i) => (
            m.role === 'assist' ? <AssistBubble key={i} text={m.text} /> : <UserBubble key={i} text={m.text} />
          ))}
          {done && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setPhase('template')}
                className="px-6 py-3 rounded-2xl bg-orange text-white font-bold text-[14px] shadow-[0_6px_16px_-4px_rgba(242,92,5,.55)] active:opacity-80 transition"
              >
                Créer ma boutique
              </button>
            </div>
          )}
        </div>
        {!done && (
          <div className="px-4 pb-8 pt-3 bg-white border-t border-g200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnamnSubmit()}
              placeholder="Réponds librement…"
              className="flex-1 px-4 py-3 rounded-xl bg-sable border border-g200 text-[16px] text-charbon outline-none focus:border-orange"
              autoFocus
            />
            <button
              onClick={handleAnamnSubmit}
              disabled={!inputVal.trim()}
              className="w-11 h-11 rounded-xl bg-orange text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:opacity-80 transition"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 6. Choix du template ──────────────────────────────────────────────────────

  if (phase === 'template') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="px-4 pt-safe pb-3 border-b border-g200 bg-white flex-shrink-0">
        <ProgressBar phase={phase} />
        <div className="mt-1"><BackBtn onClick={goBack} /></div>
        <h2 className="font-display font-bold text-[19px] text-charbon mt-1">Ton style de boutique</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">Choisis le modèle qui ressemble à ton activité.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {/* La palette est SŒUR de la carte, pas dedans : un bouton imbriqué dans un
            bouton est invalide en HTML et les pastilles ne réagissaient pas de façon
            fiable selon le navigateur. */}
        {TEMPLATES.map(t => {
          const selected = templateId === t.id;
          return (
            <div
              key={t.id}
              className={`w-full rounded-2xl border-2 overflow-hidden transition ${
                selected ? 'border-orange shadow-[0_0_0_3px_rgba(242,92,5,.15)] bg-white' : 'border-g200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => { setTemplateId(t.id); setBrandColor(t.id === '1c' ? '#C9A84C' : '#FF6B35'); }}
                className="w-full text-left"
              >
                <TemplatePreview id={t.id} color={selected ? brandColor : (t.id === '1c' ? '#C9A84C' : '#FF6B35')} />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-display font-bold text-[14.5px] text-charbon">{t.name}</span>
                    {selected && (
                      <span className="text-[11px] font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full flex-shrink-0">Sélectionné</span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-g500">{t.desc}</p>
                </div>
              </button>
              {selected && (
                <div className="px-4 pb-3">
                  <p className="text-[11px] font-bold text-g400 uppercase tracking-[.08em] mb-2">Ta couleur</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setBrandColor(c.hex)}
                        title={c.label}
                        aria-label={c.label}
                        aria-pressed={brandColor === c.hex}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition active:scale-90"
                      >
                        <span
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: c.hex,
                            border: brandColor === c.hex ? '3px solid #1a1714' : '2px solid transparent',
                            outline: brandColor === c.hex ? '2px solid #fff' : 'none',
                            outlineOffset: brandColor === c.hex ? '-4px' : '0',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                            display: 'block',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-10 pt-3">
        <PrimaryBtn
          onClick={() => {
            // Proposition de départ seulement : repasser par ici ne doit ni
            // écraser un identifiant déjà choisi ni vider les produits saisis.
            setSlug(s => s || slugify(prenom));
            setIsSlugAvailable(null);
            setPhase('slug');
          }}
          disabled={!templateId}
        >
          Continuer
        </PrimaryBtn>
      </div>
    </div>
  );

  // ── 7. Choix du slug boutique ──────────────────────────────────────────────────

  if (phase === 'slug') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="px-4 pt-safe pb-3 border-b border-g200 bg-white">
        <ProgressBar phase={phase} />
        <div className="mt-1"><BackBtn onClick={goBack} /></div>
        <h2 className="font-display font-bold text-[19px] text-charbon mt-1">Ton lien boutique</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">C'est ce lien que tu partages à tes clients.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Preview du lien */}
        <div className="bg-charbon rounded-2xl px-4 py-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Aperçu de ton lien</p>
          <p className="text-white font-mono text-[13px] break-all leading-relaxed">
            assists.agenceattractor.com/<span className="text-orange font-bold">{slug || '...'}</span>
          </p>
        </div>

        {/* Input slug */}
        <div>
          <label className="text-[11.5px] font-bold text-charbon uppercase tracking-[.1em] mb-2 block">
            Choisis ton identifiant
          </label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={e => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+/, '').slice(0, 20);
                setSlug(val);
                setIsSlugAvailable(null);
                setSlugError('');
              }}
              placeholder="ex: macarthur"
              className="w-full px-4 py-3.5 rounded-xl border-2 bg-white text-[16px] font-mono text-charbon outline-none transition pr-10 focus:border-orange border-g200"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {slugChecking && (
                <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
              )}
              {!slugChecking && isSlugAvailable === true && (
                <span className="text-vert font-bold text-[16px]">✓</span>
              )}
              {!slugChecking && isSlugAvailable === false && (
                <span className="text-red-500 font-bold text-[16px]">✗</span>
              )}
            </div>
          </div>

          {isSlugAvailable === true && (
            <p className="text-[12px] text-vert font-semibold mt-1.5">Disponible.</p>
          )}
          {isSlugAvailable === false && slugError && (
            <p className="text-[12px] text-red-500 mt-1.5">
              {slugError}{' '}
              {slug.length >= 3 && (
                <>Essaie <button className="font-bold underline" onClick={() => setSlug(slug + '2')}>{slug}2</button> ou <button className="font-bold underline" onClick={() => setSlug(slug + 'ci')}>{slug}ci</button>.</>
              )}
            </p>
          )}
          <p className="text-[11px] text-g400 mt-2">
            Minuscules, chiffres et tirets uniquement. 3 à 20 caractères.
          </p>
        </div>
      </div>

      <div className="px-5 pb-10 pt-3">
        <PrimaryBtn
          onClick={() => setPhase('whatsapp')}
          disabled={!isSlugAvailable || slugChecking || slug.length < 3}
        >
          Continuer
        </PrimaryBtn>
      </div>
    </div>
  );

  // ── 8. Numéro WhatsApp — la destination des commandes ──────────────────────────
  // Sans lui, le bouton « Commander » de la boutique n'a nulle part où aller.

  const waDigits = normalizeWa(whatsapp);
  const waValide = waDigits.length >= 8 && waDigits.length <= 15;

  if (phase === 'whatsapp') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="px-4 pt-safe pb-3 border-b border-g200 bg-white">
        <ProgressBar phase={phase} />
        <div className="mt-1"><BackBtn onClick={goBack} /></div>
        <h2 className="font-display font-bold text-[19px] text-charbon mt-1">Ton WhatsApp</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">C'est là que tes commandes arrivent.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <div>
          <label className="text-[11.5px] font-bold text-charbon uppercase tracking-[.1em] mb-2 block">
            Numéro avec l'indicatif du pays
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="Ex : +225 07 58 68 02 79"
            className="w-full px-4 py-3.5 rounded-xl border-2 bg-white text-[16px] text-charbon outline-none transition focus:border-orange border-g200"
            autoFocus
          />
          {whatsapp.trim().length > 0 && !waValide && (
            <p className="text-[12px] text-red-500 mt-1.5">
              Numéro incomplet. N'oublie pas l'indicatif : +225 pour la Côte d'Ivoire, +33 pour la France.
            </p>
          )}
          <p className="text-[11px] text-g400 mt-2 leading-snug">
            Quand un client valide sa commande, elle t'arrive sur ce numéro. Vérifie-le bien, c'est ton lien avec tes clients.
          </p>
        </div>
      </div>

      <div className="px-5 pb-10 pt-3">
        <PrimaryBtn onClick={() => setPhase('upload')} disabled={!waValide}>
          Continuer
        </PrimaryBtn>
      </div>
    </div>
  );

  // ── 7. Upload catalogue ────────────────────────────────────────────────────────

  const addProduit = () => {
    if (!newProd.nom.trim()) return;
    setProduits(p => [...p, { ...newProd, actif: true, id: Date.now() }]);
    setNewProd({ nom: '', prix: '' });
  };

  if (phase === 'upload') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="px-4 pt-safe pb-3 border-b border-g200 bg-white">
        <ProgressBar phase={phase} />
        <div className="mt-1"><BackBtn onClick={goBack} /></div>
        <h2 className="font-display font-bold text-[19px] text-charbon mt-1">Tes produits</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">Ajoute ce que tu vends. Tu pourras compléter après.</p>
      </div>

      {/* Input photo caché, partagé entre tous les produits */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handlePhotoUpload(e.target.files?.[0])}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {produits.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-g200 px-3 py-3">
            {/* Vignette photo */}
            <button
              onClick={() => { setPhotoTarget(i); photoRef.current?.click(); }}
              disabled={photoUploading && photoTarget === i}
              className="w-12 h-12 rounded-xl bg-g100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-g200 active:bg-g200 transition"
            >
              {photoUploading && photoTarget === i
                ? <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                : p.photo_url
                  ? <img src={p.photo_url} alt={p.nom} className="w-full h-full object-cover" />
                  : <Icon name="camera" size={16} className="text-g400" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] text-charbon truncate">{p.nom}</div>
              {p.prix && <div className="text-[12.5px] text-orange font-semibold">{parseInt(p.prix).toLocaleString('fr-FR')} F</div>}
              {!p.photo_url
                ? <div className="text-[11px] text-g400 mt-0.5">Tap la vignette pour ajouter une photo</div>
                : <button
                    onClick={() => handleCleanPhoto(i)}
                    disabled={cleaningIndex === i}
                    className="text-[11px] font-bold text-orange mt-0.5 active:opacity-70 transition disabled:opacity-50"
                  >
                    {cleaningIndex === i ? (cleanStatus || 'Traitement…') : '✦ Nettoyer le fond'}
                  </button>
              }
            </div>
            <button
              onClick={() => setProduits(ps => ps.map((item, j) => j === i ? { ...item, actif: !item.actif } : item))}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition ${p.actif ? 'bg-vert/10 text-vert' : 'bg-g100 text-g400'}`}
            >
              {p.actif ? 'Actif' : 'Off'}
            </button>
            <button
              onClick={() => setProduits(ps => ps.filter((_, j) => j !== i))}
              className="w-8 h-8 rounded-lg bg-g100 flex items-center justify-center text-g400 active:bg-g200 text-[18px]"
            >
              ×
            </button>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-g200 p-4 flex flex-col gap-2.5">
          <input
            type="text"
            value={newProd.nom}
            onChange={e => setNewProd(p => ({ ...p, nom: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addProduit()}
            placeholder="Nom du produit (ex : Attiéké poisson)"
            className="w-full px-4 py-3 rounded-xl bg-sable border border-g200 text-[16px] text-charbon outline-none focus:border-orange"
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newProd.prix}
            onChange={e => setNewProd(p => ({ ...p, prix: e.target.value.replace(/\D/g, '') }))}
            onKeyDown={e => e.key === 'Enter' && addProduit()}
            placeholder="Prix en FCFA (ex : 2000)"
            className="w-full px-4 py-3 rounded-xl bg-sable border border-g200 text-[16px] text-charbon outline-none focus:border-orange"
          />
          <button
            onClick={addProduit}
            disabled={!newProd.nom.trim()}
            className="w-full min-h-[44px] py-2.5 rounded-xl border-2 border-dashed border-g200 text-[13px] font-bold text-g500 disabled:opacity-40 active:bg-g100 transition"
          >
            + Ajouter
          </button>
        </div>
      </div>
      <div className="px-4 pb-10 pt-3 flex flex-col gap-2">
        <PrimaryBtn onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Continuer'}
        </PrimaryBtn>
        {produits.length === 0 && !saving && (
          <button onClick={handleSave} className="text-center text-[13px] text-g400 font-semibold py-2">
            Passer — j'ajouterai mes produits après
          </button>
        )}
        {saveErr && <p className="text-center text-[12.5px] text-red-500 mt-1">{saveErr}</p>}
      </div>
    </div>
  );

  // ── 9. Création de l'assistant ─────────────────────────────────────────────────
  // L'étape qui donne sa valeur au produit. Elle existait, mais aucun bouton n'y menait :
  // l'assistant était généré à partir du seul prénom + activité, puis marqué « prêt ».

  if (phase === 'assistant') return (
    <div className="h-full flex flex-col bg-sable">
      <div className="px-4 pt-safe pb-3 border-b border-g200 bg-white">
        <ProgressBar phase={phase} />
        <h2 className="font-display font-bold text-[19px] text-charbon mt-3">Apprends-lui ton métier</h2>
        <p className="text-[12.5px] text-g500 mt-0.5">Dernière étape : 7 questions. C'est ce qui fait qu'il répondra comme toi.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10" style={{ scrollbarWidth: 'none' }}>
        <Anamnese
          profile={{ prenom }}
          onGenerated={finishOnboarding}
        />
        {saveErr && <p className="text-center text-[12.5px] text-red-500 mt-3">{saveErr}</p>}
      </div>
    </div>
  );

  // ── 10. Prêt ───────────────────────────────────────────────────────────────────

  const lien = boutiqueUrl(slug);

  if (phase === 'pret') return (
    <div className="h-full flex flex-col bg-sable px-5 pt-safe pb-10">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center gap-5 text-center" style={{ scrollbarWidth: 'none' }}>
        <img
          src="/uploads/agents/carelle.jpg"
          alt=""
          className="w-20 h-20 rounded-3xl object-cover object-top shadow-[0_12px_32px_-8px_rgba(26,23,20,.35)]"
        />
        <div>
          <h1 className="font-display font-extrabold text-[28px] text-charbon leading-[1.2] mb-3">
            Ta boutique est en ligne.
          </h1>
          <p className="text-[14.5px] text-g500 leading-relaxed max-w-[280px] mx-auto">
            {prenom ? `${prenom}, ` : ''}{assistName} connaît tes produits et répond à tes clients. Partage ton lien.
          </p>
        </div>

        {/* Lien boutique mis en avant */}
        {lien && (
          <div className="w-full bg-white rounded-2xl border border-g200 shadow-soft p-4 text-left">
            <p className="text-[11px] font-bold text-g400 uppercase tracking-wider mb-2">Ton lien boutique</p>
            <p className="font-mono text-[12px] text-charbon break-all mb-3">
              assists.agenceattractor.com/<span className="text-orange font-bold">{slug}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(lien)}
                className="flex-1 py-2.5 rounded-xl bg-orange/10 text-orange font-bold text-[13px] active:bg-orange/20 transition"
              >
                Copier le lien
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Commande directement sur ma boutique : ${lien}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-vert/10 text-vert font-bold text-[13px] flex items-center justify-center gap-1.5 active:bg-vert/20 transition"
              >
                Partager WA
              </a>
            </div>
          </div>
        )}
      </div>
      {/* Le guide d'installation vient ici, une fois la boutique livrée. */}
      <PrimaryBtn onClick={() => {
        const p = detectPlatform();
        if (p === 'installed' || p === 'desktop') onDone();
        else setPhase('install');
      }}>
        Entrer dans mon Assists
      </PrimaryBtn>
    </div>
  );

  return null;
}
