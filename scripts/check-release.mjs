import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {get} from 'node:http';
import assert from 'node:assert/strict';
const models=JSON.parse(await readFile('app/data/models.json'));const editorial=JSON.parse(await readFile('app/data/editorial.json'));const audit=JSON.parse(await readFile('docs/source-audit.json'));
const port=3192,base=`http://127.0.0.1:${port}`;const child=spawn(process.execPath,['app.js'],{cwd:'release',env:{...process.env,PORT:String(port)},stdio:'pipe'});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
const production='https://axisboats.co.nz';
const getAs=(route,host='axisboats.co.nz')=>new Promise((resolve,reject)=>{
 get(base+route,{headers:{host}},async response=>{
  try{
   const chunks=[];
   for await(const chunk of response)chunks.push(chunk);
   resolve(new Response(Buffer.concat(chunks),{status:response.statusCode,headers:response.headers}));
  }catch(error){reject(error);}
 }).on('error',reject);
});
const indexing=process.env.NEXT_PUBLIC_AXIS_INDEXING_ENABLED==='true';
const structuredData=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1]);
try{let ready=false;for(let i=0;i<50;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200));}assert(ready,logs);
const health=await(await fetch(base+'/api/health')).json();assert.equal(health.application,'axis-nz');assert.equal(health.status,'ok');
const routes=['/','/boats','/boats/a-series','/boats/t-series','/community','/contact','/stock','/privacy-policy',...models.map(m=>'/boat/'+m.slug),...editorial.map(p=>'/'+p.slug)];const links=new Set(),titles=new Set(),descriptions=new Set();
for(const route of routes){
 const r=await getAs(route);
 assert.equal(r.status,200,route);
 assert.equal(r.headers.get('x-robots-tag')?.includes('noindex')||false,!indexing,route+' indexing header');
 const body=await r.text();
 assert.equal(/name="robots" content="noindex/.test(body),!indexing,route+' indexing metadata');
 assert.match(body,/<h1/,route);
 assert(!/Malibu|wakesetter|M242|LSV|MXZ|axisboats\.com|run-the-sun|make=573/.test(body),route+' contains copied brand content');
 const title=body.match(/<title>(.*?)<\/title>/)?.[1];
 assert(title&&!titles.has(title),route+' title');
 titles.add(title);
 const description=body.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert(description&&!descriptions.has(description),route+' description');
 descriptions.add(description);
 const canonical=body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 assert(canonical&&new URL(canonical).href===production+route,route+' canonical');
 for(const m of body.matchAll(/(?:href|src)="(\/[^"]*)"/g))links.add(m[1].replaceAll('&amp;','&').split(/[?#]/)[0]);
}
for(const url of links)assert.equal((await fetch(base+url)).status,200,url);
const articles=JSON.parse(await readFile('app/data/articles.json'));
const blog=await(await fetch(base+'/blog')).text();
assert.equal((blog.match(/class="article-card"/g)||[]).length,articles.length);
for(const article of articles){assert(blog.includes('id="'+article.slug+'"'));assert(blog.includes('href="'+article.source+'"'));assert(!/build.*boat|configurator/i.test(article.slug));}
for(const route of ['/','/community','/community/owners'])assert.match(await(await fetch(base+route)).text(),/class="article-card"/,route+' owner article pathway');
const oldBuilder=await fetch(base+'/build-a-boat',{redirect:'manual'});assert.equal(oldBuilder.status,308);assert.equal(oldBuilder.headers.get('location'),'/boats');
const sitemap=await(await getAs('/sitemap.xml')).text();
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,url])=>url).sort(),[...new Set(routes)].map(route=>production+route).sort());
const home=await(await getAs('/')).text();
assert.match(home,/<link rel="icon" href="\/favicon\.ico(?:\?[^"]*)?"[^>]*sizes="96x96"/);
assert.match(home,/<link rel="apple-touch-icon" href="\/apple-icon\.png[^"]*"[^>]*sizes="180x180"/);
const favicon=await getAs('/favicon.ico');
assert.equal(favicon.status,200);
assert.match(favicon.headers.get('content-type'),/^image\//);
const icon=Buffer.from(await favicon.arrayBuffer());
assert.equal(icon.readUInt32LE(0),0x10000);
assert.deepEqual(Array.from({length:icon.readUInt16LE(4)},(_,i)=>[icon[6+i*16],icon[7+i*16]]),[[16,16],[32,32],[48,48],[96,96]]);
assert.equal(structuredData(home)['@graph'].find(item=>item['@type']==='WebSite').name,'Axis Boats New Zealand');
const modelPage=await(await getAs('/boat/a245')).text();
assert.deepEqual(structuredData(modelPage).itemListElement.map(item=>item.item),['/boats','/boats/a-series','/boat/a245'].map(route=>production+route));
const contact=await(await fetch(base+'/contact')).text();
for(const name of ['first','last','phone']){
 const input=contact.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0];
 assert(input&&/\brequired(?:=""|\s|\/?>)/.test(input),name+' is required in the form');
}
const verificationPath='/google106291c5536fa9ac.html';
const verification=await getAs(verificationPath);
assert.equal(verification.status,200);
assert.equal(await verification.text(),await readFile('public'+verificationPath,'utf8'));
const privacy=await(await fetch(base+'/privacy-policy')).text();
const direct=process.env.NEXT_PUBLIC_ENQUIRY_ENABLED==='true';
assert.equal(contact.includes('Complete your details to prepare an email'),!direct);
assert.equal(privacy.includes('stored submissions older than 90 days'),direct);
assert.match(blog,/class="axis-direction"[^>]*aria-hidden="true"/);
const stock=await(await fetch(base+'/stock')).text();assert.match(stock,/<iframe[^>]+src="\/stock-feed"/);assert.match(stock,/Dealer boat stock/);assert.match(stock,/>Submit<\/button>/);assert(!stock.includes('href="/build-a-boat"'));
const feed=await fetch(base+'/stock-feed');assert.equal(feed.status,200);assert.match(feed.headers.get('x-robots-tag'),/noindex/);const feedBody=await feed.text();assert.match(feedBody,/config.ID="806"/);assert.match(feedBody,/sort=6&type=71/);assert.match(feedBody,/axis-stock-height/);assert(!feedBody.includes('make=573'));
assert.equal(models.length,6);for(const m of models){assert.deepEqual(m.specs,audit.models.find(x=>x.slug===m.slug).specs);assert(m.gallery.length>=8);assert(m.source.startsWith('https://www.axiswake.com/'));}
const publicRobots=await(await getAs('/robots.txt')).text();
if(indexing){
 assert.match(publicRobots,/^Allow: \/\s*$/m);
 assert.match(publicRobots,/^Sitemap: https:\/\/axisboats\.co\.nz\/sitemap\.xml$/m);
}else{
 assert.match(publicRobots,/^Disallow: \/\s*$/m);
 assert(!publicRobots.includes('Sitemap:'));
}
for(const host of ['axis-demo.don.digital','www.axisboats.co.nz','axisboats.co.nz.other.test']){
 assert.match((await getAs('/',host)).headers.get('x-robots-tag'),/noindex/,host);
 assert.match(await(await getAs('/robots.txt',host)).text(),/^Disallow: \/\s*$/m,host);
}
assert.match((await getAs('/api/health')).headers.get('x-robots-tag'),/noindex/);
assert.match((await getAs('/stock-feed')).headers.get('x-robots-tag'),/noindex/);
assert.equal((await fetch(base+'/missing-page')).status,404);
assert.equal((await fetch(base+'/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,503);
console.log(`Verified ${routes.length} pages, ${links.size} internal resources, six source-matched models, favicon, metadata, sitemap, host-specific indexing, disabled unconfigured mail and 404.`);
}finally{child.kill('SIGTERM')}
