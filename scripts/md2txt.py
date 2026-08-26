# -*- coding: utf-8 -*-
"""Markdown -> texte brut, prêt à copier-coller dans une messagerie ou un Word.

Usage :
  python scripts/md2txt.py source.md sortie.txt [--sans-notes] [--couper-a "## TITRE"]

Choix de forme, et ils comptent quand le texte va être recollé ailleurs :
  - un paragraphe devient UNE ligne, aussi longue qu'il faut. Le texte se
    remet en forme tout seul dans la messagerie ou le traitement de texte,
    au lieu de rester coupé là où la source l'avait coupé ;
  - les titres passent en majuscules, sans dièse ;
  - les tableaux deviennent des lignes lisibles, parce qu'un tableau collé
    dans un mail se transforme en bouillie ;
  - --sans-notes retire les notes de marge internes, reconnaissables au
    chevron. Elles expliquent pourquoi une clause existe : c'est notre
    raisonnement, il ne sort pas de la maison.
"""
import re
import sys
import argparse

SEP_TABLEAU = re.compile(r'^\s*\|[\s:|-]+\|\s*$')


def propre(t):
    t = re.sub(r'\*\*([^*]+)\*\*', r'\1', t)
    t = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'\1', t)
    t = re.sub(r'`([^`]+)`', r'\1', t)
    return t.strip()


def convertir(md, sans_notes=False):
    lignes = md.split('\n')
    out, i = [], 0
    while i < len(lignes):
        ln = lignes[i]

        if not ln.strip():
            i += 1
            continue

        if ln.strip() == '---':
            i += 1
            continue

        # Bloc a copier : on garde les lignes telles quelles, sans les recoller
        # entre elles. C'est du texte destine a etre repris mot pour mot.
        if ln.strip().startswith('```'):
            i += 1
            while i < len(lignes) and not lignes[i].strip().startswith('```'):
                out.append(propre(lignes[i].rstrip()))
                i += 1
            i += 1
            out.append('')
            continue

        # Tableau
        if ln.lstrip().startswith('|') and i + 1 < len(lignes) \
                and SEP_TABLEAU.match(lignes[i + 1]):
            cel = lambda r: [propre(c) for c in r.strip().strip('|').split('|')]
            entetes = cel(ln)
            i += 2
            while i < len(lignes) and lignes[i].lstrip().startswith('|'):
                vals = cel(lignes[i])
                paires = [(e, v) for e, v in zip(entetes, vals) if v]
                out.append('  ' + ' | '.join(
                    ('%s : %s' % (e, v)) if e else v for e, v in paires))
                i += 1
            out.append('')
            continue

        # Citation
        if ln.lstrip().startswith('>'):
            buf = []
            while i < len(lignes) and lignes[i].lstrip().startswith('>'):
                buf.append(lignes[i].lstrip()[1:].strip())
                i += 1
            texte = propre(' '.join(x for x in buf if x))
            if sans_notes and ('▸' in texte or texte.startswith('Version ')):
                continue
            out.append(texte)
            out.append('')
            continue

        # Listes
        m = re.match(r'^\s*([-*]|\d+\.)\s+(.*)', ln)
        if m:
            while i < len(lignes):
                mm = re.match(r'^\s*([-*]|\d+\.)\s+(.*)', lignes[i])
                if mm:
                    item = mm.group(2).strip()
                    i += 1
                    while i < len(lignes) and lignes[i].strip() \
                            and lignes[i].startswith(('  ', '\t')) \
                            and not re.match(r'^\s*([-*]|\d+\.)\s+', lignes[i]):
                        item += ' ' + lignes[i].strip()
                        i += 1
                    puce = '-' if mm.group(1) in '-*' else mm.group(1)
                    out.append('%s %s' % (puce, propre(item)))
                else:
                    break
            out.append('')
            continue

        # Titres
        m = re.match(r'^(#{1,6})\s+(.*)', ln)
        if m:
            titre = propre(m.group(2))
            niveau = len(m.group(1))
            out.append('')
            out.append(titre.upper() if niveau <= 2 else titre)
            out.append('')
            i += 1
            continue

        # Paragraphe : toutes les lignes consécutives deviennent une seule ligne
        buf = []
        while i < len(lignes) and lignes[i].strip() \
                and not lignes[i].lstrip().startswith(('|', '>', '#')) \
                and lignes[i].strip() != '---' \
                and not re.match(r'^\s*([-*]|\d+\.)\s+', lignes[i]):
            buf.append(lignes[i].strip())
            i += 1
        if buf:
            out.append(propre(' '.join(buf)))
            out.append('')

    texte = '\n'.join(out)
    return re.sub(r'\n{3,}', '\n\n', texte).strip() + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('sortie')
    ap.add_argument('--sans-notes', action='store_true')
    ap.add_argument('--couper-a')
    a = ap.parse_args()

    md = open(a.source, encoding='utf-8').read()
    if a.couper_a:
        pos = md.find(a.couper_a)
        if pos != -1:
            md = md[:pos]
    txt = convertir(md, a.sans_notes)
    open(a.sortie, 'w', encoding='utf-8', newline='\r\n').write(txt)
    print('ecrit %s, %d signes, %d lignes' % (a.sortie, len(txt),
                                             txt.count('\n')))


if __name__ == '__main__':
    main()
