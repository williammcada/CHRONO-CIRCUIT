import {clamp,overlap} from './physics.js';
export const ENEMY_TYPES={
 beetle:{name:'Slag Beetle',w:19,h:16,hp:2,behavior:'patrol',speed:18,color:'#ef9b44'},
 drone:{name:'Furnace Drone',w:22,h:19,hp:2,behavior:'fly',speed:18,color:'#ff8b54'},
 turret:{name:'Rivet Turret',w:21,h:24,hp:3,behavior:'turret',speed:0,color:'#dbb877'},
 railbug:{name:'Railbug',w:23,h:18,hp:2,behavior:'charge',speed:18,color:'#e76b6b'},
 signalbot:{name:'Signal Bot',w:20,h:27,hp:3,behavior:'turret',speed:0,color:'#e79963'},
 ticketdrone:{name:'Ticket Drone',w:24,h:20,hp:2,behavior:'fly',speed:20,color:'#71d5e3'},
 gearling:{name:'Gearling',w:20,h:20,hp:2,behavior:'hop',speed:15,color:'#bd9bed'},
 bellguard:{name:'Bell Guard',w:25,h:26,hp:3,behavior:'fan',speed:0,color:'#e0b955'},
 chimebat:{name:'Chime Bat',w:27,h:20,hp:2,behavior:'swoop',speed:24,color:'#a98cda'},
 cloudcrab:{name:'Cloud Crab',w:26,h:17,hp:2,behavior:'patrol',speed:23,color:'#c2ecef'},
 stormorb:{name:'Storm Orb',w:23,h:25,hp:3,behavior:'fan',speed:0,color:'#63c3ef'},
 skimmer:{name:'Sky Skimmer',w:27,h:20,hp:2,behavior:'swoop',speed:26,color:'#67d7c7'},
 clamp_skater:{name:'Clamp Skater',w:26,h:18,hp:3,behavior:'clamp',speed:22,color:'#df7253'},
 wake_buoy:{name:'Wake Buoy',w:22,h:22,hp:2,behavior:'wake',speed:22,color:'#59bac4'},
 lamprey_drone:{name:'Lamprey Drone',w:28,h:18,hp:2,behavior:'waterfly',speed:20,color:'#9acecc'},
 seed_watcher:{name:'Seed Watcher',w:22,h:28,hp:3,behavior:'watch',speed:0,color:'#b5ce72'},
 root_weaver:{name:'Root Weaver',w:28,h:20,hp:3,behavior:'roots',speed:0,color:'#b7773e'},
 pollen_moth:{name:'Pollen Moth',w:26,h:19,hp:2,behavior:'pollen',speed:24,color:'#d4679c'},
 echo_scribe:{name:'Echo Scribe',w:24,h:26,hp:3,behavior:'record',speed:0,color:'#9b8cc4'},
 index_wisp:{name:'Index Wisp',w:20,h:24,hp:2,behavior:'beam',speed:0,color:'#e5e7f4'},
 prism_crawler:{name:'Prism Crawler',w:23,h:18,hp:2,behavior:'bridge',speed:24,color:'#ebbe62'},
 magnet_usher:{name:'Magnet Usher',w:23,h:29,hp:3,behavior:'magnet',speed:0,color:'#74d5dd'},
 fuse_juggler:{name:'Fuse Juggler',w:25,h:27,hp:3,behavior:'fuse',speed:0,color:'#cb425d'},
 ticket_runner:{name:'Ticket Runner',w:24,h:19,hp:2,behavior:'ticket',speed:24,color:'#f7ce43'},
};
export function createEnemy(spawn,index=0,room){
 const type=typeof spawn.type==='number'?['beetle','drone','turret'][spawn.type]:spawn.type;
 const def=ENEMY_TYPES[type];if(!def)throw Error(`Unknown enemy type ${type}`);
 const foot=spawn.foot??spawn.y+15;
 const body={...spawn,...def,type,y:foot-def.h,hp:def.hp,maxHp:def.hp,origin:spawn.x,originY:foot-def.h,foot,dir:index%2?1:-1,timer:1.7+index*.3,age:0,hitFlash:0,dead:false};
 const support=room?.platforms.find(p=>Math.abs(p.y-foot)<2&&spawn.x>=p.x&&spawn.x<p.x+p.w);
 body.supportId=spawn.supportId||support?.id;body.minX=Math.max(support?.x||0,spawn.x-30);body.maxX=Math.min((support? support.x+support.w:spawn.x+60)-body.w,spawn.x+30);
 return body;
}
export const enemyBounds=e=>({x:e.x-5,y:e.y-6,w:e.w+10,h:e.h+6});
export function makeBlaster(p){return {x:p.x+(p.facing>0?p.w+2:-2),y:p.y+18,vx:p.facing*230,vy:0,life:1.65,r:3,damage:1,kind:'blaster',age:0};}
// Sweep the projectile's full path this step; a fast projectile cannot skip a narrow target.
export function projectileHits(b,target,previous={x:b.x,y:b.y}){
 const r=b.r||3;return segmentIntersectsRect(previous.x,previous.y,b.x,b.y,{x:target.x-r,y:target.y-r,w:target.w+2*r,h:target.h+2*r});
}
export function segmentIntersectsRect(x1,y1,x2,y2,rect){
 let lo=0,hi=1;const dx=x2-x1,dy=y2-y1;
 for(const [a,d,min,max] of [[x1,dx,rect.x,rect.x+rect.w],[y1,dy,rect.y,rect.y+rect.h]]){
  if(Math.abs(d)<1e-9){if(a<min||a>max)return false;}
  else{let t0=(min-a)/d,t1=(max-a)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}
 }return true;
}
export function hitEnemy(e,damage=1){if(e.dead)return false;e.hp=Math.max(0,e.hp-damage);e.hitFlash=.16;if(e.hp===0){e.dead=true;if(e.clampedPlatform)e.clampedPlatform.clampedFor=0;}return true;}
export function stepEnemy(e,p,dt,assist=false,context={}){
 if(NEW_BEHAVIORS.has(e.behavior))return stepNewEnemy(e,p,dt,assist,context);
 if(e.dead)return [];e.age+=dt;e.timer-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);const shots=[];
 const travel=e.behavior==='charge'&&e.timer<.45?70:e.speed;
 if(['patrol','charge','hop'].includes(e.behavior)){
  e.x+=e.dir*travel*dt;
  if(e.x<=e.minX||e.x>=e.maxX){e.x=clamp(e.x,e.minX,e.maxX);e.dir*=-1;}
  if(e.behavior==='hop')e.y=e.originY-Math.max(0,Math.sin(e.age*3))*29;
 }else if(['fly','swoop'].includes(e.behavior)){
  e.x=e.origin+Math.sin(e.age*1.6)*23;
  e.y=e.originY+(e.behavior==='swoop'?Math.sin(e.age*2)*21:Math.sin(e.age*2.6)*11);
  e.dir=p.x<e.x?-1:1;
 }
 e.warning=e.timer<.6;
 if(e.timer<=0){
  e.timer=(e.behavior==='charge'?2.7:2.4)*(assist?1.35:1);
  if(e.behavior==='charge')e.dir=p.x<e.x?-1:1;
  if(['turret','fan','fly','swoop'].includes(e.behavior)){
   const dx=p.x+p.w/2-e.x-e.w/2,dy=p.y+16-e.y-e.h/2,angle=Math.atan2(dy,dx);
   for(const offset of e.behavior==='fan'?[-.24,0,.24]:[0])shots.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:Math.cos(angle+offset)*65,vy:Math.sin(angle+offset)*65,life:4,r:3});
  }
 }
 return shots;
}

