'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're online when the component mounts
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);

      // Add event listeners for online/offline events
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">कुछ गलत हो गया</h1>
      <p className="text-lg mb-6 max-w-md">
        {!isOnline
          ? 'आप ऑफलाइन हैं और इस पेज को लोड करने में समस्या हो रही है।'
          : 'एक त्रुटि हुई है। कृपया पुनः प्रयास करें।'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          पुनः प्रयास करें
        </Button>
        <Button variant="outline" asChild>
          <a href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            होम पेज पर जाएं
          </a>
        </Button>
      </div>
    </div>
  );
}