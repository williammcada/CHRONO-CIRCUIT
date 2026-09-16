// Stateful world mechanisms. Kept independent of menus, questions and rendering assets.
import {clamp,overlap} from './physics.js';

export function initWorld(state,room,memory={}){
 const record=memory[room.id]||{};
 if(!Number.isFinite(record.elapsed)||record.elapsed<0)record.elapsed=0;
 if(!record.switches||typeof record.switches!=='object')record.switches={};
 for(const [group,value] of Object.entries(room.bridgeDefaults||{}))if(typeof record.switches[group]!=='boolean')record.switches[group]=value;
 memory[room.id]=record;
 state.world={roomId:room.id,record,memory,waterY:room.tide?.low??room.height,mechanismHazards:[],switchCooldown:0};
 updateWorld(state,room,0);
 return state.world;
}

function periodicLane(def,time,type){
 const period=def.period||5,phase=((time+(def.offset||0))%period+period)%period,warningLength=def.warning||1;
 const warning=phase>=1&&phase<1+warningLength,active=phase>=1+warningLength&&phase<1+warningLength+.75;
 return {...def,type,warning,active,phase};
}

export function updateWorld(state,room,dt){
 if(!state.world||state.world.roomId!==room.id)initWorld(state,room,state.world?.memory||{});
 const w=state.world,p=state.player;
 w.record.elapsed+=Math.max(0,dt);w.switchCooldown=Math.max(0,w.switchCooldown-dt);
 const time=w.record.elapsed;
 if(room.tide){const t=room.tide;w.waterY=t.low-(t.low-t.high)*(1-Math.cos(time/(t.period||8)*Math.PI*2))/2;}
 for(const surface of state.platforms||[]){
  if(surface.transitionDrum){
   const oldY=surface.y;
   // Jester's drum decks move only during recovery; tells and attacks freeze them.
   if(state.boss?.phase==='recovery'){
    surface.drumAge=(surface.drumAge||0)+dt;
    surface.y=surface.baseY+6*(1-Math.cos(surface.drumAge*1.4+(surface.drumOffset||0)));
   }
   surface.dy=surface.y-oldY;surface.dx=0;
  }
  if(surface.buoy){
   const oldY=surface.y;
   if(!(surface.clampedFor>0))surface.y=surface.baseY+(w.waterY-(room.tide?.low||w.waterY));
   surface.dy=surface.y-oldY;surface.dx=0;
  }
  if(surface.growth){
   const g=surface.growth,phase=((time+(g.offset||0))%(g.period||6.5)+(g.period||6.5))%(g.period||6.5);
   const occupied=p?.groundId===surface.id&&p.onGround;
   const shouldShow=phase>=.7&&phase<4.3;
   // Occupied leaves hold their landing surface. They can fold once the rider leaves.
   surface.hidden=!shouldShow&&!occupied;surface.growthWarning=phase>=3.4&&phase<4.3||occupied&&!shouldShow;
   surface.growthAmount=shouldShow||occupied?1:phase<.7?phase/.7:0;
  }
  if(surface.bridgeGroup){
   const enabled=!!w.record.switches[surface.bridgeGroup];
   const occupied=p?.groundId===surface.id&&p.onGround;
   surface.hidden=!enabled&&!occupied;surface.bridgePending=!enabled&&occupied;
  }
 }
 w.mechanismHazards=[...(room.sluices||[]).map(d=>periodicLane(d,time,'sluice')),...(room.beams||[]).map(d=>periodicLane(d,time,'beam'))];
 return w;
}

export function worldHazards(state,room){
 const w=state.world;if(!w||w.roomId!==room.id)return [];
 const hazards=w.mechanismHazards.filter(h=>h.active).map(h=>({...h,recovery:false}));
 for(const pool of room.tide?.pools||[])hazards.push({x:pool.x,y:w.waterY+8,w:pool.w,h:Math.max(0,room.height-w.waterY),type:'deepwater',recovery:true,active:true});
 return hazards;
}

export function nearbyWorldSwitch(state,room){
 const p=state.player;if(!p||p.ladder)return null;
 return (room.switches||[]).find(s=>Math.abs(p.x+p.w/2-s.x)<35&&Math.abs(p.y+p.h-s.y)<20)||null;
}

export function interactWorld(state,room){
 const w=state.world,s=nearbyWorldSwitch(state,room);
 if(!w||!s||w.switchCooldown>0)return null;
 const enabled=!w.record.switches[s.group];w.record.switches[s.group]=enabled;
 if(s.paired)w.record.switches[s.paired]=!enabled;
 w.switchCooldown=.3;updateWorld(state,room,0);
 return {changed:true,label:`${s.label||'LIGHT BRIDGES'} ${enabled?'ON':'SWITCHED'}`,group:s.group,enabled};
}

export function worldExit(state,room,solved=[]){
 if(room.boss||!room.exits)return null;
 const p=state.player;if(!p)return null;
 for(const exit of room.exits){
  if((exit.requires||[]).some(id=>!solved.includes(id))||(exit.unless||[]).some(id=>solved.includes(id)))continue;
  const y=exit.exitY??room.exitY;
  const validHeight=p.y+p.h<=y+3;
  const crossed=exit.side==='left'?p.vx<0&&p.x<=.01&&validHeight:exit.side==='up'?p.vy<0&&p.y<=.01:p.vx>0&&p.x+p.w>=room.width-.01&&validHeight;
  if(crossed)return {roomId:exit.target,...(exit.spawn?{spawn:{...exit.spawn}}:{})};
 }
 return null;
}

