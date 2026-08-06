import {SUPABASE_BUCKETS} from '@/lib/supabase/constants';
import {getSupabasePublicUrl} from '@/lib/supabase/storage';

export interface SocialLinks {
  telegram: string;
  instagram: string;
}

export interface ClubLocation {
  instagram: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours: Array<{
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
}

export interface DemoVideoConfig {
  src: string;
  poster: string;
}

export interface ImagesConfig {
  hero: string;
  about: string;
  gallery: Array<{src: string; alt: string}>;
}

export interface SiteConfig {
  name: string;
  baseUrl: string;
  gaMeasurementId: string;
  isProd: boolean;
  isDev: boolean;
  links: SocialLinks;
  clubs: {
    alfa: ClubLocation;
    top_gun: ClubLocation;
  };
  demoVideo: DemoVideoConfig;
  images: ImagesConfig;
}

import {env} from '@/env';

export const siteConfig: SiteConfig = {
  name: 'ArtOfMotion',
  baseUrl: env.NEXT_PUBLIC_SITE_URL || 'https://www.artofmotion.fit',
  gaMeasurementId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  isProd: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV === 'development',
  links: {
    telegram: 'https://t.me/elena_meeva',
    instagram: 'https://www.instagram.com/elena_meeva'
  },
  clubs: {
    alfa: {
      instagram: 'https://www.instagram.com/alfa_elitfitness/',
      geo: {
        latitude: 48.5113,
        longitude: 34.9897
      },
      openingHours: [
        {
          dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:00',
          closes: '21:00'
        },
        {
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '18:00'
        }
      ]
    },
    top_gun: {
      instagram: 'https://www.instagram.com/top_gun_fitness_club',
      openingHours: [
        {
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '21:00'
        }
      ]
    }
  },
  demoVideo: {
    src: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, 'videos/demo-video.mp4'),
    poster: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, 'videos/demo-poster.jpg')
  },
  images: {
    hero: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, 'gallery/hero.jpg'),
    about: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, 'gallery/about.jpg'),
    gallery: Array.from({length: 9}).map((_, i) => ({
      src: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, `gallery/workout-0${i + 1}.jpg`),
      alt: `Training session ${i + 1}`
    }))
  }
};
