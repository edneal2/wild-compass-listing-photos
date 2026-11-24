(async function(i){
const S=ms=>new Promise(r=>setTimeout(r,ms));
const L=JSON.parse(localStorage.wcL); const d=L[i];
const done=JSON.parse(localStorage.wcDone||'[]');
if(done.includes(d.sku+'|'+d.slug)) return 'skip '+i+' '+d.slug;
const log=[];
const vIn=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
const vTa=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
const setv=(el,v)=>{(el.tagName==='TEXTAREA'?vTa:vIn).call(el,v); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); el.dispatchEvent(new Event('blur',{bubbles:true}));};
const byLabel=t=>{const l=[...document.querySelectorAll('label')].find(l=>l.innerText.trim().replace(/\*$/,'').trim()===t); if(!l) return null; return document.getElementById(l.htmlFor)||l.parentElement.querySelector('input,textarea,select');};
const clickText=(sel,t)=>{const e=[...document.querySelectorAll(sel)].find(e=>e.innerText.trim()===t); if(e){e.click(); return true;} return false;};
for(let k=0;k<20 && !document.querySelector('input[placeholder="Type to search"]');k++) await S(500);
// photos
const base='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/';
const dt=new DataTransfer();
for(const p of d.imgs){const r=await fetch(base+p); if(!r.ok){log.push('img404 '+p); continue;} const b=await r.blob(); dt.items.add(new File([b],p.split('/').pop(),{type:'image/jpeg'}));}
const fi=document.querySelector('input[type=file]'); fi.files=dt.files; fi.dispatchEvent(new Event('change',{bubbles:true}));
// category
const cb=document.querySelector('input[placeholder="Type to search"]'); cb.focus(); vIn.call(cb,d.cat); cb.dispatchEvent(new Event('input',{bubbles:true}));
let opt=null; for(let k=0;k<10&&!opt;k++){await S(400); const os=[...document.querySelectorAll('[role=option]')]; opt=os.find(o=>o.innerText.split('\n')[0].trim()===d.cat)||null;}
if(opt) opt.click(); else log.push('nocat');
await S(1500);
const tb=document.getElementById('category-mixed-listing-type');
if(tb && tb.innerText.trim()!=='Digital'){tb.click(); await S(500); const o=[...document.querySelectorAll('li[role=option]')].find(e=>e.innerText.trim()==='Digital'); if(o) o.click(); else log.push('notype'); await S(1000);}
// text
const ti=byLabel('Title'); if(ti) setv(ti,d.title); else log.push('notitle');
const de=byLabel('Description'); if(de) setv(de,d.desc); else log.push('nodesc');
await S(500);
// tags
const tg=document.querySelector('input[placeholder^="Shape, color"]');
if(tg){ for(const t of d.tags){ setv(tg,t); tg.focus(); tg.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true})); await S(120);} } else log.push('notags');
// price etc
const pr=byLabel('Price'); if(pr) setv(pr,d.price); else log.push('noprice');
const qt=byLabel('Quantity'); if(qt) setv(qt,'999');
const sk=byLabel('SKU'); if(sk) setv(sk,d.sku);
// how made
const radio=t=>{const l=[...document.querySelectorAll('label')].find(l=>l.innerText.trim().startsWith(t)); if(l){(document.getElementById(l.htmlFor)||l).click(); return true;} log.push('noradio '+t); return false;};
radio('I did'); await S(300); radio('A finished product'); await S(600); radio('With an AI generator');
// section
const se=byLabel('Shop section'); if(se){const o=[...se.options].find(o=>o.text.trim()===d.section); if(o){se.value=o.value; se.dispatchEvent(new Event('change',{bubbles:true}));} else log.push('nosection');}
await S(800);
const tagCount=document.querySelectorAll('[aria-label^="Remove tag"],[data-tag]').length;
const imgs=dt.files.length;
// save
clickText('button','Save as draft')||clickText('button','Save draft');
await S(4000);
const errs=[...document.querySelectorAll('[role=alert], .wt-alert, .wt-text-red')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,3);
const ok=/tools\/listings/.test(location.href);
if(ok){done.push(d.sku+'|'+d.slug); localStorage.wcDone=JSON.stringify(done);}
return JSON.stringify({i,slug:d.slug,ok,imgs,tagCount,log,errs:ok?[]:errs});
})
