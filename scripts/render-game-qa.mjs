// Optional visual QA utility. Uses @napi-rs/canvas installed in the art runtime;
// the game and its CI tests themselves have no third-party dependencies.
import {createRequire} from 'node:module';
const {createCanvas,Image:CanvasImage,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const base=resolve('public');
class LocalImage extends CanvasImage{
 listeners={};
 addEventListener(name,fn){this.listeners[name]=fn;}
 set src(value){
  const file=value instanceof URL?fileURLToPath(value):String(value).startsWith('file:')?fileURLToPath(value):resolve(base,String(value));
  super.src=readFileSync(file);
 }
 get src(){return super.src;}
 get complete(){return this.width>0;}
 get naturalWidth(){return this.width;}
 get naturalHeight(){return this.height;}
}
globalThis.Image=LocalImage;
const {game}=await import('../tests/harness.mjs');
const {preloadActorArt}=await import('../public/actor-art.js');
const {preloadTempoArt}=await import('../public/hero-art.js');
const {preloadScenery}=await import('../public/scenery.js');
await Promise.all([preloadActorArt(),preloadTempoArt(),preloadScenery()]);
const canvas=createCanvas(320,180),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const g=await game({context:ctx,Image:LocalImage});
async function snapshot(canvas){const img=new CanvasImage();const ready=new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});img.src=canvas.toBuffer('image/png');await ready;return img;}
g.images.backdrop=await loadImage(resolve(base,'assets/foundry.png'));
const out=resolve('test-output');mkdirSync(out,{recursive:true});
const sheet=createCanvas(1280,1568),c=sheet.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#0b1222';c.fillRect(0,0,sheet.width,sheet.height);
for(const [i,stage]of g.modules.STAGES.entries()){
 g.beginStage(stage.id);g.tick(45);g.state.player.onGround=true;g.draw();
 writeFileSync(resolve(out,`${stage.id}-native.png`),canvas.toBuffer('image/png'));
 const x=i%2*640,y=Math.floor(i/2)*392;c.fillStyle='#efe6cb';c.font='bold 14px sans-serif';c.fillText(stage.name,x+8,y+19);c.drawImage(await snapshot(canvas),x,y+28,640,360);
}
writeFileSync(resolve(out,'eight-stages.png'),sheet.toBuffer('image/png'));
const bosses=createCanvas(1280,1568),bc=bosses.getContext('2d');bc.imageSmoothingEnabled=false;bc.fillStyle='#0b1222';bc.fillRect(0,0,bosses.width,bosses.height);
for(const [i,stage]of g.modules.STAGES.entries()){
 g.beginStage(stage.id);for(const gate of stage.gates){g.save.answered.push(...g.modules.questionsForGate(g.save,gate).map(p=>p.id));g.modules.completeGate(g.save,gate);}
 g.enterRoom(stage.end);g.tick(55);g.state.boss.phase='telegraph';g.state.boss.attack=0;g.state.boss.warning=1;g.draw();
 const x=i%2*640,y=Math.floor(i/2)*392;bc.fillStyle='#efe6cb';bc.font='bold 14px sans-serif';bc.fillText(stage.boss,x+8,y+19);bc.drawImage(await snapshot(canvas),x,y+28,640,360);
}
writeFileSync(resolve(out,'eight-bosses.png'),bosses.toBuffer('image/png'));
console.log(`Rendered production Canvas views in ${out}`);
