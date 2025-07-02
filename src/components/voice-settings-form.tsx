
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef, useState, useEffect } from "react";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wand2, Bot, User, Waves, BookOpenText, Diamond, Sparkles, Star, Mic, Moon, Drama, Ghost, Play, Pause } from "lucide-react";
import type { SpeechHistoryItem, VoiceStyle } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  text: z.string().min(10, { message: "Please enter at least 10 characters." }).max(2000, { message: "Text cannot exceed 2000 characters." }),
  voice: z.enum(["algenib", "achernar", "gacrux", "rasalgethi", "schedar", "zubenelgenubi", "vindemiatrix", "umbriel", "puck", "charon"]),
  styleInstructions: z.string().max(500, { message: "Style instructions cannot exceed 500 characters." }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const voiceOptions: { value: VoiceStyle, label: string, icon: React.ElementType }[] = [
    { value: 'algenib', label: 'Algenib', icon: User },
    { value: 'achernar', label: 'Achernar', icon: Waves },
    { value: 'gacrux', label: 'Gacrux', icon: BookOpenText },
    { value: 'rasalgethi', label: 'Rasalgethi', icon: Diamond },
    { value: 'schedar', label: 'Schedar', icon: Sparkles },
    { value: 'zubenelgenubi', label: 'Zubenelgenubi', icon: Star },
    { value: 'vindemiatrix', label: 'Vindemiatrix', icon: Mic },
    { value: 'umbriel', label: 'Umbriel', icon: Moon },
    { value: 'puck', label: 'Puck', icon: Drama },
    { value: 'charon', label: 'Charon', icon: Ghost },
];

const stylePresets = [
    { name: 'Podcast Host', instruction: 'Read in a clear, engaging tone, like a podcast host speaking to their audience.' },
    { name: 'Audiobook', instruction: 'Read in a calm, steady, and narrative style, suitable for an audiobook.' },
    { name: 'YouTube Narration', instruction: 'Read in an energetic, upbeat, and slightly informal style for a YouTube video.' },
    { name: 'Friendly Chat', instruction: 'Read in a warm, friendly, and conversational tone.' },
];

interface VoiceSettingsFormProps {
  isGenerating: boolean;
  onGenerate: (values: FormValues) => void;
  initialData?: SpeechHistoryItem | null;
}

export function VoiceSettingsForm({ isGenerating, onGenerate, initialData }: VoiceSettingsFormProps) {
    const { toast } = useToast();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [voiceSamples, setVoiceSamples] = useState<Record<string, string>>({});
    const [loadingSample, setLoadingSample] = useState<string | null>(null);
    const [playingSample, setPlayingSample] = useState<string | null>(null);
    
    const oldVoiceMap: Record<string, VoiceStyle> = {
        alloy: 'algenib',
        echo: 'achernar',
        fable: 'gacrux',
        onyx: 'rasalgethi',
        nova: 'schedar',
        shimmer: 'zubenelgenubi',
    };

    const getInitialVoice = (): VoiceStyle => {
        const initialVoice = initialData?.voice;
        if (!initialVoice) return 'algenib';
        return oldVoiceMap[initialVoice] || (initialVoice as VoiceStyle);
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: initialData?.text ?? "नमस्ते! वोकलफोर्ज टेक्स्ट-टू-स्पीच इंजन के परीक्षण में आपका स्वागत है। मुझे उम्मीद है कि आप जेनरेट किए गए ऑडियो का आनंद लेंगे।",
            voice: getInitialVoice(),
            styleInstructions: initialData?.styleInstructions ?? 'एक गर्म और मैत्रीपूर्ण स्वर में जोर से पढ़ें:',
        },
    });

    const handlePlaySample = async (voice: VoiceStyle) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (playingSample === voice) {
          audio.pause();
          setPlayingSample(null);
          return;
        }

        audio.pause();
        audio.currentTime = 0;

        if (voiceSamples[voice]) {
            audio.src = voiceSamples[voice];
            audio.play().catch(e => {
                console.error("Error playing audio sample:", e);
                setPlayingSample(null);
            });
            setPlayingSample(voice);
            return;
        }

        setLoadingSample(voice);
        setPlayingSample(null);

        try {
            const { audioDataUri } = await textToSpeech({
                text: "Hello, this is a sample of my voice.",
                voice,
            });

            setVoiceSamples(prev => ({ ...prev, [voice]: audioDataUri }));
            audio.src = audioDataUri;
            audio.play().catch(e => {
                console.error("Error playing audio sample:", e);
                setPlayingSample(null);
            });
            setPlayingSample(voice);
        } catch (error) {
            console.error(`Failed to generate sample for ${voice}:`, error);
            toast({
                variant: "destructive",
                title: "Sample Failed",
                description: `Could not generate audio sample for ${voice}.`,
            });
        } finally {
            setLoadingSample(null);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => setPlayingSample(null);
        audio.addEventListener('ended', onEnded);
        return () => {
          audio.removeEventListener('ended', onEnded);
        };
    }, []);

    return (
        <>
            <audio ref={audioRef} className="sr-only" />
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Voice Configuration
                </CardTitle>
                <CardDescription>
                Enter your text, choose a voice, and adjust the settings to generate your speech.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Text to Convert</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Enter text to generate speech..."
                            className="min-h-[150px] resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="styleInstructions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Style Instructions</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {stylePresets.map(preset => (
                                <Button key={preset.name} type="button" variant="outline" size="sm" onClick={() => form.setValue('styleInstructions', preset.instruction, { shouldValidate: true })}>
                                    {preset.name}
                                </Button>
                            ))}
                        </div>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., Read in a warm and friendly tone."
                            className="min-h-[80px] resize-y"
                            {...field}
                            value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Base Voice</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                            >
                            <TooltipProvider>
                            {voiceOptions.map(opt => (
                                <Tooltip key={opt.value}>
                                    <TooltipTrigger asChild>
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value={opt.value} className="sr-only" id={`voice-${opt.value}`}/>
                                            </FormControl>
                                            <FormLabel
                                                htmlFor={`voice-${opt.value}`}
                                                className="relative flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all gap-2 h-full"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-primary z-10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePlaySample(opt.value);
                                                    }}
                                                    disabled={loadingSample !== null && loadingSample !== opt.value}
                                                    aria-label={`Play sample for ${opt.label}`}
                                                >
                                                    {loadingSample === opt.value ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : playingSample === opt.value ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <opt.icon className="h-6 w-6" />
                                                <span className="text-sm text-center">{opt.label}</span>
                                            </FormLabel>
                                        </FormItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{opt.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            </TooltipProvider>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                        </>
                    ) : (
                        <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Speech
                        </>
                    )}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </>
    );
}
