# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-05-28

### Organisation workspace + principe Attractor Assists
- Réécriture d'un prompt template (livré dans un .docx) pour l'aligner sur l'agence Mr Attractor : le template générique parlait de "cabinet Chatflow", "lApreneur Académie" et YouTube (pas ses business). Prompt aligné sauvegardé dans `context/import/prompt-organisation-workspace.md`.
- Structure `livrables/` proposée : `clients/`, `ecosysteme-attractor/`, `commercial/`, `contenu/`. Gestion des secrets adaptée à sa stack (ajout Wave/CinetPay pour mobile money CI/diaspora, retrait YouTube).
- Décision stratégique notée : ce workspace Jarvis sert de prototype à l'app Attractor Assists. Tout ce qui est validé pour Mac Arthur sera réinjecté dans l'app. Une refonte d'Attractor Assists est envisagée.

### Session de mise en place (connecteurs, inventaire, premier deal)
- Sécurité : rotation de la clé API Claude (exposée en clair dans l'Apps Script), déplacée dans les Propriétés du script. Test OK (HTTP 200).
- Connecteurs branchés : Google Drive/Sheets, Gmail, Google Agenda, Notion, Canva. Agenda/Gmail confirmés sur le compte pro myattractor1. Accès confirmé à la MasterSheet "SYSTEME ATTRACTOR".
- Clarification des 3 comptes : myattractor1@gmail.com (pro), nguessankouassi@gmail.com (perso), kouassi@outlook.fr (Canva).
- Inventaire des Projects Claude.ai : ~8 apps métiers déjà construites (NABYCOOK, MY NUGO, LS EXPERTISE, J'envoie Express, OLIVE MAFO, Cèchémoi, MIX PREMIER, INTIM CONFORT). Constat : pas un problème de production mais de dispersion et de packaging.
- Premier deal travaillé : J'envoie Express (MVP, 230€, acompte 130€ le 3 juin). Le client a closé après présentation d'une maquette.
- Mécanisme de vente identifié et validé : "maquette-first". Décision de l'industrialiser via une skill `maquette-closer`.
- Décision : bâtir une équipe d'agents IA (employés de l'agence) par vagues, à commencer par le pôle closing et livraison.

### Installation initiale du Jarvis
- Workspace personnalisé pour Mac Arthur (marque Mr Attractor), basé dans le 77 (Seine-et-Marne), travaille à Montreuil.
- Profil principal : mix salarié (CDD 3 ans DGFiP, service recouvrement, macros et procédures collectives) + entrepreneur, l'agence étant la priorité de fond.
- Activité : agence de business et développement humain, écosystème d'apps ATTRACTOR (Attractor Assists, Livraison Pro, Fidelys, pilotage) en freemium + web apps métiers sur mesure (conception + MRR). Cible : Côte d'Ivoire et diaspora en France.
- Objectifs court terme : 10 000 €/mois d'ici fin août 2026, reconstruction et déploiement d'Attractor Assists, vente directe des app métiers, lancement mensuel d'une app.
- Vision long terme : 2027 système autonome + 15 000 €/mois + 1000 utilisateurs actifs + certification coach ; 2028 sortie de la fonction publique et installation au Canada, 120 projets sur 3 continents ; projet associatif de bibliothèques en Afrique.
- Projets actifs : montée en compétences Claude Code, vente d'app métiers, développement écosystème Attractor, plan de campagne de contenu.
- Domaine d'aide prioritaire : mise en place du système de vente automatisé.
- Style de communication choisi : mélange selon le contexte, avec recentrage sur la vision et le plan quand les sujets se dispersent.
- Détail des offres et tarifs archivé dans `context/import/offre-attractor.md`.
