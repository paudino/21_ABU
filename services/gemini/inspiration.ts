
import { getClient } from './client';
import { Quote } from '../../types';
import { Type } from "@google/genai";

/**
 * Genera una citazione ispirazionale pulendo eventuali residui di testo o markdown.
 */
export const generateInspirationalQuote = async (): Promise<Quote | null> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Genera una citazione famosa, positiva e ispirante in italiano. Rispondi solo in JSON.",
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: 'Testo della citazione.',
            },
            author: {
              type: Type.STRING,
              description: 'Autore della citazione.',
            },
          },
          required: ["text", "author"],
        }
      }
    });

    const text = response.text || "{}";
    
    // Pulizia robusta del JSON nel caso Gemini aggiunga ```json o altro testo
    let cleanedJson = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanedJson = jsonMatch[0];
    }

    const data = JSON.parse(cleanedJson);
    if (data.text && data.author) {
      return { id: '', text: data.text, author: data.author };
    }
    return null;
  } catch (error) {
    console.error("Errore Quote Gemini:", error);
    return null;
  }
};

export const generateGoodDeed = async (): Promise<string | null> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Suggerisci una piccola buona azione da fare oggi (max 10 parole). Rispondi solo in JSON.",
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: 'La descrizione della buona azione suggerita.',
            },
          },
          required: ["text"],
        }
      }
    });

    const text = response.text || "{}";
    let cleanedJson = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanedJson = jsonMatch[0];
    }

    const data = JSON.parse(cleanedJson);
    return data.text || null;
  } catch (error) {
    console.error("Errore Deed Gemini:", error);
    return null;
  }
};
