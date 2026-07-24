'use client';

import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';

import {Button} from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const {theme, setTheme} = useTheme();

  // Prevent hydration mismatch by setting state asynchronously
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    // Render a placeholder button of the same size to prevent layout shift
    return (
      <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0" aria-hidden="true">
        <div className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-primary cursor-pointer transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme">
      <Sun className="size-5 scale-100 transition-transform duration-300 dark:scale-0" />
      <Moon className="absolute size-5 scale-0 transition-transform duration-300 dark:scale-100" />
    </Button>
  );
}
