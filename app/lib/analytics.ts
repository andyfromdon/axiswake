const approvedPaths=new Set(["/","/boats","/contact","/stock","/build-a-boat","/privacy-policy","/community","/boats/a-series","/boats/t-series","/boat/a245","/boat/a225","/boat/a200","/boat/t250","/boat/t235","/boat/t220","/why-axis/innovations","/why-axis/dash","/why-axis/monsoon-engines","/community/owners","/community/athletes-ambassadors","/community/wake-responsibly","/blog","/newsroom"]);
export type LeadType='general'|'model'|'demo'|'service'|'stock';
type EventName='page_view'|'contact_phone_click'|'contact_email_click'|'view_stock'|'open_boat_builder'|'generate_lead';
declare global{interface Window{dataLayer?:Record<string,unknown>[]}}
// No tag is loaded here. Only fixed event names and approved route paths enter the queue.
export function track(event:EventName,path:string,leadType?:LeadType){
 if(typeof window==='undefined')return;
 const safePath=approvedPaths.has(path)?path:'/other';
 window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,page_path:safePath,...(leadType?{lead_type:leadType}:{})});
}
const seen=new Set<string>();
export function trackLead(reference:string,path:string,type:LeadType){
 if(!/^[a-f0-9-]{36}$/i.test(reference)||seen.has(reference))return;
 const key='axis-lead-'+reference;
 try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1')}catch{}
 seen.add(reference);track('generate_lead',path,type);
}
