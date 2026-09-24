# -*- coding: utf-8 -*-
"""Deck de proposition d'approche pour ETHSUN Institute, a l'attention de
Jean-Calvin Ethien.

Perimetre volontairement limite : ce deck vend UNE APPROCHE, il ne livre aucun
contenu pedagogique. Pas de bibliotheque d'instructions, pas de methode de
calcul, pas de support d'animation. Ces actifs restent chez l'agence jusqu'a
signature du protocole (regle d'ordre de marche du DOSSIER.md ETHSUN).

Aucun chiffre d'economie du partenariat n'y figure non plus : decision de
Mac Arthur du 10/08/2026, l'economie se traite en reunion, pas par ecrit.

Charte : orange signature, vert en accent seul, charbon, sable
(livrables/ecosysteme-attractor/attractor-assists/design-system.md).
Aucun emoji, aucune icone importee : les reperes visuels sont traces en formes
natives (R-42). Contraste verifie par controle_contraste() avant rendu (R-24).
"""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Cm, Pt

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'livrables/clients/ethsun/DECK-APPROCHE-OUTIL-ETHSUN.pptx'

ORANGE = RGBColor(0xF2, 0x5C, 0x05)
ORANGE_CLAIR = RGBColor(0xFF, 0x7A, 0x2E)
VERT = RGBColor(0x1E, 0x56, 0x31)
CHARBON = RGBColor(0x1A, 0x17, 0x14)
ENCRE = RGBColor(0x2A, 0x25, 0x21)
GRIS = RGBColor(0x6A, 0x63, 0x5B)
SABLE = RGBColor(0xFA, 0xF6, 0xF0)
SABLE_FONCE = RGBColor(0xE7, 0xE1, 0xD8)
BLANC = RGBColor(0xFF, 0xFF, 0xFF)

L, H = Cm(33.87), Cm(19.05)          # 16:9
MARGE = Cm(2.2)
UTILE = L - 2 * MARGE


# --------------------------------------------------------------- contraste
def _lum(c):
    def canal(v):
        v = v / 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2])


def ratio(a, b):
    la, lb = _lum(a), _lum(b)
    clair, sombre = max(la, lb), min(la, lb)
    return (clair + 0.05) / (sombre + 0.05)


def controle_contraste():
    """Aucune paire texte/fond du deck ne descend sous 4.5:1 (corps) ni 3:1
    (grands titres). Un ecart se signale ici, pas a la lecture du client."""
    paires = [
        ('titre couverture', BLANC, CHARBON, 3.0),
        ('sous-titre couverture', SABLE_FONCE, CHARBON, 4.5),
        ('orange sur charbon', ORANGE_CLAIR, CHARBON, 3.0),
        ('corps sur sable', ENCRE, SABLE, 4.5),
        ('gris sur sable', GRIS, SABLE, 4.5),
        ('titre sur sable', CHARBON, SABLE, 4.5),
        ('blanc sur orange', BLANC, ORANGE, 3.0),
        ('blanc sur vert', BLANC, VERT, 4.5),
        ('corps sur sable fonce', ENCRE, SABLE_FONCE, 4.5),
    ]
    defauts = []
    for nom, texte, fond, mini in paires:
        r = ratio(texte, fond)
        if r < mini:
            defauts.append('%s : %.2f:1 (minimum %.1f)' % (nom, r, mini))
    return defauts


# ------------------------------------------------------------------ briques
def fond(slide, couleur):
    f = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, L, H)
    f.fill.solid()
    f.fill.fore_color.rgb = couleur
    f.line.fill.background()
    f.shadow.inherit = False
    slide.shapes._spTree.remove(f._element)
    slide.shapes._spTree.insert(2, f._element)
    return f


def mesure(texte, largeur, taille, interligne=1.25, gras=False):
    """Hauteur reellement occupee par un bloc de texte, en EMU.

    Les hauteurs devinees a l'oeil produisent du texte sur texte : trois pages
    du premier rendu se chevauchaient. On estime donc le nombre de lignes apres
    retour a la ligne, puis on empile a partir de cette mesure (R-23).

    Largeur moyenne d'un caractere en Calibri : environ 0,48 em, 0,50 en gras.
    Marge de securite de 8 % sur la hauteur retournee.
    """
    largeur_pt = largeur / 12700.0
    par_ligne = max(8, int(largeur_pt / (taille * (0.50 if gras else 0.48))))
    lignes = 0
    for paragraphe in texte.split('\n'):
        if not paragraphe.strip():
            lignes += 1
            continue
        mots, courante = paragraphe.split(' '), ''
        compte = 1
        for mot in mots:
            essai = mot if not courante else courante + ' ' + mot
            if len(essai) <= par_ligne:
                courante = essai
            else:
                compte += 1
                courante = mot
        lignes += compte
    return Pt(lignes * taille * interligne * 1.20 * 1.08)


