(async()=>{
if(window.wcFastRunning) return 'already running';
window.wcFastRunning=true;
const W=new Worker(URL.createObjectURL(new Blob(["onmessage=e=>setTimeout(()=>postMessage(e.data),e.data.ms)"])));
let cb={},id=0;W.onmessage=e=>{cb[e.data.id]();delete cb[e.data.id]};
const S=ms=>new Promise(r=>{const k=++id;cb[k]=r;W.postMessage({id:k,ms})});
const Q=JSON.parse(localStorage.wcFastQ), M=JSON.parse(localStorage.wcIdMap);
const done=JSON.parse(localStorage.wcFastDone||'{}');
const BASE='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/';
const sigOf=async(blob)=>{const bm=await createImageBitmap(blob);const c=new OffscreenCanvas(24,24);const x=c.getContext('2d');x.drawImage(bm,0,0,24,24);const d=x.getImageData(0,0,24,24).data;const g=[];for(let i=0;i<d.length;i+=4)g.push((d[i]+d[i+1]+d[i+2])/3);return g;};
const diff=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=Math.abs(a[i]-b[i]);return s/a.length;};
let fr=document.getElementById('wcfr4'); if(!fr){fr=document.createElement('iframe');fr.id='wcfr4';fr.style.cssText='position:fixed;left:0;top:0;width:1400px;height:1100px;z-index:99999;background:#fff';document.body.appendChild(fr);}
for(const job of Q){
  if(window.wcStop) break;
  const [sku,pairs]=job;
  if(done[sku] && !/^err|pubwait/.test(done[sku])) continue;
  const lid=M[sku]; if(!lid){done[sku]='noid';localStorage.wcFastDone=JSON.stringify(done);continue;}
  let res='';
  try{
    const jobs=[];
    for(const [o,nw] of pairs){const r1=await fetch(BASE+o); if(!r1.ok) throw 'old'+r1.status; const r2=await fetch(BASE+nw); if(!r2.ok) throw 'new'+r2.status; const nb=await r2.blob(); jobs.push({osig:await sigOf(await r1.blob()),nblob:nb,nsig:await sigOf(nb),name:nw.split('/').pop()});}
    fr.src='about:blank'; await S(800);
    fr.src='/your/shops/me/listing-editor/edit/'+lid;
    let d=null,items=[];
    const getItems=()=>[...d.querySelectorAll('[aria-roledescription=sortable]')].filter(e=>e.querySelector('img'));
    for(let k=0;k<160;k++){await S(500); d=fr.contentDocument; if(d&&d.readyState==='complete'&&d.location.href.includes('listing-editor')){items=getItems(); if(items.length) break;}}
    if(!items.length) throw 'noitems';
    await S(1500); items=getItems();
    const n=items.length; if(n>=10) throw 'full'+n;
    if(items.some(e=>/video/i.test(e.innerHTML))) throw 'hasvideo';
    const sig=()=>getItems().map(e=>{const i=e.querySelector('img');return i?(i.src.split('/').pop().split('?')[0].split('.')[1]||i.src.slice(-30)):'x'});
    const old=sig();
    const isigs=[];
    for(let i=0;i<items.length;i++){const u=items[i].querySelector('img').src.replace(/il_[^/.]+(?=\.)/,'il_570xN'); let r=null; for(let t=0;t<3&&!r;t++){try{r=await fetch(u,{mode:'cors'});}catch(e){await S(3000);}} if(!r||!r.ok) throw 'ex'; isigs.push(await sigOf(await r.blob()));}
    const usedIdx=new Set();let fb=false;
    for(const j of jobs){let bi=-1,bd=99; isigs.forEach((g,i)=>{if(usedIdx.has(i))return;const dd=diff(j.osig,g);if(dd<bd){bd=dd;bi=i;}});
      if(bd>=6){ if(jobs.length>1) throw 'nomatch'+bd.toFixed(1);
        const L=isigs.length, ci=L-3, tiles=L>=5?diff(isigs[L-2],isigs[L-1]):99;
        if(ci<2||ci>5||tiles>=22) throw 'nomatch'+bd.toFixed(1)+'/t'+tiles.toFixed(1); bi=ci; fb=true; }
      usedIdx.add(bi); j.bi=bi; j.oldId=old[bi];}
    const fw=fr.contentWindow;
    const key=(el,code,k)=>{el.dispatchEvent(new fw.KeyboardEvent('keydown',{code,key:k,bubbles:true,cancelable:true}));};
    const R=()=>getItems().map(e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom};});
    const corners=a=>[[a.l,a.t],[a.r,a.t],[a.l,a.b],[a.r,a.b]];
    const cd=(a,b)=>{const A=corners(a),B=corners(b);let s=0;for(let i=0;i<4;i++)s+=Math.hypot(A[i][0]-B[i][0],A[i][1]-B[i][1]);return s;};
    const plan=(rs,from,to)=>{const ks=[];let cur=from;for(let g=0;g<20&&cur!==to;g++){const c=rs[cur],t=rs[to];let dir,f;
        if(t.t<c.t-5){dir='ArrowUp';f=x=>x.t<c.t-5;} else if(t.t>c.t+5){dir='ArrowDown';f=x=>x.t>c.t+5;} else if(t.l<c.l){dir='ArrowLeft';f=x=>x.l<c.l-5;} else {dir='ArrowRight';f=x=>x.l>c.l+5;}
        let best=-1,bd=1e9;rs.forEach((x,i)=>{if(i===cur||!f(x))return;const dd=cd(c,x);if(dd<bd){bd=dd;best=i;}});if(best<0)break;ks.push(dir);cur=best;}
      return cur===to?ks:null;};
    const want=old.slice();
    for(const j of jobs){
      const cnt=sig().length;
      const fi=[...d.querySelectorAll('input[name=listing-media-upload]')].find(f=>f.labels&&f.labels[0]&&/Add photos/.test(f.labels[0].innerText)); if(!fi) throw 'nofile';
      const dt=new fw.DataTransfer(); dt.items.add(new fw.File([j.nblob],j.name,{type:'image/jpeg'}));
      fi.files=dt.files; fi.dispatchEvent(new fw.Event('change',{bubbles:true}));
      let ok=false; for(let k=0;k<240;k++){await S(500); const s=sig(); if(s.length===cnt+1 && s.every(x=>x!=='x'&&!/^blob/.test(x)) && getItems().every(e=>/etsystatic|il_/.test(e.querySelector('img').src))){ok=true;break;}}
      if(!ok) throw 'upload';
      await S(1500);
      const newId=sig()[cnt]; const tgt=sig().indexOf(j.oldId);
      let moved=false;
      for(let att=0;att<4&&!moved;att++){
        let s=sig(); if(s.filter(x=>x===newId).length>1){key(d,'Space',' ');await S(3000);s=sig();}
        const cur=s.indexOf(newId); if(cur===tgt){moved=true;break;}
        const ks=plan(R(),cur,tgt); if(!ks) throw 'noplan';
        const el=getItems()[cur]; el.focus(); await S(300);
        key(el,'Space',' '); await S(700);
        for(const k of ks){ key(d,k,k); await S(700); }
        key(d,'Space',' '); await S(2500);
        for(let w=0;w<4&&sig().filter(x=>x===newId).length>1;w++) await S(1000);
        if(sig().indexOf(newId)===tgt && sig().filter(x=>x===newId).length===1) moved=true;
      }
      if(!moved) throw 'move'+sig().indexOf(newId)+'/'+tgt;
      const before=sig().length; let gone=false;
      for(let tr=0;tr<3&&!gone;tr++){ const ix=sig().lastIndexOf(j.oldId); if(ix<0){gone=sig().length===before-1;break;} getItems()[ix].querySelector('clg-icon[name=trash]').closest('clg-icon-button').click(); for(let k=0;k<60;k++){await S(500); if(sig().length===before-1){gone=true;break;}} if(!gone) await S(4000);}
      if(!gone) throw 'delstuck';
      await S(800);
      want[j.bi]=newId;
    }
    for(let w=0;w<6&&sig().join()!==want.join();w++) await S(1000);
    if(sig().join()!==want.join()) throw 'order:'+sig().map(x=>want.indexOf(x)).join(',');
    if(window.wcNoPublish){ res='ready-nopub'; } else {
      const pub=[...d.querySelectorAll('button')].find(e=>e.innerText.trim()==='Publish changes'); if(!pub) throw 'nopub';
      pub.click();
      let ok2=false; for(let k=0;k<60;k++){await S(500); try{ if(!fr.contentWindow.location.pathname.includes('listing-editor')){ok2=true;break;} }catch(e){} }
      res=(ok2?'ok':'pubwait')+(fb?'-fb':'');
    }
  }catch(e){res='err:'+e;
    if(!window.wcNoPublish) try{const d=fr.contentDocument;const b=[...d.querySelectorAll('button')].find(b=>b.innerText.trim()==='Discard changes'); if(b){b.click(); await S(1500); const c=[...d.querySelectorAll('button')].filter(b=>b.innerText.trim()==='Discard').find(b=>b.getBoundingClientRect().width>0); if(c){c.click(); await S(2500);}}}catch(e2){}
  }
  done[sku]=res; localStorage.wcFastDone=JSON.stringify(done); localStorage.wcFastLast=sku+' '+res+' '+new Date().toISOString();
  if(window.wcNoPublish) break;
  await S(5500+Math.floor(Math.random()*3000));
}
localStorage.wcFastRunning='finished '+new Date().toISOString(); window.wcFastRunning=false;
})(); 'started'
