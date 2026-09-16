import assert from 'node:assert/strict';
import {GATE_IDS} from '../public/stage-data.js';
import {STEP,newPlayer,createMachinery,updateMachinery,moveActor,overlap,atExit} from '../public/physics.js';
import {initWorld,updateWorld,interactWorld,worldHazards,worldExit} from '../public/world-mechanisms.js';
function fixture(room,phase=0){
 const state={player:newPlayer(room.spawn),platforms:createMachinery(room,GATE_IDS)};
 initWorld(state,room,{[room.id]:{elapsed:phase,switches:{}}});return state;
}
function tick(state,room,held=new Map(),pressed=new Set()){
 updateMachinery(state.platforms,STEP);updateWorld(state,room,STEP);moveActor(state.player,STEP,state.platforms,room,held,pressed);
}
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

export function routeTrace(r,phase=0){
 const s=fixture(r,phase),trace=[];let ladderIndex=0,exited=false;
 for(let frame=0;frame<18000;frame++){
  const p=s.player,held=new Map([['jump',true]]),pressed=new Set();
  if(frame%6===0)trace.push({player:structuredClone(p),elapsed:s.world.record.elapsed,switches:{...s.world.record.switches}});
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
 assert.ok(exited,`${r.id} route trace must reach its exit`);return trace;
}
