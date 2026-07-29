'use client';

// global-error does not have access to route params, we fallback to default locale (uk)
import uk from '@/locales/generated/uk.json';

interface GlobalErrorProps {
  error: Error & {digest?: string};
  reset: () => void;
}

// global-error must include html and body tags
export default function GlobalError({error, reset}: GlobalErrorProps) {
  const dict = uk;

  return (
    <html lang="uk">
      <body style={{margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            boxSizing: 'border-box',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            backgroundColor: '#09090b',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#fafafa'
          }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'}}>
            <h2
              style={{
                fontSize: '1.875rem',
                lineHeight: '2.25rem',
                fontWeight: 'bold',
                letterSpacing: '-0.025em',
                margin: 0
              }}>
              {dict.ui.globalErrorTitle}
            </h2>
            <p style={{maxWidth: '28rem', color: '#a1a1aa', margin: 0, lineHeight: '1.5'}}>{dict.ui.globalErrorDesc}</p>
            {process.env.NODE_ENV === 'development' && (
              <pre
                style={{
                  marginTop: '1rem',
                  maxWidth: '42rem',
                  overflow: 'auto',
                  borderRadius: '0.25rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  color: '#f87171',
                  margin: 0
                }}>
                {error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: 'hsl(170deg 40% 30%)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              border: 'none',
              marginTop: '0.5rem'
            }}>
            {dict.ui.errorRetry}
          </button>
        </div>
      </body>
    </html>
  );
}
