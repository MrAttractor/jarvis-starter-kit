// ============================================================
// sign-verify — Vérification du code et apposition de la signature
//
// C'est ici que l'acte se forme. Séquence stricte :
//   1. le code est valide, non expiré, non déjà utilisé
//   2. les documents sont re-téléchargés et leur empreinte
//      recalculée : elle doit être identique au scellement
//   3. la signature est apposée et scellée (preuve_hash)
//   4. le certificat de preuve est généré et envoyé aux 2 parties
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import {
  CORS, SUPABASE_URL, SERVICE_KEY, AGENCE_EMAIL,
  sha256, egalConstant, ipDe, uaDe, esc, horodatage, journal, envoyerEmail, gabaritEmail,
} from "../_shared/signature.ts";

const MAX_TENTATIVES = 5;

// ── Certificat de preuve (PDF A4) ──────────────────────────
async function certificatPdf(o: {
  dossier: { reference?: string; titre: string; client?: string };
  documents: Array<{ nom: string; reference?: string; contenu_hash: string; url: string }>;
  signataire: { nom: string; email: string; qualite?: string; signature_nom: string; trace?: string };
  preuveHash: string;
  signeLe: Date;
  ip: string;
  ua: string;
  evenements: Array<{ type: string; created_at: string }>;
}): Promise<string> {
  const doc = await PDFDocument.create();
  let page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.10, 0.09, 0.08);
  const orange = rgb(0.95, 0.36, 0.02);
  const muted = rgb(0.61, 0.57, 0.53);
  const vert = rgb(0.12, 0.62, 0.32);
  const M = 50;
  let y = 795;

  // pdf-lib encode en WinAnsi : on ramène la typographie fine en ASCII.
  const clean = (t: string) => String(t ?? "")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-").replace(/…/g, "...")
    .replace(/ /g, " ").replace(/[^\t\n\r\x20-\x7E¡-ÿ€]/g, "");

  const saut = (h: number) => { if (y - h < 60) { page = doc.addPage([595, 842]); y = 795; } };
  const ligne = (t: string, f = font, size = 10.5, color = ink, dy = 15) => {
    saut(dy); page.drawText(clean(t), { x: M, y, size, font: f, color }); y -= dy;
  };
  const paire = (k: string, v: string) => {
    saut(15);
    page.drawText(clean(k), { x: M, y, size: 9.5, font, color: muted });
    page.drawText(clean(v), { x: M + 150, y, size: 9.5, font: bold, color: ink });
    y -= 15;
  };
  const titreSection = (t: string) => {
    y -= 10; saut(26);
    page.drawText(clean(t.toUpperCase()), { x: M, y, size: 9, font: bold, color: orange });
    y -= 6;
    page.drawRectangle({ x: M, y, width: 495, height: 0.8, color: rgb(0.90, 0.88, 0.86) });
    y -= 14;
  };
  const enroule = (t: string, largeur = 92, f = font, size = 9.5, color = ink) => {
    const mots = clean(t).split(" ");
    let cur = "";
    for (const w of mots) {
      if ((cur + w).length > largeur) { ligne(cur, f, size, color, 13); cur = w + " "; }
      else cur += w + " ";
    }
    if (cur.trim()) ligne(cur.trim(), f, size, color, 13);
  };

  // En-tête
  page.drawText("Mr", { x: M, y, size: 19, font: bold, color: ink });
  page.drawText("Attractor", { x: M + 30, y, size: 19, font: bold, color: orange });
  y -= 15;
  ligne("Mac Arthur KOUASSI - Micro-entreprise - SIRET 98377125400015", font, 8, muted, 11);
  ligne("TVA non applicable, article 293 B du CGI - agenceattractor.com", font, 8, muted, 15);
  page.drawRectangle({ x: M, y: y + 4, width: 495, height: 2, color: orange });
  y -= 26;

  ligne("CERTIFICAT DE SIGNATURE ELECTRONIQUE", bold, 16, ink, 20);
  ligne("Preuve de l'accord donne par voie electronique", font, 10, muted, 22);

  // Bandeau vert
  saut(56);
  page.drawRectangle({ x: M, y: y - 40, width: 495, height: 52, color: rgb(0.91, 0.96, 0.92) });
  page.drawText("SIGNE", { x: M + 16, y: y - 4, size: 12, font: bold, color: vert });
  page.drawText(clean(`${o.signataire.nom} - ${horodatage(o.signeLe)}`), { x: M + 16, y: y - 22, size: 9.5, font, color: ink });
  page.drawText(clean(`Empreinte de l'acte : ${o.preuveHash.slice(0, 48)}...`), { x: M + 16, y: y - 34, size: 7.5, font: mono, color: muted });
  y -= 62;

  // Dossier
  titreSection("Dossier signe");
  paire("Objet", o.dossier.titre);
  if (o.dossier.reference) paire("Reference", o.dossier.reference);
  if (o.dossier.client) paire("Projet", o.dossier.client);
  paire("Nombre de documents", String(o.documents.length));

  // Signataire
  titreSection("Signataire identifie");
  paire("Nom", o.signataire.nom);
  if (o.signataire.qualite) paire("Qualite", o.signataire.qualite);
  paire("Email verifie", o.signataire.email);
  paire("Nom saisi de sa main", o.signataire.signature_nom);
  paire("Moyen d'identification", "Code a usage unique envoye par email");
  paire("Adresse IP", o.ip);
  paire("Navigateur", o.ua.slice(0, 60));

  // Tracé manuscrit
  if (o.signataire.trace && o.signataire.trace.startsWith("data:image/png;base64,")) {
    try {
      const png = await doc.embedPng(o.signataire.trace);
      const w = 170, h = (png.height / png.width) * w;
      saut(h + 26);
      page.drawText("Signature manuscrite", { x: M, y, size: 9.5, font, color: muted });
      y -= h + 6;
      page.drawImage(png, { x: M + 150, y, width: w, height: h });
      page.drawRectangle({ x: M + 150, y: y - 3, width: w, height: 0.7, color: rgb(0.85, 0.83, 0.81) });
      y -= 16;
    } catch (_) { /* tracé illisible : le reste du certificat fait foi */ }
  }

  // Documents scellés
  titreSection("Documents scelles (empreinte SHA-256)");
  enroule(
    "Chaque document a ete empreinte au moment de sa mise en signature, puis re-verifie au moment de la signature. Une empreinte identique prouve que le document signe est exactement celui qui a ete presente, sans aucune modification.",
    98, font, 9, muted,
  );
  y -= 4;
  for (const d of o.documents) {
    ligne(`${d.nom}${d.reference ? " - " + d.reference : ""}`, bold, 9.5, ink, 13);
    ligne(d.contenu_hash, mono, 7.5, muted, 11);
    ligne(d.url, font, 7.5, muted, 15);
  }

  // Journal
  titreSection("Journal de preuve horodate");
  const libelle: Record<string, string> = {
    cree: "Dossier mis en signature et documents scelles",
    envoye: "Invitation envoyee au signataire",
    ouvert: "Lien de signature ouvert par le signataire",
    document_consulte: "Document consulte par le signataire",
    code_envoye: "Code a usage unique envoye par email",
    code_errone: "Code errone saisi",
    code_valide: "Code valide : identite confirmee",
    signe: "Signature apposee",
    refuse: "Signature refusee",
    copie_transmise: "Exemplaire signe transmis aux parties",
  };
  for (const e of o.evenements) {
    const d = new Date(e.created_at);
    const q = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium", timeZone: "Europe/Paris" }).format(d);
    saut(13);
    page.drawText(clean(q), { x: M, y, size: 8.5, font: mono, color: muted });
    page.drawText(clean(libelle[e.type] ?? e.type), { x: M + 120, y, size: 8.5, font, color: ink });
    y -= 13;
  }

  // Valeur juridique
  titreSection("Valeur juridique");
  enroule(
    "Cette signature est une signature electronique simple au sens de l'article 25 du reglement europeen eIDAS n 910/2014 et de l'article 1367 du Code civil. Elle est valable et recevable en justice. Son opposabilite repose sur le present faisceau de preuves : identification du signataire par code a usage unique adresse a son email, scellement des documents par empreinte SHA-256, journal horodate des operations, et transmission immediate d'un exemplaire signe a chacune des parties.",
    98, font, 9, muted,
  );

  y -= 8;
  saut(30);
  page.drawRectangle({ x: M, y: y + 4, width: 495, height: 0.8, color: rgb(0.90, 0.88, 0.86) });
  y -= 12;
  ligne(`Certificat emis le ${horodatage(new Date())}`, font, 8, muted, 11);
  ligne(`Empreinte de l'acte : ${o.preuveHash}`, mono, 7, muted, 11);
  ligne("Agence Mr Attractor - Signature Attractor - agenceattractor.com", font, 8, muted, 11);

  return encodeBase64(await doc.save());
}

