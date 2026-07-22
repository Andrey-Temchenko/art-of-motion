'use client';

import type {Dictionary} from '@/lib/i18n/types';
import {analytics} from '@/lib/analytics';
import {siteConfig} from '@/config/site';
import {MapPin, Send, ArrowUpRight} from 'lucide-react';

function InstagramIcon({className}: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ContactSection({dict}: {dict: Dictionary}) {
  return (
    <section id="contact" className="bg-secondary relative py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-[1fr_1.5fr] lg:gap-24">
          {/* Left: Huge Typography & Brand */}
          <div className="flex flex-col justify-between space-y-12">
            <div className="space-y-6">
              <h2 className="text-foreground text-5xl font-black tracking-tighter uppercase sm:text-6xl lg:text-7xl">
                {dict.contact.title}
              </h2>
              <p className="text-muted-foreground max-w-sm text-lg leading-relaxed md:text-xl">{dict.contact.desc}</p>
            </div>
          </div>

          {/* Right: Premium Interactive List */}
          <div className="flex flex-col">
            <h3 className="text-muted-foreground mb-4 text-xs font-bold tracking-[0.2em] uppercase">
              {dict.contact.locationLabel}
            </h3>

            <a
              href={siteConfig.clubs.alfa.instagram}
              target="_blank"
              rel="noreferrer"
              className="group border-border/50 hover:border-foreground flex items-center justify-between border-b py-6 transition-colors sm:py-8"
              onClick={() => analytics.trackClubAlfa(siteConfig.clubs.alfa.instagram)}
            >
              <div className="flex items-center gap-6">
                <MapPin className="text-muted-foreground group-hover:text-primary size-6 transition-colors sm:size-8" />
                <div>
                  <h4 className="group-hover:text-primary text-xl font-bold transition-colors sm:text-3xl">
                    {dict.contact.clubs.alfa.name}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wider uppercase">
                    {dict.contact.clubs.alfa.address}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-8 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>

            <a
              href={siteConfig.clubs.top_gun.instagram}
              target="_blank"
              rel="noreferrer"
              className="group border-border/50 hover:border-foreground flex items-center justify-between border-b py-6 transition-colors sm:py-8"
              onClick={() => analytics.trackClubTopGun(siteConfig.clubs.top_gun.instagram)}
            >
              <div className="flex items-center gap-6">
                <MapPin className="text-muted-foreground group-hover:text-primary size-6 transition-colors sm:size-8" />
                <div>
                  <h4 className="group-hover:text-primary text-xl font-bold transition-colors sm:text-3xl">
                    {dict.contact.clubs.topgun.name}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wider uppercase">
                    {dict.contact.clubs.topgun.address}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-8 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>

            <h3 className="text-muted-foreground mt-16 mb-4 text-xs font-bold tracking-[0.2em] uppercase">
              {dict.contact.connectLabel}
            </h3>

            <a
              href={siteConfig.links.telegram}
              target="_blank"
              rel="noreferrer"
              className="group border-border/50 hover:border-foreground flex items-center justify-between border-b py-6 transition-colors sm:py-8"
            >
              <div className="flex items-center gap-6">
                <Send className="text-muted-foreground size-6 transition-colors group-hover:text-[#0088cc] sm:size-8" />
                <h4 className="text-xl font-bold transition-colors group-hover:text-[#0088cc] sm:text-3xl">
                  {dict.contact.telegram}
                </h4>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-8 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="group border-border/50 hover:border-foreground flex items-center justify-between border-b py-6 transition-colors sm:py-8"
              onClick={() => analytics.trackInstagramPersonal(siteConfig.links.instagram)}
            >
              <div className="flex items-center gap-6">
                <InstagramIcon className="text-muted-foreground size-6 transition-colors group-hover:text-pink-500 sm:size-8" />
                <h4 className="text-xl font-bold transition-colors group-hover:text-pink-500 sm:text-3xl">
                  {dict.contact.instagram}
                </h4>
              </div>
              <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-8 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
