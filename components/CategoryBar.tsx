
import { useState, useRef, useEffect } from 'react';
import { Category, User } from '../types';
import { IconPlus, IconSearch, IconXIcon, IconCheck, IconTrash } from './Icons';

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string;
  currentUser: User | null;
  onSelectCategory: (id: string) => void;
  onAddCategory: (label: string) => void;
  onDeleteCategory?: (id: string) => void;
  onSearch?: (term: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategory,
  currentUser,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onSearch
}) => {
  const [showAddCat, setShowAddCat] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleAddSubmit = () => {
    if (newCatLabel.trim()) {
      onAddCategory(newCatLabel.trim());
      setNewCatLabel('');
      setShowAddCat(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, cat: Category) => {
      e.preventDefault();
      e.stopPropagation(); 
      
      console.log(`[CategoryBar] 🗑️ CLICK RILEVATO su X per: ${cat.label}`);

      if (confirmingDeleteId === cat.id) {
          console.log("[CategoryBar] ✅ SECONDO CLIC: Eseguo eliminazione effettiva");
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
          setConfirmingDeleteId(null);
          if (onDeleteCategory) onDeleteCategory(cat.id);
      } else {
          console.log("[CategoryBar] 🔍 PRIMO CLIC: Attivo stato di conferma");
          setConfirmingDeleteId(cat.id);
          
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
              console.log("[CategoryBar] ⏱️ Reset automatico conferma");
              setConfirmingDeleteId(null);
          }, 8000); // 8 secondi di tempo per confermare
      }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftShadow(scrollLeft > 15);
      setShowRightShadow(scrollLeft < (scrollWidth - clientWidth - 15));
    }
  };

  useEffect(() => {
    handleScroll();
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
        currentScrollRef.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('resize', handleScroll);
    return () => {
        if (currentScrollRef) currentScrollRef.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [categories]);

  return (
    <div className="sticky top-[52px] md:top-[68px] z-[40] backdrop-blur-md bg-white/90 border-b border-slate-200 py-1.5 md:py-3 shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
         
         <div className="flex-1 relative flex items-center overflow-hidden min-w-0">
             <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`}></div>

             <div 
                ref={scrollRef}
                className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-3 py-2 scroll-smooth overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
             >
                 {categories.map(cat => (
                   <div 
                    key={cat.id} 
                    className={`flex items-center rounded-full transition-all duration-300 border ${
                        activeCategory === cat.id 
                        ? 'bg-joy-500 border-joy-500 text-white shadow-lg shadow-joy-500/20' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                   >
                       <button
                         onClick={() => {
                           if (confirmingDeleteId) setConfirmingDeleteId(null);
                           onSelectCategory(cat.id);
                         }}
                         className="whitespace-nowrap px-4 py-2 text-[11px] md:text-xs font-black uppercase tracking-tight active:scale-95 transition-transform"
                       >
                         {cat.label}
                       </button>
                       
                       {cat.user_id && (
                           <button 
                             onClick={(e) => handleDeleteClick(e, cat)}
                             className={`flex items-center justify-center w-8 h-8 rounded-full transition-all mr-1 ${
                                 confirmingDeleteId === cat.id 
                                 ? 'bg-white text-rose-600 scale-110' 
                                 : 'text-slate-300 hover:text-rose-500'
                             }`}
                           >
                               {confirmingDeleteId === cat.id ? (
                                   <IconTrash className="w-4 h-4 animate-bounce" />
                               ) : (
                                   <IconXIcon className="w-4 h-4" />
                               )}
                           </button>
                       )}
                   </div>
                 ))}
                 <div className="w-8 flex-shrink-0 h-1"></div>
             </div>

             <div className={`absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none transition-opacity duration-300 ${showRightShadow ? 'opacity-100' : 'opacity-0'}`}></div>
         </div>

         <div className="flex items-center gap-1.5 pl-2 border-l border-slate-100 flex-shrink-0">
              <div className="relative">
                    <button 
                        onClick={() => { setShowSearch(!showSearch); setShowAddCat(false); }}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all ${showSearch ? 'bg-joy-500 text-white' : 'bg-slate-100 text-slate-400 hover:text-joy-600'}`}
                    >
                        <IconSearch className="w-4 h-4" />
                    </button>

                    {showSearch && (
                        <div className="absolute top-11 right-0 bg-white shadow-2xl rounded-2xl p-3 z-[100] border border-slate-100 w-60 animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 text-[11px] border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-joy-400 bg-slate-50"
                                    placeholder="Cerca un argomento..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                />
                                <button onClick={handleSearchSubmit} className="bg-joy-500 text-white p-2 rounded-xl"><IconSearch className="w-4 h-4"/></button>
                            </div>
                        </div>
                    )}
              </div>

              {currentUser && (
                <div className="relative">
                    <button 
                        onClick={() => { setShowAddCat(!showAddCat); setShowSearch(false); }}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all ${showAddCat ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400 hover:text-rose-600'}`}
                    >
                        <IconPlus className="w-4 h-4" />
                    </button>

                    {showAddCat && (
                        <div className="absolute top-11 right-0 bg-white shadow-2xl rounded-2xl p-3 z-[100] border border-slate-100 w-60 animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Nuova Categoria AI</span>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={newCatLabel}
                                        onChange={(e) => setNewCatLabel(e.target.value)}
                                        className="flex-1 text-[11px] border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
                                        placeholder="Esempio: Spazio, Arte..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit()}
                                    />
                                    <button onClick={handleAddSubmit} className="bg-rose-500 text-white p-2 rounded-xl"><IconPlus className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              )}
         </div>
      </div>
    </div>
  );
};
