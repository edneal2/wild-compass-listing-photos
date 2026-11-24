(async function(){
if(window.__wcRetry) return 'already';
window.__wcRetry=true;
const S=ms=>new Promise(r=>{const k='r'+Math.random(); window.__twc[k]=r; window.__tw.postMessage([k,ms]);});
const base='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/';
const A=await (await fetch(base+'listings.json?'+Date.now())).json();
const H=await (await fetch(base+'listings_home.json?'+Date.now())).json();
let fr=document.getElementById('rtFrame');
if(!fr){fr=document.createElement('iframe'); fr.id='rtFrame'; fr.style.cssText='position:fixed;right:0;bottom:0;width:1100px;height:800px;z-index:99999;background:#fff;border:3px solid #a6c'; document.body.appendChild(fr);}
const status=s=>{localStorage.wcRtStatus=new Date().toLocaleTimeString()+' '+s;};
const loadCreate=async()=>{fr.src='/your/shops/me/listing-editor/create?wc='+Date.now(); for(let k=0;k<60;k++){await S(500); try{ if(fr.contentDocument && fr.contentDocument.querySelector('input[placeholder="Type to search"]')) {await S(1200); return true;} }catch(e){} } return false;};
async function one(d){
 const W=fr.contentWindow, D=fr.contentDocument; const log=[];
 const vIn=Object.getOwnPropertyDescriptor(W.HTMLInputElement.prototype,'value').set;
 const vTa=Object.getOwnPropertyDescriptor(W.HTMLTextAreaElement.prototype,'value').set;
 const ev=(el,t)=>el.dispatchEvent(new W.Event(t,{bubbles:true}));
 const setv=(el,v)=>{(el.tagName==='TEXTAREA'?vTa:vIn).call(el,v); ev(el,'input'); ev(el,'change'); ev(el,'blur');};
 const byLabel=t=>{const l=[...D.querySelectorAll('label')].find(l=>l.innerText.trim().replace(/\*$/,'').trim()===t); if(!l) return null; return D.getElementById(l.htmlFor)||l.parentElement.querySelector('input,textarea,select');};
 const dt=new W.DataTransfer();
 for(const p of d.imgs){const r=await fetch(base+p); if(!r.ok){log.push('img404 '+p); continue;} const b=await r.blob(); dt.items.add(new W.File([b],p.split('/').pop(),{type:'image/jpeg'}));}
 const nImg=dt.files.length; const fi=D.querySelector('input[type=file]'); fi.files=dt.files; ev(fi,'change');
 const cb=D.querySelector('input[placeholder="Type to search"]'); cb.focus(); vIn.call(cb,d.cat); ev(cb,'input');
 let opt=null; for(let k=0;k<12&&!opt;k++){await S(400); opt=[...D.querySelectorAll('[role=option]')].find(o=>o.innerText.split('\n')[0].trim()===d.cat)||null;}
 if(opt) opt.click(); else log.push('nocat');
 await S(1500);
 let tb=null; for(let k=0;k<20&&!tb;k++){await S(300); tb=D.getElementById('category-mixed-listing-type');}
 for(let k=0;k<3 && tb && tb.innerText.trim()!=='Digital';k++){tb.click(); await S(700); const o=[...D.querySelectorAll('li[role=option]')].find(e=>e.innerText.trim()==='Digital'); if(o) o.click(); await S(1200); tb=D.getElementById('category-mixed-listing-type');}
 if(tb&&tb.innerText.trim()!=='Digital') log.push('notype');
 const ti=byLabel('Title'); if(ti) setv(ti,d.title); else log.push('notitle');
 const de=byLabel('Description'); if(de) setv(de,d.desc); else log.push('nodesc');
 await S(500);
 const tg=D.querySelector('input[placeholder^="Shape, color"]');
 if(tg){ tg.focus(); vIn.call(tg,d.tags.join(',')); ev(tg,'input'); await S(250); const ab=[...D.querySelectorAll('button')].find(b=>b.innerText.trim()==='Add'); if(ab) ab.click(); await S(900);} else log.push('notags');
 const pr=byLabel('Price'); if(pr) setv(pr,d.price); else log.push('noprice');
 const qt=byLabel('Quantity'); if(qt) setv(qt,'999');
 const sk=byLabel('SKU'); if(sk) setv(sk,d.sku);
 const radio=t=>{const l=[...D.querySelectorAll('label')].find(l=>l.innerText.trim().startsWith(t)); if(l){(D.getElementById(l.htmlFor)||l).click(); return true;} log.push('noradio '+t); return false;};
 radio('I did'); await S(300); radio('A finished product'); await S(700); radio('With an AI generator');
 const se=byLabel('Shop section'); if(se){const o=[...se.options].find(o=>o.text.trim()===d.section); if(o){se.value=o.value; ev(se,'change');} else log.push('nosection');} else log.push('nosectionfield');
 await S(1000);
 const tagCount=D.querySelectorAll('button[aria-label^="Delete tag"]').length;
 if(tagCount<d.tags.length) log.push('tags '+tagCount); if(nImg<d.imgs.length) log.push('imgs '+nImg);
 if(log.length) return {ok:false,log};
 const sb=[...D.querySelectorAll('button')].find(b=>b.innerText.trim()==='Save as draft'||b.innerText.trim()==='Save draft'); sb.click();
 for(let k=0;k<40;k++){await S(500); try{ if(/tools\/listings/.test(fr.contentWindow.location.pathname)) return {ok:true}; }catch(e){} }
 const errs=[...fr.contentDocument.querySelectorAll('[role=alert]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,3);
 return {ok:false,log:['nosave'],errs};
}

const map=JSON.parse(localStorage.wcIdMap||'{}');
const keys=new Set([].concat(JSON.parse(localStorage.wcDone||'[]'),...['B','C','D','E'].map(n=>JSON.parse(localStorage['wcDone_'+n]||'[]')),JSON.parse(localStorage.wcDone2||'[]')));
const todo=A.concat(H).filter(d=>!keys.has(d.sku+'|'+d.slug) && !map[d.sku]);
localStorage.wcRtTodo=JSON.stringify(todo.map(d=>d.slug));
const ok=[],bad=[];
for(const d of todo){
 if(window.__wcRtStop) break;
 let r=null;
 for(let t=0;t<2;t++){
  status('retry '+d.slug+' try '+(t+1));
  if(!await loadCreate()){r={ok:false,log:['noform']}; continue;}
  try{ r=await one(d);}catch(e){ r={ok:false,log:['ERR '+e]}; }
  if(r.ok||(r.log&&r.log.includes('nosave'))) break;
  await S(2000);
 }
 if(r&&r.ok){ok.push(d.slug); const dn=JSON.parse(localStorage.wcDone||'[]'); dn.push(d.sku+'|'+d.slug); localStorage.wcDone=JSON.stringify(dn);} else bad.push(d.slug+' '+JSON.stringify(r));
 localStorage.wcRtResult=JSON.stringify({ok,bad});
 await S(2000);
}
window.__wcRetry=false; status('retry finished ok '+ok.length+' bad '+bad.length);
})();
'retry started'
