import net from 'node:net';
import {spawn} from 'node:child_process';
import {mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const releaseRequire=createRequire(path.resolve('release/check-mail.cjs'));
assert(releaseRequire.resolve('nodemailer').startsWith(path.resolve('release/node_modules')+path.sep),'Mail probe dependency missing from release');
const folder=await mkdtemp(path.join(tmpdir(),'axis-enquiry-'));
let messages=[],reject=false;
const smtp=net.createServer(socket=>{socket.setEncoding('utf8');socket.write('220 localhost ESMTP\r\n');let buffer='',inData=false,message='';socket.on('data',data=>{buffer+=data;while(buffer.includes('\r\n')){const i=buffer.indexOf('\r\n');const line=buffer.slice(0,i);buffer=buffer.slice(i+2);if(inData){if(line==='.'){inData=false;messages.push(message);message='';socket.write('250 Queued\r\n');}else message+=line+'\n';}else if(/^EHLO/.test(line))socket.write('250 localhost\r\n');else if(/^DATA/.test(line)){if(reject)socket.write('451 Try later\r\n');else{inData=true;socket.write('354 Continue\r\n');}}else if(/^QUIT/.test(line)){socket.end('221 Bye\r\n');}else socket.write('250 OK\r\n');}});});
await new Promise(r=>smtp.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:3188';
const child=spawn(process.execPath,['app.js'],{cwd:'release',env:{...process.env,ENQUIRY_ENABLED:'true',ENQUIRY_TO:'axis-recipient@example.test',PORT:'3188',SITE_URL:'https://old-site.example.test',ENQUIRY_ALLOWED_ORIGINS:base+',https://www.axisboats.co.nz',SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtp.address().port),ENQUIRY_DATA_DIR:folder},stdio:'pipe'});
const lead={first:'Test',last:'Visitor',email:'visitor@example.test',phone:'+64 21 555 0101',location:'Auckland',model:'A245',message:'Local automated enquiry test only.',page:'/boat/a245',website:'',consent:true};
const send=(data,origin=base)=>fetch(base+'/api/enquiry',{method:'POST',headers:{'Origin':origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert(ready);
 assert.equal((await send(lead,'https://other.test')).status,403);
 assert.equal((await send(lead,'https://old-site.example.test')).status,403);
 for(const field of ['first','last','phone']){
  const response=await send({...lead,[field]:'  '});
  assert.equal(response.status,400,field+' is required');
  assert.match((await response.json()).message,/name, email, phone number/);
 }
 assert.equal((await send({...lead,email:'bad'})).status,400);
 assert.equal((await send({...lead,consent:false})).status,400);
 assert.equal((await send({...lead,website:'spam'})).status,400);
 assert.equal((await send({...lead,model:'US-only'})).status,400);
 assert.equal((await send({...lead,message:'x'.repeat(17000)})).status,413);
 assert.equal(messages.length,0);
 assert.equal((await send(lead)).status,200);assert.equal(messages.length,1);
 assert.match(messages[0],/To: sales@apws.co.nz/);assert.match(messages[0],/Reply-To: Test Visitor <visitor@example.test>/);
 assert.match(messages[0],/Phone: \+64 21 555 0101/);
 assert.equal((await send(lead)).status,200);assert.equal(messages.length,1,'Retry duplicated email');
 assert.equal((await send({...lead,category:'general'})).status,200);assert.equal(messages.length,1,'Explicit General duplicated legacy enquiry');
 reject=true;const failed={...lead,message:'Simulate failed email delivery.'};assert.equal((await send(failed)).status,503);
 const records=await Promise.all((await readdir(folder)).filter(n=>n.endsWith('.json')).map(async n=>JSON.parse(await readFile(path.join(folder,n),'utf8'))));assert(records.some(r=>r.status==='mail_failed'));
 reject=false;assert.equal((await send(failed,'https://www.axisboats.co.nz')).status,200);assert.equal(messages.length,2);
 // Route General and legacy submissions to sales; keep service and parts separate.
 for(const [index,category] of ['general','service','parts','sales','trade-in','finance','stock','model','demo'].entries()){
  const routed={...lead,email:`route-${index}@example.test`,category,message:'Routing mock: '+category};
  assert.equal((await send(routed)).status,200);
  const expected=['service','parts'].includes(category)?'service@apws.co.nz':'sales@apws.co.nz';
  assert(messages.at(-1).includes('To: '+expected),category+' recipient');
 }
 const beforeInvalid=messages.length;
 assert.equal((await send({...lead,category:'attacker@example.test'})).status,400);
 assert.equal((await send({...lead,category:{to:'attacker@example.test'}})).status,400);
 assert.equal(messages.length,beforeInvalid,'Invalid category sent mail');
 assert.equal((await fetch(base+'/.data/enquiries')).status,404);
 console.log('Enquiries verified: validation, origin, honeypot, size limits, SMTP acceptance, deduplication, private retention, failure recovery. No external email sent.');
}finally{child.kill();smtp.close();await rm(folder,{recursive:true,force:true});}
