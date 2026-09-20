import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {viewportLayout} from '../public/viewport-layout.js';
import {game} from './harness.mjs';

for(const [w,h] of [[1024,768],[1180,820],[1366,1024],[844,390],[667,375],[1024,400]]){
 test(`touch frame and cross-pad fit ${w}×${h}`,()=>{
  const x=viewportLayout(w,h,true);
  assert.ok(x.cell>=44);
  assert.ok(x.rail>=3*x.cell+6+6+34+2);
  assert.ok(x.left>=0&&x.top>=0);
  assert.ok(x.left+x.cw<=w+.001);
  assert.ok(x.top+x.ch<=h-x.rail+.001);
  assert.ok(Math.abs(x.cw/x.ch-16/9)<.0001);
 });
}
test('desktop keeps full frame with no reserved control rail',()=>{
 const x=viewportLayout(1280,720,false);assert.equal(x.rail,0);assert.equal(x.cw,1280);assert.equal(x.ch,720);
});
test('stale keyboard pan cannot shift the game root; close/reopen recovers without changing progress',async()=>{
 const g=await game({touch:true});g.beginStage('foundry');
 const snapshot=JSON.stringify(g.save);
 let scrollCalls=0;
 g.context.window.visualViewport={width:1024,height:400,offsetTop:350,offsetLeft:20};
 g.context.window.scrollTo=()=>scrollCalls++;
 g.fitCanvas();
 assert.equal(g.nodes.get('#app').style.top,'0px');assert.equal(g.nodes.get('#app').style.left,'0px');
 g.showPause();g.resumePlay();assert.ok(scrollCalls>0);
 g.context.window.visualViewport.height=768;
 g.flushTimers();
 assert.equal(g.nodes.get('#app').style.height,'768px');
 assert.equal(g.nodes.get('#touch-controls').style.top,`${768-206}px`);
 assert.equal(JSON.stringify(g.save),snapshot);
 assert.equal(g.state.screen,'play');
});
test('portrait rotation still pauses; landscape keyboard shrink does not',async()=>{
 const g=await game({touch:true});g.beginStage('foundry');
 g.context.window.visualViewport={width:1024,height:350,offsetTop:300};g.fitCanvas();assert.equal(g.state.screen,'play');
 g.context.innerWidth=768;g.context.innerHeight=1024;g.fitCanvas();assert.equal(g.state.screen,'pause');
});
test('directional controls retain simultaneous input and release on pointer cancellation',async()=>{
 const g=await game({touch:true});
 for(const action of ['left','up','jump'])g.nodes.get('control-'+action).dispatchEvent({type:'pointerdown',pointerId:action});
 for(const action of ['left','up','jump'])assert.ok(g.input.held.get(action));
 g.nodes.get('control-up').dispatchEvent({type:'pointercancel',pointerId:'up'});
 assert.ok(!g.input.held.get('up'));assert.ok(g.input.held.get('left'));assert.ok(g.input.held.get('jump'));
});
test('cross uses four direct buttons and explicit cardinal grid positions',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');
 assert.ok(!html.includes('climb-pad'));
 for(const [action,position] of [['up','1/2'],['left','2/1'],['right','2/3'],['down','3/2']])assert.ok(css.includes(`[data-action=${action}]{grid-area:${position}}`));
});
test('sharp text shares canvas-local positioning, not a separately fixed viewport',async()=>{
 const {sharpText}=await import('../public/sharp-text.js');
 const oldDocument=globalThis.document,oldDpr=globalThis.devicePixelRatio;
 const ctx={getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0})};
 const layer={style:{},setAttribute(){},getContext:()=>({setTransform(){},clearRect(){}})};
 try{
  globalThis.document={createElement:()=>layer};globalThis.devicePixelRatio=2;
  const canvas={width:320,height:180,style:{left:'12px',top:'45px',width:'640px',height:'360px'},parentElement:{append(){}},getBoundingClientRect:()=>({left:12,top:395,width:640,height:360})};
  sharpText(canvas,ctx)();
  assert.equal(layer.style.position,'absolute');assert.equal(layer.style.top,'45px');assert.equal(layer.width,1280);
 }finally{globalThis.document=oldDocument;globalThis.devicePixelRatio=oldDpr;}
});
