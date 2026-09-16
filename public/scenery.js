export const THEMES={
 foundry:{floor:'#332c45',edge:'#c18a3d',dark:'#17192f',light:'#f7c867'},
 metro:{floor:'#273953',edge:'#86d6d7',dark:'#10192f',light:'#f28b83'},
 tower:{floor:'#514266',edge:'#d3b47d',dark:'#211b3e',light:'#d8b5f6'},
 sky:{floor:'#326287',edge:'#c0eff1',dark:'#143856',light:'#94edf2'},
 tidal:{floor:'#255360',edge:'#e6b881',dark:'#092738',light:'#f4e3be'},
 garden:{floor:'#36573b',edge:'#bbbc76',dark:'#173c32',light:'#d4679c'},
 prism:{floor:'#4a405f',edge:'#d5c7f0',dark:'#211b37',light:'#ebbe62'},
 fair:{floor:'#463850',edge:'#f7ce43',dark:'#111f39',light:'#74d5dd'},
};
export const ENVIRONMENT_ASSETS=Object.freeze(Object.fromEntries(['metro','tower','sky','tidal','garden','prism','fair'].map(id=>[id,`./assets/environment/${id}.png`])));
const plates={};
let sceneryLoading;
// Relative URLs work unchanged at a GitHub Pages project subpath and offline.
export function preloadScenery(){
 if(sceneryLoading)return sceneryLoading;
 if(typeof Image==='undefined')return Promise.resolve([]);
 sceneryLoading=Promise.all(Object.entries(ENVIRONMENT_ASSETS).map(([id,url])=>new Promise((resolve,reject)=>{
  const plate=new Image();plates[id]=plate;plate.onload=()=>resolve(plate);plate.onerror=()=>reject(new Error('Scenery failed to load: '+id));plate.src=url;
 })));
 return sceneryLoading;
}
if(typeof Image!=='undefined')preloadScenery().catch(()=>{});
// The distant plate stays pinned to the native pixel grid. Sparse closer details
// move against it; the non-tileable architecture never wraps or stretches.
function drawExpansionBackdrop(c,stage,time,camera,r){
 const plate=plates[stage],theme=THEMES[stage];r(0,0,320,180,theme.dark);
 if(plate?.complete&&plate.naturalWidth){
  c.imageSmoothingEnabled=false;
  c.drawImage(plate,0,0,320,180);
 }
 const shift=Math.round((camera?.x||0)*.12);
 if(stage==='tidal'){
  // Reflections are scenery only. Actual rising water and buoy decks belong to machinery.
  for(let i=0;i<9;i++){const x=((i*47+time*3-shift)%360+360)%360-20,y=126+(i%4)*12;r(x,y,7+i%3*3,1,i%3?'#1d5460':'#476965');}
 }else if(stage==='garden'){
  for(let i=0;i<4;i++){const x=((i*97+time*1.8-shift)%352+352)%352-16,y=33+i*34+Math.round(Math.sin(time*.4+i)*3);r(x,y,1,2,'#799165');}
 }else if(stage==='prism'){
  // Dim suspended crystal glints never share the solid-bridge amber/white cue.
  for(let i=0;i<3;i++){const x=38+i*119-shift%23,y=40+(i%2)*58+Math.round(Math.sin(time*.35+i)*2);r(x,y,1,3,'#746184');}
 }else if(stage==='fair'){
  // Steady cable lights; do not flash decorative scenery or imply a rhythm requirement.
  for(let i=0;i<7;i++){const x=19+i*51-shift%51,y=25+Math.round(Math.sin(i*.7)*7);r(x,y,2,2,'#8f8459');}
 }
 c.fillStyle=stage==='sky'?'#1026402c':'#06101c18';c.fillRect(0,0,320,180);
}
export function drawScenery(c,stage,time,camera){
 const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 if(ENVIRONMENT_ASSETS[stage]){drawExpansionBackdrop(c,stage,time,camera,r);return;}
 const shift=(camera?.x||0)*.16;
 if(stage==='metro'){
  r(0,0,320,180,'#0b152a');r(0,38,320,105,'#15243b');
  for(let x=-100;x<430;x+=72){const a=x-shift%72;r(a,24,7,124,'#263e54');r(a-8,33,49,5,'#314c63');r(a+13,47,23,44,'#0a1121');r(a+18,56,13,3,'#6da9b3');r(a+18,64,13,2,'#3c687b');}
  r(0,143,320,37,'#111b2e');for(let y=146;y<176;y+=10)r(0,y,320,2,'#426176');
  for(let y=102;y<139;y+=9)for(let x=0;x<320;x+=32)r(x+(y%2)*12,y,25,1,'#294058');
  for(let x=35;x<320;x+=97){r(x,33,1,67,'#516171');r(x-5,91,11,19,'#080f21');r(x-2,94,5,4,'#e77462');r(x-2,102,5,4,'#70b7ac');}
  const train=(time*14+shift)%420;for(let i=0;i<4;i++){const x=350-train+i*62;r(x,106,57,29,'#304b61');r(x,107,57,3,'#ef9a76');for(let w=5;w<48;w+=14)r(x+w,114,9,9,'#8dd5d2');r(x+7,133,9,5,'#08101e');}
  for(let i=0;i<4;i++)r(i*87+24,25,25,2,'#bfe9df');
 }else if(stage==='tower'){
  r(0,0,320,180,'#151833');r(0,37,320,143,'#302943');
  for(let y=40;y<180;y+=18)for(let x=(y%36?0:-22);x<320;x+=44){r(x,y,42,16,'#3b3150');r(x+1,y+1,40,1,'#4d3f5c');}
  for(let x=27;x<330;x+=97){r(x,50,37,81,'#101e38');r(x-3,47,43,5,'#706082');r(x+17,49,3,84,'#79698f');r(x,90,37,3,'#79698f');}
  for(const [x,y,rad,speed] of [[48,145,26,.28],[264,58,38,-.2],[174,156,19,-.45]]){
   c.save();c.translate(x-shift%17,y);c.rotate(time*speed);c.fillStyle='#675267';for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillRect(rad-5,-5,12,10);}c.beginPath();c.arc(0,0,rad,0,Math.PI*2);c.fill();c.fillStyle='#29253d';c.beginPath();c.arc(0,0,rad-7,0,Math.PI*2);c.fill();c.fillStyle='#695769';for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.fillRect(-2,0,4,rad-5);}c.fillStyle='#ad8d6b';c.fillRect(-3,-3,6,6);c.restore();
  }
 }else{
  r(0,0,320,180,'#205482');r(0,45,320,55,'#3a83a7');r(0,100,320,80,'#82c0cf');r(249,33,23,23,'#ffe1ac');r(245,40,31,11,'#ffe1ac');
  for(let y=40;y<49;y+=2)for(let x=y%4;x<320;x+=4)r(x,y,2,1,'#3a83a7');
  for(let y=94;y<104;y+=2)for(let x=y%4;x<320;x+=4)r(x,y,2,1,'#82c0cf');
  for(let i=0;i<7;i++){const x=((i*71-time*3-shift)%420+420)%420-60,y=57+(i%3)*39;r(x,y,53,9,'#c0e5e6');r(x+11,y-7,30,8,'#d7edec');r(x+5,y+9,38,4,'#a7d5dd');}
  r(25-shift%40,113,67,13,'#386785');r(37-shift%40,105,45,8,'#497e94');r(50-shift%40,126,19,17,'#234f72');r(15-shift%40,143,92,5,'#376a82');
  for(let i=0;i<5;i++)r(31+i*11-shift%40,115,5,4,'#83b7c8');r(57-shift%40,130,5,6,'#78c0cd');r(27-shift%40,128,2,15,'#689aaf');r(84-shift%40,126,2,17,'#689aaf');
 }
 c.fillStyle='#09112618';c.fillRect(0,0,320,180);
}
