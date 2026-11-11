import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const models=JSON.parse(await readFile('app/data/models.json'));const editorial=JSON.parse(await readFile('app/data/editorial.json'));const audit=JSON.parse(await readFile('docs/source-audit.json'));
const port=3192,base=`http://127.0.0.1:${port}`;const child=spawn(process.execPath,['app.js'],{cwd:'release',env:{...process.env,PORT:String(port)},stdio:'pipe'});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
try{let ready=false;for(let i=0;i<50;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200));}assert(ready,logs);
const health=await(await fetch(base+'/api/health')).json();assert.equal(health.application,'axis-nz');assert.equal(health.status,'ok');
const routes=['/','/boats','/boats/a-series','/boats/t-series','/community','/contact','/stock','/privacy-policy',...models.map(m=>'/boat/'+m.slug),...editorial.map(p=>'/'+p.slug)];const links=new Set(),titles=new Set();
for(const route of routes){const r=await fetch(base+route);assert.equal(r.status,200,route);assert.match(r.headers.get('x-robots-tag'),/noindex/);const body=await r.text();assert.match(body,/<h1/,route);assert(!/Malibu|wakesetter|M242|LSV|MXZ|axisboats\.com|run-the-sun|make=573/.test(body),route+' contains copied brand content');const title=body.match(/<title>(.*?)<\/title>/)?.[1];assert(title&&!titles.has(title),route+' title');titles.add(title);for(const m of body.matchAll(/(?:href|src)="(\/[^"]*)"/g))links.add(m[1].replaceAll('&amp;','&').split(/[?#]/)[0]);}
for(const url of links)assert.equal((await fetch(base+url)).status,200,url);
const articles=JSON.parse(await readFile('app/data/articles.json'));
const blog=await(await fetch(base+'/blog')).text();
assert.equal((blog.match(/class="article-card"/g)||[]).length,articles.length);
for(const article of articles){assert(blog.includes('id="'+article.slug+'"'));assert(blog.includes('href="'+article.source+'"'));assert(!/build.*boat|configurator/i.test(article.slug));}
for(const route of ['/','/community','/community/owners'])assert.match(await(await fetch(base+route)).text(),/class="article-card"/,route+' owner article pathway');
const oldBuilder=await fetch(base+'/build-a-boat',{redirect:'manual'});assert.equal(oldBuilder.status,308);assert.equal(oldBuilder.headers.get('location'),'/boats');
const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert(sitemap.includes('/community</loc>'));assert(!sitemap.includes('/build-a-boat'));
const stock=await(await fetch(base+'/stock')).text();assert.match(stock,/<iframe[^>]+src="\/stock-feed"/);assert.match(stock,/Dealer boat stock/);assert.match(stock,/>Submit<\/button>/);assert(!stock.includes('href="/build-a-boat"'));
const feed=await fetch(base+'/stock-feed');assert.equal(feed.status,200);assert.match(feed.headers.get('x-robots-tag'),/noindex/);const feedBody=await feed.text();assert.match(feedBody,/config.ID="806"/);assert.match(feedBody,/sort=6&type=71/);assert.match(feedBody,/axis-stock-height/);assert(!feedBody.includes('make=573'));
assert.equal(models.length,6);for(const m of models){assert.deepEqual(m.specs,audit.models.find(x=>x.slug===m.slug).specs);assert(m.gallery.length>=8);assert(m.source.startsWith('https://www.axiswake.com/'));}
assert.match(await(await fetch(base+'/robots.txt')).text(),/Disallow: \/\s/);assert.equal((await fetch(base+'/missing-page')).status,404);
assert.equal((await fetch(base+'/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,503);
console.log(`Verified ${routes.length} pages, ${links.size} internal resources, six source-matched models, metadata, noindex, disabled unconfigured mail and 404.`);
}finally{child.kill('SIGTERM')}
