import React from 'react';

/**
 * Footer Semplificato e Sobrio.
 * Contiene solo descrizione essenziale e copyright.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-auto pt-16">
      
      {/* Onda Decorativa SVG (Mantenuta per transizione morbida) */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none z-10">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] fill-slate-900">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="bg-slate-900 text-slate-400 relative z-20 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center">
            
            <h3 className="text-lg font-display font-bold text-white mb-3 tracking-wide">
              L'angolo del Buon Umore
            </h3>
            
            <p className="text-sm leading-relaxed mb-8 mx-auto max-w-lg">
              Un rifugio digitale contro il negativismo. 
              Raccogliamo e curiamo solo notizie che scaldano il cuore e ispirano la mente, 
              per ricordarti che il mondo è pieno di cose belle.
            </p>

            <div className="border-t border-slate-800 pt-6 text-xs text-slate-600">
               <p>&copy; {new Date().getFullYear()} L'angolo del Buon Umore. Tutti i diritti riservati.</p>
            </div>

        </div>
      </div>
    </footer>
  );
};