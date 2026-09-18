import {copyPractice,shuffledBag,hashSeed} from './practice-config.js';
import {moduleFor} from './math-modules.js';
import {makeSubtraction} from './subtraction.js';
import {PROBLEMS,ROOMS,stageFor} from './stage-data.js';
import {makeExpansionProblem} from './curriculum.js';
import {absolute,fromAbsolute,formatTime,elapsedText,timeWords} from './time-engine.js';

export const DEFAULT_GATE_QUESTIONS=2;
export const MAX_GATE_QUESTIONS=10;
export const gateQuestionCount=n=>Number.isFinite(Number(n))?Math.max(1,Math.min(MAX_GATE_QUESTIONS,Math.round(Number(n)))):DEFAULT_GATE_QUESTIONS;

// Store a run number, not generated prose, in the save. The same run always
// reconstructs the same questions after a reload, including partial gates.
function variant(base,run,index){
 let seed=[...`${base.id}:${run}:${index}`].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
 const pick=values=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return values[seed%values.length];};
 const p={...base,templateId:base.templateId||base.id,id:`${base.id}__${run}_${index}`};
 let start=absolute(base.start),duration=base.duration;
 const hour=()=>pick([7,8,9,10]),quarterHour=()=>pick([8,9,10,13,14,15,16]);
 switch(base.id){
  case 'foundry_cooldown':start=hour()*60+pick([10,20,25,35,45]);duration=pick([60,120,180]);break;
  case 'foundry_minutes':start=hour()*60+pick([40,45,50,55]);duration=pick([25,35,45,55]);break;
  case 'foundry_shift':start=hour()*60+pick([20,30,40,50]);duration=pick([75,95,110,145]);break;
  case 'foundry_crane':start=600+pick([15,30,45,55]);duration=pick([150,165,195,210]);break;
  case 'foundry_elapsed':start=hour()*60+pick([5,10,20,25]);duration=pick([65,85,95,110]);break;
  case 'foundry_noon_exact':duration=pick([15,30,45,75,90]);start=720-duration;break;
  case 'metro_departure':start=hour()*60+pick([10,20,25,40]);duration=-pick([65,75,95,115]);break;
  case 'metro_borrow':start=hour()*60+pick([0,5,10,15]);duration=-pick([35,40,45,55]);break;
  case 'metro_noon':start=720+pick([15,30,45,60]);duration=-pick([90,105,120,135]);break;
  case 'metro_missing_start':start=780+pick([5,15,20,30]);duration=-pick([145,155,165,175]);break;
  case 'metro_midnight':start=pick([5,10,15,20,25]);duration=-pick([40,50,65,75]);break;
  case 'metro_duration_unknown':start=720+pick([5,10,15,25]);duration=-pick([125,130,145,155]);break;
  case 'tower_quarter_past':start=0;duration=quarterHour()*60+15;break;
  case 'tower_half_past':start=0;duration=quarterHour()*60+30;break;
  case 'tower_quarter_to':start=0;duration=quarterHour()*60+45;break;
  case 'tower_word_addition':start=quarterHour()*60+45;duration=pick([30,45,75,90]);break;
  case 'tower_elapsed':start=660+pick([15,30,45]);duration=765-start;break;
  case 'tower_word_subtraction':start=quarterHour()*60+30;duration=-pick([45,75,90,105]);break;
  case 'sky_24_pm':case 'sky_12_pm':start=pick([13,14,15,16,17,18,19,20])*60+pick([0,15,30,45]);duration=0;break;
  case 'sky_midnight_label':start=0;duration=0;break;
  case 'sky_noon_label':start=720;duration=0;break;
  case 'sky_midnight_trip':start=1380+pick([20,30,40,45,50]);duration=pick([75,85,95,115]);break;
  case 'sky_elapsed':start=1380+pick([15,25,35,45]);duration=1440+pick([20,30,40,55])-start;break;
 }
 p.start=fromAbsolute(start);p.duration=duration;
 const time=n=>formatTime(fromAbsolute(n),!!p.notation24);
 const words=n=>`${timeWords(fromAbsolute(n))} ${n%1440<720?'in the morning':'in the afternoon or evening'}`;
 if(p.task==='duration'){
  p.end=fromAbsolute(start+duration);
  p.context=`${base.id.startsWith('tower')?'The bells ring':'The route runs'} from ${p.hideStart?words(start):time(start)} to ${p.hideStart?words(start+duration):time(start+duration)}. How much time passes?`;
 }else if(p.task==='convert')p.context=`The beacon shows ${formatTime(p.start,!p.notation24)}. ${p.notation24?'Enter its time on the 24-hour display.':'Choose the equivalent AM/PM time.'}`;
 else if(p.task==='read'){p.context=`Set the clock to ${words(duration)}.`;p.hint=p.skill==='quarter to'?'Quarter to means 15 minutes before the next named hour.':'Quarter past means 15 minutes after the named hour.';}
 else if(p.task==='words')p.context=`The bell rings at ${time(duration)}. Choose the matching words.`;
 else if(duration<0)p.context=`${base.id.startsWith('tower')?'The rehearsal ends':'The train arrives'} at ${p.hideStart?words(start):time(start)}. It takes ${elapsedText(duration)}. ${base.id==='metro_midnight'?'Choose its departure time, including the day.':'What was the start time?'}`;
 else p.context=`${base.id.startsWith('sky')?'The airship leaves':'The machine starts'} at ${p.hideStart?words(start):time(start)} and runs for ${elapsedText(duration)}. ${base.id.startsWith('sky')?'Set the arrival time and day.':'Set the finish time.'}`;
 return p;
}

