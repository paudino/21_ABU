
import { getClient } from './client';
import { Article } from '../../types';

/**
 * Cerca notizie positive usando Gemini 3 con Google Search Grounding.
 */
export const fetchPositiveNews = async (promptCategory: string, categoryLabel: string): Promise<Article[]> => {
  console.log(`[GEMINI-NEWS] 🔍 Ricerca notizie per: "${categoryLabel}"`);
  
  const ai = getClient();
  
  // Prompt più rigoroso per forzare l'output JSON
  const prompt = `
    Cerca sul web 3 notizie RECENTI (ultime 48 ore) e POSITIVE riguardanti: "${promptCategory}".
    Devono essere fatti reali, non opinioni.
    
    RESTITUISCI ESCLUSIVAMENTE UN ARRAY JSON VALIDO.
    FORMATO:
    [
      {
        "title": "Titolo breve",
        "summary": "Riassunto positivo (2-3 frasi)",
        "source": "Nome della testata giornalistica",
        "date": "YYYY-MM-DD",
        "sentimentScore": 0.9
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text || "";
    if (!responseText) {
        console.warn("[GEMINI-NEWS] ⚠️ Risposta vuota dal modello.");
        return [];
    }

    // Estrazione link reali dai metadati di grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webLinks = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => chunk.web.uri);

    // Pulizia e parsing robusto del JSON
    let jsonStr = responseText;
    // Rimuove eventuali blocchi di codice markdown ```json ... ```
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Trova l'inizio e la fine dell'array JSON nel caso ci sia testo extra
    const startIdx = jsonStr.indexOf('[');
    const endIdx = jsonStr.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }

    try {
      const rawArticles = JSON.parse(jsonStr);
      
      if (!Array.isArray(rawArticles)) {
          throw new Error("L'output non è un array.");
      }

      return rawArticles.map((a: any, index: number) => {
        // Fallback per l'URL: prova a usare il grounding, altrimenti costruisce un link di ricerca
        const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(a.title + " " + a.source)}`;
        const realUrl = (webLinks.length > index) ? webLinks[index] : fallbackUrl;

        return {
          title: a.title || "Notizia Positiva",
          summary: a.summary || "Contenuto non disponibile",
          source: a.source || "Fonte Web",
          url: realUrl,
          date: a.date || new Date().toISOString().split('T')[0],
          category: categoryLabel,
          imageUrl: '',
          sentimentScore: a.sentimentScore || 0.85
        };
      });
    } catch (parseError) {
      console.error("[GEMINI-NEWS] ❌ Errore parsing JSON:", parseError, "Raw text:", responseText);
      return [];
    }

  } catch (error: any) {
    console.error("[GEMINI-NEWS] ❌ Errore API Gemini:", error.message);
    return [];
  }
};
