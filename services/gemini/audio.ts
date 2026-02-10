
import { getClient } from './client';
import { Modality } from "@google/genai";

/**
 * Genera l'audio per un testo dato usando il modello TTS di Gemini.
 */
export const generateAudio = async (text: string): Promise<string | null> => {
    // Validazione input
    let safeText = text.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
    if (safeText.length < 5) return null;

    const ai = getClient();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: safeText }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Aoede' } // Voce calma e professionale
                    }
                }
            }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return audioData || null;

    } catch (error) {
        console.error("Errore generazione Audio:", error);
        return null;
    }
};
