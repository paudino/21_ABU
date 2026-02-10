
import React from 'react';
import { Article, User, Theme } from '../types';
import { IconHeart, IconRefresh, IconMicrophoneOn, IconMicOff, IconX, IconThumbUp, IconThumbDown, IconShare } from './Icons';
import { Tooltip } from './Tooltip';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  activeCategoryLabel?: string;
  showFavoritesOnly: boolean;
  favoriteIds: Set<string>; 
  currentUser?: User | null; 
  theme?: Theme;
  onArticleClick: (article: Article) => void;
  onRefresh: () => void;
  onImageGenerated?: (url: string, img: string) => void;
  onToggleFavorite?: (article: Article) => void;
  onLikeClick?: (article: Article) => void;
  onDislikeClick?: (article: Article) => void;
  notification?: string | null; 
  onCloseFavorites?: () => void; 
  onLoginRequest?: () => void;
  onShareClick?: (article: Article) => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  loading,
  activeCategoryLabel,
  showFavoritesOnly,
  favoriteIds,
  currentUser,
  theme = 'sunshine',
  onArticleClick,
  onRefresh,
  onToggleFavorite,
  onLikeClick,
  onDislikeClick,
  onCloseFavorites,
  onLoginRequest,
  onShareClick
}) => {

  const showSkeletons = loading && articles.length === 0;
  const isAccessible = theme === 'accessible';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
        
      <div className={`flex justify-between items-center mb-8 backdrop-blur-sm p-4 rounded-2xl shadow-sm border ${
        isAccessible ? 'bg-black border-yellow-400 text-white' : 'bg-white/60 border-white/50'
      }`}>
        <div>
           {showFavoritesOnly ? (
               <div className="flex items-center gap-3">
                   <h2 className="text-2xl md:text-3xl font-display font-serif font-bold tracking-tight">
                      <span className="text-red-500 mr-2">♥</span>
                      I tuoi preferiti
                   </h2>
                   {onCloseFavorites && (
                       <button 
                         onClick={onCloseFavorites}
                         className={`${isAccessible ? 'bg-yellow-400 text-black' : 'bg-slate-100 text-slate-500'} hover:bg-slate-200 p-2 rounded-full transition`}
                         title="Torna alle notizie"
                       >
                           <IconX className="w-5 h-5" />
                       </button>
                   )}
               </div>
           ) : (
               <h2 className="text-2xl md:text-3xl font-display font-serif font-bold tracking-tight">
                  <span className={`${isAccessible ? 'text-yellow-400' : 'text-joy-500'} mr-2`}>☀</span>
                  {activeCategoryLabel || 'Notizie'}
               </h2>
           )}
           <p className={`text-sm mt-1 font-body font-sans italic ${isAccessible ? 'text-yellow-100' : 'text-slate-500'}`}>
              {showFavoritesOnly ? 'La tua collezione personale di positività.' : 'Solo buone notizie, selezionate per te.'}
           </p>
        </div>
        
        {!showFavoritesOnly && (
          <Tooltip content="Cerca nuove notizie" position="top">
            <button 
                onClick={onRefresh}
                disabled={loading}
                className={`flex items-center gap-2 disabled:opacity-50 font-bold border px-5 py-2.5 rounded-xl transition-all duration-300 group ${
                    isAccessible 
                    ? 'bg-yellow-400 border-yellow-400 text-black hover:bg-white' 
                    : 'text-joy-700 bg-white border-joy-200 hover:bg-joy-500 hover:text-white hover:border-joy-500 hover:shadow-lg'
                }`}
            >
                <div className={`transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                    <IconRefresh />
                </div>
                <span className="font-sans">{loading ? 'Ricerca...' : 'Aggiorna'}</span>
            </button>
          </Tooltip>
        )}
      </div>

      {showSkeletons ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`rounded-2xl overflow-hidden shadow-sm border h-96 animate-pulse ${isAccessible ? 'bg-slate-900 border-yellow-400' : 'bg-white/80 border-white'}`}>
              <div className="h-48 bg-slate-200/50"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-slate-200/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200/50 rounded w-full"></div>
                <div className="h-4 bg-slate-200/50 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
              <div className={`text-center py-24 backdrop-blur-sm rounded-3xl border border-dashed mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-500 ${
                  isAccessible ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white/50 border-slate-300/50'
              }`}>
                <div className="text-6xl mb-4">🌤️</div>
                <h3 className="text-xl font-display font-serif font-bold mb-2">
                    {showFavoritesOnly ? "Nessun preferito ancora" : "In attesa di buone nuove"}
                </h3>
                <p className={`text-lg mb-6 font-body font-sans px-4 ${isAccessible ? 'text-white' : 'text-slate-500'}`}>
                  {showFavoritesOnly 
                    ? "Salva le notizie che ti fanno sorridere per ritrovarle qui." 
                    : "Stiamo preparando nuove storie positive per te."}
                </p>
              </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 transition-all duration-500 ${loading ? 'opacity-50 grayscale-[20%]' : 'opacity-100'}`}>
              {articles.map((article) => {
                const isFav = article.id ? favoriteIds.has(article.id) : false;
                
                return (
                  <div 
                    key={article.id || article.url} 
                    onClick={() => onArticleClick(article)}
                    className={`group rounded-2xl shadow-sm transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden
                      ${isAccessible 
                        ? 'bg-black border-2 border-yellow-400 hover:bg-slate-900' 
                        : 'bg-white border border-white/80 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-joy-500/10 hover:-translate-y-2'
                      }
                      ${article.isNew && !isAccessible 
                          ? 'border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] relative z-10' 
                          : ''
                      }
                    `}
                  >
                    <div className="h-48 bg-slate-100 overflow-hidden relative">
                        <img 
                          src={article.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/600/400`} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                          loading="lazy"
                        />
                        
                        <div className={`absolute top-3 right-3 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 font-sans ${
                            isAccessible ? 'bg-yellow-400 text-black' : 'bg-white/95 text-brand-600'
                        }`}>
                           <span className={`w-2 h-2 rounded-full animate-pulse ${isAccessible ? 'bg-black' : 'bg-brand-500'}`}></span>
                          {(article.sentimentScore * 100).toFixed(0)}% Positivo
                        </div>

                        {article.isNew && (
                          <div className="absolute top-0 left-0 z-20">
                              <div className={`pl-4 pr-6 py-2 rounded-br-3xl shadow-lg flex items-center gap-2 ${
                                  isAccessible ? 'bg-yellow-400 text-black' : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                              }`}>
                                  <span className="font-bold tracking-wide text-xs font-sans uppercase">NUOVA</span>
                              </div>
                          </div>
                        )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-center text-xs mb-3 uppercase tracking-wider font-semibold font-sans">
                        <span className={`${isAccessible ? 'bg-yellow-400 text-black' : 'bg-slate-100 text-slate-400'} px-2 py-1 rounded-md`}>{article.source}</span>
                        <span className={isAccessible ? 'text-yellow-400' : 'text-slate-400'}>{formatDate(article.date)}</span>
                      </div>
                      <h3 className={`text-xl font-display font-serif font-bold mb-3 leading-snug transition-colors ${
                          isAccessible ? 'text-yellow-400 group-hover:text-white' : 'text-slate-900 group-hover:text-joy-600'
                      }`}>
                        {article.title}
                      </h3>
                      <p className={`line-clamp-3 mb-5 flex-1 text-sm leading-relaxed font-body font-sans ${
                          isAccessible ? 'text-white' : 'text-slate-600'
                      }`}>
                        {article.summary}
                      </p>
                      
                      <div className={`pt-4 border-t flex items-center justify-between text-sm font-sans ${
                          isAccessible ? 'border-yellow-400 text-yellow-400' : 'border-slate-100 text-slate-400'
                      }`}>
                          <div className="flex items-center gap-4">
                               <Tooltip content={currentUser ? "Ascolta l'articolo (AI)" : "Accedi per abilitare l'audio"} position="top">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border ${
                                        isAccessible ? 'bg-yellow-400 text-black border-yellow-400' : 
                                        currentUser ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                                    }`}>
                                       {currentUser ? <IconMicrophoneOn className="w-3.5 h-3.5" /> : <IconMicOff className="w-3.5 h-3.5" />}
                                    </div>
                               </Tooltip>

                               <div className="flex items-center gap-3">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); onLikeClick ? onLikeClick(article) : (onLoginRequest && onLoginRequest()); }}
                                      className="flex items-center gap-1 hover:text-emerald-500 transition-colors group/vote"
                                   >
                                       <IconThumbUp className="w-4 h-4 group-hover/vote:scale-110 transition-transform" />
                                       <span className="font-bold text-xs">{article.likeCount || 0}</span>
                                   </button>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); onDislikeClick ? onDislikeClick(article) : (onLoginRequest && onLoginRequest()); }}
                                      className="flex items-center gap-1 hover:text-orange-500 transition-colors group/vote"
                                   >
                                       <IconThumbDown className="w-4 h-4 group-hover/vote:scale-110 transition-transform" />
                                       <span className="font-bold text-xs">{article.dislikeCount || 0}</span>
                                   </button>
                               </div>
                          </div>

                           <Tooltip content={isFav ? "Rimuovi dai preferiti" : "Salva nei preferiti"} position="top" align="right">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   if (onToggleFavorite && currentUser) onToggleFavorite(article);
                                   else if (onLoginRequest) onLoginRequest();
                                 }}
                                 className={`
                                   p-2 rounded-full transition-all duration-300 transform active:scale-90
                                   ${isAccessible && isFav ? 'bg-yellow-400 text-black' : ''}
                                   ${isAccessible && !isFav ? 'text-yellow-400 border border-yellow-400' : ''}
                                   ${!isAccessible && isFav 
                                      ? 'text-red-500 bg-red-50 hover:bg-red-100 border border-red-100' 
                                      : !isAccessible ? 'text-slate-400 hover:text-red-500 hover:bg-slate-50' : ''
                                   }
                                 `}
                               >
                                 <IconHeart filled={isFav} className="w-5 h-5" />
                               </button>
                           </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
};
