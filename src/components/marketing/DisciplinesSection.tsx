import type {Dictionary} from '@/lib/i18n/types';
import {User, Users, Dumbbell, Activity, Heart, Shield, Flame, Target} from 'lucide-react';

interface CardItem {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  glow: string;
}

export function DisciplinesSection({dict}: {dict: Dictionary}) {
  const personalCards: CardItem[] = [
    {
      ...dict.disciplines.personal.items.stretching,
      icon: Activity,
      color: 'text-brand-stretch',
      bg: 'bg-brand-stretch/10',
      glow: 'bg-brand-stretch'
    },
    {
      ...dict.disciplines.personal.items.hotIron,
      icon: Flame,
      color: 'text-brand-strength',
      bg: 'bg-brand-strength/10',
      glow: 'bg-brand-strength'
    },
    {
      ...dict.disciplines.personal.items.gym,
      icon: Dumbbell,
      color: 'text-brand-balance',
      bg: 'bg-brand-balance/10',
      glow: 'bg-brand-balance'
    }
  ];

  const groupCards: CardItem[] = [
    {
      ...dict.disciplines.group.items.strength,
      icon: Dumbbell,
      color: 'text-brand-strength',
      bg: 'bg-brand-strength/10',
      glow: 'bg-brand-strength'
    },
    {
      ...dict.disciplines.group.items.stretch,
      icon: Activity,
      color: 'text-brand-stretch',
      bg: 'bg-brand-stretch/10',
      glow: 'bg-brand-stretch'
    },
    {
      ...dict.disciplines.group.items.boards,
      icon: Target,
      color: 'text-brand-balance',
      bg: 'bg-brand-balance/10',
      glow: 'bg-brand-balance'
    },
    {
      ...dict.disciplines.group.items.trx,
      icon: Shield,
      color: 'text-primary',
      bg: 'bg-primary/10',
      glow: 'bg-primary'
    },
    {
      ...dict.disciplines.group.items.mfr,
      icon: Heart,
      color: 'text-brand-mfr',
      bg: 'bg-brand-mfr/10',
      glow: 'bg-brand-mfr'
    }
  ];

  const renderCard = (item: CardItem, i: number) => (
    <div
      key={i}
      className="group bg-card border-border relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8"
    >
      {/* Subtle background glow effect on hover */}
      <div
        className={`absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40 ${item.glow}`}
      />

      <div
        className={`mb-5 flex size-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110 ${item.bg}`}
      >
        <item.icon className={`size-6 ${item.color}`} />
      </div>

      <h3 className="group-hover:text-primary text-foreground mb-3 text-xl font-bold transition-colors md:text-2xl">
        {item.title}
      </h3>

      <p className="text-muted-foreground flex-grow text-base leading-relaxed">{item.description}</p>
    </div>
  );

  return (
    <section id="disciplines" className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-24">
      <div className="mb-12 space-y-4 text-center">
        <p className="text-primary text-sm font-bold tracking-widest uppercase">{dict.disciplines.tag}</p>
        <h2 className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">{dict.disciplines.title}</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{dict.disciplines.subheading}</p>
      </div>

      <div className="space-y-12">
        {/* Personal & Pair Training Section */}
        <div className="space-y-6">
          <div className="border-border flex items-center gap-4 border-b pb-4">
            <User className="text-brand-strength size-8" />
            <h3 className="text-foreground text-3xl font-bold tracking-tight">{dict.disciplines.personal.title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{personalCards.map(renderCard)}</div>
        </div>

        {/* Group Classes Section */}
        <div className="space-y-6">
          <div className="border-border flex items-center gap-4 border-b pb-4">
            <Users className="text-brand-balance size-8" />
            <h3 className="text-foreground text-3xl font-bold tracking-tight">{dict.disciplines.group.title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{groupCards.map(renderCard)}</div>
        </div>
      </div>
    </section>
  );
}
