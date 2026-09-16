import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS,STAGES,GATE_IDS} from '../public/stage-data.js';
import {STEP,newPlayer,createMachinery,updateMachinery,moveActor,overlap,atExit} from '../public/physics.js';
import {initWorld,updateWorld,interactWorld,worldHazards,worldExit} from '../public/world-mechanisms.js';
const newRooms=ROOMS.filter(r=>['tidal','garden','prism','fair'].includes(r.stage));
function fixture(room,phase=0){
 const state={player:newPlayer(room.spawn),platforms:createMachinery(room,GATE_IDS)};
 initWorld(state,room,{[room.id]:{elapsed:phase,switches:{}}});return state;
}
function tick(state,room,held=new Map(),pressed=new Set()){
 updateMachinery(state.platforms,STEP);updateWorld(state,room,STEP);moveActor(state.player,STEP,state.platforms,room,held,pressed);
}
test('appended sector counts and every explicit exit point to the intended stage',()=>{
 assert.equal(STAGES.length,8);assert.equal(ROOMS.length,97);
 assert.deepEqual(STAGES.map(s=>s.end-s.start+1),[13,13,13,13,11,12,10,12]);
 assert.equal(ROOMS[0].id,'entry');assert.equal(ROOMS[12].id,'boss');assert.equal(ROOMS[51].id,'sky-boss');
 assert.equal(ROOMS[52].id,'tidal-quay');
 for(const r of newRooms){
  if(!r.boss)assert.ok(r.exits?.length,`${r.id} needs an explicit exit`);
  for(const exit of r.exits||[])assert.equal(ROOMS.find(t=>t.id===exit.target)?.stage,r.stage,`${r.id}: ${exit.target}`);
 }
});
test('original v0.6 geometry has no newly solid surfaces',()=>{
 for(const r of ROOMS.slice(0,52))for(const p of [...r.platforms,...r.moving])assert.equal(!!p.solid,false,r.id);
});
test('prism hub routes west before lens and east after returning, without bypassing gates',()=>{
 const r=ROOMS.find(r=>r.id==='prism-hall'),s=fixture(r);s.player.x=r.width-s.player.w;s.player.y=122;s.player.vx=105;
 assert.equal(worldExit(s,r,['prism_compare']).roomId,'prism-westbridge');
 assert.equal(worldExit(s,r,['prism_compare','prism_difference']).roomId,'prism-eastbridge');
 const ret=ROOMS.find(r=>r.id==='tidal-return'),t=fixture(ret);t.player.x=0;t.player.vx=-105;
 assert.equal(worldExit(t,ret,GATE_IDS).roomId,'tidal-floatways');
});
test('growth surfaces remain under an occupied rider, then fold safely after departure',()=>{
 const r=ROOMS.find(r=>r.id==='garden-stairs'),s=fixture(r,5);
 const leaf=s.platforms.find(p=>p.growth);s.player.onGround=true;s.player.groundId=leaf.id;s.player.x=leaf.x+10;s.player.y=leaf.y-s.player.h;
 updateWorld(s,r,0);assert.equal(leaf.hidden,false);assert.equal(leaf.growthWarning,true);
 s.player.groundId=null;s.player.onGround=false;updateWorld(s,r,0);assert.equal(leaf.hidden,true);
});
test('switch activation is local, persists on reload and changes real collision surfaces',()=>{
 const r=ROOMS.find(r=>r.id==='prism-weststacks'),memory={},s=fixture(r);
 initWorld(s,r,memory);assert.equal(s.platforms.find(p=>p.bridgeGroup).hidden,true);
 assert.equal(interactWorld(s,r),null);
 const pad=r.switches[0];s.player.x=pad.x-7;s.player.y=pad.y-s.player.h;
 assert.equal(interactWorld(s,r)?.enabled,true);assert.equal(s.platforms.find(p=>p.bridgeGroup).hidden,false);
 const reloaded=fixture(r);initWorld(reloaded,r,memory);assert.equal(reloaded.platforms.find(p=>p.bridgeGroup).hidden,false);
});
test('tide carries floating surfaces and water recovery does not cover dry refuges',()=>{
 const r=ROOMS.find(r=>r.id==='tidal-quay'),s=fixture(r),b=s.platforms.find(p=>p.buoy),before=b.y;
 updateWorld(s,r,4);assert.ok(b.y<before-15);
 const water=worldHazards(s,r).find(h=>h.recovery);assert.ok(water);
 assert.equal(overlap({...s.player,x:20,y:122},water),false);
 assert.ok(worldHazards(s,r).every(h=>h.type==='deepwater'||h.active));
});
test('Jester drum decks move only in recovery and stay fixed through attack tells',()=>{
 const r=ROOMS.find(r=>r.id==='fair-boss'),s=fixture(r),drum=s.platforms.find(p=>p.transitionDrum);
 s.boss={phase:'recovery'};updateWorld(s,r,.5);const moved=drum.y;assert.notEqual(moved,drum.baseY);
 s.boss.phase='telegraph';updateWorld(s,r,.5);assert.equal(drum.y,moved);
 s.boss.phase='active';updateWorld(s,r,.5);assert.equal(drum.y,moved);
});
test('solid side and ceiling collisions opt in; airborne magnetic pushes are bounded and consumed',()=>{
 const r={width:320,height:180,ladders:[],wind:[]},wall={id:'wall',x:90,y:50,w:20,h:100,solid:true,dx:0,dy:0};
 const p=newPlayer({x:75,y:80});p.vx=105;p.externalPush=999;
 moveActor(p,STEP,[wall],r,new Map([['right',true]]),new Set());assert.ok(p.x+p.w<=90);assert.equal(p.externalPush,0);
 const q=newPlayer({x:110,y:104});q.vy=-200;const roof={id:'roof',x:100,y:90,w:40,h:12,solid:true,dx:0,dy:0};
 moveActor(q,STEP,[roof],r,new Map([['jump',true]]),new Set());assert.ok(q.y>=102);assert.equal(q.vy,0);
});

