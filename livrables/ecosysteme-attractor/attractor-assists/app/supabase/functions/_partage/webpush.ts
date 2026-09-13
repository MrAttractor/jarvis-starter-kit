// ============================================================
// webpush.ts — envoi de notifications web, sans dependance
// ------------------------------------------------------------
// Ecrit a la main plutot qu'importe : c'est du chiffrement, et une
// bibliotheque qui echoue silencieusement sur un runtime Deno se
// traduirait par des notifications qui ne partent jamais, sans
// aucune trace. Ici chaque etape est verifiable.
//
// Deux specifications, et il faut les deux :
//   RFC 8291 — chiffrement du contenu (aes128gcm)
//   RFC 8292 — identification de l'expediteur (VAPID)
//
// Le service de push (Google, Mozilla, Apple) ne lit jamais le
// contenu : il transporte un bloc chiffre que seul le navigateur du
// fan peut ouvrir. C'est pour ca qu'on ne peut pas se contenter
// d'un simple POST.
// ============================================================

const enc = new TextEncoder();

export const b64uToBytes = (s: string): Uint8Array => {
  const p = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(p + "=".repeat((4 - (p.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

export const bytesToB64u = (b: Uint8Array): string => {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

// HKDF, reduit au cas qui nous sert : une seule iteration, L <= 32.
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const prkKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));
  const expKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const t = new Uint8Array(await crypto.subtle.sign("HMAC", expKey, concat(info, new Uint8Array([1]))));
  return t.slice(0, len);
}

export type Abonnement = { endpoint: string; p256dh: string; auth: string };

// ---------- Le corps chiffre (RFC 8291) ----------
async function chiffrer(ab: Abonnement, message: string): Promise<Uint8Array> {
  const clientPub = b64uToBytes(ab.p256dh); // point EC non compresse, 65 octets
  const authSecret = b64uToBytes(ab.auth);  // 16 octets

  // Paire ephemere : une par notification, jamais reutilisee.
  const ephemere = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const serverPub = new Uint8Array(await crypto.subtle.exportKey("raw", ephemere.publicKey));

  const clientKey = await crypto.subtle.importKey("raw", clientPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const partage = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, ephemere.privateKey, 256),
  );

  // L'ordre client puis serveur est impose par la specification ; l'inverser
  // produit un bloc que le navigateur refuse sans dire pourquoi.
  const keyInfo = concat(enc.encode("WebPush: info\0"), clientPub, serverPub);
  const ikm = await hkdf(authSecret, partage, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);

  // 0x02 ferme le dernier enregistrement. Sans lui, le navigateur jette tout.
  const clair = concat(enc.encode(message), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const chiffre = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, clair),
  );

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([serverPub.length]), serverPub, chiffre);
}

// ---------- L'identification de l'expediteur (RFC 8292) ----------
async function jetonVapid(audience: string, sujet: string, priveeJwk: JsonWebKey): Promise<string> {
  const entete = bytesToB64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const corps = bytesToB64u(enc.encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 11 * 3600, // 12 h est le maximum tolere
    sub: sujet,
  })));
  const aSigner = enc.encode(entete + "." + corps);
  const cle = await crypto.subtle.importKey(
    "jwk", priveeJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );
  // WebCrypto rend deja r||s brut, ce qu'attend JWS. Une signature DER, elle,
  // serait refusee par les services de push.
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cle, aSigner));
  return entete + "." + corps + "." + bytesToB64u(sig);
}

export type Reglages = {
  publique: string;      // cle publique VAPID, base64url
  priveeJwk: JsonWebKey; // cle privee VAPID
  sujet: string;         // mailto: ou https://, exige par la specification
};

export type Resultat = { ok: boolean; statut: number; perime: boolean };

/** Envoie une notification a UN abonnement. Ne leve jamais : le resultat se lit. */
export async function envoyer(ab: Abonnement, message: string, r: Reglages): Promise<Resultat> {
  try {
    const url = new URL(ab.endpoint);
    const corps = await chiffrer(ab, message);
    const jwt = await jetonVapid(url.origin, r.sujet, r.priveeJwk);

    const rep = await fetch(ab.endpoint, {
      method: "POST",
      headers: {
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        "Content-Length": String(corps.length),
        TTL: "86400",
        Urgency: "normal",
        Authorization: `vapid t=${jwt}, k=${r.publique}`,
      },
      body: corps,
    });

    // 404 et 410 sont les deux seules facons d'apprendre qu'un abonnement est
    // mort : le fan a desinstalle, ou refuse les notifications. On le note pour
    // pouvoir nettoyer, au lieu de reessayer indefiniment.
    return { ok: rep.status >= 200 && rep.status < 300, statut: rep.status, perime: rep.status === 404 || rep.status === 410 };
  } catch (_) {
    return { ok: false, statut: 0, perime: false };
  }
}
