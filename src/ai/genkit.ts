import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import apiKeyManager from '@/lib/api-key-manager';

// Create a function to get a fresh instance of genkit with the next available API key
export function getAI() {
  const apiKey = apiKeyManager.getNextApiKey();
  
  if (!apiKey) {
    console.warn('Warning: No API keys available. All keys have reached their rate limits.');
    // Use environment variable directly as fallback
    const fallbackKey = process.env.GEMINI_API_KEY;
    
    if (!fallbackKey) {
      throw new Error('No API keys available. All keys have reached their rate limits and no fallback key found.');
    }
    
    return genkit({
      plugins: [googleAI({ apiKey: fallbackKey })],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.0-flash',
  });
}

// Create a lazy-loaded instance that only gets initialized when first used
// This prevents errors during server startup
let _ai: ReturnType<typeof genkit> | null = null;

export const ai = (() => {
  // Return a proxy that initializes the AI instance on first use
  return new Proxy({} as ReturnType<typeof genkit>, {
    get(target, prop) {
      if (!_ai) {
        try {
          _ai = getAI();
        } catch (error) {
          console.error('Failed to initialize AI instance:', error);
          throw error;
        }
      }
      return _ai[prop as keyof typeof _ai];
    }
  });
})();
