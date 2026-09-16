import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMY_TYPES,createEnemy,enemyBounds,makeBlaster,projectileHits,hitEnemy,stepEnemy} from '../public/combat.js';
import {createGuardian,stepGuardian,hitGuardian,WEAKNESSES,GUARDIAN_ATTACKS} from '../public/bosses.js';
import {activatePower,POWERS} from '../public/powers.js';
import {stepPlayerProjectiles,stepEnemyProjectiles,visibleLine} from '../public/projectile-system.js';
import {newPlayer,moveActor,createMachinery,updateMachinery,STEP,overlap} from '../public/physics.js';
import {ROOMS,stageFor} from '../public/stage-data.js';
const ground=[{id:'floor',x:0,y:151,w:320,h:29}];
const stateFor=(kind,enemyX=95)=>({player:{...newPlayer({x:30,y:122}),onGround:true},bullets:[],enemyShots:[],enemies:[createEnemy({type:'beetle',x:enemyX,foot:151},0,{platforms:ground})],platforms:ground,brake:0,powerCooldown:0,boss:null});
function shoot(kind,s){const save={weapons:[kind],equipped:kind,energy:8};assert.equal(activatePower(save,s),true);return save;}
for(const [kind,definition] of Object.entries(ENEMY_TYPES))test(`${kind} takes ordinary standing-height blaster damage`,()=>{
 const e=createEnemy({type:kind,x:80,foot:151},0,{platforms:ground}),b=makeBlaster({...newPlayer({x:35,y:122}),facing:1});let hit=false;
 for(let i=0;i<30;i++){const previous={x:b.x,y:b.y};b.x+=b.vx*STEP;if(projectileHits(b,enemyBounds(e),previous)){hit=hitEnemy(e);break;}}
 assert.ok(hit,kind);assert.equal(e.hp,definition.hp-1);
});
test('projectile sweep does not hit outside a diagonal path',()=>{assert.equal(projectileHits({x:30,y:30,r:1},{x:0,y:26,w:3,h:3},{x:0,y:0}),false);});
for(const [boss,weapon] of Object.entries(WEAKNESSES))test(`${boss} has ${weapon} weakness and remains blaster-damageable`,()=>{
 const b=createGuardian(boss);b.phase='recovery';b.hitCooldown=0;const initial=b.hp;assert.equal(hitGuardian(b,1),true);assert.equal(b.hp,initial-1);b.hitCooldown=0;assert.equal(hitGuardian(b,1,weapon),true);assert.equal(b.hp,initial-4);
});
test('learned Updraft Burst counter against Pendula remains valid',()=>{const b=createGuardian('pendula');b.phase='active';hitGuardian(b,2,'burst');assert.equal(b.hp,b.max-4);});
test('all eight power definitions activate with bounded energy',()=>{
 for(const kind of Object.keys(POWERS)){const s=stateFor(kind),save={weapons:[kind],equipped:kind,energy:2};assert.ok(activatePower(save,s),kind);assert.equal(save.energy,0);s.powerCooldown=0;assert.equal(activatePower(save,s),false);}
});
test('Depth Charge detonates after one bounce and hits a boss only once',()=>{
 const s=stateFor('depth');s.enemies=[];s.boss=createGuardian('facet');Object.assign(s.boss,{x:122,y:109,phase:'recovery',hitCooldown:0});shoot('depth',s);let bossHits=0,bounces=0;
 for(let i=0;i<65;i++){s.boss.hitCooldown=0;bossHits+=stepPlayerProjectiles(s,STEP).bossHits.length;bounces=Math.max(bounces,...s.bullets.map(b=>b.bounces||0));}
 assert.equal(bounces,1);assert.equal(bossHits,1);assert.equal(s.boss.hp,s.boss.max-5);
});
test('Depth Charge blast respects intervening solid walls',()=>{
 const s=stateFor('depth');s.enemies=[];s.boss=createGuardian('facet');Object.assign(s.boss,{x:108,y:111,phase:'recovery'});s.platforms=[...ground,{x:101,y:110,w:4,h:41}];
 s.bullets=[{x:96,y:135,vx:0,vy:0,r:5,life:.001,age:0,kind:'depth',damage:3,hits:new Set()}];
 assert.equal(stepPlayerProjectiles(s,STEP).bossHits.length,0);assert.equal(s.boss.hp,s.boss.max);
});
test('Bramble Roller falls at a ledge and hits a target once',()=>{
 const s=stateFor('roller',70);s.platforms=[{x:0,y:151,w:90,h:8}];s.enemies[0].hp=10;shoot('roller',s);let hits=0;
 for(let i=0;i<45;i++)hits+=stepPlayerProjectiles(s,STEP).enemyHits.length;
 assert.equal(hits,1);assert.ok(s.bullets[0].y>151);assert.equal(s.enemies[0].hp,8);
});
test('Prism Orbit cannot stack and accepts at most two boss hits per activation',()=>{
 const s=stateFor('orbit');s.enemies=[];s.boss=createGuardian('pendula');Object.assign(s.boss,{x:48,y:112,phase:'recovery',w:22,h:30});const save=shoot('orbit',s);s.powerCooldown=0;assert.equal(activatePower(save,s),false);let hits=0;
 for(let i=0;i<100;i++){s.boss.hitCooldown=0;hits+=stepPlayerProjectiles(s,STEP).bossHits.length;}
 assert.equal(hits,2);assert.equal(s.boss.hp,s.boss.max-8);assert.equal(s.player.invulnerable,0);
});
test('Arc Thread chains exactly once within a visible 48-pixel link',()=>{
 const s=stateFor('arc',80);s.enemies.push(createEnemy({type:'beetle',x:113,foot:151},1,{platforms:ground}),createEnemy({type:'beetle',x:142,foot:151},2,{platforms:ground}));shoot('arc',s);
 for(let i=0;i<20;i++)stepPlayerProjectiles(s,STEP);assert.equal(s.enemies.filter(e=>e.dead).length,2);assert.equal(s.enemies[2].hp,2);
});
test('Arc Thread cannot target through walls or chain behind one',()=>{
 const s=stateFor('arc',80);s.enemies.push(createEnemy({type:'beetle',x:120,foot:151},1,{platforms:ground}));s.platforms.push({x:110,y:90,w:6,h:61});shoot('arc',s);
 for(let i=0;i<20;i++)stepPlayerProjectiles(s,STEP);assert.equal(s.enemies[0].dead,true);assert.equal(s.enemies[1].dead,false);assert.equal(visibleLine({x:90,y:140},{x:125,y:140},s.platforms),false);
});
test('weakness windup interruptions have resistance instead of permanent stunlock',()=>{
 for(const [kind,weapon,attack] of [['brinejaw','arc',2],['jester','roller',0]]){
  const b=createGuardian(kind);Object.assign(b,{phase:'telegraph',attack,hitCooldown:0});hitGuardian(b,1,weapon);assert.equal(b.phase,'recovery');assert.ok(b.resistance>0);Object.assign(b,{phase:'telegraph',hitCooldown:0});hitGuardian(b,1,weapon);assert.equal(b.phase,'telegraph');
 }
});
test('firework fuse is delayed and the charge can be destroyed by a normal shot',()=>{
 const s=stateFor('blaster');s.enemies=[];s.enemyShots=[{x:83,y:140,vx:0,vy:0,r:4,life:2,kind:'charge',fuse:1,destructible:true}];s.bullets=[makeBlaster(s.player)];for(let i=0;i<20;i++)stepPlayerProjectiles(s,STEP);assert.equal(s.enemyShots[0].life,0);
 let hurts=0;s.enemyShots=[{x:30,y:122,w:14,h:29,life:1,delay:.5,kind:'zone',vx:0,vy:0}];for(let i=0;i<20;i++)stepEnemyProjectiles(s,STEP,{onPlayerHit:()=>hurts++});assert.equal(hurts,0);
});
test('each new enemy emits its distinct behavior without invalid projectile coordinates',()=>{
 const s=stateFor('blaster');for(const kind of Object.keys(ENEMY_TYPES).slice(12)){const e=createEnemy({type:kind,x:100,foot:151},0,{platforms:ground});let shots=[];for(let i=0;i<400;i++){s.player.vx=35;shots.push(...stepEnemy(e,s.player,STEP,false,{platforms:ground,room:{width:320,height:180}}));}assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.y),kind);for(const shot of shots)assert.ok(Number.isFinite(shot.x)&&Number.isFinite(shot.y),kind);}
});
