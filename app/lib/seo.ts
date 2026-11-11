import type {Metadata} from 'next';
import models from '../data/models.json';
import editorial from '../data/editorial.json';
import {series,media} from '../data/site';
import {productionOrigin} from './launch';
export const publicPaths=['/','/boats','/contact','/stock','/build-a-boat','/privacy-policy',...series.map(s=>'/boats/'+s.slug),...models.map(m=>'/boat/'+m.slug),...editorial.map(p=>'/'+p.slug)];
const pages:Record<string,[string,string]>={
 '':['Axis Boats New Zealand','Explore New Zealand’s Axis wake and surf boats. Discover the range, explore stock options and contact Action Water Sports.'],
 boats:['Explore the NZ Boat Range','Explore Axis wake and surf boats across the A-Series and T-Series.'],
 contact:['Contact Action Water Sports','Contact the New Zealand Axis team about models, available boats, demonstrations, parts and service support.'],
 stock:['Dealer Boat Stock','Browse Action Water Sports’ live multi-brand boat catalogue and contact the team about Axis availability.'],
 'build-a-boat':['Build Your Axis','Explore Axis’s official boat builder, then confirm New Zealand engine, equipment, pricing and availability with Action Water Sports.'],
 'privacy-policy':['Privacy Information','How the Axis Boats New Zealand website handles enquiries and contact information.']
};
export function pageMetadata(path:string):Metadata{
 const route=path==='dealer-locator'?'contact':path;
 const model=models.find(m=>'boat/'+m.slug===route);const page=editorial.find(p=>p.slug===route);const category=series.find(s=>'boats/'+s.slug===route);
 const title=model?model.name:page?.title||category?.name||pages[route]?.[0]||'Explore Axis';
 const description=(model?`Explore the Axis ${model.name}: international specifications, features and photos. Contact Action Water Sports about pricing and availability.`:page?.intro||category?.description||pages[route]?.[1]||pages[''][1]).slice(0,190);
 const image=model?.hero||page?.hero||category?.image||media('axis-my26-a245-family-lifestyle');
 const url=productionOrigin+(route?'/'+route:'/');const fullTitle=route?title+' | Axis Boats New Zealand':title;
 return {title:fullTitle,description,alternates:{canonical:url},openGraph:{type:'website',locale:'en_NZ',siteName:'Axis Boats New Zealand',title:fullTitle,description,url,images:[{url:image,alt:title}]},twitter:{card:'summary_large_image',title:fullTitle,description,images:[image]}};
}
