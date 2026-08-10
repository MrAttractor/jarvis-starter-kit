# Studio Créatif IA (Agence Innovation Créative) — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | à relancer |
| Dernier contact | 2026-08-10 |
| Prochaine action | Retour d'expérience demandé à Emmanuel le 10/08. Obtenir aussi le cadrage du coaching Awa, puis envoyer le document d'échange |
| Échéance | — |
| Argent en attente | forfait technique 80 €, et la contrepartie coaching non formalisée |

## En une phrase

Site livré et en production sur `aicreatioon.com`, Emmanuel est devenu autonome sur son
portfolio et ses contenus. **La contrepartie du partenariat n'est pas encore formalisée
par écrit.**

## Le partenaire

**Emmanuel Yao**, Agence Innovation Créative, Abidjan. Création par IA, images et vidéos
ultra-réalistes. WhatsApp Business **+225 07 59 24 98 41**, emmanueldebeing.ed@gmail.com.
Portfolio réel : KFC, NASCO, FIFA World Cup, Oraimo, Himra.

Il vend aussi des formations IMAG'IN (30 000 F, 30 000 F, 50 000 F) et du coaching privé
(150 000 F la séance de 3 h, 200 000 F la formule Premium).

## L'échange, et ce qui manque

Ce n'est pas une vente. **Échange de prestations** :

| Il reçoit | Il donne |
|---|---|
| Conception et déploiement de son site, puis son tableau de pilotage | Un **coaching pour concevoir et déployer la campagne d'influence par IA de l'agence** (personnage Awa) |
| | Le **forfait technique 80 € / 50 000 FCFA** (domaine + hébergement), à sa charge et à son nom |

**Le document d'échange n'est toujours pas envoyé** (`ECHANGE-STUDIO-AWA.pdf` est prêt).
Il attend qu'Emmanuel précise le coaching : nombre de séances, format, disponibilités.
Tant que ce n'est pas écrit, l'agence a livré et n'a rien de formalisé en face.

Le coaching a **démarré dans les faits** le 11/07 : sa méthode de production est capturée
dans `../../contenu/awa-influenceuse/METHODE-PERSONNAGE-IA.md`.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Site | `aicreatioon.com` (+ www), projet Cloudflare Pages dédié `aicreatioon`, branche `main` |
| Page réalisations | `/realisations` |
| Tableau de pilotage d'Emmanuel | `/admin` (son compte, RLS scopée à son UID) |

Domaine acheté par Mac Arthur via Cloudflare le 11/07, **sous le compte de l'agence,
transférable sur demande**. L'ancienne préview `demo.agenceattractor.com/innovation-creative`
redirige en 301.

Backend Supabase partagé, tables `aic_`, 3 migrations dans `supabase/`.

## Ce qu'il pilote seul

- **Phase 1** : ses demandes de devis et de coaching arrivent dans son admin, avec notification email
- **Phase 2** : son **portfolio** (ajout, suppression, mise en vedette), le site public lit la base
- **Phase 3** : ses **textes, ses chiffres et sa vidéo d'accueil**

**Avant tout redéploiement de son site, lancer la batterie de tests de `tests/`**
(cohérence, contenu, défauts). C'est ce qui rend son autonomie sans risque.

## Ce qui manque encore de son côté

- Le lien de paiement de **IMAG'IN 3** (les formations 1 et 2 sont branchées sur Chariow)
- Ses **vrais témoignages** (la section est retirée en attendant)
- Ses **statistiques réelles** (les compteurs affichés sont à valider)

## Prochaine action

**Retour d'expérience demandé à Emmanuel le 10/08/2026.** Obtenir aussi le cadrage du
coaching Awa, puis envoyer le document d'échange : c'est la seule chose qui empêche ce
partenariat d'être équilibré sur le papier.
