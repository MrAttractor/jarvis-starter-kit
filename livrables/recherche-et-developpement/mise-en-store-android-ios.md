# Mise en store Android et iOS — note de référence

> R&D du 14/08/2026. Premier cas d'étude : La Beynaumania.
> **Cette note fait foi pour toute demande de « mettre l'app sur les stores ».**
> Elle sert deux choses : décider si on y va, et chiffrer quand on y va.

---

## 1. Ce que cette note règle

Trois questions reviennent dès qu'un client demande à être sur les stores :

1. Est-ce que son modèle économique survit aux règles d'Apple et de Google ?
2. Combien de travail réel, et avec quels délais externes ?
3. Combien on le vend ?

L'ordre est important. La question 1 tue le projet dans la moitié des cas, et elle se
traite avant d'écrire une ligne de code. C'est la règle **R-31** du cerveau : sur toute
intégration qui dépend d'une validation externe, on teste la dernière étape en premier.
Ici, la dernière étape n'est pas la mise en ligne, c'est **l'encaissement**.

---

## 2. La règle qui décide de tout

Apple et Google appliquent la même ligne de partage, et elle ne se négocie pas.

| Ce qu'on vend | Règle | Qui encaisse | Commission |
|---|---|---|---|
| Contenu numérique consommé **dans** l'app : série exclusive, replay, live payant, abonnement, badge, bon d'achat numérique | **Achat intégré obligatoire** | Apple ou Google | 15 % sous 1 M$/an, 30 % au-delà |
| Bien ou service consommé **hors** de l'app : billet de concert physique, marchandise, livraison, prestation réelle | Achat intégré **interdit** | Le client, par son propre moyen de paiement | 0 % |

Deux pièges à connaître par cœur :

- **Un bon d'achat numérique reste du numérique.** Vendre un « code » qui débloque du contenu
  dans l'app ne contourne rien, Apple l'a explicitement fermé.
- **L'anti-steering.** Hors des États-Unis, une app iOS n'a pas le droit de renvoyer
  l'utilisateur vers un paiement sur le web, ni même de le mentionner. On ne peut donc pas
  « garder XPaye et mettre juste un lien ». Sur Android, la situation est plus souple mais
  dépend du pays et du dispositif de facturation alternative retenu, donc à revalider au cas
  par cas plutôt qu'à supposer.

---

## 3. Le fait mesuré le 14/08/2026, et il est décisif pour la Côte d'Ivoire

Vérification faite sur les pages officielles :

| Point vérifié | Résultat |
|---|---|
| Compte développeur Google Play depuis la Côte d'Ivoire | **Possible**, développeur et marchand, devise de règlement USD |
| Compte développeur Google Play depuis la France | **Possible**, développeur et marchand, devise EUR |
| Moyens de paiement acceptés **par l'acheteur** sur Google Play en Côte d'Ivoire | **Cartes bancaires internationales uniquement** (Visa, Mastercard, Amex, Discover). Ni Mobile Money, ni facturation opérateur Orange, MTN ou Moov |
| App Store disponible en Côte d'Ivoire | Oui depuis 2020 |
| Inscription au programme développeur Apple **depuis** la Côte d'Ivoire | Incertain, et des cartes ivoiriennes sont refusées côté Apple. **Passer par l'entité française de l'agence** |

**La conclusion qui compte :** dans un marché où le Mobile Money domine largement,
l'achat intégré est un mur de paiement. Mettre du contenu payant derrière l'achat intégré
en Côte d'Ivoire, c'est le réserver aux porteurs de carte internationale, une minorité.
Une app sur les stores peut donc **convertir moins bien que la PWA actuelle**, tout en
prélevant 15 à 30 %.

> **Règle proposée au cerveau (R-71) : sur un marché Mobile Money, l'achat intégré est un
> mur de paiement, pas un canal de vente.** Le store sert alors la notoriété et la
> distribution, jamais l'encaissement du contenu numérique. La monétisation reste sur le web,
> où Wave et Orange Money fonctionnent.

---

## 4. La doctrine agence qui en découle

Trois montages, à choisir selon ce que le client vend.

### Montage A — App gratuite, monétisation hors app (le défaut)

L'app ne vend aucun contenu numérique. On y met la communauté, le contenu gratuit, les
notifications, la fidélité. Ce qui se vend est un bien ou un service réel (billet de concert
physique, produit, prestation), donc **encaissable par XPaye, Wave ou Orange Money sans
commission de store**.

C'est le montage à recommander par défaut sur la cible CI et diaspora. Il préserve le
partenariat XPaye et évite le mur de paiement.

### Montage B — Achat intégré assumé

On accepte les 15 à 30 % parce que la cible est solvable en carte bancaire (diaspora en
France, clientèle premium). Le contenu numérique se vend dans l'app, proprement.
Cas typique : une audience majoritairement européenne.

