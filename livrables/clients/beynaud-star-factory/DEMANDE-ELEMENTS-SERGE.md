# Ce qu'on demande à Serge

> Établi le 14/09/2026. La plateforme est construite et elle tourne. Ce qui lui manque
> n'est pas du code, c'est **la matière**. Le fil tourne encore sur le jeu de test, et
> les trois « contenus exclusifs » actuels sont visibles par tout le monde sur sa chaîne.
> Tant que c'est vrai, un fan n'a aucune raison de rejoindre.

## Le message à lui envoyer

> Serge, la plateforme est prête et elle tourne. Pour te la montrer avec ton vrai contenu
> dedans et pas avec des exemples, j'ai besoin de six choses de ta part. Rien de
> compliqué, tu as déjà tout.
>
> **1. Un bout de vidéo pour l'accueil.** 10 à 15 secondes où on te voit, toi, filmé en
> hauteur comme pour un statut WhatsApp. C'est la première image que voit un fan quand il
> ouvre. Aujourd'hui c'est un extrait du clip de Mariam, et on ne t'y voit pas.
>
> **2. Huit à dix photos jamais publiées.** Coulisses, studio, avant de monter sur scène,
> en famille si tu veux. Ce qui ne va pas sur Instagram.
>
> **3. Deux ou trois vidéos qu'on ne trouve nulle part ailleurs.** C'est le cœur. Un
> morceau en cours, une répétition, un message pour les fans. Si tout ce qui est sur la
> plateforme est déjà sur YouTube, personne n'a de raison de s'inscrire.
>
> **4. Un mot de bienvenue, 30 secondes face caméra.** Tu dis bonjour aux Fami et tu
> expliques avec tes mots ce que c'est. C'est la première publication qu'ils voient.
>
> **5. Les vrais noms de tes deux séries.** Elles s'appellent encore « Série exclusive 1 »
> et « Série exclusive 2 » sur la plateforme.
>
> **6. La date de ton prochain concert.** Pour caler le direct et te chiffrer ce que ça
> coûte de le diffuser en payant sur ton site, comme tu me l'as demandé.
>
> Tu m'envoies tout ça comme tu veux, WhatsApp ou un lien de transfert. Je monte et je te
> montre. Tant que le protocole n'est pas signé, ça n'engage ni toi ni moi.

## Les détails techniques, pour nous

| Élément | Format | Pourquoi |
|---|---|---|
| Clip d'accueil | MP4 **vertical** (9/16), 10 à 15 s, 720p, **sans texte incrusté** | Le texte se coupe au recadrage. 1 à 2 Mo, servi par Cloudflare, bande passante non facturée. Bascule d'une ligne : `source : 'mp4'` dans `fan.html` |
| Photos | JPEG, plus grand côté ≥ 1600 px | Recompressées à 1280 px à l'envoi par le tableau de bord |
| Vidéos exclusives | YouTube non listé pour la démo | Hébergement définitif à trancher, voir plus bas |
| Mot de bienvenue | Vidéo verticale ou simple texte | Se publie depuis son tableau de bord |
| Titres des séries | Texte | Se corrige maintenant depuis le tableau de bord (bouton Modifier) |
| Date du concert | Date | Conditionne le chiffrage de l'offre « Concerts » |

**Le point non tranché : où vivent les vidéos vraiment exclusives.** YouTube non listé
reste accessible à qui a le lien, donc l'exclusivité y est de façade. **Cloudflare R2** est
la bonne réponse le jour où on y va : bande passante sortante non facturée, adresses
signables. Décision de Mac Arthur du 13/09 : **on n'y va pas avant que le protocole soit
signé.** Pour la démo, YouTube non listé suffit.

## Ce qui reste à obtenir par ailleurs, hors contenu

Pour compléter le protocole avant signature : la qualité du représentant de STAR FACTORY,
le RCCM, les coordonnées officielles, et le montant de l'indemnité forfaitaire de
non-contournement. Voir `DOSSIER.md`.
