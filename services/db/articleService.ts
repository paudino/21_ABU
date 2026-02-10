
import { supabase } from '../supabaseClient';
import { Article } from '../../types';

export const cleanupOldArticles = async (): Promise<void> => {
    try { await supabase.rpc('cleanup_old_articles'); } catch (e) {}
};

export const getCachedArticles = async (categoryLabel: string): Promise<Article[]> => {
    const cleanLabel = categoryLabel ? categoryLabel.trim() : 'Generale';
    
    try {
        let query = supabase
          .from('articles')
          .select('*')
          .eq('category', cleanLabel)
          .order('created_at', { ascending: false })
          .limit(25);

        const { data, error } = await query;

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
    return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        source: a.source,
        url: a.url,
        date: a.published_date || a.date || new Date(a.created_at).toLocaleDateString(),
        category: a.category,
        imageUrl: a.image_url || '',
        // Fix: Use audio_base64 to match database schema
        audioBase64: a.audio_base64 || '',
        sentimentScore: a.sentiment_score || 0.8,
        likeCount: a.like_count || 0,
        dislikeCount: a.dislike_count || 0
    }));
};

export const saveArticles = async (categoryLabel: string, articles: Article[]): Promise<Article[]> => {
    if (!articles || articles.length === 0) return [];
    
    const savedArticles: Article[] = [];
    const cleanCategory = (categoryLabel || 'Generale').trim();

    for (const article of articles) {
        if (!article.url) continue;

        const row = {
            url: article.url, 
            category: article.category || cleanCategory,
            title: article.title,
            summary: article.summary,
            source: article.source,
            published_date: article.date, 
            sentiment_score: article.sentimentScore,
            image_url: article.imageUrl || null,
            // Fix: Use audio_base64 to match database schema
            audio_base64: article.audioBase64 || null
        };

        try {
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
                    audioBase64: data.audio_base64
                });
            }
        } catch (e) {}
    }
    return savedArticles;
};

export const updateArticleImage = async (articleUrl: string, imageUrl: string): Promise<void> => {
    try { 
        await supabase.from('articles').update({ image_url: imageUrl }).eq('url', articleUrl); 
    } catch (e) {}
};

export const updateArticleAudio = async (articleUrl: string, audioBase64: string): Promise<void> => {
    // Fix: Updated to use audio_base64 primarily to match database schema
    try { 
        await supabase.from('articles').update({ audio_base64: audioBase64 }).eq('url', articleUrl); 
    } catch (e) {
        // Fallback in case of mismatch schema
        try { await supabase.from('articles').update({ audio_base64: audioBase64 }).eq('url', articleUrl); } catch(e2){}
    }
};
