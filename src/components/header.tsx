import { MicVocal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <MicVocal className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">VocalForge</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <PWAInstallPrompt />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
