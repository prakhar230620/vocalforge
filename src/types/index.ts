export type VoiceStyle =
  | 'algenib'
  | 'achernar'
  | 'gacrux'
  | 'rasalgethi'
  | 'schedar'
  | 'zubenelgenubi'
  | 'vindemiatrix'
  | 'umbriel'
  | 'puck'
  | 'charon';

export type SpeechSettings = {
  text: string;
  voice: VoiceStyle;
  styleInstructions?: string;
};

export type SpeechHistoryItem = SpeechSettings & {
  id: number;
  improvedText: string;
  createdAt: Date;
  audioDataUri?: string;
};
