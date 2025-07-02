"use client";

import { useState } from 'react';
import { useSpeechHistory } from '@/hooks/use-speech-history';
import { improveTextForSpeech } from '@/ai/flows/improve-text-for-speech';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { SpeechHistoryItem, SpeechSettings } from '@/types';
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import * as lamejs from 'lamejs';

import { Header } from '@/components/header';
import { HistorySidebar } from '@/components/history-sidebar';
import { VoiceSettingsForm } from '@/components/voice-settings-form';
import { SpeechOutputCard } from '@/components/speech-output-card';

export default function VocalForgePage() {
  const [currentSpeech, setCurrentSpeech] = useState<SpeechHistoryItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { history, isLoading: isHistoryLoading, addSpeechItem, removeSpeechItem } = useSpeechHistory();
  const { toast } = useToast();
  const [isSheetOpen, setSheetOpen] = useState(false);

  function encodePcmToMp3(pcmDataUri: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const pcmBase64 = pcmDataUri.substring(pcmDataUri.indexOf(',') + 1);
            const pcmString = atob(pcmBase64);
            const pcmData = new Uint8Array(pcmString.length);
            for (let i = 0; i < pcmString.length; i++) {
                pcmData[i] = pcmString.charCodeAt(i);
            }

            const sampleRate = parseInt(pcmDataUri.match(/rate=(\d+)/)?.[1] || "24000");
            const channels = 1;

            const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
            const samples = new Int16Array(pcmData.buffer);

            const mp3DataChunks = [];
            const blockSize = 1152;

            for (let i = 0; i < samples.length; i += blockSize) {
                const sampleChunk = samples.subarray(i, i + blockSize);
                const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
                if (mp3buf.length > 0) {
                    mp3DataChunks.push(mp3buf);
                }
            }
            const mp3buf = mp3Encoder.flush();
            if (mp3buf.length > 0) {
                mp3DataChunks.push(mp3buf);
            }

            const mp3Blob = new Blob(mp3DataChunks, {type: 'audio/mpeg'});
            const reader = new FileReader();
            
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsDataURL(mp3Blob);
        } catch (error) {
            reject(error);
        }
    });
  }

  const handleGenerateSpeech = async (settings: SpeechSettings) => {
    setIsGenerating(true);
    setCurrentSpeech(null);
    try {
      const { improvedText } = await improveTextForSpeech({ text: settings.text });
      
      const { audioDataUri: rawPcmDataUri } = await textToSpeech({ 
        text: improvedText, 
        voice: settings.voice,
        styleInstructions: settings.styleInstructions,
      });

      const mp3DataUri = await encodePcmToMp3(rawPcmDataUri);
      
      const newSpeech: SpeechHistoryItem = {
        ...settings,
        id: Date.now(),
        improvedText,
        audioDataUri: mp3DataUri,
        createdAt: new Date(),
      };
      
      await addSpeechItem(newSpeech);
      setCurrentSpeech(newSpeech);
      toast({
        title: "Speech Generated!",
        description: "Your new audio is ready.",
      });
    } catch (error) {
      console.error("Failed to generate speech:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating your speech. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelectFromHistory = (item: SpeechHistoryItem) => {
    setCurrentSpeech(item);
    setSheetOpen(false);
  };

  const handleDeleteFromHistory = async (id: number) => {
    await removeSpeechItem(id);
    if (currentSpeech?.id === id) {
      setCurrentSpeech(null);
    }
     toast({
        title: "History item deleted.",
      });
  };

  const historySidebarComponent = (
    <HistorySidebar
      history={history}
      isLoading={isHistoryLoading}
      onSelect={handleSelectFromHistory}
      onDelete={handleDeleteFromHistory}
      currentSpeechId={currentSpeech?.id}
    />
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-0 md:gap-8">
          <div className="hidden md:block">
            {historySidebarComponent}
          </div>
          <main className="p-4 md:p-8 md:pt-6 flex-1">
            <div className="md:hidden mb-4">
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Menu className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[320px] sm:w-[350px]">
                  <SheetTitle className="sr-only">History</SheetTitle>
                  {historySidebarComponent}
                </SheetContent>
              </Sheet>
            </div>
             <VoiceSettingsForm
                isGenerating={isGenerating}
                onGenerate={handleGenerateSpeech}
                key={currentSpeech?.id ?? 'new'}
                initialData={currentSpeech}
             />
             <SpeechOutputCard speech={currentSpeech} isGenerating={isGenerating} />
          </main>
        </div>
      </div>
    </div>
  );
}
