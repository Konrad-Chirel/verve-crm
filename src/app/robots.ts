import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verve-crm.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register'],
      disallow: ['/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
