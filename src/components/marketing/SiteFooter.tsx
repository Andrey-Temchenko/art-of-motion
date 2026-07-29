import {getDictionary} from '@/lib/i18n/getDictionary';
import type {Locale} from '@/lib/i18n/config';

export async function SiteFooter({locale}: {locale: Locale}) {
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-border/50 border-t py-5 md:py-6">
      <div className="mx-auto w-full max-w-7xl px-6 text-center md:px-10">
        <p className="text-muted-foreground text-sm font-medium">
          &copy; {currentYear} {dict.footer.trainerName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
