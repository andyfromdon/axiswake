// Connectivity check only: no email or visitor data is sent.
const nodemailer=require('nodemailer');
const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.sitehost.co.nz',port:Number(process.env.SMTP_PORT||25),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000});
transport.verify().then(()=>console.log('SiteHost mail connection verified (no message sent).')).catch(e=>{console.error('Mail connection unavailable:',e.code);process.exitCode=1;}).finally(()=>transport.close());
