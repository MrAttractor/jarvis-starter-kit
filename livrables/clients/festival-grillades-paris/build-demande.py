# -*- coding: utf-8 -*-
"""Construit les pages imprimables du dossier de demande de partenariat.

Deux documents : la demande deposee chez le sponsor, et l'autorisation qu'Advantage
Conseils signe et qui s'y joint. Le convertisseur Markdown vient de md2page.py, le
gabarit est celui du dossier, adapte a un document remis a un tiers.

Chaque document declare la ligne a partir de laquelle son corps commence. Tout ce qui
precede reste interne : titre, sous-titre et note de cadrage sont dans l'en-tete ou nulle
part, jamais dans le corps remis a l'entreprise.
"""
import html, os, re, sys
from md2page import convert

# Une adresse, une signature et un bloc de contact se lisent ligne a ligne. Le
# convertisseur du dossier recolle les lignes d'un meme paragraphe, ce qui convient a un
# rapport et pas a un courrier. La barre oblique inverse en fin de ligne, retour a la ligne
# force en Markdown, passe donc par une sentinelle qui traverse la conversion intacte.
SENT = 'xBRETOURx'


def sauts(md):
    return md.replace('\\\n', ' %s\n' % SENT)


def rendu_sauts(corps):
    return re.sub(r'\s*%s\s*' % SENT, '<br />', corps)


def build(src, dst, debut, titre, h1, sous, pied, garder=False):
    """debut : la ligne a partir de laquelle le document est remis au tiers.
    garder=True quand cette ligne fait elle-meme partie du document remis."""
    md = open(src, encoding='utf-8').read()
    if debut not in md:
        sys.exit('%s : la ligne de depart "%s" a disparu du document' % (src, debut))
    reste = md[md.index(debut):] if garder else md.split(debut, 1)[1]
    corps = rendu_sauts(convert(sauts(reste)))
    gab = open(GABARIT, encoding='utf-8').read()
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w', encoding='utf-8').write(
        gab.replace('{{LOGOS}}', os.path.relpath(SORTIE + '/logos', os.path.dirname(dst)))
           .replace('{{TITRE}}', html.escape(titre))
           .replace('{{H1}}', h1)
           .replace('{{SOUS}}', html.escape(sous))
           .replace('{{PIED}}', pied)
           .replace('{{CORPS}}', corps))
    print('ecrit', dst, len(corps), 'octets de corps')

GABARIT = 'gabarit-demande-partenariat.html'
SORTIE = '../demo-site/public/festival-grillades'
H1 = 'Festival des Grillades de Paris, 2<sup>e</sup> édition'

IDENTITE = ("Document remis par <strong>Thim Production</strong>, SASU au capital de 500 "
            "euros, RCS Rennes 953 657 251, 22 rue Charles Duclos, 35000 Rennes, producteur "
            "délégué de l'édition de Paris, agissant pour le compte d'<strong>Advantage "
            "Conseils</strong>, créatrice et productrice du Festival des Grillades.")

PIED_DEMANDE = IDENTITE + ("<br />Cette demande ne constitue pas une offre ferme. Tout "
                           "partenariat est soumis à la validation écrite d'Advantage "
                           "Conseils avant signature.")

PIED_AUTORISATION = ("Pièce jointe à la demande de partenariat pour la 2<sup>e</sup> édition "
                     "parisienne du Festival des Grillades, dimanche 11 octobre 2026, "
                     "12 rue Gutenberg, 93000 Bobigny.<br />Autorisation délivrée au titre de "
                     "l'article 3 du contrat de mandat de production exécutive liant "
                     "<strong>Advantage Conseils</strong> et <strong>Thim Production</strong>.")

if __name__ == '__main__':
    build(
        'DEMANDE-PARTENARIAT-PARIS-2026.md',
        SORTIE + '/demande-partenariat/index.html',
        '## 1. Le courrier',
        'Demande de partenariat',
        H1,
        "Dimanche 11 octobre 2026, 12 rue Gutenberg, 93000 Bobigny. Document remis par Thim Production, producteur délégué, pour le compte d'Advantage Conseils.",
        PIED_DEMANDE)
    build(
        'AUTORISATION-ADVANTAGE-A-THIM-PARTENARIATS.md',
        SORTIE + '/demande-partenariat/autorisation/index.html',
        '**ADVANTAGE CONSEILS** \\',
        'Autorisation de prospection des partenaires',
        H1,
        "Pièce jointe à la demande de partenariat. Advantage Conseils autorise Thim Production à prospecter les partenaires de l'édition de Paris, dans les limites qu'elle fixe.",
        PIED_AUTORISATION,
        garder=True)
