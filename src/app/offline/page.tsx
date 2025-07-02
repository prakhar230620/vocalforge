'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're online when the component mounts
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
  }, []);

  const handleRefresh = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="h-24 w-24 mb-6 text-primary" />
      <h1 className="text-3xl font-bold mb-2">आप ऑफलाइन हैं</h1>
      <p className="text-lg mb-6 max-w-md">
        इंटरनेट कनेक्शन नहीं है। VocalForge के कुछ फीचर्स ऑफलाइन मोड में उपलब्ध नहीं हो सकते हैं।
      </p>
      {isOnline ? (
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          होम पेज पर वापस जाएं
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground">
          इंटरनेट कनेक्शन होने पर आप स्वचालित रूप से पुनः कनेक्ट हो जाएंगे
        </div>
      )}
    </div>
  );
}