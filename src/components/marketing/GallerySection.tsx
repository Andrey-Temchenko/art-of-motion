'use client';

import React, {useState, useEffect, useCallback} from 'react';
import Image from 'next/image';
import {Camera, ChevronLeft, ChevronRight} from 'lucide-react';

import type {Dictionary} from '@/lib/i18n/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import {siteConfig} from '@/config/site';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';

export function GallerySection({dict}: {dict: Dictionary}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => onSelect(api);

    api.on('select', handleSelect);
    api.on('reInit', handleSelect);

    queueMicrotask(handleSelect);

    return () => {
      api.off('select', handleSelect);
      api.off('reInit', handleSelect);
    };
  }, [api, onSelect]);

  return (
    <section id="gallery" className="bg-secondary relative overflow-hidden py-12 md:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <Camera className="text-brand-strength size-5" />
              <p className="text-primary text-sm font-bold tracking-widest uppercase">{dict.gallery.tag}</p>
            </div>
            <h2 className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">{dict.gallery.title}</h2>
            <p className="text-muted-foreground max-w-xl text-lg">{dict.gallery.desc}</p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-4 md:mt-8">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {siteConfig.images.gallery.map((image, index) => (
                <CarouselItem key={index} className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3">
                  {/* bg-muted/50 acts as a skeleton placeholder while the image loads */}
                  <div className="group border-border/50 bg-muted/50 relative aspect-[4/5] overflow-hidden rounded-[2rem] border shadow-md transition-all hover:shadow-xl">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay for a premium feel */}
                    <div className="from-foreground/50 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom positioned desktop navigation buttons */}
            <div className="hidden md:block">
              <CarouselPrevious className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground -left-6 size-12 cursor-pointer shadow-lg transition-all hover:scale-110 focus-visible:scale-110" />
              <CarouselNext className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground -right-6 size-12 cursor-pointer shadow-lg transition-all hover:scale-110 focus-visible:scale-110" />
            </div>
          </Carousel>

          {/* Mobile Navigation Controls & Interactive Dots */}
          <div className="flex items-center justify-between pt-6 md:justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollPrev()}
              className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground size-10 cursor-pointer rounded-full shadow-md transition-all active:scale-95 md:hidden"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </Button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {Array.from({length: count}).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    'h-2.5 cursor-pointer rounded-full transition-all duration-300',
                    current === i ? 'bg-primary w-7' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5'
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground size-10 cursor-pointer rounded-full shadow-md transition-all active:scale-95 md:hidden"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
