# -*- coding: utf-8 -*-
"""Convertit un document Markdown du dossier Festival en page HTML à la charte
de l'espace de pilotage. Gère titres, tableaux, listes, citations, gras, code."""
import re, sys, html

def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', t)
    return t

def convert(md):
    lines = md.split('\n')
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]

        if ln.strip() == '---':
            out.append('<hr />'); i += 1; continue

        if not ln.strip():
            i += 1; continue

        # Tableau
        if ln.lstrip().startswith('|') and i + 1 < len(lines) \
           and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i+1]):
            cells = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
            head = cells(ln)
            i += 2
            body = []
            while i < len(lines) and lines[i].lstrip().startswith('|'):
                body.append(cells(lines[i])); i += 1
            t = ['<div class="tbl"><table><thead><tr>']
            t += ['<th>%s</th>' % inline(h) for h in head]
            t.append('</tr></thead><tbody>')
            for r in body:
                t.append('<tr>' + ''.join('<td>%s</td>' % inline(c) for c in r) + '</tr>')
            t.append('</tbody></table></div>')
            out.append(''.join(t)); continue

        # Citation
        if ln.lstrip().startswith('>'):
            buf = []
            while i < len(lines) and lines[i].lstrip().startswith('>'):
                buf.append(lines[i].lstrip()[1:].strip()); i += 1
            txt = ' '.join(x for x in buf if x)
            out.append('<blockquote>%s</blockquote>' % inline(txt)); continue

        # Listes
        m_ul = re.match(r'^\s*[-*]\s+(.*)', ln)
        m_ol = re.match(r'^\s*\d+\.\s+(.*)', ln)
        if m_ul or m_ol:
            tag = 'ol' if m_ol else 'ul'
            items, cur = [], None
            while i < len(lines):
                mm = re.match(r'^\s*\d+\.\s+(.*)' if m_ol else r'^\s*[-*]\s+(.*)', lines[i])
                if mm:
                    if cur is not None: items.append(cur)
                    cur = mm.group(1).strip(); i += 1
                elif lines[i].strip() and lines[i].startswith(('  ', '\t')) and cur is not None:
                    cur += ' ' + lines[i].strip(); i += 1
                else:
                    break
            if cur is not None: items.append(cur)
            out.append('<%s>%s</%s>' % (tag, ''.join('<li>%s</li>' % inline(x) for x in items), tag))
            continue

        # Titres
        m = re.match(r'^(#{1,6})\s+(.*)', ln)
        if m:
            n = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (n, inline(m.group(2).strip()), n))
            i += 1; continue

        # Paragraphe
        buf = []
        while i < len(lines) and lines[i].strip() and not lines[i].lstrip().startswith(('|', '>', '#')) \
              and lines[i].strip() != '---' \
              and not re.match(r'^\s*([-*]|\d+\.)\s+', lines[i]):
            buf.append(lines[i].strip()); i += 1
        if buf:
            out.append('<p>%s</p>' % inline(' '.join(buf)))
    return '\n'.join(out)

if __name__ == '__main__':
    src, dst, meta = sys.argv[1], sys.argv[2], sys.argv[3]
    titre, sous = open(meta, encoding='utf-8').read().split('\n')[:2]
    md = open(src, encoding='utf-8').read()
    # Le titre, le sous-titre et la ligne d'annexe passent dans l'en-tête,
    # pas dans le corps : sinon la page les affiche deux fois.
    lignes, garde, saut = md.split('\n'), [], 0
    for ln in lignes:
        if saut < 3 and (ln.startswith('# ') or ln.startswith('## ')
                         or ln.startswith('**Annexe')
                         or ln.startswith('entre ADVANTAGE')):
            saut += 1 if ln.startswith(('# ', '## ')) else 0
            continue
        garde.append(ln)
    corps = convert('\n'.join(garde))
    gab = open(dst + '.gabarit', encoding='utf-8').read()
    open(dst, 'w', encoding='utf-8').write(
        gab.replace('{{TITRE}}', html.escape(titre))
           .replace('{{SOUS}}', html.escape(sous))
           .replace('{{CORPS}}', corps))
    print('ecrit', dst, len(corps), 'octets de corps')
