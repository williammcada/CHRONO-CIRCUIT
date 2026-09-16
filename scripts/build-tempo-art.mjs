// ImageGen source poses -> keyed, registered 48px textures.
// This pipeline manipulates raster artwork; it never paints a procedural body.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'):'sharp');
const root=path.resolve(import.meta.dirname,'..'), src=path.join(root,'art-source/tempo-production'), out=path.join(root,'public/assets');
const qaDir=path.join(src,'qa');
const SIZE=48,PIVOT={x:24,y:45},frames=[],groups={};
const blank=()=>Buffer.alloc(SIZE*SIZE*4), clone=b=>Buffer.from(b), at=(x,y)=>(y*SIZE+x)*4;
function copyRect(dst,source,sx,sy,w,h,dx=sx,dy=sy,{replace=false,flip=false}={}){
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const tx=dx+(flip?w-1-x:x),ty=dy+y;if(tx<0||ty<0||tx>=SIZE||ty>=SIZE||sx+x<0||sy+y<0||sx+x>=SIZE||sy+y>=SIZE)continue;
 const a=at(sx+x,sy+y),b=at(tx,ty);if(replace||source[a+3])source.copy(dst,b,a,a+4);}
 return dst;
}
function erase(b,x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<SIZE&&yy>=0&&yy<SIZE)b.fill(0,at(xx,yy),at(xx,yy)+4);}
function mirror(b){const r=blank();return copyRect(r,b,0,0,48,48,1,0,{flip:true});}
async function source(name){
 const {data,info}=await sharp(path.join(src,name+'.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Generated solid magenta is a chroma key, not part of Tempo's palette.
 for(let i=0;i<data.length;i+=4)if(data[i]>60&&data[i+2]>50&&data[i+1]<data[i]*.45&&data[i+2]>data[i]*.6)data.fill(0,i,i+4);
 return {data,...info};
}
function register(s,{cell,cols=4,rows=2,scale,cx,baseline,headTarget=28,foot=44}){
 const b=blank(),cw=s.width/cols,ch=s.height/rows,c0=(cell%cols)*cw,r0=Math.floor(cell/cols)*ch;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const sx=Math.round(cx+(x-headTarget)/scale),sy=Math.round(baseline+(y-foot)/scale);
 if(sx<c0||sx>=c0+cw||sy<r0||sy>=r0+ch)continue;const a=(sy*s.width+sx)*4;s.data.copy(b,at(x,y),a,a+4);}
 return b;
}
const runS=await source('run'),actionS=await source('action'),climbS=await source('climb-compact'),fireS=await source('run-fire-low');
const runCX=[250,613,971,1370,244,608,976,1375],actionCX=[230,585,925,1292,201,552,968,1315,215,575,945,1305,216,566,918,1303];
let run=runCX.map((cx,i)=>register(runS,{cell:i,scale:.12,cx,baseline:i<4?452:896}));
const actions=actionCX.map((cx,i)=>register(actionS,{cell:i,rows:4,scale:.172,cx,baseline:[267,509,746,985][Math.floor(i/4)]}));
// A single raster head is used for every side-on pose. This locks the approved
// hair/visor silhouette and prevents generated head-size flicker between states.
const head=blank();copyRect(head,actions[0],16,3,24,18);
function fixedHead(frame,bob=0){const b=clone(frame);erase(b,16,0,24,21);copyRect(b,head,16,3,24,18,16,3+bob);return b;}
run=run.map((f,i)=>fixedHead(f,[0,1,0,-1,0,1,0,-1][i]));
const rawFire=runCX.map((cx,i)=>register(fireS,{cell:i,scale:.12,cx,baseline:i<4?452:896}));
// Isolate a coherent generated low-slung aiming arm. Its luminous cuff is
// registered at (33,33): p.x + 16 and p.y + 18 in the production renderer.
const arm=blank();
copyRect(arm,rawFire[0],23,22,18,14,21,25);
// Clean the torso sliver on the left of the arm crop; all remaining pixels
// come directly from the generated wrist/upper-arm artwork.
erase(arm,21,25,2,4);
function firing(base,index=0,{climb=false,left=false}={}){
 const b=clone(base);
 if(!climb){
  // Upper torso from its matching generated fire pose; legs remain the exact
  // original phase. Clear forward swinging fist before applying the arm.
  const torso=fixedHead(rawFire[index%8],[0,1,0,-1,0,1,0,-1][index%8]);
  copyRect(b,torso,14,21,18,8,14,21,{replace:true});
  erase(b,32,21,16,10);
  copyRect(b,arm,0,0,48,48);
 }else{
  // Supported rear hand and both boots stay in their ladder phase. The dial
  // arm crosses the near side of the torso; no lateral body translation.
  // Remove the released hand before adding the aiming arm; never three arms.
  if(index<4)erase(b,0,8,21,22);else erase(b,28,8,20,22);
  copyRect(b,rearHead,14,4,21,18);
  const aim=left?mirror(arm):arm;
  copyRect(b,aim,0,0,48,48);
 }
 return b;
}
const idle=Array.from({length:6},(_,i)=>{const b=fixedHead(actions[0]);const v=fixedHead(actions[[0,0,1,2,3,0][i]]);copyRect(b,v,5,14,12,10,5,14,{replace:true});return b;});
// Visor glint is a raster patch sampled from the master visor, never a new head.
copyRect(idle[4],head,30,12,2,1,32,12);
const runFire=run.map((f,i)=>firing(f,i));
const idleFire=idle.map(f=>firing(f,0));
const rise=[fixedHead(actions[7]),fixedHead(actions[8])],apex=[fixedHead(actions[10])],fall=[fixedHead(actions[11]),fixedHead(actions[12])];
const takeoff=[fixedHead(actions[6]),rise[0]],land=[fixedHead(actions[13]),idle[0]];
const climbCX=[214,565,932,1297,207,565,932,1298];
const climbRaw=climbCX.map((cx,i)=>register(climbS,{cell:i,scale:.118,cx,baseline:i<4?438:905,headTarget:24}));
// Four distinct generated half-cycle poses followed by their raster mirror:
// produces the genuinely opposite hand/foot phase the source sheet omitted.
let climb=[climbRaw[0],climbRaw[1],climbRaw[2],climbRaw[4]];
climb=[...climb,...climb.map(mirror)];
// Equal rear-head crop prevents a jump in head size in the generated ladder row.
const largeRear=register(climbS,{cell:0,scale:.14,cx:214,baseline:380,headTarget:24});
const rearHead=blank();copyRect(rearHead,largeRear,14,4,21,18);
climb=climb.map(f=>{const b=clone(f);erase(b,14,3,21,18);return copyRect(b,rearHead,14,4,21,18);});
const climbFire=climb.map((f,i)=>firing(f,i,{climb:true}));
const climbFireLeft=climb.map((f,i)=>firing(f,i,{climb:true,left:true}));
const hurt=[fixedHead(actions[14]),fixedHead(actions[14],1),idle[0]],victory=[idle[0],fixedHead(actions[15]),fixedHead(actions[15],-1),fixedHead(actions[15])];
function clean(frame){
 // Remove isolated key-edge speckles and neighboring-cell fragments. Keep
 // the complete connected character (eight-neighbor connectivity).
 const b=clone(frame),seen=new Set(),parts=[];
 for(let y=0;y<48;y++)for(let x=0;x<48;x++){const k=y*48+x;if(seen.has(k)||!b[k*4+3])continue;const part=[],queue=[k];seen.add(k);
 while(queue.length){const t=queue.pop();part.push(t);const xx=t%48,yy=Math.floor(t/48);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy,n=ny*48+nx;if(nx>=0&&nx<48&&ny>=0&&ny<48&&!seen.has(n)&&b[n*4+3]){seen.add(n);queue.push(n);}}}parts.push(part);}
 const largest=Math.max(...parts.map(p=>p.length));for(const part of parts)if(part.length<Math.max(3,largest*.015))for(const k of part)b.fill(0,k*4,k*4+4);return b;
}
function add(name,list){groups[name]=list.map((rgba,i)=>{const id=frames.length;frames.push({name:name+'-'+i,rgba:clean(rgba)});return id;});}
add('idle',idle);add('idleFire',idleFire);add('run',run);add('runFire',runFire);add('takeoff',takeoff);add('land',land);add('rise',rise);add('apex',apex);add('fall',fall);
add('riseFire',rise.map(f=>firing(f)));add('apexFire',apex.map(f=>firing(f)));add('fallFire',fall.map(f=>firing(f)));add('takeoffFire',takeoff.map(f=>firing(f)));add('landFire',land.map(f=>firing(f)));
add('climb',climb);add('climbFire',climbFire);add('climbFireLeft',climbFireLeft);add('hurt',hurt);add('victory',victory);
const cols=8,rows=Math.ceil(frames.length/cols),composite=frames.map((f,i)=>({input:f.rgba,raw:{width:48,height:48,channels:4},left:(i%cols)*48,top:Math.floor(i/cols)*48}));
await fs.mkdir(qaDir,{recursive:true});
await sharp({create:{width:cols*48,height:rows*48,channels:4,background:'#00000000'}}).composite(composite).png().toFile(path.join(out,'tempo-atlas.png'));
const metadata={version:1,source:'Generated raster poses, keyed and registered; shared raster head and matched leg phases.',size:48,columns:cols,rows,pivot:PIVOT,collider:{x:17,y:16,w:14,h:29},muzzle:{x:33,y:34},groups,
frames:frames.map((f,i)=>({name:f.name,x:(i%cols)*48,y:Math.floor(i/cols)*48,w:48,h:48}))};
await fs.writeFile(path.join(out,'tempo-atlas.json'),JSON.stringify(metadata,null,2)+'\n');
await fs.writeFile(path.join(out,'tempo-atlas-data.js'),'// Generated by scripts/build-tempo-art.mjs.\nexport default '+JSON.stringify(metadata)+';\n');
// Contact sheet doubles as direct PNG native/enlarged visual QA.
const rowNames=Object.keys(groups),qaW=8*64,qaH=rowNames.length*66;
const qa=[],labels=[];
for(let row=0;row<rowNames.length;row++){const name=rowNames[row];labels.push('<text x="4" y="'+(row*66+11)+'" fill="#cce6df" font-family="monospace" font-size="9">'+name+'</text>');
 groups[name].forEach((id,col)=>qa.push({input:frames[id].rgba,raw:{width:48,height:48,channels:4},left:col*64+8,top:row*66+15}));}
const contact=await sharp({create:{width:qaW,height:qaH,channels:4,background:'#132437'}}).composite(qa).png().toBuffer();
await sharp(contact).composite([{input:Buffer.from('<svg width="'+qaW+'" height="'+qaH+'">'+labels.join('')+'</svg>')}]).png().toFile(path.join(qaDir,'contact-native.png'));
await sharp(path.join(qaDir,'contact-native.png')).resize(qaW*3,qaH*3,{kernel:'nearest'}).png().toFile(path.join(qaDir,'contact-enlarged.png'));
await sharp(path.join(qaDir,'contact-native.png')).extract({left:0,top:0,width:512,height:264}).resize(1536,792,{kernel:'nearest'}).png().toFile(path.join(qaDir,'ground-enlarged.png'));
await sharp(path.join(qaDir,'contact-native.png')).extract({left:0,top:924,width:512,height:132}).resize(1536,396,{kernel:'nearest'}).png().toFile(path.join(qaDir,'climb-enlarged.png'));
console.log(JSON.stringify({frames:frames.length,groups:Object.keys(groups),atlas:cols*48+'×'+rows*48}));
