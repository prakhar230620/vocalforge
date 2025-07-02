"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wand2, Bot, User, Waves, BookOpenText, Diamond, Sparkles, Star, Mic, Moon, Drama, Ghost } from "lucide-react";
import type { SpeechHistoryItem, VoiceStyle } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  text: z.string().min(10, { message: "Please enter at least 10 characters." }).max(2000, { message: "Text cannot exceed 2000 characters." }),
  voice: z.enum(["algenib", "achernar", "gacrux", "rasalgethi", "schedar", "zubenelgenubi", "vindemiatrix", "umbriel", "puck", "charon"]),
  styleInstructions: z.string().max(500, { message: "Style instructions cannot exceed 500 characters." }).optional(),
  pitch: z.number().min(-20.0).max(20.0),
  speed: z.number().min(0.25).max(4.0),
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
      pitch: initialData?.pitch ?? 0.0,
      speed: initialData?.speed ?? 1.0,
    },
  });

  return (
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
                                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all gap-2 h-full"
                                >
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="pitch"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Pitch ({value.toFixed(1)})</FormLabel>
                    <FormControl>
                        <Slider
                            defaultValue={[value]}
                            min={-10} max={10} step={0.5}
                            onValueChange={(vals) => onChange(vals[0])}
                            aria-label="Pitch"
                        />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="speed"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Speed ({value.toFixed(1)}x)</FormLabel>
                    <FormControl>
                        <Slider
                            defaultValue={[value]}
                            min={0.5} max={2.0} step={0.1}
                            onValueChange={(vals) => onChange(vals[0])}
                            aria-label="Speed"
                        />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
  );
}
