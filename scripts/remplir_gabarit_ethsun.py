# -*- coding: utf-8 -*-
"""Rend le plan de formation ETHSUN au format exact de leur gabarit de validation.

Source unique : livrables/clients/ethsun/sprint-ia-tourisme/plan-de-formation.json
Sortie        : livrables/clients/ethsun/PLAN-DE-FORMATION-SPRINT-TOURISME.docx

Pourquoi un script et pas un .docx ecrit a la main : le plan passe en validation
par l'Institut, avec des corrections a integrer et donc plusieurs allers-retours.
Un chiffre ne doit exister qu'a un seul endroit (R-29), sinon la duree annoncee
d'un objectif general finit par contredire la somme de ses objectifs specifiques.
Les durees d'objectif general et les totaux de journee sont donc CALCULES ici,
jamais recopies.

Structure reproduite depuis GABARIT.doc (Drive Ethsun Partenaire, 27/08/2026) :
  - Grille de validation _ informations generales
  - Grille de validation - informations specifiques, un bloc par objectif
    specifique, colonnes : Objectif specifique (n) | Elements de contenu |
    Activites pedagogiques | Materiel requis | Duree | Criteres de satisfaction
  - la ligne d'appreciation reservee a l'Institut : Pas du tout (--) / Peu (-) /
    Adequat (+) / Tres (++) / Commentaires
  - l'espace de validation final : aspects positifs, ameliorations souhaitables,
    ameliorations demandees

Les zones reservees a l'Institut sont laissees vides : c'est leur comite qui les
remplit, les prendre de vitesse serait mal recu.
"""
import json
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / 'livrables/clients/ethsun/sprint-ia-tourisme/plan-de-formation.json'
SORTIE = RACINE / 'livrables/clients/ethsun/PLAN-DE-FORMATION-SPRINT-TOURISME.docx'

ENCRE = RGBColor(0x1A, 0x1A, 0x18)
ARDOISE = RGBColor(0x2F, 0x48, 0x58)
GRIS = RGBColor(0x6B, 0x6A, 0x64)
FOND_ENTETE = 'E8EDF1'
FOND_INSTITUT = 'F4F2EE'
FOND_TITRE = 'D9E2E8'


def minutes(texte):
    """'1 h 15' -> 75, '45 min' -> 45. Sert aux totaux calcules."""
    texte = texte.strip()
    nombres = [int(n) for n in re.findall(r'\d+', texte)]
    if 'min' in texte and 'h' not in texte:
        return nombres[0]
    return nombres[0] * 60 + (nombres[1] if len(nombres) > 1 else 0)


