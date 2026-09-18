import test from 'node:test';
import assert from 'node:assert/strict';
import {SUBTRACTION_TYPES,defaultPractice,copyPractice,validatePractice} from '../public/practice-config.js';
import {makeSubtraction,parseWhole,subtractionFingerprint} from '../public/subtraction.js';
import {freshSave,startStageRun,questionsForGate,learningSession,submitLearningAnswer,nextLearningCheck,migrateSave,completeGate,canEnterBoss} from '../public/progress.js';
import {buildPracticeCheck} from '../public/gate-questions.js';
import {expectedAnswer,answerCorrect} from '../public/math-tasks.js';
import {candidateFromDraft} from '../public/gate-ui.js';
import {STAGES,PROBLEMS,ROOMS} from '../public/stage-data.js';
import {game} from './harness.mjs';
const config=(types=SUBTRACTION_TYPES,subjects=['subtraction'],maximum=100,includeZero=false)=>({subjects,subtraction:{types,maximum,includeZero}});
for(const type of SUBTRACTION_TYPES)for(const maximum of [20,100,1000])for(const includeZero of [false,true])test(`valid whole-number ${type}, range ${maximum}, zero ${includeZero}`,()=>{
 const templates=new Set();let zeros=0;
 for(let seed=0;seed<500;seed++){
  const p=makeSubtraction(type,seed,{maximum,includeZero},'test'),{M,S,D}=p.domain;templates.add(p.templateId);
  assert.ok([M,S,D].every(n=>Number.isInteger(n)&&n>=(includeZero?0:1)&&n<=maximum));assert.equal(M-S,D);
  const answer=expectedAnswer(p);assert.equal(type.startsWith('minuend')?answer-S:M-answer,D);assert.ok(answerCorrect(p,answer));assert.ok(!answerCorrect(p,answer+1));
  assert.deepEqual(p,makeSubtraction(type,seed,{maximum,includeZero},'test'));
  if([M,S,D].includes(0))zeros++;
 }
 if(type.endsWith('word'))assert.equal(templates.size,6);
 if(includeZero)assert.ok(zeros>0&&zeros<150);else assert.equal(zeros,0);
});
test('strict whole-number parsing and empty/zero distinction',()=>{
 for(const x of ['', ' ', '-1','+1','1.0','1e2','1/2','3 bolts','9007199254740992'])assert.equal(parseWhole(x),null,x);
 assert.equal(parseWhole(' 007 '),7);assert.equal(parseWhole('0'),0);
 assert.equal(candidateFromDraft({moduleId:'subtraction'},{amount:'1e2'}),null);
});
test('invalid configuration is rejected without mutating it',()=>{for(const c of [{...config(),subjects:[]},config([]),config(SUBTRACTION_TYPES,['subtraction'],25),config(['bad'])]){const before=JSON.stringify(c);assert.ok(validatePractice(c));assert.throws(()=>copyPractice(c));assert.equal(JSON.stringify(c),before);}});
for(let mask=1;mask<16;mask++)test(`balanced allocation for type subset ${mask}, all gate counts and subjects`,()=>{
 const types=SUBTRACTION_TYPES.filter((_,i)=>mask&(1<<i));
 for(const count of Array.from({length:10},(_,i)=>i+1))for(const subjects of [['subtraction'],['time','subtraction']]){
  const s=freshSave({mathPractice:config(types,subjects),questionsPerGate:count});startStageRun(s,'foundry');
  const questions=STAGES[0].gates.flatMap(id=>questionsForGate(s,id));assert.equal(questions.length,3*count);
  const sub=questions.filter(p=>p.moduleId==='subtraction');assert.ok(sub.every(p=>types.includes(p.typeId)));
  if(subjects.length===2)assert.ok(Math.abs(sub.length-(questions.length-sub.length))<=1);else assert.equal(sub.length,questions.length);
  const frequencies=types.map(t=>sub.filter(p=>p.typeId===t).length);assert.ok(Math.max(...frequencies)-Math.min(...frequencies)<=1);
  const loaded=migrateSave(JSON.parse(JSON.stringify(s)));assert.deepEqual(STAGES[0].gates.flatMap(id=>questionsForGate(loaded,id)),questions);
 }
});
for(const type of SUBTRACTION_TYPES)for(const mode of ['teach','guide','independent','mastery'])test(`${type} mode ${mode} reload and credit contract`,()=>{
 let s=freshSave({mathPractice:config([type]),answerMode:mode});startStageRun(s,'foundry');const gate=STAGES[0].gates[0],p=questionsForGate(s,gate)[0];let q=learningSession(s,p);const options={answerMode:mode,gateId:gate};
 if(mode==='guide'||mode==='teach'){
  for(let i=0;i<4;i++)submitLearningAnswer(s,q,10000,options);assert.equal(q.phase,'demonstration');assert.ok(!s.answered.includes(p.id));nextLearningCheck(q);
  assert.notEqual(subtractionFingerprint(q.current),subtractionFingerprint(p));
 }else if(mode==='independent'){for(let i=0;i<5;i++)submitLearningAnswer(s,q,10000,options);assert.equal(q.phase,'answer');}
 else {
  assert.ok(submitLearningAnswer(s,q,expectedAnswer(q.current),options).transfer);
  submitLearningAnswer(s,q,10000,options);assert.equal(q.masteryFirst,false);
  assert.ok(submitLearningAnswer(s,q,expectedAnswer(q.current),options).transfer);
 }
 s=migrateSave(JSON.parse(JSON.stringify(s)));assert.ok(s);q=s.learning[p.id];assert.ok(q);assert.equal(q.current.typeId,type);
 assert.ok(submitLearningAnswer(s,q,expectedAnswer(q.current),options).credited);assert.ok(s.answered.includes(p.id));
 assert.ok(migrateSave(s).answered.includes(p.id));
});
test('fresh checks differ numerically, preserve type/range, and are deterministic',()=>{for(const type of SUBTRACTION_TYPES){const p=makeSubtraction(type,15,{maximum:20,includeZero:false},'original'),seen=new Set([subtractionFingerprint(p)]);for(let serial=1;serial<25;serial++){const q=buildPracticeCheck(p,serial);assert.ok(!seen.has(subtractionFingerprint(q)));seen.add(subtractionFingerprint(q));assert.equal(q.typeId,p.typeId);assert.deepEqual(q.config,p.config);assert.deepEqual(q,buildPracticeCheck(p,serial));}}});
test('legacy saves retain time generation and modular run snapshots survive edits',()=>{
 for(const version of [1,2,3,4,5]){const old=freshSave();old.version=version;delete old.settings.mathPractice;for(const route of Object.values(old.routes)){delete route.mathPractice;delete route.seed;delete route.generatorVersion;}const s=migrateSave(old);assert.ok(s);assert.deepEqual(s.settings.mathPractice.subjects,['time']);assert.ok(questionsForGate(s,STAGES[0].gates[0]).every(p=>!p.moduleId));}
 const s=freshSave({mathPractice:config()});startStageRun(s,'foundry');const p=questionsForGate(s,STAGES[0].gates[0])[0];const q=learningSession(s,p);q.draft.amount='12';s.settings.mathPractice=defaultPractice();const loaded=migrateSave(s);assert.deepEqual(questionsForGate(loaded,STAGES[0].gates[0])[0],p);assert.equal(loaded.learning[p.id].draft.amount,'12');startStageRun(loaded,'foundry');assert.ok(questionsForGate(loaded,STAGES[0].gates[0]).every(p=>!p.moduleId));assert.ok(!loaded.learning[p.id]);
});
test('forged modular session discarded; valid progress retained; invalid configuration rejected',()=>{
 const s=freshSave({mathPractice:config()});startStageRun(s,'foundry');const questions=questionsForGate(s,STAGES[0].gates[0]);const q=learningSession(s,questions[0]);q.original.answerNumber++;s.weapons=['brake'];assert.equal(migrateSave(s).learning[questions[0].id],undefined);assert.deepEqual(migrateSave(s).weapons,['brake']);s.settings.mathPractice.subtraction.maximum=500;assert.equal(migrateSave(s),null);
});
for(const stage of STAGES)test(`all gates, boss admission, replay and typed UI: ${stage.id}`,async()=>{
 const g=await game();g.save.settings.mathPractice=config();g.beginStage(stage.id);
 for(const gate of stage.gates){for(const p of questionsForGate(g.save,gate)){
  const ui=g.openMath(p,()=>{}, {gateId:gate});const html=g.nodes.get('#overlay').innerHTML;
  assert.ok(html.includes('FIND THE MISSING NUMBER'));assert.ok(!html.includes('id="gate-clock"'));assert.ok(!html.includes('data-word='));assert.ok(!html.includes('Hour ('));
  ui.submit(expectedAnswer(p));assert.ok(g.save.answered.includes(p.id));ui.close();
 }assert.ok(completeGate(g.save,gate));}
 assert.ok(canEnterBoss(g.save,stage.id));g.enterRoom(stage.end);assert.ok(g.state.boss);assert.equal(g.openMath(questionsForGate(g.save,stage.gates[0])[0],()=>{}),undefined);
 const loaded=migrateSave(g.save);assert.equal(loaded.solved.filter(id=>stage.gates.includes(id)).length,3);startStageRun(loaded,stage.id);assert.equal(loaded.solved.filter(id=>stage.gates.includes(id)).length,0);
});
test('all time tasks render constructed responses in all modes',async()=>{const g=await game();for(const mode of ['teach','guide','independent','mastery']){g.save.settings.answerMode=mode;g.beginStage('foundry');for(const p of PROBLEMS){const ui=g.openMath(p,()=>{},{});const html=g.nodes.get('#overlay').innerHTML;assert.ok(!html.includes('data-word='));assert.ok(!html.includes('<select data-field="route">'));ui.close();}}});
test('practice selector respects adult subjects; stage learning text is conditional',async()=>{const g=await game();g.save.settings.mathPractice=config();g.showPracticeMenu();let html=g.nodes.get('#overlay').innerHTML;assert.ok(html.includes('SUBTRACTION'));assert.ok(!html.includes('data-band="story"'));g.showSettings(()=>{});assert.ok(!g.nodes.get('#overlay').innerHTML.includes('data-setting="band"'));g.showStageSelect('metro');html=g.nodes.get('#stage-detail').innerHTML;assert.ok(!html.includes('Work backward through departure boards'));assert.ok(!html.includes('stage-skill'));});
