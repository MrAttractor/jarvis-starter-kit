# -*- coding: utf-8 -*-
"""Corrections apportées directement dans les PDF du package Élévia, le 06/09/2026.

Les sources HTML des révisions 4, 5 et 6 n'ayant jamais été versées au dépôt, tout
se fait dans les PDF. Le script repart à chaque exécution des fichiers d'origine
conservés dans `_archive/recu-2026-09-06/`, il est donc rejouable sans dérive.

Ce qu'il fait, dans l'ordre des décisions de Mac Arthur :

  1. Devis : validité portée au 30 septembre 2026 (trois endroits, dont un pied de
     page qui annonçait encore « V5 »).
  2. Devis et Avenant : réserve explicite sur les frais d'exploitation de
     l'encaissement, qui restent à la charge de la Cliente.
  3. Les trois documents : l'historique des révisions est retiré. Il ne reste que
     la phrase qui rend les versions antérieures caduques.
  4. CDC : le vocabulaire « V1 / V2 / V3 » disparaît partout. La section 0 le
     déclarait aboli, et le document continuait de l'employer six fois.

Les polices sont les sous-ensembles DejaVu déjà embarqués dans le lot, pour que le
texte ajouté soit typographiquement identique au reste. Toute lettre absente du
sous-ensemble fait échouer le script plutôt que d'imprimer un carré vide.
"""
import pymupdf

DOSSIER = "livrables/clients/club-elevia"
ORIG = f"{DOSSIER}/_archive/recu-2026-09-06"

def _reserve_polices():
    """Chromium n'embarque qu'un sous-ensemble de DejaVu par page : aucun ne porte
       tous les caractères dont on a besoin. On rassemble donc tous les
       sous-ensembles du lot, et chaque bout de texte ira chercher le premier qui
       sait l'écrire en entier. Ce sont des sous-ensembles d'une même fonte, leurs
       métriques sont identiques, on peut les mélanger sans décaler la mise en page."""
    reg, bold, vus = [], [], set()
    for nom in ("DEVIS-ATR-2026-0005-ClubElevia.pdf",
                "AVENANT-01-ClubElevia.pdf",
                "CDC-ATR-2026-0005-ClubElevia.pdf"):
        doc = pymupdf.open(f"{ORIG}/{nom}")
        xrefs = {(f[0], f[3]) for p in doc for f in p.get_fonts(full=True)}
        for xref, base in sorted(xrefs):
            try:
                buf = doc.extract_font(xref)[3]
            except Exception:
                continue
            if not buf or buf[:64] in vus:
                continue
            vus.add(buf[:64])
            (bold if "Bold" in base else reg).append((buf, pymupdf.Font(fontbuffer=buf)))
    reg.sort(key=lambda t: -len(t[0]))
    bold.sort(key=lambda t: -len(t[0]))
    return reg, bold


POOL_REG, POOL_BOLD = _reserve_polices()

RESERVE = ("Les commissions et frais de transaction du prestataire de paiement "
           "restent également à la charge de la Cliente.")

# La seule phrase conservée sur les versions antérieures (arbitrage du 06/09).
CADUCITE = ("Il annule et remplace toute version antérieure du même document, "
            "dont aucune n'a été signée.")
INTEGRITE = "Aucune disposition n'en a été retirée ni réduite."


def rgb(i):
    return ((i >> 16) / 255.0, ((i >> 8) & 255) / 255.0, (i & 255) / 255.0)


def prep(page):
    """Conservé pour la lisibilité des appels : les polices sont désormais
       déclarées à la volée, au moment où l'on écrit."""
    return page


def choisir(txt, bold):
    """Premier sous-ensemble capable d'écrire ce texte en entier."""
    pool = POOL_BOLD if bold else POOL_REG
    besoin = {ord(c) for c in txt if c != " "}
    for i, (buf, fo) in enumerate(pool):
        if all(fo.has_glyph(c) for c in besoin):
            return i, buf, fo
    absents = sorted({c for c in txt if not any(
        fo.has_glyph(ord(c)) for _, fo in pool)})
    raise SystemExit(f"Aucune police {'grasse' if bold else 'normale'} du lot ne "
                     f"porte {absents} — texte : {txt!r}")


