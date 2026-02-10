
import { supabase } from '../supabaseClient';
import { Comment, User } from '../../types';
import { ensureUserExists } from './authService';

const isValidUUID = (id: string | undefined): boolean => {
    if (!id) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
};

// --- Commenti ---

export const getComments = async (articleId: string): Promise<Comment[]> => {
    if (!isValidUUID(articleId)) return [];
    console.log(`[BUON-UMORE] [DB] 💬 Recupero commenti per articolo ID: ${articleId}`);
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('article_id', articleId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error("[BUON-UMORE] [DB] ❌ Errore recupero commenti:", error.message);
            return [];
        }
        return (data || []).map((c: any) => ({
            id: c.id, 
            articleId: c.article_id, 
            userId: c.user_id, 
            username: c.username, 
            text: c.text, 
            timestamp: new Date(c.created_at).getTime()
        }));
    } catch (e) {
        console.error("[BUON-UMORE] [DB] ❌ Eccezione recupero commenti:", e);
        return [];
    }
};

export const addComment = async (articleId: string, user: User, text: string): Promise<Comment> => {
    console.log(`[BUON-UMORE] [DB] ✍️ Tentativo inserimento commento per articolo ID: ${articleId}`);
    if (!isValidUUID(articleId)) {
        console.error("[BUON-UMORE] [DB] ❌ ID Articolo non valido per il commento");
        throw new Error("L'articolo non è ancora stato sincronizzato. Riprova tra un secondo.");
    }
    
    await ensureUserExists(user);

    const { data, error } = await supabase
        .from('comments')
        .insert([{ 
            article_id: articleId, 
            user_id: user.id, 
            username: user.username, 
            text 
        }])
        .select()
        .single();

    if (error) {
        console.error("[BUON-UMORE] [DB] ❌ Errore salvataggio commento Supabase:", error.message);
        throw error;
    }

    console.log("[BUON-UMORE] [DB] ✅ Commento inserito correttamente");
    return { 
        id: data.id, 
        articleId: data.article_id, 
        userId: data.user_id, 
        username: data.username, 
        text: data.text, 
        timestamp: new Date(data.created_at).getTime() 
    };
};

export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
    console.log(`[BUON-UMORE] [DB] 🗑️ Richiesta eliminazione commento: ${commentId}`);
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
        
    if (error) console.error("[BUON-UMORE] [DB] ❌ Errore eliminazione:", error.message);
    else console.log("[BUON-UMORE] [DB] ✅ Commento rimosso.");
};

// --- Like / Dislike ---

export const getBatchCounts = async (articleIds: string[]) => {
    const validIds = articleIds.filter(isValidUUID);
    if (validIds.length === 0) return { likes: {}, dislikes: {} };
    
    console.log(`[BUON-UMORE] [DB] 📊 Recupero voti batch per ${validIds.length} articoli`);
    
    const [likesRes, dislikesRes] = await Promise.all([
        supabase.from('likes').select('article_id').in('article_id', validIds),
        supabase.from('dislikes').select('article_id',).in('article_id', validIds)
    ]);

    const likes: Record<string, number> = {};
    const dislikes: Record<string, number> = {};

    likesRes.data?.forEach((l: any) => {
        likes[l.article_id] = (likes[l.article_id] || 0) + 1;
    });
    dislikesRes.data?.forEach((d: any) => {
        dislikes[d.article_id] = (dislikes[d.article_id] || 0) + 1;
    });

    return { likes, dislikes };
};

export const toggleLike = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId)) return false;
    console.log(`[BUON-UMORE] [DB] 👍 Voto Like su ${articleId}`);
    
    await supabase.from('dislikes').delete().eq('article_id', articleId).eq('user_id', userId);
    
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();
    
    if (existingLike) { 
        await supabase.from('likes').delete().eq('id', existingLike.id); 
        return false; 
    } else { 
        const { error } = await supabase.from('likes').insert([{ article_id: articleId, user_id: userId }]); 
        if (error) console.error("[BUON-UMORE] [DB] ❌ Errore Like:", error.message);
        return true; 
    }
};

export const toggleDislike = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId)) return false;
    console.log(`[BUON-UMORE] [DB] 👎 Voto Dislike su ${articleId}`);
    
    await supabase.from('likes').delete().eq('article_id', articleId).eq('user_id', userId);
    
    const { data: existingDislike } = await supabase
        .from('dislikes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();
    
    if (existingDislike) { 
        await supabase.from('dislikes').delete().eq('id', existingDislike.id); 
        return false; 
    } else { 
        await supabase.from('dislikes').insert([{ article_id: articleId, user_id: userId }]); 
        return true; 
    }
};

export const getLikeCount = async (articleId: string): Promise<number> => {
    if (!isValidUUID(articleId)) return 0;
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('article_id', articleId);
    return count || 0;
};

export const getDislikeCount = async (articleId: string): Promise<number> => {
    if (!isValidUUID(articleId)) return 0;
    const { count } = await supabase.from('dislikes').select('*', { count: 'exact', head: true }).eq('article_id', articleId);
    return count || 0;
};

export const hasUserLiked = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId) || !userId) return false;
    const { data } = await supabase.from('likes').select('id').eq('article_id', articleId).eq('user_id', userId).maybeSingle();
    return !!data;
};

export const hasUserDisliked = async (articleId: string, userId: string): Promise<boolean> => {
    if (!isValidUUID(articleId) || !userId) return false;
    const { data } = await supabase.from('dislikes').select('id').eq('article_id', articleId).eq('user_id', userId).maybeSingle();
    return !!data;
};
