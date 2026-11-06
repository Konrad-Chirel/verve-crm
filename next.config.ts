import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  trailingSlash: false,
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