// ── Fonction ───────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const { token, code, signature_nom, signature_trace, consentement } = await req.json();
    if (!token || !code) return json({ ok: false, error: "Lien ou code manquant." }, 400);
    if (consentement !== true) return json({ ok: false, error: "Vous devez cocher la case de consentement pour signer." }, 400);
    if (!signature_nom || String(signature_nom).trim().length < 3) {
      return json({ ok: false, error: "Saisissez votre nom complet pour signer." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const ip = ipDe(req);
    const ua = uaDe(req);

    const { data: sig } = await supabase
      .from("sig_signataires")
      .select("id, dossier_id, nom, email, qualite, role, statut")
      .eq("token", token).maybeSingle();
    if (!sig) return json({ ok: false, error: "Ce lien de signature n'existe pas." }, 404);
    if (sig.statut === "signe") return json({ ok: false, error: "Ces documents ont déjà été signés." }, 409);

    const { data: dossier } = await supabase
      .from("sig_dossiers").select("id, reference, titre, client, expire_at").eq("id", sig.dossier_id).single();
    if (new Date(dossier.expire_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Ce dossier de signature a expiré." }, 410);
    }

    // ── 1. Vérification du code ──
    const { data: otp } = await supabase
      .from("sig_otp").select("id, code_hash, expires_at, tentatives, used_at")
      .eq("signataire_id", sig.id).is("used_at", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (!otp) return json({ ok: false, error: "Aucun code en cours. Demandez un nouveau code." }, 400);
    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Ce code a expiré. Demandez-en un nouveau." }, 400);
    }
    if (otp.tentatives >= MAX_TENTATIVES) {
      return json({ ok: false, error: "Trop de tentatives sur ce code. Demandez un nouveau code." }, 429);
    }

    const saisi = await sha256(String(code).trim());
    if (!egalConstant(saisi, otp.code_hash)) {
      await supabase.from("sig_otp").update({ tentatives: otp.tentatives + 1 }).eq("id", otp.id);
      await journal(supabase, {
        dossier_id: sig.dossier_id, signataire_id: sig.id,
        type: "code_errone", ip, user_agent: ua, meta: { tentative: otp.tentatives + 1 },
      });
      const restant = MAX_TENTATIVES - (otp.tentatives + 1);
      return json({
        ok: false,
        error: restant > 0
          ? `Code incorrect. Il vous reste ${restant} tentative${restant > 1 ? "s" : ""}.`
          : "Code incorrect. Demandez un nouveau code.",
      }, 400);
    }

    await supabase.from("sig_otp").update({ used_at: new Date().toISOString() }).eq("id", otp.id);
    await journal(supabase, { dossier_id: sig.dossier_id, signataire_id: sig.id, type: "code_valide", ip, user_agent: ua });

    // ── 2. Contrôle d'intégrité des documents ──
    const { data: documents } = await supabase
      .from("sig_documents").select("id, nom, reference, url, contenu_hash, ordre")
      .eq("dossier_id", sig.dossier_id).order("ordre", { ascending: true });

    const alteres: string[] = [];
    for (const d of documents ?? []) {
      try {
        const r = await fetch(d.url);
        if (!r.ok) { alteres.push(`${d.nom} (inaccessible)`); continue; }
        const actuel = await sha256(new Uint8Array(await r.arrayBuffer()));
        if (actuel !== d.contenu_hash) alteres.push(d.nom);
      } catch (_) { alteres.push(`${d.nom} (inaccessible)`); }
    }
    if (alteres.length > 0) {
      await journal(supabase, {
        dossier_id: sig.dossier_id, signataire_id: sig.id,
        type: "code_errone", ip, user_agent: ua,
        meta: { anomalie: "integrite_document", documents: alteres },
      });
      return json({
        ok: false,
        error: `La signature a été interrompue : ${alteres.join(", ")} ne correspond plus au document scellé. Par sécurité, aucune signature n'a été apposée. Contactez Mac Arthur.`,
      }, 409);
    }

    // ── 3. Apposition et scellement ──
    const signeLe = new Date();
    const trace = typeof signature_trace === "string" && signature_trace.startsWith("data:image/png;base64,")
      ? signature_trace.slice(0, 400_000)
      : null;

    const preuveHash = await sha256(JSON.stringify({
      dossier: dossier.id,
      reference: dossier.reference,
      titre: dossier.titre,
      documents: (documents ?? []).map((d) => ({ nom: d.nom, hash: d.contenu_hash })),
      signataire: { nom: sig.nom, email: sig.email },
      signature_nom: String(signature_nom).trim(),
      signe_le: signeLe.toISOString(),
      ip,
    }));

    const { error: eUpd } = await supabase.from("sig_signataires").update({
      statut: "signe",
      signature_nom: String(signature_nom).trim(),
      signature_trace: trace,
      consentement: true,
      signed_at: signeLe.toISOString(),
      signed_ip: ip,
      signed_ua: ua,
      preuve_hash: preuveHash,
    }).eq("id", sig.id);
    if (eUpd) return json({ ok: false, error: eUpd.message }, 500);

    await journal(supabase, {
      dossier_id: sig.dossier_id, signataire_id: sig.id, type: "signe", ip, user_agent: ua,
      meta: { preuve_hash: preuveHash, signature_nom: String(signature_nom).trim() },
    });

    // Le dossier n'est clos que lorsque tout le monde a signé.
    const { data: tous } = await supabase
      .from("sig_signataires").select("statut").eq("dossier_id", sig.dossier_id);
    const complet = (tous ?? []).every((s) => s.statut === "signe");
    if (complet) {
      await supabase.from("sig_dossiers")
        .update({ statut: "signe", signed_at: signeLe.toISOString() }).eq("id", sig.dossier_id);
    }

    // ── 4. Certificat de preuve et envoi aux deux parties ──
    const { data: evenements } = await supabase
      .from("sig_evenements").select("type, created_at")
      .eq("dossier_id", sig.dossier_id).order("created_at", { ascending: true });

    let attachments: Array<{ filename: string; content: string }> = [];
    try {
      const pdf = await certificatPdf({
        dossier,
        documents: documents ?? [],
        signataire: {
          nom: sig.nom, email: sig.email, qualite: sig.qualite,
          signature_nom: String(signature_nom).trim(), trace: trace ?? undefined,
        },
        preuveHash, signeLe, ip, ua,
        evenements: evenements ?? [],
      });
      const nomFichier = `Certificat-signature-${(dossier.reference || dossier.titre).replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 40)}.pdf`;
      attachments = [{ filename: nomFichier, content: pdf }];
    } catch (_) { /* l'acte reste valide même si le certificat échoue : il est reconstructible depuis le journal */ }

    const listeDocs = (documents ?? [])
      .map((d) => `<li style="margin-bottom:6px"><a href="${esc(d.url)}" style="color:#1A1714">${esc(d.nom)}</a>${d.reference ? ` <span style="color:#9C9189">(${esc(d.reference)})</span>` : ""}</li>`)
      .join("");

    // Exemplaire du signataire
    await envoyerEmail({
      to: [sig.email],
      subject: `Signature confirmée — ${dossier.titre}`,
      html: gabaritEmail({
        kicker: "Signature confirmée",
        titre: `C'est signé, merci ${esc(sig.nom)}.`,
        corps: `
          <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 16px">Votre signature a bien été enregistrée le <strong>${esc(horodatage(signeLe))}</strong>.</p>
          <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 8px">Documents signés :</p>
          <ul style="font-size:15px;line-height:1.6;margin:0 0 18px;padding-left:20px">${listeDocs}</ul>
          <p style="font-size:14px;line-height:1.6;color:#4A3F35;margin:0 0 6px">Vous trouverez en pièce jointe votre <strong>certificat de signature</strong>. Conservez-le : il prouve la date, votre identité et le contenu exact de ce que vous avez signé.</p>
          <p style="font-size:12.5px;line-height:1.6;color:#9C9189;margin:14px 0 0">Empreinte de l'acte : <span style="font-family:monospace">${esc(preuveHash.slice(0, 32))}…</span></p>`,
        pied: "Cet email et son certificat constituent votre preuve de signature.",
      }),
      text: `${sig.nom}, votre signature a bien été enregistrée le ${horodatage(signeLe)}.\n\nDocuments signés :\n${(documents ?? []).map((d) => `- ${d.nom} : ${d.url}`).join("\n")}\n\nVotre certificat de signature est en pièce jointe.\nEmpreinte de l'acte : ${preuveHash}`,
      attachments,
    });

    // Exemplaire de l'agence
    await envoyerEmail({
      to: [AGENCE_EMAIL],
      subject: `Signé — ${sig.nom} · ${dossier.titre}`,
      html: gabaritEmail({
        kicker: "Signature Attractor",
        titre: `${esc(sig.nom)} vient de signer`,
        corps: `
          <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 14px"><strong>${esc(dossier.titre)}</strong>${dossier.reference ? ` — ${esc(dossier.reference)}` : ""}</p>
          <ul style="font-size:14px;line-height:1.7;margin:0 0 16px;padding-left:20px">${listeDocs}</ul>
          <p style="font-size:14px;line-height:1.7;color:#4A3F35;margin:0">
            Signé le ${esc(horodatage(signeLe))}<br>
            Email vérifié : ${esc(sig.email)}<br>
            IP : ${esc(ip)}<br>
            Dossier ${complet ? "<strong>complet</strong> : tous les signataires ont signé." : "en attente des autres signataires."}
          </p>`,
      }),
      text: `${sig.nom} a signé ${dossier.titre} le ${horodatage(signeLe)}. IP ${ip}. Dossier ${complet ? "complet" : "en attente"}.`,
      attachments,
    });

    await journal(supabase, {
      dossier_id: sig.dossier_id, signataire_id: sig.id,
      type: "copie_transmise", meta: { destinataires: [sig.email, AGENCE_EMAIL] },
    });

    return json({
      ok: true,
      signe_le: signeLe.toISOString(),
      horodatage: horodatage(signeLe),
      preuve_hash: preuveHash,
      dossier_complet: complet,
    });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});
