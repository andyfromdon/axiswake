import {Blog} from '../components/Blog';
import {pageMetadata} from '../lib/seo';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {Home,Boats,Model,Editorial,Community,Contact,Stock,Privacy} from '../components/Pages';
import models from '../data/models.json';
import editorial from '../data/editorial.json';
import {series} from '../data/site';
type Props={params:Promise<{path?:string[]}>};
export function generateStaticParams(){return [{path:[]},...['boats','community','contact','dealer-locator','stock','privacy-policy'].map(p=>({path:[p]})),...series.map(s=>({path:['boats',s.slug]})),...models.map(m=>({path:['boat',m.slug]})),...editorial.filter(p=>p.slug!=='community').map(p=>({path:p.slug.split('/')}))]}
export async function generateMetadata({params}:Props):Promise<Metadata>{return pageMetadata((await params).path?.join('/')||'')}
export default async function Page({params}:Props){const path=(await params).path?.join('/')||'';if(!path)return <Home/>;if(path==='boats')return <Boats/>;if(path.startsWith('boats/')&&series.some(s=>'boats/'+s.slug===path))return <Boats slug={path.split('/')[1]}/>;const model=models.find(m=>'boat/'+m.slug===path);if(model)return <Model model={model}/>;if(path==='community')return <Community/>;if(path==='contact'||path==='dealer-locator')return <Contact/>;if(path==='blog')return <Blog/>;if(path==='stock')return <Stock/>;if(path==='privacy-policy')return <Privacy/>;const page=editorial.find(p=>p.slug===path);if(page)return <Editorial data={page}/>;notFound()}
