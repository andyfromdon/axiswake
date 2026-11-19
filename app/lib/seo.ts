import type {Metadata} from 'next';
import models from '../data/models.json';
import editorial from '../data/editorial.json';
import {series,media} from '../data/site';
import {productionOrigin} from './launch';
export const siteName = 'Axis Boats New Zealand';
export const publicPaths = [
  '/', '/boats', '/contact', '/stock', '/community', '/privacy-policy',
  ...series.map(item => '/boats/' + item.slug),
  ...models.map(model => '/boat/' + model.slug),
  ...editorial.map(page => '/' + page.slug),
];

const pages: Record<string, [string, string]> = {
  '': ['Axis Wake Boats New Zealand | Wake & Surf Boats', 'Explore Axis wake and surf boats for wakesurfing and wakeboarding. Compare models, browse dealer stock or request a demo with Action Water Sports in Christchurch.'],
  boats: ['Axis Wake & Surf Boat Range', 'Compare Axis A-Series and T-Series wake boats, including the A200, A225, A245, T220, T235 and T250. Ask the New Zealand dealer about availability.'],
  contact: ['Contact the NZ Axis Dealer', 'Talk to Action Water Sports in Christchurch about Axis wake boats, pricing, on-water demos, parts and servicing.'],
  stock: ['Boat Stock & Axis Enquiries', 'Browse the live Action Water Sports boat catalogue and contact the Christchurch team for current Axis availability and order options.'],
  community: ['Axis Owner Resources & Community', 'Find Axis owner resources, wakesurfing and wakeboarding guides, and stories from the Axis community.'],
  blog: ['Axis Wake Boat Owner Guides', 'Read Axis owner guides on boat setup, wakesurfing, wakeboarding and caring for your wake boat.'],
  'privacy-policy': ['Privacy Information', 'How the Axis Boats New Zealand website handles enquiries and contact information.'],
};

export function pageMetadata(path: string): Metadata {
  const route = path === 'dealer-locator' ? 'contact' : path;
  const model = models.find(item => 'boat/' + item.slug === route);
  const page = editorial.find(item => item.slug === route);
  const category = series.find(item => 'boats/' + item.slug === route);
  const title = model ? `Axis ${model.name} Wake Boat`
    : category ? `Axis ${category.name} Wake Boats`
      : pages[route]?.[0] || page?.title || 'Explore Axis';
  const summary = model ? `Explore the Axis ${model.name} wake boat. ${model.description}`
    : pages[route]?.[1] || category?.description || page?.intro || pages[''][1];
  const description = summary.length > 165
    ? summary.slice(0, 165).replace(/\s+\S*$/, '') + '…'
    : summary;
  const image = model?.hero || page?.hero || category?.image || media('axis-my26-a245-family-lifestyle');
  const url = `${productionOrigin}/${route}`;
  const fullTitle = route ? `${title} | ${siteName}` : title;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website', locale: 'en_NZ', siteName, title: fullTitle, description, url,
      images: [{ url: image, alt: route ? title : 'Axis wake boat on the water' }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  };
}

export function pageStructuredData(route: string) {
  if (route === '') {
    const dealerId = `${productionOrigin}/#dealer`;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${productionOrigin}/#website`,
          name: siteName,
          alternateName: 'Axis Wake Boats New Zealand',
          url: `${productionOrigin}/`,
          inLanguage: 'en-NZ',
          publisher: { '@id': dealerId },
        },
        {
          '@type': 'Store',
          '@id': dealerId,
          name: 'Action Water Sports',
          url: 'https://actionwatersports.co.nz/',
          telephone: '+64 3 943 5391',
          email: 'info@actionwatersports.co.nz',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Filly Place, Yaldhurst',
            addressLocality: 'Christchurch',
            postalCode: '8042',
            addressCountry: 'NZ',
          },
        },
      ],
    };
  }

  const model = models.find(item => 'boat/' + item.slug === route);
  const category = series.find(item => 'boats/' + item.slug === route || item.slug === model?.series);
  if (!category) return;

  const trail = [
    { name: 'Boats', path: '/boats' },
    { name: category.name, path: '/boats/' + category.slug },
  ];
  if (model) trail.push({ name: 'Axis ' + model.name, path: '/boat/' + model.slug });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: productionOrigin + path,
    })),
  };
}
