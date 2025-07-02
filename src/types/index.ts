export type VoiceStyle = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export type SpeechSettings = {
  text: string;
  voice: VoiceStyle;
  pitch: number;
  speed: number;
  styleInstructions?: string;
};

export type SpeechHistoryItem = SpeechSettings & {
  id: number;
  improvedText: string;
  createdAt: Date;
  audioDataUri?: string;
};
