'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PWAUpdateNotification() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Add event listener for new service worker
      const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
        setWaitingWorker(registration.waiting);
        setShowReload(true);

        // Show toast notification
        toast({
          title: 'नया अपडेट उपलब्ध है',
          description: 'VocalForge का नया वर्शन उपलब्ध है। अपडेट करने के लिए रीलोड करें।',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={updateServiceWorker}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              अपडेट करें
            </Button>
          ),
          duration: 10000, // 10 seconds
        });
      };

      // Check if service worker is already registered
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  onServiceWorkerUpdate(registration);
                }
              });
            }
          });

          // Check if there's already a waiting worker
          if (registration.waiting && navigator.serviceWorker.controller) {
            onServiceWorkerUpdate(registration);
          }
        }
      });

      // Add event listener for controlling service worker changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [toast]);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Send message to service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return null; // This component doesn't render anything, it just handles the update logic
}