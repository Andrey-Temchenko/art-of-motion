import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, HeartPulse, Play} from 'lucide-react';

import type {Dictionary} from '@/lib/i18n/types';
import {Button} from '@/components/ui/button';

export function HeroSection({dict}: {dict: Dictionary}) {
  return (
    <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 overflow-hidden px-6 pt-32 pb-20 md:px-10 lg:flex-row lg:gap-16">
      {/* Background abstract element */}
      <div className="from-primary/10 via-brand-stretch/5 absolute top-0 right-0 -z-10 h-[800px] w-full rounded-bl-[100px] bg-gradient-to-br to-transparent opacity-70 md:w-[60%] md:rounded-bl-[200px]" />

      {/* TEXT: 40-45% width */}
      <div className="z-10 w-full shrink-0 space-y-8 lg:w-[45%]">
        <div className="bg-secondary border-border text-primary mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold">
          {dict.hero.badge}
        </div>

        <h1 className="text-foreground text-5xl leading-[1.1] font-extrabold tracking-tight md:text-6xl lg:text-[4rem]">
          {dict.hero.title} <br className="hidden lg:block" />
          <span className="from-primary to-brand-strength bg-gradient-to-r bg-clip-text text-transparent">
            {dict.hero.subtitle}
          </span>
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">{dict.hero.desc}</p>

        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
          <Button
            render={<Link href="#contact" />}
            nativeButton={false}
            size="lg"
            className="group cursor-pointer rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {dict.hero.cta1}
            <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            render={<Link href="#video" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="group hover:border-primary hover:text-primary cursor-pointer rounded-full border-2 px-8 py-6 text-lg font-bold transition-colors hover:bg-transparent"
          >
            <div className="bg-primary/10 group-hover:bg-primary/20 mr-1 flex size-8 items-center justify-center rounded-full transition-colors">
              <Play className="text-primary ml-0.5 size-4 fill-current" />
            </div>
            {dict.hero.cta2}
          </Button>
        </div>

        <div className="border-border flex items-center gap-8 border-t pt-8">
          <div>
            <p className="text-foreground text-3xl font-bold">{dict.hero.stats.clients}</p>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              {dict.hero.stats.clientsLabel}
            </p>
          </div>
          <div className="bg-border h-12 w-px" />
          <div>
            <p className="text-foreground text-3xl font-bold">{dict.hero.stats.exp}</p>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              {dict.hero.stats.expLabel}
            </p>
          </div>
        </div>
      </div>

      {/* IMAGE: Constrained vertical photo */}
      <div className="flex w-full flex-1 items-center justify-center lg:justify-end">
        <div className="relative w-full max-w-[420px] xl:max-w-[480px]">
          <div className="group border-border/50 relative aspect-[4/5] overflow-hidden rounded-[2rem] border shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200"
              alt="Trainer in action"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="from-foreground/60 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          </div>

          <div
            className="bg-card border-border absolute -bottom-6 -left-6 flex animate-bounce items-center gap-4 rounded-2xl border p-4 shadow-xl md:bottom-12 md:-left-4"
            style={{animationDuration: '3s'}}
          >
            <div className="bg-brand-balance/10 flex size-12 items-center justify-center rounded-full">
              <HeartPulse className="text-brand-balance size-6" />
            </div>
            <div>
              <p className="text-foreground text-sm font-bold">{dict.hero.floatingBadgeTitle}</p>
              <p className="text-muted-foreground text-xs">{dict.hero.floatingBadgeDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
