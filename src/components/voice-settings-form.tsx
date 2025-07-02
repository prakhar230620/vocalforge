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
import { Loader2, Wand2, Bot, User, Waves, BookOpenText, Diamond, Sparkles, Star } from "lucide-react";
import type { SpeechHistoryItem, VoiceStyle } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  text: z.string().min(10, { message: "Please enter at least 10 characters." }).max(2000, { message: "Text cannot exceed 2000 characters." }),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]),
  pitch: z.number().min(0.5).max(2.0),
  speed: z.number().min(0.5).max(2.0),
});

type FormValues = z.infer<typeof formSchema>;

const voiceOptions: { value: VoiceStyle, label: string, icon: React.ElementType }[] = [
    { value: 'alloy', label: 'Alloy', icon: User },
    { value: 'echo', label: 'Echo', icon: Waves },
    { value: 'fable', label: 'Fable', icon: BookOpenText },
    { value: 'onyx', label: 'Onyx', icon: Diamond },
    { value: 'nova', label: 'Nova', icon: Sparkles },
    { value: 'shimmer', label: 'Shimmer', icon: Star },
];

interface VoiceSettingsFormProps {
  isGenerating: boolean;
  onGenerate: (values: FormValues) => void;
  initialData?: SpeechHistoryItem | null;
}

export function VoiceSettingsForm({ isGenerating, onGenerate, initialData }: VoiceSettingsFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: initialData?.text ?? "Hello, world! This is a test of the VocalForge text-to-speech engine. I hope you enjoy the generated audio.",
      voice: initialData?.voice ?? "alloy",
      pitch: initialData?.pitch ?? 1.0,
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
              name="voice"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Voice Style</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 sm:grid-cols-6 gap-4"
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
                                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all gap-2"
                                >
                                    <opt.icon className="h-6 w-6" />
                                    <span className="text-sm">{opt.label}</span>
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
                            min={0.5} max={2.0} step={0.1}
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
