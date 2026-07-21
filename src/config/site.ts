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

export interface SiteConfig {
  links: SocialLinks;
  clubs: {
    alfa: ClubLocation;
    topgun: ClubLocation;
  };
  demoVideo: DemoVideoConfig;
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
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: '/images/demo-poster.jpg'
  }
};
