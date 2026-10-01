import {catalog,keypadKeys,formatMath,settingsHTML,wireSettings} from './shared-math.js';
import {practiceFor,openSharedPractice,submitShared,persistGate,resetShared} from './arcade-math.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const arcadeSettingsMarkup=save=>settingsHTML(practiceFor(save));
export function bindArcadeSettings(save,persist,redraw,onOverride=()=>{},authorized=()=>true){
 const p=practiceFor(save,persist),saveConfig=p.saveConfig.bind(p),resetSkill=p.resetSkill.bind(p),override=p.override.bind(p);
 p.saveConfig=c=>{if(!authorized())throw Error('Adult access expired. Close settings and unlock again.');const before=structuredClone(p.state),count=save.settings.questionsPerGate;saveConfig(c);save.settings.questionsPerGate=c.count;if(persist()===false){Object.assign(p.state,before);save.settings.questionsPerGate=count;throw Error('Could not save settings. Existing settings were kept.');}};
 p.resetSkill=id=>{if(!authorized())return;resetSkill(id);save.records=save.records.filter(r=>r.moduleId!=='shared'||r.typeId!==id);persist();};
 p.override=()=>{if(!authorized())return;const id=p.state.gate?.context;override();if(id&&save.sharedGates[id])persistGate(save,id,persist);};
 wireSettings(p,onOverride,()=>{if(!authorized())return;resetShared(save);persist();redraw();});
}
export function openArcadeUI({save,id,persist,showOverlay,overlay,onExit,onComplete,onSettings,audio={},restartRelay=false}){
 const p=openSharedPractice(save,id,persist,restartRelay);if(!p){onComplete();return;}
 let closed=false;
 const entry=save.sharedGates[id];
 const setAnswer=key=>{
  if(key==='back')entry.draft=entry.draft.slice(0,-1);else if(key==='clear')entry.draft='';
  else if(key==='AM'||key==='PM')entry.draft=entry.draft.replace(/\s*(?:AM|PM)$/i,'').trimEnd()+' '+key;
  else if(entry.draft.length<80)entry.draft+=key;
  overlay.querySelector('#shared-answer').value=entry.draft;overlay.querySelector('#shared-answer-format').innerHTML=formatMath(entry.draft);persist();
 };
 const close=()=>{closed=true;overlay.onkeydown=null;globalThis.speechSynthesis?.cancel();persist();};
 const submit=()=>{
  if(closed)return;if(!entry.draft.trim()){overlay.querySelector('#shared-feedback').textContent='Enter an answer.';return;}
  audio.start?.();const result=submitShared(save,id,p,entry.draft);persist();
  if(!result.correct){audio.wrong?.();overlay.querySelector('#shared-feedback').textContent='Try again. Fractions must be reduced.';return;}
  audio.good?.();if(result.complete){close();onComplete();}else draw();
 };
 const narrate=()=>{if(!globalThis.speechSynthesis)return;globalThis.speechSynthesis.cancel();globalThis.speechSynthesis.speak(new SpeechSynthesisUtterance(p.state.gate.item.prompt));};
 function draw(){
  const g=p.state.gate,keys=keypadKeys(g.item.type),cols=keys.length>20?5:4,skill=catalog.find(s=>s.id===g.item.skillId);
  showOverlay(`<section class="arcade-gate"><div class="arcade-reading"><p class="eyebrow">${id==='relay'?'PRACTICE RELAY':'MATH GATE'} · ${g.completed} / ${g.config.count} completed</p><p>${esc(skill.name)}</p><div id="shared-question">${formatMath(g.item.prompt)}</div><p id="shared-feedback" role="status">The world is paused. Take your time.</p><button class="button" id="shared-listen">Listen</button></div><div class="arcade-entry"><input id="shared-answer" aria-label="Answer; use keypad or physical keyboard" readonly inputmode="none" autocomplete="off"><div id="shared-answer-format" aria-hidden="true"></div><div class="arcade-keypad" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${keys.map(key=>`<button data-entry="${esc(key)}" aria-label="${esc(key==='back'?'Backspace':key===' '?'Space':key)}">${esc(({back:'⌫',clear:'Clear',' ':'Space'})[key]||key)}</button>`).join('')}</div><button class="button primary" id="shared-submit">Submit</button></div></section><div class="menu"><button class="button" id="shared-exit">Save & back</button><button class="button" id="shared-settings">Settings</button></div>`,true);
  overlay.querySelector('#shared-answer').value=entry.draft;overlay.querySelector('#shared-answer-format').innerHTML=formatMath(entry.draft);
  overlay.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>setAnswer(b.dataset.entry));
  overlay.querySelector('#shared-submit').onclick=submit;
  overlay.querySelector('#shared-exit').onclick=()=>{close();onExit();};
  overlay.querySelector('#shared-settings').onclick=()=>{close();onSettings();};
  overlay.querySelector('#shared-listen').onclick=narrate;
  overlay.onkeydown=e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.key==='Tab')return;
   if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){e.preventDefault();e.stopPropagation();submit();}
   else if(e.key==='Backspace'||e.key==='Delete'||/^[0-9aApPmMxX.,: /+*×÷()^<>≤≥=−-]$/.test(e.key)&&!(e.key===' '&&e.target.tagName==='BUTTON')){e.preventDefault();e.stopPropagation();setAnswer(e.key==='Backspace'?'back':e.key==='Delete'?'clear':e.key);}
  };
  overlay.querySelector('#shared-answer').focus({preventScroll:true});if(save.settings.narration)narrate();
 }
 draw();return {submit,close};
}
