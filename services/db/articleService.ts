
import { supabase } from '../supabaseClient';
import { Article } from '../../types';

// Funzione di utilità per normalizzare gli URL ed evitare duplicati tecnici
const normalizeUrl = (url: string): string => {
    try {
        const u = new URL(url);
        // Rimuoviamo protocollo (per gestire http/https come uguali), slash finali e parametri di query comuni
        let normalized = u.hostname + u.pathname.replace(/\/$/, "");
        return normalized.toLowerCase();
    } catch (e) {
        return url.trim().toLowerCase().replace(/\/$/, "");
    }
};

export const cleanupOldArticles = async (): Promise<void> => {
    try { await supabase.rpc('cleanup_old_articles'); } catch (e) {}
};

export const getCachedArticles = async (categoryLabel: string): Promise<Article[]> => {
    const cleanLabel = categoryLabel ? categoryLabel.trim() : 'Generale';
    
    try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('category', cleanLabel)
          .order('created_at', { ascending: false })
          .limit(40);

        if (error) {
            console.error(`[DB-ARTICLES] ❌ Errore query:`, error.message);
            return [];
        }
        return mapArticles(data);
    } catch (e) {
        return [];
    }
};

const mapArticles = (data: any[] | null): Article[] => {
    if (!data) return [];
    
    // Deduplicazione basata su URL normalizzato
    const uniqueMap = new Map();
    data.forEach(item => {
        const norm = normalizeUrl(item.url);
        if (!uniqueMap.has(norm)) {
            uniqueMap.set(norm, item);
        }
    });

    return Array.from(uniqueMap.values()).map((a: any) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        source: a.source,
        url: a.url,
        date: a.published_date || a.date || new Date(a.created_at).toLocaleDateString(),
        category: a.category,
        imageUrl: a.image_url || '',
        audioBase64: a.audio_base_base64 || a.audio_base64 || '',
        sentimentScore: a.sentiment_score || 0.8,
        likeCount: a.like_count || 0,
        dislikeCount: a.dislike_count || 0
    }));
};

export const saveArticles = async (categoryLabel: string, articles: Article[]): Promise<Article[]> => {
    if (!articles || articles.length === 0) return [];
    
    const savedArticles: Article[] = [];
    const cleanCategory = (categoryLabel || 'Generale').trim();
    
    // Filtro duplicati nell'input basato su URL normalizzato
    const uniqueInputMap = new Map();
    articles.forEach(a => {
        if (a.url) {
            const norm = normalizeUrl(a.url);
            if (!uniqueInputMap.has(norm)) uniqueInputMap.set(norm, a);
        }
    });
    
    const uniqueInput = Array.from(uniqueInputMap.values());

    for (const article of uniqueInput) {
        const row = {
            url: article.url, 
            category: article.category || cleanCategory,
            title: article.title,
            summary: article.summary,
            source: article.source,
            published_date: article.date, 
            sentiment_score: article.sentimentScore,
            image_url: article.imageUrl || null,
            audio_base64: article.audioBase64 || null
        };

        try {
            // Upsert gestisce il conflitto sulla colonna 'url' definita come UNIQUE nel DB
            const { data, error } = await supabase
                .from('articles')
                .upsert(row, { onConflict: 'url' })
                .select()
                .single();

            if (data) {
                savedArticles.push({
                    ...article,
                    id: data.id,
                    category: data.category,
                    audioBase64: data.audio_base_64 || data.audio_base64
                });
            }
        } catch (e) {
            console.error("[DB-ARTICLES] Errore salvataggio articolo:", article.title, e);
        }
    }
    return savedArticles;
};

export const updateArticleImage = async (articleUrl: string, imageUrl: string): Promise<void> => {
    try { 
        await supabase.from('articles').update({ image_url: imageUrl }).eq('url', articleUrl); 
    } catch (e) {}
};

export const updateArticleAudio = async (articleUrl: string, audioBase64: string): Promise<void> => {
    try { 
        await supabase.from('articles').update({ audio_base_64: audioBase64 }).eq('url', articleUrl); 
    } catch (e) {}
};
