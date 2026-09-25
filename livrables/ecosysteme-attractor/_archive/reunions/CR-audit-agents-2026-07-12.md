# CR Réunion générale, audit performance et efficacité des agents

**Date : 12/07/2026 (session 97)**
**Référence de comparaison : blueprint fondateur (RECAP_Ecosysteme_Agents_Attractor.md, 15 agents)**
**Menée par : Chief of Staff. Méthode : mandat théorique de chaque agent croisé avec les preuves réelles d'activité dans HISTORY.md, livrables/ et l'historique git.**

> Cette réunion sert de POINT ZÉRO. Il n'existait aucun CR de réunion générale antérieure. Les prochaines réunions se compareront à celle-ci.

---

## 1. État des 15 agents

| # | Agent | Pôle | Mandat rempli ? | Statut |
|---|-------|------|-----------------|--------|
| 1 | PILOTE | R&D | Non, absorbé par Mac Arthur + CoS | Dormant |
| 2 | ÉCLAIREUR | R&D | Partiel, veille faite inline | Actif ponctuel |
| 3 | BÂTISSEUR (dev) | R&D | Oui, porte toute la prod | Actif fort |
| 4 | VENDEUR (maquette/devis) | R&D | Oui, mécanisme central | Actif fort |
| 5 | GARDIEN (QA) | R&D | Non, filtre non appliqué | Dormant |
| 6 | TRÉSORIER (DAF) | Finance | Non, 0 bulletin, 0 veille niches | Dormant |
| 7 | COMPTES | Finance | Partiel, fait à la main dans Notion | Dormant |
| 8 | BOUSSOLE | Finance | Jamais | Jamais activé |
| 9 | CARBURANT (Meta ads) | Data/Pub | Jamais exécuté, juste décrété | Jamais activé |
| 10 | ÉDITO (chef contenu) | Contenu | Jamais | Jamais activé |
| 11 | VOIX (community manager) | Contenu | Partiel, concentré sur Awa | Actif ponctuel |
| 12 | AMBASSADEUR (LinkedIn/RSE) | RSE | Jamais, LinkedIn abandonné | Jamais activé |
| 13 | MIROIR (apprentissage) | Transverse | Oui, déployé en prod (crons 24/7) | Actif fort |
| 14 | PONT (liaison/décisions) | Transverse | Bien démarré puis gelé au 17/06 | Actif puis dormant |
| 15 | PINCEAU (DA) | DA | Oui sur la charte, template Canva jamais fait | Actif fort |

**Bilan : 4 agents portent réellement l'agence (BÂTISSEUR, VENDEUR, MIROIR, PINCEAU). 8 dormants ou jamais activés. 3 par intermittence.**

---

## 2. Constats majeurs

1. **La stratégie du moment n'est pas outillée.** Entrée en phase promotion + partenariats le 09/07, mais les agents de la visibilité dorment : ÉDITO, CARBURANT (Meta), AMBASSADEUR (LinkedIn), et VOIX sans cadence.
2. **La chaîne financière est aveugle.** TRÉSORIER, COMPTES, BOUSSOLE sans sortie d'agent. Suivi d'argent manuel dans Notion et troué (Djamo, Revolut jamais tracés ; pas de tableau de bord santé).
3. **Efficacité : bug de déploiement récurrent.** Confusion branche master/main et Worker/Pages sur demo-agenceattractor, déploiements partis en Preview sans effet, sur plusieurs sessions. GARDIEN ne filtrait rien.
4. **Perte de mémoire de gouvernance.** Registre PONT (decisions-actees.md) gelé au 17/06 ; les décisions structurantes de juillet non tracées.
5. **Le blueprint de référence est périmé.** Il fige la stack Google + Netlify + PWA alors que tout tourne sur Supabase + Cloudflare.

---

## 3. Décisions de la réunion

- **Priorité de remise en route : les GARDE-FOUS d'abord** (GARDIEN + PONT), avant le trio promotion et la visibilité cash.
- **Sort des 8 agents dormants : reporté** (à trancher à froid, hors de cette réunion).

### Livré séance tenante
- **GARDIEN** : checklist + carte de déploiement créées (`.claude/skills/gardien/references/checklist-deploiement.md`). Hook `deploy-guard.js` étendu : il réagit désormais aux commandes `wrangler deploy` / `wrangler pages deploy` et rappelle les pièges (branche prod, Worker vs Pages, vérification du vrai domaine). Testé sur 3 cas.
- **PONT** : registre `decisions-actees.md` réactivé, décisions 009 à 013 ajoutées (rattrapage de juillet + cette réunion).
- **Chief of Staff** : ce CR archivé comme réunion de référence.

---

## 4. Reste à séquencer (prochaines réunions)

1. Trancher le sort des dormants (réactiver par vagues vs élaguer BOUSSOLE/AMBASSADEUR).
2. Réveiller le trio promotion (ÉDITO → VOIX → CARBURANT) pour soutenir la phase actuelle.
3. Donner de la visibilité cash (COMPTES + TRÉSORIER : tableau de bord encaissements multi-canaux, MRR, top niches).
4. Mettre à jour le blueprint fondateur (stack réelle Supabase + Cloudflare) pour que la carte corresponde au terrain.
