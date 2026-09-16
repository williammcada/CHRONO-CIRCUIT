import {ACTOR_META} from './assets/actors-meta.js';
export {climbingPose,drawClimber} from './hero-art.js';

// Full-body frames share one registered foot pivot per actor. No live crop,
// per-frame scale fitting, or mixture of rectangle robots and painted sprites.
const textures=new Map();
let loading;
const poseCycle=[0,1,2,1];
const ink='#101d30';

function loadTexture(name,url){
 const existing=textures.get(name);if(existing)return existing.promise;
 if(typeof Image==='undefined')return Promise.resolve(null);
 const image=new Image(),item={image,ready:false,error:null,flash:null,promise:null};
 item.promise=new Promise((resolve,reject)=>{
  image.onload=()=>{item.ready=true;resolve(image);};
  image.onerror=()=>{item.error=`Missing actor art: ${url}`;reject(new Error(item.error));};
 });
 textures.set(name,item);image.src=url;return item.promise;
}
export function preloadActorArt(){
 if(!loading)loading=Promise.all([
  ...Object.entries(ACTOR_META.groups).map(([name,data])=>loadTexture(name,data.url)),
  loadTexture('portraits',ACTOR_META.portraits.url)
 ]);
 return loading;
}
export function actorArtReady(){return ['bosses','enemies','portraits'].every(key=>textures.get(key)?.ready);}
export function actorArtStatus(){return {ready:actorArtReady(),assets:[...textures].map(([name,t])=>({name,ready:t.ready,error:t.error}))};}
export function actorDefinition(kind){return ACTOR_META.actors[kind]||null;}
export function actorKinds(){return Object.keys(ACTOR_META.actors);}

function missing(c,x,y,w,h){
 // A visible failure marker, never silently substituting an unrelated actor.
 c.save();c.fillStyle=ink;c.fillRect(Math.round(x),Math.round(y),w,h);
 c.strokeStyle='#efb767';c.lineWidth=1;c.strokeRect(Math.round(x)+.5,Math.round(y)+.5,w-1,h-1);
 c.fillStyle='#efb767';c.font='bold 9px monospace';c.textAlign='center';c.fillText('?',Math.round(x+w/2),Math.round(y+h/2+3));c.restore();
}
function flashTexture(item){
 if(item.flash)return item.flash;
 if(typeof document==='undefined')return item.image;
 const flash=document.createElement('canvas');flash.width=item.image.naturalWidth;flash.height=item.image.naturalHeight;
 const c=flash.getContext('2d');c.drawImage(item.image,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#f0fff8';c.fillRect(0,0,flash.width,flash.height);
 item.flash=flash;return flash;
}
export function actorFrame(kind,state={},time=0){
 const def=ACTOR_META.actors[kind];if(!def)return 0;
 if(def.group==='enemies'){
  if(state.warning||['windup','warning','clamp','record','beam_warning'].includes(state.action))return 1;
  if(state.speed===0&&!['fly','swoop','hover','orbit'].includes(state.behavior))return 0;
  return Math.floor(Math.max(0,state.age??time)*def.fps)%2;
 }
 if(state.defeated)return 2;
 if(state.phase==='telegraph')return 2;
 if(kind==='vesper')return poseCycle[Math.floor(Math.max(0,state.age??time)*6)%4];
 if(state.phase==='active')return poseCycle[Math.floor(Math.max(0,state.elapsed??time)*def.fps)%4];
 return 0;
}
function drawActor(c,kind,x,y,frame,flip=false,hit=false){
 const def=ACTOR_META.actors[kind],texture=def&&textures.get(def.group);
 if(!def||!texture?.ready)return false;
 const data=def.frames[Math.min(def.frames.length-1,Math.max(0,frame))];
 const [sx,sy,sw,sh]=data.rect,[px,py]=def.pivot;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));
 if(flip)c.scale(-1,1);
 c.drawImage(hit?flashTexture(texture):texture.image,sx,sy,sw,sh,-px,-py,sw,sh);
 c.restore();return true;
}
export function drawRobot(c,e,time=0){
 const kind=e.type,frame=actorFrame(kind,e,time),left=e.dir<0;
 // Lamprey, root-weaver and prism-crawler were authored facing left.
 const reverse=['lamprey_drone','root_weaver','prism_crawler'].includes(kind);
 const flip=reverse?!left:left;
 if(!drawActor(c,kind,e.x+e.w/2,e.y+e.h,frame,flip,e.hitFlash>0))missing(c,e.x,e.y,e.w,e.h);
 if(e.warning){
  const x=Math.round(e.x+e.w/2),y=Math.round(e.y-8);
  c.fillStyle=ink;c.fillRect(x-3,y-2,7,8);c.fillStyle='#ffda7b';c.fillRect(x,y,1,3);c.fillRect(x,y+4,1,1);
 }
 if(e.hp<e.maxHp){
  const x=Math.round(e.x),y=Math.round(e.y-4);
  c.fillStyle=ink;c.fillRect(x-1,y-1,e.w+2,4);c.fillStyle='#78e2d5';c.fillRect(x,y,Math.max(1,Math.round(e.w*e.hp/e.maxHp)),2);
 }
}
export function drawGuardian(c,b,time=0){
 const kind=b.kind||'pendula',frame=actorFrame(kind,b,time);
 // Front-facing nonhumanoid models retain stable asymmetry. Moving guardians
 // turn toward the next approach, while every collision remains external.
 const turn=['pendula','railox','ricochet','vesper'].includes(kind);
 const facing=b.facing??(b.phase==='active'&&Number.isFinite(b.targetX)&&Number.isFinite(b.fromX)?Math.sign(b.targetX-b.fromX):(b.x>160?-1:1));
 if(!drawActor(c,kind,b.x+b.w/2,b.y+b.h,frame,turn&&facing<0,b.hitCooldown>0&&Math.floor(b.hitCooldown*35)%2===0))missing(c,b.x,b.y,b.w,b.h);
}
export function drawActorPortrait(canvas,kind){
 if(!canvas)return;
 const c=canvas.getContext('2d'),texture=textures.get('portraits'),rect=ACTOR_META.portraits.frames[kind];
 c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);
 if(rect&&texture?.ready){c.drawImage(texture.image,...rect,0,0,canvas.width,canvas.height);return;}
 missing(c,0,0,canvas.width,canvas.height);
 if(!rect)return;
 // A restored menu may precede preload; redraw the same canvas when ready.
 preloadActorArt().then(()=>{
  if(canvas.isConnected!==false&&textures.get('portraits')?.ready)drawActorPortrait(canvas,kind);
 }).catch(()=>{});
}
