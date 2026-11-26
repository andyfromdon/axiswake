import type { NextConfig } from 'next';
import { indexingEnabled, productionHost, productionOrigin } from './app/lib/launch';

const noindex = { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' };
const publicHostPattern = productionHost.replaceAll('.', '\\.');
const publicWwwHostPattern = `www\\.${publicHostPattern}`;

const config: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  outputFileTracingExcludes: { '*': ['./.data/**/*', './research/**/*', './qa/**/*'] },
  poweredByHeader: false,
  async redirects() {
    return [
      // Consolidate only the public www alias; keep demo and internal endpoints unchanged.
      ...(indexingEnabled ? [{
        source: '/:path((?!api(?:/|$)|stock-feed(?:/|$)|_next(?:/|$)).*)',
        has: [{ type: 'host' as const, value: publicWwwHostPattern }],
        destination: `${productionOrigin}/:path`,
        permanent: true,
      }] : []),
      { source: '/build-a-boat', destination: '/boats', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/dealer-locator', destination: '/contact', permanent: true },
    ];
  },
  async headers() {
    const standardHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];
    const indexHeaders = indexingEnabled
      ? [
          {
            source: '/:path*',
            missing: [{ type: 'host' as const, value: publicHostPattern }, { type: 'host' as const, value: publicWwwHostPattern }],
            headers: [noindex],
          },
          { source: '/api/:path*', headers: [noindex] },
          { source: '/stock-feed', headers: [noindex] },
        ]
      : [{ source: '/:path*', headers: [noindex] }];
    return [{ source: '/:path*', headers: standardHeaders }, ...indexHeaders];
  },
};

export default config;
