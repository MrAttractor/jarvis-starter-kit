/* ════════════════════════════════════════════════════════════════
   Le mouvement du site. 1 Ko, aucune dépendance.

   Règle tenue partout : si ce fichier ne se charge pas, la page reste
   entièrement lisible. La classe `js` n'est posée que si le script part,
   et c'est elle seule qui rend les blocs invisibles au départ.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var cibles = document.querySelectorAll('.reveler');
  if (!cibles.length) return;

  // Quelqu'un qui a demandé moins d'animations voit tout, tout de suite.
  var sobre = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (sobre || !('IntersectionObserver' in window)) {
    for (var i = 0; i < cibles.length; i++) cibles[i].classList.add('vu');
    return;
  }

  var oeil = new IntersectionObserver(function (entrees) {
    for (var j = 0; j < entrees.length; j++) {
      if (entrees[j].isIntersecting) {
        entrees[j].target.classList.add('vu');
        oeil.unobserve(entrees[j].target);   // une seule fois : ça ne rejoue pas en remontant
      }
    }
  }, {
    // Le bloc se révèle avant d'arriver au bord, sinon on voit l'animation
    // se déclencher sous ses yeux au lieu de la trouver déjà faite.
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.08
  });

  for (var k = 0; k < cibles.length; k++) oeil.observe(cibles[k]);
})();
