import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog,checkAnswer,configError,pool,settingsHTML} from '../public/shared-math.js';
import {freshGameSave,migrateGameSave,startGameStageRun,questionsForGameGate,useSharedGate,practiceFor,openSharedPractice,submitShared,resetShared,initialMath} from '../public/arcade-math.js';
import {freshSave,startStageRun,questionsForGate,learningSession,canEnterBoss,rememberRoom} from '../public/progress.js';
import {STAGES,ROOMS} from '../public/stage-data.js';
const gate=STAGES[0].gates[0];
const target=(s,ids,count=5)=>practiceFor(s).saveConfig({mode:'targeted',lo:0,hi:7,selected:ids,count,include24:false});
const answer=(s,id,p)=>submitShared(s,id,p,String(p.state.gate.item.answer));
test('canonical bundle hash, shared settings, 240 skills and basic time',()=>{
 const metadata=JSON.parse(readFileSync(new URL('../public/shared-math.provenance.json',import.meta.url)));
 assert.equal(createHash('sha256').update(readFileSync(new URL('../public/shared-math.js',import.meta.url))).digest('hex'),metadata.bundleSha256);
 assert.equal(catalog.length,240);assert.equal(new Set(catalog.map(s=>s.id)).size,240);
 const html=settingsHTML(practiceFor(freshGameSave()));for(const text of ['Preview selected skills','Clear selection','Search skills','Selected skills','Fixed Progression'])assert.ok(html.includes(text));assert.ok(!html.includes('Use Grade 3'));
 const skill=catalog.find(s=>s.id==='g3-time-quarter');for(let i=0;i<100;i++){const item=skill.make();assert.ok(checkAnswer(item,String(item.answer)));}
});
test('fresh shared defaults remain two time questions, legacy mapping is explicit',()=>{const s=freshGameSave();assert.equal(s.version,7);assert.equal(s.sharedMath.config.count,2);assert.deepEqual(s.sharedMath.config.selected,['g3-time-quarter']);const m=initialMath({mathPractice:{subjects:['subtraction'],subtraction:{maximum:100,types:['minuend-word']}}});assert.ok(m.note.includes('Earlier subtraction'));assert.ok(m.config.selected.includes('g2-missing'));assert.ok(m.config.selected.includes('N05'));assert.equal(configError(m.config),'');});
test('begun legacy gates survive migration; unopened gates adopt shared settings',()=>{
 const old=freshSave();startStageRun(old,'foundry');const original=questionsForGate(old,gate)[0];const session=learningSession(old,original);session.draft={hour:'8'};
 const save=migrateGameSave(old);assert.ok(save);assert.deepEqual(save.learning[original.id],{answerMode:'guide',masteryFirst:false,...session});assert.equal(useSharedGate(save,gate),false);assert.equal(useSharedGate(save,STAGES[0].gates[1]),true);assert.deepEqual(questionsForGameGate(save,gate),questionsForGate(old,gate));
});
test('exact four G1 selections exclude hidden Grade 3 subtraction across 30 questions',()=>{
 const save=freshGameSave(),ids=['S5','S6','g1-sub20','g1-missing'];target(save,ids,10);
 for(const stage of STAGES.slice(0,3)){startGameStageRun(save,stage.id);const id=stage.gates[0],p=openSharedPractice(save,id);while(p.state.gate){assert.ok(ids.includes(p.state.gate.item.skillId));assert.ok(answer(save,id,p).correct);}}
 assert.equal(save.sharedMath.events.filter(e=>e.type==='answer').length,30);
});
test('current gate retains count/content/draft, next gate adopts changed selection',()=>{
 const s=freshGameSave();startGameStageRun(s,'foundry');target(s,['g1-sub20'],5);let p=openSharedPractice(s,gate);answer(s,gate,p);s.sharedGates[gate].draft='12';const before=structuredClone(s.sharedGates[gate]);
 target(s,['g3-time-quarter'],2);p=openSharedPractice(s,gate);assert.deepEqual(s.sharedGates[gate],before);
 let loaded=migrateGameSave(JSON.parse(JSON.stringify(s)));assert.ok(loaded);assert.equal(loaded.sharedGates[gate].draft,'12');p=openSharedPractice(loaded,gate);while(p.state.gate){assert.equal(p.state.gate.item.skillId,'g1-sub20');answer(loaded,gate,p);}
 const next=openSharedPractice(loaded,STAGES[0].gates[1]);assert.equal(next.state.gate.item.skillId,'g3-time-quarter');assert.equal(next.state.gate.config.count,2);
});
test('pending gates retain independent snapshots across stages and reload',()=>{
 let s=freshGameSave();startGameStageRun(s,'foundry');startGameStageRun(s,'metro');const a=STAGES[0].gates[0],b=STAGES[1].gates[0];openSharedPractice(s,a);s.sharedGates[a].draft='9';const first=structuredClone(s.sharedGates[a]);openSharedPractice(s,b);s.sharedGates[b].draft='10';s=migrateGameSave(s);assert.ok(s);openSharedPractice(s,a);assert.deepEqual(s.sharedGates[a],first);assert.equal(s.sharedGates[b].draft,'10');
});
for(const stage of STAGES)test(`shared gates retain boss admission, room and rewards through roundtrip: ${stage.id}`,()=>{
 let s=freshGameSave();startGameStageRun(s,stage.id);target(s,['k-add5'],2);
 for(const id of stage.gates){const p=openSharedPractice(s,id);assert.equal(answer(s,id,p).complete,false);assert.equal(answer(s,id,p).complete,true);assert.equal(s.answered.filter(a=>a.startsWith(id+'__shared_')).length,2);}
 assert.equal(canEnterBoss(s,stage.id),true);s.weapons=['brake'];rememberRoom(s,stage.end);s=migrateGameSave(s);assert.ok(s);assert.equal(s.routes[stage.id].room,stage.end);assert.ok(canEnterBoss(s,stage.id));assert.deepEqual(s.weapons,['brake']);startGameStageRun(s,stage.id);assert.ok(!canEnterBoss(s,stage.id));assert.deepEqual(s.weapons,['brake']);assert.ok(!s.sharedGates[stage.gates[0]]);
});
test('all catalog pending items regenerate exactly; tampered answers are rejected',()=>{
 for(const skill of catalog){const s=freshGameSave();target(s,[skill.id],1);openSharedPractice(s,gate);assert.ok(migrateGameSave(s),skill.id);const bad=structuredClone(s);bad.sharedGates[gate].gate.item.answer='FORGED';assert.equal(migrateGameSave(bad),null,skill.id);}
});
test('general bag seed reconstruction and progression use canonical engine',()=>{
 let s=freshGameSave();practiceFor(s).saveConfig({mode:'general',lo:3,hi:3,count:10,selected:[],include24:false});let p=openSharedPractice(s,gate);for(let i=0;i<10;i++){assert.ok(migrateGameSave(s));answer(s,gate,p);}
 s=freshGameSave();practiceFor(s).saveConfig({mode:'progression',lo:0,hi:0,count:10,selected:[],include24:false});p=openSharedPractice(s,gate);const first=p.state.gate.item.skillId;for(let i=0;i<10;i++)answer(s,gate,p);assert.notEqual(s.sharedMath.position,first);assert.ok(s.sharedMath.events.some(e=>e.type==='advance'));
 assert.throws(()=>target(s,[],2));
});
test('relay uses five questions, does not change configured gate count or game gate',()=>{
 const s=freshGameSave();target(s,['k-next'],2);openSharedPractice(s,gate);const old=structuredClone(s.sharedGates[gate]);const p=openSharedPractice(s,'relay',()=>{},true);assert.equal(s.sharedMath.config.count,2);assert.equal(p.state.gate.config.count,5);for(let i=0;i<5;i++)answer(s,'relay',p);assert.deepEqual(s.sharedGates[gate],old);assert.ok(!s.solved.includes(gate));assert.ok(migrateGameSave(s));
});
test('wrong retries keep the item and count only the first attempt for progression',()=>{
 const s=freshGameSave();target(s,['k-next'],2);const p=openSharedPractice(s,gate),item=structuredClone(p.state.gate.item);submitShared(s,gate,p,'999');submitShared(s,gate,p,'998');assert.deepEqual(p.state.gate.item,item);assert.equal(p.state.gate.completed,0);assert.deepEqual(s.sharedMath.history['k-next'],[false]);answer(s,gate,p);assert.deepEqual(s.sharedMath.history['k-next'],[false]);
});
test('fixed progression steps back below 50 percent and returns after prerequisite mastery',()=>{
 const s=freshGameSave();practiceFor(s).saveConfig({mode:'progression',lo:3,hi:3,count:10,selected:[],include24:false});s.sharedMath.resetSequence=false;s.sharedMath.position='g3-sub';s.sharedMath.history['g3-sub']=Array(9).fill(false);let p=openSharedPractice(s,gate);submitShared(s,gate,p,'-99999');assert.equal(s.sharedMath.position,'g3-add');assert.deepEqual(s.sharedMath.returnTo,['g3-sub']);answer(s,gate,p);assert.equal(p.state.gate.item.skillId,'g3-add');s.sharedMath.history['g3-add']=Array(9).fill(true);answer(s,gate,p);assert.equal(s.sharedMath.position,'g3-sub');assert.deepEqual(s.sharedMath.returnTo,[]);
});
test('clear shared evidence preserves rewards, legacy evidence and completed gates',()=>{
 const s=freshGameSave();target(s,['k-next'],1);const p=openSharedPractice(s,gate);answer(s,gate,p);openSharedPractice(s,STAGES[0].gates[1]);s.weapons=['brake'];const old={id:'old',skill:'time',representation:'clock',boundary:[],errors:[],seconds:1,attempts:1,support:'independent'};s.records.push(old);resetShared(s);assert.equal(s.sharedMath.events.length,0);assert.deepEqual(s.records,[old]);assert.deepEqual(s.weapons,['brake']);assert.ok(s.solved.includes(gate));assert.ok(!s.sharedGates[STAGES[0].gates[1]]);assert.ok(migrateGameSave(s));
});