def bloc(slide, x, y, w, h, texte, taille, couleur, gras=False, italique=False,
         align=PP_ALIGN.LEFT, interligne=1.25, espace=Pt(0)):
    zone = slide.shapes.add_textbox(x, y, w, h)
    tf = zone.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    lignes = texte.split('\n')
    for i, ligne in enumerate(lignes):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = interligne
        p.space_after = espace
        run = p.add_run()
        run.text = ligne
        run.font.size = Pt(taille)
        run.font.bold = gras
        run.font.italic = italique
        run.font.color.rgb = couleur
        run.font.name = 'Calibri'
    return zone


def poser(slide, x, y, w, texte, taille, couleur, ecart=Cm(0.35), **kw):
    """Pose un bloc a la hauteur qu'il occupe reellement, et rend le y suivant."""
    h = mesure(texte, w, taille, kw.get('interligne', 1.25), kw.get('gras', False))
    bloc(slide, x, y, w, h, texte, taille, couleur, **kw)
    return y + h + ecart


def filet(slide, x, y, largeur, couleur=ORANGE, epaisseur=Cm(0.10)):
    f = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, largeur, epaisseur)
    f.fill.solid()
    f.fill.fore_color.rgb = couleur
    f.line.fill.background()
    f.shadow.inherit = False
    return f


def pastille(slide, x, y, diametre, texte, fond_c, texte_c):
    p = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, diametre, diametre)
    p.fill.solid()
    p.fill.fore_color.rgb = fond_c
    p.line.fill.background()
    p.shadow.inherit = False
    tf = p.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    par = tf.paragraphs[0]
    par.alignment = PP_ALIGN.CENTER
    run = par.add_run()
    run.text = texte
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = texte_c
    run.font.name = 'Calibri'
    return p


def carte(slide, x, y, w, h, couleur=BLANC, bordure=SABLE_FONCE):
    c = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    c.fill.solid()
    c.fill.fore_color.rgb = couleur
    c.line.color.rgb = bordure
    c.line.width = Pt(0.75)
    c.shadow.inherit = False
    c.adjustments[0] = 0.04
    c.text_frame.text = ''
    return c


def page(prs, couleur=SABLE):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    fond(slide, couleur)
    return slide


def titre_page(slide, surtitre, titre, couleur_titre=CHARBON):
    bloc(slide, MARGE, Cm(1.5), UTILE, Cm(0.8), surtitre.upper(), 10.5, ORANGE,
         gras=True)
    bloc(slide, MARGE, Cm(2.25), UTILE, Cm(2.0), titre, 26, couleur_titre,
         gras=True, interligne=1.1)
    filet(slide, MARGE, Cm(3.55), Cm(3.4))


def pied(slide, numero):
    bloc(slide, MARGE, H - Cm(1.35), UTILE - Cm(2), Cm(0.6),
         'Mr Attractor  ·  proposition d’approche  ·  Sprint IA Tourisme et Loisirs',
         8, GRIS)
    bloc(slide, L - MARGE - Cm(2), H - Cm(1.35), Cm(2), Cm(0.6), str(numero), 8,
         GRIS, align=PP_ALIGN.RIGHT)


# ------------------------------------------------------------------- pages
def couverture(prs):
    slide = page(prs, CHARBON)
    filet(slide, MARGE, Cm(4.4), Cm(4.6), ORANGE, Cm(0.14))
    bloc(slide, MARGE, Cm(3.1), UTILE, Cm(0.8),
         'ETHSUN INSTITUTE  ·  SPRINT IA SECTORIEL  ·  TOURISME ET LOISIRS',
         11, ORANGE_CLAIR, gras=True)
    bloc(slide, MARGE, Cm(5.5), Cm(24), Cm(4.4),
         'Faire du Sprint\nun outil, pas un cours',
         46, BLANC, gras=True, interligne=1.05)
    bloc(slide, MARGE, Cm(10.6), Cm(21), Cm(3.2),
         'Le participant arrive avec ses propres données d’exploitation, il repart\n'
         'avec sa feuille de route générée depuis ses chiffres. La théorie ne sert\n'
         'plus à annoncer ce qui serait possible, elle explique ce qu’il vient de voir.',
         14.5, SABLE_FONCE, interligne=1.5)
    filet(slide, MARGE, Cm(14.6), UTILE, RGBColor(0x3A, 0x33, 0x2C), Cm(0.03))
    bloc(slide, MARGE, Cm(15.2), Cm(16), Cm(2),
         'Proposition d’approche soumise à Jean-Calvin Ethien\n'
         'Mac Arthur N’Guessan Kouassi  ·  agence Mr Attractor  ·  27 août 2026',
         11, GRIS, interligne=1.5)


