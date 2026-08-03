'use client';

import React, {useState} from 'react';

import {Loader2, AlertCircle} from 'lucide-react';

import {siteConfig} from '@/config/site';

import {useDictionary} from '@/providers/dictionaryProvider';

import {Dialog, DialogContent, DialogTitle, DialogTrigger} from '@/components/ui/dialog';

interface DemoVideoModalProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export function DemoVideoModal({children, trigger}: DemoVideoModalProps) {
  const dict = useDictionary().videoModal;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use the config
  const {src, poster} = siteConfig.demoVideo;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing so next open shows loading again
      setIsLoading(true);
      setHasError(false);
    }
  };

  const triggerContent = trigger || children;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {React.isValidElement(triggerContent) ? (
        <DialogTrigger render={triggerContent as React.ReactElement<unknown>} />
      ) : (
        <DialogTrigger>{triggerContent}</DialogTrigger>
      )}

      <DialogContent className="bg-background max-w-[95vw] overflow-hidden border-none p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogTitle className="sr-only">{dict.title}</DialogTitle>

        {/* Aspect ratio container */}
        <div className="relative flex h-[90vh] w-full items-center justify-center bg-black">
          {isOpen && !hasError && (
            <video
              src={src}
              poster={poster}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
              aria-label={dict.title}
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}

          {isOpen && isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 bg-black/50 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">{dict.loading}</span>
            </div>
          )}

          {isOpen && hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 bg-black text-white/70">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-sm font-medium">{dict.error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
