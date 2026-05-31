# Attractor Assists, suivi de chantier

> Tableau de bord du projet pour piloter les mises a jour depuis VS Code.
> Mis a jour au fil des livraisons de Claude Design et de l'integration locale.

---

## Etat d'avancement (au 2026-05-29)

| Brique | Etat |
|--------|------|
| Cartographie de l'existant (ancienne version) | Fait, voir `cartographie-existant.md` |
| Methode Attractor (cerveau de l'assistant) | Fait, voir `methode-attractor-synthese.md` |
| Design system v0 | Fait, voir `design-system.md` |
| Architecture cible Supabase | Fait, voir `architecture-supabase.md` |
| Prompt de refonte (session dediee) | Fait, voir `prompt-refonte.md` |
| Prompt Claude Design (maquette HF autonome) | Transmis a Claude Design, **en cours de production** |
| Scaffold technique (Vite + React + Tailwind v4 + Supabase) | En place dans `app/`, build OK, dev OK |
| Maquette haute fidelite | **En attente de Claude Design** |
| Integration maquette dans le code | A faire des reception |

---

## Workflow de travail

1. **Claude Design (claude.ai)** produit la maquette haute fidelite cliquable (artifact React, donnees simulees).
2. On recupere le code et on l'integre **ici, dans VS Code**, pour toutes les mises a jour et iterations.
3. On rebranche progressivement le back **Supabase** reel (auth, forfaits, PPSD, agents) sur la maquette.

> Decision en attente : emplacement final du code Claude Design (integrer dans `app/` existant **ou** dossier `maquette/` separe). A trancher quand le code arrive. Recommandation par defaut : integrer dans `app/` pour garder une seule app et brancher Supabase ensuite.

---

## Carte des fichiers

```
attractor-assists/
├── SUIVI.md                       # CE FICHIER (etat + pilotage)
├── prompt-refonte.md              # prompt refonte (session dediee workspace)
├── design-system.md               # couleurs, typo, tokens, composants
├── methode-attractor-synthese.md  # cerveau de l'assistant (PPSD, AIDA/PASA, BOOST TA MARQUE)
├── architecture-supabase.md       # modele de donnees cible + securite
├── cartographie-existant.md       # ce qui existait avant (dette technique)
└── app/                           # SCAFFOLD TECHNIQUE (le code qui tourne)
    ├── src/
    │   ├── App.jsx                # ecran d'accueil actuel (lit les forfaits Supabase)
    │   ├── main.jsx
    │   ├── index.css              # tokens Tailwind v4 (orange/vert/charbon/sable + Sora/Inter)
    │   └── lib/supabase.js        # client Supabase (lit VITE_SUPABASE_* depuis .env.local)
    ├── supabase/
    │   ├── config.toml
    │   └── migrations/0001_init.sql
    ├── .env.local                 # cles Supabase (NON committe)
    ├── .env.local.example
    ├── package.json
    └── vite.config.js
```

---

## Lancer l'app en local (rappel)

```bash
cd livrables/ecosysteme-attractor/attractor-assists/app
npm install        # une seule fois
npm run dev        # http://localhost:5173
npm run build      # verifier que ca compile
```

Node portable : `C:\Users\macar\AppData\Local\nodejs-portable\node-v24.16.0-win-x64`.
Cles Supabase dans `app/.env.local` (jamais committe, ignore par git).

---

## Prochaines etapes

- [ ] Recevoir la maquette de Claude Design.
- [ ] Decider de l'emplacement (`app/` vs `maquette/`) et integrer le code.
- [ ] Verifier le rendu en local (dev + build).
- [ ] Rebrancher Supabase ecran par ecran (auth, forfaits, PPSD, agents).
- [ ] Mettre a jour ce SUIVI.md a chaque etape.

---

## Directive design (2026-05-30)

> Règle permanente sur toute la suite du projet.

- **Zéro pictogramme standard** dans l'app. Ni SVG génériques, ni emoji comme décoration principale, ni Lucide/Heroicons.
- **Canva = source unique des visuels** : chaque image, illustration, fond, icône expressive est produit via Canva et livré directement dans le projet.
- **Workflow :** Claude rédige le brief Canva → Mac Arthur valide/ajuste → Canva produit → image intégrée dans le code.
- **Ton visuel :** soigneusement arrangé, expressif, pas gadget. Chaque image doit raconter quelque chose.

### Visuels à produire (par priorité)

| Priorité | Visuel | Où | Statut |
|----------|--------|----|--------|
| 1 | Fond des 3 slides d'empathie (Acte 1 onboarding) | `TypewriterSlide` slot img commenté | À produire |
| 2 | Illustrations des 3 couloirs (Organisation · Visibilité · Ventes) | `DiscoveryScreen` cartes | À produire |
| 3 | Images du guide d'installation PWA (iOS · Android · Samsung) | `InstallScreen` — remplacer SVG | À produire |
| 4 | Image de fond du header Dashboard | `DashboardScreen` gradient actuel | À produire |
| 5 | Visuels des assistants (cards "Tes bras droits") | `AssistantsScreen` | À produire |

---

## Journal des integrations

> Ajouter ici une ligne datee a chaque mise a jour importante du code.

- **2026-05-29** : terrain prepare. Scaffold `app/` valide (npm install OK, build OK, dev sur :5173). Prompt Claude Design transmis, maquette en attente.
- **2026-05-30** : onboarding complet (3 actes + profil dominant branching + guide PWA install + écran découverte 3 couloirs). Edge Function `generate-livrable` mise à jour avec le profil. Build OK 87 modules.
