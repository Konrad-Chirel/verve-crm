import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const cspDirectives = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com https://images.unsplash.com https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
];

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  {
    key: 'Content-Security-Policy',
    value: cspDirectives.join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  devIndicators: false,
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/deals',
        destination: '/deals/deal-lumina',
        permanent: false,
      },
      {
        source: '/dossier',
        destination: '/deals/deal-lumina',
        permanent: false,
      },
      {
        source: '/dossiers',
        destination: '/pipeline',
        permanent: false,
      },
      {
        source: '/synthese',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/repertoire',
        destination: '/clients',
        permanent: false,
      },
      {
        source: '/tresorerie',
        destination: '/rapports',
        permanent: false,
      },
      {
        source: '/settings',
        destination: '/parametres',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
