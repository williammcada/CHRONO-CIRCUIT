import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import {newPlayer} from '../public/physics.js';
import {makeBlaster} from '../public/combat.js';
import {TEMPO_ATLAS as atlas,tempoFrame,runningPose,climbingPose,resetTempoAnimation,preloadTempoArt,tempoArtReady,drawTempo} from '../public/hero-art.js';
// Decode our fixed RGBA8 PNG without development-only raster dependencies.
// This makes the pixel assertions runnable on a clean Node installation.
async function readAtlas(){
 const png=await fs.readFile(new URL('../public/assets/tempo-atlas.png',import.meta.url)),parts=[];
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 let width,height;
 for(let offset=8;offset<png.length;){const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8),chunk=png.subarray(offset+8,offset+8+length);
 if(type==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);assert.equal(chunk[8],8);assert.equal(chunk[9],6);assert.equal(chunk[12],0);}
 if(type==='IDAT')parts.push(chunk);offset+=length+12;}
 const raw=inflateSync(Buffer.concat(parts)),stride=width*4,data=Buffer.alloc(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];assert.ok(filter<=4);
 for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?data[i-4]:0,b=y?data[i-stride]:0,c=y&&x>=4?data[i-stride-4]:0,predict=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];data[i]=(raw[y*(stride+1)+1+x]+predict)&255;}}
 return {data,info:{width,height},png};
}
const player=extra=>({...newPlayer({x:43,y:97}),onGround:true,...extra});
test('run uses ground distance at 12 frames/s, preserves phase on turning/firing',()=>{
 const p=player({vx:105});
 for(let i=0;i<8;i++){p.runDistance=i*8.75+.1;const normal=tempoFrame(p,i/12);p.facing=-1;p.shotCooldown=.28;const fire=tempoFrame(p,i/12);
 assert.equal(normal.frame,i);assert.equal(fire.frame,i);assert.equal(fire.group,'runFire');assert.equal(fire.facing,-1);p.facing=1;p.shotCooldown=0;}
 assert.equal(runningPose({...p,runDistance:70}).frame,0);
});
test('idle uses independent clock and cannot be started by platform carry',()=>{
 const p=player({vx:0,runDistance:888});assert.equal(tempoFrame(p,0).group,'idle');
 for(let f=1;f<=60;f++){p.x+=1;tempoFrame(p,f/60);}
 assert.equal(tempoFrame(p,1).group,'idle');assert.notEqual(tempoFrame(p,1).frame,0);
 p.runDistance=0;assert.equal(tempoFrame(p,1).group,'idle');
});
test('climb holds on a stopped rung and reverses with signed ladder distance',()=>{
 const p=player({ladder:{y:10},onGround:false,climbDistance:7,vy:0});const a=tempoFrame(p,0);
 assert.deepEqual(climbingPose(p,0),climbingPose(p,999));assert.equal(tempoFrame(p,90).index,a.index);
 const forward=[],backward=[];for(let n=0;n<8;n++)forward.push(climbingPose({...p,climbDistance:n*2.25}).frame);
 for(let n=7;n>=0;n--)backward.push(climbingPose({...p,climbDistance:n*2.25}).frame);
 assert.deepEqual(backward,forward.reverse());p.shotCooldown=.28;assert.equal(tempoFrame(p,90).group,'climbFire');assert.equal(tempoFrame(p,90).frame,a.frame);
 p.facing=-1;const left=tempoFrame(p,90);assert.equal(left.group,'climbFireLeft');assert.equal(left.frame,a.frame);assert.equal(left.facing,1);
 p.shotCooldown=0;assert.equal(tempoFrame(p,90).index,a.index);assert.equal(tempoFrame(p,90).facing,1);
});
test('rise, apex, fall and firing have independent atlas states',()=>{
 for(const [vy,group]of [[-220,'rise'],[-75,'rise'],[0,'apex'],[90,'fall'],[210,'fall']]){
 const p=player({onGround:false,vy,shotCooldown:0});assert.equal(tempoFrame(p,0).group,group);
 p.shotCooldown=.28;assert.equal(tempoFrame(p,.01).group,group+'Fire');}
});
test('takeoff, landing and hurt transitions never mutate gameplay state',()=>{
 const p=player();tempoFrame(p,0);p.onGround=false;p.vy=-225;const before=structuredClone(p);
 assert.equal(tempoFrame(p,.016).group,'takeoff');assert.deepEqual(p,before);
 tempoFrame(p,.1);p.onGround=true;p.vy=0;assert.equal(tempoFrame(p,.2).group,'land');
 tempoFrame(p,.3);p.invulnerable=1.4;assert.equal(tempoFrame(p,.4).group,'hurt');resetTempoAnimation(p);
 assert.equal(tempoFrame(p,0).group,'idle');
});
test('collider, foot pivot and mirrored firing socket match real blaster spawn',()=>{
 assert.deepEqual(atlas.collider,{x:17,y:16,w:14,h:29});
 for(const facing of [-1,1]){const p=player({facing}),shot=makeBlaster(p),cx=p.x+p.w/2,top=p.y+p.h-atlas.pivot.y;
 assert.equal(cx+facing*(atlas.muzzle.x-atlas.pivot.x),shot.x);
 assert.equal(top+atlas.muzzle.y,shot.y);}
});
test('all atlas states have explicit fixed cells and keyed transparent margins',async()=>{
 const png=await readAtlas();
 assert.equal(png.info.width,atlas.columns*48);assert.equal(png.info.height,atlas.rows*48);
 for(const frame of atlas.frames){let opaque=0;for(let y=0;y<48;y++)for(let x=0;x<48;x++){const i=((frame.y+y)*png.info.width+frame.x+x)*4;if(png.data[i+3])opaque++;}
 assert.ok(opaque>100,frame.name+' is populated');assert.equal(frame.w,48);assert.equal(frame.h,48);}
 assert.equal(atlas.groups.run.length,8);assert.equal(atlas.groups.runFire.length,8);assert.equal(atlas.groups.climb.length,8);assert.equal(atlas.groups.idle.length,6);
 for(let i=0;i<png.data.length;i+=4)if(png.data[i+3])assert.ok(!(png.data[i]>155&&png.data[i+2]>145&&png.data[i+1]<70),'magenta key must be removed');
});
test('firing preserves run boot pixels and idle has planted feet',async()=>{
 const {data,info}=await readAtlas();
 const region=(id,y0)=>{const f=atlas.frames[id],b=[];for(let y=y0;y<48;y++)for(let x=0;x<48;x++){const i=((f.y+y)*info.width+f.x+x)*4;b.push(...data.subarray(i,i+4));}return b;};
 for(let i=0;i<8;i++)assert.deepEqual(region(atlas.groups.run[i],39),region(atlas.groups.runFire[i],39),'boot phase '+i);
 for(let i=1;i<6;i++)assert.deepEqual(region(atlas.groups.idle[0],33),region(atlas.groups.idle[i],33),'idle feet '+i);
});
test('renderer loads its registered atlas and uses one native-size image blit',async()=>{
 const {info,png}=await readAtlas();
 globalThis.Image=class{set src(value){assert.ok(value===png);this.width=info.width;this.height=info.height;queueMicrotask(()=>this.onload());}};
 await preloadTempoArt(png);assert.ok(tempoArtReady());
 const calls=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(...args){calls.push(args);}};
 const p=player({shotCooldown:.28}),before=structuredClone(p),pose=drawTempo(ctx,p,0);
 assert.equal(pose.group,'idleFire');assert.deepEqual(p,before);assert.equal(calls.length,1);assert.deepEqual(calls[0].slice(3),[48,48,-24,-45,48,48]);
 p.facing=-1;drawTempo(ctx,p,.01);assert.equal(tempoFrame(p,.01).frame,pose.frame);delete globalThis.Image;
});
