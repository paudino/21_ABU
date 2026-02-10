
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ArticleList } from './components/ArticleList';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { DailyDeed } from './components/DailyDeed';
import { ArticleDetail } from './components/ArticleDetail';
import { ShareModal } from './components/ShareModal';
import { useNewsApp } from './hooks/useNewsApp';
import { Article, Theme } from './types';
import { IconCheck, IconX } from './components/Icons';

function App() {
  const {
    categories,
    activeCategoryId,
    articles,
    nextArticle,
    activeCategoryLabel,
    loading,
    selectedArticle,
    showLoginModal,
    showFavoritesOnly,
    currentUser,
    favoriteArticleIds,
    notification,
    setActiveCategoryId,
    handleSearch,
    setSelectedArticle,
    setShowLoginModal,
    setShowFavoritesOnly,
    handleLogout,
    handleAddCategory,
    handleDeleteCategory,
    loadNews,
    onImageGenerated,
    handleToggleFavorite,
    handleArticleUpdate,
    handleLike,
    handleDislike
  } = useNewsApp();

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('app-theme') as Theme) || 'sunshine');
  const [isReadableFont, setIsReadableFont] = useState<boolean>(() => localStorage.getItem('app-readable-font') === 'true');
  const [sharingArticle, setSharingArticle] = useState<Article | null>(null);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-readable-font', String(isReadableFont));
    if (isReadableFont) document.body.classList.add('font-accessible');
    else document.body.classList.remove('font-accessible');
  }, [theme, isReadableFont]);

  const handleOpenShare = (article: Article) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setSharingArticle(article);
  };

  const getBackgroundImage = () => {
    switch (theme) {
      case 'evening': return "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop";
      case 'accessible': return "";
      default: return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop";
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col transition-colors duration-500 ${theme === 'accessible' ? 'bg-black text-white' : 'text-slate-900'}`}>
      
      {notification && (
        <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-none">
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border pointer-events-auto ${
                notification.includes('già') || notification.includes('fallit') 
                ? 'bg-rose-500 text-white border-rose-400' 
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}>
                {notification.includes('già') ? <IconX className="w-5 h-5" /> : <IconCheck className="w-5 h-5" />}
                <span className="font-bold text-sm tracking-tight">{notification}</span>
            </div>
        </div>
      )}

      <div className="fixed inset-0 z-[-1]">
        {theme !== 'accessible' && (
          <img src={getBackgroundImage()} alt="Theme Background" className="w-full h-full object-cover transition-opacity duration-1000" />
        )}
        <div className={`absolute inset-0 transition-colors duration-500 ${
            theme === 'evening' ? 'bg-indigo-950/40' : 
            theme === 'accessible' ? 'bg-black' : 'bg-gradient-to-b from-orange-100/40 via-white/20 to-orange-50/60'
        }`}></div>
      </div>

      <Header 
        currentUser={currentUser}
        showFavoritesOnly={showFavoritesOnly}
        theme={theme}
        isReadableFont={isReadableFont}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onSetTheme={setTheme}
        onToggleReadableFont={() => setIsReadableFont(!isReadableFont)}
      />

      <CategoryBar 
        categories={categories}
        activeCategory={showFavoritesOnly ? '' : activeCategoryId}
        currentUser={currentUser}
        onSelectCategory={setActiveCategoryId}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSearch={handleSearch}
      />

      {!showFavoritesOnly && currentUser && <DailyDeed userId={currentUser.id} />}

      <div className="flex-1 relative z-10">
        <ArticleList 
          articles={articles}
          loading={loading}
          activeCategoryLabel={activeCategoryLabel}
          showFavoritesOnly={showFavoritesOnly}
          favoriteIds={favoriteArticleIds}
          currentUser={currentUser}
          theme={theme}
          onArticleClick={setSelectedArticle}
          onRefresh={loadNews}
          onImageGenerated={onImageGenerated}
          onToggleFavorite={handleToggleFavorite}
          onLikeClick={handleLike}
          onDislikeClick={handleDislike}
          onCloseFavorites={() => setShowFavoritesOnly(false)}
          onLoginRequest={() => setShowLoginModal(true)}
          onShareClick={handleOpenShare}
        />
      </div>

      <Footer />

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      {selectedArticle && (
        <ArticleDetail 
          article={selectedArticle} 
          nextArticle={nextArticle}
          currentUser={currentUser} 
          isFavorite={selectedArticle.id ? favoriteArticleIds.has(selectedArticle.id) : false}
          onClose={() => setSelectedArticle(null)}
          onLoginRequest={() => setShowLoginModal(true)}
          onToggleFavorite={handleToggleFavorite}
          onLikeClick={() => handleLike(selectedArticle)}
          onDislikeClick={() => handleDislike(selectedArticle)}
          onUpdate={handleArticleUpdate}
          onShareClick={() => handleOpenShare(selectedArticle)}
        />
      )}

      {sharingArticle && <ShareModal article={sharingArticle} onClose={() => setSharingArticle(null)} />}
    </div>
  );
}

export default App;