def en_duree(total):
    if total < 60:
        return '%d min' % total
    return '%d h %02d' % (total // 60, total % 60)


def langue(style, code='fr-FR'):
    rpr = style.element.get_or_add_rPr()
    for balise in rpr.findall(qn('w:lang')):
        rpr.remove(balise)
    lang = OxmlElement('w:lang')
    lang.set(qn('w:val'), code)
    rpr.append(lang)


def ombrer_cellule(cell, couleur):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:fill'), couleur)
    tc_pr.append(shd)


def ecrire(cell, texte, gras=False, taille=9, couleur=ENCRE, italique=False):
    cell.text = ''
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(texte)
    run.font.size = Pt(taille)
    run.font.bold = gras
    run.font.italic = italique
    run.font.color.rgb = couleur
    return p


def puces(cell, elements, taille=9):
    cell.text = ''
    for i, element in enumerate(elements):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.left_indent = Cm(0.3)
        run = p.add_run('%d.  %s' % (i + 1, element))
        run.font.size = Pt(taille)
        run.font.color.rgb = ENCRE


def titre_bandeau(doc, texte, taille=11):
    t = doc.add_table(rows=1, cols=1)
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.rows[0].cells[0]
    ombrer_cellule(cell, FOND_TITRE)
    p = ecrire(cell, texte, gras=True, taille=taille, couleur=ARDOISE)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return t


def ligne_institut(table, largeur=6):
    """La ligne d'appreciation que le gabarit reserve au comite de validation."""
    entetes = ['Pas du tout (--)', 'Peu (-)', 'Adéquat (+)', 'Très (++)', 'Commentaires']
    ligne = table.add_row()
    cellules = ligne.cells
    for i, entete in enumerate(entetes[:largeur - 1]):
        ombrer_cellule(cellules[i], FOND_INSTITUT)
        p = ecrire(cellules[i], entete, taille=7.5, couleur=GRIS, italique=True)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if largeur > len(entetes):
        for j in range(len(entetes) - 1, largeur):
            ombrer_cellule(cellules[j], FOND_INSTITUT)
    vide = table.add_row()
    for cell in vide.cells:
        ombrer_cellule(cell, FOND_INSTITUT)
        cell.text = ''
        cell.paragraphs[0].add_run(' ').font.size = Pt(9)


def construire():
    donnees = json.loads(SOURCE.read_text(encoding='utf-8'))
    generales = donnees['generales']
    objectifs = donnees['objectifs']

    doc = Document()
    doc.core_properties.title = generales['titre']
    doc.core_properties.author = 'Mac Arthur N’Guessan Kouassi'
    doc.core_properties.comments = (
        'Plan de formation soumis a validation. ETHSUN Institute, '
        'Sprint IA Tourisme et Loisirs.')

    # Paysage : la grille specifique compte six colonnes. En portrait elles
    # tiennent dans 17,8 cm, ce qui est conforme mais illisible. En paysage la
    # largeur utile passe a 26,9 cm et chaque colonne redevient lisible.
    for section in doc.sections:
        section.orientation = WD_ORIENT.LANDSCAPE
        section.page_width, section.page_height = Cm(29.7), Cm(21.0)
        section.top_margin = Cm(1.5)
        section.bottom_margin = Cm(1.5)
        section.left_margin = Cm(1.4)
        section.right_margin = Cm(1.4)

    normal = doc.styles['Normal']
    normal.font.name = 'Calibri'
    normal.font.size = Pt(10)
    normal.font.color.rgb = ENCRE
    langue(normal)
    normal.paragraph_format.space_after = Pt(6)

    # ---------------------------------------------------------------- en-tete
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('GRILLE DE VALIDATION DES PLANS DE FORMATION — ETHSUN INSTITUTE')
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = ARDOISE

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Sprint IA sectoriel · Tourisme et Loisirs')
    run.font.size = Pt(9)
    run.font.color.rgb = GRIS

    total = sum(minutes(s['duree']) for o in objectifs for s in o['specifiques'])
    elements = sum(len(s['contenus']) for o in objectifs for s in o['specifiques'])

    # ------------------------------------------- grille informations generales
    titre_bandeau(doc, 'Grille de validation _ informations générales')

    lignes = [
        ('Titre de la formation', generales['titre']),
        ('Durée', generales['duree']),
        ('Formateur, formatrice', generales['formateur']),
        ('Présentation de la formation', generales['presentation']),
        ('Public cible', generales['public']),
        ('Prérequis', generales['prerequis']),
    ]

    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    for intitule, valeur in lignes:
        ligne = table.add_row().cells
        ombrer_cellule(ligne[0], FOND_ENTETE)
        ecrire(ligne[0], intitule, gras=True, taille=9, couleur=ARDOISE)
        ecrire(ligne[1], valeur, taille=9)
    table.columns[0].width = Cm(5.0)
    table.columns[1].width = Cm(21.9)

    doc.add_paragraph()

    # ------------------------------------------ les objectifs generaux, listes
    titre_bandeau(doc, 'Objectifs généraux')

    table = doc.add_table(rows=1, cols=4)
    table.style = 'Table Grid'
    for i, entete in enumerate(['N°', 'Objectif général',
                                'Niveau taxonomique visé', 'Durée']):
        ombrer_cellule(table.rows[0].cells[i], FOND_ENTETE)
        p = ecrire(table.rows[0].cells[i], entete, gras=True, taille=9, couleur=ARDOISE)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for objectif in objectifs:
        calcule = sum(minutes(s['duree']) for s in objectif['specifiques'])
        ligne = table.add_row().cells
        ecrire(ligne[0], objectif['code'], gras=True, taille=9, couleur=ARDOISE)
        ecrire(ligne[1], objectif['intitule'], taille=9)
        ecrire(ligne[2], objectif['bloom'], taille=9)
        ecrire(ligne[3], en_duree(calcule), taille=9)
    for largeur, colonne in zip((1.6, 17.4, 4.4, 3.5), table.columns):
        colonne.width = Cm(largeur)

    doc.add_paragraph()

    p = doc.add_paragraph()
    run = p.add_run(
        'Le plan comporte %d objectifs généraux, %d objectifs spécifiques et '
        '%d éléments de contenu, pour une durée totale de %s répartie en deux '
        'journées de 7 heures. La grille de qualité du gabarit demande, pour une '
        'formation de 2 jours, au moins 4 objectifs généraux, de 2 à 5 objectifs '
        'spécifiques par objectif général et au moins 30 éléments de contenu.'
        % (len(objectifs),
           sum(len(o['specifiques']) for o in objectifs),
           elements, en_duree(total)))
    run.font.size = Pt(8.5)
    run.font.color.rgb = GRIS
    run.font.italic = True

    # ------------------------------------ les blocs informations specifiques
    numero = 0
    for objectif in objectifs:
        doc.add_page_break()
        calcule = sum(minutes(s['duree']) for s in objectif['specifiques'])
        titre_bandeau(
            doc,
            'Grille de validation - informations spécifiques  —  %s  (%s, %s)'
            % (objectif['code'], objectif['jour'], en_duree(calcule)),
            taille=10)

        p = doc.add_paragraph()
        run = p.add_run('Objectif général — ' + objectif['intitule'])
        run.font.size = Pt(9)
        run.font.bold = True
        run.font.color.rgb = ARDOISE

        for specifique in objectif['specifiques']:
            numero += 1
            table = doc.add_table(rows=2, cols=6)
            table.style = 'Table Grid'

            entetes = ['Objectif spécifique (%d)' % numero, 'Éléments de contenu',
                       'Activités pédagogiques', 'Matériel requis', 'Durée',
                       'Critères de satisfaction']
            for i, entete in enumerate(entetes):
                ombrer_cellule(table.rows[0].cells[i], FOND_ENTETE)
                p = ecrire(table.rows[0].cells[i], entete, gras=True, taille=8.5,
                           couleur=ARDOISE)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

            corps = table.rows[1].cells
            ecrire(corps[0], specifique['intitule'], taille=8.5)
            puces(corps[1], specifique['contenus'], taille=8.5)
            ecrire(corps[2], specifique['activites'], taille=8.5)
            ecrire(corps[3], specifique['materiel'], taille=8.5)
            p = ecrire(corps[4], specifique['duree'], taille=8.5, gras=True)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ecrire(corps[5], specifique['criteres'], taille=8.5)

            ligne_institut(table, largeur=6)

            for largeur, colonne in zip((5.6, 6.4, 4.1, 3.4, 1.6, 5.8), table.columns):
                colonne.width = Cm(largeur)

            doc.add_paragraph()

    # --------------------------------------------- espace reserve a l'Institut
    doc.add_page_break()
    titre_bandeau(doc, 'Espace de validation réservé à l’Institut')

    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    for intitule in ('Aspects positifs', 'Améliorations souhaitables',
                     'Améliorations demandées'):
        ligne = table.add_row().cells
        ombrer_cellule(ligne[0], FOND_INSTITUT)
        ecrire(ligne[0], intitule, gras=True, taille=9, couleur=GRIS)
        ombrer_cellule(ligne[1], FOND_INSTITUT)
        ligne[1].text = ''
        ligne[1].paragraphs[0].add_run('\n\n\n').font.size = Pt(9)
    table.columns[0].width = Cm(5.6)
    table.columns[1].width = Cm(21.3)

    doc.add_paragraph()

    # --------------------------------------------------- les deux reserves
    titre_bandeau(doc, 'Deux points à arbitrer par l’Institut avant validation')

    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    reserves = [
        ('Le barème applicable au format',
         'La grille de qualité du gabarit cadre trois formats : 3 heures en salle '
         'ou webinaire, 7 heures en salle, 2 jours en salle. Le Sprint IA étant '
         'annoncé sur 2 jours à 100 % en ligne, aucun de ces trois barèmes ne lui '
         'correspond exactement, le seul format à distance cadré étant le webinaire '
         'de 3 heures. Le présent plan applique par précaution le barème le plus '
         'exigeant, celui de la formation de 2 jours. Merci de confirmer que c’est '
         'bien celui que le comité retiendra.'),
        ('Le nombre d’objectifs généraux attendu',
         'La grille de critères demande, pour une formation de 2 jours, au moins '
         '4 objectifs généraux. La section « TRUCS et astuces » du même gabarit '
         'suggère d’en rédiger deux ou trois. Le plan suit la grille de critères et '
         'en comporte 6. Merci d’indiquer laquelle des deux consignes fait foi, afin '
         'que ce point ne revienne pas à la validation.'),
        ('Le nombre d’allers-retours de validation',
         'Le plan passe en validation par l’Institut avec des corrections à '
         'intégrer. Merci de préciser le nombre d’allers-retours prévus et le '
         'délai de réponse, afin de caler le calendrier de production des supports.'),
    ]
    for intitule, texte in reserves:
        ligne = table.add_row().cells
        ombrer_cellule(ligne[0], FOND_ENTETE)
        ecrire(ligne[0], intitule, gras=True, taille=9, couleur=ARDOISE)
        ecrire(ligne[1], texte, taille=9)
    table.columns[0].width = Cm(5.2)
    table.columns[1].width = Cm(21.7)

    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    doc.save(SORTIE)
    return len(objectifs), sum(len(o['specifiques']) for o in objectifs), elements, total


if __name__ == '__main__':
    og, os_, elements, total = construire()
    print('Rendu : %s' % SORTIE)
    print('  objectifs generaux    : %d  (requis 4)' % og)
    print('  objectifs specifiques : %d' % os_)
    print('  elements de contenu   : %d  (requis 30)' % elements)
    print('  duree totale          : %s  (2 jours = 14 h)' % en_duree(total))
    if og < 4 or elements < 30 or total != 14 * 60:
        print('  NON CONFORME')
        sys.exit(1)
    print('  conforme')
