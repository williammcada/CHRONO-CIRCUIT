import {overlap,clamp} from './physics.js';
import {enemyBounds,projectileHits,hitEnemy,segmentIntersectsRect} from './combat.js';
import {hitGuardian} from './bosses.js';

const solidRects=platforms=>(platforms||[]).filter(s=>!s.hidden&&!s.decorative&&s.w>0).map(s=>({...s,h:s.h||6}));
export function visibleLine(from,to,platforms=[]){return !solidRects(platforms).some(s=>segmentIntersectsRect(from.x,from.y,to.x,to.y,s));}
const center=t=>({x:t.x+t.w/2,y:t.y+t.h/2});
const nearest=(p,t)=>({x:clamp(p.x,t.x,t.x+t.w),y:clamp(p.y,t.y,t.y+t.h)});
const targetKey=t=>t.kind?'boss':t;
function effect(state,kind,x,y,extra={}){(state.weaponEffects??=[]).push({kind,x,y,age:0,life:kind==='depth'?.28:.18,...extra});}
function landProjectile(b,previous,platforms,bounce=false){
 if(b.vy<0)return false;
 const contacts=solidRects(platforms).filter(s=>b.x+b.r>s.x&&b.x-b.r<s.x+s.w&&previous.y+b.r<=s.y+2&&b.y+b.r>=s.y).sort((a,z)=>a.y-z.y);
 if(!contacts.length)return false;
 b.y=contacts[0].y-b.r;
 if(bounce&&b.bounces===0){b.vy=-Math.min(88,Math.abs(b.vy)*.42);b.bounces++;b.vx*=.78;}else b.vy=0;
 return true;
}
function registerHit(state,b,target,isBoss,result){
 const key=isBoss?'boss':target;b.hits??=new Set();
 if(b.hits.has(key))return false;
 if(isBoss&&b.kind==='orbit'&&b.activation.bossHits>=2)return false;
 const accepted=isBoss?hitGuardian(target,b.damage||1,b.kind,state.brake>0):hitEnemy(target,b.damage||1);
 if(!accepted)return false;
 b.hits.add(key);if(isBoss&&b.activation)b.activation.bossHits++;
 const c=center(target);
 if(isBoss)result.bossHits.push({boss:target,x:c.x,y:c.y});else result.enemyHits.push({enemy:target,killed:target.dead,x:c.x,y:c.y});
 return true;
}
function targets(state){return [...(state.enemies||[]).filter(e=>!e.dead).map(target=>({target,bounds:enemyBounds(target),isBoss:false})),...(state.boss&&!state.boss.defeated&&state.boss.hp>0?[{target:state.boss,bounds:state.boss.kind==='brinejaw'?{x:state.boss.x,y:state.boss.y-4,w:state.boss.w,h:state.boss.h+4}:state.boss,isBoss:true}]:[])];}
function detonate(state,b,platforms,result){
 effect(state,'depth',b.x,b.y,{radius:26});
 for(const t of targets(state)){
  const point=nearest(b,t.bounds);if(Math.hypot(point.x-b.x,point.y-b.y)>26||!visibleLine(b,point,platforms))continue;
  registerHit(state,b,t.target,t.isBoss,result);
 }b.life=0;
}
function chainArc(state,b,first,platforms,result){
 const from=nearest(b,first.bounds);effect(state,'arc',b.originX,b.originY,{endX:from.x,endY:from.y});
 const next=targets(state).filter(t=>t.target!==first.target).map(t=>({...t,point:nearest(from,t.bounds)})).filter(t=>Math.hypot(t.point.x-from.x,t.point.y-from.y)<=48&&visibleLine(from,t.point,platforms)).sort((a,z)=>Math.hypot(a.point.x-from.x,a.point.y-from.y)-Math.hypot(z.point.x-from.x,z.point.y-from.y))[0];
 if(next){registerHit(state,b,next.target,next.isBoss,result);effect(state,'arc',from.x,from.y,{endX:next.point.x,endY:next.point.y});}b.life=0;
}
export function stepPlayerProjectiles(state,dt,{platforms=state.platforms||[]}={}){
 const result={enemyHits:[],bossHits:[],impacts:[]};
 state.weaponEffects=(state.weaponEffects||[]).filter(e=>(e.age+=dt,e.life-=dt,e.life>0));
 for(const b of state.bullets||[]){
  if(b.life<=0)continue;const previous={x:b.x,y:b.y};b.age=(b.age||0)+dt;b.life-=dt;b.hits??=new Set();
  if(b.kind==='orbit'){
   const a=b.age*8+b.shard*Math.PI;b.x=state.player.x+state.player.w/2+Math.cos(a)*26;b.y=state.player.y+16+Math.sin(a)*26;
  }else{
   if(b.kind==='disc'&&b.age>.65){if(!b.returning){b.returning=true;b.hits.clear();}const dx=state.player.x+state.player.w/2-b.x,dy=state.player.y+18-b.y,m=Math.hypot(dx,dy)||1;b.vx=dx/m*185;b.vy=dy/m*185;}
   if(b.gravity)b.vy+=b.gravity*dt;b.x+=b.vx*dt;b.y+=(b.vy||0)*dt;
   if(b.kind==='depth'||b.kind==='roller'){
    const landed=landProjectile(b,previous,platforms,b.kind==='depth');
    if(!landed){const wall=solidRects(platforms).find(s=>previous.y+b.r>s.y+2&&previous.y-b.r<s.y+s.h-2&&segmentIntersectsRect(previous.x,previous.y,b.x,b.y,{x:s.x-b.r,y:s.y-b.r,w:s.w+b.r*2,h:s.h+b.r*2}));
     if(wall){b.x=previous.x;b.vx=b.kind==='depth'?-b.vx*.35:0;}
    }
   }
  }
  if(b.kind==='depth'){if(b.life<=0)detonate(state,b,platforms,result);continue;}
  if(b.life<=0)continue;
  if(b.kind==='arc'&&!visibleLine(previous,b,platforms)){effect(state,'arc',b.originX,b.originY,{endX:previous.x,endY:previous.y});b.life=0;continue;}
  // Destructible fireworks stay shootable before their fuse expires.
  const charge=(state.enemyShots||[]).find(s=>s.destructible&&s.life>0&&projectileHits(b,{x:s.x-(s.r||4),y:s.y-(s.r||4),w:(s.r||4)*2,h:(s.r||4)*2},previous));
  if(charge){charge.life=0;effect(state,'spark',charge.x,charge.y);if(!b.pierce){b.life=0;continue;}}
  const candidates=targets(state).filter(t=>projectileHits(b,t.bounds,previous));
  candidates.sort((a,z)=>Math.hypot(center(a.bounds).x-previous.x,center(a.bounds).y-previous.y)-Math.hypot(center(z.bounds).x-previous.x,center(z.bounds).y-previous.y));
  for(const t of candidates){
   if(b.kind==='arc'&&!visibleLine({x:b.originX,y:b.originY},nearest(b,t.bounds),platforms))continue;
   if(!registerHit(state,b,t.target,t.isBoss,result))continue;
   if(b.kind==='arc'){chainArc(state,b,t,platforms,result);break;}
   if(!b.pierce){b.life=0;break;}
  }
 }
 state.bullets=(state.bullets||[]).filter(b=>b.life>0&&b.x>-100&&b.x<(state.roomWidth||4096)&&b.y<4096);
 return result;
}

