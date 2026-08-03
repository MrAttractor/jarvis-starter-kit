/* ============================================================
   DEMO PALIERS — la visite guidée
   Un seul objet sert deux publics : le spectateur sait où il en est,
   l'orateur sait où aller. L'étape vit dans l'URL (?live=N), donc elle
   survit au changement de page et le lien peut être repris tel quel.

   Le scénario suit le palier pro : c'est celui qui montre le plus de
   choses sans avoir à expliquer la gestion d'équipe.
   ============================================================ */

const ETAPES = [
  {
    url: '/demo/avant/',
    titre: 'Le problème, avant de parler d’outil',
    dit: 'À gauche, votre journée aujourd’hui. Le même prix redonné dix fois, une commande vue trop tard.',
    cible: '.colonne--avant'
  },
  {
    url: '/demo/pro/',
    titre: 'Ce que verrait votre cliente',
    dit: 'Elle ouvre un lien. Rien à installer, rien à créer comme compte.',
    cible: '.entete'
  },
  {
    url: '/demo/pro/',
    titre: 'Elle voit les prix, elle ne les demande plus',
    dit: 'Le prix est écrit. La quantité restante aussi. Vous ne répondez plus à cette question.',
    cible: '.grille'
  },
  {
    url: '/demo/pro/',
    titre: 'Elle commande elle-même',
    dit: 'Elle choisit, elle laisse son nom et son quartier. Personne ne saisit rien à la main.',
    cible: '#panierBarre',
    astuce: 'Ajoutez deux produits depuis votre téléphone avant de cliquer sur Suivant.'
  },
  {
    url: '/demo/pro/admin/',
    titre: 'La commande tombe chez vous',
    dit: 'Avec le nom, le numéro et le quartier. Elle reste en tête tant qu’elle n’est pas traitée.',
    vue: 'commandes',
    cible: '#vue-commandes .bloc:last-child'
  },
  {
    url: '/demo/pro/admin/',
    titre: 'Le stock a baissé tout seul',
    dit: 'Personne n’a rien recompté. Et sous le seuil, l’écran vous alerte avant la rupture.',
    vue: 'stock',
    cible: '#vue-stock'
  },
  {
    url: '/demo/pro/livreur/',
    titre: 'Le livreur reçoit sa tournée',
    dit: 'Un lien, pas de compte. Il voit l’adresse et le numéro, ni vos prix ni vos autres commandes.',
    cible: '#liste',
    astuce: 'Passez d’abord une commande en livraison depuis le tableau de bord.'
  },
  {
    url: '/demo/pro/admin/',
    titre: 'Le soir, le chiffre est là',
    dit: 'Sans cahier, sans calcul. Et vous savez enfin ce qui se vend le mieux.',
    vue: 'stats',
    cible: '#vue-stats .stats'
  },
  {
    url: '/demo/',
    titre: 'Ce que ça coûte',
    dit: 'Trois formules. On prend la plus petite qui règle votre problème d’aujourd’hui.',
    cible: '#paliers'
  }
];

(function visiteGuidee() {
  const params = new URLSearchParams(location.search);
  if (!params.has('live')) return;

  document.documentElement.classList.add('live');

  const n = Math.min(Math.max(parseInt(params.get('live'), 10) || 1, 1), ETAPES.length);
  const etape = ETAPES[n - 1];

  const lien = (i) => {
    const e = ETAPES[i - 1];
    return e ? `${e.url}?live=${i}` : null;
  };

  function barre() {
    const el = document.createElement('div');
    el.className = 'scenario';
    el.innerHTML = `
      <div class="scenario__haut">
        <span class="scenario__num">Étape ${n} / ${ETAPES.length}</span>
        <div class="scenario__txt">
          <div class="scenario__titre">${etape.titre}</div>
          <div class="scenario__dit">${etape.astuce ? '↳ ' + etape.astuce : etape.dit}</div>
        </div>
        <div class="scenario__nav">
          <a class="scenario__btn" ${n > 1 ? `href="${lien(n - 1)}"` : 'aria-disabled="true"'}>← Précédent</a>
          <a class="scenario__btn scenario__btn--fort" ${n < ETAPES.length ? `href="${lien(n + 1)}"` : 'aria-disabled="true"'}>Suivant →</a>
        </div>
      </div>
      <div class="scenario__jauge"><span style="width:${Math.round(n / ETAPES.length * 100)}%"></span></div>`;
    document.body.appendChild(el);
  }

  /* La cible n'existe pas toujours au moment où la page se monte :
     les vues du tableau de bord sont rendues après un appel réseau.
     On réessaie quelques fois plutôt que de rater la mise en évidence. */
  function viser(selecteur, essais = 24) {
    const el = document.querySelector(selecteur);
    if (!el) {
      if (essais > 0) setTimeout(() => viser(selecteur, essais - 1), 250);
      return;
    }
    document.querySelectorAll('.projecteur').forEach(e => e.classList.remove('projecteur'));
    el.classList.add('projecteur');
    const y = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  function ouvrirVue(cle, essais = 24) {
    const onglet = document.querySelector(`.onglet[data-vue="${cle}"]`);
    if (!onglet) {
      if (essais > 0) setTimeout(() => ouvrirVue(cle, essais - 1), 250);
      return;
    }
    if (!onglet.classList.contains('onglet--actif')) onglet.click();
  }

  function demarrer() {
    barre();
    if (etape.vue) ouvrirVue(etape.vue);
    if (etape.cible) setTimeout(() => viser(etape.cible), etape.vue ? 700 : 400);

    /* Les flèches du clavier font avancer la visite : en projection,
       on ne veut pas viser un bouton à la souris devant son public. */
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'ArrowRight' && n < ETAPES.length) location.href = lien(n + 1);
      if (e.key === 'ArrowLeft' && n > 1) location.href = lien(n - 1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
