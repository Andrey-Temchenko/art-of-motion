import type {NextConfig} from 'next';

const SUPABASE_PROJECT_REF = 'ofasewgyeurvywflhctd';
const SUPABASE_HOST = `${SUPABASE_PROJECT_REF}.supabase.co`;

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/marketing-media/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/marketing-media/**'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/marketing-media/**'
      }
    ]
  },
  async headers() {
    // Static CSP for public marketing pages.
    // Phase 2: protected routes (admin/dashboard) will use a stricter
    // nonce-based CSP generated dynamically in proxy.ts instead.
    const isDev = process.env.NODE_ENV === 'development';
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' blob: data: https://${SUPABASE_HOST} http://127.0.0.1:54321 http://localhost:54321 https://*.googleusercontent.com https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com`,
      `media-src 'self' blob: data: https://${SUPABASE_HOST} http://127.0.0.1:54321 http://localhost:54321`,
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests'
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {key: 'X-DNS-Prefetch-Control', value: 'on'},
          {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'},
          {key: 'Content-Security-Policy', value: csp}
        ]
      }
    ];
  }
};

export default nextConfig;
