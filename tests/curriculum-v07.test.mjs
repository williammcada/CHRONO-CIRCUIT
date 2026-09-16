import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPANSION_GATE_TEMPLATES,QUESTION_SETS,makeExpansionProblem} from '../public/curriculum.js';
import {ROOMS,STAGES,PROBLEMS} from '../public/stage-data.js';
import {absolute,fromAbsolute} from '../public/time-engine.js';
import {expectedAnswer,answerCorrect} from '../public/math-tasks.js';
import {buildGateQuestions,buildPracticeCheck,problemFingerprint} from '../public/gate-questions.js';
import {freshSave,startStageRun,questionsForGate,learningSession,submitLearningAnswer,nextLearningCheck,migrateSave,rememberRoom,canEnterBoss} from '../public/progress.js';
import {candidateFromDraft,parseDurationDraft,parseTimeDraft} from '../public/gate-ui.js';
const templates=Object.entries(EXPANSION_GATE_TEMPLATES).flatMap(([gate,kinds])=>kinds.map(kind=>`${gate}_${kind}`));
function draftFor(p){
 const a=expectedAnswer(p);
 if(p.task==='route')return {route:a};
 if(p.task==='quantity')return {amount:String(a)};
 if(p.task==='seconds'&&p.unitTarget==='seconds')return {amount:String(a)};
 if(p.task==='seconds'&&p.unitTarget==='minutes')return {amount:String(a/60)};
 if(p.task==='comparison'||p.task==='seconds'||p.task==='duration'){
  const secs=p.task==='comparison'?a.seconds:p.task==='duration'?a*60:a;
  return {route:a.route,hours:p.unitTarget==='minutesSeconds'?'':String(Math.floor(secs/3600)),minutes:String(p.unitTarget==='minutesSeconds'?Math.floor(secs/60):Math.floor(secs%3600/60)),seconds:String(secs%60)};
 }
 const h=Math.floor(a.minuteOfDay/60);return {hour:String(p.notation24?h:h%12||12),minute:String(a.minuteOfDay%60),period:h>=12?'PM':'AM',day:String(a.dayOffset)};
}
test('48 new structural templates and 72 campaign templates; every seed can be entered exactly',()=>{
 assert.equal(templates.length,48);assert.equal(PROBLEMS.length,72);
 for(const id of templates)for(let seed=1;seed<=64;seed++){
  const p=makeExpansionProblem(id,seed);assert.ok(p.context.length>20,id);assert.ok(!p.context.includes('undefined'),id);
  assert.ok(answerCorrect(p,candidateFromDraft(p,draftFor(p))),`${id} seed ${seed}`);
 }
});
test('generated timetable answers obey readiness, arrival deadlines, waiting and ordering',()=>{
 for(const id of templates.filter(id=>id.startsWith('tidal_')))for(let seed=1;seed<=64;seed++){
  const p=makeExpansionProblem(id,seed),rows=p.schedule;if(!rows)continue;
  if(p.gate==='tidal_wait'){assert.equal(p.answerSeconds,(rows[0].departure-rows[0].arrival)*60);continue;}
  const ready=p.arrival+p.transferMinutes,catchable=rows.filter(r=>r.departure>=ready),feasible=catchable.filter(r=>p.deadline===undefined||r.arrival<=p.deadline);
  if(id.endsWith('_catch'))assert.equal(p.answerRoute,catchable.sort((a,b)=>a.departure-b.departure)[0].id);
  if(id.endsWith('_none'))assert.equal(catchable.length,0);
  if(id.endsWith('_feasible')){assert.equal(feasible.length,1);assert.equal(p.answerRoute,feasible[0].id);}
  if(id.endsWith('_earliest_arrival'))assert.equal(p.answerRoute,feasible.sort((a,b)=>a.arrival-b.arrival)[0].id);
  if(id.endsWith('_latest_departure'))assert.equal(p.answerRoute,feasible.sort((a,b)=>b.departure-a.departure)[0].id);
  if(id.endsWith('_slack'))assert.equal(p.answerSeconds,(p.deadline-rows.find(r=>r.id==='B').arrival)*60);
  if(id.endsWith('_connection_wait'))assert.equal(p.answerSeconds,(rows.find(r=>r.id==='B').departure-ready)*60);
  if(id.endsWith('_connection_arrival'))assert.equal(absolute(expectedAnswer(p)),catchable.sort((a,b)=>a.departure-b.departure)[0].arrival);
 }
});
test('journey results account for every ordered step and overnight day',()=>{
 for(const id of templates.filter(id=>id.startsWith('garden_')))for(let seed=1;seed<=64;seed++){
  const p=makeExpansionProblem(id,seed),known=p.steps.every(s=>s.minutes!==null),sum=p.steps.reduce((n,s)=>n+(s.minutes||0),0);
  if(p.task==='journey'&&known)assert.equal(Math.abs(p.duration),sum,id);
  if(p.task==='seconds'&&(id.endsWith('_total')||id.endsWith('_duration')))assert.equal(p.answerSeconds,sum*60,id);
  if(id==='garden_midnight_finish'){assert.equal(expectedAnswer(p).dayOffset,1);assert.ok(p.context.includes('Tuesday'));}
  if(id==='garden_midnight_start'){assert.equal(expectedAnswer(p).dayOffset,0);assert.ok(p.context.includes('Wednesday'));}
 }
});
test('comparison answers use elapsed duration, including ties and later arrival distractors',()=>{
 for(const id of templates.filter(id=>id.startsWith('prism_')))for(let seed=1;seed<=64;seed++){
  const p=makeExpansionProblem(id,seed);
  if(p.task==='comparison'){
   const a=p.trips?p.trips[0].end-p.trips[0].start:p.compare.a,b=p.trips?p.trips[1].end-p.trips[1].start:p.compare.b;
   const route=a===b?'equal':p.compare.which==='longer'?(a>b?'A':'B'):(a<b?'A':'B');
   assert.deepEqual(expectedAnswer(p),{route,seconds:Math.abs(a-b)*60},id);
  }
  if(id.endsWith('_latest_finish'))assert.equal(p.answerRoute,[...p.trips].sort((a,b)=>b.end-a.end)[0].id);
 }
});
test('fair units, cycles and budgets agree with independently parsed stated numbers',()=>{
 const durations=s=>{const matches=[...s.matchAll(/(\d+)\s*(hours?|h|minutes?|min|seconds?|s)\b/g)];return matches.reduce((n,m)=>n+Number(m[1])*(m[2].startsWith('h')?3600:m[2].startsWith('m')?60:1),0);};
 for(const id of templates.filter(id=>id.startsWith('fair_')))for(let seed=1;seed<=64;seed++){
  const p=makeExpansionProblem(id,seed),context=p.context;
  if(p.gate==='fair_units')assert.equal(p.answerSeconds,durations(context),id);
  if(p.gate==='fair_cycles'){
   if(id.includes('repeat'))assert.equal(p.answerSeconds,p.cycles.count*p.cycles.seconds);
   if(id.endsWith('_count'))assert.equal(p.answerNumber,durations(context.split('Each cycle')[0])/p.cycles.seconds);
   if(id.endsWith('_cycle_length'))assert.equal(p.answerSeconds,durations(context.split('altogether')[0])/p.cycles.count);
  }
  if(id==='fair_budget_remaining'){
   const budget=durations(context.split('Setup')[0]),setup=Number(context.match(/Setup takes (\d+)/)[1]),count=Number(context.match(/then (\d+) cycles/)[1]),one=durations(context.split('each take ')[1].split(',')[0]);
   assert.equal(p.answerSeconds,budget-setup-count*one);
  }
 }
});
test('new seeds vary, questions per gate rotate all four templates at count one',()=>{
 for(const id of templates)assert.ok(new Set(Array.from({length:30},(_,i)=>problemFingerprint(makeExpansionProblem(id,i+1)))).size>1,id);
 for(const gateId of Object.keys(EXPANSION_GATE_TEMPLATES)){
  const gate=ROOMS.find(r=>r.gate?.id===gateId).gate;
  const ids=[1,2,3,4].map(run=>buildGateQuestions(gate,1,run)[0].templateId);assert.equal(new Set(ids).size,4,gateId);
  for(const count of [1,2,10]){const ps=buildGateQuestions(gate,count,3);assert.equal(ps.length,count);assert.equal(new Set(ps.map(p=>p.id)).size,count);}
 }
});
test('exact entry accepts single minutes and seconds, rejects invalid clock/base60 fields',()=>{
 assert.deepEqual(parseTimeDraft({hour:'12',minute:'1',period:'AM',day:'1'}),fromAbsolute(1441));
 assert.equal(parseTimeDraft({hour:'12',minute:'60',period:'AM'}),null);
 assert.equal(parseDurationDraft({minutes:'2',seconds:'15'}),135);
 assert.equal(parseDurationDraft({amount:'135'},'seconds'),135);
 assert.equal(parseDurationDraft({amount:'135',durationUnit:'seconds'}),135);
 assert.equal(parseDurationDraft({amount:'135',durationUnit:'minutes'}),8100);
 assert.equal(parseDurationDraft({minutes:'2',seconds:'75'}),null);
 assert.equal(parseDurationDraft({}),null);
 assert.equal(parseDurationDraft({hours:'-1'}),null);
});
test('four wrong responses demonstrate without credit; fresh unseen check must be solved',()=>{
 const save=freshSave();startStageRun(save,'tidal');const p=questionsForGate(save,'tidal_wait')[0],s=learningSession(save,p);
 for(let n=0;n<4;n++)submitLearningAnswer(save,s,0,{gateId:'tidal_wait'});
 assert.equal(s.phase,'demonstration');assert.equal(s.status,'check_pending');assert.ok(!save.answered.includes(p.id));
 submitLearningAnswer(save,s,expectedAnswer(s.current),{gateId:'tidal_wait'});assert.ok(!save.answered.includes(p.id));
 nextLearningCheck(s);assert.equal(s.checkSerial,1);assert.notEqual(problemFingerprint(s.current),problemFingerprint(p));
 submitLearningAnswer(save,s,expectedAnswer(s.current),{gateId:'tidal_wait'});assert.ok(save.answered.includes(p.id));assert.equal(s.support,'demonstrated');assert.equal(save.solved.length,0);
 const p2=questionsForGate(save,'tidal_wait')[1],s2=learningSession(save,p2);submitLearningAnswer(save,s2,expectedAnswer(p2),{gateId:'tidal_wait'});assert.ok(save.solved.includes('tidal_wait'));assert.equal(canEnterBoss(save,'tidal'),false);
});
test('pending check, input parts, attempts and world survive reload; restart clears only its stage',()=>{
 const save=freshSave();startStageRun(save,'prism');const p=questionsForGate(save,'prism_compare')[0],s=learningSession(save,p);
 s.draft={route:'A',minutes:'2',seconds:'0'};for(let n=0;n<4;n++)submitLearningAnswer(save,s,{route:'none',seconds:0},{gateId:'prism_compare'});
 save.world['prism-hall']={elapsed:20,switches:{bridge:true}};save.world['tidal-quay']={elapsed:5};
 const loaded=migrateSave(JSON.parse(JSON.stringify(save)));assert.ok(loaded);assert.equal(loaded.learning[p.id].phase,'demonstration');assert.deepEqual(loaded.learning[p.id].draft,s.draft);assert.equal(loaded.world['prism-hall'].elapsed,20);
 startStageRun(loaded,'prism');assert.ok(!loaded.learning[p.id]);assert.ok(!loaded.world['prism-hall']);assert.ok(loaded.world['tidal-quay']);
});
test('v0.6 legacy saves keep original rooms, weapons, count and answered gate parts',()=>{
 const old=freshSave();old.version=4;delete old.learning;delete old.world;old.weapons=['brake','lance','disc','burst'];old.settings.questionsPerGate=3;startStageRun(old,'metro');
 const p=questionsForGate(old,'metro_signals')[0];old.answered.push(p.id);rememberRoom(old,15);
 for(const r of Object.values(old.routes))for(const key of ['roomId','checkpointId','bestRoomId'])delete r[key];
 const migrated=migrateSave(JSON.parse(JSON.stringify(old)));assert.ok(migrated);assert.equal(migrated.room,15);assert.equal(migrated.roomId,'metro-signals');assert.deepEqual(migrated.weapons,old.weapons);assert.equal(migrated.routes.metro.questionsPerGate,3);assert.ok(migrated.answered.includes(p.id));
});
test('returning to the Prism hub retains the later checkpoint',()=>{
 const save=freshSave();startStageRun(save,'prism');const checkpoint=ROOMS.find(r=>r.id==='prism-east-clock')||ROOMS[79];rememberRoom(save,checkpoint.index);const before=save.checkpoint;rememberRoom(save,75);assert.equal(save.checkpoint,before);
});

