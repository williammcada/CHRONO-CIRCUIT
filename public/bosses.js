import {clamp} from './physics.js';
export const ATTACK_NAMES=['ARC SWING','ANCHOR LEAP','WEIGHT DROP'];
export function createPendula(){return {x:250,y:103,w:40,h:48,hp:20,max:20,phase:'intro',timer:1.2,elapsed:0,attack:-1,cycle:0,fromX:250,targetX:25,hitCooldown:0,defeated:false,drops:[],warning:0,vulnerable:0,desperation:false};}
function beginAttack(b,p,assist,forced){
 b.attack=forced??(b.cycle++%3);b.phase='telegraph';b.timer=assist?.95:.7;b.elapsed=0;b.fromX=b.x;b.targetX=b.x>140?28:250;
 b.warning=b.timer;b.desperation=b.hp<=7;
 if(b.attack===2){const safe=clamp(Math.floor((p.x+p.w/2)/106),0,2);b.drops=[0,1,2].filter(l=>l!==safe).map(l=>({x:l*106+43,y:18,w:20,h:26,vy:0,active:false}));}
}
// The controller has no reference to question UI. Its only events are projectiles.
export function stepPendula(b,p,dt,assist=false){
 if(b.defeated)return [];
 const shots=[];b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.timer-=dt;b.elapsed+=dt;
 b.warning=b.phase==='telegraph'?Math.max(0,b.timer):0;b.vulnerable=b.phase==='recovery'?Math.max(0,b.timer):0;
 if(b.phase==='intro'&&b.timer<=0)beginAttack(b,p,assist);
 else if(b.phase==='telegraph'&&b.timer<=0){b.phase='active';b.elapsed=0;b.timer=b.attack===0?2.4:b.attack===1?1.8:1.7;}
 else if(b.phase==='active'){
  const duration=b.attack===0?2.4:b.attack===1?1.8:1.7;
  const t=clamp(b.elapsed/duration,0,1);
  if(b.attack<2){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=103-Math.sin(t*Math.PI)*(b.attack===0?66:54);}
  else{b.y=103;for(const d of b.drops){d.active=true;d.vy+=360*dt;d.y+=d.vy*dt;}}
  if(b.timer<=0){
   b.y=103;if(b.attack<2)b.x=b.targetX;
   if(b.attack===1)for(const direction of [-1,1])shots.push({x:b.x+b.w/2,y:146,vx:direction*85,vy:0,life:3,w:10,h:7});
   if(b.desperation&&b.attack===0){beginAttack(b,p,assist,2);b.timer=assist?.8:.65;b.warning=b.timer;}
   else{b.phase='recovery';b.timer=assist?1.8:1.3;b.elapsed=0;b.vulnerable=b.timer;b.drops=[];}
  }
 }else if(b.phase==='recovery'&&b.timer<=0)beginAttack(b,p,assist);
 return shots;
}
export function hitPendula(b,damage=1){
 if(b.defeated||b.phase==='intro'||b.hitCooldown>0)return false;
 b.hp=Math.max(0,b.hp-damage);b.hitCooldown=.24;return true;
}