export function stepEnemyProjectiles(state,dt,{slow=1,room,platforms=state.platforms||[],onPlayerHit=()=>{}}={}){
 const step=dt*slow,p=state.player;
 for(const s of state.enemyShots||[]){
  if(s.life<=0)continue;s.age=(s.age||0)+step;s.life-=step;
  if(s.delay>0){s.delay=Math.max(0,s.delay-step);continue;}
  if(s.kind==='charge'){
   const previous={x:s.x,y:s.y};s.vy+=(s.gravity||420)*step;s.x+=s.vx*step;s.y+=s.vy*step;
   const support=solidRects(platforms);if(s.arenaFloor)support.push({x:0,y:s.arenaFloor,w:320,h:20});landProjectile(s,previous,support,true);
   if(s.bounces>0&&Math.abs(s.vy)<1)s.vx*=Math.max(0,1-step*12);
   s.fuse-=step;if(s.fuse<=0){s.kind='blast';s.life=.28;s.r=s.blastRadius||15;s.vx=0;s.vy=0;s.destructible=false;}
  }else{s.x+=(s.vx||0)*step;s.y+=(s.vy||0)*step;if(s.gravity)s.vy+=s.gravity*step;}
  const rectangular=['zone','beam','echo'].includes(s.kind),bounds=rectangular?{x:s.x,y:s.y,w:s.w||12,h:s.h||8}:{x:s.x-(s.r||4),y:s.y-(s.r||4),w:(s.r||4)*2,h:(s.r||4)*2};
  if(overlap(bounds,p)){onPlayerHit(s);if(!rectangular&&s.kind!=='blast')s.life=0;}
 }
 state.enemyShots=(state.enemyShots||[]).filter(s=>s.life>0&&s.y<(room?.height||800)+60&&s.x>-60&&s.x<(room?.width||4096)+60);
}
export function drawPlayerProjectile(ctx,b,state){
 ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));
 if(b.kind==='depth'){ctx.fillStyle='#112937';ctx.fillRect(-5,-5,10,10);ctx.fillStyle='#eea179';ctx.fillRect(-3,-3,6,6);ctx.fillStyle='#fff2ad';ctx.fillRect(-1,-6,3,2);}
 else if(b.kind==='roller'){ctx.rotate((b.age||0)*14);ctx.fillStyle='#acd878';for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillRect(-2,-8,4,16);}ctx.fillStyle='#37664b';ctx.fillRect(-4,-4,8,8);}
 else if(b.kind==='orbit'){ctx.fillStyle='#e5d8ff';ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.fillStyle='#9b82c8';ctx.fillRect(-1,-3,2,6);}
 else if(b.kind==='arc'){ctx.strokeStyle='#ffe56a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-Math.sign(b.vx)*12,0);ctx.lineTo(-Math.sign(b.vx)*6,-3);ctx.lineTo(0,1);ctx.stroke();}
 else if(b.kind==='lance'){ctx.fillStyle='#ffb397';ctx.fillRect(b.vx>0?-13:-3,-2,16,4);ctx.fillStyle='#fff2d5';ctx.fillRect(-5,-1,8,2);}
 else{ctx.strokeStyle=b.kind==='disc'?'#cab1f7':b.kind==='burst'?'#99f1ed':'#b4f5ed';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,b.r||3,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
export function drawWeaponEffects(ctx,state){
 for(const e of state.weaponEffects||[]){ctx.save();ctx.globalAlpha=Math.min(1,e.life*5);ctx.strokeStyle=e.kind==='depth'?'#ffba83':'#ffe883';ctx.lineWidth=2;
  if(e.kind==='arc'){ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo((e.x+e.endX)/2,(e.y+e.endY)/2-4);ctx.lineTo(e.endX,e.endY);ctx.stroke();}
  else{ctx.beginPath();ctx.arc(e.x,e.y,e.radius||8,0,Math.PI*2);ctx.stroke();}ctx.restore();}
}
export function drawEnemyProjectile(ctx,s){
 ctx.save();const warning=s.delay>0;ctx.strokeStyle=warning?'#f4d58c':'#ff9367';ctx.fillStyle=warning?'#ffd46d33':'#ff925baa';
 if(['zone','beam','echo'].includes(s.kind)){if(warning)ctx.setLineDash([3,2]);ctx.fillRect(s.x,s.y,s.w||12,s.h||8);ctx.strokeRect(s.x,s.y,s.w||12,s.h||8);}
 else if(s.kind==='charge'||s.kind==='blast'){
  if(s.kind==='charge'){ctx.fillStyle='#fdcd63';ctx.fillRect(s.x-4,s.y-4,8,8);if(s.fuse<.7){ctx.setLineDash([3,2]);ctx.beginPath();ctx.arc(s.x,s.y,s.blastRadius||15,0,Math.PI*2);ctx.stroke();}}
  else{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.stroke();}
 }else{ctx.beginPath();ctx.arc(s.x,s.y,s.r||4,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
