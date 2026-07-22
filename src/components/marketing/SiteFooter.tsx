import type {Dictionary} from '@/lib/i18n/types';

export function SiteFooter({dict}: {dict: Dictionary}) {
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