def promesse(prs, n):
    slide = page(prs)
    titre_page(slide, 'Le point de départ',
               'La promesse est déjà écrite dans votre catalogue')
    c = carte(slide, MARGE, Cm(4.9), UTILE, Cm(4.4), BLANC)
    filet(slide, MARGE, Cm(4.9), Cm(0.12), VERT, Cm(4.4))
    bloc(slide, MARGE + Cm(0.9), Cm(5.6), UTILE - Cm(1.8), Cm(2.6),
         '« À l’issue du programme, chaque participant développe un Plan d’Action IA\n'
         'pour Opérateurs Touristiques personnalisé : une feuille de route IA adaptée\n'
         'à l’établissement ou à la destination. »',
         14.5, ENCRE, italique=True, interligne=1.45)
    bloc(slide, MARGE + Cm(0.9), Cm(8.6), UTILE - Cm(1.8), Cm(0.6),
         'Brochure ETHSUN, Sprint IA Tourisme et Loisirs, livrable final',
         9.5, GRIS)

    bloc(slide, MARGE, Cm(10.0), UTILE, Cm(1.2),
         'La question n’est donc pas d’ajouter une promesse. Elle est de savoir '
         'comment celle-ci est tenue en deux jours.',
         17, CHARBON, gras=True, interligne=1.35)

    textes = [
        ('Si elle est tenue par un modèle',
         'Le participant repart avec un document à remplir chez lui. '
         'Il ne le remplira pas. Le Sprint est jugé sur ce qu’il n’a pas produit.'),
        ('Si elle est tenue par un outil',
         'Le plan sort rempli de ses propres chiffres à la fin du deuxième jour. '
         'La promesse du catalogue devient vérifiable devant lui.'),
    ]
    largeur = (UTILE - Cm(0.9)) / 2
    for i, (titre, corps) in enumerate(textes):
        x = MARGE + i * (largeur + Cm(0.9))
        couleur = SABLE_FONCE if i == 0 else BLANC
        carte(slide, x, Cm(11.9), largeur, Cm(4.2), couleur)
        filet(slide, x, Cm(11.9), largeur, GRIS if i == 0 else ORANGE, Cm(0.10))
        bloc(slide, x + Cm(0.8), Cm(12.7), largeur - Cm(1.6), Cm(0.8), titre,
             14, CHARBON if i else GRIS, gras=True)
        bloc(slide, x + Cm(0.8), Cm(13.7), largeur - Cm(1.6), Cm(2.1), corps,
             12.5, ENCRE if i else GRIS, interligne=1.4)
    pied(slide, n)


def risque(prs, n):
    slide = page(prs)
    titre_page(slide, 'Ce qu’il faut regarder en face',
               'Le marché ivoirien a déjà été formé, gratuitement')
    colonne = Cm(19.5)
    y = poser(slide, MARGE, Cm(4.6), colonne,
              'En octobre 2025, la direction en charge de la digitalisation au '
              'ministère du Tourisme a formé 120 opérateurs touristiques ivoiriens '
              'à l’intelligence artificielle et au marketing digital. Deux jours. '
              'Sans frais.',
              14, ENCRE, ecart=Cm(0.45), interligne=1.5)
    y = poser(slide, MARGE, y, colonne,
              'Ce n’est pas une mauvaise nouvelle. Un public déjà sensibilisé n’a '
              'plus besoin d’être convaincu que le sujet le concerne, et c’est du '
              'temps gagné.',
              14, ENCRE, ecart=Cm(0.6), interligne=1.5)

    x = MARGE + Cm(20.7)
    carte(slide, x, Cm(4.9), Cm(8.8), Cm(3.8), CHARBON, CHARBON)
    yc = poser(slide, x + Cm(0.8), Cm(5.4), Cm(7.2), '120', 36, ORANGE_CLAIR,
               gras=True, ecart=Cm(0.15))
    poser(slide, x + Cm(0.8), yc, Cm(7.2),
          'opérateurs touristiques déjà\nformés, sans frais, en 2025',
          11, SABLE_FONCE, interligne=1.35)

    y = poser(slide, MARGE, y, UTILE,
              'Le risque n’est pas de reprendre les mêmes thèmes.\n'
              'Le risque est de les reprendre au même niveau.',
              20, CHARBON, gras=True, ecart=Cm(0.55), interligne=1.3)

    texte = ('Une sensibilisation collective fait découvrir, elle n’installe rien. '
             'Un Sprint payant à 488 € doit donc produire ce que la formation '
             'gratuite ne produit pas : non pas un autre discours, mais un objet '
             'construit sur les chiffres réels du participant, et qu’il utilise '
             'le lundi matin.')
    hauteur = mesure(texte, UTILE - Cm(1.8), 13, 1.5) + Cm(1.2)
    carte(slide, MARGE, y, UTILE, hauteur, BLANC)
    filet(slide, MARGE, y, UTILE, ORANGE, Cm(0.10))
    poser(slide, MARGE + Cm(0.9), y + Cm(0.6), UTILE - Cm(1.8), texte, 13, ENCRE,
          interligne=1.5)
    pied(slide, n)


