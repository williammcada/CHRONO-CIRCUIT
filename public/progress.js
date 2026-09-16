import {modeOf} from './answer-mode.js';
import {BOSS_ROOM,GATE_IDS,ROOMS,STAGES,PROBLEMS,stageFor} from './stage-data.js';
import {buildGateQuestions,gateQuestionCount,buildPracticeCheck,problemFingerprint} from './gate-questions.js';
import {answerCorrect,taskHint} from './math-tasks.js';
import {makeExpansionProblem} from './curriculum.js';
import {generateProblem} from './time-engine.js';
export const SAVE_KEY='chrono-circuit-save-v1';
export const MAX_ENERGY=8;
export const DEFAULT_SETTINGS={assist:true,mute:false,musicMute:false,effectsMute:false,musicVolume:.6,effectsVolume:.7,reducedMotion:false,contrast:false,narration:false,band:'story',showHints:true,touchControls:false,questionsPerGate:2,answerMode:'guide',stageModes:{}};
const freshRoute=s=>({room:s.start,roomId:ROOMS[s.start]?.id,checkpoint:s.start,checkpointId:ROOMS[s.start]?.id,bestRoom:s.start,bestRoomId:ROOMS[s.start]?.id,complete:false,started:false,questionsPerGate:2,answerMode:'guide',attempt:0});
export function freshSave(settings={}){
 return {version:5,learning:{},world:{},roomId:ROOMS[0]?.id,checkpointId:ROOMS[0]?.id,room:0,checkpoint:0,solved:[],answered:[],complete:false,run:0,settings:{...DEFAULT_SETTINGS,...settings,questionsPerGate:gateQuestionCount(settings.questionsPerGate??2)},records:[],powerUnlocked:false,energy:8,cleared:[],weapons:[],equipped:'brake',stage:'foundry',bestRoom:0,routes:Object.fromEntries(STAGES.map(s=>[s.id,freshRoute(s)]))};
}
export function questionsForGate(save,id){
 const room=ROOMS.find(r=>r.gate?.id===id);if(!room)return [];
 const route=save.routes[room.stage];return buildGateQuestions(room.gate,route.questionsPerGate,route.attempt);
}
export function startStageRun(save,id){
 const s=stageFor(id),old=save.routes[s.id];
 save.solved=save.solved.filter(g=>!s.gates.includes(g));
 save.answered=save.answered.filter(p=>!p.startsWith(s.id+'_'));
 save.routes[s.id]={...freshRoute(s),attempt:Math.min(1000000,old.attempt+1),questionsPerGate:gateQuestionCount(save.settings.questionsPerGate),answerMode:modeOf(save.settings.stageModes?.[s.id]||save.settings.answerMode)};
 for(const key of Object.keys(save.world||{}))if(ROOMS.find(room=>room.id===key)?.stage===s.id)delete save.world[key];
 for(const key of Object.keys(save.learning||{}))if(key.startsWith(s.id+'_'))delete save.learning[key];
 save.energy=MAX_ENERGY;rememberRoom(save,s.start);
}
export function validRecord(r){return !!r&&typeof r.id==='string'&&typeof r.skill==='string'&&typeof r.representation==='string'&&Array.isArray(r.boundary)&&Array.isArray(r.errors)&&r.errors.every(e=>typeof e==='string')&&Number.isFinite(r.seconds)&&r.seconds>=0&&Number.isInteger(r.attempts)&&r.attempts>0&&['independent','self-corrected','scaffolded','demonstrated'].includes(r.support);}
export function checkpointFor(room){const s=stageFor(ROOMS[room]?.stage);return ROOMS.slice(s.start,room+1).filter(r=>r.checkpoint).at(-1)?.index||s.start;}
export const stageSolved=(save,stage=save.stage)=>stageFor(stage).gates.filter(id=>save.solved.includes(id)).length;
export const canEnterBoss=(save,stage=save.stage)=>stageFor(stage).gates.every(id=>save.solved.includes(id));
export function completeGate(save,id){if(!GATE_IDS.includes(id)||!questionsForGate(save,id).every(p=>save.answered.includes(p.id)))return false;if(!save.solved.includes(id))save.solved.push(id);return true;}
export function rememberRoom(save,index){
 const s=stageFor(ROOMS[index].stage),route=save.routes[s.id];
 route.room=index;route.roomId=ROOMS[index].id;route.checkpoint=Math.max(route.checkpoint??s.start,checkpointFor(index));route.checkpointId=ROOMS[route.checkpoint].id;route.bestRoom=Math.max(route.bestRoom,index);route.bestRoomId=ROOMS[route.bestRoom].id;route.started=true;
 Object.assign(save,{stage:s.id,roomId:route.roomId,checkpointId:route.checkpointId,room:index,checkpoint:route.checkpoint,bestRoom:route.bestRoom,complete:route.complete});
}
export function awardStage(save,stage){
 const s=stageFor(stage);save.routes[stage].complete=true;save.complete=true;
 if(!save.cleared.includes(stage))save.cleared.push(stage);
 if(!save.weapons.includes(s.powerId))save.weapons.push(s.powerId);
 save.equipped=s.powerId;save.powerUnlocked=save.weapons.includes('brake');save.energy=MAX_ENERGY;
}
export function migrateSave(raw){
 if(!raw||![1,2,3,4,5].includes(raw.version)||!Array.isArray(raw.records)||raw.records.length>200||!raw.records.every(validRecord)||!raw.settings||!['story','backward','quarters','24hour','mixed','tidal','garden','prism','fair'].includes(raw.settings.band))return null;
 if(!Number.isInteger(raw.room)||raw.room<0||raw.room>(raw.version===1?6:raw.version===2?BOSS_ROOM:ROOMS.length-1)||!Array.isArray(raw.solved))return null;
 const next=freshSave();
 for(const [key,value] of Object.entries(DEFAULT_SETTINGS)){const candidate=raw.settings[key];if(typeof candidate===typeof value&&(typeof value!=='number'||Number.isFinite(candidate)))next.settings[key]=key==='questionsPerGate'?gateQuestionCount(candidate):typeof value==='number'?Math.max(0,Math.min(1,candidate)):candidate;}
 next.settings.answerMode=modeOf(raw.settings.answerMode);next.settings.stageModes=Object.fromEntries(STAGES.filter(s=>['teach','guide','independent','mastery'].includes(raw.settings.stageModes?.[s.id])).map(s=>[s.id,raw.settings.stageModes[s.id]]));
 next.world={};for(const [id,value] of Object.entries(raw.world||{}))if(ROOMS.some(room=>room.id===id)&&value&&typeof value==='object')next.world[id]=JSON.parse(JSON.stringify(value));
 next.records=raw.records.slice(-160);next.run=Number.isInteger(raw.run)?Math.max(0,raw.run):0;
 next.weapons=Array.isArray(raw.weapons)?[...new Set(raw.weapons.filter(w=>['brake','lance','disc','burst','depth','roller','orbit','arc'].includes(w)))]:[];
 if(raw.powerUnlocked&&!next.weapons.includes('brake'))next.weapons.push('brake');
 next.powerUnlocked=next.weapons.includes('brake');next.equipped=next.weapons.includes(raw.equipped)?raw.equipped:next.weapons[0]||'brake';
 if(raw.version===1){next.legacyFoundryCleared=!!raw.complete;return next;}
 next.solved=[...new Set(raw.solved.filter(id=>GATE_IDS.includes(id)))];
 next.energy=Number.isFinite(raw.energy)?Math.max(0,Math.min(8,raw.energy)):8;
 next.cleared=Array.isArray(raw.cleared)?[...new Set(raw.cleared.filter(id=>STAGES.some(s=>s.id===id)))]:[];
 if(raw.version===2){Object.assign(next.routes.foundry,{room:raw.room,checkpoint:checkpointFor(raw.room),bestRoom:Math.max(raw.room,Math.min(12,raw.bestRoom||0)),complete:!!raw.complete,started:raw.room>0||raw.solved.length>0});if(raw.complete&&!next.cleared.includes('foundry'))next.cleared.push('foundry');}
 else for(const s of STAGES){
  const r=raw.routes?.[s.id];next.routes[s.id].answerMode=modeOf(r?.answerMode);if(!r||!Number.isInteger(r.room)||r.room<s.start||r.room>s.end)continue;
  Object.assign(next.routes[s.id],{room:r.room,checkpoint:checkpointFor(r.room),bestRoom:Math.max(r.room,Math.min(s.end,Number.isInteger(r.bestRoom)?r.bestRoom:s.start)),complete:!!r.complete,started:!!r.started});
  if(raw.version>=4){next.routes[s.id].questionsPerGate=gateQuestionCount(r.questionsPerGate??2);next.routes[s.id].attempt=Number.isInteger(r.attempt)?Math.max(0,Math.min(1000000,r.attempt)):0;}
 }
 // Stable IDs are authoritative for v0.7 saves; legacy numeric indices keep their frozen v0.6 meaning.
 if(raw.version>=5)for(const s of STAGES){const old=raw.routes?.[s.id],r=next.routes[s.id];if(!old)continue;for(const key of ['room','checkpoint','bestRoom']){const index=ROOMS.findIndex(room=>room.id===old[key+'Id']&&room.stage===s.id);if(index>=0)r[key]=index;}}
 for(const s of STAGES){const r=next.routes[s.id];r.roomId=ROOMS[r.room].id;r.checkpointId=ROOMS[r.checkpoint].id;r.bestRoomId=ROOMS[r.bestRoom].id;}
 const canonicalQuestions=new Map(GATE_IDS.flatMap(id=>questionsForGate(next,id).map(p=>[p.id,p])));
 const validQuestions=new Set(canonicalQuestions.keys());
 next.answered=Array.isArray(raw.answered)?[...new Set(raw.answered.filter(id=>validQuestions.has(id)))]:[];
 if(raw.version<4){for(const id of next.solved)for(const p of questionsForGate(next,id)){if(!next.answered.includes(p.id))next.answered.push(p.id);}}
 else next.solved=next.solved.filter(id=>questionsForGate(next,id).every(p=>next.answered.includes(p.id)));
 // v0.5 could be saved in a replay with old gates still open. Reopen those
 // clocks once on upgrade, retaining the permanent boss rewards and report.
 if(raw.version<4)for(const s of STAGES)if(next.cleared.includes(s.id)&&next.routes[s.id].started&&!next.routes[s.id].complete)startStageRun(next,s.id);
 for(const s of STAGES){
  const r=next.routes[s.id];
  const blocked=ROOMS.slice(s.start,r.room).find(room=>room.gate&&!next.solved.includes(room.gate.id));
  if(blocked){r.room=blocked.index;r.checkpoint=checkpointFor(r.room);r.complete=false;}
 }
 if(raw.version>=5&&raw.learning&&typeof raw.learning==='object')for(const [id,entry] of Object.entries(raw.learning).slice(-500)){
  const checked=validatedLearningEntry(id,entry,canonicalQuestions,next.answered);
  if(checked)next.learning[id]=checked;
 }
 const active=raw.version>=3?stageFor(raw.stage):STAGES[0];
 const r=next.routes[active.id];Object.assign(next,{stage:active.id,roomId:ROOMS[r.room].id,checkpointId:ROOMS[r.checkpoint].id,room:r.room,checkpoint:r.checkpoint,bestRoom:r.bestRoom,complete:r.complete});
 return next;
}
const plainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const canonicalJSON=value=>JSON.stringify(value,(_,v)=>plainObject(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
function knownPracticeProblem(original){
 if(!plainObject(original)||typeof original.id!=='string')return null;
 if(original.expansion&&Number.isSafeInteger(original.variantSeed)&&original.variantSeed>=0)return makeExpansionProblem(original.templateId,original.variantSeed);
 const authored=PROBLEMS.find(p=>p.id===original.id);if(authored)return authored;
 const parts=original.id.match(/^(story|backward|quarters|24hour)-(\d+)-(clock|platforms|timeline)$/);
 return parts?generateProblem(Number(parts[2]),parts[1],parts[3]):null;
}
// Untrusted report imports may contain malformed sessions. Discard the affected
// session while retaining valid routes, earned rewards and other learning work.
function validatedLearningEntry(id,e,questions,answered){
 try{
  if(!plainObject(e)||!plainObject(e.original)||!plainObject(e.current)||(e.key||e.original.id)!==id)return null;
  if(!plainObject(e.draft)||!Array.isArray(e.errors)||e.errors.length>10000||e.errors.some(v=>typeof v!=='string'||v.length>120))return null;
  const fields=new Set(['hour','minute','period','day','amount','hours','minutes','seconds','route','durationUnit','choice']);
  if(Object.entries(e.draft).some(([key,value])=>!fields.has(key)||typeof value!=='string'||value.length>64))return null;
  if(!['working','check_pending','credited'].includes(e.status)||!['answer','demonstration','complete'].includes(e.phase)||!['independent','self-corrected','scaffolded','demonstrated'].includes(e.support))return null;
  if(!Number.isInteger(e.attempts)||e.attempts<0||e.attempts>1000000||!Number.isInteger(e.totalAttempts)||e.totalAttempts<e.attempts||e.totalAttempts>1000000||!Number.isInteger(e.checkSerial)||e.checkSerial<0||e.checkSerial>10000)return null;
  if(!Number.isFinite(e.startedAt)||e.startedAt<0||(e.feedback!==undefined&&(typeof e.feedback!=='string'||e.feedback.length>5000)))return null;
  if(e.status==='credited'?(e.phase!=='complete'||(!id.startsWith('practice:')&&!answered.includes(e.original.id))):e.phase==='complete')return null;
  if(e.phase==='demonstration'&&(e.status!=='check_pending'||(e.attempts!==4&&e.answerMode!=='teach')))return null;
  if(e.status==='working'&&(e.phase!=='answer'||e.checkSerial!==0))return null;
  if(e.status==='check_pending'&&e.checkSerial===0&&e.phase!=='demonstration')return null;
  const canonical=questions.get(id)||(id===`practice:${e.original.id}`?knownPracticeProblem(e.original):null);
  if(!canonical||canonicalJSON(canonical)!==canonicalJSON(e.original))return null;
  const seen=e.seenFingerprints||[];
  if(!Array.isArray(seen)||seen.length>e.checkSerial+1||seen.some(v=>typeof v!=='string'||v.length>20000))return null;
  if(e.checkSerial>0&&(seen.length!==e.checkSerial+1||!seen.includes(problemFingerprint(canonical))))return null;
  const current=e.checkSerial?buildPracticeCheck(canonical,e.checkSerial,seen):canonical;
  if(canonicalJSON(current)!==canonicalJSON(e.current))return null;
  return {answerMode:modeOf(e.answerMode),masteryFirst:!!e.masteryFirst,key:id,original:JSON.parse(JSON.stringify(canonical)),current:JSON.parse(JSON.stringify(current)),status:e.status,phase:e.phase,attempts:e.attempts,totalAttempts:e.totalAttempts,checkSerial:e.checkSerial,errors:[...e.errors],draft:{...e.draft},startedAt:e.startedAt,support:e.support,...(e.feedback!==undefined?{feedback:e.feedback}:{}),...(seen.length?{seenFingerprints:[...seen]}:{})};
 }catch{return null;}
}
export const validSave=raw=>migrateSave(raw)!==null;

// Learning sessions survive clock exits, retries and reloads. Only a correct
// unrevealed response can commit an item; demonstrating one never earns credit.
export function learningSession(save,problem,options={}){
 save.learning ||= {};
 const key=options.practice?`practice:${problem.id}`:problem.id;
 if(!save.learning[key]||(options.practice&&save.learning[key].status==='credited'))save.learning[key]={key,original:JSON.parse(JSON.stringify(problem)),current:JSON.parse(JSON.stringify(problem)),status:'working',phase:'answer',attempts:0,totalAttempts:0,checkSerial:0,errors:[],draft:{},startedAt:Date.now(),support:'independent'};
 return save.learning[key];
}
export function submitLearningAnswer(save,session,candidate,options={}){
 if(session.status==='credited')return {correct:true,alreadyCredited:true};
 if(session.phase==='demonstration')return {correct:false,demonstration:true};
 const mode=modeOf(options.answerMode);session.answerMode=mode;session.attempts++;session.totalAttempts++;
 if(answerCorrect(session.current,candidate)){
  if(mode==='mastery'&&!session.masteryFirst){session.masteryFirst=true;session.phase='demonstration';nextLearningCheck(session);return {correct:false,transfer:true};}
  session.status='credited';session.phase='complete';
  session.support=mode==='teach'?'scaffolded':mode==='mastery'&&session.totalAttempts===2?'independent':session.checkSerial?'demonstrated':session.totalAttempts===1?'independent':session.totalAttempts===2?'self-corrected':'scaffolded';
  if(!options.practice&&!save.answered.includes(session.original.id))save.answered.push(session.original.id);
  if(options.gateId&&!options.practice)completeGate(save,options.gateId);
  return {correct:true,credited:true};
 }
 session.support=session.checkSerial?'demonstrated':session.attempts===1?'self-corrected':'scaffolded';
 session.errors.push(taskHint(session.current,candidate).error);
 session.masteryFirst=false;
 if(mode!=='independent'&&mode!=='mastery'&&session.attempts>=4){session.status='check_pending';session.phase='demonstration';session.support='demonstrated';}
 return {correct:false,demonstration:session.phase==='demonstration'};
}
export function nextLearningCheck(session){
 if(session.phase!=='demonstration')return false;
 session.seenFingerprints ||= [problemFingerprint(session.original)];session.seenFingerprints.push(problemFingerprint(session.current));session.checkSerial++;session.current=buildPracticeCheck(session.original,session.checkSerial,session.seenFingerprints);session.attempts=0;session.draft={};session.status='check_pending';session.phase='answer';return true;
}
