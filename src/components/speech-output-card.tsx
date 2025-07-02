"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause, Loader2, FileAudio } from "lucide-react";
import type { SpeechHistoryItem } from "@/types";

interface SpeechOutputCardProps {
  speech: SpeechHistoryItem | null;
  isGenerating: boolean;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function SpeechOutputCard({ speech, isGenerating }: SpeechOutputCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if(audio) {
        audio.currentTime = 0;
      }
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    if (speech?.audioDataUri) {
      // Force re-render and reload of audio element when speech item changes
      const currentSrc = audio.src;
      if (currentSrc !== speech.audioDataUri) {
        audio.src = speech.audioDataUri;
        audio.load();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      }
    } else {
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [speech]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audio.src || duration === 0) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleDownload = () => {
    if (!speech?.audioDataUri) return;
    const link = document.createElement('a');
    link.href = speech.audioDataUri;
    link.download = `VocalForge_${speech.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
  }

  return (
    <Card className="mt-8 shadow-lg">
      <audio ref={audioRef} preload="metadata" />
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
        ) : speech && speech.audioDataUri ? (
          <div key={speech.id} className="space-y-4">
             {speech.styleInstructions && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Style Instructions:</h3>
                <p className="text-sm text-foreground/80 italic">"{speech.styleInstructions}"</p>
              </div>
            )}
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Resulting Text:</h3>
              <p className="text-sm text-foreground/80">{speech.improvedText}</p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Button size="icon" className="bg-accent hover:bg-accent/90 rounded-full h-14 w-14" aria-label={isPlaying ? "Pause audio" : "Play audio"} onClick={togglePlayPause} disabled={!speech.audioDataUri || duration === 0}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-accent" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-sm font-mono text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <Button className="w-full" onClick={handleDownload} disabled={!speech.audioDataUri}>
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 rounded-lg bg-muted/50 text-center">
             { speech && !speech.audioDataUri ? (
              <>
                <p className="text-muted-foreground">Audio for this item is not available.</p>
                <p className="text-sm text-muted-foreground/80">Old history items may not have audio.</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Your generated speech will appear here.</p>
                <p className="text-sm text-muted-foreground/80">Enter some text and click "Generate" to start.</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
