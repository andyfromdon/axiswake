import type {Metadata} from 'next';
import {Header,Footer} from './components/SiteShell';
import './globals.css';
import {Tracking} from './components/Tracking';
import {indexable,productionOrigin} from './lib/launch';
export const metadata:Metadata={title:'Axis Boats New Zealand',description:'Explore the Axis Boats New Zealand range. Wakesurf, wakeboard boats from Action Water Sports.',metadataBase:new URL(productionOrigin),robots:{index:indexable,follow:indexable}};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en-NZ" data-scroll-behavior="smooth"><body><Tracking/><Header/><main id="main">{children}</main><Footer/></body></html>}