export function buildGateQuestions(gate,count=DEFAULT_GATE_QUESTIONS,run=0){
 const templates=gate.problems.map(id=>PROBLEMS.find(p=>p.id===id)).filter(Boolean);
 if(!templates.length)throw new Error(`No question templates for ${gate.id}`);
 const number=gateQuestionCount(count),attempt=Math.max(1,run),offset=(attempt-1)*(number===1?1:2);
 return Array.from({length:number},(_,i)=>{
  const base=templates[(offset+i)%templates.length];
  const p=base.expansion?makeExpansionProblem(base.templateId,attempt*103+i):run<=1&&i<templates.length?{...base}:variant(base,run,i);
  return {...p,templateId:base.templateId||base.id,id:run<=1&&i<templates.length?base.id:`${gate.id}__${run}_${i}`};
 });
}
export const problemFingerprint=p=>moduleFor(p).fingerprint?.(p)??JSON.stringify([p.context,p.schedule,p.tableNote,p.trips,p.steps,p.notation24]);
export function buildPracticeCheck(problem,serial=1,excluded=[]){
 if(moduleFor(problem).check)return moduleFor(problem).check(problem,serial);
 const id=problem.templateId||problem.id.split('__')[0],base=PROBLEMS.find(p=>(p.templateId||p.id)===id)||problem;
 let next;
 const seen=new Set([problemFingerprint(problem),...excluded]);
 for(let retry=0;retry<128;retry++){
  const seed=serial*7919+retry*37+[...problem.id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const related=retry>16&&!base.expansion?PROBLEMS.filter(p=>!p.expansion&&p.id.split('_')[0]===base.id.split('_')[0]&&p.task===base.task):[];
  const source=related.length?related[retry%related.length]:base;
  next=source.expansion?makeExpansionProblem(source.templateId,seed):variant(source,seed,serial+retry);
  if(!seen.has(problemFingerprint(next)))break;
 }
 return {...next,templateId:next.templateId||base.templateId||base.id,id:`${problem.id}__check_${serial}`};
}

// Allocate across the entire stage, rather than restarting a bag at each gate.
export function buildModularGate(gate,count,run,config,seed){
 const c=copyPractice(config),stage=stageFor(ROOMS.find(r=>r.gate?.id===gate.id)?.stage),number=gateQuestionCount(count);
 const subjects=shuffledBag(c.subjects,stage.gates.length*number,`${seed}:subjects`);
 const types=shuffledBag(c.subtraction.types.length?c.subtraction.types:['minuend-equation'],subjects.filter(s=>s==='subtraction').length,`${seed}:types`);
 const offset=stage.gates.indexOf(gate.id)*number,legacy=buildGateQuestions(gate,number,run);
 return legacy.map((p,i)=>{
  const slot=offset+i;if(subjects[slot]==='time')return p;
  const type=types[subjects.slice(0,slot).filter(s=>s==='subtraction').length];
  const q=makeSubtraction(type,hashSeed(`${seed}:${stage.id}:${gate.id}:${slot}:${type}:1`),c.subtraction,`${gate.id}__${run}_${i}_subtraction_${type}_${seed}`);
  return {...q,effect:PROBLEMS.find(p=>p.id===gate.problems[0])?.effect||'Gate circuit charged'};
 });
}