export const GUARDIAN_ATTACKS={pendula:ATTACK_NAMES,railox:['RED-LINE CHARGE','EXPRESS LEAP','RAIL STOMP'],ricochet:['WALL LEAP','TRIPLE REBOUND','ECHO DISCS'],vesper:['CLOUD SWEEP','LOCKED DIVE','FEATHER FAN'],brinejaw:['ANCHOR RAKE','BALLAST DROP','SLUICE FAN'],floravel:['VINE SWEEP','SEED RAIN','LEAF CLAP'],facet:['SHUTTER SWEEP','DELAYED REFLECTION','PRISM DESCENT'],jester:['SPRING STAMP','BATON CIRCUIT','FIREWORK TOSS']};
export const WEAKNESSES={pendula:'orbit',railox:'brake',ricochet:'lance',vesper:'disc',floravel:'burst',jester:'roller',brinejaw:'arc',facet:'depth'};
export const SECONDARY_WEAKNESSES={pendula:['burst']};
export function createGuardian(kind='pendula'){
 if(kind==='pendula')return {...createPendula(),kind};
 if(NEW_GUARDIANS[kind])return createNewGuardian(kind);
 const w=kind==='railox'?44:kind==='ricochet'?36:46,h=kind==='vesper'?38:48;
 return {kind,x:248,y:kind==='vesper'?46:151-h,w,h,hp:22,max:22,phase:'intro',timer:kind==='railox'?2.4:1.2,elapsed:0,age:0,attack:-1,cycle:0,fromX:248,targetX:24,hitCooldown:0,defeated:false,drops:[],warning:0,vulnerable:0};
}
function beginGuardianAttack(b,p,assist){
 b.attack=b.cycle++%3;b.phase='telegraph';b.timer=b.kind==='railox'?(assist?1.8:1.4):(assist?1.05:.8);b.elapsed=0;b.fromX=b.x;b.fromY=b.y;b.targetX=b.x>140?24:250-b.w+40;
 b.lockX=clamp(p.x-8,14,306-b.w);b.warning=b.timer;
}
const bossShot=(x,y,vx,vy=0,kind='orb')=>({x,y,vx,vy,life:4,r:4,kind,w:9,h:8});
export function stepGuardian(b,p,dt,assist=false){
 if(b.kind==='pendula')return stepPendula(b,p,dt,assist);
 if(NEW_GUARDIANS[b.kind])return stepNewGuardian(b,p,dt,assist);
 if(b.defeated)return [];
 const shots=[];b.age+=dt;b.elapsed+=dt;b.timer-=dt;b.hitCooldown=Math.max(0,b.hitCooldown-dt);
 b.warning=b.phase==='telegraph'?Math.max(0,b.timer):0;
 if(b.phase==='intro'&&b.timer<=0)beginGuardianAttack(b,p,assist);
 else if(b.phase==='telegraph'&&b.timer<=0){
  b.phase='active';b.elapsed=0;b.duration=b.kind==='railox'?[1.5,1.8,.9][b.attack]:b.kind==='ricochet'?[1.5,2.4,1.1][b.attack]:[2.1,1.3,1.1][b.attack];b.timer=b.duration;
  if(b.attack===2){
   if(b.kind==='ricochet')for(const vy of [-28,0,28])shots.push(bossShot(b.x+b.w/2,b.y+24,p.x>b.x?92:-92,vy,'disc'));
   if(b.kind==='vesper')for(const vx of [-75,-35,0,35,75])shots.push(bossShot(b.x+b.w/2,b.y+b.h,vx,72,'feather'));
  }
 }else if(b.phase==='active'){
  const t=clamp(b.elapsed/b.duration,0,1),floor=151-b.h;
  if(b.kind==='railox'){
   if(b.attack<2){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=floor-(b.attack===1?Math.sin(t*Math.PI)*65:0);}
   else b.y=floor-Math.sin(t*Math.PI)*26;
  }else if(b.kind==='ricochet'){
   if(b.attack===0){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=floor-Math.sin(t*Math.PI)*72;}
   if(b.attack===1){const segment=Math.min(2,Math.floor(t*3)),u=t===1?1:t*3-segment;const right=(b.fromX<150)===!!(segment%2===0);b.x=right?20+244*u:264-244*u;b.y=floor-Math.sin(u*Math.PI)*65;}
  }else{
   if(b.attack===0){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=45+Math.sin(t*Math.PI)*(floor-45);}
   if(b.attack===1){b.x=b.fromX+(b.lockX-b.fromX)*t;b.y=b.fromY+(floor-b.fromY)*Math.min(1,t*1.35);}
  }
  if(b.timer<=0){
   b.y=floor;
   if(b.kind==='railox'&&b.attack!==0)for(const d of [-1,1])shots.push(bossShot(b.x+b.w/2,146,d*83,0,'pulse'));
   b.phase='recovery';b.timer=assist?2:1.5;b.elapsed=0;b.vulnerable=b.timer;
  }
 }else if(b.phase==='recovery'&&b.timer<=0){
  if(b.kind==='vesper'){b.y=45;b.x=b.x>150?246:26;}
  beginGuardianAttack(b,p,assist);
 }
 return shots;
}
export function hitGuardian(b,damage=1,weapon='blaster',braked=false){
 const bonus=weapon===WEAKNESSES[b.kind]||SECONDARY_WEAKNESSES[b.kind]?.includes(weapon)||(b.kind==='railox'&&braked);
 const accepted=hitPendula(b,damage+(bonus?2:0));
 if(accepted&&bonus&&!(b.resistance>0)){
  const interrupt=(b.kind==='brinejaw'&&weapon==='arc'&&b.attack===2)||(b.kind==='jester'&&weapon==='roller'&&b.attack===0);
  if(interrupt&&b.phase==='telegraph'){b.phase='recovery';b.timer=1.05;b.elapsed=0;b.drops=[];b.warning=0;b.resistance=3.5;b.reaction='interrupted';}
  if(b.kind==='floravel'&&weapon==='burst'&&b.attack===1&&b.phase==='telegraph'){b.drops.pop();b.resistance=3.5;b.reaction='pod-broken';}
  if(b.kind==='facet'&&weapon==='depth'){b.panelOpen=1.8;b.resistance=3.5;b.reaction='shutter-open';if(b.phase==='recovery')b.timer=Math.max(b.timer,1.8);}
 }
 return accepted;
}

