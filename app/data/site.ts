import assets from './home-assets.json';
import models from './models.json';
export const media=(term:string)=>assets.find(a=>a.alt===term)?.src||assets.find(a=>a.src.includes(term))?.src||models[0].hero;
export const logo=media('Axis Wake');
export const series=[
{slug:'a-series',name:'A-Series',tagline:'Open bow. Open possibilities.',image:media('MY27_A245-Side'),description:'Explore the A200, A225 and A245. Three open-bow wakeboats with space for the crew and a focus on the ride.'},
{slug:'t-series',name:'T-Series',tagline:'Classic lines. Full days on the water.',image:media('MY27_T250-Side'),description:'Explore the T220, T235 and T250. Traditional bow styling meets Axis wake and surf technology.'}];
export const whyLinks=[['Innovations & Performance','/why-axis/innovations'],['Axis Dash','/why-axis/dash'],['Monsoon Engines','/why-axis/monsoon-engines']];
export const communityLinks=[['Owner Resources','/community/owners'],['Athletes & Ambassadors','/community/athletes-ambassadors'],['Owner Articles & Lifestyle','/blog'],['Axis Newsroom','/newsroom'],['Wake Responsibly','/community/wake-responsibly']];
export const videoBase='https://www.axiswake.com/sites/site.axiswake.com/files/';