def bascule(prs, n):
    slide = page(prs, CHARBON)
    bloc(slide, MARGE, Cm(2.0), UTILE, Cm(0.8), 'LA BASCULE PROPOSÉE', 11,
         ORANGE_CLAIR, gras=True)
    filet(slide, MARGE, Cm(2.85), Cm(3.4), ORANGE)

    bloc(slide, MARGE, Cm(4.3), Cm(27), Cm(4.6),
         'Le participant n’apprend pas\nce qu’il pourrait faire.\nIl le fait.',
         40, BLANC, gras=True, interligne=1.15)

    filet(slide, MARGE, Cm(10.4), UTILE, RGBColor(0x3A, 0x33, 0x2C), Cm(0.03))

    colonnes = [
        ('Ce qui ne change pas',
         'Les quatre modules de votre catalogue sont conservés à l’identique, '
         'ainsi que le certificat, le format deux jours en ligne et le livrable '
         'annoncé. Rien n’est retiré de l’offre vendue.'),
        ('Ce qui change',
         'Les quatre modules cessent d’être quatre cours et deviennent quatre '
         'axes de diagnostic. Un temps de relevé s’ajoute en amont, un temps de '
         'construction en aval.'),
        ('Ce que ça produit',
         'Chaque objectif devient mesurable, parce que l’outil produit la preuve '
         'que l’objectif est atteint. C’est exactement ce que votre gabarit '
         'exige sous le nom de critère de réussite.'),
    ]
    largeur = (UTILE - Cm(1.8)) / 3
    for i, (titre, corps) in enumerate(colonnes):
        x = MARGE + i * (largeur + Cm(0.9))
        filet(slide, x, Cm(11.4), Cm(1.6), ORANGE if i == 1 else GRIS, Cm(0.08))
        bloc(slide, x, Cm(12.1), largeur, Cm(0.9), titre, 15,
             ORANGE_CLAIR if i == 1 else BLANC, gras=True)
        bloc(slide, x, Cm(13.2), largeur, Cm(3.4), corps, 12, SABLE_FONCE,
             interligne=1.5)
    pied(slide, n)


def mecanique(prs, n):
    slide = page(prs)
    titre_page(slide, 'La mécanique', 'Quatre temps, dont deux hors séance')

    temps = [
        ('1', 'AVANT LA SÉANCE', 'Le relevé',
         'Un lien personnel est envoyé au participant dès son inscription. Il y '
         'saisit ses douze derniers mois : occupation, prix pratiqués, canaux de '
         'vente, outils en place. Seul, ou avec son équipe pour les structures '
         'qui inscrivent plusieurs personnes.'),
        ('2', 'OUVERTURE', 'Le diagnostic',
         'L’outil calcule son profil de maturité sur les quatre axes du catalogue, '
         'et ses indicateurs de performance à partir de ses propres chiffres. Il '
         'découvre où il se situe avant qu’on lui ait enseigné quoi que ce soit.'),
        ('3', 'PENDANT LES DEUX JOURS', 'La théorie au service du chiffre',
         'Chaque module s’ouvre sur les chiffres du groupe, pas sur un cas '
         'générique. La théorie explique pourquoi le chiffre est là, puis par quel '
         'mécanisme l’IA le déplace. Le participant simule, et voit l’effet.'),
        ('4', 'EN SORTIE', 'La feuille de route',
         'Le Plan d’Action IA est généré depuis ses données et ses arbitrages des '
         'deux jours, sur trois horizons. Chaque action porte son indicateur et le '
         'seuil à partir duquel il corrige. Exportable en fin de séance.'),
    ]
    largeur = (UTILE - Cm(1.5)) / 4
    for i, (num, moment, titre, corps) in enumerate(temps):
        x = MARGE + i * (largeur + Cm(0.5))
        carte(slide, x, Cm(5.0), largeur, Cm(10.4), BLANC)
        accent = ORANGE if i in (0, 3) else VERT
        filet(slide, x, Cm(5.0), largeur, accent, Cm(0.10))
        pastille(slide, x + Cm(0.7), Cm(5.7), Cm(1.1), num, accent, BLANC)
        bloc(slide, x + Cm(0.7), Cm(7.2), largeur - Cm(1.4), Cm(0.6),
             moment, 8.5, GRIS, gras=True)
        bloc(slide, x + Cm(0.7), Cm(7.9), largeur - Cm(1.4), Cm(1.4), titre,
             15, CHARBON, gras=True, interligne=1.15)
        bloc(slide, x + Cm(0.7), Cm(9.5), largeur - Cm(1.4), Cm(5.4), corps,
             11, ENCRE, interligne=1.45)

    bloc(slide, MARGE, Cm(16.0), UTILE, Cm(1.0),
         'Les temps 1 et 4 sont ceux qui manquent aujourd’hui. Ce sont eux qui '
         'transforment deux jours de contenu en deux jours de travail.',
         13, GRIS, italique=True)
    pied(slide, n)


