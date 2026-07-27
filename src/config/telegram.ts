import {env} from '@/env';

export interface TelegramConfig {
  botToken: string | undefined;
  adminChatId: string | undefined;
}

export const telegramConfig: TelegramConfig = {
  botToken: env.TELEGRAM_BOT_TOKEN,
  adminChatId: env.TELEGRAM_ADMIN_CHAT_ID
};
