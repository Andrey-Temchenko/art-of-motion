import {ImageResponse} from 'next/og';

import {getDictionary} from '@/lib/i18n/getDictionary';
import type {Locale} from '@/lib/i18n/config';

export const runtime = 'edge';

export const alt = 'Art Of Motion';
export const size = {
  width: 1200,
  height: 600 // Twitter standard size
};
export const contentType = 'image/png';

export default async function Image({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(to bottom right, #09090b, #18181b)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        fontFamily: 'sans-serif'
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '24px'
        }}>
        <div
          style={{
            fontSize: '84px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
          {dict.meta.siteName}
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 400,
            color: '#a1a1aa',
            maxWidth: '800px',
            lineHeight: 1.4
          }}>
          {dict.meta.description}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
        <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'hsl(170deg 40% 30%)'}} />
        <div style={{fontSize: '24px', color: '#e4e4e7', fontWeight: 500}}>artofmotion.fit</div>
      </div>
    </div>,
    {
      ...size
    }
  );
}
