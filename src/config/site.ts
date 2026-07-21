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
  links: SocialLinks;
  clubs: {
    alfa: ClubLocation;
    topgun: ClubLocation;
  };
  demoVideo: DemoVideoConfig;
  images: ImagesConfig;
}

export const siteConfig: SiteConfig = {
  links: {
    telegram: 'https://t.me/placeholder_username',
    instagram: 'https://instagram.com/placeholder_username'
  },
  clubs: {
    alfa: {
      instagram: 'https://www.instagram.com/alfa_elitfitness/'
    },
    topgun: {
      instagram: 'https://www.instagram.com/top_gun_fitness_club'
    }
  },
  demoVideo: {
    src: getSupabasePublicUrl(SUPABASE_BUCKETS.MARKETING_MEDIA, 'videos/demo_video.mp4'),
    poster: '/images/demo-poster.jpg'
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
