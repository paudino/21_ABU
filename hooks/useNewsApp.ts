
import { useState, useEffect, useCallback, useRef } from 'react';
import { db, supabase } from '../services/dbService';
import { fetchPositiveNews } from '../services/geminiService';
import { Category, Article, User, DEFAULT_CATEGORIES } from '../types';

export const useNewsApp = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(''); 
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favoriteArticleIds, setFavoriteArticleIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const notificationTimeoutRef = useRef<number>(null);
  const currentRequestMode = useRef<string>('news');

  const showToast = useCallback((msg: string, duration = 4000) => {
    if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
    setNotification(msg);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const enrichArticlesWithCounts = async (list: Article[]) => {
    const ids = list.map(a => a.id).filter((id): id is string => !!id);
    if (ids.length === 0) return list;
    
    console.log(`[BUON-UMORE] 🔄 Arricchimento di ${list.length} articoli con voti dal DB`);
    try {
        const counts = await db.getBatchCounts(ids);
        return list.map(a => ({
            ...a,
            likeCount: a.id ? (counts.likes[a.id] || 0) : 0,
            dislikeCount: a.id ? (counts.dislikes[a.id] || 0) : 0
        }));
    } catch (e) {
        console.error("[BUON-UMORE] ❌ Errore arricchimento voti:", e);
        return list;
    }
  };

  const handleArticleUpdate = useCallback((updated: Article) => {
    setArticles(prev => prev.map(a => (a.id === updated.id || a.url === updated.url) ? { ...a, ...updated } : a));
    setSelectedArticle(prev => (prev && (prev.id === updated.id || prev.url === updated.url)) ? { ...prev, ...updated } : prev);
  }, []);

  const ensureArticleSaved = async (article: Article): Promise<string | null> => {
      if (article.id && /^[0-9a-fA-F-]{36}$/.test(article.id)) return article.id;
      
      const { data } = await supabase.from('articles').select('id').eq('url', article.url).maybeSingle();
      if (data?.id) return data.id;

      try {
          const saved = await db.saveArticles(article.category || 'Generale', [article]);
          if (saved && saved.length > 0) return saved[0].id || null;
      } catch (e) {
          console.error("[BUON-UMORE] Errore salvataggio preventivo:", e);
      }
      return null;
  };

  const handleToggleFavorite = useCallback(async (article: Article) => {
      if (!currentUser) return setShowLoginModal(true);
      const targetId = await ensureArticleSaved(article);
      if (!targetId) return;

      try {
          const isFav = favoriteArticleIds.has(targetId);
          if (isFav) {
              await db.removeFavorite(targetId, currentUser.id);
              setFavoriteArticleIds(prev => {
                  const next = new Set(prev);
                  next.delete(targetId);
                  return next;
              });
              showToast("Rimosso dai preferiti 💔");
          } else {
              await db.addFavorite(targetId, currentUser.id);
              setFavoriteArticleIds(prev => {
                  const next = new Set(prev);
                  next.add(targetId);
                  return next;
              });
              showToast("Aggiunto ai preferiti! ❤️");
          }
      } catch (error) {
          console.error("[BUON-UMORE] Errore toggle favorite:", error);
      }
  }, [currentUser, favoriteArticleIds, showToast]);

  const handleLike = async (article: Article) => {
      if (!currentUser) return setShowLoginModal(true);
      const targetId = await ensureArticleSaved(article);
      if (!targetId) return;

      try {
          await db.toggleLike(targetId, currentUser.id);
          const [nLike, nDislike] = await Promise.all([
              db.getLikeCount(targetId),
              db.getDislikeCount(targetId)
          ]);
          handleArticleUpdate({ ...article, id: targetId, likeCount: nLike, dislikeCount: nDislike });
          showToast("Grazie per il tuo feedback positivo! ✨");
      } catch (error) {
          console.error("[BUON-UMORE] Errore Like:", error);
      }
  };

  const handleDislike = async (article: Article) => {
      if (!currentUser) return setShowLoginModal(true);
      const targetId = await ensureArticleSaved(article);
      if (!targetId) return;

      try {
          await db.toggleDislike(targetId, currentUser.id);
          const [nLike, nDislike] = await Promise.all([
              db.getLikeCount(targetId),
              db.getDislikeCount(targetId)
          ]);
          handleArticleUpdate({ ...article, id: targetId, likeCount: nLike, dislikeCount: nDislike });
          showToast("Feedback ricevuto.");
      } catch (error) {
          console.error("[BUON-UMORE] Errore Dislike:", error);
      }
  };

  const fetchNews = useCallback(async (query: string, label: string, forceAi: boolean) => {
    if (currentRequestMode.current === 'favorites') return;
    
    setLoading(true);
    try {
      let finalArticles: Article[] = [];
      if (!forceAi) {
        const cached = await db.getCachedArticles(label);
        if (cached && cached.length > 0) {
          finalArticles = await enrichArticlesWithCounts(cached);
          setArticles(finalArticles); 
          setLoading(false); 
          return; 
        }
      }
      
      const aiArticles = await fetchPositiveNews(query, label);
      if (aiArticles && aiArticles.length > 0) {
        const saved = await db.saveArticles(label, aiArticles);
        finalArticles = await enrichArticlesWithCounts(saved.map(a => ({ ...a, isNew: true })));
        setArticles(finalArticles);
      } else if (forceAi) {
        showToast("Nessuna nuova notizia trovata ora.");
      }
    } catch (error: any) {
      console.error("[BUON-UMORE] ❌ Errore caricamento notizie:", error);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await db.getCurrentUserProfile();
        setCurrentUser(user);
        setShowLoginModal(false);
        if (user) {
          const ids = await db.getUserFavoritesIds(user.id);
          setFavoriteArticleIds(ids);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setFavoriteArticleIds(new Set());
        setShowFavoritesOnly(false);
      }
    });
    db.getCurrentUserProfile().then(async user => {
        setCurrentUser(user);
        if (user) {
            const ids = await db.getUserFavoritesIds(user.id);
            setFavoriteArticleIds(ids);
        }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        let dbCats = await db.getCategories(currentUser?.id);
        setCategories(dbCats);
        if (!activeCategoryId && !searchTerm && dbCats.length > 0) {
            setActiveCategoryId(dbCats[0].id);
        }
      } catch (err) {
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    loadCategories();
  }, [currentUser?.id]);

  useEffect(() => {
    let isMounted = true;
    if (showFavoritesOnly) {
      if (currentUser) {
        currentRequestMode.current = 'favorites';
        setLoading(true);
        db.getUserFavoriteArticles(currentUser.id).then(async favs => {
          if (!isMounted || currentRequestMode.current !== 'favorites') return;
          const enriched = await enrichArticlesWithCounts(favs);
          setArticles(enriched); 
          setFavoriteArticleIds(new Set(enriched.map(a => a.id).filter((id): id is string => !!id)));
          setLoading(false);
        });
      }
    } else {
      currentRequestMode.current = 'news';
      if (searchTerm) fetchNews(searchTerm, searchTerm, false);
      else if (activeCategoryId && categories.length > 0) {
        const cat = categories.find(c => c.id === activeCategoryId);
        if (cat) fetchNews(cat.value, cat.label, false);
      }
    }
    return () => { isMounted = false; };
  }, [showFavoritesOnly, currentUser, activeCategoryId, categories, searchTerm, fetchNews]);

  return {
    categories, activeCategoryId, articles, loading, selectedArticle, showLoginModal,
    showFavoritesOnly, currentUser, favoriteArticleIds, notification,
    activeCategoryLabel: searchTerm ? `Ricerca: ${searchTerm}` : categories.find(c => c.id === activeCategoryId)?.label,
    nextArticle: selectedArticle ? articles[articles.findIndex(a => a.url === selectedArticle.url) + 1] || null : null,
    setActiveCategoryId: (id: string) => { setSearchTerm(''); setActiveCategoryId(id); setShowFavoritesOnly(false); },
    handleSearch: (term: string) => { setShowFavoritesOnly(false); setActiveCategoryId(''); setSearchTerm(term.trim()); },
    setSelectedArticle, setShowLoginModal, setShowFavoritesOnly, handleLogout: () => db.signOut(),
    handleAddCategory: async (l: string) => {
        if (!currentUser) return setShowLoginModal(true);
        const cat = await db.addCategory(l, `${l} notizie positive`, currentUser.id);
        if (cat) { setCategories(p => [...p, cat]); setActiveCategoryId(cat.id); showToast(`Categoria "${l}" aggiunta! ✨`); }
    },
    handleDeleteCategory: async (id: string) => {
        if (!currentUser) return;
        if (await db.deleteCategory(id, currentUser.id)) {
            setCategories(p => p.filter(c => c.id !== id));
            if (activeCategoryId === id) setActiveCategoryId(DEFAULT_CATEGORIES[0].id);
        }
    },
    handleLike, handleDislike, loadNews: () => {
      const cat = categories.find(c => c.id === activeCategoryId);
      if (searchTerm) fetchNews(searchTerm, searchTerm, true);
      else if (cat) fetchNews(cat.value, cat.label, true);
    },
    onImageGenerated: (u: string, i: string) => setArticles(p => p.map(a => a.url === u ? { ...a, imageUrl: i } : a)),
    handleToggleFavorite, handleArticleUpdate
  };
};
