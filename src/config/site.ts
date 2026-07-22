import {getSupabasePublicUrl} from '@/lib/supabase/storage';
import {SUPABASE_BUCKETS} from '@/lib/supabase/constants';

export interface SocialLinks {
  telegram: string;
  instagram: string;
}

export interface ClubLocation {
  instagram: string;
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

export const siteConfig: SiteConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.artofmotion.fit',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  links: {
    telegram: 'https://t.me/elena_meeva',
    instagram: 'https://www.instagram.com/elena_meeva'
  },
  clubs: {
    alfa: {
      instagram: 'https://www.instagram.com/alfa_elitfitness/'
    },
    top_gun: {
      instagram: 'https://www.instagram.com/top_gun_fitness_club'
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
