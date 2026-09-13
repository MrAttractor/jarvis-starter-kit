// La Beynaumania — service worker
// Installabilité, repli hors-ligne, et notifications.
//
// Le gestionnaire de notification manquait jusqu'au 13/09 : le fichier ne
// faisait que du cache. Serge publiait, et personne n'était prévenu.

const CACHE = 'beynaumania-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request))
  );
});

// ---------- Une publication arrive ----------
self.addEventListener('push', (e) => {
  // Un push sans contenu lisible reste un push : on affiche quelque chose
  // plutôt que rien. Un navigateur qui reçoit une notification et n'affiche
  // rien peut révoquer la permission.
  let d = { titre: 'La Beynaumania', corps: 'Du nouveau chez Serge.', url: '/beynaud/fan' };
  try { if (e.data) d = Object.assign(d, JSON.parse(e.data.text())); } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(d.titre, {
      body: d.corps,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      // Un seul fil de notifications : une nouvelle remplace la précédente
      // au lieu d'empiler dix lignes dans le volet du téléphone.
      tag: 'beynaumania',
      renotify: true,
      data: { url: d.url || '/beynaud/fan' },
    })
  );
});

// ---------- Le fan tape la notification ----------
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const cible = (e.notification.data && e.notification.data.url) || '/beynaud/fan';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      // Si la Beynaumania est déjà ouverte quelque part, on la ramène au
      // premier plan plutôt que d'ouvrir un deuxième onglet.
      for (const f of fenetres) {
        if (f.url.indexOf('/beynaud/') !== -1 && 'focus' in f) return f.focus();
      }
      return self.clients.openWindow(cible);
    })
  );
});
