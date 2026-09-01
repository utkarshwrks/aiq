import type { MetadataRoute } from 'next';
import { NAV_ITEMS, SITE } from '@/lib/site';

/**
 * The sitemap is generated from the same route manifest the navigation
 * uses, so a new plate cannot be added to the site and forgotten here.
 * The scene lab is excluded because it is a development surface.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...NAV_ITEMS.map((item) => ({
      url: `${SITE.url}${item.href}`,
      lastModified: now,
      // The feed changes every three hours; the explanatory plates change
      // when the field does.
      changeFrequency:
        item.href === '/updates' ? ('hourly' as const) : ('monthly' as const),
      priority: item.href === '/updates' ? 0.9 : 0.8,
    })),
  ];
}
