
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Registrazione del Service Worker con percorso relativo per supportare preview environments
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usiamo './sw.js' invece di '/sw.js' per evitare conflitti di origine in ambienti di anteprima
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registrato con successo: ', registration.scope);
    }).catch(err => {
      // Silenziamo l'errore se siamo in un ambiente che non supporta SW (come alcuni iframe di anteprima)
      console.warn('Registrazione SW non riuscita (probabile ambiente di anteprima): ', err.message);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
