import test from 'node:test';
import assert from 'node:assert/strict';
import {createGuardian,stepGuardian} from '../public/bosses.js';
import {makeBlaster} from '../public/combat.js';
import {stepEnemyProjectiles,stepPlayerProjectiles} from '../public/projectile-system.js';
import {newPlayer,moveActor,createMachinery,updateMachinery,STEP,overlap} from '../public/physics.js';
import {ROOMS,stageFor} from '../public/stage-data.js';
const additions=[['brinejaw','tidal'],['floravel','garden'],['facet','prism'],['jester','fair']];
function encounter(kind,stage,x=30){
 const room=ROOMS[stageFor(stage).end],platforms=createMachinery(room,[]),player={...newPlayer({x,y:122}),onGround:true,groundId:platforms[0].id};
 return {room,platforms,player,boss:createGuardian(kind),bullets:[],enemies:[],enemyShots:[]};
}
for(const [kind,stage] of additions)for(const attack of [0,1,2])for(const side of [-1,1])for(const assist of [false,true]){
 test(`${kind} attack ${attack+1} has a damage-free ${side<0?'left':'right'} response with assist ${assist?'on':'off'}`,()=>{
  const s=encounter(kind,stage,side<0?30:276),{room,platforms,player:p,boss:b}=s;
  Object.assign(b,{timer:0,cycle:attack,x:side<0?238-b.w/2:40});stepGuardian(b,p,STEP,assist);
  const jump=(kind==='brinejaw'&&attack!==1)||(kind==='floravel'&&attack!==1)||(kind==='facet'&&attack!==2)||(kind==='jester'&&attack===1);
  const leave=(kind==='brinejaw'&&attack===1)||(kind==='facet'&&attack===2)||(kind==='jester'&&attack===0);
  let hits=0,active=false;
  for(let i=0;i<260;i++){
   const direction=leave?(side<0?(p.x<141?1:0):(p.x>165?-1:0)):0;
   updateMachinery(platforms,STEP);moveActor(p,STEP,platforms,room,new Map([['left',direction<0],['right',direction>0],['jump',jump]]),new Set(jump&&i===0?['jump']:[]));
   s.enemyShots.push(...stepGuardian(b,p,STEP,assist));stepEnemyProjectiles(s,STEP,{room,onPlayerHit:()=>hits++});
   if(overlap(p,b))hits++;for(const d of b.drops)if(d.active&&overlap(d,p))hits++;
   active||=b.phase==='active';if(active&&b.phase==='recovery'&&b.timer<.1)break;
  }
  assert.ok(active);assert.equal(hits,0);
 });
}
for(const [kind,stage] of additions)test(`${kind} can be defeated with normal running, jumping and the basic blaster`,()=>{
 const s=encounter(kind,stage,24),{room,platforms,player:p,boss:b}=s;let hits=0,hurtCooldown=0,shotCooldown=0,last='',target=24,jump=false,drop=false;
 const hurt=()=>{if(hurtCooldown<=0){hits++;hurtCooldown=1;p.vy=-100;}};
 for(let i=0;i<7200&&b.hp>0;i++){
  hurtCooldown-=STEP;shotCooldown-=STEP;const pressed=new Set(),key=b.cycle+':'+b.phase+':'+b.followup;
  if(b.phase==='telegraph'&&key!==last){
   last=key;jump=(kind==='brinejaw'&&b.attack!==1)||(kind==='floravel'&&b.attack!==1&&!b.clapHigh)||(kind==='facet'&&b.attack===0)||(kind==='jester'&&b.attack===1);drop=kind==='floravel'&&b.attack===2&&b.clapHigh;
   const leave=(kind==='brinejaw'&&b.attack===1)||(kind==='facet'&&b.attack!==0)||(kind==='jester'&&b.attack===0);if(leave)target=b.lockX<160?290:24;if(jump||drop)pressed.add('jump');
  }
  let direction=Math.abs(p.x-target)<2?0:p.x<target?1:-1;
  if(direction===0)direction=p.x<b.x?1:-1;
  updateMachinery(platforms,STEP);moveActor(p,STEP,platforms,room,new Map([['left',direction<0],['right',direction>0],['jump',jump||drop],['down',drop]]),pressed);
  if(shotCooldown<=0){s.bullets.push(makeBlaster(p));shotCooldown=.28;}
  stepPlayerProjectiles(s,STEP);s.enemyShots.push(...stepGuardian(b,p,STEP));stepEnemyProjectiles(s,STEP,{room,onPlayerHit:hurt});
  if(b.phase!=='intro'&&overlap(p,b))hurt();for(const d of b.drops)if(d.active&&overlap(d,p))hurt();
 }
 assert.equal(b.hp,0);assert.ok(hits<5,`Victory requires ${hits} hearts`);
});
test('Floravel phase-two high clap leaves the permanent floor safe',()=>{
 for(const x of [24,290]){const s=encounter('floravel','garden',x),b=s.boss;b.hp=10;b.cycle=5;b.timer=0;stepGuardian(b,s.player,STEP);assert.equal(b.clapHigh,true);for(let i=0;i<130;i++){stepGuardian(b,s.player,STEP);for(const d of b.drops)assert.ok(!d.active||!overlap(d,s.player));}}
});
test('phase-two Brinejaw and Facet followups receive fresh independent tells',()=>{
 for(const [kind,stage] of additions.filter(([k])=>['brinejaw','facet'].includes(k))){const s=encounter(kind,stage),b=s.boss;b.hp=10;b.cycle=1;b.timer=0;stepGuardian(b,s.player,STEP);let oldLock=b.lockX,sawRecovery=false,sawFollowup=false;
  for(let i=0;i<400;i++){if(b.phase==='recovery'){sawRecovery=true;s.player.x=260;}stepGuardian(b,s.player,STEP);if(sawRecovery&&b.phase==='telegraph'&&b.followup){assert.ok(b.timer>.7);assert.notEqual(b.lockX,oldLock);sawFollowup=true;break;}}
  assert.ok(sawFollowup,kind);
 }
});

