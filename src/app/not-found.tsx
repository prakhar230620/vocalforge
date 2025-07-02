'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
      {!isOnline && <WifiOff className="h-12 w-12 mb-4 text-muted-foreground" />}
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">पेज नहीं मिला</h2>
      <p className="text-lg mb-6 max-w-md">
        {isOnline
          ? 'आपके द्वारा अनुरोधित पेज मौजूद नहीं है या हटा दिया गया है।'
          : 'आप ऑफलाइन हैं और यह पेज कैश में उपलब्ध नहीं है।'}
      </p>
      <Button asChild>
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          होम पेज पर जाएं
        </Link>
      </Button>
    </div>
  );
}