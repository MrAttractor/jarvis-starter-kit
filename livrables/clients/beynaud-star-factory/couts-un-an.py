# -*- coding: utf-8 -*-
"""Le cout de latiss.net sur un an, sur l'architecture du 20/09/2026.

Les hypotheses sont ecrites en haut et visibles : c'est la premiere chose
qu'un investisseur attaquera, et une hypothese cachee est une hypothese
fausse.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

# ── Les hypotheses, toutes ici ────────────────────────────────────────
OUVERTURES_PAR_MEMBRE_MOIS = 8      # mesure posee le 17/09
PHOTOS_PAR_OUVERTURE = 3
APPELS_PAR_OUVERTURE = 1.3          # le fil + reactions, commentaires
JSON_PAR_APPEL_KO = 7.5             # mesure du 17/09
VIDEOS_EXCLU_PAR_MOIS = 4
DUREE_VIDEO_MIN = 0.5               # 30 secondes
TAUX_DE_VUE = 0.45                  # part des membres qui regardent une video donnee

# ── Les plafonds gratuits ─────────────────────────────────────────────
SUPA_FONCTIONS_GRATUIT = 500_000    # appels par mois
SUPA_SORTIE_GRATUIT_GO = 5
CF_REQUETES_GRATUIT_JOUR = 100_000

# ── Les prix ──────────────────────────────────────────────────────────
SUPA_PRO_MOIS = 25                  # $, couvre TOUS les clients du projet
CF_WORKERS_PAYANT_MOIS = 5
DOMAINE_AN = 11                     # .net au prix coutant chez Cloudflare
STREAM_BASE_MOIS = 5
STREAM_DIFFUSION_1000_MIN = 1.0
STREAM_STOCKAGE_1000_MIN_MOIS = 5.0

def chiffrer(membres):
    ouv = membres * OUVERTURES_PAR_MEMBRE_MOIS
    appels = ouv * APPELS_PAR_OUVERTURE
    sortie_go = ouv * JSON_PAR_APPEL_KO / 1024 / 1024
    req_cf_jour = ouv * (1 + PHOTOS_PAR_OUVERTURE) / 30

    supa = SUPA_PRO_MOIS if appels > SUPA_FONCTIONS_GRATUIT or sortie_go > SUPA_SORTIE_GRATUIT_GO else 0
    cf = CF_WORKERS_PAYANT_MOIS if req_cf_jour > CF_REQUETES_GRATUIT_JOUR else 0

    # La video exclusive, si on l'active un jour.
    min_vues = membres * TAUX_DE_VUE * DUREE_VIDEO_MIN * VIDEOS_EXCLU_PAR_MOIS
    stream = STREAM_BASE_MOIS + min_vues / 1000 * STREAM_DIFFUSION_1000_MIN

    return {
        'membres': membres, 'appels': appels, 'sortie_go': sortie_go,
        'req_cf_jour': req_cf_jour, 'supa': supa, 'cf': cf,
        'socle_mois': supa + cf + DOMAINE_AN / 12,
        'stream_mois': stream, 'min_vues': min_vues,
    }

print('\nHYPOTHESES')
print('  %d ouvertures par membre et par mois, %d photos par ouverture' % (OUVERTURES_PAR_MEMBRE_MOIS, PHOTOS_PAR_OUVERTURE))
print('  %d videos exclusives par mois, de %g min, vues par %d %% des membres'
      % (VIDEOS_EXCLU_PAR_MOIS, DUREE_VIDEO_MIN, TAUX_DE_VUE * 100))

print('\nLE SOCLE — ce que le site coute pour exister')
print('  %-10s %10s %10s %10s | %9s %9s %12s' %
      ('membres', 'appels/mois', 'sortie Go', 'req CF/j', 'Supabase', 'Workers', 'total/mois'))
for m in (1_000, 10_000, 25_000, 50_000, 100_000):
    c = chiffrer(m)
    print('  %-10s %10s %10.2f %10.0f | %8s$ %8s$ %11.0f$' % (
        '{:,}'.format(m).replace(',', ' '), '{:,.0f}'.format(c['appels']).replace(',', ' '),
        c['sortie_go'], c['req_cf_jour'], c['supa'], c['cf'], c['socle_mois']))

# Le point de bascule exact.
bas, haut = 1_000, 200_000
while haut - bas > 100:
    mil = (bas + haut) // 2
    if chiffrer(mil)['supa'] > 0: haut = mil
    else: bas = mil
print('\n  Bascule vers Supabase Pro : autour de %s membres' % '{:,.0f}'.format(haut).replace(',', ' '))

print('\nLA VIDEO EXCLUSIVE — si on active Cloudflare Stream')
print('  %-10s %14s %12s %12s' % ('membres', 'min vues/mois', '$/mois', '$/an'))
for m in (1_000, 10_000, 25_000, 50_000, 100_000):
    c = chiffrer(m)
    print('  %-10s %14s %11.0f$ %11.0f$' % (
        '{:,}'.format(m).replace(',', ' '),
        '{:,.0f}'.format(c['min_vues']).replace(',', ' '),
        c['stream_mois'], c['stream_mois'] * 12))

print('\nLE TOTAL SUR UN AN')
print('  %-10s %14s %16s %14s' % ('membres', 'socle/an', 'avec video/an', 'par membre/an'))
for m in (1_000, 10_000, 25_000, 50_000, 100_000):
    c = chiffrer(m)
    socle = c['socle_mois'] * 12
    total = (c['socle_mois'] + c['stream_mois']) * 12
    print('  %-10s %13.0f$ %15.0f$ %13.2f$' % (
        '{:,}'.format(m).replace(',', ' '), socle, total, total / m))
print('')
