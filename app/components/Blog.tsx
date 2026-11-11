'use client';
import {useState} from 'react';
import Link from 'next/link';
import articles from '../data/articles.json';

export function ArticleCards({items=articles}:{items?:typeof articles}){
 return <div className="article-grid">{items.map(a=><article className="article-card" id={a.slug} key={a.slug}>
  <a className="article-image" href={a.source} target="_blank" rel="noreferrer" aria-label={'Read '+a.title+' on Axis International (opens in a new tab)'}><img src={a.image} alt="" loading="lazy"/></a>
  <div className="article-copy"><p className="eyebrow">{a.category}</p><h3><a href={a.source} target="_blank" rel="noreferrer">{a.title}</a></h3><p>{a.summary}</p><a className="text-link" href={a.source} target="_blank" rel="noreferrer">Read article ↗<span className="article-source">Axis International · New tab</span></a></div>
 </article>)}</div>;
}
export function BlogPreview({owners=false}:{owners?:boolean}){
 const slugs=owners?['first-time-axis-owner','how-store-and-winterize','how-clean-your-axis','wake-boat-etiquette']:['road-rowley','how-dial-your-axis','first-time-axis-owner','how-wakesurf-and-wake-foil'];
 const items=slugs.map(s=>articles.find(a=>a.slug.startsWith(s))!);
 return <section className="section blog-preview"><div className="blog-heading"><div><p className="eyebrow">Own it. Enjoy it.</p><h2>{owners?'Make the most of your Axis':'Stories, skills & days on the water'}</h2></div><Link className="text-link" href="/blog">Explore all {articles.length} owner articles ↗</Link></div><ArticleCards items={items}/></section>;
}
export function Blog(){
 const [category,setCategory]=useState('All articles'),[query,setQuery]=useState('');
 const categories=['All articles','Getting started','Boat setup','Riding','Boat care','Life on the water'];
 const results=articles.filter(a=>(category==='All articles'||a.category===category)&&`${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <><div className="page-intro blog-intro"><p className="eyebrow">Axis owner resources</p><h1>More from every day on the water</h1><p>Practical guides, riding tips and stories from the Axis community. Explore {articles.length} articles about using, caring for and enjoying your boat.</p></div>
 <section className="section blog-library" aria-label="Owner articles"><p className="blog-context">These articles open on the official international Axis website in a new tab. Equipment and advice may relate to overseas or older models. Use your boat’s manual and local boating rules, and ask our NZ team about your setup.</p>
 <div className="blog-tools"><label htmlFor="article-search">Find an article<input id="article-search" type="search" placeholder="Try docking, cleaning or wakesurfing…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="blog-filters" aria-label="Article topics">{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
 <p className="article-count" role="status">{results.length} {results.length===1?'article':'articles'}{category!=='All articles'?' · '+category:''}</p>
 {results.length?<ArticleCards items={results}/>:<div className="blog-empty"><h2>No articles found</h2><p>Try another topic or clear your search to see the whole library.</p><button className="button" onClick={()=>{setCategory('All articles');setQuery('')}}>Show all articles</button><Link className="text-link" href="/contact?interest=service#enquire">Ask the NZ team ↗</Link></div>}
 </section><section className="section blog-support"><div><p className="eyebrow">Support for your boat</p><h2>Need a hand with your Axis?</h2><p>Find owner manuals or talk with Action Water Sports about your boat, parts and service.</p></div><div><Link className="button" href="/community/owners">Owner resources</Link><Link className="text-link" href="/contact?interest=service#enquire">Contact the NZ team ↗</Link></div></section></>;
}
