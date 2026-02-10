
// Definizione dell'utente
export interface User {
  id: string;       // UUID di Supabase
  username: string; // Nome visualizzato
  avatar: string;   // URL avatar
}

// Definizione di un commento
export interface Comment {
  id: string;
  articleId: string; 
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

// Definizione dell'articolo generato dall'AI
export interface Article {
  id?: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string; // Formato YYYY-MM-DD
  category: string;
  imageUrl?: string; 
  audioBase64?: string;
  sentimentScore: number;
  isNew?: boolean;
  likeCount?: number;
  dislikeCount?: number;
}

// Categoria di notizie
export interface Category {
  id: string;
  label: string;
  value: string;
  user_id?: string | null;
}

// Nuove interfacce per Citazioni e Buoni Propositi
export interface Quote {
  id: string;
  text: string;
  author: string;
  createdAt?: string;
}

export interface Deed {
  id: string;
  text: string;
  createdAt?: string;
}

// Tipo Tema
export type Theme = 'sunshine' | 'evening' | 'accessible';

// COSTANTI - Categorie richieste aggiornate
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'tech', label: 'Tecnologia', value: 'tecnologia digitale, intelligenza artificiale, robotica, spazio, startup tech' },
  { id: 'med', label: 'Medicina', value: 'scoperte mediche, salute, benessere fisico, biologia' },
  { id: 'pol', label: 'Politica', value: 'cooperazione internazionale, trattati di pace, diritti civili, diplomazia' },
  { id: 'env', label: 'Ambiente', value: 'ecologia, riforestazione, energie rinnovabili, salvaguardia animali' },
  { id: 'soc', label: 'Società', value: 'solidarietà, inclusione, volontariato, atti di gentilezza' }
];
