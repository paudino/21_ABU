
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
        // CORREZIONE: audio_base64 (senza underscore prima di 64) per corrispondere allo schema
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
            console.error("[DB-FAVS] Dettagli errore:", error);
            return [];
        }

        if (!data || data.length === 0) {
            console.log("[DB-FAVS] ℹ️ Nessun articolo preferito trovato per questo utente.");
            return [];
        }

        console.log(`[DB-FAVS] 📦 Dati grezzi ricevuti: ${data.length} righe.`);

        const mapped = data
            .filter(item => {
                if (!item.articles) {
                    console.warn(`[DB-FAVS] ⚠️ Articolo mancante per favorite con ID: ${item.article_id}`);
                    return false;
                }
                return true;
            })
            .map(item => {
                const a: any = item.articles;
                return {
                    id: a.id,
                    title: a.title,
                    summary: a.summary,
                    source: a.source,
                    url: a.url,
                    date: a.published_date || '',
                    category: a.category || 'Generale',
                    imageUrl: a.image_url || '',
                    // Fix: Use audio_base64 to match database schema
                    audioBase64: a.audio_base64 || '',
                    sentimentScore: a.sentiment_score || 0.8,
                    likeCount: 0,
                    dislikeCount: 0
                };
            });
            
        console.log(`[DB-FAVS] ✅ Recuperati con successo ${mapped.length} articoli preferiti.`);
        return mapped;
    } catch (e) {
        console.error("[DB-FAVS] ❌ Eccezione fatale durante il recupero dei preferiti:", e);
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
        // Fix: Explicitly type the Set as Set<string> and cast article_id to string to resolve unknown type error
        const ids = new Set<string>(data?.map(r => r.article_id as string) || []);
        console.log(`[DB-FAVS] 🔑 Sincronizzati ${ids.size} ID preferiti.`);
        return ids;
    } catch (e) { 
        console.error("[DB-FAVS] ❌ Eccezione recupero ID:", e);
        return new Set(); 
    }
};