### Montage C — Deux surfaces séparées

L'app store porte le gratuit et la notoriété, le web (PWA) porte le payant. C'est le
montage le plus fréquent en pratique, mais il impose de ne **jamais** renvoyer vers le web
depuis l'app iOS, sous peine de rejet.

---

## 5. Les trois voies techniques

| Voie | Pour qui | Ce que c'est | Charge réelle |
|---|---|---|---|
| **A. TWA** (PWABuilder ou Bubblewrap) | Android seul | La PWA empaquetée telle quelle. Fichier `assetlinks.json` sur le domaine, score Lighthouse ≥ 80. Voie officielle Google | **1 à 2 jours**, aucun code réécrit |
| **B. Capacitor** | iOS et Android | Le même code HTML/CSS/JS dans une coque native, plus de vraies capacités natives (push, partage, hors ligne, achat intégré) | **5 à 8 jours** la première fois, moins ensuite |
| **C. Natif complet** | Personne, chez nous | Réécriture Swift ou Kotlin | Hors modèle d'agence |

**Point matériel important :** Apple exige macOS pour compiler et envoyer. Mac Arthur est sur
Windows. **Ce n'est pas bloquant** : un service d'intégration en nuage (Codemagic, ou les
exécuteurs macOS de GitHub Actions) fait la compilation et l'envoi. Pas de Mac à acheter.

**Attention voie B sur iOS :** une simple enveloppe de site web est refusée au titre de la
règle 4.2 sur la fonctionnalité minimale. Il faut de vraies fonctions natives, ce n'est pas
optionnel.

---

## 6. Procédé Google Play, dans l'ordre

1. **Créer le compte développeur.** 25 dollars, une seule fois. Vérification d'identité.
2. **Choisir le type de compte, c'est ce qui commande le calendrier :**

