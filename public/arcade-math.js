// Chrono host adapter. Catalog, settings and progression come from Olivia unchanged.
import {Practice,freshMath,validMath,catalog,pool} from './shared-math.js';
import {freshSave,migrateSave,startStageRun,questionsForGate} from './progress.js';
import {GATE_IDS,STAGES,ROOMS,stageFor} from './stage-data.js';
import {newRunSeed,randomSource} from './practice-config.js';

const clone=value=>structuredClone(value);
export function initialMath(settings={}){
 const state=freshMath('g3-time-quarter');
 state.config.count=settings.questionsPerGate||2;
 const old=settings.mathPractice;
 if(old?.subjects?.includes('subtraction')){
  const maximum=old.subtraction?.maximum||100,types=old.subtraction?.types||[],words=types.some(t=>t.endsWith('-word'));
  const numberSkill=maximum<=20?'g1-missing':maximum<=100?'g2-missing':'g3-submissing';
  state.config.selected=[...(old.subjects.includes('time')?['g3-time-quarter']:[]),numberSkill,...(words?[maximum<=20?'g1-stories':'N05']:[])];
  const grades=state.config.selected.map(id=>catalog.find(s=>s.id===id).grade);state.config.lo=Math.min(...grades);state.config.hi=Math.max(...grades);
  state.note='Earlier subtraction used separate unknown types, ranges and zero settings. The initial shared selection is an approximation and may mix addition with subtraction; review it before starting a new gate. Begun legacy gates and reports are preserved.';
 }
 return state;
}
export function freshGameSave(settings={}){const save=freshSave(settings);save.version=7;save.sharedMath=initialMath(settings);save.sharedGates={};return save;}
export const sharedSummary=save=>{const c=save.sharedMath.config;return `${c.mode==='targeted'?'Targeted Review':c.mode==='progression'?'Fixed Progression':'General Review'} · grades ${c.lo===0?'K':c.lo}–${c.hi} · ${c.count} per gate${c.mode==='targeted'?' · '+pool(c).map(s=>s.name).join('; '):''}`;};
export const gateRunId=(save,id)=>{if(id==='relay')return save.sharedGates.relay?.runId||'';const room=ROOMS.find(r=>r.gate?.id===id),route=save.routes[room.stage];return `${room.stage}:${route.attempt}:${route.seed}`;};
const slotId=(id,entry,i)=>`${id}__shared_${entry.runId}_${i}`;
export function sharedGateSlots(id,entry){return Array.from({length:entry.count},(_,i)=>({id:slotId(id,entry,i)}));}
export function questionsForGameGate(save,id){const entry=save.sharedGates?.[id];return entry?sharedGateSlots(id,entry):questionsForGate(save,id);}
export function useSharedGate(save,id){
 if(!save.sharedMath||save.solved.includes(id))return false;
 if(save.sharedGates[id])return true;
 // Only already-begun legacy work keeps the old instructional contract.
 return !questionsForGate(save,id).some(p=>save.answered.includes(p.id)||save.learning[p.id]);
}
export function startGameStageRun(save,id){
 startStageRun(save,id);
 if(!save.sharedMath)return;
 for(const gate of stageFor(id).gates){delete save.sharedGates[gate];if(save.sharedMath.gate?.context===gate)save.sharedMath.gate=null;}
}

