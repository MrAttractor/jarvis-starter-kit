# Prompt : organisation des livrables + gestion des secrets (aligné Mr Attractor)

> Version réécrite et alignée sur l'agence Mr Attractor.
> À coller dans Claude Code (VS Code) pour mettre en place la structure d'un coup.

---

Mets en place deux choses dans ce workspace.

## 1. Une organisation pour ranger les livrables que tu produis

Crée un dossier `livrables/` à la racine du workspace, avec à l'intérieur les sous-dossiers suivants :

- `clients/` — web apps métiers sur mesure. Un sous-dossier par client (ex : `clients/my-nugo/`, `clients/jenvoie-express/`). À l'intérieur d'un client, sépare ce qui le mérite : `maquette/`, `app/`, `docs/`.
- `ecosysteme-attractor/` — les apps maison de l'écosystème (Attractor Assists, Livraison Pro, Fidelys, module de pilotage). Un sous-dossier par app.
- `commercial/` — devis, factures, maquettes de démo et supports de vente. Sous-dossiers : `devis/`, `factures/`, `maquettes/`, `supports/`.
- `contenu/` — campagne de création de contenu : le manuel, le challenge gratuit 7 jours, les scripts, hooks et le calendrier éditorial.

Ajoute un `README.md` dans `livrables/` qui explique l'organisation et la convention de nommage des projets. Ajoute aussi un README court dans chaque sous-dossier qui décrit ce qui y va.

**La règle d'or à documenter :** les inputs (documents que je te fournis) vont dans `context/import/`, les outputs (ce que tu produis pour moi) vont dans `livrables/`.

**Convention de nommage :** kebab-case, sans accents ni espaces (ex : `clients/olive-mafo/`, `commercial/devis/2026-06-jenvoie-express.md`). Pour les fichiers datés, préfixe par `AAAA-MM` pour garder l'ordre chronologique.

## 2. La gestion des secrets et clés d'API

Crée à la racine du workspace :

- Un `.env` avec des emplacements pré-remplis pour les clés d'API de ma stack : Anthropic, OpenAI, Notion, Google Workspace (Sheets / Apps Script), n8n, Vercel, GitHub. Et pour le paiement : Wave et MTN Money (mobile money Côte d'Ivoire), PayPal Pro (déjà en place) ; Stripe et CinetPay sont marqués comme prochaines étapes (pas encore activés). Ajoute un en-tête de commentaires qui explique son rôle et la consigne de **ne jamais le committer**.
- Un `.env.example` qui sert de template public, avec les mêmes variables sans valeurs.
- Un `.gitignore` qui exclut au minimum : `.env` et variantes, `.DS_Store`, `node_modules/`, dossiers de build (`dist/`, `build/`, `.next/`), fichiers d'éditeur (`.vscode/`, `.idea/`), logs, fichiers temporaires, et tout pattern de secret (`*key*`, `*.pem`).

---

> Note : tout ce qui est validé dans cette organisation a vocation à être réinjecté dans l'app **Attractor Assists** (refonte envisagée). Garde donc la structure simple, claire et reproductible pour un entrepreneur novice.
