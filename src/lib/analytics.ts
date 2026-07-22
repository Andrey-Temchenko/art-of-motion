import {sendGAEvent} from '@next/third-parties/google';
import {siteConfig} from '@/config/site';

export const isAnalyticsEnabled = siteConfig.isProd && Boolean(siteConfig.gaMeasurementId);

export const GA_EVENTS = {
  START_TRAINING: 'start_training_click',
  INSTAGRAM_PERSONAL: 'instagram_personal_click',
  CLUB_ALFA: 'club_alfa_click',
  CLUB_TOP_GUN: 'club_top_gun_click'
} as const;

export type GAEventName = (typeof GA_EVENTS)[keyof typeof GA_EVENTS];

export interface GAEventParams {
  location?: 'navbar_desktop' | 'navbar_mobile' | 'hero_section' | 'contact_section';
  link_url?: string;
  [key: string]: unknown;
}

export const analytics = {
  trackEvent(action: GAEventName, params?: GAEventParams) {
    if (typeof window === 'undefined' || !isAnalyticsEnabled) return;
    sendGAEvent('event', action, params || {});
  },

  trackStartTraining(location: 'navbar_desktop' | 'navbar_mobile' | 'hero_section') {
    this.trackEvent(GA_EVENTS.START_TRAINING, {location});
  },

  trackInstagramPersonal(url?: string) {
    this.trackEvent(GA_EVENTS.INSTAGRAM_PERSONAL, {
      location: 'contact_section',
      ...(url ? {link_url: url} : {})
    });
  },

  trackClubAlfa(url?: string) {
    this.trackEvent(GA_EVENTS.CLUB_ALFA, {
      location: 'contact_section',
      ...(url ? {link_url: url} : {})
    });
  },

  trackClubTopGun(url?: string) {
    this.trackEvent(GA_EVENTS.CLUB_TOP_GUN, {
      location: 'contact_section',
      ...(url ? {link_url: url} : {})
    });
  }
};
