
import { supabase } from '../supabaseClient';
import { User } from '../../types';

export const ensureUserExists = async (user: User) => {
    if (!user.id) return;
    console.log(`[DB-AUTH] 🔍 Sincronizzazione utente DB: ${user.username} (${user.id})`);
    try {
        const { error } = await supabase.from('users').upsert({
            id: user.id,
            username: user.username,
            avatar: user.avatar
        }, { onConflict: 'id' });
        
        if (error) {
            console.error("[DB-AUTH] ❌ Errore upsert utente:", error.message);
        } else {
            console.log("[DB-AUTH] ✅ Utente sincronizzato correttamente.");
        }
    } catch (e) {
        console.error("[DB-AUTH] ❌ Eccezione durante sync utente:", e);
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    const username = email.split('@')[0];
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    try {
        const { data, error: authError } = await (supabase.auth as any).signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: username,
                    avatar_url: avatarUrl
                }
            }
        });

        if (authError) return { data, error: authError };

        if (data.user) {
            await ensureUserExists({
                id: data.user.id,
                username: username,
                avatar: avatarUrl
            });
        }
        return { data, error: null };
    } catch (e: any) {
        return { data: null, error: e };
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const response = await (supabase.auth as any).signInWithPassword({ email, password });
        if (response.data.user) {
            await ensureUserExists({
                id: response.data.user.id,
                username: response.data.user.user_metadata.full_name || email.split('@')[0],
                avatar: response.data.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.user.id}`
            });
        }
        return response;
    } catch (e: any) {
        console.error("[AUTH] ❌ Errore login:", e.message);
        return { data: null, error: e };
    }
};

export const signInWithProvider = async (provider: 'google') => {
    try {
        return await (supabase.auth as any).signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
                queryParams: { prompt: 'select_account' }
            }
        });
    } catch (e: any) {
        return { data: null, error: e };
    }
};

export const signOut = async () => {
    try {
        const { error } = await (supabase.auth as any).signOut();
        return { error };
    } catch (e: any) {
        return { error: e };
    }
};

export const getCurrentUserProfile = async (): Promise<User | null> => {
    try {
        const { data: { user }, error } = await (supabase.auth as any).getUser();
        if (error || !user) return null;

        const userProfile: User = {
            id: user.id,
            username: user.user_metadata.full_name || user.email?.split('@')[0] || 'Utente',
            avatar: user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        };

        // Assicuriamoci che il profilo esista nel DB
        await ensureUserExists(userProfile);
        return userProfile;
    } catch (e) {
        return null;
    }
};
