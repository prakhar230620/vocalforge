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
import lamejs from 'lamejs';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: z.string().describe('The voice style to use for the speech.'),
  styleInstructions: z.string().optional().describe('Instructions on how the text should be read (e.g., tone, style).'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated speech as a MP3 data URI. Expected format: 'data:audio/mpeg;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toMp3(
  pcmData: Buffer,
  channels = 1,
  sampleRate = 24000
): Promise<string> {
  const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
  
  // PCM data from Gemini is 16-bit, so 2 bytes per sample.
  const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / Int16Array.BYTES_PER_ELEMENT);

  const mp3Data: Buffer[] = [];
  const blockSize = 1152; // Encoder block size
  for (let i = 0; i < samples.length; i += blockSize) {
    const sampleChunk = samples.subarray(i, i + blockSize);
    const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(mp3buf));
    }
  }
  const mp3buf = mp3Encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(Buffer.from(mp3buf));
  }
  
  return Buffer.concat(mp3Data).toString('base64');
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
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const mp3Base64 = await toMp3(audioBuffer);
    
    return {
      audioDataUri: `data:audio/mpeg;base64,${mp3Base64}`,
    };
  }
);
