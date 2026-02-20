
import { supabase } from '../supabaseClient';
import { Article } from '../../types';

const isValidUUID = (id: string | undefined): boolean => {
    if (!id) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
};

export const isFavorite = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId) || !userId) return false;
    try {
        const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('article_id', articleId)
                .eq('user_id', userId)
                .maybeSingle();
        return !!data;
    } catch { return false; }
};

export const addFavorite = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId) || !userId) return false;
    console.log(`[DB-FAVS] ❤️ Aggiunta preferito: Articolo ${articleId} per Utente ${userId}`);
    try {
        const { error } = await supabase
                .from('favorites')
                .insert([{ article_id: articleId, user_id: userId }]);
        if (error) console.error("[DB-FAVS] ❌ Errore aggiunta:", error.message);
        return !error || error.code === '23505';
    } catch (e) { 
        console.error("[DB-FAVS] ❌ Eccezione aggiunta:", e);
        return false; 
    }
};

export const removeFavorite = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId) || !userId) return false;
    console.log(`[DB-FAVS] 💔 Rimozione preferito: Articolo ${articleId} per Utente ${userId}`);
    try {
        const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('article_id', articleId)
                .eq('user_id', userId);
        if (error) console.error("[DB-FAVS] ❌ Errore rimozione:", error.message);
        return !error;
    } catch (e) { 
        console.error("[DB-FAVS] ❌ Eccezione rimozione:", e);
        return false; 
    }
};

export const getUserFavoriteArticles = async (userId: string): Promise<Article[]> => {
    if (!userId) {
        console.warn("[DB-FAVS] ⚠️ Chiamata a getUserFavoriteArticles senza userId");
        return [];
    }
    
    console.log("[DB-FAVS] 📡 Recupero articoli preferiti dal DB per utente:", userId);
    
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                article_id,
                articles (
                    id,
                    title,
                    summary,
                    source,
                    url,
                    published_date,
                    category,
                    image_url,
                    audio_base64,
                    sentiment_score
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[DB-FAVS] ❌ Errore query preferiti:", error.message);
            return [];
        }

        if (!data || data.length === 0) {
            console.log("[DB-FAVS] ℹ️ Nessun articolo preferito trovato.");
            return [];
        }

        const mapped: Article[] = data
            .map(item => {
                // Gestione robusta della risposta Supabase: 'articles' può essere un oggetto o un array di un elemento
                const rawArt = Array.isArray(item.articles) ? item.articles[0] : item.articles;
                
                if (!rawArt) return null;

                return {
                    id: rawArt.id,
                    title: rawArt.title,
                    summary: rawArt.summary,
                    source: rawArt.source,
                    url: rawArt.url,
                    date: rawArt.published_date || '',
                    category: rawArt.category || 'Generale',
                    imageUrl: rawArt.image_url || '',
                    audioBase64: rawArt.audio_base64 || '',
                    sentimentScore: rawArt.sentiment_score || 0.8,
                    likeCount: 0,
                    dislikeCount: 0
                };
            })
            .filter((a): a is Article => a !== null);
            
        console.log(`[DB-FAVS] ✅ Mappati ${mapped.length} articoli preferiti.`);
        return mapped;
    } catch (e) {
        console.error("[DB-FAVS] ❌ Eccezione nel recupero preferiti:", e);
        return [];
    }
};

export const getUserFavoritesIds = async (userId: string): Promise<Set<string>> => {
    if (!userId) return new Set();
    try {
        const { data, error } = await supabase.from('favorites').select('article_id').eq('user_id', userId);
        if (error) {
            console.error("[DB-FAVS] ❌ Errore recupero ID preferiti:", error.message);
            return new Set();
        }
        const ids = new Set<string>(data?.map(r => r.article_id as string) || []);
        console.log(`[DB-FAVS] 🔑 Sincronizzati ${ids.size} ID preferiti.`);
        return ids;
    } catch (e) { 
        console.error("[DB-FAVS] ❌ Eccezione recupero ID:", e);
        return new Set(); 
    }
};
