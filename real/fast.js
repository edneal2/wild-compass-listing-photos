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
    if(pairs.length!==1) throw 'multi';
    const [o,nw]=pairs[0];
    const r1=await fetch(BASE+o); if(!r1.ok) throw 'old'+r1.status; const osig=await sigOf(await r1.blob());
    const r2=await fetch(BASE+nw); if(!r2.ok) throw 'new'+r2.status; const nblob=await r2.blob();
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
    let bi=-1,bd=99;
    for(let i=0;i<items.length;i++){const u=items[i].querySelector('img').src.replace(/il_[^/.]+(?=\.)/,'il_570xN'); const r=await fetch(u,{mode:'cors'}); if(!r.ok) throw 'ex'+r.status; const dd=diff(osig,await sigOf(await r.blob())); if(dd<bd){bd=dd;bi=i;}}
    if(bi<0||bd>=6) throw 'nomatch'+bd.toFixed(1);
    const oldId=old[bi];
    const fw=fr.contentWindow;
    const fi=[...d.querySelectorAll('input[name=listing-media-upload]')].find(f=>f.labels&&f.labels[0]&&/Add photos/.test(f.labels[0].innerText)); if(!fi) throw 'nofile';
    const dt=new fw.DataTransfer(); dt.items.add(new fw.File([nblob],nw.split('/').pop(),{type:'image/jpeg'}));
    fi.files=dt.files; fi.dispatchEvent(new fw.Event('change',{bubbles:true}));
    let ok=false; for(let k=0;k<240;k++){await S(500); const s=sig(); if(s.length===n+1 && s.every(x=>x!=='x'&&!/^blob/.test(x)) && getItems().every(e=>/etsystatic|il_/.test(e.querySelector('img').src))){ok=true;break;}}
    if(!ok) throw 'upload';
    await S(1500);
    const newId=sig()[n];
    // move new item from index n to index bi with keyboard (dnd-kit)
    const key=(el,code,k)=>{el.dispatchEvent(new fw.KeyboardEvent('keydown',{code,key:k,bubbles:true,cancelable:true}));};
    let moved=false;
    for(let att=0;att<3&&!moved;att++){
      const cur=sig().indexOf(newId); if(cur===bi){moved=true;break;}
      const el=getItems()[cur]; el.focus(); await S(300);
      key(el,'Space',' '); await S(700);
      const steps=cur-bi;
      for(let s=0;s<steps;s++){ key(d,'ArrowLeft','ArrowLeft'); await S(450); }
      key(d,'Space',' '); await S(1500);
      if(sig().indexOf(newId)===bi) moved=true;
    }
    if(!moved) throw 'move'+sig().indexOf(newId)+'/'+bi;
    // delete old
    const before=sig().length; let gone=false;
    for(let tr=0;tr<2&&!gone;tr++){ const it=getItems()[sig().indexOf(oldId)]; if(!it){gone=sig().length===before-1;break;} it.querySelector('clg-icon[name=trash]').closest('clg-icon-button').click(); for(let k=0;k<60;k++){await S(500); if(sig().length===before-1){gone=true;break;}} }
    if(!gone) throw 'delstuck';
    await S(800);
    const want=old.slice(); want[bi]=newId;
    if(sig().join()!==want.join()) throw 'order';
    if(window.wcNoPublish){ res='ready-nopub'; } else {
      const pub=[...d.querySelectorAll('button')].find(e=>e.innerText.trim()==='Publish changes'); if(!pub) throw 'nopub';
      pub.click();
      let ok2=false; for(let k=0;k<60;k++){await S(500); try{ if(!fr.contentWindow.location.pathname.includes('listing-editor')){ok2=true;break;} }catch(e){} }
      res=ok2?'ok':'pubwait';
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