def wide(txt, bold, size):
    return choisir(txt, bold)[2].text_length(txt, fontsize=size)


def put(page, x, baseline, txt, bold, size, color):
    i, buf, _ = choisir(txt, bold)
    nom = f"{'B' if bold else 'R'}{i}"
    page.insert_font(fontname=nom, fontbuffer=buf)
    page.insert_text((x, baseline), txt, fontname=nom, fontsize=size,
                     color=rgb(color))


def efface(page, *rects):
    for r in rects:
        page.add_redact_annot(pymupdf.Rect(*r))
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_NONE)


def tokens(segments):
    """(texte, gras, couleur, colle) -> jetons mot par mot.
       « colle » supprime l'espace qui précède, pour la ponctuation."""
    out = []
    for txt, bold, col, colle in segments:
        mots = [m for m in txt.split(" ") if m]
        for i, mot in enumerate(mots):
            out.append((mot, bold, col, colle and i == 0))
    return out


def couler(page, segments, x, baseline, gauche, droite, interligne, size, essai=False):
    """Écoule du texte en passant à la ligne. `essai` compte sans écrire."""
    espace = wide(" ", False, size)
    premier, lignes = True, 1
    for mot, bold, col, colle in tokens(segments):
        avance = wide(mot, bold, size)
        if not premier and not colle:
            if x + espace + avance > droite:
                baseline += interligne
                x = gauche
                lignes += 1
            else:
                x += espace
        elif not premier and colle and x + avance > droite:
            baseline += interligne
            x = gauche
            lignes += 1
        if not essai:
            put(page, x, baseline, mot, bold, size, col)
        x += avance
        premier = False
    return lignes


def tient_en(page, segments, x, gauche, droite, size, maxi, ou):
    n = couler(page, segments, x, 0, gauche, droite, 0, size, essai=True)
    if n > maxi:
        raise SystemExit(f"{ou} : {n} lignes alors que {maxi} tiennent dans le cadre.")
    return n


def spans_de(page, y0, y1):
    """Relève les spans d'une zone, pour les redessiner ailleurs à l'identique."""
    out = []
    for b in page.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                if y0 <= s["origin"][1] <= y1:
                    out.append({"x": s["bbox"][0], "base": s["origin"][1],
                                "texte": s["text"], "gras": "Bold" in s["font"],
                                "taille": s["size"], "couleur": s["color"]})
    return sorted(out, key=lambda s: (s["base"], s["x"]))


