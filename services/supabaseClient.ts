
import { createClient } from '@supabase/supabase-js';

// Rilevamento variabili d'ambiente con priorità a import.meta.env (Vite standard)
const SUPABASE_URL = 
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    'https://wcggpscuonhmowvfcdhv.supabase.co';

const SUPABASE_KEY = 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZ2dwc2N1b25obW93dmZjZGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTQ1ODEsImV4cCI6MjA4MDMzMDU4MX0.QwIKLDt3YWySndKHd6OX5EKfmYn3qskDl3cKJ8Mc92A';

// Diagnostica avanzata per Vercel/Produzione
if (typeof window !== 'undefined') {
    console.log("[SUPABASE-INIT] 🛰️ Inizializzazione client...");
    if (window.location.protocol === 'file:') {
        console.warn("[SUPABASE-INIT] ⚠️ Protocollo file:// rilevato. Alcune funzionalità di fetch potrebbero essere bloccate dal browser.");
    }
}

// Configurazione con fetch options per aumentare la stabilità su reti instabili
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: { 'x-application-name': 'buon-umore-web' },
        // Fix for "A spread argument must either have a tuple type or be passed to a rest parameter."
        fetch: (input, init) => fetch(input, init).catch(err => {
            console.error("[SUPABASE-FETCH-ERROR] ❌ Errore di rete critico:", err.message);
            throw err;
        })
    }
});
