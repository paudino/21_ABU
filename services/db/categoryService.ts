
import { supabase } from '../supabaseClient';
import { Category, DEFAULT_CATEGORIES } from '../../types';

export const getCategories = async (userId?: string): Promise<Category[]> => {
    try {
        let query = supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (userId) {
            query = query.or(`user_id.is.null,user_id.eq.${userId}`);
        } else {
            query = query.is('user_id', null);
        }
        
        const { data, error } = await query;
        if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;
        return data as Category[];
    } catch (e) {
        return DEFAULT_CATEGORIES;
    }
};

export const seedCategories = async (): Promise<void> => {
    try {
        const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
        if (count === 0) {
            const toInsert = DEFAULT_CATEGORIES.map(c => ({ label: c.label, value: c.value }));
            await supabase.from('categories').insert(toInsert);
        }
    } catch (e) {}
};

export const addCategory = async (label: string, value: string, userId: string): Promise<Category | null> => {
    try {
        const cleanLabel = label.trim();
        // 1. Check local standard categories first
        if (DEFAULT_CATEGORIES.some(c => c.label.toLowerCase() === cleanLabel.toLowerCase())) {
            return null;
        }

        // 2. Controllo duplicati case-insensitive nel DB per l'utente specifico o categorie pubbliche
        const { data: existing } = await supabase
          .from('categories')
          .select('id, label')
          .ilike('label', cleanLabel)
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .maybeSingle();

        if (existing) {
            return null; 
        }

        const { data, error } = await supabase
          .from('categories')
          .insert([{ label: cleanLabel, value, user_id: userId }])
          .select()
          .single();
          
        if (error) throw error;
        return data as Category;
    } catch (e) {
        console.error("[DB-CATS] Errore aggiunta categoria:", e);
        return null;
    }
};

export const deleteCategory = async (categoryId: string, userId: string): Promise<boolean> => {
    console.log(`[DB-CATS] 📡 Tentativo eliminazione Supabase per riga ID: ${categoryId} e User: ${userId}`);
    try {
        // Usiamo select() e maybeSingle() per avere certezza del risultato
        const { data, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId)
            .eq('user_id', userId)
            .select()
            .maybeSingle();
            
        if (error) {
            console.error("[DB-CATS] ❌ Errore Supabase DELETE:", error.message);
            return false;
        }
        
        if (!data) {
            console.warn("[DB-CATS] ⚠️ Riga non trovata o permessi insufficienti per la cancellazione.");
            return false;
        }

        console.log(`[DB-CATS] ✅ Categoria '${data.label}' eliminata correttamente dal database.`);
        return true;
    } catch (e) {
        console.error("[DB-CATS] ❌ Eccezione durante la cancellazione:", e);
        return false;
    }
};
