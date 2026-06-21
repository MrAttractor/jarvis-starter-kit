# Candidatures Compétitions — Mr Attractor

Dossiers de candidature prêts à l'envoi pour les compétitions, subventions et programmes de financement startups africaines.

---

## Structure

```
candidatures/
├── README.md                          (cet index)
├── n8n-veille-competitions.json       (workflow n8n à importer)
└── attractor-assists/
    ├── executive-summary.html         (document A4 imprimable)
    └── one-pager.html                 (format compact 1 page)
```

---

## Documents disponibles

| Document | Description | Statut |
|---|---|---|
| executive-summary.html | Dossier complet A4 : problème, solution, impact, équipe, roadmap | Prêt — compléter les métriques |
| one-pager.html | Version compressée 1 page, dense, pour email ou impression | Prêt — compléter les métriques |
| n8n-veille-competitions.json | Workflow alerte hebdomadaire (lundi 8h) | À importer dans n8n Railway |

---

## Champs à remplir avant envoi

Dans `executive-summary.html` et `one-pager.html`, les champs marqués **"À mesurer"** ou **"À calculer"** doivent être remplacés par les vraies données dès que le tracker d'impact est actif (chantier août 2026) :

- Nombre d'utilisateurs actifs (mise à jour manuelle)
- CA moyen généré par utilisateur
- Heures de charge mentale économisées
- Emplois soutenus (calcul indirect)

---

## Notion — Radar Financement

Fiches détaillées, roadmap et scores de compatibilité :
https://app.notion.com/p/3824257524c68131ba72eb3400a989a1

---

## Workflow n8n — Import

1. Aller sur n8n Railway : https://n8n-production-3bfc.up.railway.app
2. Menu → Import Workflow
3. Importer `n8n-veille-competitions.json`
4. Configurer credentials SMTP (Resend, déjà utilisé pour login Assists)
5. Activer le workflow

Le workflow tourne chaque lundi à 8h et envoie un récap par email + sauvegarde dans Supabase veille_rapports.

---

## Cibles par ordre de priorité

| # | Programme | Deadline 2027 | Action immédiate |
|---|---|---|---|
| 1 | Seedstars Africa | Continu | Identifier cycle CI/Nigeria juillet 2026 |
| 2 | Orange POESAM | Mars-Mai 2027 | Atteindre 200 users + tracker impact |
| 3 | AfricaTech Award | Jan-Fév 2027 | Lever 150k USD d'abord |
| 4 | Africa Business Heroes | Mars-Avril 2027 | Attendre 3 ans de revenus (02/2027) |
| 5 | UNICEF Venture Fund | Mars 2027 | Angle FemTech + open source à préparer |
