export const STEP=1/60;
export const GRAVITY=720;
export const RUN_SPEED=105;
export const JUMP_SPEED=235;
export function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function newPlayer(spawn={x:16,y:122}){
 return {...spawn,w:14,h:29,vx:0,vy:0,facing:1,onGround:false,coyote:0,jumpBuffer:0,hearts:5,invulnerable:0,shotCooldown:0,groundId:null,ladder:null,ladderCooldown:0,dropTimer:0,runDistance:0,climbDistance:0};
}
export function createMachinery(room,solved){
 const active=!room.gate||solved.includes(room.gate.id);
 return [...room.platforms,...room.moving,...(active?room.unlockedPlatforms||[]:[]),...(active?room.unlockedMoving||[]:[])].map(p=>({...p,baseX:p.x,baseY:p.y,dx:0,dy:0,age:(p.phase||0)*(p.period||1),fallAge:0,triggered:false,hidden:false}));
}
export function updateMachinery(platforms,dt){
 for(const p of platforms){
  const oldX=p.x,oldY=p.y;
  if(p.clampedFor>0){p.clampedFor=Math.max(0,p.clampedFor-dt);p.dx=0;p.dy=0;continue;}
 if(p.moving){p.age+=dt;const angle=p.age/p.period*Math.PI*2,t=(1-Math.cos(angle))/2;if(p.axis==='orbit'){p.x=p.baseX+Math.sin(angle)*p.travel;p.y=p.baseY+(Math.cos(angle)-1)*(p.radiusY||10);}else p[p.axis]=(p.axis==='x'?p.baseX:p.baseY)+p.travel*t;}
  if(p.falling&&p.triggered){p.fallAge+=dt;if(p.fallAge>.65){p.y=p.baseY+Math.min(220,(p.fallAge-.65)**2*290);p.hidden=p.y>p.baseY+180;}if(p.fallAge>3.4){p.fallAge=0;p.triggered=false;p.y=p.baseY;p.hidden=false;}}
  p.dx=p.x-oldX;p.dy=p.y-oldY;
 }
}
export function moveActor(p,dt,platforms,room,held,pressed){
 p.invulnerable=Math.max(0,p.invulnerable-dt);p.shotCooldown=Math.max(0,p.shotCooldown-dt);
 p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.ladderCooldown=Math.max(0,p.ladderCooldown-dt);
 p.dropTimer=Math.max(0,p.dropTimer-dt);
 p.coyote=p.onGround?.1:Math.max(0,p.coyote-dt);
 const direction=(held.get('right')?1:0)-(held.get('left')?1:0);
 const vertical=(held.get('down')?1:0)-(held.get('up')?1:0);
 const support=platforms.find(s=>s.id===p.groundId&&!s.hidden);
 if(p.onGround&&support){p.x+=support.dx+(support.conveyor||0)*dt;p.y+=support.dy;}
 if(pressed.has('jump'))p.jumpBuffer=.12;
 if(pressed.has('jump')&&vertical>0&&p.onGround&&support?.dropThrough){p.dropTimer=.5;p.jumpBuffer=0;p.coyote=0;p.onGround=false;p.groundId=null;p.vy=40;p.y+=2;}
 if(direction)p.facing=direction;
 if(vertical&&p.ladderCooldown<=0&&!p.ladder){
  const l=room.ladders.find(l=>Math.abs(p.x+p.w/2-(l.x+l.w/2))<=l.w/2+6&&p.y+p.h>=l.y-4&&p.y<=l.y+l.h&&!(vertical<0&&p.onGround&&p.y+p.h<=l.y+2));
  if(l)p.ladder=l;
 }
 let jumped=false;
 if(p.ladder){
  const l=p.ladder;
  p.x=l.x+(l.w-p.w)/2;p.vx=0;p.vy=vertical*76;p.y+=p.vy*dt;p.climbDistance=l.y-p.y+11;p.onGround=false;p.groundId=null;
  if(p.jumpBuffer>0){p.ladder=null;p.ladderCooldown=.25;p.vy=-JUMP_SPEED;p.vx=direction*RUN_SPEED;p.jumpBuffer=0;jumped=true;}
  else if(vertical<0&&p.y+p.h<=l.y){p.y=l.y-p.h;p.vy=0;p.ladder=null;p.onGround=true;p.ladderCooldown=.18;p.groundId=platforms.find(s=>Math.abs(s.y-l.y)<2&&p.x+p.w>s.x&&p.x<s.x+s.w)?.id||null;}
  else if(vertical>0&&p.y+p.h>=l.y+l.h){p.ladder=null;p.ladderCooldown=.15;p.y=l.y+l.h-p.h;p.onGround=true;p.vy=0;}
  else return {jumped};
 }
 p.vx=direction*RUN_SPEED;
 if(p.jumpBuffer>0&&p.coyote>0){p.vy=-JUMP_SPEED;p.onGround=false;p.coyote=0;p.jumpBuffer=0;p.groundId=null;jumped=true;}
 if(!held.get('jump')&&p.vy<0&&!jumped)p.vy=Math.max(p.vy,-106);
 p.vy+=GRAVITY*dt;
 const wind=p.onGround?0:(room.wind||[]).filter(w=>p.x+p.w>w.x&&p.x<w.x+w.w).reduce((n,w)=>n+w.force,0);
 const oldX=p.x,external=(p.onGround?0:clamp(p.externalPush||0,-32,32))+clamp(p.magnetPush||0,-48,48);p.externalPush=0;p.magnetPush=0;
 p.x=clamp(p.x+(p.vx+wind+external)*dt,0,room.width-p.w);
 // New solids opt in. Every v0.6 platform keeps its original one-way behavior.
 for(const s of platforms.filter(s=>s.solid&&!s.hidden))if(overlap(p,s)){
  if(oldX+p.w<=s.x+1&&p.x>oldX)p.x=s.x-p.w;
  else if(oldX>=s.x+s.w-1&&p.x<oldX)p.x=s.x+s.w;
 }
 if(p.onGround)p.runDistance+=Math.abs(p.x-oldX);
 const oldY=p.y,oldBottom=p.y+p.h;
 p.y+=p.vy*dt;p.onGround=false;p.groundId=null;
 if(p.vy<0)for(const s of platforms.filter(s=>s.solid&&!s.hidden))if(overlap(p,s)&&oldY>=s.y+s.h-1){p.y=s.y+s.h;p.vy=0;}
 if(p.vy>=0){
  const contacts=platforms.filter(s=>!s.hidden&&!(p.dropTimer>0&&s.dropThrough)&&p.x+p.w>s.x+1&&p.x<s.x+s.w-1&&oldBottom<=s.y+Math.max(3,Math.abs(s.dy)+1)&&p.y+p.h>=s.y);
  contacts.sort((a,b)=>a.y-b.y);
  if(contacts.length){const s=contacts[0];p.y=s.y-p.h;p.vy=0;p.onGround=true;p.groundId=s.id;if(s.falling&&!s.triggered){s.triggered=true;s.fallAge=0;}}
 }
 return {jumped};
}
export function hazardFrame(h,time){
 const phase=(Math.max(0,time)+(h.offset||0))%h.period;
 const start=1.15,warning=phase>=start&&phase<start+h.warning;
 const drop=phase-start-h.warning;
 if(['slag','bell','spark'].includes(h.type)){
  const y=h.y+Math.max(0,drop)**2*250;
  return {...h,warning,active:drop>=0&&y<h.bottom+20,y,restY:h.y,shadowY:h.bottom};
 }
 let y=h.y;
 if(drop>=0&&drop<.3)y=h.y+(h.bottom-h.h-h.y)*drop/.3;
 else if(drop>=.3&&drop<.95)y=h.bottom-h.h;
 else if(drop>=.95&&drop<1.7)y=h.bottom-h.h-(h.bottom-h.h-h.y)*(drop-.95)/.75;
 return {...h,y,warning,active:drop>=0&&drop<.95,restY:h.y,shadowY:h.bottom};
}
export function atExit(p,room){return !room.boss&&p.vx>0&&p.x+p.w>=room.width-.01&&p.y+p.h<=room.exitY+3;}
export function cameraFor(p,room){return {x:clamp(p.x-130,0,room.width-320),y:clamp(p.y-86,0,room.height-180)};}
