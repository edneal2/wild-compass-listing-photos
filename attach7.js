(async function(){
if(window.__wcAtt7) return 'already';
window.__wcAtt7=true;
if(!window.__tw){const blob=new Blob(["onmessage=e=>{setTimeout(()=>postMessage(e.data[0]),e.data[1]);}"],{type:'text/javascript'}); window.__tw=new Worker(URL.createObjectURL(blob)); window.__twc={}; window.__twn=0; window.__tw.onmessage=e=>{const f=window.__twc[e.data]; delete window.__twc[e.data]; if(f) f();};}
const S=ms=>new Promise(r=>{const id=++window.__twn; window.__twc[id]=r; window.__tw.postMessage([id,ms]);});
const RAW='https://raw.githubusercontent.com/edneal2/wild-compass-download-files/main/f/';
let fr=document.getElementById('attfr7');
if(!fr){fr=document.createElement('iframe');fr.id='attfr7';fr.style.cssText='position:fixed;left:0;bottom:0;width:1300px;height:700px;z-index:99999;background:#fff;border:3px solid #4a7';document.body.appendChild(fr);}
const status=s=>{localStorage.wcAttStatus=new Date().toLocaleTimeString()+' '+s;};
const flog=s=>{const fl=JSON.parse(localStorage.wcAttFail||'[]');fl.push(new Date().toLocaleTimeString()+' '+s);localStorage.wcAttFail=JSON.stringify(fl.slice(-100));};
const man=JSON.parse(localStorage.wcMan);
let lastMap=Date.now();
async function refreshMap(){
  const map=JSON.parse(localStorage.wcIdMap||'{}');
  for(let p=1;p<=40;p++){
    status('mapping page '+p);
    fr.src='/your/shops/me/tools/listings?state=draft&sort=update_date&page='+p;
    let got=[];
    for(let k=0;k<30;k++){await S(500);try{got=[...fr.contentDocument.querySelectorAll('a[href*="listing-editor/edit/"]')];}catch(e){} if(got.length){await S(1200);got=[...fr.contentDocument.querySelectorAll('a[href*="listing-editor/edit/"]')];break;}}
    if(!got.length) break;
    got.forEach(a=>{const m=a.href.match(/edit\/(\d+)/);const lines=a.innerText.replace(/^Digital\n/,'').trim().split('\n');if(m&&lines.length>1) map[lines[1].trim()]=m[1];});
    if(got.length<70) break;
  }
  localStorage.wcIdMap=JSON.stringify(map); lastMap=Date.now(); return map;
}
let BOX=null;
const fileSec=D=>{const fi=[...D.querySelectorAll('input[type=file]')].find(i=>!i.name&&!i.accept); if(BOX&&BOX.isConnected&&BOX.ownerDocument===D) return {fi,box:BOX}; if(fi){let e=fi; for(let k=0;k<3;k++) e=e.parentElement; BOX=e; return {fi,box:e};} const b=[...D.querySelectorAll('div,section,fieldset')].filter(e=>/^Digital files/.test((e.textContent||'').trim())&&/Add up to 5 files/.test(e.textContent)).sort((a,b)=>a.textContent.length-b.textContent.length)[0]; if(!b) return null; BOX=b; return {fi:null,box:b};};
async function one(x,id){
  const blobs=[];
  for(const b of x.files){const r=await fetch(RAW+encodeURIComponent(b)); if(!r.ok) return {ok:false,wait:true,why:'notpushed '+b}; blobs.push([b,await r.blob()]);}
  fr.src='/your/shops/me/listing-editor/edit/'+id+'?a='+Date.now();
  BOX=null; let fs=null; for(let k=0;k<150&&!fs;k++){await S(500); try{ if(fr.contentWindow.location.pathname.includes(id) && fr.contentDocument.readyState==='complete') fs=fileSec(fr.contentDocument);}catch(e){}}
  if(!fs) return {ok:false,why:'noform'};
  await S(1500); fs=fileSec(fr.contentDocument);
  const W=fr.contentWindow, D=fr.contentDocument;
  const sku=[...D.querySelectorAll('label')].find(l=>l.innerText.trim().startsWith('SKU')); const skuv=sku&&D.getElementById(sku.htmlFor)?D.getElementById(sku.htmlFor).value:'';
  if(skuv && skuv!==x.sku) return {ok:false,why:'skumismatch '+skuv};
  if(!fs) return {ok:false,why:'nobox'};
  const have=fs.box.innerText;
  const need=blobs.filter(([b])=>!have.includes(b));
  if(!need.length) return {ok:true,already:true};
  if(!fs.fi) return {ok:false,why:'noinput'};
  const dt=new W.DataTransfer();
  for(const [b,bl] of need) dt.items.add(new W.File([bl],b,{type:b.endsWith('.pdf')?'application/pdf':(b.endsWith('.zip')?'application/zip':(bl.type||'application/octet-stream'))}));
  fs.fi.files=dt.files; fs.fi.dispatchEvent(new W.Event('change',{bubbles:true}));
  const mb=need.reduce((a,[b,bl])=>a+bl.size,0)/1048576;
  // wait until all names show and no uploading indicator
  const busy=()=>{const f=fileSec(D); const t=f?f.box.innerText:''; const al=[...D.querySelectorAll('[role=alert],[aria-busy=true]')].some(e=>e.offsetParent&&(/loading|upload/i.test(e.innerText||'')||e.getAttribute('aria-busy')==='true')); return !f || !need.every(([b])=>t.includes(b)) || /loading|uploading|processing/i.test(t) || al;};
  let shown=false;
  for(let k=0;k<480;k++){await S(500); if(!busy()){await S(1500); if(!busy()){shown=true;break;}}}
  if(!shown) return {ok:false,why:'uploadtimeout'};
  await S(1500+mb*200);
  const err=[...D.querySelectorAll('[role=alert]')].map(e=>e.innerText.trim()).filter(Boolean);
  const sb=[...D.querySelectorAll('button')].find(b=>/^Save( as)? draft$/.test(b.innerText.trim()));
  if(!sb) return {ok:false,why:'nosavebtn'};
  sb.click();
  const lim=Math.min(1200,120+Math.ceil(mb*60)); for(let k=0;k<lim;k++){await S(500); try{ if(/tools\/listings/.test(fr.contentWindow.location.pathname)) return {ok:true}; }catch(e){} if(k%60===59){const b2=[...D.querySelectorAll('button')].find(b=>/^Save( as)? draft$/.test(b.innerText.trim())); if(b2&&!b2.disabled&&b2.getAttribute('aria-disabled')!=='true'&&!busy()) b2.click();} if(k%20===0) status('saving '+x.sku+' '+Math.round(k/2)+'s of '+Math.round(lim/2)+'s ('+mb.toFixed(1)+'MB)'); }
  return {ok:false,why:'nosave',err:err.slice(0,2)};
}
for(let pass=1;pass<=40;pass++){
  if(window.__wcAtt7Stop) break;
  let map=JSON.parse(localStorage.wcIdMap||'{}');
  if(Date.now()-lastMap>8*60*1000) map=await refreshMap();
  const done=new Set(JSON.parse(localStorage.wcAttDone||'[]'));
  const fails=JSON.parse(localStorage.wcAttFails||'{}');
  let todo=man.filter(x=>x.files.length && !x.hosted && !done.has(x.sku) && (fails[x.sku]||0)<3);
  if(!todo.length){status('ALL ATTACHED'); break;}
  let progress=0;
  for(const x of todo){
    if(window.__wcAtt7Stop) break;
    if(Date.now()-lastMap>8*60*1000) map=await refreshMap();
    const id=map[x.sku]; if(!id) continue;
    status('pass '+pass+' attaching '+x.sku);
    let r; try{ r=await one(x,id);}catch(e){r={ok:false,why:'ERR '+e};}
    if(r.ok){ const d=JSON.parse(localStorage.wcAttDone||'[]'); if(!d.includes(x.sku)) d.push(x.sku); localStorage.wcAttDone=JSON.stringify(d); progress++; }
    else if(!r.wait){ fails[x.sku]=(fails[x.sku]||0)+1; localStorage.wcAttFails=JSON.stringify(fails); flog(x.sku+' '+JSON.stringify(r)); }
    await S(1500);
  }
  status('pass '+pass+' done, +'+progress+'; total '+JSON.parse(localStorage.wcAttDone||'[]').length);
  if(!progress) await S(5*60*1000);
}
window.__wcAtt7=false; status('finished '+localStorage.wcAttStatus);
})();
'attach7 started'
