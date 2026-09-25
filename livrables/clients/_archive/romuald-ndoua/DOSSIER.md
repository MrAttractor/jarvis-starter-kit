# ML Ads / Romuald Ndoua — l'état du dossier

> Révision du 02/08/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | à trancher |
| Dernier contact | 2026-08-02 |
| Prochaine action | Clarifier le deal avant d'y remettre du temps, et demander le lien exact mis dans sa publicité |
| Échéance | — |
| Argent en attente | rien de tracé |

## En une phrase

Landing et assistante IA en ligne depuis le 14/07, **trafic mesuré depuis le 02/08**.
**La landing reste à refondre**, et aucun montant n'est tracé.

## Le client

**Romuald Ndoua**, activité **ML Ads** : il loue des comptes publicitaires Meta d'agence
à des annonceurs, avec un accompagnement.

**Le modèle** : location en FCFA + **commission dégressive sur les recharges** de compte
publicitaire. Les niches acceptées sont volontairement restreintes, et c'est assumé :
c'est ce qui protège les comptes.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Landing + assistante IA | `demo.agenceattractor.com/romuald-ndoua` |

Source dans ce dossier (`assistant-demo.html`, `assistant-v2.html`), migration dans
`supabase/`.

## L'assistante « Naïma », et sa règle de conduite

Elle est **consultative et honnête, et elle protège Romuald** : elle qualifie, elle
explique les niches refusées, elle ne promet pas de résultats publicitaires. C'est un
choix de fond, pas un détail de ton. Toute évolution de son prompt doit le préserver.

## La mesure du trafic (02/08/2026)

**Le constat qui l'a déclenchée** : au 02/08, `rom_leads` était **vide**, et rien d'autre
n'était enregistré. Une conversation ne laissait une trace que si elle allait jusqu'au
numéro WhatsApp. Impossible, donc, de dire si la campagne publicitaire dont parle Romuald
a amené du monde ou pas.

Depuis, chaque visiteur crée une ligne dans `rom_conversations` et l'entonnoir complet est
visible dans son admin : **visite → ouverture du chat → messages écrits → numéro laissé**,
avec la **source** (publicité Meta, lien de campagne, site référent, direct) et la
**question d'entrée** de chaque personne.

Ce qui est stocké : un identifiant aléatoire gardé sur l'appareil du visiteur, la source,
et les messages que la personne écrit elle-même dans le chat. **Pas de cookie tiers, pas
d'adresse IP, aucun recoupement.** La source retenue est celle du **premier passage** :
une pub reste attribuée à la pub même si la personne revient en direct plus tard.

Ce que ça ne remplace pas : **il n'y a toujours aucun pixel Meta sur la landing**, donc
Meta ne reçoit aucun événement de conversion et les campagnes ne peuvent pas s'optimiser
sur les vrais leads. C'est la brique suivante, et elle demande le pixel de Romuald.

## L'argent

**Rien n'est tracé** : ni devis, ni montant, ni contrepartie écrite. À clarifier avant
d'investir plus de temps sur ce dossier.

## Prochaine action

1. **Lui demander le lien exact mis dans sa publicité** : si elle ne pointait pas sur la landing, les 0 leads ne prouvent rien contre le site. Demander aussi une capture du gestionnaire de pub (dates, budget, impressions, clics, destination).
2. **Clarifier le deal** : est-ce une prestation facturée, un partenariat d'apport d'affaires, ou une commission sur les recharges ? Rien n'est écrit.
3. **Poser son pixel Meta** sur la landing, avec un événement de conversion au moment où Naïma capte un numéro.
4. **Refondre la landing**, identifié depuis le 14/07 et jamais fait
5. Utiliser `TRAME-APPEL-ROMUALD.md` pour cadrer l'échange
