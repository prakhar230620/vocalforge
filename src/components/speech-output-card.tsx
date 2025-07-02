"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Loader2, FileAudio } from "lucide-react";
import type { SpeechHistoryItem } from "@/types";

interface SpeechOutputCardProps {
  speech: SpeechHistoryItem | null;
  isGenerating: boolean;
}

export function SpeechOutputCard({ speech, isGenerating }: SpeechOutputCardProps) {
  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-6 w-6 text-primary"/>
          Generated Speech
        </CardTitle>
        <CardDescription>
          Here is your generated audio. You can play it or download it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-lg bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your speech...</p>
          </div>
        ) : speech ? (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Improved Text:</h3>
              <p className="text-sm text-foreground/80">{speech.improvedText}</p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Button size="icon" className="bg-accent hover:bg-accent/90 rounded-full h-14 w-14" aria-label="Play audio" disabled>
                <Play className="h-6 w-6" />
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "0%" }}></div>
              </div>
              <span className="text-sm font-mono text-muted-foreground">0:00</span>
            </div>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 rounded-lg bg-muted/50 text-center">
            <p className="text-muted-foreground">Your generated speech will appear here.</p>
            <p className="text-sm text-muted-foreground/80">Enter some text and click "Generate" to start.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
