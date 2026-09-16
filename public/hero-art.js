// Tempo v0.7: registered raster animation. Source art and the reproducible
// preparation pipeline live in art-source/tempo-production and scripts/.
import atlas from './assets/tempo-atlas-data.js';
export const TEMPO_ATLAS=atlas;
export const TEMPO_FRAME_SIZE=48;
export const TEMPO_RUN_DISTANCE_PER_FRAME=8.75; // 105px/s => 12 frames/s.
let texture=null,loading=null,loadError=null;
const tracks=new WeakMap();
const mod=(a,b)=>((a%b)+b)%b;
const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
export function tempoArtReady(){return !!texture;}
export function tempoArtStatus(){return {ready:!!texture,loading:!!loading&&!texture&&!loadError,error:loadError?.message||null};}
export function preloadTempoArt(source=new URL('./assets/tempo-atlas.png',import.meta.url).href){
 if(texture)return Promise.resolve(texture);
 if(loading)return loading;
 if(typeof Image==='undefined')return Promise.resolve(null);
 loadError=null;
 loading=new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{if(img.width!==atlas.columns*48||img.height!==atlas.rows*48){loadError=new Error('Tempo animation atlas has incorrect dimensions.');reject(loadError);return;}texture=img;resolve(img);};
  img.onerror=()=>{loadError=new Error('Tempo animation artwork could not load.');reject(loadError);};
  img.src=source;
 });
 return loading;
}
export function runningPose(p,time=0){
 const distance=finite(p.runDistance,finite(time)*105);
 const frame=Math.floor(mod(distance,8*TEMPO_RUN_DISTANCE_PER_FRAME)/TEMPO_RUN_DISTANCE_PER_FRAME);
 return {frame,bob:[0,1,0,-1,0,1,0,-1][frame]};
}
export function climbingPose(p,time=0){
 // Same signed 18px ladder period as v0.6. Hold when stopped; reverse on
 // descent. A facing change never changes the climbing phase.
 const distance=finite(p.climbDistance,0),phase=mod(distance,18)/18,frame=Math.floor(phase*8);
 const reach=t=>t<.5?t*18:9-(t-.5)*18;
 return {frame,phase,leftHand:reach(phase),rightHand:reach(mod(phase+.5,1)),leftBoot:26+reach(mod(phase+.5,1)),rightBoot:26+reach(phase)};
}
function idleFrame(t){
 const durations=[.65,.55,.55,.55,.12,.58];let remaining=mod(t,3);
 for(let i=0;i<durations.length;i++){if(remaining<durations[i])return i;remaining-=durations[i];}return 0;
}
export function resetTempoAnimation(p){tracks.delete(p);}
export function tempoFrame(p,time=0,state={}){
 let track=tracks.get(p);
 const now=finite(time),ground=!!p.onGround,moving=ground&&Math.abs(finite(p.vx))>1,ladder=!!p.ladder;
 if(!track){track={time:now,ground,ladder,idle:0,air:0,takeoff:0,land:0,hurt:0,invulnerable:finite(p.invulnerable),victory:0};tracks.set(p,track);}
 const dt=Math.max(0,Math.min(.1,now-track.time));
 if(now<track.time){track.takeoff=0;track.land=0;track.hurt=0;track.idle=0;track.air=0;}
 track.time=now;
 for(const key of ['takeoff','land','hurt'])track[key]=Math.max(0,track[key]-dt);
 if(!ladder&&track.ground&&!ground&&finite(p.vy)<-20){track.takeoff=.08;track.air=0;}
 if(!ladder&&!track.ground&&ground){track.land=.10;track.air=0;}
 if(finite(p.invulnerable)>track.invulnerable+.2)track.hurt=.14;
 if(ground&&!moving&&!ladder)track.idle+=dt;else track.idle=0;
 if(!ground&&!ladder)track.air+=dt;
 track.ground=ground;track.ladder=ladder;track.invulnerable=finite(p.invulnerable);
 const firing=finite(p.shotCooldown)>.06;
 let group,frame;
 if(state.mode==='victory'||p.victory){track.victory+=dt;group='victory';frame=Math.min(3,Math.floor(track.victory/.18));}
 else if(ladder){group=firing?(p.facing<0?'climbFireLeft':'climbFire'):'climb';frame=climbingPose(p,time).frame;}
 else if(track.hurt>0){group='hurt';frame=Math.min(2,Math.floor((.14-track.hurt)/.047));}
 else if(track.takeoff>0){group='takeoff';frame=Math.min(1,Math.floor((.08-track.takeoff)/.04));}
 else if(!ground){const vy=finite(p.vy);if(vy<-35){group='rise';frame=vy<-135?0:1;}else if(vy<=35){group='apex';frame=0;}else{group='fall';frame=vy<145?0:1;}}
 else if(track.land>0){group='land';frame=Math.min(1,Math.floor((.10-track.land)/.05));}
 else if(moving){group='run';frame=runningPose(p,time).frame;}
 else{group='idle';frame=idleFrame(track.idle);}
 if(firing&&atlas.groups[group+'Fire'])group+='Fire';
 const index=atlas.groups[group][frame%atlas.groups[group].length];
 return {group,frame,index,...atlas.frames[index],facing:ladder?1:p.facing<0?-1:1,aimFacing:p.facing<0?-1:1,pivot:atlas.pivot,muzzle:atlas.muzzle};
}
function pendingSilhouette(c,p){
 // The startup waits for art before gameplay. Failed art stays visibly failed.
 if(loadError){c.fillStyle='#d34665';c.fillRect(Math.round(p.x),Math.round(p.y),14,29);c.fillStyle='#fff';c.font='10px monospace';c.fillText('?',Math.round(p.x)+4,Math.round(p.y)+18);return;}
 c.fillStyle='#153f50';c.fillRect(Math.round(p.x)+1,Math.round(p.y)+5,12,24);c.fillStyle='#ffbc45';c.fillRect(Math.round(p.x)+3,Math.round(p.y)+6,9,3);
}
export function drawTempo(c,p,time=0,state={}){
 if(!texture){if(!loading&&typeof Image!=='undefined')preloadTempoArt().catch(()=>{});pendingSilhouette(c,p);return;}
 const pose=tempoFrame(p,time,typeof state==='object'?state:{}),cx=Math.round(p.x+(p.w??14)/2),bottom=Math.round(p.y+(p.h??29));
 c.save();c.imageSmoothingEnabled=false;c.translate(cx,bottom);c.scale(pose.facing,1);
 c.drawImage(texture,pose.x,pose.y,48,48,-atlas.pivot.x,-atlas.pivot.y,48,48);c.restore();
 return pose;
}
export function drawClimber(c,p,time=0){return drawTempo(c,{...p,ladder:p.ladder||true},time);}
