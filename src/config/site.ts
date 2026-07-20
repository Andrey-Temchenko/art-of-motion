export interface SocialLinks {
  telegram: string;
  instagram: string;
}

export interface ClubLocation {
  instagram: string;
}

export interface SiteConfig {
  links: SocialLinks;
  clubs: {
    alfa: ClubLocation;
    topgun: ClubLocation;
  };
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
  }
};