# ══════════════════════════════════════════════════════════════════════════
def devis():
    doc = pymupdf.open(f"{ORIG}/DEVIS-ATR-2026-0005-ClubElevia.pdf")

    # ── Page 1, bandeau d'en-tête ────────────────────────────────────────
    p = doc[0]
    efface(p, (365, 116.0, 548, 130.0))
    prep(p)
    txt = "Valable jusqu'au 30 septembre 2026"
    put(p, 457.1 - wide(txt, True, 7.5) / 2, 126.0, txt, True, 7.5, 8016384)

    # ── Page 5, clause « Frais de tiers » : la réserve y est ajoutée ─────
    p = doc[4]
    efface(p, (73.0, 682.0, 540, 696.5), (73.0, 699.0, 540, 745.0))
    prep(p)
    couler(p, [("prestation de conception et de développement. " + RESERVE,
                False, 1711915, False)],
           x=73.8, baseline=692.4, gauche=73.8, droite=537.6,
           interligne=15.0, size=9.0)
    # le bloc « Publication sur les stores » redescend d'un interligne,
    # ligne à ligne, pour que la mise en page d'origine soit conservée.
    for x, base, texte, bold, col in [
        (73.8, 710.2, "Publication sur les stores (Phase 5) :", True, 924203),
        (260.7, 710.2, " Hors périmètre du présent devis, conformément à l'Avenant",
         False, 1711915),
        (73.8, 726.0, "n°1 au Contrat. L'architecture est conçue pour faciliter "
         "l'intégration App Store (iOS) et Google Play", False, 1711915),
        (73.8, 741.0, "(Android) lors de l'extension mobile, qui fera l'objet "
         "d'un devis séparé.", False, 1711915),
    ]:
        put(p, x, base + 15.0, texte, bold, 9.0, col)

    # ── Page 6, clause « Validité » ──────────────────────────────────────
    # Le cadre beige s'arrête à 72,0 et le suivant commence à 87,8 : deux
    # lignes, pas trois. La phrase d'intégrité reste sur l'Avenant, seul
    # document dont le contenu a grossi de révision en révision.
    p = doc[5]
    seg = [("Ce devis est valable jusqu'au", False, 1711915, False),
           ("30 septembre 2026", True, 924203, False),
           (". " + CADUCITE, False, 1711915, True)]
    efface(p, (119.0, 27.0, 540, 41.5), (73.0, 42.5, 540, 57.0))
    prep(p)
    depart = 119.1 + wide(" ", False, 9.0)
    tient_en(p, seg, depart, 73.8, 534.5, 9.0, 2, "Devis, clause Validité")
    couler(p, seg, x=depart, baseline=38.2, gauche=73.8, droite=534.5,
           interligne=15.0, size=9.0)

    # ── Page 6, pied de page ─────────────────────────────────────────────
    pied = ("Devis N° ATR-2026-0005 Révision 6 — Projet Club privé Élévia — "
            "Valable jusqu'au 30 septembre 2026")
    efface(p, (100, 375.0, 512, 389.5))
    prep(p)
    put(p, 306 - wide(pied, False, 7.5) / 2, 385.5, pied, False, 7.5, 7041664)

    out = f"{DOSSIER}/DEVIS-ATR-2026-0005-ClubElevia.pdf"
    doc.save(out, garbage=3, deflate=True)
    print("Devis écrit :", out)


