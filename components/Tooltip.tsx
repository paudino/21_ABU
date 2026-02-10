
import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}

/**
 * Componente Tooltip Moderno ottimizzato per evitare overflow.
 * L'attributo 'align' permette di gestire pulsanti vicini ai bordi dello schermo.
 */
export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  align = 'center'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getAlignClasses = () => {
    switch (align) {
      case 'left': return 'left-0';
      case 'right': return 'right-0';
      default: return 'left-1/2 -translate-x-1/2';
    }
  };

  const getArrowAlignClasses = () => {
    switch (align) {
      case 'left': return 'left-4';
      case 'right': return 'right-4';
      default: return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
            className={`
                absolute z-[100] px-3 py-1.5 
                bg-slate-800/95 text-white text-[11px] font-bold tracking-wide
                rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap
                animate-in fade-in zoom-in-95 duration-200
                pointer-events-none
                ${position === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'}
                ${getAlignClasses()}
            `}
        >
            {content}
            
            {/* Freccia indicatrice riposizionata */}
            <div 
                className={`
                    absolute border-4 border-transparent
                    ${getArrowAlignClasses()}
                    ${position === 'top' 
                        ? 'top-full border-t-slate-800/95' 
                        : 'bottom-full border-b-slate-800/95'
                    }
                `}
            />
        </div>
      )}
    </div>
  );
};
