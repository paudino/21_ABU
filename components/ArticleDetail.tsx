
import React, { useState, useEffect, useRef } from 'react';
import { Article, User, Comment } from '../types';
import { db, supabase } from '../services/dbService';
import { IconHeart, IconThumbUp, IconThumbDown, IconX, IconXIcon, IconExternalLink, IconMessage, IconTrash, IconCheck, IconShare } from './Icons';
import { AudioPlayer } from './AudioPlayer';
import { Tooltip } from './Tooltip';

interface ArticleDetailProps {
  article: Article;
  nextArticle?: Article | null; 
  currentUser: User | null;
  isFavorite: boolean; 
  onClose: () => void;
  onLoginRequest: () => void;
  onToggleFavorite: (article: Article) => void; 
  onLikeClick: () => void;
  onDislikeClick: () => void;
  onUpdate?: (article: Article) => void; 
  onShareClick?: () => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateString;
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ 
  article, currentUser, isFavorite, onClose, onLoginRequest, onToggleFavorite, onLikeClick, onDislikeClick, onUpdate, onShareClick 
}) => {
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [userHasDisliked, setUserHasDisliked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [dbId, setDbId] = useState<string | undefined>(article.id);

  useEffect(() => {
    const init = async () => {
        console.log(`[BUON-UMORE] [DETAIL] 👁️ Inizializzazione dettaglio articolo: ${article.title}`);
        let artId = article.id;
        
        if (!artId) {
            console.log("[BUON-UMORE] [DETAIL] 🔍 ID non presente, cerco nel DB tramite URL...");
            const { data } = await supabase.from('articles').select('id').eq('url', article.url).maybeSingle();
            if (data?.id) {
                artId = data.id;
                console.log(`[BUON-UMORE] [DETAIL] ✅ ID trovato: ${artId}`);
            }
        }
        
        setDbId(artId);

        if (artId) {
            const [l, d] = await Promise.all([
                db.getLikeCount(artId),
                db.getDislikeCount(artId)
            ]);
            
            console.log(`[BUON-UMORE] [DETAIL] 📊 Voti correnti DB: Likes ${l}, Dislikes ${d}`);

            if (onUpdate) {
                onUpdate({ ...article, id: artId, likeCount: l, dislikeCount: d });
            }

            if (currentUser) {
                const [liked, disliked] = await Promise.all([
                    db.hasUserLiked(artId, currentUser.id),
                    db.hasUserDisliked(artId, currentUser.id)
                ]);
                setUserHasLiked(liked);
                setUserHasDisliked(disliked);
            }
            
            loadComments(artId);
        }
    };
    init();
  }, [article.url, article.id, currentUser?.id]);

  const loadComments = async (artId: string) => {
      setLoadingComments(true);
      try {
          const list = await db.getComments(artId);
          setComments(list);
      } finally {
          setLoadingComments(false);
      }
  };

  const ensureSavedId = async (): Promise<string | null> => {
      if (dbId) return dbId;
      console.log("[BUON-UMORE] [DETAIL] 💾 Articolo non nel DB. Tento salvataggio preventivo...");
      try {
          const saved = await db.saveArticles(article.category || 'Generale', [article]);
          if (saved && saved.length > 0) {
              const newId = saved[0].id;
              if (newId) {
                setDbId(newId);
                if (onUpdate) onUpdate({ ...article, id: newId });
                return newId;
              }
          }
      } catch (e) {
          console.error("[BUON-UMORE] [DETAIL] ❌ Salvataggio fallito:", e);
      }
      return null;
  };

  const handlePostComment = async () => {
      if (!newComment.trim() || !currentUser) return;
      setSubmittingComment(true);
      console.log("[BUON-UMORE] [DETAIL] 📤 Tentativo invio commento...");
      try {
          const artId = await ensureSavedId();
          if (!artId) throw new Error("ID articolo mancante.");
          const added = await db.addComment(artId, currentUser, newComment.trim());
          setComments(prev => [added, ...prev]);
          setNewComment('');
      } catch (e: any) {
          console.error("[BUON-UMORE] [DETAIL] ❌ Invio commento fallito:", e);
          alert(`Errore: ${e.message}`);
      } finally { 
          setSubmittingComment(false); 
      }
  };

  const performDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    console.log(`[BUON-UMORE] [DETAIL] 🗑️ Conferma eliminazione commento: ${commentId}`);
    try {
        await db.deleteComment(commentId, currentUser.id);
        setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) {
        console.error("[BUON-UMORE] [DETAIL] ❌ Eliminazione fallita:", e);
    } finally {
        setDeletingCommentId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto backdrop-blur-md p-0 md:p-8 animate-in fade-in">
      <div className="bg-white md:max-w-4xl mx-auto md:rounded-2xl shadow-2xl overflow-hidden min-h-[100vh] md:min-h-[80vh] flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"><IconXIcon /></button>
        </div>
        
        <div className="relative h-64 md:h-96 w-full bg-slate-200">
          <img src={article.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/600/400`} className="w-full h-full object-cover" alt={article.title} />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-6 pt-24">
            <h1 className="text-xl md:text-4xl font-bold text-white leading-tight">{article.title}</h1>
          </div>
        </div>

        <div className="p-6 md:p-10 flex-1 flex flex-col md:flex-row gap-10">
          <div className="flex-1">
            <div className="flex flex-wrap items-center text-sm text-slate-500 mb-6 gap-x-4">
               <span className="bg-slate-100 px-2 py-1 rounded">Fonte: {article.source}</span>
               <span>{formatDate(article.date)}</span>
            </div>
            
            <AudioPlayer 
              articleTitle={article.title} 
              articleSummary={article.summary} 
              articleUrl={article.url} 
              initialAudioBase64={article.audioBase64} 
              canPlay={!!currentUser} 
              autoGenerate={true} 
            />

            <p className="text-lg text-slate-700 leading-relaxed mb-6 whitespace-pre-line">{article.summary}</p>
            
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-joy-600 font-bold hover:text-joy-700 hover:underline transition-colors">
                    Leggi l'articolo completo <IconExternalLink className="w-4 h-4" />
                </a>
                
                <button onClick={onShareClick} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm group">
                    <IconShare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Condividi Notizia
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-b py-6 mb-8">
              <Tooltip content={currentUser ? "Mi piace" : "Accedi per votare"}>
                  <button 
                    onClick={onLikeClick} 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border active:scale-95 ${userHasLiked ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'}`}
                  >
                      <IconThumbUp filled={userHasLiked} />
                      <span className="font-bold">{article.likeCount || 0}</span>
                  </button>
              </Tooltip>

              <Tooltip content={currentUser ? "Non mi piace" : "Accedi per votare"}>
                  <button 
                    onClick={onDislikeClick} 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border active:scale-95 ${userHasDisliked ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'}`}
                  >
                      <IconThumbDown filled={userHasDisliked} />
                      <span className="font-bold">{article.dislikeCount || 0}</span>
                  </button>
              </Tooltip>
              
              <div className="w-px h-8 bg-slate-200 mx-2"></div>

              <Tooltip content={currentUser ? (isFavorite ? "Rimuovi dai preferiti" : "Salva nei preferiti") : "Accedi per salvare"}>
                  <button onClick={() => currentUser ? onToggleFavorite(article) : onLoginRequest()} className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${isFavorite ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                      <IconHeart filled={isFavorite} />
                      <span>{isFavorite ? 'Salvato' : 'Salva'}</span>
                  </button>
              </Tooltip>
            </div>

            <div className="mt-12">
               <h3 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <IconMessage className="w-5 h-5 text-joy-500" />
                   Commenti della community
               </h3>
               
               <div className="flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden shadow-sm">
                        {currentUser ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold">?</div>}
                    </div>
                    <div className="flex-1">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Condividi un pensiero positivo..." className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-joy-400 outline-none resize-y min-h-[100px] bg-slate-50 focus:bg-white transition-all" />
                        <div className="flex justify-end mt-3">
                            <button onClick={handlePostComment} disabled={!newComment.trim() || submittingComment} className="bg-joy-500 text-white px-8 py-2.5 rounded-full font-bold text-sm hover:bg-joy-600 disabled:opacity-50 transition shadow-lg shadow-joy-500/20 active:scale-95">
                                {submittingComment ? 'Invio...' : 'Pubblica'}
                            </button>
                        </div>
                    </div>
               </div>

               <div className="space-y-6">
                    {loadingComments ? (
                        <div className="space-y-4 py-4">
                            {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <p className="text-slate-400 text-sm">Nessun commento ancora.</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} className="w-full h-full" />
                                </div>
                                <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-800 text-sm tracking-tight">{comment.username}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(comment.timestamp))}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{comment.text}</p>
                                    
                                    {currentUser?.id === comment.userId && (
                                        <div className="absolute top-4 right-4 flex items-center">
                                            {deletingCommentId === comment.id ? (
                                                <div className="flex items-center gap-1 bg-white border shadow-lg rounded-full p-1 animate-in zoom-in z-20">
                                                    <button onClick={(e) => { e.stopPropagation(); performDeleteComment(comment.id); }} className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded-full transition">
                                                        <IconCheck className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDeletingCommentId(null); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition">
                                                        <IconXIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); setDeletingCommentId(comment.id); }} className="text-slate-300 hover:text-red-500 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
