import { MicVocal } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <MicVocal className="h-16 w-16 text-primary animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold animate-pulse">लोड हो रहा है...</h2>
      </div>
    </div>
  );
}