for(const [kind,stage] of [['pendula','foundry'],['railox','metro'],['ricochet','tower'],['vesper','sky']])test(`${kind} original encounter remains beatable with the blaster after projectile changes`,()=>{
 const s=encounter(kind,stage,24),{room,platforms,player:p,boss:b}=s;let hits=0,hurtCooldown=0,shotCooldown=0,last='',target=24,climb=0;
 const hurt=()=>{if(hurtCooldown<=0){hits++;hurtCooldown=1;p.vy=-100;}};
 for(let i=0;i<7200&&b.hp>0;i++){
  hurtCooldown-=STEP;shotCooldown-=STEP;const pressed=new Set(),key=b.cycle+':'+b.phase;let direction=0,jump=false,drop=false;
  const pulse=s.enemyShots.some(shot=>shot.y>105&&Math.abs(shot.x-p.x)<48&&(shot.x-p.x)*shot.vx<0);
  if(kind==='railox'){
   const leap=b.attack===1&&['telegraph','active'].includes(b.phase);
   if(p.onGround&&p.y+p.h>145)climb=0;if(p.onGround&&p.y+p.h<=126)climb=1;if(p.onGround&&p.y+p.h<=99)climb=2;
   if(leap){target=155;drop=p.onGround&&p.y+p.h<145;}else target=climb===0?49:104;
   direction=Math.abs(p.x-target)<2?0:p.x<target?1:-1;
   if(!leap&&p.onGround&&((climb===0&&Math.abs(p.x-49)<4)||climb===1))jump=true;if(pulse&&p.onGround)jump=true;
  }else if(kind==='vesper'){
   if(b.phase==='telegraph'&&key!==last){last=key;target=b.attack===0?24:b.attack===1?(b.lockX<160?280:24):145;}
   direction=Math.abs(p.x-target)<2?0:p.x<target?1:-1;if(pulse&&p.onGround)jump=true;
  }else{direction=p.x<145?1:p.x>166?-1:0;if(pulse&&p.onGround)jump=true;}
  if((jump||drop)&&p.onGround)pressed.add('jump');if(direction===0)direction=p.x<b.x?1:-1;
  updateMachinery(platforms,STEP);moveActor(p,STEP,platforms,room,new Map([['left',direction<0],['right',direction>0],['jump',jump||drop||p.vy<0],['down',drop]]),pressed);
  if(shotCooldown<=0){s.bullets.push(makeBlaster(p));shotCooldown=.28;}
  stepPlayerProjectiles(s,STEP);s.enemyShots.push(...stepGuardian(b,p,STEP));stepEnemyProjectiles(s,STEP,{room,onPlayerHit:hurt});
  if(b.phase!=='intro'&&overlap(p,b))hurt();for(const d of b.drops)if(d.active&&overlap(d,p))hurt();
 }
 assert.equal(b.hp,0);assert.ok(hits<5,`${kind} victory costs ${hits} hearts`);if(kind==='railox')assert.equal(hits,0);
});
for(const attack of [0,1,2])for(const side of [-1,1])for(const assist of [false,true])test(`Railox attack ${attack+1} keeps a damage-free ${side<0?'left':'right'} ledge dodge with assist ${assist}`,()=>{
 const s=encounter('railox','metro',side<0?30:276),{room,platforms,player:p,boss:b}=s;Object.assign(b,{timer:0,cycle:attack,x:side<0?248:24});stepGuardian(b,p,STEP,assist);let hits=0,active=false,climb=0;
 for(let i=0;i<360;i++){
  const leap=attack===1,low=side<0?49:271,high=side<0?104:214;
  if(p.onGround&&p.y+p.h<=126)climb=1;if(p.onGround&&p.y+p.h<=99)climb=2;
  const target=leap?155:climb===0?low:high,direction=Math.abs(p.x-target)<2?0:p.x<target?1:-1;
  let jump=!leap&&p.onGround&&((climb===0&&Math.abs(p.x-low)<4)||climb===1);
  const pulse=s.enemyShots.some(shot=>shot.y>105&&Math.abs(shot.x-p.x)<48&&(shot.x-p.x)*shot.vx<0);if(pulse&&p.onGround)jump=true;
  updateMachinery(platforms,STEP);moveActor(p,STEP,platforms,room,new Map([['left',direction<0],['right',direction>0],['jump',jump||p.vy<0]]),new Set(jump?['jump']:[]));
  s.enemyShots.push(...stepGuardian(b,p,STEP,assist));stepEnemyProjectiles(s,STEP,{room,onPlayerHit:()=>hits++});if(overlap(p,b))hits++;
  active||=b.phase==='active';if(active&&b.phase==='recovery'&&b.timer<.1)break;
 }
 assert.ok(active);assert.equal(hits,0);
});