// Visual language: solid top edge, broken inactive outline, marked warning lane.
export function drawWorldMechanisms(c,state,room){
 const w=state.world;if(!w||w.roomId!==room.id)return;
 const time=w.record.elapsed,rect=(x,y,width,height,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(width)),Math.max(1,Math.round(height)));};
 if(room.tide){
  for(const pool of room.tide.pools||[]){
   rect(pool.x,w.waterY,pool.w,room.height-w.waterY,'#1764778c');
   rect(pool.x,w.waterY,pool.w,2,'#76e5e5');
   for(let x=pool.x+5;x<pool.x+pool.w-8;x+=22)rect(x+Math.sin(time*2+x)*3,w.waterY+5,10,1,'#b6fff177');
  }
  // Harbor water gauge makes the slow rise legible before boarding.
  rect(7,73,8,44,'#0a2433');rect(9,76,4,38,'#c5d9c7');
  const fill=clamp((room.tide.low-w.waterY)/Math.max(1,room.tide.low-room.tide.high),0,1);
  rect(9,111-fill*33,4,3+fill*33,'#44cdd7');
 }
 for(const p of state.platforms||[]){
  if(p.transitionDrum){
   rect(p.x+3,p.y+5,p.w-6,15,'#9b365a');
   for(let x=p.x+8;x<p.x+p.w-3;x+=12)rect(x,p.y+8,5,8,'#f1c958');
   if(state.boss?.phase==='recovery')rect(p.x+3,p.y-3,p.w-6,2,'#8be9e6');
  }
  if(p.buoy){rect(p.x+4,p.y+5,p.w-8,6,'#ce7155');for(let x=p.x+8;x<p.x+p.w-5;x+=14)rect(x,p.y+6,5,3,'#f0c389');}
  if(p.growth){
   if(p.hidden){c.strokeStyle='#79bd7777';c.setLineDash?.([3,4]);c.strokeRect(p.x,p.y,p.w,7);c.setLineDash?.([]);if(p.growthAmount>0)rect(p.x,p.y,p.w*p.growthAmount,3,'#6daf61');}
   else{rect(p.x+3,p.y+4,p.w-6,5,'#478155');for(let x=p.x+8;x<p.x+p.w-4;x+=12)rect(x,p.y+5,1,3,'#b8d789');if(p.growthWarning)for(let x=p.x+4;x<p.x+p.w;x+=13)rect(x,p.y-3,5,2,'#ffda78');}
  }
  if(p.bridgeGroup){
   if(p.hidden){for(let x=p.x;x<p.x+p.w;x+=10)rect(x,p.y,Math.min(5,p.x+p.w-x),2,'#b6a3e47a');}
   else{rect(p.x,p.y,p.w,2,'#e4d8ff');rect(p.x+2,p.y+4,p.w-4,2,'#876dc877');}
  }
 }
 for(const h of w.mechanismHazards){
  rect(h.x-2,h.y+h.h-2,h.w+4,2,h.warning?'#ffd46f':'#405872');
  if(h.warning){for(let y=h.y;y<h.y+h.h;y+=9)rect(h.x+h.w/2-1,y,2,4,'#ffd46f');}
  if(h.active){rect(h.x,h.y,h.w,h.h,h.type==='beam'?'#d8b8ff88':'#6cf0ea77');rect(h.x+h.w/2-2,h.y,4,h.h,h.type==='beam'?'#fff0ff':'#d6fff5');}
 }
 const near=nearbyWorldSwitch(state,room);
 for(const s of room.switches||[]){
  const on=w.record.switches[s.group];
  rect(s.x-12,s.y-7,24,7,'#2d2547');rect(s.x-10,s.y-7,20,2,on?'#d8c9ff':'#8d81ab');
  c.strokeStyle=on?'#e5dbff':'#a295bc';c.beginPath();c.moveTo(s.x,s.y-21);c.lineTo(s.x+5,s.y-16);c.lineTo(s.x,s.y-11);c.lineTo(s.x-5,s.y-16);c.closePath();c.stroke();
  if(near===s){c.fillStyle='#f4e8ff';c.font='bold 7px monospace';c.textAlign='center';c.fillText('TIME / E · SWITCH',s.x,s.y-28);}
 }
 if(room.exits&&!room.boss){
  const left=room.exitSide==='left',x=left?4:room.width-9,y=room.exitY-27;
  rect(x,y,5,25,'#63dad7');c.fillStyle='#eaffdd';c.font='bold 9px monospace';c.textAlign='center';c.fillText(left?'◀':'▶',left?14:room.width-17,y+17);
 }
 if(room.landmark==='archive-hub'){
  rect(203,35,160,24,'#171327');c.fillStyle='#d6bfff';c.font='bold 7px monospace';c.textAlign='center';c.fillText('WEST RECORDS  ◇  EAST RECORDS',283,50);
 }
}
