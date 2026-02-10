
import { GoogleGenAI } from "@google/genai";

/**
 * Client Gemini factory.
 * Crea una nuova istanza ogni volta per assicurare l'uso della chiave API più recente 
 * ed evitare stati persistenti tra le richieste, seguendo le linee guida.
 */
export const getClient = () => {
  // La chiave API deve essere ottenuta esclusivamente dalla variabile d'ambiente process.env.API_KEY
  // e passata come parametro nominato durante l'inizializzazione.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