const NEW_GUARDIANS={brinejaw:{w:48,h:32,hp:26},floravel:{w:34,h:62,hp:26},facet:{w:36,h:40,hp:24},jester:{w:32,h:46,hp:26}};
function createNewGuardian(kind){
 const d=NEW_GUARDIANS[kind];return {kind,...d,max:d.hp,x:kind==='floravel'?224:246-d.w/2,y:kind==='facet'?79:151-d.h,phase:'intro',timer:1.8,elapsed:0,age:0,attack:-1,cycle:0,hitCooldown:0,resistance:0,panelOpen:0,warning:0,drops:[],defeated:false};
}
function beginNewAttack(b,p,assist,forced){
 b.attack=forced??(b.cycle++%3);b.phase='telegraph';b.timer=(assist?1.35:1.05);b.elapsed=0;b.fromX=b.x;b.fromY=b.y;b.warning=b.timer;b.sent=0;b.desperation=b.hp<=b.max/2;b.drops=[];b.reaction=null;
 b.lockX=clamp(p.x+p.w/2,22,298);b.lockY=clamp(p.y+p.h/2,20,139);b.targetX=clamp(b.lockX-b.w/2,16,304-b.w);b.safeLane=clamp(Math.floor(b.lockX/80),0,3);
 if(b.kind==='brinejaw'){
  if(b.attack===0)b.drops=[{x:b.x<150?b.x+b.w:20,y:141,w:b.x<150?280-b.x-b.w:b.x-20,h:10,active:false}];
  if(b.attack===1)b.drops=[{x:b.targetX-6,y:116,w:b.w+12,h:35,active:false,landing:true}];
  if(b.attack===2)b.drops=[{x:18,y:135,w:284,h:8,active:false,lane:true}];
 }else if(b.kind==='floravel'){
  if(b.attack===0){const left=b.lockX<160;b.drops=[{x:left?18:174,y:140,w:128,h:11,active:false}];}
  if(b.attack===1)b.drops=[0,1,2,3].filter(i=>i!==b.safeLane).map(i=>({x:i*80+20,y:18,w:30,h:22,vy:0,active:false,falling:true,shadowY:151}));
  if(b.attack===2){b.clapHigh=b.desperation&&b.cycle%2===0;b.drops=[{x:18,y:b.clapHigh?97:137,w:284,h:10,active:false}];}
 }else if(b.kind==='facet'){
  if(b.attack===0)b.drops=[{x:b.lockX<160?18:174,y:136,w:128,h:9,active:false}];
  if(b.attack===1)b.drops=[{x:b.lockX-10,y:b.lockY-10,w:20,h:20,active:false,marker:true}];
  if(b.attack===2)b.drops=[{x:b.targetX-5,y:112,w:b.w+10,h:39,active:false,landing:true}];
 }else{
  if(b.attack===0)b.drops=[{x:b.targetX-7,y:129,w:b.w+14,h:22,active:false,landing:true}];
  if(b.attack===1)b.drops=[{x:b.desperation?214:76,y:94,w:30,h:11,active:false,drum:true},{x:b.desperation?76:214,y:94,w:30,h:11,active:false,drum:true}];
  if(b.attack===2){b.safeLane=clamp(Math.floor(b.lockX/106),0,2);b.drops=[0,1,2].filter(i=>i!==b.safeLane).map(i=>({x:i*106+34,y:130,w:38,h:21,active:false,landing:true}));}
 }
}
function stepNewGuardian(b,p,dt,assist){
 if(b.defeated)return [];
 const shots=[];b.age+=dt;b.elapsed+=dt;b.timer-=dt;b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.resistance=Math.max(0,b.resistance-dt);b.panelOpen=Math.max(0,b.panelOpen-dt);b.warning=b.phase==='telegraph'?Math.max(0,b.timer):0;
 const floor=151-b.h;
 if(b.phase==='intro'&&b.timer<=0)beginNewAttack(b,p,assist);
 else if(b.phase==='telegraph'&&b.timer<=0){
  b.phase='active';b.elapsed=0;b.duration=b.kind==='brinejaw'?[.62,1.05,1.3][b.attack]:b.kind==='floravel'?[.75,1.4,.65][b.attack]:b.kind==='facet'?[.65,1.15,1.2][b.attack]:[1.15,1.5,1.5][b.attack];b.timer=b.duration;
  if(b.kind==='facet'&&b.attack===1){const dx=b.lockX-(b.x+b.w/2),dy=b.lockY-(b.y+b.h/2),m=Math.hypot(dx,dy)||1;shots.push({...bossShot(b.x+b.w/2,b.y+b.h/2,dx/m*95,dy/m*95,'reflection'),life:2.7});}
  if(b.kind==='jester'&&b.attack===2)for(const [index,d] of (b.desperation?[...b.drops].reverse():b.drops).entries()){const t=.72;shots.push({x:b.x+b.w/2,y:b.y+9,vx:(d.x+d.w/2-b.x-b.w/2)/t,vy:(142-b.y-9-.5*420*t*t)/t,gravity:420,kind:'charge',delay:index*.18,r:5,w:10,h:10,life:2.5,fuse:1.45,bounces:0,blastRadius:19,destructible:true,arenaFloor:151});}
 }
 else if(b.phase==='active'){
  const t=clamp(b.elapsed/b.duration,0,1);
  if(b.kind==='brinejaw'){
   if(b.attack===0)for(const d of b.drops)d.active=true;
   if(b.attack===1){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=floor-Math.sin(t*Math.PI)*48;}
   if(b.attack===2&&b.sent<3&&b.elapsed>=b.sent*.32){const dir=b.x>150?-1:1;shots.push({...bossShot(b.x+b.w/2,145,dir*82,0,'water'),life:3.2,w:12,h:6,r:3});b.sent++;}
  }else if(b.kind==='floravel'){
   for(const d of b.drops){d.active=true;if(d.falling){d.vy+=260*dt;d.y+=d.vy*dt;if(d.y>151)d.active=false;}}
  }else if(b.kind==='facet'){
   if(b.attack===0)for(const d of b.drops)d.active=true;
   if(b.attack===2){b.x=b.fromX+(b.targetX-b.fromX)*Math.min(1,t*2);b.y=b.fromY+(floor-b.fromY)*Math.max(0,(t-.45)/.55);}
  }else{
   if(b.attack===0){b.x=b.fromX+(b.targetX-b.fromX)*t;b.y=floor-Math.sin(t*Math.PI)*70;}
   if(b.attack===1){for(let i=0;i<b.drops.length;i++)b.drops[i].active=b.elapsed>=i*.4&&b.elapsed<i*.4+.28;if(b.elapsed>=.95&&!b.sent){shots.push({...bossShot(b.x+b.w/2,146,b.x>150?-82:82,0,'pulse'),r:3,h:6});b.sent=1;}}
  }
  if(b.timer<=0){
   b.y=floor;b.phase='recovery';b.timer=assist?1.65:1.2;b.elapsed=0;b.drops=[];b.warning=0;b.vulnerable=b.timer;
   if(['brinejaw','facet'].includes(b.kind)&&b.attack===1&&b.desperation&&!b.followup){b.followup=true;b.followupPending=true;}
  }
 }else if(b.phase==='recovery'&&b.timer<=0){
  if(b.followupPending){b.followupPending=false;beginNewAttack(b,p,assist,1);b.timer=assist?1.1:.85;}
  else{
   b.followup=false;
   if(b.kind==='brinejaw')b.x=b.x<150?230:38;
   if(b.kind==='floravel')b.x=b.desperation?[40,144,246][b.cycle%3]:224;
   if(b.kind==='facet'){b.x=[42,142,242][b.cycle%3];b.y=79;}
   beginNewAttack(b,p,assist);
  }
 }
 return shots;
}

// Uses the same rectangles as the attack controller; art cannot conceal a danger lane.
export function drawGuardianTelegraph(ctx,b){
 if(!NEW_GUARDIANS[b.kind]||b.defeated)return;
 ctx.save();
 for(const d of b.drops||[]){
  const y=d.falling?(d.shadowY||151)-5:d.y;
  ctx.strokeStyle=d.active?'#fff1bb':'#f9c56e';ctx.fillStyle=d.active?'#ff784daa':'#f9c56e33';
  if(!d.active)ctx.setLineDash([3,3]);else ctx.setLineDash([]);
  if(d.falling){ctx.fillRect(d.x,d.y,d.w,d.h);ctx.strokeRect(d.x,y,d.w,4);}
  else{ctx.fillRect(d.x,y,d.w,d.h);ctx.strokeRect(d.x,y,d.w,d.h);}
 }
 ctx.restore();
}
