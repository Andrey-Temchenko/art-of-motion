import React from 'react';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';

import {Button} from '@/components/ui/button';

interface BackButtonProps {
  href: string;
  ariaLabel?: string;
  className?: string;
}

export function BackButton({href, ariaLabel = 'Go back', className}: BackButtonProps) {
  return (
    <div className={`absolute top-6 left-6 z-20 md:top-10 md:left-10 ${className || ''}`}>
      <Button
        className="group bg-brand-balance ring-brand-stretch/30 hover:ring-brand-stretch/60 flex size-14 cursor-pointer items-center justify-center rounded-full text-white shadow-xl ring-4 transition-all duration-300 hover:scale-110 active:scale-95"
        render={<Link href={href} aria-label={ariaLabel} />}
        nativeButton={false}>
        <ArrowLeft className="size-6" strokeWidth={2.5} />
      </Button>
    </div>
  );
}
