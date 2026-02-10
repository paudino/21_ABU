
import React, { useState, useEffect } from 'react';
import { IconX } from './Icons';
import { db } from '../services/dbService';
import { Tooltip } from './Tooltip';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isFileProtocol, setIsFileProtocol] = useState(false);

  useEffect(() => {
    if (window.location.protocol === 'file:') {
        setIsFileProtocol(true);
        setError("ATTENZIONE: Il login richiede un ambiente web (http/https).");
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.replace(/['"\s]+/g, '').toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (activeTab === 'register') {
        const { error, data } = await db.signUpWithEmail(cleanEmail, cleanPassword);
        if (error) throw error;
        setSuccessMsg("Account creato! Verifica la tua email se richiesto.");
        if (data?.session) {
             setTimeout(onClose, 1500);
        }
      } else {
        const response = await db.signInWithEmail(cleanEmail, cleanPassword);
        if (response.error) throw response.error;
        onClose(); 
      }
    } catch (err: any) {
      console.error("[LOGIN-MODAL] ❌ Errore:", err);
      let msg = err.message || "Errore sconosciuto.";
      
      const msgLower = msg.toLowerCase();
      if (msgLower.includes("failed to fetch")) {
          msg = "Errore di connessione al database. Verifica che il tuo browser o la rete non blocchino Supabase.";
      } else if (msgLower.includes("invalid login credentials")) {
          msg = "Email o password errati.";
      } else if (msgLower.includes("rate limit")) {
          msg = "Troppi tentativi. Riprova tra un minuto.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isFileProtocol) return;
    setLoading(true);
    setError(null);
    try {
        const result = await db.signInWithProvider('google');
        if (result?.error) throw result.error;
    } catch (err: any) {
        setError(err.message || "Connessione Google fallita.");
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-md w-full relative animate-in zoom-in-95 border border-white/50 flex flex-col">
        
        <div className="relative h-24 bg-gradient-to-r from-joy-400 to-orange-500 flex items-center justify-center">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
                Bentornato nel Buon Umore
            </h3>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 rounded-full p-2 transition">
                <IconX className="w-5 h-5" />
            </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button 
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'text-joy-600 bg-white border-b-2 border-joy-500' : 'text-slate-400'}`}
            >
                Accedi
            </button>
            <button 
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'register' ? 'text-joy-600 bg-white border-b-2 border-joy-500' : 'text-slate-400'}`}
            >
                Registrati
            </button>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-[11px] font-bold rounded-xl border border-green-100">
                    {successMsg}
                </div>
            )}

            {!successMsg && (
                <>
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading || isFileProtocol}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-50 transition mb-6 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google
                    </button>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <input 
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-joy-400 bg-slate-50 text-sm"
                            placeholder="Email"
                        />
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-joy-400 bg-slate-50 text-sm"
                                placeholder="Password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPassword ? '👁️' : '🔒'}
                            </button>
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Caricamento...' : (activeTab === 'register' ? 'Registrati' : 'Entra')}
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
