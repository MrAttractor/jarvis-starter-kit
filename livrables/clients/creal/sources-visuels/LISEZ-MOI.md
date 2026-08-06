# Visuels sources C'Real

Les affiches produits en pleine définition (3600 × 6000 px, environ 9 Mo chacune).

Elles **ne sont pas déployées sur le site** : la boutique sert des versions
recadrées à 900 × 1500 px, environ 200 Ko, dans
`livrables/clients/demo-site/public/creal/imgs/`.

Servies telles quelles, ces six images représentaient 56 Mo sur la page
d'accueil, ce qui rendait la boutique inutilisable en 3G et brûlait le forfait
des clientes. Elles restent ici parce qu'elles servent aux posts réseaux et à
l'impression, où la définition compte.

## Refabriquer les versions web

Si une affiche est remplacée, régénérer sa version web avant de déployer :

```python
from PIL import Image
im = Image.open("mix.png")
im.thumbnail((900, 1500), Image.LANCZOS)
im.save("mix.jpg", "JPEG", quality=82, optimize=True, progressive=True)
```

Puis copier le `.jpg` dans `demo-site/public/creal/imgs/`.
Le nom de fichier doit rester identique, il est référencé dans `index.html`.
