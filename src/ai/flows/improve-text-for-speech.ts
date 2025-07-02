// src/ai/flows/improve-text-for-speech.ts
'use server';
/**
 * @fileOverview This file contains a Genkit flow that improves text for speech synthesis by correcting errors and improving clarity.
 *
 * - improveTextForSpeech - A function that enhances the input text for better speech synthesis.
 * - ImproveTextForSpeechInput - The input type for the improveTextForSpeech function.
 * - ImproveTextForSpeechOutput - The return type for the improveTextForSpeech function.
 */

import {getAI} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveTextForSpeechInputSchema = z.object({
  text: z.string().describe('The text to be improved for speech synthesis.'),
});
export type ImproveTextForSpeechInput = z.infer<typeof ImproveTextForSpeechInputSchema>;

const ImproveTextForSpeechOutputSchema = z.object({
  improvedText: z.string().describe('The improved text, corrected and optimized for speech synthesis.'),
});
export type ImproveTextForSpeechOutput = z.infer<typeof ImproveTextForSpeechOutputSchema>;

export async function improveTextForSpeech(input: ImproveTextForSpeechInput): Promise<ImproveTextForSpeechOutput> {
  return improveTextForSpeechFlow(input);
}

const prompt = getAI().definePrompt({
  name: 'improveTextForSpeechPrompt',
  input: {schema: ImproveTextForSpeechInputSchema},
  output: {schema: ImproveTextForSpeechOutputSchema},
  prompt: `You are an AI text improver for speech synthesis.

You will receive text and you will improve it for speech synthesis.
This includes correcting errors, improving clarity, and making the text more natural-sounding when spoken.

Original Text: {{{text}}}

Improved Text:`,  
});

const improveTextForSpeechFlow = getAI().defineFlow(
  {
    name: 'improveTextForSpeechFlow',
    inputSchema: ImproveTextForSpeechInputSchema,
    outputSchema: ImproveTextForSpeechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
