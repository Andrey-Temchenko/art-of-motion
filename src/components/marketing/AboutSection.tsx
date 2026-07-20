import Image from 'next/image';
import {Award, Activity, Heart} from 'lucide-react';

import type {Dictionary} from '@/lib/i18n/types';

export function AboutSection({dict}: {dict: Dictionary}) {
  const achievements = [
    {
      icon: Award,
      text: dict.about.achievements.item1,
      color: 'text-brand-strength',
      bg: 'bg-brand-strength/10'
    },
    {
      icon: Activity,
      text: dict.about.achievements.item2,
      color: 'text-brand-balance',
      bg: 'bg-brand-balance/10'
    },
    {
      icon: Heart,
      text: dict.about.achievements.item3,
      color: 'text-primary',
      bg: 'bg-primary/10'
    }
  ];

  return (
    <section id="about" className="bg-secondary relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 md:px-10 lg:flex-row lg:items-center lg:gap-16">
        {/* IMAGE: Left side (55%) */}
        <div className="flex w-full flex-1 items-center justify-center lg:justify-start">
          <div className="relative w-full max-w-[420px] xl:max-w-[480px]">
            <div className="group border-border/50 relative aspect-[4/5] overflow-hidden rounded-[2rem] border shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200"
                alt="Trainer portrait"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-foreground/40 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            </div>

            {/* Decorative element behind the image */}
            <div className="bg-primary/20 absolute -top-6 -left-6 -z-10 h-32 w-32 rounded-full blur-3xl md:-top-12 md:-left-12 md:h-48 md:w-48" />
            <div className="bg-brand-stretch/20 absolute -right-6 -bottom-6 -z-10 h-32 w-32 rounded-full blur-3xl md:-right-12 md:-bottom-12 md:h-48 md:w-48" />
          </div>
        </div>

        {/* TEXT & ACHIEVEMENTS: Right side (45%) */}
        <div className="z-10 w-full shrink-0 space-y-8 lg:w-[45%]">
          <div className="bg-secondary border-border text-primary inline-block rounded-full border px-4 py-1.5 text-sm font-semibold">
            {dict.about.tag}
          </div>

          <h2 className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">{dict.about.title}</h2>

          <div className="space-y-4">
            <p className="text-foreground text-lg leading-relaxed font-medium">{dict.about.bio}</p>
            <p className="text-muted-foreground leading-relaxed">{dict.about.p1}</p>
            <p className="text-muted-foreground leading-relaxed">{dict.about.p2}</p>
          </div>

          <ul className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            {achievements.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                  <item.icon className={`size-4 ${item.color}`} />
                </div>
                <span className="text-foreground font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