const NEW_BEHAVIORS=new Set(['clamp','wake','waterfly','watch','roots','pollen','record','beam','bridge','magnet','fuse','ticket']);
const hostile=(e,p,speed=65)=>{const x=e.x+e.w/2,y=e.y+e.h/2,dx=p.x+p.w/2-x,dy=p.y+p.h/2-y,m=Math.hypot(dx,dy)||1;return {x,y,vx:dx/m*speed,vy:dy/m*speed,life:3.6,r:3};};
function patrol(e,dt,speed=e.speed){e.x+=e.dir*speed*dt;if(e.x<=e.minX||e.x>=e.maxX){e.x=clamp(e.x,e.minX,e.maxX);e.dir*=-1;}}
function stepNewEnemy(e,p,dt,assist,{room,platforms=[],waterY}){
 if(e.dead)return [];e.age+=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.action=e.action||'rest';e.markers=e.markers||[];const shots=[],scale=assist?1.3:1;
 if(e.behavior==='watch'&&e.timer<1.15&&Math.abs(p.vx||0)<2&&!(p.ladder&&Math.abs(p.vy)>0)){e.freezeTime=(e.freezeTime||0)+dt;if(e.freezeTime>1.1)e.timer-=dt;}
 else{e.timer-=dt;e.freezeTime=0;}
 e.warning=e.timer>0&&e.timer<1.05*scale;e.dir=p.x<e.x?-1:1;
 if(e.behavior==='clamp'){
  const support=platforms.find(s=>!s.hidden&&(s.moving||s.buoy)&&(s.id===e.supportId||(Math.abs(s.y-e.foot)<18&&e.x+e.w>s.x&&e.x<s.x+s.w)));
  if(support){e.supportId=support.id;e.y=support.y-e.h;e.foot=support.y;e.x=clamp(e.x+support.dx,support.x,support.x+support.w-e.w);}
  else patrol(e,dt);
  if(e.warning)e.markers=[{x:e.dir>0?e.x+e.w:e.x-28,y:e.y+e.h-7,w:28,h:7}];
  if(e.timer<=0){if(support){support.clampedFor=.85;e.clampedPlatform=support;}shots.push({x:e.dir>0?e.x+e.w:e.x-28,y:e.y+e.h-7,w:28,h:7,vx:0,vy:0,life:.5,kind:'zone',delay:.15});e.timer=3*scale;e.markers=[];}
 }else if(e.behavior==='wake'){
  patrol(e,dt);e.y=e.originY+Math.sin(e.age*2)*4;
  if(e.timer<=0){for(let i=0;i<3;i++)shots.push({x:e.x+e.w/2-e.dir*i*18,y:e.foot-5,w:12,h:5,vx:0,vy:0,life:1.45,delay:.35+i*.12,kind:'zone'});e.timer=3*scale;}
 }else if(e.behavior==='pollen'){
  if(e.swoopTime>0){e.swoopTime-=dt;e.x+=e.swoopVX*dt;e.y+=e.swoopVY*dt;if(e.swoopTime<=0){e.returnTime=.55;e.returnX=e.x;e.returnY=e.y;}}
  else if(e.returnTime>0){e.returnTime-=dt;const t=1-Math.max(0,e.returnTime)/.55;e.x=e.returnX+(e.origin-e.returnX)*t;e.y=e.returnY+(e.originY-e.returnY)*t;}
  else if(!e.warning){e.x=e.origin+Math.sin(e.age*1.7)*20;e.y=e.originY+Math.cos(e.age*1.7)*13;}
  if(e.warning&&!e.markers.length){e.lockX=p.x+p.w/2;e.lockY=p.y+p.h/2;e.markers=[{x:e.lockX-8,y:e.lockY-8,w:16,h:16}];}
  if(e.timer<=0){e.swoopTime=.65;e.swoopVX=clamp((e.lockX-e.x-e.w/2)/.65,-90,90);e.swoopVY=clamp((e.lockY-e.y-e.h/2)/.65,-65,65);e.timer=3.3*scale;e.markers=[];}
 }else if(e.behavior==='waterfly'){
  if(!e.warning){e.x=e.origin+Math.sin(e.age*1.4)*24;const tide=Number.isFinite(waterY)&&room?.tide?waterY-room.tide.low:0;e.y=e.originY+Math.sin(e.age*1.9)*14+clamp(tide,-24,24);}
  if(e.timer<=0){shots.push(hostile(e,p,72));e.timer=2.8*scale;}
 }else if(e.behavior==='watch'){
  if(e.warning)e.markers=[{x:e.dir>0?e.x+e.w:e.x-82,y:e.y+12,w:82,h:7}];
  if(e.timer<=0){shots.push(hostile(e,p,78));e.timer=3*scale;e.markers=[];}
 }else if(e.behavior==='roots'){
  const x=clamp(p.x-22,e.x-75,e.x+75),y=e.foot-9;
  if(e.warning&&!e.markers.length)e.markers=[{x,y,w:27,h:9},{x:x+e.dir*34,y,w:27,h:9}];
  if(e.timer<=0){for(let i=0;i<e.markers.length;i++)shots.push({...e.markers[i],vx:0,vy:0,life:.52+i*.5,delay:i*.5,kind:'zone'});e.timer=3.4*scale;e.markers=[];}
 }else if(e.behavior==='record'){
  if(e.warning){const count=Math.min(3,1+Math.floor((1.05*scale-e.timer)/(.34*scale)));while(e.markers.length<count)e.markers.push({x:p.x+p.w/2-7,y:p.y+7,w:14,h:14});}
  if(e.timer<=0){for(let i=0;i<e.markers.length;i++)shots.push({...e.markers[i],vx:0,vy:0,life:.45+i*.34,delay:i*.34,kind:'echo'});e.timer=3.6*scale;e.markers=[];}
 }else if(e.behavior==='beam'){
  if(e.warning&&!e.markers.length)e.markers=[{x:e.dir>0?e.x+e.w:e.x-100,y:e.y+12,w:100,h:6}];
  if(e.timer<=0){shots.push({...e.markers[0],vx:0,vy:0,life:.45,kind:'beam'});e.timer=3*scale;e.markers=[];}
 }else if(e.behavior==='bridge'){
  const supports=platforms.filter(s=>!s.hidden&&Math.abs(s.y-e.foot)<4&&s.x<=e.x+e.w&&s.x+s.w>=e.x);
  if(supports.length){const s=supports[0];e.minX=s.x;e.maxX=Math.max(s.x,s.x+s.w-e.w);e.y=s.y-e.h;patrol(e,dt);}
 }else if(e.behavior==='magnet'){
  const dx=e.x+e.w/2-(p.x+p.w/2),dy=e.y+e.h/2-(p.y+p.h/2);
  e.action=e.timer>0&&e.timer<1.05*scale?'field':'rest';
  if(e.action==='field'&&Math.abs(dx)<90&&Math.abs(dy)<48&&Math.abs(dx)>18){e.pullAge=(e.pullAge||0)+dt;p.magnetPush=(p.magnetPush||0)+Math.sign(dx)*48*Math.min(1,e.pullAge/.2);}else e.pullAge=0;
  if(e.timer<=0){e.cycle=(e.cycle||0)+1;e.timer=3.1*scale;e.markers=[];}
 }else if(e.behavior==='fuse'){
  if(e.timer<=0){for(let i=0;i<2;i++)shots.push({x:e.x+e.w/2,y:e.y+6,vx:e.dir*(48+i*22),vy:-112-i*12,gravity:420,life:2.4,fuse:1.65+i*.2,r:4,kind:'charge',bounces:0,blastRadius:15,destructible:true});e.timer=3.8*scale;}
 }else if(e.behavior==='ticket'){
  if(e.warning&&!e.lockDir)e.lockDir=e.dir;
  if(e.warning)e.markers=[{x:e.minX,y:e.foot-4,w:e.maxX-e.minX+e.w,h:4}];
  if(e.timer<=0){e.chargeTime=.65;e.timer=3.2*scale;e.markers=[];}
  if(e.chargeTime>0){e.chargeTime-=dt;e.dir=e.lockDir||1;patrol(e,dt,75);if(e.chargeTime<=0)e.lockDir=0;}else if(!e.warning)patrol(e,dt);
 }
 return shots;
}
export function drawEnemyTelegraph(ctx,e){
 if(e.dead)return;ctx.save();ctx.strokeStyle='#ffde8e';ctx.fillStyle='#ffcd6838';ctx.setLineDash([3,3]);
 for(const m of e.markers||[]){ctx.fillRect(m.x,m.y,m.w,m.h);ctx.strokeRect(m.x,m.y,m.w,m.h);if(m.field){ctx.setLineDash([]);for(let x=m.x+8;x<m.x+m.w;x+=18){ctx.beginPath();ctx.moveTo(x,m.y+m.h/2-4);ctx.lineTo(x+5*m.direction,m.y+m.h/2);ctx.lineTo(x,m.y+m.h/2+4);ctx.stroke();}}}
 ctx.restore();
}
