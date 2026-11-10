import type {MetadataRoute} from 'next';
import {publicPaths} from './lib/seo';
import {productionOrigin} from './lib/launch';
export default function sitemap():MetadataRoute.Sitemap{return [...new Set(publicPaths)].map(path=>({url:productionOrigin+path}));}
