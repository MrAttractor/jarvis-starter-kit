# -*- coding: utf-8 -*-
"""Met en signature le package Élévia à jour (Avenant révision 4, CDC révision 5,
   Devis révision 6), le 06/09/2026.

Pourquoi un nouveau dossier et pas une mise à jour de l'ancien : la signature de
Mac Arthur du 01/09 est scellée sur l'empreinte des documents d'alors. Remplacer
ces documents sous sa signature la rendrait invérifiable. L'ancien dossier reste
donc intact, avec sa preuve, et un dossier neuf porte les bonnes versions.

Les fichiers sont déposés dans un dossier de stockage neuf : les adresses de
l'ancien dossier ne bougent pas, son contrôle d'intégrité reste vrai.
"""
import hashlib
import json
import os
import pathlib
import secrets
import urllib.error
import urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "livrables/clients/club-elevia"

env = {}
for ligne in (RACINE / ".env").read_text(encoding="utf-8").splitlines():
    if "=" in ligne and not ligne.lstrip().startswith("#"):
        k, v = ligne.split("=", 1)
        env[k.strip()] = v.strip()

URL = env["SUPABASE_URL"].rstrip("/")
SERVICE = env["SUPABASE_SERVICE_ROLE_KEY"]
ADMIN = env["SIGN_ADMIN_SECRET"]
BUCKET = "documents-signature"
# PREFIXE_ELEVIA permet de rejouer la mise en signature sans redéposer les fichiers.
PREFIXE = os.environ.get("PREFIXE_ELEVIA") or "elevia-rev456-" + secrets.token_hex(12)

DOCUMENTS = [
    ("AVENANT-01-ClubElevia.pdf",
     "Avenant n°1 (révision 4) — Périmètre, données, réception et mise en production",
     "AVENANT-01 révision 4"),
    ("DEVIS-ATR-2026-0005-ClubElevia.pdf",
     "Devis — Club privé Élévia, Web App",
     "ATR-2026-0005 révision 6"),
    ("CDC-ATR-2026-0005-ClubElevia.pdf",
     "Cahier des charges fonctionnel",
     "CDC-ATR-2026-0005 révision 5"),
]

MESSAGE = ("Bonjour Élise, voici la version à jour des trois documents, celle qui "
           "correspond à ce que nous nous sommes dit. Ce lien remplace le précédent : "
           "merci de ne plus utiliser l'ancien. Il est valable jusqu'au 30 septembre.")


def appel(url, corps=None, entetes=None, methode=None, brut=False):
    donnees = corps if isinstance(corps, (bytes, type(None))) else \
        json.dumps(corps).encode("utf-8")
    req = urllib.request.Request(url, data=donnees, method=methode)
    req.add_header("User-Agent", "curl/8.4.0")
    for k, v in (entetes or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            contenu = r.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise SystemExit(f"HTTP {e.code} sur {url}\n{detail}")
    return contenu if brut else json.loads(contenu or b"{}")


def deposer(nom_fichier):
    octets = (DOSSIER / nom_fichier).read_bytes()
    chemin = f"{PREFIXE}/{nom_fichier}"
    appel(f"{URL}/storage/v1/object/{BUCKET}/{chemin}", octets,
          {"Authorization": f"Bearer {SERVICE}", "Content-Type": "application/pdf",
           "x-upsert": "true"})
    public = f"{URL}/storage/v1/object/public/{BUCKET}/{chemin}"
    relu = appel(public, brut=True)
    if hashlib.sha256(relu).hexdigest() != hashlib.sha256(octets).hexdigest():
        raise SystemExit(f"{nom_fichier} : le fichier relu depuis le stockage diffère.")
    print(f"  déposé  {nom_fichier}  ({len(octets)} o, "
          f"sha256 {hashlib.sha256(octets).hexdigest()[:16]}…)")
    return public


def main():
    print(f"Dépôt dans {BUCKET}/{PREFIXE}")
    documents = []
    for i, (fichier, nom, reference) in enumerate(DOCUMENTS, start=1):
        documents.append({"nom": nom, "reference": reference,
                          "url": deposer(fichier), "ordre": i})

    print("\nMise en signature…")
    reponse = appel(
        f"{URL}/functions/v1/sign-create",
        {"secret": ADMIN,
         "reference": "ATR-2026-0005",
         "titre": "Package contractuel Club privé Élévia",
         "client": "Club privé Élévia — Web App",
         "message": MESSAGE,
         "expire_jours": 25,
         "documents": documents,
         "signataires": [
             {"nom": "Elise CAPEL", "email": "elisepelagie@outlook.be",
              "qualite": "Fondatrice d'ÉLÉVIA", "role": "client", "ordre": 1},
             {"nom": "Mac Arthur KOUASSI", "email": "hello@agenceattractor.com",
              "qualite": "Agence Mr Attractor", "role": "prestataire", "ordre": 2},
         ]},
        {"Authorization": f"Bearer {SERVICE}", "Content-Type": "application/json"})

    if not reponse.get("ok"):
        raise SystemExit(f"Échec : {reponse}")

    print(f"\nDossier créé : {reponse['dossier_id']}")
    for d in reponse["documents"]:
        print(f"  scellé  {d['hash'][:16]}…  {d['nom']}")
    print()
    for lien in reponse["liens"]:
        print(f"  {lien['role']:<12} {lien['nom']:<20} {lien['url']}")
    (RACINE / "scripts/_dossier_signature.json").write_text(
        json.dumps(reponse, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
