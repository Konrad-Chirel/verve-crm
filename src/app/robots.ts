import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verve-crm-tau.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register', '/confidentialite', '/cgu'],
      disallow: ['/api/', '/auth/', '/dashboard', '/pipeline', '/clients', '/deals', '/rapports', '/parametres'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
