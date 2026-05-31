import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon, Logo, Btn, Field, Input, Spinner, Pill } from '../components/ui';

export function LoginScreen({ onAuthed }) {
  const [step, setStep] = useState("intro"); // intro | email | otp | loading
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [isSending, setIsSending] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const submitEmail = async () => {
    if (!/.+@.+\..+/.test(email)) { setErr("Entre un email valide pour recevoir ton code."); return; }
    setErr(""); setIsSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setIsSending(false);
    if (error) { setErr("Impossible d'envoyer le code. Réessaie dans quelques secondes."); return; }
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
    onAuthed();
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
      {/* hero image */}
      <div className="absolute inset-0">
        <img src="/uploads/photo-hero.jpg" alt="" className="w-full h-full object-cover object-top" />
      </div>
      {/* warm gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,7,.30) 0%, rgba(20,12,7,.10) 30%, rgba(217,71,3,.55) 72%, rgba(160,46,0,.95) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(255,122,46,.25), transparent 60%)" }} />

      <div className="relative z-10 flex flex-col min-h-screen px-7 pt-12 pb-9">
        <Logo light size="md" />

        {step === "intro" && (
          <div className="mt-auto animate-[fadeUp_.4s_ease]">
            <Pill tone="white" icon="bolt" className="backdrop-blur-sm">Gratuit · sans carte</Pill>
            <h1 className="font-display font-extrabold text-[36px] leading-[1.06] tracking-tight mt-4">
              Moins dans la tête,<br />plus dans l'<span className="text-amber">action</span>.
            </h1>
            <p className="text-[15.5px] text-white/85 mt-4 max-w-[330px] leading-relaxed">
              Argumentaires, posts, offres, messages — prêts à copier. On avance avec toi, comme nous.
            </p>
            <div className="mt-7 space-y-3">
              <Btn className="w-full" iconRight="arrow" onClick={() => setStep("email")}>Démarrer gratuitement</Btn>
              <button onClick={() => setStep("email")} className="w-full text-center text-[14px] font-semibold text-white/85 py-2 hover:text-white">
                J'ai déjà un compte
              </button>
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => { setStep("intro"); setErr(""); }} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">On y va. C'est quoi ton email ?</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Je t'envoie un code à 6 chiffres, pas de mot de passe à retenir.</p>
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
                  : "Recevoir mon code"}
              </Btn>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-auto animate-[fadeUp_.3s_ease]">
            <button onClick={() => { setStep("email"); setErr(""); setCode(["","","","","",""]); }} className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white">
              <Icon name="back" size={18} /> Retour
            </button>
            <h2 className="font-display font-extrabold text-[28px] leading-tight">Entre ton code</h2>
            <p className="text-[14px] text-white/80 mt-2 mb-5">Envoyé à <b className="text-white">{email}</b></p>
            <div className="bg-white rounded-[20px] p-5 text-charbon shadow-xl">
              <div className="flex gap-2 justify-between">
                {code.map((c, i) => (
                  <input key={i} ref={refs[i]} value={c} inputMode="numeric" maxLength={1}
                    onChange={(e) => onCode(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !c && i > 0) refs[i - 1].current.focus();
                      if (e.key === "Enter") verify();
                    }}
                    className="w-full aspect-square text-center font-display font-extrabold text-[20px] bg-sable border-[1.5px] border-g200 rounded-xl outline-none focus:border-orange focus:ring-4 focus:ring-orange/12" />
                ))}
              </div>
              {err && <p className="text-[12.5px] text-[#D64545] font-semibold mt-3 flex items-center gap-1.5"><Icon name="warn" size={14} />{err}</p>}
              <Btn className="w-full mt-4" iconRight="arrow" onClick={verify}>Entrer dans l'app</Btn>
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
    </div>
  );
}