for(const r of ROOMS.filter(r=>r.boss))test(`boss arena geometry and reachable refuges: ${r.id}`,()=>{
 const floor=r.platforms.find(p=>p.x===0&&p.w===r.width&&p.y===151);
 assert.ok(floor,`${r.id}: arena needs its continuous floor`);
 const raised=r.platforms.filter(p=>p.y<151);
 for(const side of [-1,1]){
  // Approach a side refuge on the permanent floor, jump onto it, then the next step.
  const s=fixture(r),candidates=raised.filter(p=>side<0?p.x+p.w/2<r.width/2:p.x+p.w/2>r.width/2).sort((a,b)=>b.y-a.y);
  for(const target of candidates){
   const x=target.x+target.w/2-s.player.w/2;
   if(s.player.onGround&&s.player.y+s.player.h<=target.y+1)continue;
   let jumped=false,landed=false;
   for(let frame=0;frame<800;frame++){
    const p=s.player,held=new Map([['jump',true]]),pressed=new Set();
    held.set('right',p.x<x-2);held.set('left',p.x>x+2);
    const support=s.platforms.find(v=>v.id===p.groundId);
    const edge=support&&((x>p.x&&p.x>=support.x+support.w-17)||(x<p.x&&p.x<=support.x+3));
    if(p.onGround&&!jumped&&(Math.abs(p.x-x)<22||edge)){pressed.add('jump');jumped=true;}
    tick(s,r,held,pressed);
    assert.ok(p.y+p.h<=r.height+5);
    if(p.onGround&&p.groundId===target.id){landed=true;break;}
   }
   assert.ok(landed,`${r.id}: ${side<0?'left':'right'} step at y=${target.y} unreachable`);
  }
 }
 // A basic shot's height from a top refuge still intersects each new boss body.
 const bossDimensions={tidal:{y:119,h:32},garden:{y:89,h:62},prism:{y:75,h:40},fair:{y:105,h:46}};
 if(bossDimensions[r.stage]){
  const b=bossDimensions[r.stage],shotYs=[151,...raised.map(p=>p.y)].map(y=>y-29+18);
  assert.ok(shotYs.some(y=>y>=b.y-3&&y<=b.y+b.h+3),`${r.id}: no normal firing elevation reaches body`);
 }
});

function drive(s,r,target,held,pressed){
 const p=s.player,direction=target>p.x+2?1:target<p.x-2?-1:0;
 held.set('right',direction>0);held.set('left',direction<0);
 if(!p.onGround)return;
 const support=s.platforms.find(v=>v.id===p.groundId&&!v.hidden);if(!support)return;
 if(direction<0){if(p.x<=support.x+3){held.set('jump',true);pressed.add('jump');}return;}
 if(direction>0&&support.x+support.w<r.width&&p.x>=support.x+support.w-16){
  const next=s.platforms.filter(v=>v.x>=support.x+support.w-4&&v.x>p.x&&v.y>=support.y-40).sort((a,b)=>a.x-b.x)[0];
  if(!next||next.hidden||support.y-next.y>32||next.x-(support.x+support.w)>45){held.set('right',false);return;}
  held.set('jump',true);pressed.add('jump');
 }
}

function traverseRoom(r,phase=0){
 const s=fixture(r,phase);let ladderIndex=0,exited=false;
 for(let frame=0;frame<18000;frame++){
  const p=s.player,held=new Map([['jump',true]]),pressed=new Set();
  assert.ok(p.y<r.height+25,`${r.id} fell at ${p.x.toFixed(1)}, feet ${(p.y+p.h).toFixed(1)}, t=${s.world.record.elapsed.toFixed(2)}`);
  for(const water of worldHazards(s,r).filter(h=>h.recovery))assert.equal(overlap(p,water),false,`${r.id} water contacts route at x=${p.x.toFixed(1)},feet=${(p.y+p.h).toFixed(1)}`);
  for(const sw of r.switches||[])if(!s.world.record.switches[sw.group]&&Math.abs(p.x+7-sw.x)<32)interactWorld(s,r);
  const l=r.ladders[ladderIndex];
  // Optional short branches over a full floor do not replace the basic route.
  if(l&&(r.height>180||(r.id==='finale'&&p.x>515))){
   if(p.onGround&&p.y+p.h<=l.y+1)ladderIndex++;
   const next=r.ladders[ladderIndex];
   if(next){const x=next.x+(next.w-p.w)/2;if(p.ladder||Math.abs(p.x-x)<7){held.set('up',true);held.set('jump',false);}else drive(s,r,x,held,pressed);}
   else drive(s,r,r.width,held,pressed);
  }else drive(s,r,r.exitSide==='left'?-20:r.width,held,pressed);
  tick(s,r,held,pressed);
  if(worldExit(s,r,GATE_IDS)||!r.exits&&atExit(s.player,r)){exited=true;break;}
 }
 assert.ok(exited,`${r.id} stopped x=${s.player.x.toFixed(1)}, feet=${(s.player.y+s.player.h).toFixed(1)}, ladder=${ladderIndex}`);
}
for(const r of ROOMS.filter(r=>!r.boss))test(`single-jump production traversal: ${r.id}`,()=>traverseRoom(r));
for(const r of newRooms.filter(r=>r.tide?.pools.length))test(`safe tide traversal at saved mechanism phases: ${r.id}`,()=>{
 for(const phase of [1.5,3.5,6])traverseRoom(r,phase);
});
