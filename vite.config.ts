
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carica tutte le variabili d'ambiente, comprese quelle senza prefisso VITE_
    // Fix: Using '.' instead of process.cwd() to avoid type definition issues with the process global
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Inietta la chiave nel bundle client
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          // Fix: Using '.' for path resolution as __dirname is not defined in standard ES module environments
          '@': path.resolve('.'),
        }
      }
    };
});
