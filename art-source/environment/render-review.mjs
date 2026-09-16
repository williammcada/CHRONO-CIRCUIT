// Static production Canvas render; this does not start or control a browser.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/index.js':import.meta.url);
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const ids=['metro','tower','sky','tidal','garden','prism','fair'];
const imageMap=new Map(await Promise.all(ids.map(async id=>[`./assets/environment/${id}.png`,await loadImage(readFileSync(new URL(`../../public/assets/environment/${id}.png`,import.meta.url)))])));
class LocalImage{
 set src(path){this.value=imageMap.get(path);}
 get complete(){return true;}get naturalWidth(){return this.value.width;}
}
globalThis.Image=LocalImage;
const {drawScenery,THEMES}=await import('../../public/scenery.js');
const sheet=createCanvas(960,1020),s=sheet.getContext('2d');s.fillStyle='#080e1b';s.fillRect(0,0,960,1020);s.imageSmoothingEnabled=false;
for(const [i,id] of ids.entries()){
 const canvas=createCanvas(320,180),native=canvas.getContext('2d');
 const c=new Proxy(native,{get(t,k){if(k==='drawImage')return(img,...a)=>t.drawImage(img.value||img,...a);const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v;},set(t,k,v){Reflect.set(t,k,v,t);return true;}});
 drawScenery(c,id,2,{x:40,y:20});
 const theme=THEMES[id];
 // These test silhouettes explicitly represent the expected foreground readability.
 for(const [x,y,w] of [[0,164,98],[118,137,57],[206,109,61],[280,150,40]]){
  c.fillStyle='#08101c';c.fillRect(x-1,y-1,w+2,13);c.fillStyle=theme.floor;c.fillRect(x,y,w,11);c.fillStyle=theme.edge;c.fillRect(x,y,w,3);
 }
 const x=i%3*320,y=Math.floor(i/3)*340;
 s.drawImage(canvas,x,y+25);s.fillStyle='#d8e7e8';s.font='16px monospace';s.fillText(id.toUpperCase(),x+8,y+18);
 // A magnified crop exposes the registered pixel grid and platform rim.
 s.drawImage(canvas,110,92,110,58,x,y+215,220,116);
}
const output=fileURLToPath(new URL('./environment-review.png',import.meta.url));writeFileSync(output,sheet.toBuffer('image/png'));console.log(output);
