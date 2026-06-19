import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Logo, Btn, Field, Input, Spinner, Pill } from '../components/ui';

const MARYLINE_FAQS = [
  {
    q: "C'est quoi Attractor Assists ?",
    a: "C'est ton bras droit intelligent. Tu lui parles de ton business, il t'aide à t'organiser, à vendre, et à créer une boutique en ligne que tes clients peuvent utiliser directement. Conçu par Mac Arthur, entrepreneur depuis 23 ans.",
  },
  {
    q: "C'est gratuit ?",
    a: "Oui, le plan de base est 100% gratuit, sans carte bancaire. Tu crées ta boutique, tu gères tes commandes, et tu discutes avec ton assistant sans payer un centime. Le plan avancé (Bras Droit) débloque plus de fonctionnalités pour ceux qui veulent aller plus loin.",
  },
  {
    q: "Pour qui c'est fait ?",
    a: "Pour les entrepreneurs qui vendent déjà ou qui démarrent, en Côte d'Ivoire, en France, ou ailleurs. Restaurateurs, commerçants, prestataires de service, artisans. Si tu as des clients et des produits, Assists est fait pour toi.",
  },
  {
    q: "Comment ça marche ?",
    a: "En 3 étapes. D'abord tu crées ton compte gratuitement. Ensuite tu réponds à quelques questions sur ton activité. Enfin ton assistant et ta boutique sont générés automatiquement, avec un lien que tu partages sur WhatsApp. Tes clients commandent directement, tu reçois une alerte.",
  },
];

