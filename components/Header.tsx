
import React, { useState, useEffect } from 'react';
import { User, Quote, Theme } from '../types';
import { IconHeart, IconSun, IconMoon, IconContrast, IconType, IconSettings } from './Icons';
import { db } from '../services/dbService';
import { generateInspirationalQuote } from '../services/geminiService';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  currentUser: User | null;
  showFavoritesOnly: boolean;
  theme: Theme;
  isReadableFont: boolean;
  onToggleFavorites: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onSetTheme: (theme: Theme) => void;
  onToggleReadableFont: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  showFavoritesOnly,
  theme,
  isReadableFont,
  onToggleFavorites, 
  onLogout, 
  onLoginClick,
  onSetTheme,
  onToggleReadableFont
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadInitialQuote();
  }, []);

  const loadInitialQuote = async () => {
      const q = await db.getRandomQuote();
      if (q) setQuote(q);
      else fetchNewQuote();
  };

  const fetchNewQuote = async () => {
    if (loadingQuote) return;
    setLoadingQuote(true);
    try {
        const newQuote = await generateInspirationalQuote();
        if (newQuote) {
            await db.saveQuote(newQuote);
            setQuote(newQuote);
        }
    } catch (e) {
        console.error("Errore recupero citazione", e);
    } finally {
        setLoadingQuote(false);
    }
  };

  const getHeaderGradient = () => {
    switch (theme) {
      case 'evening': return 'from-slate-900 via-indigo-900 to-amber-900';
      case 'accessible': return 'from-black via-black to-black border-b border-yellow-400';
      default: return 'from-joy-500 via-orange-500 to-rose-500';
    }
  };

  return (
    <header className={`sticky top-0 z-[60] shadow-lg transition-all duration-500 bg-gradient-to-r ${getHeaderGradient()} text-white overflow-visible`}>
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        
        <div className="flex items-center justify-between py-2 md:py-3 gap-1 md:gap-4">
            
            {/* Logo Section */}
            <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
              <button 
                  onClick={fetchNewQuote}
                  disabled={loadingQuote}
                  className="outline-none focus:ring-2 focus:ring-white/20 rounded-full"
              >
                  <div className={`w-8 h-8 md:w-10 md:h-10 text-yellow-100 transition-transform duration-700 ${loadingQuote ? 'animate-spin' : 'hover:rotate-45'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-md">
                          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                      </svg>
                  </div>
              </button>
              
              <div className="flex flex-col">
                <h1 className="font-display font-bold text-sm md:text-xl tracking-tight leading-none">
                  Buon Umore
                </h1>
                <span className="text-[7px] md:text-[9px] uppercase tracking-widest font-black opacity-70">
                   Notizie Belle
                </span>
              </div>
            </div>

            {/* Quote Desktop */}
            <div className="flex-1 px-4 text-center hidden sm:block">
                <p className={`font-display italic text-sm text-white/90 line-clamp-1 transition-opacity ${loadingQuote ? 'opacity-30' : 'opacity-100'}`}>
                   "{quote ? quote.text : "Cose belle stanno per accadere..."}"
                </p>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 ml-auto min-w-fit">
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 md:p-2 rounded-full transition-all border ${showSettings ? 'bg-white/20 border-white' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
                >
                  <IconSettings className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {showSettings && (
                  <div className="absolute top-12 right-0 bg-white text-slate-800 shadow-2xl rounded-2xl p-4 w-52 z-[100] border border-slate-100 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Opzioni</h4>
                    <div className="space-y-4">
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={() => onSetTheme('sunshine')} className={`flex-1 py-1.5 flex items-center justify-center rounded ${theme === 'sunshine' ? 'bg-white shadow text-joy-500' : 'text-slate-400'}`}><IconSun className="w-3.5 h-3.5"/></button>
                        <button onClick={() => onSetTheme('evening')} className={`flex-1 py-1.5 flex items-center justify-center rounded ${theme === 'evening' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}><IconMoon className="w-3.5 h-3.5"/></button>
                        <button onClick={() => onSetTheme('accessible')} className={`flex-1 py-1.5 flex items-center justify-center rounded ${theme === 'accessible' ? 'bg-white shadow text-black' : 'text-slate-400'}`}><IconContrast className="w-3.5 h-3.5"/></button>
                      </div>
                      <button onClick={onToggleReadableFont} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-bold ${isReadableFont ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>
                        <span>Font Leggibile</span>
                        <div className={`w-5 h-2.5 rounded-full relative transition-colors ${isReadableFont ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 w-1.5 h-1.5 bg-white rounded-full transition-all ${isReadableFont ? 'left-3' : 'left-0.5'}`}></div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => currentUser ? onToggleFavorites() : onLoginClick()}
                className={`p-1.5 md:p-2 rounded-full transition-all border ${showFavoritesOnly && currentUser ? 'bg-white text-rose-500 border-white' : 'bg-white/10 text-white border-transparent'}`}
              >
                <IconHeart filled={showFavoritesOnly && !!currentUser} className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {currentUser ? (
                <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5 pr-1.5 md:pr-2.5 border border-white/20">
                  <img src={currentUser.avatar} alt="avatar" className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/40 shadow-sm" />
                  <button onClick={onLogout} className="text-white/70 hover:text-white transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </div>
              ) : (
                <button 
                    onClick={onLoginClick} 
                    className={`min-w-[80px] md:min-w-[100px] px-3 md:px-5 py-1.5 rounded-full font-bold text-[11px] md:text-xs transition shadow-md whitespace-nowrap flex-shrink-0 active:scale-95 ${
                        theme === 'accessible' ? 'bg-yellow-400 text-black' : 'bg-white text-joy-600 hover:bg-joy-50'
                    }`}
                >
                  Accedi
                </button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};
