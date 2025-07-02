'use server';
/**
 * @fileOverview A text-to-speech AI flow using Genkit.
 *
 * - textToSpeech - A function that converts text to speech.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: z.string().describe('The voice style to use for the speech.'),
  styleInstructions: z.string().optional().describe('Instructions on how the text should be read (e.g., tone, style).'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated speech as a raw PCM data URI. Expected format: 'data:audio/x-raw-int16;rate=24000;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({text, voice, styleInstructions}) => {
    const prompt = styleInstructions ? `${styleInstructions}\n\n${text}` : text;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
      prompt: prompt,
    });
    
    if (!media) {
      throw new Error('No media returned from TTS model.');
    }
    
    return {
      audioDataUri: media.url,
    };
  }
);
