import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {TRACKS,SONG_BARS,arrangedStep,songDuration,Soundtrack} from '../public/music.js';
import {THEMES,ENVIRONMENT_ASSETS} from '../public/scenery.js';
const stages=['foundry','metro','tower','sky','tidal','garden','prism','fair'];
test('Every stage has a complete, unique score and a readable foreground palette',()=>{
 assert.equal(Object.keys(TRACKS).length,8);
 for(const stage of stages){
  const duration=songDuration(stage);
  assert.ok(duration>=60&&duration<=90,`${stage} loop ${duration} sec`);
  assert.ok(THEMES[stage].edge&&THEMES[stage].floor&&THEMES[stage].dark);
  const notes=Array.from({length:SONG_BARS*16},(_,i)=>arrangedStep(i,stage));
  assert.ok(notes.some(n=>n.lead),'melody is audible');
  assert.ok(notes.some(n=>n.bass),'bass is audible');
  for(const n of notes)for(const field of ['lead','bass','arp','answer'])if(n[field])assert.ok(Number.isInteger(n[field])&&n[field]>=24&&n[field]<=108,`${stage} ${field} invalid MIDI ${n[field]}`);
  assert.deepEqual(arrangedStep(640,stage),arrangedStep(0,stage),'seam returns to introduction');
  assert.notDeepEqual(notes,Array.from({length:SONG_BARS*16},(_,i)=>arrangedStep(i,stage,true)),'boss arrangement changes the score');
 }
 const signatures=stages.map(s=>JSON.stringify(Array.from({length:128},(_,i)=>arrangedStep(128+i,s))));
 assert.equal(new Set(signatures).size,8);
});
test('New songs have composed contrasting middles and stage-specific rhythmic patterns',()=>{
 for(const stage of ['tidal','garden','prism','fair']){
  const primary=Array.from({length:128},(_,i)=>arrangedStep(128+i,stage).lead);
  const middle=Array.from({length:128},(_,i)=>arrangedStep(256+i,stage).lead);
  assert.notDeepEqual(primary.map(n=>!!n),middle.map(n=>!!n),`${stage} has contrasting phrasing`);
 }
 assert.ok(arrangedStep(142,'tidal').offset>0&&arrangedStep(142,'tidal').bass>0,'Tidal offbeat bass is swung');
 assert.equal(arrangedStep(142,'garden').offset,0,'Garden stays straight');
});
test('Production environment plates are shipped at the native resolution',()=>{
 for(const [id,url] of Object.entries(ENVIRONMENT_ASSETS)){
  const path=new URL('../public/'+url,import.meta.url);assert.ok(existsSync(path),id);
  const png=readFileSync(path);assert.equal(png.readUInt32BE(16),320);assert.equal(png.readUInt32BE(20),180);
 }
});
// Exercise the actual Web Audio orchestration with a deterministic AudioParam/node double.
// Invalid frequencies, negative times and leaked retained voice counts fail this test.
function audioContext(){
 let scheduled=0;const ended=[];
 const param=()=>({value:0,setValueAtTime(v,t){assert.ok(Number.isFinite(v)&&Number.isFinite(t)&&t>=0);},setTargetAtTime(v,t){assert.ok(Number.isFinite(v)&&t>=0);},exponentialRampToValueAtTime(v,t){assert.ok(Number.isFinite(v)&&v>0&&t>=0);}});
 const node=()=>({frequency:param(),gain:param(),connect(target){return target;},disconnect(){},start(t){assert.ok(t>=0);scheduled++;},stop(t){assert.ok(t>=0);if(this.onended)ended.push(this.onended);}});
 return {currentTime:1,state:'running',createOscillator:node,createGain:node,createBiquadFilter:node,createBufferSource:node,finish(){ended.splice(0).forEach(fn=>fn());},get scheduled(){return scheduled;}};
}
test('All eight production synth voices schedule finite notes and release their voice budget',()=>{
 globalThis.document={hidden:false};
 for(const stage of stages){
  const ctx=audioContext(),sound=new Soundtrack(()=>({}),()=>({stage,screen:'play',room:0}));
  sound.context=ctx;sound.musicGain=ctx.createGain();sound.effectsGain=ctx.createGain();sound.noise={};
  for(let i=0;i<128;i++){
   sound.playLead(60+i%24,1+i*.2,TRACKS[stage]);ctx.finish();assert.equal(sound.voices,0);
  }
  sound.nextTime=1.025;sound.trackId=stage;sound.schedule();ctx.finish();assert.equal(sound.voices,0);assert.ok(ctx.scheduled>0);
 }
 delete globalThis.document;
});
