import Image from 'next/image';
import {Camera} from 'lucide-react';

import type {Dictionary} from '@/lib/i18n/types';
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from '@/components/ui/carousel';
import {siteConfig} from '@/config/site';

export function GallerySection({dict}: {dict: Dictionary}) {
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
        <div className="relative mt-8">
          <Carousel
            opts={{
              align: 'start',
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {siteConfig.images.gallery.map((image, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="group border-border/50 bg-card relative aspect-[4/5] overflow-hidden rounded-[2rem] border shadow-md transition-all hover:shadow-xl">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay for a premium feel */}
                    <div className="from-foreground/50 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom positioned navigation buttons */}
            <div className="hidden md:block">
              <CarouselPrevious className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground -left-6 size-12 cursor-pointer shadow-lg transition-all hover:scale-110 focus-visible:scale-110" />
              <CarouselNext className="border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground dark:bg-background dark:hover:bg-primary dark:hover:text-primary-foreground dark:focus-visible:bg-primary dark:focus-visible:text-primary-foreground -right-6 size-12 cursor-pointer shadow-lg transition-all hover:scale-110 focus-visible:scale-110" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
