'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {track} from '../lib/analytics';
export function Tracking(){const pathname=usePathname();useEffect(()=>{track('page_view',pathname)},[pathname]);useEffect(()=>{const click=(e:MouseEvent)=>{const link=(e.target as Element)?.closest?.('a');if(!link)return;const href=link.getAttribute('href')||'';if(href.startsWith('tel:'))track('contact_phone_click',location.pathname);else if(href.startsWith('mailto:'))track('contact_email_click',location.pathname);else{const url=new URL(link.href);if(url.origin===location.origin&&url.pathname==='/stock')track('view_stock',location.pathname);if(url.hostname==='build.axiswake.com')track('open_boat_builder',location.pathname)}};document.addEventListener('click',click);return()=>document.removeEventListener('click',click)},[]);return null}