// Seed only synchronous generation; gameplay/preview randomness remains independent.
class SeededPractice extends Practice {
 next(){
  const seed=newRunSeed(),g=this.state.gate,skip=g.config.mode!=='progression'&&!g.bag.length?pool(g.config).length-1:0;
  const original=Math.random;this.generating=true;
  try{Math.random=randomSource(seed);super.next();g.item.sourceSeed=seed;g.item.sourceSkip=skip;}
  finally{Math.random=original;this.generating=false;}
  this.flush();
 }
}
export function practiceFor(save,persist=()=>{}){
 let p;const flush=()=>{if(!p?.generating)persist();};p=new SeededPractice(save.sharedMath,flush);p.flush=flush;return p;
}
export function persistGate(save,id,persist=()=>{}){
 const entry=save.sharedGates[id];if(!entry)return;
 entry.gate=save.sharedMath.gate?clone(save.sharedMath.gate):null;
 entry.completed=entry.gate?.completed??entry.count;
 if(id!=='relay'){
  for(let i=0;i<entry.completed;i++){const key=slotId(id,entry,i);if(!save.answered.includes(key))save.answered.push(key);}
  if(entry.completed===entry.count&&!save.solved.includes(id))save.solved.push(id);
 }
 persist();
}
export function openSharedPractice(save,id,persist=()=>{},restartRelay=false){
 if(id==='relay'&&restartRelay){delete save.sharedGates.relay;save.sharedMath.gate=null;}
 let entry=save.sharedGates[id];
 if(entry&&entry.completed===entry.count)return null;
 if(!entry){const config=clone(save.sharedMath.config);if(id==='relay')config.count=5;
  entry=save.sharedGates[id]={runId:id==='relay'?`relay:${Date.now()}:${newRunSeed()}`:gateRunId(save,id),count:config.count,completed:0,gate:null,draft:''};
  // A relay's five-question snapshot must not change the adult gate-count setting.
  const saved=save.sharedMath.config;save.sharedMath.config=config;
  const p=practiceFor(save,()=>{});p.open(id,entry.runId);save.sharedMath.config=saved;entry.gate=clone(save.sharedMath.gate);
 }else save.sharedMath.gate=clone(entry.gate);
 persistGate(save,id,persist);return practiceFor(save,()=>persistGate(save,id,persist));
}
export function submitShared(save,id,p,response){
 const g=p.state.gate;if(!g)return {correct:false,complete:false};
 const item=clone(g.item),attempts=g.attempts+1,ordinal=g.completed;
 const result=p.submit(response);
 if(result.correct){
  save.sharedGates[id].draft='';
  save.records.push({id:slotId(id,save.sharedGates[id],ordinal),templateId:item.skillId,skill:catalog.find(s=>s.id===item.skillId).name,representation:'text',answerMode:'shared',moduleId:'shared',typeId:item.skillId,boundary:[],support:attempts===1?'independent':'self-corrected',attempts,errors:[],seconds:0,at:Date.now()});
  save.records=save.records.slice(-160);
 }
 return result;
}
export function resetShared(save){
 const config=clone(save.sharedMath.config);save.sharedMath=initialMath();save.sharedMath.config=config;
 for(const [id,entry]of Object.entries(save.sharedGates)){if(entry.completed<entry.count){const ids=new Set(sharedGateSlots(id,entry).map(p=>p.id));save.answered=save.answered.filter(id=>!ids.has(id));delete save.sharedGates[id];}}
 save.records=save.records.filter(r=>r.moduleId!=='shared');
}
const canonicalItem=item=>{
 if(!Number.isInteger(item.sourceSeed)||item.sourceSeed<0||item.sourceSeed>4294967295||!Number.isInteger(item.sourceSkip)||item.sourceSkip<0||item.sourceSkip>=catalog.length)return false;
 const original=Math.random;let expected;
 try{const random=randomSource(item.sourceSeed);for(let i=0;i<item.sourceSkip;i++)random();Math.random=random;expected=catalog.find(s=>s.id===item.skillId)?.make();}finally{Math.random=original;}
 return !!expected&&Object.entries(expected).every(([key,value])=>JSON.stringify(item[key])===JSON.stringify(value));
};
export function migrateGameSave(raw){
 try{
  if(!raw||![1,2,3,4,5,6,7].includes(raw.version))return null;
  const legacy=clone(raw);if(legacy.version===7)legacy.version=6;
  let next=migrateSave(legacy);if(!next)return null;
  if(raw.version<7){next.version=7;next.sharedMath=initialMath(next.settings);next.sharedGates={};return next;}
  if(!validMath(raw.sharedMath)||raw.sharedMath.gate&&!canonicalItem(raw.sharedMath.gate.item)||!raw.sharedGates||typeof raw.sharedGates!=='object'||Array.isArray(raw.sharedGates))return null;
  const entries=Object.entries(raw.sharedGates);if(entries.length>GATE_IDS.length+1)return null;
  for(const [id,e]of entries){
   if(!GATE_IDS.includes(id)&&id!=='relay'||!e||typeof e.runId!=='string'||e.runId.length>120||!Number.isInteger(e.count)||e.count<1||e.count>10||!Number.isInteger(e.completed)||e.completed<0||e.completed>e.count||typeof e.draft!=='string'||e.draft.length>80)return null;
   if(id!=='relay'&&e.runId!==gateRunId(next,id))return null;
   if(e.completed===e.count){if(e.gate!==null)return null;}
   else if(!e.gate||e.gate.context!==id||e.gate.runId!==e.runId||e.gate.config.count!==e.count||e.gate.completed!==e.completed||!validMath({...raw.sharedMath,gate:e.gate})||!canonicalItem(e.gate.item))return null;
   // Allow core migration to retain the actual room behind completed shared gates.
   if(id!=='relay'&&e.completed===e.count){legacy.answered=[...(legacy.answered||[]),...questionsForGate(next,id).map(p=>p.id)];if(!legacy.solved.includes(id))legacy.solved.push(id);}
  }
  next=migrateSave(legacy);if(!next)return null;
  next.version=7;next.sharedMath=clone(raw.sharedMath);next.sharedGates=clone(raw.sharedGates);
  for(const [id,e]of entries)if(id!=='relay'){
   const legacyIds=new Set(questionsForGate(next,id).map(p=>p.id));next.answered=next.answered.filter(id=>!legacyIds.has(id));
   next.answered.push(...sharedGateSlots(id,e).slice(0,e.completed).map(p=>p.id));
   if(e.completed<e.count)next.solved=next.solved.filter(g=>g!==id);
  }
  return next;
 }catch{return null;}
}
