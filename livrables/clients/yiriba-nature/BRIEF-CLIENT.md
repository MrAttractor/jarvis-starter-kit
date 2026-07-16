# Yiriba Nature — Faveur Ingryd Brou

> Prospect entré le 15/07/2026 via le formulaire diagnostic du site. Closé par téléphone le 16/07/2026.

## Qui
- **Contact** : Faveur Ingryd Brou, +225 07 18 41 42 48 (WhatsApp), Côte d'Ivoire.
- **Marque** : Yiriba Nature, « La nature qui prend soin de vous ». Huiles végétales, beurres naturels, soins capillaires et corporels.
- **Modèle** : vente en gros et demi-gros. Double clientèle : revendeurs qui reconditionnent pour revendre (B2B) + clients finaux (B2C). Tout passe par WhatsApp.
- **Douleur captée au diagnostic** : plus de visibilité sur qui achète quoi, à quel rythme, ni sur le stock. Veut reprendre le contrôle et voir ses vrais chiffres.

## Le deal acté (téléphone, 16/07/2026)
- **Produit acheté** : accompagnement **EAGLE** (525 000 FCFA / 800 €, 10h sur 2 mois).
- **Plateforme incluse** : App pro avec catalogue, prise de commande B2B/B2C séparée, visibilité stock, tableau de bord ventes (valeur barème 320 000 FCFA / 490 €, comprise car c'est l'outil de l'accompagnement).
- **Prix pour elle** : 525 000 FCFA / 800 €, **réglé en 3 tranches de 175 000 FCFA (≈ 267 €)**.
- **Démarrage** : au versement de la Tranche 1 (175 000 FCFA), conforme au SOP (pas de démarrage sans acompte).
- **Conseils pratiques** : inclus dans les 10h EAGLE (pas une ligne à part).
- **Contrepartie visibilité (écrite dans le devis)** : vidéo témoignage + recommandation dans son réseau de revendeuses + autorisation de citer Yiriba Nature comme cas client. C'est ce qui justifie le tarif de lancement (rabais volontaire ~40 % vs barème plein, à compenser par de la vraie com).

## Devis
- **N° ATR-2026-0010**, émis le 16/07/2026, valable jusqu'au 31/07/2026.
- Format = **devis de confirmation** (deal fermé), pas un devis à composer. La cliente valide, le bouton POST vers `devis-accept`.
- Source : `livrables/clients/demo-site/public/yiriba/index.html` (template Fleur Ndoua adapté, charte agence, FCFA en premier, CSS impression, zéro débordement vérifié).
- À déployer sur **demo.agenceattractor.com/yiriba** (Cloudflare Pages `demo-agenceattractor`, branche **master**, piège connu).

## Points ouverts
- Confirmer avec elle le calendrier des 3 tranches (échéances précises) au moment du démarrage.
- Détail produit réel (gamme, prix gros/demi-gros exacts, liste des revendeurs) à collecter pendant l'accompagnement EAGLE, avant de construire la plateforme.
- À créer dans le Pilotage (`pilotage_pipeline`) : le dossier existe déjà en base (créé par le formulaire diagnostic, statut « Diagnostic reçu », famille restée « ? » — bug à noter).
