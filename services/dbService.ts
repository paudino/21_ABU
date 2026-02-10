
import { supabase } from './supabaseClient';
import * as auth from './db/authService';
import * as categories from './db/categoryService';
import * as articles from './db/articleService';
import * as favorites from './db/favoriteService';
import * as interactions from './db/interactionService';
import * as inspiration from './db/inspirationService';

/**
 * ⚠️ GESTIONE STRUTTURA DATABASE ⚠️
 * Facade pattern per accesso unificato al DB.
 */

export { supabase };

// Aggregazione con spread operator (più sicuro di Object.assign per i moduli ES)
export const db = {
  ...auth,
  ...categories,
  ...articles,
  ...favorites,
  ...interactions,
  ...inspiration
};
