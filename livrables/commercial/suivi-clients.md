# Suivi Clients — Pipeline Mr Attractor

> Source de vérité unique du statut de chaque client/prospect. Mise à jour à chaque session où un projet avance (signature, paiement, livraison, blocage...).
> Statuts possibles : Prospect → Maquette envoyée → Devis envoyé → Signé / Acompte reçu → En développement → Livré → En suivi (post-livraison) → Perdu

**Dernière synchro** : 2026-08-06 (retour vocal Mac Arthur : Andréa livrée & payée, Yiriba en pause, Ayela phase marketing, Emmanuel Yao à relancer pour post, nouveau partenariat Serge Bouka).

---

## Pipeline actif

| Dossier | Famille / Offre | Statut | Montant | Prochaine action | MAJ |
|---|---|---|---|---|---|
| **Andréa Koné — Vies Croisées** | Fam. A — App métier (site émission) | ✅ **Livré + en suivi** | Payé intégralement (montant à recaler) | Dernières retouches du 04/08 acceptées. Demander témoignage + autorisation de communiquer. | 2026-08-06 |
| **Ayela / Ayêla SARL (Lorraine)** | Fam. A — App métier (vitrine + tableau de bord) — partenariat par échange | ✅ **Livré, phase marketing** | À vérifier | 1) Récupérer la vidéo témoignage (contrepartie du partenariat) 2) Planifier le live où Lorraine raconte son expérience 3) Passer à la phase pratique marketing (vidéos) — promo indépendance se termine 08/08 | 2026-08-06 |
| **J'envoie Express (Jean Yves)** | Fam. A — App livraison colis Paris↔Abidjan | ✅ **Livré + en production**, comptes à confirmer | Setup 230€ (acompte 130€ reçu, solde 100€ à confirmer) + MRR 50€/mois à confirmer | 64 jours de silence. Point comptes : confirmer solde 100€ + prélèvement 50€/mois. Mail : gb.jeanyves@yahoo.fr | 2026-08-06 |
| **MY NUGO** | Fam. A — Web app + BDD + dashboard (relation long terme) | En production | Hors barème (relation de confiance) | Mettre à jour le site (attente photo) | 2026-06-09 |
| **Élise / Club Élévia** | Fam. A — App métier rencontres diaspora | Acompte reçu (3 000€), signatures Yousign en attente | 3 500€ setup + 250€/mois | Récupérer solde acompte 50€ + doc détaillé pour cahier des charges | 2026-06-13 |
| **Rukayatou Saka** | Fam. A ÉQUIPE (marque blanche Assists) + Fam. B consulting + partenariat XPaye | Devis envoyé | 870€ setup + 180€/mois | Récupérer logo + couleurs + nom de l'outil pour finaliser la maquette | 2026-06-09 |
| **Beracca Mastery Group (Bérénice Kouadio Debrimou)** | Fam. A — ERP agro-distribution en tranches | Devis envoyé | Tranche 0 : 250k – 1M FCFA | 50 jours de silence. Relance en cours (marché export KONAVA via Cabinet DAB). WA +225 07 57 49 72 07 | 2026-08-06 |
| **Yiriba Nature (Faveur Ingryd Brou)** | Fam. A + accompagnement EAGLE — partenariat coaching + plateforme | 🟡 **En pause** (souhaite plateforme + coaching mais pas prête financièrement) | Devis ATR-2026-0010 à 800€ / 525 000 FCFA (à réévaluer) | Relance amicale (pas de commercial dur). Attendre son signal côté trésorerie. WA +225 07 18 41 42 48 | 2026-08-06 |
| **Nabycook (Nabintou Dosso)** | Partenariat DMV — 3 vidéos + site vitrine offert | Devis ATR-2026-0012 envoyé, facture acompte 175€ facturée, CDC v2 envoyé | 350€ (partenariat) | Attendre validation CDC v2 (envoyé par mail). nabycook@gmail.com / +33 7 46 45 71 48 | 2026-07-17 |
| **All Eyes on Yoo** | Fam. A — App métier lunettes/montures (vitrine + essayage + dashboard + lien livreur) | Nouveau prospect qualifié | 250 / 490 / 1 200€ selon grille | Chiffrer sur la grille produit + envoyer maquette | 2026-07-10 |
| **Emmanuel Yao — Agence Innovation Créative (Studio IA)** | Partenariat visibilité (site ↔ coaching Awa + 80€) | Site livré, partenariat actif | Contrepartie non financière + 80€ forfait | Relance pour **post dédié agence Mr Attractor** (contrepartie visibilité). WA +225 07 59 24 98 41 / emmanueldebeing.ed@gmail.com | 2026-08-06 |
| **Serge Bouka** | Partenariat opérationnel — plateforme (secteur/nom à préciser) | 🆕 **Nouveau partenariat cadré** | Non financier (troc rôles) | Répartition : Mac Arthur = dev plateforme / Serge = opérationnel + contact + vérification. Attendre : couleurs (rouge/noir/gris/blanc confirmé), secteur, nom du projet, périmètre v1 | 2026-08-06 |

---

## Autres pistes suivies hors pipeline commercial classique

| Dossier | Nature | État |
|---|---|---|
| **Armée du Seigneur** | Don / vitrine agence | Site déployé (index.html + admin.html), pas de facturation |
| **Air Côte d'Ivoire (Hermance Alloh)** | Partenariat OBC (cabine convoyeur) | Refonte page proposition VSD en cours (revente franchise abandonnée le 31/07). Fenêtre visibilité : 10-12/08. Vol du 04/09 en jeu |
| **Cabinet DAB / KONAVA** | Prescripteur (a apporté Beracca) | Marché export 3-5 tonnes Canada actif |

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
