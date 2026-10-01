// Actual production UI with test-only read/control handles appended by this server.
// Runtime dependencies are external verification tooling, not shipped with the game.
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium:pw}=await import(process.env.PLAYWRIGHT_MODULE||'../../olivia/node_modules/playwright-core/index.mjs');
const {default:chromium}=await import(process.env.CHROMIUM_MODULE||'../../qa-runtime/node_modules/@sparticuz/chromium/build/index.js');
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{
 const url=decodeURIComponent(req.url.split('?')[0]),path=resolve(root,'.'+url+(url.endsWith('/')?'index.html':''));if(!path.startsWith(root+'/'))throw Error();
 let bytes=await readFile(path);if(path.endsWith('/game.js'))bytes=Buffer.from(bytes.toString()+`\nwindow.__qa={get save(){return save},get state(){return state},get held(){return [...input.sources]},persist,showTitle,showPracticeMenu,showStageSelect,showSettings,showPause,resumePlay,beginStage,enterRoom,solveTerminal,adultPanel,adult,ROOMS,STAGES};`);
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'})[extname(path)]||'application/octet-stream');res.end(bytes);
 }catch{res.statusCode=404;res.end('Not found');}});
await new Promise(done=>server.listen(4182,'127.0.0.1',done));
const browser=await pw.launch({executablePath:await chromium.executablePath(),args:chromium.args.filter(a=>!a.includes('single-process')&&!a.includes('disable-web-security')&&!a.includes('allow-running-insecure-content')),headless:true});
await mkdir('test-results',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:852,height:393},hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4182/');await page.waitForFunction(()=>!!window.__qa);
 const state=()=>page.evaluate(()=>structuredClone(window.__qa.save));
 const unlock=async()=>{await page.locator('#adult-pass').fill('admin123');await page.locator('#unlock').click();await page.locator('#skill-search').waitFor();};
 await page.locator('#settings').click();await page.locator('#adult-settings').click();await unlock();
 assert.equal(await page.locator('#adult-mode').count(),0);assert.equal(await page.locator('#grade3-preset').count(),0);
 const before=await state();await page.locator('#clear-selection').click();await page.locator('#skill-search').fill('time');
 const labels=await page.locator('#skills label').allTextContents(),grades=labels.map(s=>Number(s.match(/G(\d)/)[1]));assert.deepEqual(grades,[...grades].sort((a,b)=>a-b));assert(grades.includes(1)&&grades.includes(4));
 const ids=await page.locator('#skills input').evaluateAll(xs=>xs.slice(0,10).map(x=>x.value));assert.equal(ids.length,10);
 for(const id of [...ids].reverse())await page.locator(`#skills input[value="${id}"]`).check();
 await page.locator('#skill-search').fill('subtract');await page.locator('#count').fill('1');await page.locator('#diagnostic').click();
 for(let i=0;i<10;i++){
  assert.match(await page.locator('#skill-preview').innerText(),new RegExp(`Preview ${i+1} of 10`));
  if(i===0){await page.locator('#preview-keypad button').filter({hasText:/^7$/}).click();assert.equal(await page.locator('#preview-answer').inputValue(),'7');}
  if(ids[i]==='g3-time-quarter'){const bounds=await page.locator('#preview-submit').boundingBox();assert(bounds.y+bounds.height<=393);await page.screenshot({path:'test-results/chrono-preview-phone.png'});}
  await page.locator('#preview-next').click();
 }
 assert.deepEqual(await state(),before);assert.equal(await page.locator('#skill-search').inputValue(),'subtract');
 assert.equal(await page.locator('#diagnostic').evaluate(el=>el.parentElement===document.getElementById('save-settings').parentElement),true);
 await page.locator('#clear-selection').click();const selected=['S5','S6','g1-sub20','g1-missing'];
 for(const id of selected)await page.locator(`#skills input[value="${id}"]`).check();await page.locator('#mode').selectOption('targeted');await page.locator('#count').fill('5');await page.locator('#save-settings').click();assert.match(await page.locator('#notice').innerText(),/4 skills/);
 await page.locator('#adult-back').click();await page.locator('#select').click();await page.locator('[data-stage="foundry"]').click();await page.locator('#enter-stage').click();await page.locator('#go').click();
 const gate=await page.evaluate(()=>window.__qa.STAGES[0].gates[0]);
 await page.evaluate(id=>{const q=window.__qa;q.enterRoom(q.ROOMS.find(r=>r.gate?.id===id).index,false);q.solveTerminal();},gate);
 await page.locator('#shared-answer').waitFor();const current=(await state()).sharedGates[gate];assert(selected.includes(current.gate.item.skillId));
 const submit=async()=>{const s=await state();await page.locator('#shared-answer').focus();await page.keyboard.press('Delete');await page.keyboard.type(String(s.sharedMath.gate.item.answer));await page.locator('#shared-submit').click();};
 await submit();assert.equal((await state()).sharedGates[gate].completed,1);
 await page.locator('#shared-answer').focus();await page.keyboard.type('12');
 const pending=structuredClone((await state()).sharedGates[gate]);await page.reload();await page.waitForFunction(()=>!!window.__qa);await page.locator('#continue').click();await page.evaluate(()=>window.__qa.solveTerminal());assert.deepEqual((await state()).sharedGates[gate],pending);assert.equal(await page.locator('#shared-answer').inputValue(),'12');
 await page.locator('#shared-settings').click();await unlock();await page.locator('#clear-selection').click();await page.locator('#skill-search').fill('time');await page.locator('#skills input[value="g3-time-quarter"]').check();await page.locator('#count').fill('2');await page.locator('#save-settings').click();assert.deepEqual((await state()).sharedGates[gate],pending);
 await page.locator('#adult-back').click();for(let i=1;i<5;i++){assert(selected.includes((await state()).sharedMath.gate.item.skillId));await submit();}
 assert((await state()).solved.includes(gate));assert.equal((await state()).sharedMath.config.count,2);
 const next=await page.evaluate(()=>window.__qa.STAGES[0].gates[1]);await page.evaluate(id=>{const q=window.__qa;q.enterRoom(q.ROOMS.find(r=>r.gate?.id===id).index,false);q.solveTerminal();},next);
 assert.equal((await state()).sharedMath.gate.item.skillId,'g3-time-quarter');assert.equal((await state()).sharedMath.gate.config.count,2);
 const bounds=await page.locator('#shared-submit').boundingBox();assert(bounds.y+bounds.height<=393);await page.screenshot({path:'test-results/chrono-gate-phone.png'});
 await page.locator('#shared-exit').click();await page.evaluate(()=>{window.__qa.state.player.invulnerable=999;});
 // Real Chromium touch contacts: both release orders, slide outside, interruption.
 const cdp=await context.newCDPSession(page);const left=await page.locator('[data-action="left"]').boundingBox(),jump=await page.locator('[data-action="jump"]').boundingBox();
 const a={id:1,x:left.x+left.width/2,y:left.y+left.height/2},b={id:2,x:jump.x+jump.width/2,y:jump.y+jump.height/2};
 for(const first of ['left','jump']){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});assert.equal((await page.evaluate(()=>window.__qa.held)).length,2);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[first==='left'?b:a]});assert.equal((await page.evaluate(()=>window.__qa.held)).length,1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await page.evaluate(()=>window.__qa.held)).length,0);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:500,y:30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await page.evaluate(()=>window.__qa.held)).length,0);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal((await page.evaluate(()=>window.__qa.held)).length,0);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await page.evaluate(()=>window.__qa.showPracticeMenu());await page.locator('#shared-relay-start').click();assert.equal((await state()).sharedMath.gate.config.count,5);assert.equal((await state()).sharedMath.config.count,2);for(let i=0;i<5;i++)await submit();await page.locator('#again').waitFor();
 await page.evaluate(()=>window.__qa.showTitle());await page.locator('#settings').click();await page.locator('#adult-settings').click();await unlock();
 const savedBeforeReset=await state();page.once('dialog',d=>d.dismiss());await page.locator('#reset-all').click();assert.deepEqual(await state(),savedBeforeReset);
 page.once('dialog',d=>d.accept());await page.locator('#reset-all').click();assert.equal((await state()).sharedMath.events.length,0);assert.equal((await state()).solved.length,0);
 page.once('dialog',d=>d.accept());await page.locator('#restore-backup').click();assert.deepEqual(await state(),savedBeforeReset);
 // Cancel then confirm math-only deletion; solved gates and rewards remain.
 page.once('dialog',d=>d.dismiss());await page.locator('#math-reset').click();assert.deepEqual(await state(),savedBeforeReset);
 page.once('dialog',d=>d.accept());await page.locator('#math-reset').click();assert.equal((await state()).sharedMath.events.length,0);assert.deepEqual((await state()).solved,savedBeforeReset.solved);
 await page.reload();await page.waitForFunction(()=>!!window.__qa);assert.equal((await state()).sharedMath.events.length,0);assert.deepEqual((await state()).solved,savedBeforeReset.solved);
 assert.deepEqual(errors,[]);console.log('PASS: shared settings/search/ten previews/isolation, targeted real gate, reload draft, next-gate configuration, phone layout, touch release, five-question relay, reset cancellation/confirmation/backup recovery/reload.');
 await context.close();
}finally{await browser.close();await new Promise(done=>server.close(done));}
