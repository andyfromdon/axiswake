import type {Metadata} from 'next';
import {Header,Footer} from './components/SiteShell';
import './globals.css';
import {Tracking} from './components/Tracking';
import {indexingEnabled,productionOrigin} from './lib/launch';
export const metadata:Metadata={title:'Axis Boats New Zealand',description:'Explore Axis wake and surf boats in New Zealand with Action Water Sports.',metadataBase:new URL(productionOrigin),robots:indexingEnabled?undefined:{index:false,follow:false}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en-NZ" data-scroll-behavior="smooth"><body><Tracking/><Header/><main id="main">{children}</main><Footer/></body></html>}