def moment(prs, n):
    slide = page(prs)
    titre_page(slide, 'Le moment qui vend le Sprint',
               'Un chiffre que l’opérateur n’a jamais vu')
    carte(slide, MARGE, Cm(4.9), Cm(15.5), Cm(6.9), CHARBON, CHARBON)
    interne = Cm(13.5)
    y = poser(slide, MARGE + Cm(1.0), Cm(5.5), interne,
              'CALCULÉ DEVANT LUI, DEPUIS SES PROPRES DONNÉES', 9.5, ORANGE_CLAIR,
              gras=True, ecart=Cm(0.5))
    y = poser(slide, MARGE + Cm(1.0), y, interne,
              'Le montant qu’il verse\nchaque année aux plateformes\nde réservation.',
              22, BLANC, gras=True, interligne=1.25, ecart=Cm(0.55))
    poser(slide, MARGE + Cm(1.0), y, interne,
          'Puis le nombre de points de réservation directe qu’il lui faudrait '
          'gagner pour l’annuler.',
          12.5, SABLE_FONCE, interligne=1.4)

    x = MARGE + Cm(16.4)
    colonne = Cm(13.1)
    y = poser(slide, x, Cm(5.0), colonne,
              'La plupart des structures indépendantes n’ont jamais calculé ce '
              'montant. Elles connaissent le taux de commission, elles n’ont jamais '
              'posé la multiplication sur douze mois.',
              14, ENCRE, interligne=1.5, ecart=Cm(0.6))
    poser(slide, x, y, colonne,
          'Ce chiffre ne s’enseigne pas, il se découvre. Et une fois découvert, il '
          'rend la suite du Sprint nécessaire, parce que le participant veut savoir '
          'quoi en faire.',
          14, ENCRE, interligne=1.5)

    texte = ('C’est aussi la réponse à la formation gratuite. Une sensibilisation '
             'collective ne peut pas produire ce moment, parce qu’elle ne travaille '
             'sur les données de personne. Un Sprint payant le peut, et c’est ce '
             'qui justifie son prix sans avoir à le défendre.')
    hauteur = mesure(texte, UTILE - Cm(1.8), 14, 1.5) + Cm(1.6)
    carte(slide, MARGE, Cm(12.6), UTILE, hauteur, BLANC)
    filet(slide, MARGE, Cm(12.6), Cm(0.12), VERT, hauteur)
    poser(slide, MARGE + Cm(0.9), Cm(13.4), UTILE - Cm(1.8), texte, 14, ENCRE,
          interligne=1.5)
    pied(slide, n)


