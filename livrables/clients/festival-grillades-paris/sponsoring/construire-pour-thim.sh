#!/bin/sh
# Construit les documents de RESERVE, ceux qui serviront au moment de chiffrer.
# Les courriers prets a envoyer, eux, sont produits par construire-lettre.py
# et vivent dans a-envoyer/.
#
# A relancer apres toute modification des sources : les .docx sont des produits
# derives, ils ne se corrigent jamais a la main, sinon la source et l'envoi
# divergent.
#
# Regle de composition du dossier pour-thim/ : il ne contient QUE ce qui part.
# La note interne de campagne, le plancher de negociation et les scenarios de
# recettes restent dans le dossier de travail et n'entrent pas ici.
#
# Usage, depuis la racine du depot :
#   sh livrables/clients/festival-grillades-paris/sponsoring/construire-pour-thim.sh

set -e
ICI=$(cd "$(dirname "$0")" && pwd)
RACINE=$(cd "$ICI/../../../.." && pwd)
OUT="$ICI/reserve"
MD="python $RACINE/scripts/md2docx.py"
HTML="python $RACINE/scripts/html2docx.py"
PIED="Festival des Grillades de Paris, 2e edition, 11 octobre 2026"
PIED_INT="Document de travail, version du 19 aout 2026"

mkdir -p "$OUT"
# Un fichier ouvert dans Word est verrouille : on ne s'arrete pas pour autant,
# on signale a la fin lequel n'a pas pu etre refait.
VERROUS=""
for d in "$OUT"/*.docx; do
  [ -e "$d" ] || continue
  rm -f "$d" 2>/dev/null || VERROUS="$VERROUS $(basename "$d")"
done
gen() {
  cible=""
  for a in "$@"; do case "$a" in *.docx) cible="$a";; esac; done
  if ! "$@" 2>/dev/null; then VERROUS="$VERROUS $(basename "$cible")"; fi
}

gen $MD "$ICI/NOTE-ACCOMPAGNEMENT-THIM.md" "$OUT/00-A-lire-dabord.docx" \
  --titre "Campagne de sponsoring, edition de Paris" \
  --sous "Ce qui vous est remis, ce qui reste a decider, et par quoi commencer" \
  --auteur "Agence Mr Attractor" --pied "$PIED_INT"

gen $HTML "$ICI/dossier-sponsoring.html" "$OUT/01-Dossier-de-partenariat.docx" \
  --pied "$PIED"

gen $MD "$ICI/LETTRE-SOLLICITATION.md" "$OUT/02-Lettre-type-de-sollicitation.docx" \
  --titre "Lettre type de sollicitation de partenariat" \
  --sous "Un modele, neuf accroches selon le metier du destinataire" \
  --avert "Modele. Tout ce qui est surligne en jaune est a completer avant envoi. Aucun montant ne figure dans la lettre : le prix se lit dans le dossier de partenariat, apres l'argument." \
  --pied "$PIED"

gen $MD "$ICI/MESSAGES-ET-RELANCES.md" "$OUT/03-Messages-appels-et-relances.docx" \
  --titre "Messages, appels et relances" \
  --sous "Tout ce qui se dit avant le rendez-vous" \
  --avert "Le dossier de partenariat ne s'envoie jamais en piece jointe d'un premier message froid. On obtient d'abord un echange." \
  --pied "$PIED"

gen $MD "$ICI/CONVENTION-PARTENARIAT-TYPE.md" "$OUT/04-Convention-de-partenariat-type.docx" \
  --titre "Convention de partenariat, modele type" \
  --sous "Un exemplaire par partenaire, seules les annexes changent" \
  --avert "Modele non relu par un avocat. Deux points doivent l'etre avant le premier envoi : l'article 3 sur les boissons alcooliques et l'article 15 sur la TVA et l'encaissement pour compte de tiers." \
  --pied "$PIED"

gen $MD "$ICI/ATTESTATION-MANDAT-DEMARCHAGE.md" \
  "$OUT/05-Attestation-de-mandat-a-faire-signer.docx" \
  --titre "Attestation de mandat de demarchage" \
  --sous "Une page, a faire signer par Advantage Conseils" \
  --avert "Quatre champs sont a completer avant signature, ils sont surlignes. Cette attestation ne remplace pas le mandat de production et ne dit rien des honoraires." \
  --pied "$PIED"

gen $MD "$ICI/CIBLES-FRANCE-ET-DIASPORA.md" "$OUT/06-Cibles-et-ordre-de-marche.docx" \
  --titre "Cibles de sponsoring, France et diaspora" \
  --sous "Par quoi commencer, l'angle a tenir, et qui decide" \
  --avert "Aucune cible n'est approchee avant d'avoir obtenu de Stephane ATTA la liste des comptes deja engages sur les accords multi-editions." \
  --pied "$PIED_INT"

# Le dossier de partenariat en PDF, imprime depuis la page HTML : c'est la piece
# qui part chez un partenaire, sa mise en page fait partie du livrable.
# Il montre a Thim ce que devient le texte une fois compose, et pourquoi la
# version qui part chez un sponsor se refait chez nous et pas dans Word.
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
if [ -x "$CHROME" ]; then
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$(cd "$OUT" && pwd -W)/01-Dossier-de-partenariat.pdf" \
    "file:///$(cd "$ICI" && pwd -W)/dossier-sponsoring.html" >/dev/null 2>&1
fi

# Les deux pieces contractuelles en PDF, converties par Word.
powershell -NoProfile -ExecutionPolicy Bypass -File "$RACINE/scripts/docx2pdf.ps1"   -Dossier "$(cd "$OUT" && pwd -W)"   -Fichiers "04-Convention-de-partenariat-type.docx,05-Attestation-de-mandat-a-faire-signer.docx"

echo "---"
ls -1 "$OUT"
if [ -n "$VERROUS" ]; then
  echo
  echo "NON REFAITS, ouverts dans Word :$VERROUS"
  echo "Fermer la ou les fenetres Word, puis relancer ce script."
fi