| | Compte personnel | Compte organisation |
|---|---|---|
| Testeurs exigés | **12 testeurs inscrits pendant 14 jours consécutifs** avant de demander l'accès production. Le compteur démarre à l'inscription du douzième | Aucun |
| Prérequis | Pièce d'identité | **Numéro D-U-N-S** obligatoire, 14 à 30 jours ouvrés à l'international, et une entreprise individuelle sans entité juridique distincte échoue souvent la vérification |
| Quand le choisir | Client qui a du public sous la main (cas d'un artiste) | Structure constituée, ou app financière, santé, VPN, administration, où le compte organisation est imposé |

3. **Empaqueter** (voie A ou B), signer, déposer `assetlinks.json` sur le domaine.
4. **Test fermé**, puis demande d'accès à la production.
5. **Fiche du store** : description, captures, icône, politique de confidentialité en ligne
   (obligatoire), questionnaire sur la sécurité des données, classification de contenu.
6. **Publication.** Compter quelques jours de contrôle, plus long au premier dépôt.

---

## 7. Procédé Apple, dans l'ordre

1. **Apple Developer Program**, 99 dollars **par an**. Individu (pièce d'identité) ou
   organisation (D-U-N-S plus entité légale).
2. **Créer la fiche** dans App Store Connect, identifiants, certificats, profils.
3. **Compiler et envoyer** via le service en nuage.
4. **TestFlight** pour la recette interne.
5. **Contrôle Apple** : 24 à 48 heures en général, mais **le premier passage est très
   souvent refusé**. Prévoir deux à trois allers-retours.

---

## 8. Checklist des rejets, à traiter dans le code AVANT de soumettre

Ce sont les motifs qui nous concernent réellement, vu ce qu'on construit.

| Règle | Ce qu'elle exige | À vérifier chez nous |
|---|---|---|
| **5.2.1 Propriété intellectuelle** | Une app au nom d'une personne ou d'une marque exige une **preuve d'autorisation écrite** | Bloquant sur tout dossier artiste ou marque tierce |
| **5.1.1 (v) Suppression de compte** | Si l'app crée un compte, elle doit permettre de le **supprimer depuis l'app**, pas par email | Manque sur nos apps à inscription simple |
| **1.2 Contenu publié par les utilisateurs** | Filtre, bouton **signaler**, possibilité de **bloquer un utilisateur**, moyen de contact | On a le filtre et le masquage. Signalement et blocage souvent absents |
| **4.2 Fonctionnalité minimale** | Une enveloppe de site web est refusée | Impose la voie B sur iOS |
| **3.1.1 Achat intégré** | Voir section 2 | Décide du montage A, B ou C |
| **Confidentialité** | Politique en ligne accessible, et déclaration exacte des données collectées | À produire pour chaque app |

---

## 9. Grille de chiffrage proposée

Cohérente avec `bareme.md`, à valider par Mac Arthur avant tout devis (règle R-04).

| Prestation | Prix proposé | Contenu |
|---|---|---|
| **Mise en store Android** (voie A) | **230 000 FCFA / 350 €** `[À VALIDER]` | Empaquetage TWA, fiche du store, captures, politique de confidentialité, dépôt, accompagnement du test fermé |
| **Mise en store iOS + Android** (voie B) | **790 000 FCFA / 1 200 €** `[À VALIDER]` | Coque Capacitor, fonctions natives exigées par Apple, chaîne de compilation en nuage, les deux fiches, les allers-retours de contrôle |
| **Achat intégré** (StoreKit ou Play Billing) | **330 000 FCFA / 500 €** `[À VALIDER]` | Uniquement en montage B. Produits, restauration d'achat, vérification côté serveur |
| **Maintenance store** | **100 000 FCFA / 150 € par an** `[À VALIDER]` | Montées de version obligatoires, sinon retrait de l'app. Distinct du MRR d'hébergement |

**Frais de tiers, refacturés au réel et au nom du client** (comme les domaines) :
Google 25 dollars une fois, Apple **99 dollars par an**. À dire au client dès le devis,
sinon il croit que l'app reste en ligne gratuitement.

**Ce qu'on ne vend jamais sans l'avoir vérifié :** un délai de publication. Le contrôle
Apple et l'accès production Google ne dépendent pas de nous. On s'engage sur le dépôt,
jamais sur la date de mise en ligne.

---

## 10. Application au cas Beynaud

**Modèle actuel :** adhésion gratuite, puis trois sources payantes en one-shot XPaye,
événements payants, série spéciale payante, replays de concert payants.

**Ce que les règles en font :**

| Source | Verdict |
|---|---|
| Billet de concert physique | Exempt, XPaye reste dans le circuit |
| Série spéciale payante | Contenu numérique, achat intégré obligatoire |
| Replay de concert | Contenu numérique, achat intégré obligatoire |
| Événement en ligne payant | Contenu numérique, achat intégré obligatoire |

Deux sources sur trois basculent, et elles basculent vers un moyen de paiement que le public
ivoirien n'a majoritairement pas. **Montage A recommandé**, avec la monétisation numérique
laissée sur le web.

**Ce qui bloque avant même la technique :** le protocole d'accord STAR FACTORY n'est pas
signé (Latiss relancé le 10/08, sans réponse). Or il faut une autorisation écrite d'usage du
nom et de l'image pour passer la règle 5.2.1, et il faut trancher **à qui appartient le
compte développeur**, parce que celui qui le détient détient l'app, les avis, les
statistiques et les versements. Engager 5 à 8 jours plus 99 dollars par an sur un
partenariat non contractualisé va contre la règle **R-09**.

**Séquence recommandée :**

1. Protocole signé, avec la clause de propriété du compte développeur.
2. Corriger les trois manques du code : suppression de compte, signalement, blocage.
3. Android seul, voie A, app gratuite. Deux jours, 25 dollars.
4. iOS plus tard, seulement si le volume le justifie.

---

## 11. Le meilleur premier cas payant n'est pas Beynaud

**Club Élévia.** La V2 stores est déjà écrite comme hors périmètre à chiffrer, la cliente a
un budget, ses tables sont isolées, et son audience est en partie européenne donc solvable
en carte bancaire (montage B viable). C'est le dossier sur lequel construire le gabarit
d'agence en le faisant payer.

---

## 12. Ce qui reste incertain, et qu'il faudra vérifier au moment d'y aller

- Le dispositif exact de facturation alternative de Google et son autorisation de renvoi vers
  un paiement externe, pays par pays. Les règles ont bougé en 2025 et 2026 après les
  décisions de justice, elles bougeront encore.
- L'inscription au programme Apple depuis la Côte d'Ivoire, à confirmer auprès du support
  Apple si un client ivoirien veut son propre compte.
- Le seuil et le délai de versement de Google vers un compte ivoirien en USD.

**Ne jamais reprendre ces trois points de mémoire dans un devis. On revérifie.**

---

## Sources

- [Play Console, exigences de test des nouveaux comptes personnels](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Play Console, choisir un type de compte développeur](https://support.google.com/googleplay/android-developer/answer/13634885?hl=en)
- [Play Console, lieux supportés pour l'enregistrement développeur et marchand](https://support.google.com/googleplay/android-developer/answer/9306917?hl=en)
- [Google Play, moyens de paiement acceptés](https://support.google.com/googleplay/answer/2651410)
- [App Review Guidelines, Apple](https://developer.apple.com/app-store/review/guidelines/)
- [Apple, mise à jour des règles après l'injonction Epic](https://developer.apple.com/news/?id=3ozbk628)
- [Trusted Web Activities, Android Developers](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2)
- [Publier une PWA sur les stores, état des lieux 2026](https://www.mobiloud.com/blog/publishing-pwa-app-store)
