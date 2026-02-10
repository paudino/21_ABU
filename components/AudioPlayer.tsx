
import React, { useState, useRef, useEffect } from 'react';
import { IconHeadphones, IconPlay, IconPause, IconRefresh } from './Icons';
import { generateAudio } from '../services/geminiService';
import { db } from '../services/dbService';

interface AudioPlayerProps {
    articleTitle: string;
    articleSummary: string;
    articleUrl: string;
    initialAudioBase64?: string;
    canPlay: boolean;
    autoGenerate?: boolean; // Nuova prop per il caricamento predittivo
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    articleTitle, 
    articleSummary, 
    articleUrl, 
    initialAudioBase64,
    canPlay,
    autoGenerate = false
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioBase64, setAudioBase64] = useState<string | undefined>(initialAudioBase64);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const isGeneratingRef = useRef(false);

    // Caricamento Predittivo Audio
    useEffect(() => {
        if (autoGenerate && !audioBase64 && canPlay && !isGeneratingRef.current) {
            console.log("[PREDICTIVE] 🎙️ Generazione predittiva audio in corso...");
            prepareAudio();
        }
    }, [autoGenerate, audioBase64, canPlay]);

    // Pulizia risorse al unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    const prepareAudio = async () => {
        if (isGeneratingRef.current) return;
        isGeneratingRef.current = true;
        setIsLoading(true);
        try {
            const textToRead = `${articleTitle}. ${articleSummary}`;
            const currentAudio = await generateAudio(textToRead);
            if (currentAudio) {
                setAudioBase64(currentAudio);
                if (articleUrl) {
                    db.updateArticleAudio(articleUrl, currentAudio).catch(e => console.error("Cache audio fallita", e));
                }
            }
        } catch (e) {
            console.error("Errore generazione predittiva:", e);
        } finally {
            setIsLoading(false);
            isGeneratingRef.current = false;
        }
    };

    const stopAudio = () => {
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch(e) {}
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const handlePlayPause = async () => {
        if (!canPlay) return;

        if (isPlaying) {
            stopAudio();
            return;
        }

        let currentAudio = audioBase64;

        if (!currentAudio) {
            setIsLoading(true);
            try {
                console.log("[AudioPlayer] Generazione audio AI...");
                const textToRead = `${articleTitle}. ${articleSummary}`;
                currentAudio = await generateAudio(textToRead);
                
                if (currentAudio) {
                    setAudioBase64(currentAudio);
                    if (articleUrl) {
                        db.updateArticleAudio(articleUrl, currentAudio).catch(e => console.error("Salvataggio audio fallito", e));
                    }
                }
            } catch (e: any) {
                console.error("Errore playback:", e);
                alert(`Impossibile riprodurre l'audio: ${e.message}`);
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        if (!currentAudio) return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') { await ctx.resume(); }

            const binaryString = atob(currentAudio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const int16Data = new Int16Array(bytes.buffer);
            const float32Data = new Float32Array(int16Data.length);
            for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
            }
            const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
                setIsPlaying(false);
                audioSourceRef.current = null;
            };
            source.start(0);
            audioSourceRef.current = source;
            setIsPlaying(true);
        } catch (e: any) {
            console.error("Errore decodifica audio:", e);
            stopAudio();
        }
    };

    return (
        <div className="mb-8 p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isPlaying ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-white text-slate-400'}`}>
                    <IconHeadphones className="w-6 h-6" />
                </div>
                <div>
                    <span className="block text-indigo-900 font-bold text-sm">Ascolta la notizia</span>
                    {isLoading && !isPlaying && <span className="text-[10px] text-indigo-400 font-bold animate-pulse uppercase">AI in preparazione...</span>}
                </div>
            </div>
            
            <button 
                onClick={handlePlayPause} 
                disabled={!canPlay} 
                className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md transform hover:scale-105 active:scale-95
                    ${isPlaying 
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }
                    ${!canPlay ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                `}
            >
                {isLoading && !audioBase64 ? (
                    <IconRefresh spin className="w-5 h-5" />
                ) : isPlaying ? (
                    <>
                        <IconPause className="w-5 h-5" />
                        <span>Stop</span>
                    </>
                ) : (
                    <>
                        <IconPlay className="w-5 h-5" />
                        <span>Ascolta</span>
                    </>
                )}
            </button>
        </div>
    );
};
