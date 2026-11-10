import {createHash,randomUUID} from 'node:crypto';
import {mkdir,writeFile,readFile,readdir,rename,unlink,stat} from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import models from '../../data/models.json';
export const runtime='nodejs';
const directory=process.env.ENQUIRY_DATA_DIR||'/container/application/.data/enquiries';
const destination=process.env.ENQUIRY_TO||'info@actionwatersports.co.nz';
const origin=process.env.SITE_URL||'https://axis-demo.don.digital';
const attempts:number[]=[];
const reply=(status:number,message:string,reference?:string)=>Response.json({message,reference},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(process.env.ENQUIRY_ENABLED!=='true')return reply(503,'Online delivery is not enabled. Please email info@actionwatersports.co.nz or call 03 943 5391.');
 if(request.headers.get('origin')!==origin)return reply(403,'Please send your enquiry using the form on this website.');
 if(!request.headers.get('content-type')?.includes('application/json'))return reply(415,'Please use the enquiry form.');
 const now=Date.now();while(attempts.length&&attempts[0]<now-60000)attempts.shift();
 if(attempts.length>=30)return reply(429,'Please wait a minute before trying again.');attempts.push(now);
 let data:Record<string,unknown>;
 try{let text='';const reader=request.body?.getReader();if(!reader)return reply(400,'Please complete the form.');let size=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();return reply(413,'Your message is too long.');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();data=JSON.parse(text);if(!data||typeof data!=='object'||Array.isArray(data))throw Error();}catch{return reply(400,'Please check your enquiry and try again.');}
 if(data.website)return reply(400,'Please check your enquiry and try again.');
 const limits:Record<string,number>={first:80,last:80,email:254,phone:40,location:120,model:80,message:4000,page:200};
 const fields:Record<string,string>={};
 for(const [key,max] of Object.entries(limits)){if(typeof data[key]!=='string'||(data[key] as string).length>max)return reply(400,'Please check your details and keep your message under 4,000 characters.');fields[key]=(data[key] as string).trim();if(key!=='message'&&/[\r\n\x00]/.test(fields[key]))return reply(400,'Please check your contact details.');}
 if(!fields.first||!fields.last||fields.message.length<5||!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fields.email)||data.consent!==true||!['Help me choose','Arrange a demo',...models.map(m=>m.name)].includes(fields.model)||!fields.page.startsWith('/'))return reply(400,'Please complete your name, email, boat interest, message and contact consent.');
 const fingerprint=createHash('sha256').update(JSON.stringify(fields)).digest('hex');
 const file=path.join(directory,fingerprint+'.json');
 let locked=false;
 try{
  await mkdir(directory,{recursive:true,mode:0o700});
  try{const lock=await stat(file+'.lock');if(now-lock.mtimeMs>60000)await unlink(file+'.lock');}catch{}
  try{await writeFile(file+'.lock','',{flag:'wx',mode:0o600});locked=true;}catch{return reply(409,'This enquiry is being processed. Please wait a moment before trying again.');}
  let record;
  try{record=JSON.parse(await readFile(file,'utf8'));}catch{}
  if(record?.status==='sent')return reply(200,'Thanks — your enquiry has been sent to Action Water Sports.',record.reference);
  const entries=await readdir(directory);let recent=0,sameEmail=0;
  for(const name of entries.filter(n=>n.endsWith('.json'))){const saved=JSON.parse(await readFile(path.join(directory,name),'utf8'));if(now-Date.parse(saved.createdAt)>90*86400000){await unlink(path.join(directory,name));continue;}if(now-Date.parse(saved.createdAt)<3600000){recent++;if(saved.email.toLowerCase()===fields.email.toLowerCase())sameEmail++;}}
  if(!record&&(recent>=60||sameEmail>=5))return reply(429,'We have received several enquiries recently. Please call 03 943 5391 or try again later.');
  const reference=record?.reference||randomUUID();
  record={...fields,reference,createdAt:record?.createdAt||new Date().toISOString(),status:'pending',consent:true,mailAcceptedAt:''};
  const save=async()=>{await writeFile(file+'.tmp',JSON.stringify(record),{mode:0o600});await rename(file+'.tmp',file);};
  await save();
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.sitehost.co.nz',port:Number(process.env.SMTP_PORT||25),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000});
  try{
   const result=await transport.sendMail({from:{name:'Axis NZ website',address:process.env.ENQUIRY_FROM||'hello@don.digital'},to:destination,replyTo:{name:fields.first+' '+fields.last,address:fields.email},subject:'Axis NZ enquiry — '+fields.model,text:`New Axis website enquiry\nReference: ${reference}\n\nName: ${fields.first} ${fields.last}\nEmail: ${fields.email}\nPhone: ${fields.phone||'Not provided'}\nTown / city: ${fields.location||'Not provided'}\nInterested in: ${fields.model}\nPage: ${fields.page}\n\n${fields.message}\n\nThe visitor agreed to be contacted about this enquiry.`,disableFileAccess:true,disableUrlAccess:true});
   if(!result.accepted.length)throw Error('not accepted');
   record.status='sent';record.mailAcceptedAt=new Date().toISOString();await save();
   return reply(200,'Thanks — your enquiry has been sent to Action Water Sports.',reference);
  }catch{record.status='mail_failed';await save();console.error('Enquiry email failed; private record retained:',reference);return reply(503,'Your details have been saved, but the email could not be sent. Please call 03 943 5391 or try again shortly.',reference);}finally{transport.close();}
 }catch{console.error('Enquiry storage unavailable');return reply(503,'We could not process your enquiry. Please call 03 943 5391 or email info@actionwatersports.co.nz.');}
 finally{if(locked)await unlink(file+'.lock').catch(()=>{});}
}
