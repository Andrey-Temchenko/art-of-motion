'use client';

// global-error does not have access to route params, we fallback to default locale (uk)
import uk from '@/locales/generated/uk.json';

// global-error must include html and body tags
export default function GlobalError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const dict = uk;

  return (
    <html lang="uk">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#09090b] p-6 text-center font-sans text-[#fafafa]">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{dict.ui.globalErrorTitle}</h2>
            <p className="max-w-md text-[#a1a1aa]">{dict.ui.globalErrorDesc}</p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 max-w-2xl overflow-auto rounded bg-black/50 p-4 text-left text-sm text-red-400">
                {error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: 'hsl(170deg 40% 30%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none'
            }}>
            {dict.ui.errorRetry}
          </button>
        </div>
      </body>
    </html>
  );
}
