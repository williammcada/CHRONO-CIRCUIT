import test from 'node:test';
import assert from 'node:assert/strict';
import {game} from './harness.mjs';
import {expectedAnswer} from '../public/math-tasks.js';

test('eight selectable guardians begin in safe, playable rooms',async()=>{
 const g=await game();g.showStageSelect();
 assert.equal(g.document.querySelector('#overlay').querySelectorAll('[data-stage]').length,8);
 for(const stage of g.modules.STAGES){g.beginStage(stage.id);g.tick(100);g.drawWorld();assert.equal(g.state.stage,stage.id);assert.equal(g.state.screen,'play');assert.equal(g.state.player.hearts,5);assert.equal(g.save.routes[stage.id].started,true);}
});

test('root movement reaches the real first-room exit',async()=>{
 const g=await game();g.beginStage('foundry');g.tick(20);
 const room=g.ROOMS[g.state.room];Object.assign(g.state.player,{x:room.width-16,y:room.exitY-29,onGround:true});
 g.input.set('right',true,'test:right');g.tick(4);
 assert.equal(g.state.room,1);
});

test('each clock gate opens its actual question without advancing the world',async()=>{
 const g=await game();
 for(const stage of g.modules.STAGES){
  g.beginStage(stage.id);const room=g.ROOMS.find(r=>r.stage===stage.id&&r.gate);g.enterRoom(room.index);g.tick(20);
  Object.assign(g.state.player,{x:room.gate.x,y:room.gate.y+39-29,onGround:true});
  g.input.pressed.add('interact');g.tick();assert.equal(g.state.screen,'math',stage.id);
  const elapsed=g.state.roomTime;g.tick(90);assert.equal(g.state.roomTime,elapsed);assert.equal(g.save.solved.includes(room.gate.id),false);
  assert.match(g.document.querySelector('#overlay').innerHTML,/MATH GATE/);
 }
});

test('a completed UI response atomically credits one gate and continues the run',async()=>{
 const g=await game();g.save.settings.questionsPerGate=1;g.beginStage('tidal');
 const room=g.ROOMS.find(r=>r.stage==='tidal'&&r.gate);g.enterRoom(room.index);g.tick(20);
 const p=g.modules.questionsForGate(g.save,room.gate.id)[0];let continued=false;
 const ui=g.openMath(p,()=>{continued=true;},{gateId:room.gate.id,ordinal:1,total:1});
 const hearts=g.state.player.hearts;ui.submit(expectedAnswer(p));
 assert.equal(g.save.solved.includes(room.gate.id),true);
 assert.equal(g.save.answered.filter(id=>id===p.id).length,1);
 assert.equal(g.save.records.filter(r=>r.id===p.id).length,1);
 ui.submit(expectedAnswer(p));assert.equal(g.save.records.length,1);
 assert.equal(g.state.player.hearts,hearts);
 await new Promise(resolve=>setTimeout(resolve,700));
 assert.equal(continued,true);assert.equal(g.state.screen,'play');
 const loaded=await game({save:JSON.parse(g.storage.get(g.modules.SAVE_KEY))});
 assert.equal(loaded.save.solved.includes(room.gate.id),true);
});

test('fresh replay closes gates but preserves earned powers',async()=>{
 const g=await game();g.beginStage('garden');
 const stage=g.modules.stageFor('garden');
 for(const gate of stage.gates){g.save.answered.push(...g.modules.questionsForGate(g.save,gate).map(p=>p.id));g.modules.completeGate(g.save,gate);}
 g.modules.awardStage(g.save,'garden');assert.equal(g.modules.canEnterBoss(g.save,'garden'),true);
 g.beginStage('garden');assert.equal(g.modules.canEnterBoss(g.save,'garden'),false);assert.ok(g.save.weapons.includes('roller'));assert.equal(g.save.routes.garden.questionsPerGate,2);
});

test('all four advanced practice selections render a real task',async()=>{
 const g=await game();for(const band of ['tidal','garden','prism','fair']){g.save.settings.band=band;g.state.practiceCount=0;g.state.practiceSeed=0;g.nextPractice();assert.equal(g.state.screen,'math');assert.match(g.document.querySelector('#overlay').innerHTML,/PRACTICE RELAY/);}
});

test('new power test bay uses production projectiles and demonstrates every attack',async()=>{
 const g=await game();
 for(const id of Object.keys(g.modules.POWERS)){
  g.save.equipped=id;g.showPowerDemo();g.nodes.get('#demo-brake').click();
  if(id==='brake'){assert.ok(g.state.demoTrial.brake>0);continue;}
  g.tick(140);assert.ok(g.state.demoHits>0,`${id} should reach its demonstration target`);
 }
});

test('the city restoration epilogue requires all eight guardians',async()=>{
 const g=await game();g.beginStage('foundry');
 for(const s of g.modules.STAGES.slice(0,4))g.modules.awardStage(g.save,s.id);
 g.showResults();assert.doesNotMatch(g.document.querySelector('#overlay').innerHTML,/ALL EIGHT CIRCUITS RESTORED/);
 for(const s of g.modules.STAGES.slice(4))g.modules.awardStage(g.save,s.id);
 g.showResults();assert.match(g.document.querySelector('#overlay').innerHTML,/ALL EIGHT CIRCUITS RESTORED/);
});

test('gamepad navigation addresses the complete eight-card grid',async()=>{
 const pad={axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};
 const g=await game({pad});g.showStageSelect('foundry');
 pad.buttons[13].pressed=true;g.tick();
 assert.equal(g.document.activeElement.dataset.stage,'tidal');
 pad.buttons[13].pressed=false;g.tick();pad.buttons[15].pressed=true;g.tick();
 assert.equal(g.document.activeElement.dataset.stage,'garden');
});
