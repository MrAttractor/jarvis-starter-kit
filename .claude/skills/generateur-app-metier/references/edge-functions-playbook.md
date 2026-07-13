# Playbook Edge Function — pattern inbound + erreurs à ne jamais refaire

> Référence réutilisable pour toute edge function Supabase de l'écosystème (formulaire → Claude → action).
> Créée le 13/07/2026. Modèle canonique = `attractor-assists/app/supabase/functions/diagnostic/index.ts` (déjà en prod, déjà robuste).

---

## 1. Le pattern inbound (le squelette réutilisable)

Toute captation de prospect/commande suit la même chaîne, côté serveur (edge function), jamais côté navigateur :

```
Formulaire (site) --POST--> Edge Function
   1. OPTIONS -> répondre CORS tout de suite
   2. Lire le body (await req.json())
   3. Charger le "cerveau" depuis la base (méthode/catalogue) — jamais le modèle seul
   4. Appeler Claude (Haiku) -> sortie JSON STRICTE
   5. Écrire en base : prospect + pilotage_pipeline (source de vérité du cockpit)
   6. Notifier Mac Arthur (email/in-app) avec une action 1 clic (wa.me pré-rempli)
   7. return 200 (toujours, même en cas d'erreur interne, mais en loguant)
```

Règle d'or : **l'edge function prépare, l'humain valide et envoie.** Jamais d'envoi automatique au client (sauf décision explicite).

---

## 2. Les erreurs à ne jamais refaire (checklist, tirée de vrais bugs)

1. **CORS + OPTIONS, toujours, dès la 1re ligne.** Sans en-têtes CORS + gestion de `OPTIONS`, le navigateur bloque l'appel **en silence**. Un `curl` passe, une vraie soumission non → fausse impression que "ça marche". (Bug notify-je-demande, 08/07.)
   ```ts
   const CORS = { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
   if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
   ```
2. **Fire-and-forget = échec silencieux.** Toujours `try/catch`, toujours loguer, renvoyer **200** pour ne pas casser l'appelant mais tracer l'erreur dans la réponse. Ne jamais conclure "ça a marché" parce qu'il n'y a pas d'erreur visible : le prouver par un vrai test bout en bout.
3. **Sécurité sur le projet Supabase partagé.** Service role **uniquement dans l'edge function**, jamais côté client. Jamais de policy `SELECT` publique sur une table client. RLS scopée à un **UID précis**, jamais `auth.role()='authenticated'` seul. (Faille Jean Yves, 08/07.)
4. **Secrets via `Deno.env.get(...)`,** jamais en dur, jamais committés (`.env` gitignoré). Clés utilisées : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`.
5. **Claude peut renvoyer du texte hors JSON, ou échouer.** Demander un JSON strict, extraire le `{...}` par regex, `JSON.parse` dans un `try`, et prévoir un **fallback gracieux** pour qu'une réponse IA malformée ne casse jamais tout le flux.
   ```ts
   const m = raw.match(/\{[\s\S]*\}/); parsed = JSON.parse(m ? m[0] : raw);
   ```
6. **Échapper le HTML** (`esc()`) sur toute donnée utilisateur injectée dans un email/HTML. Sinon HTML cassé ou injection.
7. **Anti AI-slop dans les messages générés.** Le prompt interdit emojis et markdown, impose un ton naturel et direct. Un message qui sent le chatbot décrédibilise.
8. **Humain dans la boucle.** On prépare le message et un lien `wa.me` pré-rempli ; Mac Arthur relit et envoie. Pas d'auto-send.
9. **Tester le VRAI chemin** (soumission navigateur réelle), pas juste un `curl`. Puis vérifier en prod.
10. **Idempotence.** Se prémunir des double-soumissions (double insert / double email). (Leçon double-facturation.)
11. **Email : expéditeur = domaine vérifié Resend** (`noreply@agenceattractor.com`), sinon rien ne part. (Leçon n8n, 12/07.)
12. **Déploiement.** Endpoint public = `supabase functions deploy <nom> --no-verify-jwt`. Vérifier après déploiement.

---

## 3. Cadrage de l'extension inbound (petite, ciblée)

**Constat :** `diagnostic` fait déjà tout (CORS, qualif Claude → famille/synthèse/problèmes/opportunités, écriture prospect + pipeline, email avec lien "Répondre sur WhatsApp"). Le SEUL manque : le lien WhatsApp est pré-rempli avec un message **générique** ("merci pour votre diagnostic"). Mac Arthur doit encore écrire le vrai message.

**Extension (1 seule vraie modif) :** faire rédiger par Claude, dans le même appel, un **premier message WhatsApp personnalisé et prêt à envoyer**, et l'utiliser comme texte du lien `wa.me`.

- Ajouter au JSON de sortie de Claude un champ : `"message_whatsapp": "<premier message de contact, tutoiement ou vouvoiement selon zone, sans emoji ni markdown, qui reprend son activité et sa douleur, et propose un prochain pas concret>"`.
- Dans la notif, remplacer le texte générique par `parsed.message_whatsapp` (avec fallback si absent).
- (Optionnel) champ `"prochaine_action"` pour pré-remplir la colonne `prochaine` du pipeline avec une reco concrète au lieu du texte fixe.

**Résultat :** Mac Arthur ouvre l'email, clique "Répondre sur WhatsApp", le message est déjà écrit et adapté. Il relit, il envoie. Zéro rédaction de sa part.

**Ce qu'on NE fait PAS :** pas de n8n, pas de Cowork, pas d'auto-send. On étend l'existant, sur le backend déjà consolidé (Supabase), déclenché en temps réel par le formulaire.
