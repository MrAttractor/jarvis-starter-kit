import { useState, useRef } from "react";
import { supabase } from "./lib/supabase";
import { C, Ic } from "./theme";

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 10,
  background: C.card,
  border: `1.5px solid ${C.card2}`,
  color: C.white,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = (disabled) => ({
  width: "100%",
  background: disabled ? C.card2 : C.gold,
  color: disabled ? C.muted : C.dark,
  border: "none",
  borderRadius: 10,
  padding: 14,
  fontWeight: 800,
  fontSize: 14,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

export default function LoginScreen({ onAuthed }) {
  const [step, setStep] = useState("email"); // email | otp | claiming | refused
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const submitEmail = async () => {
    if (!/.+@.+\..+/.test(email)) { setErr("Entre un email valide."); return; }
    setErr(""); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) { setErr(`Envoi impossible : ${error.message}`); return; }
    setStep("otp");
    setTimeout(() => refs[0].current?.focus(), 150);
  };

  const onCode = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) refs[i + 1].current.focus();
  };

  const verify = async () => {
    if (code.join("").length < 6) { setErr("Saisis les 6 chiffres reçus."); return; }
    setErr(""); setStep("claiming");
    const { error } = await supabase.auth.verifyOtp({ email, token: code.join(""), type: "email" });
    if (error) {
      setStep("otp"); setCode(["", "", "", "", "", ""]);
      setErr("Code invalide ou expiré. Demande un nouveau code.");
      return;
    }
    const { data, error: claimErr } = await supabase.rpc("lsx_claim_invite");
    const membre = Array.isArray(data) ? data[0] : null;
    if (claimErr || !membre) {
      setStep("refused");
      return;
    }
    onAuthed(membre);
  };

  const resend = async () => {
    setErr(""); setBusy(true);
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    setBusy(false); setCode(["", "", "", "", "", ""]);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, maxWidth: 390, margin: "0 auto" }}>
      <div style={{ width: 3, height: 40, background: C.gold, borderRadius: 2, marginBottom: 16 }} />
      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>LS XPERTISE</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.white, textAlign: "center", marginBottom: 30 }}>Espace agence</div>

      {step === "email" && (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: C.light, marginBottom: 10, textAlign: "center" }}>Connecte-toi avec ton email pro. Un code à 6 chiffres t'est envoyé.</div>
          <input style={{ ...inputStyle, marginBottom: 10 }} type="email" placeholder="toi@ls-expertise.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && submitEmail()} autoFocus />
          {err && <div style={{ fontSize: 12, color: C.danger, marginBottom: 10 }}>{err}</div>}
          <button style={buttonStyle(busy)} disabled={busy} onClick={submitEmail}>
            {busy ? "Envoi…" : <><Ic name="bell" size={15} color={C.dark} /> Recevoir mon code</>}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: C.light, marginBottom: 14, textAlign: "center" }}>Code envoyé à <b style={{ color: C.white }}>{email}</b></div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            {code.map((v, i) => (
              <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={v}
                onChange={(e) => onCode(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !code[i] && i > 0) refs[i - 1].current.focus();
                  if (e.key === "Enter" && code.join("").length === 6) verify();
                }}
                style={{ width: 42, height: 52, borderRadius: 10, border: `1.5px solid ${C.card2}`, background: C.card, textAlign: "center", fontSize: 20, fontWeight: 800, color: C.white, outline: "none" }} />
            ))}
          </div>
          {err && <div style={{ fontSize: 12, color: C.danger, marginBottom: 10, textAlign: "center" }}>{err}</div>}
          <button style={{ ...buttonStyle(code.join("").length < 6), marginBottom: 10 }} disabled={code.join("").length < 6} onClick={verify}>
            <Ic name="check" size={15} color={code.join("").length < 6 ? C.muted : C.dark} /> Entrer
          </button>
          <button onClick={resend} disabled={busy} style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 8 }}>
            {busy ? "Envoi…" : "Renvoyer le code"}
          </button>
        </div>
      )}

      {step === "claiming" && (
        <div style={{ fontSize: 13, color: C.light }}>Connexion en cours…</div>
      )}

      {step === "refused" && (
        <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
          <Ic name="warning" size={28} color={C.warn} />
          <div style={{ fontSize: 14, color: C.white, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>Pas encore d'accès</div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>Cet email n'est pas encore invité sur l'espace LS EXPERTISE. Contacte Mac Arthur pour être ajouté à l'équipe.</div>
        </div>
      )}
    </div>
  );
}