function MarylineChat({ onClose, onStart }) {
  const [messages, setMessages] = useState([
    { from: 'maryline', text: "Bonjour ! Je suis Maryline. Si tu as des questions sur Attractor Assists avant de te lancer, je suis là." }
  ]);
  const [picked, setPicked] = useState(new Set());
  const bottomRef = useRef(null);

  const pickFaq = (faq, idx) => {
    if (picked.has(idx)) return;
    setPicked(prev => new Set([...prev, idx]));
    const next = [
      ...messages,
      { from: 'user', text: faq.q },
      { from: 'maryline', text: faq.a },
    ];
    setMessages(next);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const remaining = MARYLINE_FAQS.filter((_, i) => !picked.has(i));

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.55)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[28px] overflow-hidden flex flex-col"
        style={{ maxHeight: '88vh', background: '#EAE4D9' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[#DDD6CE]">
          <div className="w-9 h-9 rounded-full bg-orange flex items-center justify-center flex-shrink-0">
            <span className="text-white font-display font-bold text-[15px]">M</span>
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-[14px] text-charbon leading-none">Maryline</div>
            <div className="text-[11px] text-[#25D366] font-semibold mt-0.5">En ligne</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-g100 flex items-center justify-center text-g500 active:bg-g200">
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5" style={{ minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 text-[14px] leading-snug shadow-sm ${
                  m.from === 'user'
                    ? 'bg-[#F25C05] text-white rounded-[18px_18px_4px_18px]'
                    : 'bg-white text-charbon rounded-[18px_18px_18px_4px]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="bg-white border-t border-[#DDD6CE] px-3 pt-3 pb-5">
          {remaining.length > 0 ? (
            <>
              <p className="text-[11px] font-bold text-g400 uppercase tracking-[.06em] mb-2">Tes questions</p>
              <div className="flex flex-col gap-2">
                {remaining.map((faq, i) => {
                  const origIdx = MARYLINE_FAQS.indexOf(faq);
                  return (
                    <button
                      key={origIdx}
                      onClick={() => pickFaq(faq, origIdx)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-g200 text-[13.5px] font-semibold text-charbon bg-sable active:bg-g100 transition"
                    >
                      {faq.q}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-g500 text-center mb-2">Tu as toutes les clés. Prêt à démarrer ?</p>
          )}
          <button
            onClick={onStart}
            className="w-full mt-3 py-3.5 rounded-2xl bg-orange text-white font-display font-bold text-[15px] shadow-[0_8px_20px_-6px_rgba(242,92,5,.5)]"
          >
            Démarrer gratuitement →
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen({ onAuthed }) {
  const [step, setStep] = useState("intro"); // intro | email | otp | loading
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [marylineOpen, setMarylineOpen] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Capture le code de référencement dans l'URL (?ref=XXXXXXXX)
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('aa_ref', ref.toUpperCase());
  });

  const submitEmail = async () => {
    if (!/.+@.+\..+/.test(email)) { setErr("Entre un email valide pour recevoir ton code."); return; }
    setErr(""); setIsSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setIsSending(false);
    if (error) {
      console.error("[OTP] signInWithOtp error:", error.status, error.message, error);
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("429") || error.status === 429) {
        setErr("Trop de demandes de code en peu de temps. Attends 60 secondes et réessaie.");
      } else if (msg.includes("unable to validate") || msg.includes("email") && msg.includes("not")) {
        setErr("Adresse email non acceptée. Vérifie l'orthographe et réessaie.");
      } else if (msg.includes("network") || msg.includes("fetch") || !navigator.onLine) {
        setErr("Pas de connexion internet. Vérifie ton réseau et réessaie.");
      } else {
        setErr(`Envoi du code impossible (${error.message ?? error.status ?? "erreur inconnue"}). Réessaie dans quelques secondes.`);
      }
      return;
    }
    setStep("otp");
    setTimeout(() => refs[0].current && refs[0].current.focus(), 200);
  };

  const onCode = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) refs[i + 1].current.focus();
  };

  const verify = async () => {
    if (code.join("").length < 6) { setErr("Saisis les 6 chiffres reçus."); return; }
    setErr(""); setStep("loading");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.join(""),
      type: "email",
    });
    if (error) {
      setStep("otp");
      setCode(["", "", "", "", "", ""]);
      setErr("Code invalide ou expiré. Demande un nouveau code.");
      setTimeout(() => refs[0].current && refs[0].current.focus(), 100);
      return;
    }
    try {
      await onAuthed();
    } catch {
      setStep("otp");
      setErr("Erreur de connexion. Réessaie.");
    }
  };

  const resend = async () => {
    setErr(""); setIsSending(true);
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    setIsSending(false);
    setCode(["", "", "", "", "", ""]);
    setTimeout(() => refs[0].current && refs[0].current.focus(), 100);
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* hero image — object-contain pour montrer l'image entière */}
      <div className="absolute inset-0" style={{ background: '#C06018' }}>
        <img src="/uploads/photo-hero.jpg" alt="" className="w-full h-full object-contain object-center" />
      </div>
      {/* warm gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,7,.25) 0%, rgba(20,12,7,.05) 30%, rgba(160,46,0,.70) 68%, rgba(120,34,0,.97) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(255,122,46,.15), transparent 55%)" }} />

      <div className="relative z-10 flex flex-col min-h-screen px-7 pt-12 pb-9">
        <Logo light size="md" />

        {/* Bulle Maryline flottante — visible uniquement sur l'intro */}
        {step === "intro" && !marylineOpen && (
          <div className="absolute right-5 top-[36%] flex flex-col items-end gap-2 z-20">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[14px_14px_4px_14px] shadow-md">
              <span className="text-[12px] font-semibold text-charbon">Des questions ?</span>
            </div>
            <button
              onClick={() => setMarylineOpen(true)}
              className="w-14 h-14 rounded-full bg-orange shadow-[0_6px_20px_rgba(0,0,0,.3)] flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="font-display font-bold text-white text-[20px]">M</span>
            </button>
          </div>
        )}

        {step === "intro" && (
          <div className="mt-auto animate-[fadeUp_.4s_ease]">
            <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Gratuit · sans carte</Pill>
            <h1 className="font-display font-extrabold text-[36px] leading-[1.06] tracking-tight mt-4">
              Trouve ton <span className="text-amber">Couloir</span>…<br />et cours dedans !
            </h1>
            <p className="text-[15.5px] text-white/85 mt-4 max-w-[330px] leading-relaxed">
              Nous sommes là pour t'aider.
            </p>
            <div className="mt-7 space-y-3">
              <Btn className="w-full" iconRight="arrow" onClick={() => setStep("email")}>Démarrer gratuitement</Btn>
              <button onClick={() => setStep("email")} className="w-full text-center text-[14px] font-semibold text-white/75 py-2 hover:text-white">
                J'ai déjà un compte
              </button>
              <a href="https://agenceattractor.com" className="flex items-center justify-center gap-1.5 text-[13px] text-white/75 hover:text-white pt-1 transition-colors">
                <Icon name="back" size={14} /> Retour au site
              </a>
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => { setStep("intro"); setErr(""); }} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">On y va. C'est quoi ton email ?</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Je t'envoie un code à 6 chiffres. Saisis-le et tu es dans l'app.</p>
            <div className="bg-white rounded-[20px] p-5 text-charbon shadow-xl">
              <Field label="Ton email">
                <Input type="email" inputMode="email" placeholder="prenom@exemple.ci" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isSending && submitEmail()}
                  autoFocus />
              </Field>
              {err && <p className="text-[12.5px] text-[#D64545] font-semibold mt-2 flex items-center gap-1.5"><Icon name="warn" size={14} />{err}</p>}
              <Btn className={`w-full mt-4 ${isSending ? "opacity-60 pointer-events-none" : ""}`}
                iconRight={isSending ? undefined : "arrow"}
                onClick={submitEmail}>
                {isSending
                  ? <><Spinner className="w-4 h-4 !border-white/30 !border-t-white" /> Envoi en cours…</>
                  : "Recevoir mon lien"}
              </Btn>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => { setStep("email"); setErr(""); }} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">Entre ton code</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Code à 6 chiffres envoyé à <b className="text-white">{email}</b></p>
            <div className="bg-white rounded-[20px] p-5 text-charbon shadow-xl">
              <div className="flex justify-center gap-2 mb-4">
                {code.map((v, i) => (
                  <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={(e) => onCode(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !code[i] && i > 0) refs[i - 1].current.focus();
                      if (e.key === "Enter" && code.join("").length === 6) verify();
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (pasted.length === 6) {
                        const next = pasted.split("");
                        setCode(next);
                        refs[5].current.focus();
                        e.preventDefault();
                      }
                    }}
                    className="w-11 h-14 rounded-xl border-2 border-g200 text-center text-[22px] font-extrabold text-charbon focus:border-orange focus:outline-none transition"
                  />
                ))}
              </div>
              <div className="bg-sable rounded-[14px] p-3 mb-3">
                <p className="text-[12px] text-g700 leading-snug">Tu ne reçois pas le code ? Vérifie tes <b>Spams</b>. L'expéditeur est <b>noreply@agenceattractor.com</b>. Sur WiFi public ou d'entreprise, le code peut mettre 1-2 minutes — il est valable 1 heure.</p>
              </div>
              {err && <p className="text-[12.5px] text-[#D64545] font-semibold mb-3 flex items-center gap-1.5"><Icon name="warn" size={14} />{err}</p>}
              <Btn className={`w-full ${code.join("").length < 6 ? "opacity-50 pointer-events-none" : ""}`} onClick={verify}>
                Entrer dans l'app
              </Btn>
              <button onClick={resend} disabled={isSending}
                className="w-full text-center text-[13px] font-semibold text-g400 mt-3 hover:text-orange disabled:opacity-40 transition">
                {isSending ? "Envoi en cours…" : "Renvoyer le code"}
              </button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="m-auto flex flex-col items-center gap-4 animate-[fadeUp_.2s_ease]">
            <Spinner className="w-12 h-12 !border-white/30 !border-t-white" />
            <p className="font-display font-bold text-[17px]">On prépare ton espace…</p>
          </div>
        )}
      </div>

      {/* Maryline chat sheet */}
      {marylineOpen && (
        <MarylineChat
          onClose={() => setMarylineOpen(false)}
          onStart={() => { setMarylineOpen(false); setStep("email"); }}
        />
      )}
    </div>
  );
}
