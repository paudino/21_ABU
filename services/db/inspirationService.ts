
import { supabase } from '../supabaseClient';
import { Quote, Deed } from '../../types';

export const getRandomQuote = async (): Promise<Quote | null> => {
    try {
        const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
        if (!count) return null;
        const randomIndex = Math.floor(Math.random() * count);
        const { data } = await supabase.from('quotes').select('*').range(randomIndex, randomIndex).maybeSingle();
        return data as Quote;
    } catch(e) { return null; }
};

export const saveQuote = async (quote: Quote): Promise<void> => {
    try {
        const { data } = await supabase.from('quotes').select('id').eq('text', quote.text).maybeSingle();
        if (!data) {
             await supabase.from('quotes').insert([{ text: quote.text, author: quote.author }]);
             await supabase.rpc('maintain_quotes_limit');
        }
    } catch (e) {}
};

export const getRandomDeed = async (): Promise<Deed | null> => {
    try {
        const { count } = await supabase.from('deeds').select('*', { count: 'exact', head: true });
        if (!count) return null;
        const randomIndex = Math.floor(Math.random() * count);
        const { data } = await supabase.from('deeds').select('*').range(randomIndex, randomIndex).maybeSingle();
        return data as Deed;
    } catch(e) { return null; }
};

export const saveDeed = async (text: string): Promise<void> => {
    try {
        const { data } = await supabase.from('deeds').select('id').eq('text', text).maybeSingle();
        if (!data) {
            await supabase.from('deeds').insert([{ text }]);
            await supabase.rpc('maintain_deeds_limit');
        }
    } catch(e) {}
};
