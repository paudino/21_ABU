
// Service Worker disabilitato per risolvere conflitti di deploy su Vercel
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
  // Pass-through semplice senza caching per evitare 404
  return;
});
