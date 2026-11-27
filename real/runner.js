(async()=>{
if(window.wcRealRunning) return 'already running';
window.wcRealRunning=true; window.wcStop=false;
const W=new Worker(URL.createObjectURL(new Blob(["onmessage=e=>setTimeout(()=>postMessage(e.data),e.data.ms)"])));
let cb={},id=0;W.onmessage=e=>{cb[e.data.id]();delete cb[e.data.id]};
const S=ms=>new Promise(r=>{const k=++id;cb[k]=r;W.postMessage({id:k,ms})});
const Q=JSON.parse(localStorage.wcRealQ), M=JSON.parse(localStorage.wcIdMap);
const done=JSON.parse(localStorage.wcRealDone||'{}');
const BASE='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/';
let fr=document.getElementById('wcfr'); if(!fr){fr=document.createElement('iframe');fr.id='wcfr';fr.style.cssText='position:fixed;left:0;top:0;width:1400px;height:1100px;z-index:99999;background:#fff';document.body.appendChild(fr);}
for(const job of Q){
  if(window.wcStop) break;
  const [sku,six]=job;
  if(done[sku]) continue;
  const lid=M[sku]; if(!lid){done[sku]='noid';localStorage.wcRealDone=JSON.stringify(done);continue;}
  let res='';
  try{
    const blobs=[];
    for(const p of six){const r=await fetch(BASE+p); if(!r.ok) throw 'img'+r.status+' '+p; blobs.push(await r.blob());}
    fr.src='about:blank'; await S(800);
    fr.src='/your/shops/me/listing-editor/edit/'+lid;
    let d=null,items=[];
    const getItems=()=>[...d.querySelectorAll('[aria-roledescription=sortable]')].filter(e=>e.querySelector('img'));
    for(let k=0;k<80;k++){await S(500); d=fr.contentDocument; if(d&&d.readyState==='complete'&&d.location.href.includes('listing-editor')){items=getItems(); if(items.length) break;}}
    if(!items.length) throw 'noitems';
    await S(1500); items=getItems();
    const n=items.length; if(n!==6) throw 'count'+n;
    const sig=()=>getItems().map(e=>{const i=e.querySelector('img');return i?(i.src.split('/').pop().split('?')[0].split('.')[1]||i.src.slice(-30)):'x'});
    const old=sig();
    const fw=fr.contentWindow;
    for(let i=0;i<6;i++){
      const fi=[...d.querySelectorAll('input[name=listing-media-upload]')].find(f=>f.labels&&f.labels[0]&&/Add photos/.test(f.labels[0].innerText)); if(!fi) throw 'nofile';
      const dt=new fw.DataTransfer(); dt.items.add(new fw.File([blobs[i]],six[i].split('/').pop(),{type:'image/jpeg'}));
      fi.files=dt.files; fi.dispatchEvent(new fw.Event('change',{bubbles:true}));
      let ok=false; for(let k=0;k<90;k++){await S(500); const s=sig(); if(s.length===n+i+1 && s.every(x=>x!=='x'&&!/^blob/.test(x)) && getItems().every(e=>/etsystatic|il_/.test(e.querySelector('img').src))){ok=true;break;}}
      if(!ok) throw 'upload'+i;
      await S(1200);
    }
    const s2=sig(); const neu=s2.slice(n);
    if(s2.slice(0,n).join()!==old.join()) throw 'orderchanged';
    for(const oid of old){
      const idx=sig().indexOf(oid); if(idx<0) throw 'lost';
      const t=getItems()[idx].querySelector('clg-icon[name=trash]'); if(!t) throw 'notrash';
      t.closest('clg-icon-button').click(); await S(1400);
    }
    const fin=sig(); if(fin.join()!==neu.join()) throw 'final'+fin.length;
    if(window.wcNoPublish){ res='ready-nopub'; } else {
      const pub=[...d.querySelectorAll('button')].find(e=>e.innerText.trim()==='Publish changes'); if(!pub) throw 'nopub';
      pub.click();
      let ok=false; for(let k=0;k<60;k++){await S(500); try{ if(!fr.contentWindow.location.pathname.includes('listing-editor')){ok=true;break;} }catch(e){} }
      res=ok?'ok':'pubwait';
    }
  }catch(e){res='err:'+e;
    try{const d=fr.contentDocument;const b=[...d.querySelectorAll('button')].find(b=>b.innerText.trim()==='Discard changes'); if(b){b.click(); await S(1500); const c=[...d.querySelectorAll('button')].filter(b=>b.innerText.trim()==='Discard').find(b=>b.getBoundingClientRect().width>0); if(c){c.click(); await S(2500);}}}catch(e2){}
  }
  done[sku]=res; localStorage.wcRealDone=JSON.stringify(done); localStorage.wcRealLast=sku+' '+res+' '+new Date().toISOString();
  if(window.wcNoPublish) break;
  await S(6000+Math.floor(Math.random()*4000));
}
localStorage.wcRealRunning='finished '+new Date().toISOString(); window.wcRealRunning=false;
})();
