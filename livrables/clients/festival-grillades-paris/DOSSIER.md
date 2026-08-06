# Festival des Grillades de Paris — l'état du dossier

> Révision du 05/08/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en cours |
| Dernier contact | 2026-08-05 |
| Prochaine action | Tenir la session technique, en sortir les 3 arbitrages et un porteur par chiffre manquant |
| Échéance | 2026-08-13 |
| Argent en attente | honoraires non fixés |

## En une phrase

**Le NDA est signé par les deux parties. Le mandat est abandonné au profit d'un contrat
de prestation au forfait**, à cadrer en session technique le **jeudi 6 août**. Événement
le **11 octobre 2026 à Bobigny**, il reste 66 jours et aucun chiffre n'est encore posé.

## Les acteurs

| Qui | Rôle |
|---|---|
| **Advantage Conseils** (Abidjan) | Cliente. Organisatrice historique du Festival des Grillades depuis 2008, propriétaire du concept. Représentante : Florence KONE. Commissaire général : Eric Atta. |
| **Thim Production** (Rennes) | Prestataire. Producteur délégué et employeur déclaré en France. Représentante : Nomagbè MEÏTE épouse CADEC. |
| **Mr Attractor** | Intermédiation, structuration contractuelle et coordination. Rémunéré par Thim, dans la marge du kit. |

Le sponsoring est démarché en central depuis Abidjan sur des packages multi-éditions.
L'édition de Paris n'a pas la main sur ses partenaires.

## Où on en est

| Document | Fichier | Diffusion | État |
|---|---|---|---|
| NDA | `NDA-ADVANTAGE-THIM.md` et version Word | les deux parties | **signé** |
| **Espace de pilotage en ligne** | `0001_espace_pilotage.sql`, `0002_seance_1_recueil.sql`, front dans `demo-site/public/festival-grillades/` | **les trois parties** | **en ligne et testé** |
| Recueil du périmètre | `RECUEIL-SESSION-TECHNIQUE.md` | version papier de secours | prêt pour jeudi 6 août |
| Cadre et liste des tâches | `CADRE-PRESTATION-ET-TACHES.md` | **interne Thim + Mr Attractor** | préparation de séance |
| Budgétisation et prix | `BUDGET-KIT-PARIS-2026.md` | **confidentiel Thim** | à remplir après le recueil, **seul document qui porte les chiffres** |
| Contrat de prestation + devis + modalités | à rédiger | envoi unique au client | après la session technique |
| Contrat de mandat | `CONTRAT-MANDAT-ADVANTAGE-THIM-WORD.txt` | abandonné, conservé pour ses clauses réutilisables |
| Contexte du festival | `CONTEXTE-FESTIVAL-2026.md` | |
| Arbitrages antérieurs | `NOTE-FUSION-ET-POINTS-A-TRANCHER.md` | historique des points tranchés |

## Le montage retenu

Advantage cliente, Thim prestataire, **un kit unique au forfait** incluant le portage
réglementaire, les charges sociales et la production. Thim porte le risque de dépassement
en contrepartie d'une marge cible de 20 %.

**Point de vigilance juridique majeur :** la ligne « location de licence » ne peut pas
s'écrire ainsi. Le prêt de licence d'entrepreneur de spectacles est une infraction
(L.7122-1 et suivants du code du travail). Thim doit être le producteur et l'employeur
déclaré réel, pas un loueur de licence. Voir section 3 du cadre.

## L'espace de pilotage en ligne

**Lien de la séance n°1 :**
`https://demo.agenceattractor.com/festival-grillades/?s=s1-9c4f7a2e6b18d350af71`

Le lien vaut l'accès : il ne se diffuse qu'aux trois parties. Chacun s'identifie par son
nom et sa structure à l'entrée, et toute décision est enregistrée à son nom.

| | |
|---|---|
| Onglet Périmètre | les 40 lignes à statuer, section par section, avec commentaire et ajout en séance |
| Onglet Informations | les 29 éléments à obtenir d'Advantage, avec porteur et échéance |
| Onglet Actions | le suivi avec porteurs et échéances, 6 actions déjà ouvertes |
| Onglet Compte rendu | le relevé de décisions, imprimable en PDF, avec les trois blocs de validation |
| Onglet Journal | l'historique horodaté, ni modifiable ni effaçable |

**Fonctionnement.** La séance se clôture seulement quand les 40 points sont statués.
Une fois close, plus aucune modification n'est possible, le relevé est figé et proposé à
la validation. Quand les trois structures ont validé, la séance est définitivement
verrouillée. Une réouverture reste possible tant que les trois validations ne sont pas
réunies, et elle crée une nouvelle version, tracée.

**Sécurité.** Aucune table n'est lisible avec la clé publique du site. Tout passe par des
fonctions qui exigent le jeton de la séance, lequel n'est jamais renvoyé au navigateur.
Vérifié : accès direct aux tables refusé, jeton invalide refusé.

**Logos.** En place. Sources dans ce dossier (`LOGO ADVANTAGE.jpg`,
`LOGO THIM PRODUCTION.jpg`), versions détourées et normalisées dans
`demo-site/public/festival-grillades/logos/`. Ils apparaissent en bandeau à l'écran et
en en-tête du compte rendu imprimé, Advantage à gauche, Thim à droite.

## La séquence

| Étape | Quand | Quoi |
|---|---|---|
| 1. Recueil | jeudi 6 août | Advantage dit ce qu'elle confie à Thim. **Aucun chiffre ne sort de la salle.** |
| 2. Chiffrage interne | 7 au 12 août | Thim construit son kit : coûts, provision d'aléas, marge |
| 3. Proposition | 13 août | Contrat de prestation, devis et modalités financières, **en un seul envoi** |
| 4. Signature | 14 août | Signature et premier versement |
| 5. Engagement | après encaissement | Salle, assurance annulation, technique |

Le devis n'est jamais envoyé seul. Attaché au contrat, il est la traduction chiffrée
d'un périmètre que le client a lui-même validé.

## Ce qui bloque

**À trancher en séance jeudi**, ce sont des questions de périmètre :

1. **Advantage renonce-t-elle à contracter en direct en France sur cette édition ?** Le NDA signé ne dit rien de l'organisateur déclaré, il ne protège que les informations. C'est acté en ouverture de séance, pas débattu.
2. **Les cachets et contrats artistes sont-ils confiés à Thim ?** Ce poste fait basculer le budget du simple au double.
3. **Qui encaisse la billetterie**, et qui fixe la grille tarifaire.
4. Les informations de format : jauge, horaires, site, programmation, exposants, partenaires.

**À confirmer par écrit par le comptable de Thim**, avant le chiffrage :

5. Le **régime de TVA** du forfait (preneur hors UE, événement en France). Un écart de 20 % qui ne se rattrape pas.
6. Le **coefficient de coût employeur** sur les cachets et salaires.

## Trois urgences indépendantes du contrat

- **Assurance annulation à souscrire avant le 15 août.** Au-delà, les assureurs refusent ou surtarifent. C'est la seule protection financière réelle en cas de report.
- **Visas des artistes ivoiriens** : dossiers déposés au plus tard le 25 août, sinon risque opérationnel, pas seulement budgétaire.
- **Budget arrêté et contrat signé au 14 août**, condition de tout le reste. Rien ne s'engage auprès d'un prestataire avant le premier versement.

## Prochaine action

Tenir la session technique de jeudi sur l'ordre du jour de la section 9 du cadre,
en sortir avec les tâches validées, les trois arbitrages tranchés et un porteur nommé
pour chaque chiffre manquant. Rédiger ensuite le contrat de prestation.