def validation(prs, n):
    slide = page(prs)
    titre_page(slide, 'Ce que l’approche apporte à votre comité',
               'Des critères de réussite enfin vérifiables')
    bloc(slide, MARGE, Cm(4.9), UTILE, Cm(1.6),
         'Votre gabarit impose une formulation stricte : être capable de, un verbe '
         'd’action, un critère de réussite, des conditions de réalisation. Sur une '
         'formation en ligne, le critère de réussite est le point faible habituel, '
         'parce que rien ne permet de le constater.',
         14, ENCRE, interligne=1.5)

    lignes = [
        ('Le critère est constaté, pas déclaré',
         'L’écart entre le calcul du participant et le calcul de référence est '
         'inférieur à 5 %. L’outil le mesure, le formateur n’a pas à en juger.'),
        ('Les conditions de réalisation sont réelles',
         'Elles ne décrivent plus une salle et un support, mais un tableau de bord '
         'et les propres données du participant. C’est vérifiable à distance.'),
        ('La progression taxonomique est portée par la séance',
         'Le Sprint monte de Analyser à Créer, et le sixième objectif général se '
         'termine sur une production. Le niveau visé est atteint par construction.'),
    ]
    y = Cm(7.1)
    for i, (titre, corps) in enumerate(lignes):
        carte(slide, MARGE, y, UTILE, Cm(2.5), BLANC)
        filet(slide, MARGE, y, Cm(0.12), VERT, Cm(2.5))
        pastille(slide, MARGE + Cm(0.8), y + Cm(0.7), Cm(1.1), str(i + 1), VERT,
                 BLANC)
        bloc(slide, MARGE + Cm(2.5), y + Cm(0.5), UTILE - Cm(3.4), Cm(0.8),
             titre, 14.5, CHARBON, gras=True)
        bloc(slide, MARGE + Cm(2.5), y + Cm(1.35), UTILE - Cm(3.4), Cm(1.0),
             corps, 12, ENCRE, interligne=1.4)
        y += Cm(2.9)

    bloc(slide, MARGE, Cm(16.0), UTILE, Cm(1.0),
         'Le plan de formation complet, rédigé au format de votre gabarit, '
         'accompagne ce document.',
         13, GRIS, italique=True)
    pied(slide, n)


def conformite(prs, n, chiffres):
    slide = page(prs)
    titre_page(slide, 'Le plan de formation joint',
               'Écrit au format de votre gabarit, et conforme')
    cartes = [
        (str(chiffres['og']), 'objectifs généraux', 'minimum requis : 4', True),
        (str(chiffres['os']), 'objectifs spécifiques', 'de 2 à 5 par objectif général', False),
        (str(chiffres['elements']), 'éléments de contenu', 'minimum requis : 30', True),
        ('14 h', 'réparties en 2 journées', 'de 7 heures, 100 % en ligne', False),
    ]
    largeur = (UTILE - Cm(1.5)) / 4
    for i, (grand, libelle, note, souligne) in enumerate(cartes):
        x = MARGE + i * (largeur + Cm(0.5))
        carte(slide, x, Cm(5.0), largeur, Cm(4.6), CHARBON if souligne else BLANC,
              CHARBON if souligne else SABLE_FONCE)
        bloc(slide, x + Cm(0.7), Cm(5.8), largeur - Cm(1.4), Cm(1.6), grand, 40,
             ORANGE_CLAIR if souligne else CHARBON, gras=True)
        bloc(slide, x + Cm(0.7), Cm(7.5), largeur - Cm(1.4), Cm(0.8), libelle,
             12.5, BLANC if souligne else ENCRE, gras=True)
        bloc(slide, x + Cm(0.7), Cm(8.3), largeur - Cm(1.4), Cm(0.8), note, 10,
             SABLE_FONCE if souligne else GRIS)

    bloc(slide, MARGE, Cm(10.6), UTILE, Cm(1.0),
         'La structure des six objectifs généraux', 16, CHARBON, gras=True)

    structure = [
        ('OG 1', 'Diagnostic de maturité et de performance', 'ajout'),
        ('OG 2', 'Revenue management et tarification dynamique', 'catalogue'),
        ('OG 3', 'Expérience voyageur et personnalisation', 'catalogue'),
        ('OG 4', 'Marketing touristique augmenté', 'catalogue'),
        ('OG 5', 'Opérations et excellence de service', 'catalogue'),
        ('OG 6', 'Construction du Plan d’Action IA', 'ajout'),
    ]
    y = Cm(11.9)
    largeur_l = (UTILE - Cm(0.8)) / 2
    for i, (code, intitule, origine) in enumerate(structure):
        col, rang = i % 2, i // 2
        x = MARGE + col * (largeur_l + Cm(0.8))
        yy = y + rang * Cm(1.25)
        ajout = origine == 'ajout'
        filet(slide, x, yy + Cm(0.12), Cm(0.10), ORANGE if ajout else VERT, Cm(0.85))
        bloc(slide, x + Cm(0.45), yy, Cm(1.6), Cm(0.7), code, 12, CHARBON, gras=True)
        bloc(slide, x + Cm(2.1), yy, largeur_l - Cm(4.6), Cm(0.7), intitule, 12,
             ENCRE)
        bloc(slide, x + largeur_l - Cm(2.4), yy, Cm(2.4), Cm(0.7),
             'ajouté' if ajout else 'catalogue', 10,
             ORANGE if ajout else VERT, align=PP_ALIGN.RIGHT)
    pied(slide, n)


