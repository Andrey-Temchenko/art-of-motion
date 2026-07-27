import {telegramConfig} from '@/config/telegram';

export async function notifyAdmin(text: string): Promise<void> {
  const token = telegramConfig.botToken;
  const chatId = telegramConfig.adminChatId;

  if (!token || !chatId) {
    console.error('Telegram admin notification skipped: env vars missing');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Telegram notification failed:', res.status, body);
    }
  } catch (err) {
    // We never throw error outside - notification failure shouldn't break the booking/cancellation flow
    console.error('Telegram notification error:', err);
  }
}
