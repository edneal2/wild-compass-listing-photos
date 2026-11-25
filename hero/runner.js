// Wild Compass: swap in new listing photos. Queue entries: [key, slug, listingId?, files?]
window.wcRun = async function (qKey) {
  const token = Math.random(); window.wcToken = token;
  const W = new Worker(URL.createObjectURL(new Blob(["onmessage=e=>setTimeout(()=>postMessage(e.data),e.data.ms)"])));
  const cb = {}; let id = 0; W.onmessage = e => { cb[e.data.id](); delete cb[e.data.id]; };
  const S = ms => new Promise(r => { const k = ++id; cb[k] = r; W.postMessage({ id: k, ms }); });
  const Q = JSON.parse(localStorage[qKey]), M = JSON.parse(localStorage.wcIdMap);
  const BASE = 'https://raw.githubusercontent.com/edneal2/wild-compass-listing-photos/main/';
  for (const E of Q) {
    if (window.wcToken !== token || window.wcStop) return 'stopped';
    const [key, slug] = E; const lid = E[2] || M[key]; const FILES = E[3] || ['hero/' + slug + '.jpg']; const K = FILES.length;
    const done = JSON.parse(localStorage.wcHeroDone || '{}');
    const prev = String(done[key] || '');
    if (prev === 'ok' || prev.startsWith('err2') || prev === 'noid' || prev === 'check') continue;
    window.wcCur = key;
    if (!lid) { done[key] = 'noid'; localStorage.wcHeroDone = JSON.stringify(done); continue; }
    let res = '';
    let fr = document.getElementById('wcfr'); if (fr) fr.remove();
    fr = document.createElement('iframe'); fr.id = 'wcfr';
    fr.style.cssText = 'position:fixed;left:0;top:0;width:1300px;height:1100px;z-index:99999;background:#fff';
    document.body.appendChild(fr);
    try {
      fr.src = '/your/shops/me/listing-editor/edit/' + lid; await S(1500);
      let d = null, items = [];
      for (let k = 0; k < 60; k++) {
        await S(500); d = fr.contentDocument;
        if (d && d.readyState === 'complete' && d.location.pathname.includes(lid)) {
          items = [...d.querySelectorAll('[aria-roledescription=sortable]')].filter(e => e.querySelector('img'));
          if (items.length) break;
        }
      }
      if (!items.length) throw 'noitems';
      await S(1000);
      const fw = fr.contentWindow; const n = items.length;
      const sig = () => [...d.querySelectorAll('[aria-roledescription=sortable]')].map(e => { const i = e.querySelector('img'); return i ? i.src.split('/').pop().split('?')[0] : 'x'; });
      const dt = new fw.DataTransfer();
      for (const fp of FILES) {
        const r = await fetch(BASE + fp); if (!r.ok) throw 'img' + r.status;
        dt.items.add(new fw.File([await r.arrayBuffer()], fp.split('/').pop(), { type: 'image/jpeg' }));
      }
      const fi = [...d.querySelectorAll('input[type=file]')].find(f => /image/.test(f.accept));
      fi.files = dt.files; fi.dispatchEvent(new fw.Event('change', { bubbles: true }));
      let cnt = 0;
      for (let k = 0; k < 120; k++) { await S(500); cnt = sig().filter(x => /il_/.test(x)).length; if (cnt === n + K) break; }
      if (cnt !== n + K) throw 'upload ' + cnt;
      await S(1500);
      const NEW = sig().slice(n, n + K);
      for (let j = 0; j < K; j++) {
        for (let t = 0; t < 3 && sig()[j] !== NEW[j]; t++) {
          const its = [...d.querySelectorAll('[aria-roledescription=sortable]')];
          const src = its[sig().indexOf(NEW[j])], dst = its[j];
          src.scrollIntoView({ block: 'center' }); await S(300);
          const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
          const ax = a.left + a.width / 2, ay = a.top + a.height / 2, bx = b.left + b.width / 2, by = b.top + b.height / 2;
          const P = (type, x, y, tg) => tg.dispatchEvent(new fw.PointerEvent(type, { bubbles: true, cancelable: true, view: fw, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }));
          const Mo = (type, x, y, tg) => tg.dispatchEvent(new fw.MouseEvent(type, { bubbles: true, cancelable: true, view: fw, clientX: x, clientY: y, button: 0, buttons: type === 'mouseup' ? 0 : 1 }));
          P('pointerdown', ax, ay, src); Mo('mousedown', ax, ay, src);
          for (let s = 1; s <= 15; s++) { const x = ax + (bx - ax) * s / 15, y = ay + (by - ay) * s / 15; P('pointermove', x, y, d); Mo('mousemove', x, y, d); await S(40); }
          await S(200); P('pointerup', bx, by, d); Mo('mouseup', bx, by, d); await S(1000);
        }
        if (sig()[j] !== NEW[j]) throw 'reorder' + j;
      }
      const pub = [...d.querySelectorAll('button')].find(e => e.innerText.trim() === 'Publish changes'); if (!pub) throw 'nopub';
      pub.click();
      let ok = false;
      for (let k = 0; k < 120; k++) { await S(500); try { if (!fr.contentWindow.location.pathname.includes('listing-editor')) { ok = true; break; } } catch (e) { } }
      res = ok ? 'ok' : 'check';   // 'check' = published state unknown, verify before retrying
    } catch (e) { res = (prev.startsWith('err') ? 'err2:' : 'err:') + e; }
    const d2 = JSON.parse(localStorage.wcHeroDone || '{}'); d2[key] = res; localStorage.wcHeroDone = JSON.stringify(d2);
  }
  return 'finished';
};
window.wcChainRun = async function (keys) {
  for (const k of keys) { window.wcChainStage = k; const r = await window.wcRun(k); if (r === 'stopped') return; }
  window.wcChainStage = 'done';
};
