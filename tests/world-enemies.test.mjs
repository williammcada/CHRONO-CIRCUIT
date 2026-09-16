import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS,GATE_IDS} from '../public/stage-data.js';
import {STEP,createMachinery,updateMachinery,moveActor,overlap} from '../public/physics.js';
import {createEnemy,makeBlaster,stepEnemy,hitEnemy} from '../public/combat.js';
import {stepPlayerProjectiles} from '../public/projectile-system.js';
import {initWorld,updateWorld,worldHazards} from '../public/world-mechanisms.js';
import {routeTrace} from './world-route-harness.mjs';

// Firing origins come only from an actual run/jump/ladder traversal. No synthetic
// height offset is inserted to make a misplaced enemy conveniently hittable.
for(const room of ROOMS.filter(r=>r.enemies.length))test(`every placed enemy has a reachable basic-blaster firing origin: ${room.id}`,()=>{
 const trace=routeTrace(room);
 for(let index=0;index<room.enemies.length;index++){
  const spawn=room.enemies[index],original=createEnemy(spawn,index,room),seen=new Set();
  const candidates=trace.filter(c=>{
   const p=c.player,key=`${Math.round(p.x/12)}/${Math.round(p.y/10)}`;
   if(seen.has(key)||overlap(p,original)||Math.abs(p.x-original.x)>200)return false;
   seen.add(key);return true;
  }).sort((a,b)=>Math.hypot(a.player.x-original.x,a.player.y-original.y)-Math.hypot(b.player.x-original.x,b.player.y-original.y)).slice(0,30);
  let damaged=false,origin;
  for(const candidate of candidates){
   const enemy=createEnemy(spawn,index,room),state={player:structuredClone(candidate.player),platforms:createMachinery(room,GATE_IDS),enemies:[enemy],bullets:[],enemyShots:[],weaponEffects:[],brake:0,roomWidth:room.width};
   updateMachinery(state.platforms,candidate.elapsed);
   initWorld(state,room,{[room.id]:{elapsed:candidate.elapsed,switches:{...candidate.switches}}});
   for(let frame=0;frame<600;frame++){
    const p=state.player;
    updateMachinery(state.platforms,STEP);updateWorld(state,room,STEP);
    moveActor(p,STEP,state.platforms,room,new Map([['jump',true]]),new Set());
    if(p.y>room.height||worldHazards(state,room).some(h=>h.recovery&&overlap(h,p)))break;
    p.facing=enemy.x+enemy.w/2>=p.x+p.w/2?1:-1;
    if(p.shotCooldown<=0){state.bullets.push(makeBlaster(p));p.shotCooldown=.28;}
    state.enemyShots.push(...stepEnemy(enemy,p,STEP,true,{room,platforms:state.platforms,waterY:state.world.waterY}));
    stepPlayerProjectiles(state,STEP,{room,platforms:state.platforms});
    // This test isolates actual placement damageability; dodging hostile shots
    // and full combat survival are covered separately by the combat suite.
    state.enemyShots=[];
    if(enemy.dead){damaged=true;origin=candidate.player;break;}
   }
   if(damaged)break;
  }
  assert.ok(damaged,`${room.id}/${spawn.id}/${original.type}: no lethal basic-blaster sequence from ${candidates.length} real route positions`);
  assert.ok(Number.isFinite(origin.x)&&Number.isFinite(origin.y));
 }
});

test('a placed clamp rides a real tide buoy and releases its mechanism when defeated',()=>{
 const room=ROOMS.find(r=>r.id==='tidal-quay'),spawn=room.enemies.find(e=>e.type==='clamp_skater');
 const enemy=createEnemy(spawn,0,room),state={player:{x:100,y:122,w:14,h:29,vx:0},platforms:createMachinery(room,GATE_IDS)};
 initWorld(state,room,{});const support=state.platforms.find(p=>p.id===spawn.supportId);assert.ok(support?.buoy);
 let released=false;
 for(let i=0;i<180;i++){
  updateMachinery(state.platforms,STEP);updateWorld(state,room,STEP);
  stepEnemy(enemy,state.player,STEP,true,{room,platforms:state.platforms,waterY:state.world.waterY});
  assert.ok(Math.abs(enemy.y+enemy.h-support.y)<.01,'clamp feet must stay registered to the tide surface');
  if(support.clampedFor>0){hitEnemy(enemy,enemy.hp);assert.equal(support.clampedFor,0);released=true;break;}
 }
 assert.ok(enemy.clampedPlatform===support);
 assert.ok(released,'defeating an active clamp must release its moving surface');
});
