import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The scene lab is a development harness and the API is for this
      // application's own client, not for indexing.
      disallow: ['/lab', '/lab/', '/api/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