# ══════════════════════════════════════════════════════════════════════════
def avenant():
    doc = pymupdf.open(f"{ORIG}/AVENANT-01-ClubElevia.pdf")

    # ── Page 1, préambule : neuf lignes d'historique deviennent trois ────
    p = doc[0]
    seg = [("Révision 4 du 4 septembre 2026.", True, 5975046, False),
           (" L'adhésion et son encaissement sont compris dans le périmètre livré, "
            "sans supplément de prix. " + CADUCITE + " ", False, 7877903, False),
           (INTEGRITE, True, 5975046, False)]
    efface(p, (66, 425.0, 546, 552.0))
    n = couler(p, seg, 73.0, 0, 73.0, 536.4, 0, 8.6, essai=True)
    bas = 437.2 + (n - 1) * 13.5 + (556.1 - 544.5)
    # le cadre crème se resserre sur le nouveau texte
    p.draw_rect(pymupdf.Rect(55, 414.0, 556, 562.0), color=None, fill=(1, 1, 1))
    p.draw_rect(pymupdf.Rect(61.9, 420.4, 550.1, bas),
                fill=(1.0, 0.9843, 0.9216), color=(0.9922, 0.9020, 0.5412),
                width=0.75)
    prep(p)
    couler(p, seg, x=73.0, baseline=437.2, gauche=73.0, droite=536.4,
           interligne=13.5, size=8.6)

    # ── Page 3, Article 10 : la réserve sur les frais d'exploitation ─────
    p = doc[2]
    prep(p)
    VERT_FOND, VERT_BARRE = (0.9098, 0.9608, 0.9137), (0.2980, 0.6863, 0.3137)
    BORDURE = (0.8980, 0.9059, 0.9216)
    p.draw_rect(pymupdf.Rect(55, 691.0, 560, 713.0), color=None, fill=(1, 1, 1))
    p.draw_rect(pymupdf.Rect(75.4, 691.0, 537.8, 712.4), color=None, fill=VERT_FOND)
    p.draw_rect(pymupdf.Rect(74.2, 691.0, 76.5, 712.4), color=None, fill=VERT_BARRE)
    cadre = pymupdf.Rect(61.9, 520.1, 550.1, 721.8)
    p.draw_rect(cadre, color=BORDURE, width=0.75,
                radius=5.65 / min(cadre.width, cadre.height))
    couler(p, [(RESERVE, False, 1327130, False)],
           x=85.8 + wide("dans le devis relatif à la Phase 5.", False, 9.0)
             + wide(" ", False, 9.0),
           baseline=687.0, gauche=85.8, droite=529.5, interligne=14.2, size=9.0)

    # ── Page 10, renvoi au Devis : « qui remplace la révision 5 » saute ──
    p = doc[9]
    efface(p, (70, 500.0, 542, 590.0))
    prep(p)
    couler(p, [("ni la répartition des tranches. Conformément à l'Article 4 du "
                "Contrat (« Les dates précises seront fixées dans le devis ») et à "
                "son Article 7 (« Le montant total sera fixé dans le devis »), ces "
                "éléments sont fixés par le ", False, 3616931, False),
               ("Devis ATR-2026-0005 révision 6", True, 1973114, False),
               (" : prix total de ", False, 3616931, False),
               ("3 000 €", True, 1973114, False),
               (" (dont 950 € déjà réglés au 3 août 2026), durée de réalisation "
                "estimée à ", False, 3616931, False),
               ("40 jours ouvrés", True, 1973114, False),
               (" de production effective, et règlement en ", False, 3616931, False),
               ("4 tranches", True, 1973114, False),
               (" suivant la répartition 30 / 30 / 30 / 10 recommandée à "
                "l'Article 7.", False, 3616931, False)],
           x=74.5, baseline=509.2, gauche=74.5, droite=537.2,
           interligne=15.0, size=9.0)

    # ── Page 11, bon pour accord ─────────────────────────────────────────
    p = doc[10]
    seg = [("Les Parties reconnaissent avoir pris connaissance du présent avenant "
            "et l'acceptent sans réserve. " + CADUCITE + " Il fait partie intégrante "
            "du Contrat de prestation relatif au projet Club Privé Élévia.",
            False, 7041664, False)]
    efface(p, (70, 62.0, 542, 108.0))
    prep(p)
    tient_en(p, seg, 75.3, 75.3, 528.0, 9.0, 3, "Avenant, bon pour accord")
    couler(p, seg, x=75.3, baseline=74.2, gauche=75.3, droite=528.0,
           interligne=14.3, size=9.0)

    out = f"{DOSSIER}/AVENANT-01-ClubElevia.pdf"
    doc.save(out, garbage=3, deflate=True)
    print("Avenant écrit :", out)


