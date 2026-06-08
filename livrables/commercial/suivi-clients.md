# Suivi Clients — Pipeline Mr Attractor

> Source de vérité unique du statut de chaque client/prospect. Mise à jour à chaque session où un projet avance (signature, paiement, livraison, blocage...).
> Statuts possibles : Prospect → Maquette envoyée → Devis envoyé → Signé / Acompte reçu → En développement → Livré → En suivi (post-livraison) → Perdu

---

## Pipeline actif

| Client | Famille / Offre | Statut | Montant (setup + MRR) | Prochaine action | Dernière MAJ |
|---|---|---|---|---|---|
| **J'envoie Express** | Fam. A — Générateur d'Apps Métier (Livraison colis) | En développement — acompte reçu | 230 € (acompte 130 € versé le 03/06, solde 100 € à la livraison) | Relancer pour récupérer les 6 infos manquantes (logo, n° WA business, adresses collecte Paris/Abidjan, prochain voyage, validation couleurs) — bloquant le développement | 2026-06-08 |
| **MY NUGO** | Relation commerciale long terme (plusieurs années) — web app + BDD + dashboard | Déploiement | Hors barème classique — relation de confiance, pas un projet facturé au coup par coup | Basculer le projet sur le compte pro myattractor1 | 2026-06-08 |
| **Rukayatou Saka** | Fam. A ÉQUIPE (marque blanche Assists) + Fam. B (consulting visibilité) + partenariat XPaye | Devis envoyé (draft) | 1 050 € / 700 000 FCFA (devis ATR draft, 50% acompte à la signature) | Récupérer logo + couleurs + nom de l'outil pour finaliser et faire signer | 2026-06-08 |
| **Beracca Mastery Group** | Fam. A — système sur-mesure en tranches (ERP agro-distribution) | Proposition envoyée | Tranche 0 indicative : 250 000 à 1 000 000 FCFA (cadrage + prototype) | Envoyer le PDF `proposition-bmg.pdf`, proposer un RDV de cadrage Tranche 0 | 2026-06-08 |

---

## Comment l'alimenter

- **Nouveau prospect identifié** → ajouter une ligne, statut "Prospect"
- **Maquette envoyée** (`/maquette-closer`) → statut "Maquette envoyée"
- **Devis émis** (`/devis-express`) → statut "Devis envoyé" + montant depuis le barème
- **Signature + acompte** → statut "Signé / Acompte reçu" + montant réel encaissé
- **Pendant le développement** → statut "En développement", la prochaine action = le prochain jalon (cf. planning `/chef-de-projet`)
- **Livraison** → statut "Livré", déclenche la facturation du solde + demande de témoignage (`/community-manager`)
- **Post-livraison** → statut "En suivi", revue à J+7 puis mensuelle
- **Abandon / silence prolongé** → statut "Perdu" (ne pas supprimer la ligne — garder l'historique pour relance future)

---

## Règle

Ce tableau est la référence unique du pipeline commercial — `chef-de-projet` y renvoie au lieu de dupliquer une liste de projets. Si une info manque (montant, contact, zone), le signaler explicitement dans la cellule plutôt que d'inventer.
