import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {preloadTempoArt,drawTempo,tempoFrame} from '../public/hero-art.js';
const require=createRequire(import.meta.url),dep=n=>require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,n):n);
const sharp=dep('sharp'),{Image,createCanvas}=dep('@napi-rs/canvas');
globalThis.Image=Image;
const root=path.resolve(import.meta.dirname,'..'),qa=path.join(root,'art-source/tempo-production/qa');
await preloadTempoArt(await fs.readFile(path.join(root,'public/assets/tempo-atlas.png')));
const canvas=createCanvas(640,180),c=canvas.getContext('2d'),p={x:54,y:83,w:14,h:29,vx:0,vy:0,onGround:true,facing:1,runDistance:0,climbDistance:0,shotCooldown:0,invulnerable:0};
const modes=['idle','run','runFire','air','climb','climbHold','descend','climbFire'];
const frames=[],shots=[];
for(let f=0;f<288;f++){
 const t=f/12,mode=modes[Math.floor(t/3)%8],dt=1/12;
 p.onGround=!['air','climb','climbHold','descend','climbFire'].includes(mode);p.ladder=mode.includes('climb')||mode==='descend'?{}:null;
 p.vx=mode.startsWith('run')?105:0;p.shotCooldown=mode.endsWith('Fire')?.28:0;p.vy=mode==='air'?Math.sin(t*3)*220:mode==='climbHold'?0:mode==='descend'?76:-76;
 p.facing=Math.floor(t/1.5)%2?-1:1;
 if(p.vx)p.runDistance+=105*dt;if(p.ladder&&mode!=='climbHold')p.climbDistance+=(mode==='descend'?-1:1)*76*dt;
 c.fillStyle='#122737';c.fillRect(0,0,640,180);
 function panel(scale,ox,oy){
  c.save();c.translate(ox,oy);c.scale(scale,scale);
  c.fillStyle='#37525c';for(let x=-40;x<160;x+=20)c.fillRect(x-mod(t*(p.vx?105:0),20),65,1,49);
  c.fillStyle='#607c75';c.fillRect(0,112,145,2);
  if(p.ladder){c.fillStyle='#597983';c.fillRect(50,45,2,70);c.fillRect(68,45,2,70);for(let y=46;y<115;y+=9)c.fillRect(50,y,20,1);}
  drawTempo(c,p,t);c.restore();
 }
 panel(1,12,38);panel(3,185,-175);
 const selected=tempoFrame(p,t);c.fillStyle='#e8ead5';c.font='14px monospace';c.fillText(mode+' / '+selected.frame+' / '+(p.facing>0?'RIGHT':'LEFT'),12,21);
 c.font='11px monospace';c.fillText('NATIVE',17,177);c.fillText('3x nearest-neighbor',280,177);
 frames.push(Buffer.from(c.getImageData(0,0,640,180).data));
 if(f%18===0)shots.push({input:await canvas.encode('png'),left:0,top:(f/18)*180});
}
function mod(a,b){return ((a%b)+b)%b;}
await sharp(Buffer.concat(frames),{raw:{width:640,height:180*frames.length,channels:4,pageHeight:180}}).gif({delay:83,loop:0,effort:3,dither:0}).toFile(path.join(qa,'tempo-motion-review.gif'));
await sharp({create:{width:640,height:180*shots.length,channels:4,background:'#122737'}}).composite(shots).png().toFile(path.join(qa,'motion-samples.png'));
console.log('24-second production-renderer animation exported; no browser/device validation implied.');