# ══════════════════════════════════════════════════════════════════════════
def cdc():
    doc = pymupdf.open(f"{ORIG}/CDC-ATR-2026-0005-ClubElevia.pdf")

    # ── Page 2, section 0 : l'archéologie des révisions saute, et le
    #    vocabulaire aboli disparaît du texte qui l'abolit ───────────────
    p = doc[1]
    gardes = spans_de(p, 120.0, 360.0)
    for s in gardes:
        if s["texte"].startswith(". Ce document ne les appelle plus"):
            s["texte"] = "."
    gardes = [s for s in gardes if s["texte"] != "V3 »."]
    D1, SAUT = 60.2, 14.3

    def remonte(base):
        return base - D1 - (SAUT if base > 282.8 else 0)

    # le dernier paragraphe était coupé en quatre dans l'original, la phrase en
    # gras seule sur sa ligne et la virgule ouvrant la suivante : on le récrit au
    # fil du texte pendant qu'on y est.
    final = [("Enfin, une mention comme « CDC révision 5 » ou « Devis révision 6 » "
              "ne désigne ni une phase, ni une étape du produit : c'est le ",
              False, 1711915, False),
             ("numéro de révision du document lui-même", True, 1711915, False),
             (", qui change à chaque correction apportée au texte.",
              False, 1711915, True)]
    gardes = [s for s in gardes if s["base"] < 300.0]
    base_final = remonte(303.0)
    n_final = couler(p, final, 74.5, 0, 74.5, 541.0, 0, 9.4, essai=True)
    bas = max(max(remonte(s["base"]) for s in gardes),
              base_final + (n_final - 1) * 15.0) + 12.0
    efface(p, (66, 33.0, 546, 358.0))
    # le pavé crème, son filet doré et les trois puces suivent le texte
    p.draw_rect(pymupdf.Rect(55, 27.0, 556, 366.0), color=None, fill=(1, 1, 1))
    p.draw_rect(pymupdf.Rect(62.62, 27.75, 550.5, bas), color=None,
                fill=(1.0, 0.9922, 0.9608))
    p.draw_rect(pymupdf.Rect(61.5, 27.75, 63.75, bas), color=None,
                fill=(0.7882, 0.6588, 0.2980))
    for y in (121.5, 179.25, 237.75):
        p.draw_rect(pymupdf.Rect(75.75, y - D1, 78.75, y - D1 + 3.0),
                    color=None, fill=(0.1020, 0.1216, 0.1686))
    prep(p)
    put(p, 74.5, 45.8, "Ce vocabulaire s'applique à tous les documents du dossier.",
        True, 9.4, 1711915)
    for s in gardes:
        put(p, s["x"], remonte(s["base"]), s["texte"], s["gras"],
            s["taille"], s["couleur"])
    couler(p, final, x=74.5, baseline=base_final, gauche=74.5, droite=541.0,
           interligne=15.0, size=9.4)

    # ── Page 6, hors périmètre : ni « devis V2 », ni « architecture V1 » ─
    p = doc[5]
    efface(p, (125, 547.0, 540, 586.0))
    prep(p)
    couler(p, [("Application mobile native iOS/Android, publication App Store et "
                "Google Play. Non incluse dans la présente prestation ; fera "
                "l'objet d'un devis séparé. L'architecture de la Web App est "
                "conçue pour faciliter cette évolution.", False, 1711915, False)],
           x=128.5, baseline=555.8, gauche=128.5, droite=533.7,
           interligne=12.7, size=8.6)

    # ── Page 12, Module 5 : on garde le prix, on retire l'historique ─────
    p = doc[11]
    titre = "Compris dans le prix, sans supplément."
    corps = [("L'adhésion et le paiement entrent dans les 3 000 € du présent "
              "cahier des charges.", False, 1711915, False)]
    efface(p, (80, 96.0, 540, 176.0))
    # le pavé crème se resserre : deux lignes au lieu de cinq
    p.draw_rect(pymupdf.Rect(70, 88.0, 542, 188.0), color=None, fill=(1, 1, 1))
    p.draw_rect(pymupdf.Rect(75.4, 92.2, 537.8, 141.0), color=None,
                fill=(1.0, 0.9922, 0.9608))
    prep(p)
    put(p, 87.3, 110.2, titre, True, 9.4, 1711915)
    couler(p, corps, x=87.3, baseline=126.8, gauche=87.3, droite=526.8,
           interligne=15.0, size=9.0)

    # ── Page 15, hors périmètre : « uniquement en V1 » ───────────────────
    p = doc[14]
    efface(p, (84, 178.0, 290, 191.0))
    prep(p)
    put(p, 86.5, 187.5, "manuelle sur signalement uniquement", False, 8.6, 1711915)

    # ── Page 18, intertitre ──────────────────────────────────────────────
    p = doc[17]
    efface(p, (59, 246.0, 200, 259.0))
    prep(p)
    put(p, 61.8, 255.8, "TRADUCTION DANS LA WEB APP", True, 8.6, 924203)

    # ── Page 20, feuille de route : plus de « V3 » ni de « V2 » ──────────
    p = doc[19]
    efface(p, (59, 248.0, 548, 307.0))   # la 4e ligne « lourd. » comprise
    prep(p)
    couler(p, [("conciergerie et les expériences n'ont de sens qu'avec une "
                "communauté active : les construire trop tôt reviendrait à équiper "
                "une maison vide. Elles sont positionnées dans les évolutions "
                "ultérieures de la feuille de route indicative ci-dessus, à "
                "l'exception du réseau de partenaires, qui peut être amorcé dès "
                "l'extension mobile sans développement lourd.", False, 1711915, False)],
           x=61.8, baseline=257.2, gauche=61.8, droite=543.8,
           interligne=15.0, size=9.4)

    # ── Page 20, pied de page ────────────────────────────────────────────
    efface(p, (70, 625.0, 542, 650.0))
    prep(p)
    for texte, base in [
        ("Cahier des charges N° CDC-ATR-2026-0005 — Révision 5 (mise à jour du "
         "04/09/2026) — Annexe au Devis révision 6 et au", 634.5),
        ("Contrat — Projet Club privé Élévia", 647.2),
    ]:
        put(p, 306 - wide(texte, False, 7.5) / 2, base, texte, False, 7.5, 7041664)

    out = f"{DOSSIER}/CDC-ATR-2026-0005-ClubElevia.pdf"
    doc.save(out, garbage=3, deflate=True)
    print("CDC écrit :", out)