def reserves(prs, n):
    slide = page(prs)
    titre_page(slide, 'Deux points de votre gabarit',
               'À arbitrer avant que le comité ne se prononce')
    points = [
        ('01', 'Quel barème s’applique à un format de deux jours en ligne ?',
         'Votre grille cadre trois formats : 3 heures en salle ou webinaire, '
         '7 heures en salle, 2 jours en salle. Le seul format à distance qu’elle '
         'prévoit est le webinaire de 3 heures, or le Sprint est annoncé sur '
         '2 jours à 100 % en ligne.\n\n'
         'Le plan joint applique par précaution le barème des 2 jours. Une '
         'confirmation évite une reprise complète.'),
        ('02', 'Combien d’objectifs généraux attendez-vous ?',
         'La grille de critères demande au moins 4 objectifs généraux pour une '
         'formation de deux jours. La section « TRUCS et astuces » du même '
         'document suggère d’en rédiger deux ou trois.\n\n'
         'Le plan joint suit la grille et en comporte 6. Nous préférons poser la '
         'question maintenant plutôt que la voir revenir à la validation.'),
    ]
    largeur = (UTILE - Cm(1.0)) / 2
    interne = largeur - Cm(1.8)

    # la carte est dimensionnee sur le texte mesure, jamais sur une hauteur devinee
    hauteur = Cm(0)
    for _, titre, corps in points:
        h = (Cm(0.8) + Cm(1.1) + Cm(0.4)
             + mesure(titre, interne, 15, 1.2, gras=True) + Cm(0.45)
             + mesure(corps, interne, 10.5, 1.45) + Cm(0.75))
        hauteur = max(hauteur, h)

    haut = Cm(4.8)
    for i, (num, titre, corps) in enumerate(points):
        x = MARGE + i * (largeur + Cm(1.0))
        carte(slide, x, haut, largeur, hauteur, BLANC)
        filet(slide, x, haut, largeur, ORANGE, Cm(0.10))
        y = poser(slide, x + Cm(0.9), haut + Cm(0.8), Cm(3), num, 26, ORANGE,
                  gras=True, ecart=Cm(0.4))
        y = poser(slide, x + Cm(0.9), y, interne, titre, 15, CHARBON, gras=True,
                  interligne=1.2, ecart=Cm(0.45))
        poser(slide, x + Cm(0.9), y, interne, corps, 10.5, ENCRE, interligne=1.45)

    y = haut + hauteur + Cm(0.6)
    texte = ('Troisième question, de calendrier : combien d’allers-retours de '
             'validation sont prévus, et sous quel délai ?')
    fond_h = mesure(texte, UTILE - Cm(1.8), 12.5, 1.4) + Cm(0.9)
    carte(slide, MARGE, y, UTILE, fond_h, SABLE_FONCE, SABLE_FONCE)
    poser(slide, MARGE + Cm(0.9), y + Cm(0.5), UTILE - Cm(1.8), texte, 12.5,
          ENCRE, interligne=1.4)
    pied(slide, n)


def attentes(prs, n):
    slide = page(prs)
    titre_page(slide, 'Ce que l’approche demande de votre côté',
               'Trois conditions, aucune n’est coûteuse')
    conditions = [
        ('Le lien de relevé part avec la confirmation d’inscription',
         'C’est la seule contrainte réelle. Le participant doit disposer d’une à '
         'deux semaines pour réunir ses douze mois de données. Sans ce délai, la '
         'première demi-journée se passe à saisir au lieu de travailler.'),
        ('Un nombre minimum de participants pour tenir une session',
         'L’approche demande une préparation individualisée des diagnostics avant '
         'chaque session. Un plancher, quel qu’il soit, permet de la caler.'),
        ('Un point sur l’économie du partenariat, de vive voix',
         'Le sujet n’est pas traité dans ce document, volontairement. Il mérite '
         'une conversation, et une conversation ne se remplace pas par un tableau.'),
    ]
    y = Cm(5.2)
    for i, (titre, corps) in enumerate(conditions):
        carte(slide, MARGE, y, UTILE, Cm(3.2), BLANC)
        filet(slide, MARGE, y, Cm(0.12), ORANGE if i == 0 else VERT, Cm(3.2))
        pastille(slide, MARGE + Cm(0.9), y + Cm(1.0), Cm(1.2), str(i + 1),
                 ORANGE if i == 0 else VERT, BLANC)
        bloc(slide, MARGE + Cm(2.7), y + Cm(0.7), UTILE - Cm(3.6), Cm(0.9),
             titre, 16, CHARBON, gras=True)
        bloc(slide, MARGE + Cm(2.7), y + Cm(1.7), UTILE - Cm(3.6), Cm(1.3),
             corps, 12.5, ENCRE, interligne=1.45)
        y += Cm(3.6)

    bloc(slide, MARGE, Cm(16.1), UTILE, Cm(1.0),
         'Aucune de ces trois conditions ne modifie le prix public, le format, '
         'ni le certificat.',
         13, GRIS, italique=True)
    pied(slide, n)


