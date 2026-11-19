import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { indexingEnabled, productionHost, productionOrigin } from './lib/launch';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')?.split(':', 1)[0].toLowerCase();
  if (!indexingEnabled || host !== productionHost) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/stock-feed'] },
    sitemap: `${productionOrigin}/sitemap.xml`,
  };
}