test('clock overlay renders real timetable and preserves typed duration through exit and reopen',async()=>{
 const {game}=await import('./harness.mjs');const g=await game(),p=PROBLEMS.find(p=>p.id==='tidal_wait_wait_same');
 const handle=g.openMath(p,()=>{}, {practice:true}),overlay=g.nodes.get('#overlay');
 assert.match(overlay.innerHTML,/<table class="gate-table">/);assert.match(overlay.innerHTML,/<th>Arrival<\/th>/);assert.match(overlay.innerHTML,/<th>Departure<\/th>/);
 const minutes=overlay.querySelector('[data-field="minutes"]');minutes.value='17';minutes.dispatchEvent({type:'input'});assert.equal(handle.session.draft.minutes,'17');
 overlay.querySelector('#gate-back').click();assert.equal(g.state.screen,'practice-menu');
 const resumed=g.openMath(p,()=>{}, {practice:true});assert.equal(resumed.session.draft.minutes,'17');assert.equal(g.nodes.get('#overlay').querySelector('[data-field="minutes"]').value,'17');resumed.close();
});
test('comparison UI submits both parts, rejects a correct route with wrong difference, and commits once',async()=>{
 const {game}=await import('./harness.mjs');const g=await game(),p=PROBLEMS.find(p=>p.id==='prism_difference_intervals');let calls=0;
 const h=g.openMath(p,()=>calls++,{practice:true});const enter=d=>{const overlay=g.nodes.get('#overlay');for(const input of overlay.querySelectorAll('[data-field]'))input.value=d[input.dataset.field]??'';overlay.querySelector('#gate-submit').click();};
 const good=draftFor(p);enter({...good,minutes:'0',seconds:'0'});assert.equal(h.session.status,'working');assert.equal(g.save.records.length,0);
 enter(good);assert.equal(h.session.status,'credited');assert.equal(g.save.records.length,1);assert.equal(g.save.records[0].support,'self-corrected');
 await new Promise(resolve=>setTimeout(resolve,700));assert.equal(calls,1);
});
test('demo UI provides a fresh-check button instead of an answer-confirmation bypass',async()=>{
 const {game}=await import('./harness.mjs');const g=await game(),p=PROBLEMS.find(p=>p.id==='fair_units_minute_seconds');const h=g.openMath(p,()=>{}, {practice:true});
 for(let i=0;i<4;i++){const overlay=g.nodes.get('#overlay');overlay.querySelector('[data-field="amount"]').value='0';overlay.querySelector('#gate-submit').click();}
 assert.equal(h.session.status,'check_pending');assert.equal(g.save.records.length,0);assert.equal(g.nodes.get('#overlay').innerHTML.includes('id="gate-submit"'),false);
 const previous=problemFingerprint(h.session.current);g.nodes.get('#overlay').querySelector('#gate-check').click();assert.notEqual(problemFingerprint(h.session.current),previous);assert.equal(h.session.checkSerial,1);assert.equal(h.session.status,'check_pending');h.close();
});

