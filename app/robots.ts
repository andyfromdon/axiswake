import type {MetadataRoute} from 'next';
import {indexable,productionOrigin} from './lib/launch';
export default function robots():MetadataRoute.Robots{return indexable?{rules:{userAgent:'*',allow:'/',disallow:['/api/','/stock-feed']},sitemap:productionOrigin+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}}}
