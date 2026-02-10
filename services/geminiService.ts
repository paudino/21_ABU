
/**
 * ⚠️ AGGREGATORE SERVIZI AI ⚠️
 * Questo file mantiene la compatibilità con il resto dell'app
 * riesportando le funzionalità dai moduli specifici in services/gemini/
 */

export { fetchPositiveNews } from './gemini/news';
export { generateArticleImage } from './gemini/images';
export { generateAudio } from './gemini/audio';
export { generateInspirationalQuote, generateGoodDeed } from './gemini/inspiration';
