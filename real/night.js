(async()=>{
if(window.wcNightRunning) return 'night already running';
window.wcNightRunning=true; window.wcNoPublish=false; window.wcStop=false;
const REF=window.wcRef||'main';
const B='https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/'+REF+'/real/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=m=>{localStorage.wcNightLog=(new Date().toISOString().slice(11,19)+' '+m+'\n'+(localStorage.wcNightLog||'')).slice(0,4000);};
const run=async(file,flag)=>{const code=await fetch(B+file+'?x='+Date.now()).then(r=>r.text());(0,eval)(code);await sleep(3000);while(window[flag]&&!window.wcNightAbort)await sleep(15000);};
try{
  // 1. planner prepend (resumes from wcPreDone)
  if(!localStorage.wcNightStage||localStorage.wcNightStage==='pre'){localStorage.wcNightStage='pre';log('start prepend');window.wcPreRunning=false;await run('prepend.js','wcPreRunning');log('prepend finished');await sleep(8000);localStorage.wcNightStage='rt';}
  if(window.wcStop||window.wcNightAbort) throw 'stopped';
  // 2. road trip swap
  if(localStorage.wcNightStage==='rt'){if(!localStorage.wcSwapQ||!localStorage.wcRtLoaded){localStorage.wcSwapQ=JSON.stringify(await fetch(B+'queue_rt1127.json').then(r=>r.json()));localStorage.wcSwapDone='{}';localStorage.wcRtLoaded='1';}
    log('start rt swap');window.wcSwapRunning=false;window.wcSwapStop=false;await run('swap.js','wcSwapRunning');log('rt finished');await sleep(8000);localStorage.wcNightStage='fast';}
  if(window.wcStop||window.wcNightAbort) throw 'stopped';
  // 3. close-ups
  if(localStorage.wcNightStage==='fast'){if(!localStorage.wcFastLoaded){localStorage.wcFastQ=JSON.stringify(await fetch(B+'queue_detail1127.json').then(r=>r.json()));localStorage.wcFastDone='{}';localStorage.wcFastLoaded='1';}
    log('start close-ups');window.wcFastRunning=false;await run('fast.js','wcFastRunning');log('close-ups pass 1 finished');
    // retry pass for errors
    if(!window.wcStop){await sleep(8000);window.wcFastRunning=false;await run('fast.js','wcFastRunning');log('close-ups retry pass finished');}
    localStorage.wcNightStage='done';}
}catch(e){log('night stopped: '+e);}
window.wcNightRunning=false;
})(); 'night started'
