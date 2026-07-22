'use client';

import React, {useState} from 'react';
import type {Dictionary} from '@/lib/i18n/types';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Quote, Star} from 'lucide-react';
import {cn} from '@/lib/utils';

export function TestimonialsSection({dict}: {dict: Dictionary}) {
  const allReviews = Object.values(dict.testimonials.reviews);

  // Split reviews into two halves for the two rows
  const half = Math.ceil(allReviews.length / 2);
  const row1 = allReviews.slice(0, half);
  const row2 = allReviews.slice(half);

  const [isPausedRow1, setIsPausedRow1] = useState(false);
  const [isPausedRow2, setIsPausedRow2] = useState(false);

  return (
    <section id="testimonials" className="bg-background relative overflow-hidden py-12 md:py-16">
      {/* Header (Constrained Width) */}
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="mb-12 space-y-4 text-center">
          <p className="text-primary text-sm font-bold tracking-widest uppercase">{dict.testimonials.tag}</p>
          <h2 className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">
            {dict.testimonials.title}
          </h2>
        </div>
      </div>

      {/* Marquee Rows (Full Bleed / Edge-to-Edge) */}
      <div className="relative flex flex-col gap-2 md:gap-4">
        {/* Fading Edges Overlay */}
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-20 w-1/12 bg-gradient-to-r to-transparent" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-20 w-1/12 bg-gradient-to-l to-transparent" />

        {/* Row 1 - Moves Left */}
        <div
          className="group flex cursor-pointer touch-pan-y py-4 select-none"
          onClick={() => setIsPausedRow1(prev => !prev)}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className={cn(
                'animate-marquee flex min-w-full shrink-0 gap-6 px-3 group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] active:[animation-play-state:paused]',
                isPausedRow1 && '[animation-play-state:paused]'
              )}
            >
              {row1.map((review, idx) => (
                <ReviewCard key={idx} review={review} />
              ))}
            </div>
          ))}
        </div>

        {/* Row 2 - Moves Right (Reverse) */}
        <div
          className="group flex cursor-pointer touch-pan-y py-4 select-none"
          onClick={() => setIsPausedRow2(prev => !prev)}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className={cn(
                'animate-marquee-reverse flex min-w-full shrink-0 gap-6 px-3 group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] active:[animation-play-state:paused]',
                isPausedRow2 && '[animation-play-state:paused]'
              )}
            >
              {row2.map((review, idx) => (
                <ReviewCard key={idx} review={review} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({review}: {review: {name: string; text: string}}) {
  return (
    <Card className="bg-card border-border/50 relative flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-[2rem] border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:w-[400px]">
      <Quote className="text-primary/5 absolute top-6 right-6 size-24 -rotate-12" />

      <CardHeader className="relative z-10 space-y-1 pb-4">
        <CardTitle className="text-lg font-bold">{review.name}</CardTitle>
        <div className="flex gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="fill-primary text-primary size-4" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-1">
        <p className="text-muted-foreground text-base leading-relaxed">&quot;{review.text}&quot;</p>
      </CardContent>
    </Card>
  );
}