def suite(prs, n):
    slide = page(prs, CHARBON)
    bloc(slide, MARGE, Cm(2.2), UTILE, Cm(0.8), 'LA SUITE', 11, ORANGE_CLAIR,
         gras=True)
    filet(slide, MARGE, Cm(3.05), Cm(3.4), ORANGE)
    bloc(slide, MARGE, Cm(4.3), Cm(25), Cm(2.4),
         'Trois choses, dans cet ordre',
         34, BLANC, gras=True, interligne=1.1)

    etapes = [
        ('Votre lecture du plan joint',
         'Et votre réponse sur les deux points de gabarit, page 9.'),
        ('Le calage de la session',
         'Période visée, plancher de participants, date d’envoi des liens de relevé.'),
        ('La réunion sur le partenariat',
         'Niveau et base du partage, seuil de déclenchement, propriété des outils, '
         'suites commerciales. De vive voix.'),
    ]
    y = Cm(7.8)
    for i, (titre, corps) in enumerate(etapes):
        pastille(slide, MARGE, y, Cm(1.3), str(i + 1), ORANGE, BLANC)
        bloc(slide, MARGE + Cm(2.0), y + Cm(0.05), Cm(26), Cm(0.9), titre, 18,
             BLANC, gras=True)
        bloc(slide, MARGE + Cm(2.0), y + Cm(1.0), Cm(26), Cm(1.2), corps, 13,
             SABLE_FONCE, interligne=1.4)
        y += Cm(2.5)

    filet(slide, MARGE, Cm(15.4), UTILE, RGBColor(0x3A, 0x33, 0x2C), Cm(0.03))
    poser(slide, MARGE, Cm(15.8), Cm(24),
          'Mac Arthur N’Guessan Kouassi  ·  agence Mr Attractor\n'
          'Le plan de formation au format de votre gabarit accompagne ce document.',
          11, GRIS, interligne=1.5)


def controle_debordement(prs):
    """Aucune forme ne sort de la zone utile, pied de page compris.

    Un debordement ne se voit pas au rendu du .pptx sur le poste qui l'ecrit, il
    se voit chez le destinataire. On le fait donc echouer ici (R-23, R-69 : le
    controle se lance, il ne se recite pas).
    """
    plancher = H - Cm(1.6)
    defauts = []
    for i, slide in enumerate(prs.slides, start=1):
        for forme in slide.shapes:
            if forme.width == L and forme.height == H:
                continue                      # le fond de page
            if forme.top >= plancher:
                continue                      # la bande de pied de page
            bas = forme.top + forme.height
            droite = forme.left + forme.width
            if bas > plancher:
                defauts.append(
                    'page %d : une forme descend a %.1f cm, plancher %.1f cm'
                    % (i, bas / 360000, plancher / 360000))
            if droite > L - Cm(1.0):
                defauts.append(
                    'page %d : une forme deborde a droite (%.1f cm)'
                    % (i, droite / 360000))
    return defauts


def construire(chiffres):
    defauts = controle_contraste()
    if defauts:
        raise SystemExit('Contraste insuffisant :\n  ' + '\n  '.join(defauts))

    prs = Presentation()
    prs.slide_width, prs.slide_height = L, H

    couverture(prs)
    promesse(prs, 2)
    risque(prs, 3)
    bascule(prs, 4)
    mecanique(prs, 5)
    moment(prs, 6)
    validation(prs, 7)
    conformite(prs, 8, chiffres)
    reserves(prs, 9)
    attentes(prs, 10)
    suite(prs, 11)

    debords = controle_debordement(prs)
    if debords:
        raise SystemExit('Débordement :\n  ' + '\n  '.join(debords))

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    prs.save(SORTIE)
    return len(prs.slides.__iter__.__self__._sldIdLst)


if __name__ == '__main__':
    import json
    source = RACINE / 'livrables/clients/ethsun/sprint-ia-tourisme/plan-de-formation.json'
    donnees = json.loads(source.read_text(encoding='utf-8'))
    objectifs = donnees['objectifs']
    chiffres = {
        'og': len(objectifs),
        'os': sum(len(o['specifiques']) for o in objectifs),
        'elements': sum(len(s['contenus']) for o in objectifs for s in o['specifiques']),
    }
    n = construire(chiffres)
    print('Rendu : %s' % SORTIE)
    print('  %d diapositives' % n)
    print('  contraste : toutes les paires au-dessus du seuil')
    print('  chiffres de conformite repris de la source : %s' % chiffres)
