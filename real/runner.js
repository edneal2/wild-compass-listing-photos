(async()=>{
if(window.wcRealRunning) return 'already running';
window.wcRealRunning=true; window.wcStop=false;
const W=new Worker(URL.createObjectURL(new Blob(["onmessage=e=>setTimeout(()=>postMessage(e.data),e.data.ms)"])));
let cb={},id=0;W.onmessage=e=>{cb[e.data.id]();delete cb[e.data.id]};
const S=ms=>new Promise(r=>{const k=++id;cb[k]=r;W.postMessage({id:k,ms})});
const Q=JSON.parse(localStorage.wcRealQ), M=JSON.parse(localStorage.wcIdMap);
const done=JSON.parse(localStorage.wcRealDone||'{}');
const BASE='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/real/';
let fr=document.getElementById('wcfr'); if(!fr){fr=document.createElement('iframe');fr.id='wcfr';fr.style.cssText='position:fixed;left:0;top:0;width:1400px;height:1100px;z-index:99999;background:#fff';document.body.appendChild(fr);}
const POS={hero:0,cover:1,preview:2};
for(const job of Q){
  if(window.wcStop) break;
  const [sku,slug,slots]=job;
  if(done[sku]) continue;
  const lid=M[sku]; if(!lid){done[sku]='noid';localStorage.wcRealDone=JSON.stringify(done);continue;}
  let res='';
  try{
    fr.src='/your/shops/me/listing-editor/edit/'+lid;
    let d=null,items=[];
    const getItems=()=>[...d.querySelectorAll('[aria-roledescription=sortable]')].filter(e=>e.querySelector('img'));
    for(let k=0;k<80;k++){await S(500); d=fr.contentDocument; if(d&&d.readyState==='complete'){items=getItems(); if(items.length) break;}}
    if(!items.length) throw 'noitems';
    await S(1500); items=getItems();
    const n=items.length; if(n!==6) throw 'count'+n;
    const sig=()=>getItems().map(e=>{const i=e.querySelector('img');return i?i.src.split('/').pop().split('?')[0].split('.')[1]||i.src.slice(-30):'x'});
    const before=sig();
    // fetch new images
    const want=Object.keys(slots).sort((a,b)=>POS[a]-POS[b]);
    const dt=new DataTransfer();
    for(const s of want){const r=await fetch(BASE+slug+'-'+s+'.jpg'); if(!r.ok) throw 'img'+r.status+s; const b=await r.blob(); dt.items.add(new File([b],slug+'-'+s+'.jpg',{type:'image/jpeg'}));}
    const fi=[...d.querySelectorAll('input[type=file]')].find(f=>/image/.test(f.accept)); if(!fi) throw 'nofile';
    fi.files=dt.files; fi.dispatchEvent(new Event('change',{bubbles:true}));
    let it2=[]; for(let k=0;k<90;k++){await S(500); it2=getItems().filter(e=>/etsystatic|il_/.test(e.querySelector('img').src)); if(it2.length===n+want.length) break;}
    if(it2.length!==n+want.length) throw 'upload'+it2.length;
    await S(2000);
    const after=sig(); const newIds=after.slice(n);
    // delete old images at target positions (highest first)
    const oldIds=want.map(s=>before[POS[s]]);
    for(const oid of oldIds.slice().reverse()){
      const idx=sig().indexOf(oid); if(idx<0) throw 'lost'+oid;
      const t=getItems()[idx].querySelector('clg-icon[name=trash]'); if(!t) throw 'notrash';
      t.closest('clg-icon-button').click(); await S(1500);
    }
    if(getItems().length!==n) throw 'delcount'+getItems().length;
    // move each new image into its slot
    const fw=fr.contentWindow;
    for(let w=0;w<want.length;w++){
      const target=POS[want[w]], nid=newIds[w];
      for(let tries=0;tries<3 && sig()[target]!==nid;tries++){
        const its=getItems(); const src=its[sig().indexOf(nid)], dst=its[target];
        src.scrollIntoView({block:'center'}); await S(400);
        const a=src.getBoundingClientRect(), bb=dst.getBoundingClientRect();
        const P=(type,x,y,t)=>(t||d).dispatchEvent(new fw.PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1}));
        const ax=a.left+a.width/2, ay=a.top+a.height/2, bx=bb.left+bb.width/2, by=bb.top+bb.height/2;
        P('pointerdown',ax,ay,src);
        for(let s=1;s<=15;s++){P('pointermove',ax+(bx-ax)*s/15,ay+(by-ay)*s/15); await S(40);}
        await S(250); P('pointerup',bx,by); await S(1200);
      }
      if(sig()[target]!==nid) throw 'reorder'+want[w];
    }
    const fin=sig(); if(fin.length!==n) throw 'final'+fin.length;
    for(const s of want){ if(fin[POS[s]]!==newIds[want.indexOf(s)]) throw 'verify'+s; }
    const pub=[...d.querySelectorAll('button')].find(e=>e.innerText.trim()==='Publish changes'); if(!pub) throw 'nopub';
    pub.click();
    let ok=false; for(let k=0;k<60;k++){await S(500); try{ if(!fr.contentWindow.location.pathname.includes('listing-editor')){ok=true;break;} }catch(e){} }
    res=ok?'ok':'pubwait';
  }catch(e){res='err:'+e;}
  done[sku]=res; localStorage.wcRealDone=JSON.stringify(done); localStorage.wcRealLast=sku+' '+res+' '+new Date().toISOString();
  await S(6000+Math.floor(Math.random()*4000));
}
localStorage.wcRealRunning='finished '+new Date().toISOString(); window.wcRealRunning=false;
})();
'started'