test('malformed imported learning sessions are skipped without discarding valid progress',()=>{
 const save=freshSave();startStageRun(save,'tidal');save.weapons=['depth'];const ps=questionsForGate(save,'tidal_wait');
 learningSession(save,ps[0]);learningSession(save,ps[1]);
 const mutations=[e=>delete e.draft,e=>e.errors=null,e=>e.current.start=null,e=>e.current.answerSeconds=999999,e=>e.current.context='Forged question',e=>e.original.templateId='unknown',e=>e.phase='unknown',e=>e.totalAttempts=-1,e=>e.draft={minutes:{nested:1}}];
 for(const mutate of mutations){const raw=JSON.parse(JSON.stringify(save));mutate(raw.learning[ps[0].id]);const migrated=migrateSave(raw);assert.ok(migrated);assert.ok(!migrated.learning[ps[0].id]);assert.ok(migrated.learning[ps[1].id]);assert.deepEqual(migrated.weapons,['depth']);assert.doesNotThrow(()=>learningSession(migrated,ps[0]));}
 const s=save.learning[ps[0].id];for(let i=0;i<4;i++)submitLearningAnswer(save,s,0,{gateId:'tidal_wait'});nextLearningCheck(s);const migrated=migrateSave(JSON.parse(JSON.stringify(save)));assert.ok(migrated.learning[ps[0].id]);assert.equal(migrated.learning[ps[0].id].checkSerial,1);assert.equal(s.errors[0],'schedule-waiting-time');
});
