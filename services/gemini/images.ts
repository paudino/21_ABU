
import { getClient } from './client';

export const generateArticleImage = async (title: string): Promise<string | null> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
            parts: [
                { text: `Crea un'immagine in stile 'flat vector art', moderna, solare e colorata, senza testo, che rappresenti questo concetto: "${title}". Colori vivaci, atmosfera felice.` }
            ]
        }
    });

    // Cerca la parte immagine nella risposta
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;

  } catch (error) {
    console.error("Errore generazione immagine:", error);
    return null;
  }
};
