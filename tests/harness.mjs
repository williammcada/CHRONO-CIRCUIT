import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const noop=()=>{};
const moduleNames=['time-engine','curriculum','controls','stage-data','progress','gate-questions','physics','powers','bosses','portraits','combat','actor-art','hero-art','scenery','gate-ui','world-mechanisms','projectile-system'];

// Exercise the shipped application in an isolated VM; only browser, audio, and timers
// are replaced. Test handles are appended in memory and never shipped to players.
export async function game(options={}){
 const modules=Object.assign({},...await Promise.all(moduleNames.map(name=>import(`../public/${name}.js`))));
 const events=new Map(),timers=[],storage=new Map();
 if(options.save)storage.set(modules.SAVE_KEY,JSON.stringify(options.save));
 const context2d=options.context||new Proxy({measureText:text=>({width:String(text).length*5})},{get:(obj,key)=>obj[key]||noop,set:(obj,key,v)=>(obj[key]=v,true)});
 const nodes=new Map();
 let document;
 function element(key,attributes={}){
  if(nodes.has(key))return nodes.get(key);
  const listeners=new Map(),attrs=new Map(Object.entries(attributes)),classes=new Set();
  const node={tagName:'DIV',style:{setProperty:noop},dataset:{},classList:{add:(...cs)=>cs.forEach(c=>classes.add(c)),remove:(...cs)=>cs.forEach(c=>classes.delete(c)),contains:c=>classes.has(c),toggle(c,on){const yes=on??!classes.has(c);yes?classes.add(c):classes.delete(c);return yes;}},
   width:320,height:180,value:'',checked:false,disabled:false,hidden:false,textContent:'',children:[],
   getContext:()=>context2d,addEventListener:(name,fn)=>{listeners.set(name,fn);events.set(key+':'+name,fn);},removeEventListener:noop,
   dispatchEvent(event){const handler=listeners.get(event.type);handler?.({...event,currentTarget:node,target:event.target||node,preventDefault:noop});return true;},
   focus(){document.activeElement=node;listeners.get('focus')?.({currentTarget:node,target:node,preventDefault:noop});},blur(){document.activeElement=null;},setPointerCapture:noop,
   setAttribute(name,value){attrs.set(name,String(value));if(name==='id')nodes.set('#'+value,node);if(name.startsWith('data-'))node.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);},getAttribute:name=>attrs.get(name)??null,
   querySelector(selector){return query(selector,node)[0]||null;},querySelectorAll:selector=>query(selector,node),
   click(){if(!node.disabled)node.dispatchEvent({type:'click'});},
   insertAdjacentHTML(position,html){node.innerHTML=(position==='afterbegin'?html+node.innerHTML:node.innerHTML+html);},
   appendChild(child){node.children.push(child);return child;},remove:noop,
   get firstElementChild(){return node.children[0]||null;},
   get innerHTML(){return node.html||'';},
   set innerHTML(html){node.html=html;node.children=[];parse(html,node);},
   closest(){return null;},
  };
  nodes.set(key,node);
  for(const [name,value]of Object.entries(attributes))node.setAttribute(name,value);
  return node;
 }
 function parse(html,parent){
  let serial=0;
  for(const match of String(html).matchAll(/<(button|input|canvas|select|div|label|p|form|section)\b([^>]*)>/g)){
   const attrs={};for(const a of match[2].matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';
   const key=attrs.id?'#'+attrs.id:`${parent.getAttribute('id')||'fragment'}:${match[1]}:${serial++}`;
   // Re-rendering replaces DOM listeners and input state, as the actual overlay does.
   nodes.delete(key);const n=element(key,attrs);n.tagName=match[1].toUpperCase();n.value=attrs.value||'';n.disabled='disabled'in attrs;n.checked='checked'in attrs;
   for(const c of (attrs.class||'').split(/\s+/).filter(Boolean))n.classList.add(c);
   parent.children.push(n);
  }
 }
 function matches(n,selector){
  if(selector==='*')return true;
  if(selector.includes(':not([disabled])')&&n.disabled)return false;
  selector=selector.replace(':not([disabled])','');
  const tag=selector.match(/^[\w-]+/);if(tag&&n.tagName!==tag[0].toUpperCase())return false;
  const id=selector.match(/#([\w-]+)/);if(id&&n.getAttribute('id')!==id[1])return false;
  for(const c of selector.matchAll(/\.([\w-]+)/g))if(!n.classList.contains(c[1]))return false;
  for(const a of selector.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)){if(n.getAttribute(a[1])===null)return false;if(a[2]!==undefined&&n.getAttribute(a[1])!==a[2])return false;}
  return true;
 }
 function query(selector,parent){
  const pool=parent?parent.children:[...nodes.values()];
  if(selector.includes(','))return [...new Set(selector.split(',').flatMap(s=>query(s.trim(),parent)))];
  const found=pool.filter(n=>matches(n,selector));
  if(found.length)return found;
  if(!parent&&selector.startsWith('#')&&nodes.has(selector))return [nodes.get(selector)];
  return [];
 }
 const body=element('body'),root=element('root');
 for(const id of ['app','game','overlay','hud','toast','touch-controls','power-control','pause','cycle-control'])element('#'+id,{id});
 element('#game').tagName='CANVAS';
 const actions=['left','right','up','down','jump','fire','interact','power','cycle'];
 for(const action of actions){const id=action==='power'?'#power-control':action==='cycle'?'#cycle-control':'control-'+action;const n=element(id);n.setAttribute('data-action',action);n.classList.add('control');}
 document={body,documentElement:root,querySelector:selector=>query(selector)[0]||null,querySelectorAll:selector=>query(selector),createElement:tag=>{const n=element('created-'+nodes.size);n.tagName=tag.toUpperCase();return n;},addEventListener:(name,fn)=>events.set('document:'+name,fn),activeElement:null,hidden:false};
 const audio=class{start(){} jump(){} fire(){} hit(){} good(){} wrong(){} tick(){}};
 const context=vm.createContext({...modules,console,performance,Math,Date,JSON,Promise,URL,Blob,Set,Map,
  Soundtrack:audio,Image:options.Image||class{addEventListener(){}},
  preloadTempoArt:async()=>{},preloadActorArt:async()=>{},preloadScenery:async()=>{},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document,
  window:{matchMedia:()=>({matches:!!options.touch}),speechSynthesis:{cancel:noop},visualViewport:undefined},
  navigator:{getGamepads:()=>options.pad?[options.pad]:[]},location:{protocol:'http:',search:''},innerWidth:options.width||1024,innerHeight:options.height||768,
  addEventListener:(name,fn)=>events.set(name,fn),requestAnimationFrame:noop,clearTimeout:noop,setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},
 });
 const source=readFileSync(new URL('../public/game.js',import.meta.url),'utf8').replace(/import\s[\s\S]*?from ['"][^'"]+['"];\n/g,'');
 vm.runInContext(source+'\nthis.game={state,input,bootReady,images,get save(){return save;},enterRoom,beginStage,continueGame,update,getPlatforms,updateBoss,updateBullets,showResults,solveTerminal,openMath,ROOMS,showStageSelect,showPowerDemo,showTitle,draw,fitCanvas,showPause,showSettings,showPracticeMenu,nextPractice,showIntro,drawWorld,drawBoss,drawPowerDemo,persist,resumePlay};',context);
 await context.game.bootReady;
 return Object.assign(context.game,{events,nodes,timers,storage,context,document,modules,
  flushTimers(){const pending=timers.splice(0);for(const t of pending)t.fn();},
  tick(frames=1){for(let i=0;i<frames;i++)context.game.update(modules.STEP);},
 });
}
