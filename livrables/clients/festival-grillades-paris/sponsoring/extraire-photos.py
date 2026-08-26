# -*- coding: utf-8 -*-
"""Extrait les photos du dossier de presentation d'Advantage Conseils.

Le dossier de sponsoring 2026 d'Advantage contient les photos des editions
precedentes. Plutot que de redemander une phototheque qui mettra des jours a
arriver, on reprend celles qui sont deja dans le PDF, ce qui garantit aussi
qu'on reste dans l'image que le proprietaire du concept donne de lui-meme.

Usage, depuis le dossier sponsoring/ :
    python extraire-photos.py [chemin/du/dossier.pdf]

Sans argument, le script cherche tout PDF du dossier courant dont le nom
contient PRESENTATION ou SPONSORING. Les images sont ecrites dans photos/,
numerotees, et celles de moins de 300 pixels de large sont ignorees : ce sont
des logos ou des elements de mise en page, pas des photographies.
"""
import os
import sys
import glob

try:
    from pypdf import PdfReader
except ImportError:
    raise SystemExit("pypdf manquant. Lancer : python -m pip install pypdf")

ICI = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(ICI, 'photos')
LARGEUR_MINI = 300


def trouver_pdf():
    if len(sys.argv) > 1:
        return sys.argv[1]
    cands = [p for p in glob.glob(os.path.join(ICI, '*.pdf'))
             if any(m in os.path.basename(p).upper()
                    for m in ('PRESENTATION', 'SPONSORING', 'DOSSIER'))]
    if not cands:
        raise SystemExit(
            "Aucun PDF trouve dans %s.\n"
            "Telecharger depuis le Drive d'Advantage le fichier\n"
            "  DOSSIER DE PRESENTATION & SPONSORING FESTIVAL DES GRILLADES 2026.pdf\n"
            "et l'enregistrer dans ce dossier, puis relancer." % ICI)
    return max(cands, key=os.path.getsize)


def main():
    pdf = trouver_pdf()
    print('source :', os.path.basename(pdf))
    os.makedirs(DEST, exist_ok=True)
    lecteur = PdfReader(pdf)
    n, ignorees = 0, 0
    for page_num, page in enumerate(lecteur.pages, 1):
        for img in page.images:
            donnees = img.data
            if len(donnees) < 20000:
                ignorees += 1
                continue
            try:
                from io import BytesIO
                from PIL import Image
                largeur = Image.open(BytesIO(donnees)).width
            except Exception:
                largeur = None
            if largeur is not None and largeur < LARGEUR_MINI:
                ignorees += 1
                continue
            n += 1
            ext = os.path.splitext(img.name)[1] or '.jpg'
            nom = 'p%02d-%02d%s' % (page_num, n, ext)
            with open(os.path.join(DEST, nom), 'wb') as f:
                f.write(donnees)
            print('   %-16s %6d o   %s' % (nom, len(donnees),
                                           ('%d px' % largeur) if largeur else ''))
    print('\n%d image(s) extraite(s), %d ignoree(s) (trop petites).' % (n, ignorees))
    print('Renommer les meilleures en 01-braises.jpg, 02-public.jpg, etc.')
    print('Voir photos/A-DEPOSER-ICI.txt pour la liste attendue.')


if __name__ == '__main__':
    main()
