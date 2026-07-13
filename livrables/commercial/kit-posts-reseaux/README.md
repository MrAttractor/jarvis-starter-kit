# Kit posts réseaux — Mr Attractor (FB + IG)

Générateur de visuels de posts sur la charte du site (Sora + Space Mono, orange #F25C05 / charbon / sable). Tu remplis, tu télécharges le PNG, tu programmes dans Meta Business Suite. Zéro Canva, zéro dépendance à quelqu'un.

## Comment l'utiliser

1. Ouvre **`generateur.html`** dans ton navigateur (double-clic).
2. Choisis le **format** (Feed 4:5 / Carré 1:1 / Story 9:16 / Bannière), le **thème** (Sombre / Clair), le **modèle** (Accroche / Offre / Preuve / Téléphone).
3. Remplis le texte. Le champ "Mot(s) en orange" met en accent une partie du titre.
4. Charge ton **image** : en fond plein cadre (modèles texte), ou dans l'écran du téléphone (modèle Téléphone → mets une capture verticale du site d'un client). Sans image, un dégradé de marque est utilisé.
5. Clique **Télécharger le PNG**.
6. Va dans **Meta Business Suite → Planificateur**, ajoute le PNG, écris la légende, programme. FB + IG en une fois.

## Les 4 modèles

- **Accroche** : une idée forte (titre énorme + sous-titre). Pour capter.
- **Offre** : un service avec prix + points inclus + bouton. Pour vendre.
- **Preuve** : une citation / un résultat client. Pour rassurer.
- **Téléphone** : un mockup de téléphone montrant le vrai site d'un client (upload une capture verticale), accroche à côté. Pour prouver le savoir-faire.

## Charte

Sora (titres) + Space Mono (labels), sur la charte du site : orange #F25C05 (primaire) + **vert** #3DDC84 en accent (tiret du kicker, trait bicolore, points). Le vert (rappel du drapeau ivoirien) est volontaire : il démarque la marque du télécom Orange CI.

## Presets par URL (bonus)

- Config directe : `generateur.html?format=banner&theme=sombre&model=telephone`.
- Export propre sans le panneau (pour capture pleine page) : ajoute `&shot=1`.

## Notes

- Les images peuvent venir de tes photos, de Magnific (IA), de captures de sites clients, ou d'autres illustrations. `fond-01.jpg` est un exemple généré.
- Le PNG sort en pleine résolution. Le téléchargement utilise html2canvas (nécessite une connexion internet pour charger la librairie et les polices).
- Exemples de rendu : `exemple-01-accroche.png` et `exemple-02-telephone.png`.