# ══════════════════════════════════════════════════════════════════════════
def controle():
    """Rien ne sort sans relecture automatique."""
    import re
    attendu = {
        "DEVIS-ATR-2026-0005-ClubElevia.pdf": (
            ["30 septembre 2026", "commissions et frais de transaction",
             "Révision 6", "annule et remplace toute version antérieure"],
            ["28 août 2026", "ATR-2026-0005 V5", "valable 30 jours",
             "révision V4", "du 9 juillet 2026"]),
        "AVENANT-01-ClubElevia.pdf": (
            ["Révision 4", "commissions et frais de transaction",
             "annule et remplace toute version antérieure",
             "sans supplément de prix"],
            ["17 juillet", "Articles 8, 12, 15 et 16",
             "qui remplace la révision 5"]),
        "CDC-ATR-2026-0005-ClubElevia.pdf": (
            ["Révision 5", "04/09/2026", "3 000 €"],
            ["Révision V5", "17/07/2026", "Section ajoutée à la révision",
             "Module ajouté à la révision", "Les révisions précédentes"]),
    }
    def lire(nom):
        # les retours à la ligne du PDF coupent les phrases : on aplatit
        brut = "".join(pg.get_text() for pg in pymupdf.open(f"{DOSSIER}/{nom}"))
        return re.sub(r"\s+", " ", brut)

    ok = True
    for nom, (doit, interdit) in attendu.items():
        texte = lire(nom)
        for m in doit:
            n = len(re.findall(re.escape(m), texte, re.I))
            ok &= n > 0
            print(f"  {'OK    ' if n else 'MANQUE'} {nom} : « {m} » x{n}")
        for m in interdit:
            n = len(re.findall(re.escape(m), texte, re.I))
            ok &= n == 0
            print(f"  {'OK    ' if not n else 'RESTE '} {nom} : plus de « {m} » ({n})")
    for nom in attendu:
        n = len(re.findall(r"(?<![A-Za-z])V[123](?![0-9])", lire(nom)))
        ok &= n == 0
        print(f"  {'OK    ' if not n else 'RESTE '} {nom} : plus de V1/V2/V3 ({n})")
    print("Contrôle :", "tout est conforme" if ok else "ÉCART DÉTECTÉ")
    return ok


if __name__ == "__main__":
    devis()
    avenant()
    cdc()
    controle()
