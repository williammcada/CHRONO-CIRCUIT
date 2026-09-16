import {AdultLock} from './adult-lock.js';
import {MODES,modeOf} from './answer-mode.js';
import {sharpText} from './sharp-text.js';
import {
  QUESTION_SEEDS, absolute, addMinutes, answerChoices,
  boundaryFlags, diagnose, equalTime, formatTime, generateProblem,
  hintFor, landmarkHops, fromAbsolute, elapsedText,
} from './time-engine.js';
import { Controls, KEY_MAP } from './controls.js';
import { Soundtrack } from './music.js';
import { BUILD, STAGES, ROOMS, FOUNDRY_PROBLEMS, GATE_IDS, BOSS_ROOM, PROBLEMS, stageFor, problemFor } from './stage-data.js';
import { SAVE_KEY, MAX_ENERGY, freshSave, validSave, migrateSave, completeGate, canEnterBoss, checkpointFor, stageSolved, rememberRoom, awardStage, startStageRun, questionsForGate } from './progress.js';
import {gateQuestionCount} from './gate-questions.js';
import { STEP, newPlayer, createMachinery, updateMachinery, moveActor, hazardFrame, atExit, cameraFor, overlap, clamp } from './physics.js';
import { activateBrake, activatePower, refillEnergy, ownedPowers, cyclePower, POWERS } from './powers.js';
import { createGuardian, stepGuardian, hitGuardian, GUARDIAN_ATTACKS, drawGuardianTelegraph } from './bosses.js';
import { drawPortrait } from './portraits.js';
import {createEnemy,enemyBounds,makeBlaster,projectileHits,hitEnemy,stepEnemy,drawEnemyTelegraph} from './combat.js';
import {drawRobot,drawGuardian,preloadActorArt} from './actor-art.js';
import {drawTempo,preloadTempoArt} from './hero-art.js';
import {THEMES,drawScenery,preloadScenery} from './scenery.js';
import {openGateUI} from './gate-ui.js';
import {makeExpansionProblem} from './curriculum.js';
import {initWorld,updateWorld,worldHazards,drawWorldMechanisms,interactWorld,worldExit,nearbyWorldSwitch} from './world-mechanisms.js';
import {stepPlayerProjectiles,stepEnemyProjectiles,drawWeaponEffects,drawPlayerProjectile,drawEnemyProjectile} from './projectile-system.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d', { alpha: false });
const overlay = document.querySelector('#overlay');
const hud = document.querySelector('#hud');
const toastEl = document.querySelector('#toast');
const touchControls = document.querySelector('#touch-controls');
const interactButton = document.querySelector('[data-action="interact"]');
const powerButton = document.querySelector('#power-control');
const pauseButton = document.querySelector('#pause');
ctx.imageSmoothingEnabled = false;
const clearSharpText=sharpText(canvas,ctx);
const adult=new AdultLock(localStorage);
let dev=false,devBackup=null,debugBoxes=false;
addEventListener('pagehide',()=>adult.lock());
addEventListener('resize',()=>adult.lock());
document.addEventListener('visibilitychange',()=>{if(document.hidden)adult.lock();});

const COLORS = { navy:'#080d1d', floor:'#332c45', edge:'#c18a3d', brass:'#80542b', cyan:'#72f1ec', orange:'#ef7b35', violet:'#6b4a9e', cream:'#fff3d1', amber:'#ffce78', danger:'#ff5d48' };

let storageAvailable = true;
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw);
    return migrateSave(parsed) || freshSave();
  } catch {
    storageAvailable = false;
    return freshSave();
  }
}

function persist() {
  if(dev)return;
  save.records = save.records.slice(-160);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); storageAvailable = true; }
  catch { storageAvailable = false; }
}

let save = loadSave();
document.body.classList.toggle('high-contrast', save.settings.contrast);
document.body.classList.toggle('reduced-motion', save.settings.reducedMotion);

const images = { backdrop:new Image() };
images.backdrop.src = './assets/foundry.png';

const input = new Controls();
addEventListener('keydown', (event) => {
  if(event.metaKey||event.ctrlKey||event.altKey)return;
  audio.start();
  if(state.screen==='play'){
    const action=KEY_MAP[event.code];if(action){event.preventDefault();input.set(action,true,`key:${event.code}`);}
    return;
  }
  if(event.code==='Escape'&&state.screen==='pause'){event.preventDefault();resumePlay();return;}
  // Let Tab, Space, Enter, arrow keys and form fields behave normally in menus.
  if(event.code==='Enter'&&state.screen==='math'&&document.activeElement?.tagName!=='BUTTON'){event.preventDefault();overlay.querySelector('#gate-submit')?.click();}
});
addEventListener('keyup', (event) => {input.releaseSource(`key:${event.code}`);});
addEventListener('blur', clearInput);
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden&&state.screen==='play')showPause();});
function clearInput(){ input.clear(); document.querySelectorAll('.control.pressed').forEach((el)=>el.classList.remove('pressed')); }
for (const button of document.querySelectorAll('.control')) {
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); input.set(button.dataset.action,true,`pointer:${event.pointerId}`); button.classList.add('pressed'); audio.start(); });
  const release=(event)=>{if(event.cancelable)event.preventDefault();input.releaseSource(`pointer:${event.pointerId}`);button.classList.toggle('pressed',!!input.held.get(button.dataset.action));};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
}
pauseButton.addEventListener('click',()=>{audio.start();if(state.screen==='play')showPause();});
function consume(action){const yes=input.pressed.has(action);input.pressed.delete(action);return yes;}

const audio = new Soundtrack(()=>save.settings,()=>state);
document.addEventListener('pointerdown',()=>audio.start(),{passive:true});

const state = {
  screen:'title', stage:save.stage, room:save.room, player:null, enemies:[], bullets:[], enemyShots:[], particles:[],
  roomTime:0, machineTime:0, weaponEffects:[], world:null, shake:0, practice:false, practiceCount:0, platforms:[], pickups:[],
  boss:null, brake:0, powerCooldown:0, transition:0, reveal:0, deathTimer:0, camera:{x:0,y:0},
  lastTime:performance.now(), accumulator:0, raf:0, selectedStage:'foundry', demoTime:0,
};

function enterRoom(index, preserveHealth = true) {
  state.room = Math.max(0, Math.min(ROOMS.length-1,index));
  state.stage=ROOMS[state.room].stage;
  if(ROOMS[state.room].boss&&!canEnterBoss(save,state.stage))state.room=ROOMS.findIndex(r=>r.stage===state.stage&&r.gate&&!save.solved.includes(r.gate.id));
  const room=ROOMS[state.room];
  const hearts=preserveHealth&&state.player?state.player.hearts:5;
  state.player=newPlayer(room.spawn);state.player.hearts=room.checkpoint?5:hearts;
  state.enemies=room.enemies.map((e,i)=>createEnemy(e,i,room));
  state.platforms=createMachinery(room,save.solved);state.pickups=room.pickups.map(p=>({...p,collected:false}));
  state.bullets=[];state.weaponEffects=[];state.enemyShots=[];state.particles=[];state.roomTime=0;state.machineTime=0;state.brake=0;state.deathTimer=0;state.reveal=0;
  state.boss=room.boss?createGuardian(stageFor(state.stage).portrait):null;state.camera=cameraFor(state.player,room);state.transition=.25;state.powerCooldown=0;
  initWorld(state,room,save.world||(save.world={}));
  rememberRoom(save,state.room);
  if(room.checkpoint)save.energy=MAX_ENERGY;
  persist();showToast(`${room.name}${save.settings.showHints?` — ${room.hint}`:''}`,state.boss?.kind==='railox'?5500:room.boss?2000:3200);
  input.pressed.clear();
}

function startNew(){const records=save.records,run=save.run+1;save=freshSave(save.settings);save.records=records;save.run=run;persist();showStageSelect();}
function continueGame(stage=save.stage){const s=stageFor(typeof stage==='string'?stage:save.stage),route=save.routes[s.id];if(route.complete||!route.started){beginStage(s.id);return;}state.screen='play';closeOverlay();enterRoom(route.room,false);audio.start();}
function beginStage(id){const s=stageFor(id);startStageRun(save,s.id);if(dev)save.solved=[...GATE_IDS];state.screen='play';closeOverlay();enterRoom(s.start,false);audio.start();}

function fitCanvas(){
  const viewport=window.visualViewport;
  const w=viewport?.width||innerWidth,h=viewport?.height||innerHeight;
  const app=document.querySelector('#app');
  app.style.width=`${w}px`;app.style.height=`${h}px`;
  app.style.left=`${viewport?.offsetLeft||0}px`;app.style.top=`${viewport?.offsetTop||0}px`;
  document.documentElement.style.setProperty('--app-height',`${h}px`);
  const touch=save.settings.touchControls||window.matchMedia?.('(any-pointer: coarse)').matches||false;
  document.body.classList.toggle('touch-mode',touch);
  const rail=touch?(h<450?94:110):0;
  const available=Math.max(100,h-rail),cw=Math.min(w,available*16/9),ch=cw*9/16,left=(w-cw)/2,top=(available-ch)/2;
  canvas.style.width=`${Math.floor(cw)}px`;canvas.style.height=`${Math.floor(ch)}px`;canvas.style.left=`${Math.floor(left)}px`;canvas.style.top=`${Math.floor(top)}px`;
  touchControls.style.width=`${w}px`;touchControls.style.height=`${rail}px`;touchControls.style.left='0px';touchControls.style.top=`${h-rail}px`;
  touchControls.style.bottom='auto';
  if(h>w&&state.screen==='play')showPause();
}
addEventListener('resize',fitCanvas);window.visualViewport?.addEventListener('resize',fitCanvas);window.visualViewport?.addEventListener('scroll',fitCanvas);fitCanvas();
// Safari can ignore the viewport zoom hint. Suppress game gestures explicitly.
for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,e=>{if(e.cancelable)e.preventDefault();},{passive:false});
document.querySelector('#app').addEventListener('dblclick',e=>e.preventDefault());
document.querySelector('#app').addEventListener('touchmove',e=>{if(e.touches.length>1&&e.cancelable)e.preventDefault();},{passive:false});

function showOverlay(html, wide=false){overlay.innerHTML=`<div class="panel ${wide?'wide':''}">${html}</div>`;overlay.classList.add('open');overlay.tabIndex=-1;overlay.focus({preventScroll:true});touchControls.style.display='none';pauseButton.style.display='none';clearInput();}
function closeOverlay(){overlay.classList.remove('open');overlay.innerHTML='';touchControls.style.display='flex';pauseButton.style.display='block';document.activeElement?.blur();clearInput();}
function resumePlay(){state.screen='play';closeOverlay();audio.start();}
function bind(selector,event,handler){overlay.querySelector(selector)?.addEventListener(event,handler);}
function bindAll(selector,event,handler){overlay.querySelectorAll(selector).forEach((el)=>el.addEventListener(event,handler));}

const KEYBOARD_HELP='<kbd>← →</kbd> / <kbd>A D</kbd> Run · <kbd>Space</kbd> / <kbd>Z</kbd> Jump · <kbd>X</kbd> / <kbd>J</kbd> Fire · <kbd>↑ ↓</kbd> Climb · <kbd>E</kbd> Time · <kbd>C</kbd> Power · <kbd>Q</kbd> Swap · <kbd>Esc</kbd> Pause';
function showTitle(){
 if(dev){save=devBackup;devBackup=null;dev=false;debugBoxes=false;}adult.lock();
 state.screen='title';state.boss=null;updateHud();
 showOverlay(`<p class="eyebrow">EIGHT CIRCUITS · v${BUILD}</p><h1 class="title-mark">CHRONO<br><span class="logo-circuit">CIRCUIT</span></h1><p>Run. Jump. Control time.<br>Restore the clocks. Face the guardian.</p><div class="menu"><button class="button primary" id="select">STAGE SELECT</button><button class="button warm" id="continue" ${save.bestRoom||save.solved.length?'':'disabled'}>CONTINUE RUN</button><button class="button ghost" id="practice">PRACTICE RELAY</button><button class="button ghost" id="settings">SETTINGS</button><button class="button ghost" id="report">GROWN-UP REPORT</button></div><p class="keyboard-help">${KEYBOARD_HELP}</p>${storageAvailable?'':'<p class="small">Progress saving is unavailable in this browser mode.</p>'}`,true);
 overlay.firstElementChild.classList.add('title-panel');
 bind('#select','click',()=>showStageSelect());bind('#continue','click',continueGame);bind('#practice','click',showPracticeMenu);bind('#settings','click',()=>showSettings(showTitle));bind('#report','click',()=>adultLogin(showTitle,()=>showReport(showTitle)));
}


function stageColumns(){return innerWidth<600?2:4;}
function showStageSelect(selected=save.stage){
 state.screen='stage-select';state.selectedStage=selected;state.boss=null;
 showOverlay(`<p class="eyebrow">EIGHT CIRCUITS · v${BUILD}</p><h2>STAGE SELECT</h2><div class="select-layout"><div class="boss-grid">${STAGES.map(s=>`<button class="boss-card" data-stage="${s.id}" aria-label="${s.boss}: ${s.name}" aria-pressed="false" style="--boss-color:${s.color}"><canvas width="64" height="64" data-portrait="${s.portrait}" aria-hidden="true"></canvas><strong>${s.boss}</strong><span>${s.name}</span><small>${save.cleared.includes(s.id)?'RESTORED':save.routes[s.id].started?'IN PROGRESS':'PLAY NOW'}</small></button>`).join('')}</div><div id="stage-detail" class="stage-detail"></div></div><div class="select-footer"><span class="power-socket charged">${save.cleared.length}/${STAGES.length} CIRCUITS RESTORED · ${ownedPowers(save).length}/${STAGES.length} POWERS</span><button class="button primary" id="enter-stage">ENTER STAGE</button><button class="button ghost" id="title">TITLE</button></div>`,true);
 overlay.firstElementChild.classList.add('stage-select-panel');
 overlay.querySelectorAll('[data-portrait]').forEach(c=>drawPortrait(c,c.dataset.portrait));
 function choose(id){
  state.selectedStage=id;const s=stageFor(id),route=save.routes[id];
  overlay.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===id)));
  overlay.querySelector('#stage-detail').innerHTML=`<p class="eyebrow">${stageSolved(save,id)} / 3 GATES RESTORED</p><h3 style="color:${s.color}">${s.name}</h3><p>${s.description}</p><p class="stage-skill">◷ ${s.skill}</p><p class="small">Guardian reward: <strong>${s.power}</strong></p>${route.started&&!route.complete?'<button class="button ghost" id="restart-stage">RESTART FROM ENTRANCE</button>':''}<p class="small">Every fresh run requires the clock gates. Replays keep your powers and learning report.</p>`;
  overlay.querySelector('#enter-stage').textContent=`${route.complete?'REPLAY':route.started?'CONTINUE':'ENTER'} ${s.name}`;
  bind('#restart-stage','click',()=>showIntro(id));
 }
 bindAll('[data-stage]','click',e=>choose(e.currentTarget.dataset.stage));
 bindAll('[data-stage]','focus',e=>choose(e.currentTarget.dataset.stage));
 bindAll('[data-stage]','keydown',e=>{const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:stageColumns(),ArrowUp:-stageColumns()}[e.code];if(delta===undefined)return;e.preventDefault();const index=STAGES.findIndex(s=>s.id===e.currentTarget.dataset.stage);overlay.querySelector(`[data-stage="${STAGES[(index+delta+STAGES.length)%STAGES.length].id}"]`).focus();});
 bind('#title','click',showTitle);bind('#enter-stage','click',()=>{const id=state.selectedStage,route=save.routes[id];route.started&&!route.complete?continueGame(id):showIntro(id);});choose(selected);
}

function showIntro(id=state.selectedStage){
 const s=stageFor(typeof id==='string'?id:save.stage);state.screen='intro';
 showOverlay(`<div class="stage-intro"><canvas id="intro-portrait" width="64" height="64" aria-label="${s.boss}"></canvas><p class="eyebrow">${s.district}</p><h2 style="color:${s.color}">${s.name}</h2><p>${s.description}</p><p class="objective">Restore three gates · ${save.settings.questionsPerGate} question${save.settings.questionsPerGate===1?'':'s'} per gate. Reach ${s.boss} and earn ${s.power}.</p><p class="small">Every fresh run starts with closed clock gates. Checkpoint retries keep your answers. Boss fights are pure action. Every guardian can be beaten with your regular blaster.</p><p class="keyboard-help">${KEYBOARD_HELP}</p><div class="menu"><button class="button primary" id="go">LET’S GO</button><button class="button ghost" id="back">BACK</button></div></div>`,true);
 drawPortrait(overlay.querySelector('#intro-portrait'),s.portrait);
 bind('#go','click',()=>beginStage(s.id));bind('#back','click',()=>showStageSelect(s.id));
}

function showPause(){
 state.screen='pause';persist();const s=stageFor(state.stage),weapons=ownedPowers(save);
 showOverlay(`<p class="eyebrow">${s.name} · ${state.room-s.start+1} / ${s.end-s.start+1}</p><h2>PAUSED</h2><p>${stageSolved(save,state.stage)} / 3 gates restored</p>${weapons.length?`<p class="small">Equip a power · ${save.energy}/8 energy · Q or SWAP cycles during play</p><div class="weapon-grid">${weapons.map(id=>`<button class="button ${save.equipped===id?'primary':'ghost'}" data-weapon="${id}">${POWERS[id].name}</button>`).join('')}</div>`:''}<p class="keyboard-help">${KEYBOARD_HELP}</p><div class="menu"><button class="button primary" id="resume">RESUME</button><button class="button" id="retry">RETRY CHECKPOINT</button><button class="button" id="settings">SETTINGS</button><button class="button" id="report">GROWN-UP REPORT</button><button class="button ghost" id="select">SAVE & STAGE SELECT</button></div>`);
 bindAll('[data-weapon]','click',e=>{save.equipped=e.currentTarget.dataset.weapon;persist();showPause();});
 if(dev){overlay.querySelector('.menu').insertAdjacentHTML('beforeend','<button class="button" id="devtools">DEV TOOLS</button>');bind('#devtools','click',()=>adultLogin(showPause,()=>adultPanel(showPause)));}
 bind('#resume','click',resumePlay);bind('#retry','click',()=>{resumePlay();enterRoom(save.checkpoint,false);});bind('#settings','click',()=>showSettings(showPause));bind('#report','click',()=>adultLogin(showPause,()=>showReport(showPause)));bind('#select','click',()=>showStageSelect(state.stage));
}

function showSettings(back) {
  state.screen='settings';
  const s=save.settings;
  showOverlay(`<p class="eyebrow">PLAYER OPTIONS · v${BUILD}</p><h2>SETTINGS</h2><div class="settings"><label class="toggle"><input type="checkbox" data-setting="assist" ${s.assist?'checked':''}> Action assist</label><label class="toggle"><input type="checkbox" data-setting="showHints" ${s.showHints?'checked':''}> Helpful prompts</label><label class="toggle"><input type="checkbox" data-setting="reducedMotion" ${s.reducedMotion?'checked':''}> Reduced motion</label><label class="toggle"><input type="checkbox" data-setting="contrast" ${s.contrast?'checked':''}> High contrast</label><label class="toggle"><input type="checkbox" data-setting="musicMute" ${s.musicMute?'checked':''}> Mute music</label><label class="toggle"><input type="checkbox" data-setting="effectsMute" ${s.effectsMute?'checked':''}> Mute effects</label><label class="toggle">Music volume <input type="range" min="0" max="1" step=".1" value="${s.musicVolume}" data-setting="musicVolume"></label><label class="toggle">Effects volume <input type="range" min="0" max="1" step=".1" value="${s.effectsVolume}" data-setting="effectsVolume"></label><label class="toggle"><input type="checkbox" data-setting="narration" ${s.narration?'checked':''}> Read questions aloud</label><label class="toggle"><input type="checkbox" data-setting="touchControls" ${s.touchControls?'checked':''}> Always show touch controls</label><label class="toggle">Practice math <select data-setting="band"><option value="story">Story level</option><option value="quarters">Quarter hours</option><option value="backward">Backward time</option><option value="24hour">24-hour clock</option><option value="tidal">Timetables & connections</option><option value="garden">Multi-step journeys</option><option value="prism">Comparing durations</option><option value="fair">Minutes & seconds</option><option value="mixed">All stage skills</option></select></label></div><p class="small">Action assist gives longer warnings and damage recovery. The math stays the same.</p><div class="menu"><button class="button primary" id="done">DONE</button></div>`);
  overlay.querySelector('.settings').insertAdjacentHTML('beforeend','<button class="button" id="adult-settings">ADULT SETTINGS</button>');
  bind('#adult-settings','click',()=>adultLogin(back));
  overlay.querySelector('[data-setting="band"]').value=s.band;
  bindAll('[data-setting]','change',(event)=>{const key=event.target.dataset.setting;save.settings[key]=key==='questionsPerGate'?gateQuestionCount(event.target.value):event.target.type==='checkbox'?event.target.checked:event.target.type==='range'?Number(event.target.value):event.target.value;save.settings.mute=false;document.body.classList.toggle('high-contrast',save.settings.contrast);document.body.classList.toggle('reduced-motion',save.settings.reducedMotion);persist();fitCanvas();audio.start();});
  bind('#done','click',back);
}

function masteryRows() {
  const weights={independent:1,'self-corrected':.7,scaffolded:.4,demonstrated:.1};
  const skills=[...new Set(save.records.map((r)=>r.skill))];
  return skills.map((skill)=>{const records=save.records.filter((r)=>r.skill===skill).slice(-10);const independent=records.filter((r)=>r.support==='independent').length;const representations=new Set(records.map((r)=>r.representation)).size;const templates=new Set(records.map(r=>r.templateId||r.id)).size;const needsBoundary=['crossing noon','mixed time','backward time','24-hour time'].includes(skill);const boundary=records.some((r)=>r.boundary.length);const score=Math.round(records.reduce((n,r)=>n+weights[r.support],0)/records.length*100);const secure=records.length>=5&&independent/records.length>=.8&&(representations>=2||templates>=2)&&(!needsBoundary||boundary);return {skill,records,independent,score,secure};});
}

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function showReport(back) {
  state.screen='report';const rows=masteryRows();const total=save.records.length;const independent=save.records.filter((r)=>r.support==='independent').length;const common=Object.create(null);for(const r of save.records)for(const e of r.errors||[])common[e]=(common[e]||0)+1;const next=Object.entries(common).sort((a,b)=>b[1]-a[1])[0]?.[0]?.replaceAll('-',' ')||'No misconception pattern yet';
  showOverlay(`<p class="eyebrow">LOCAL LEARNING RECORD</p><h2>GROWN-UP REPORT</h2><p>${total} completed time challenges · ${independent} independent</p><table class="report"><thead><tr><th>Skill</th><th>Recent</th><th>Independent</th><th>Score</th></tr></thead><tbody>${rows.length?rows.map((r)=>`<tr><td>${escapeHTML(r.skill)}${r.secure?' <span class="tag secure">secure</span>':''}</td><td>${r.records.length}</td><td>${r.independent}</td><td>${r.score}%</td></tr>`).join(''):'<tr><td colspan="4">Play a challenge to begin the report.</td></tr>'}</tbody></table><p class="small">Answer modes: ${MODES.map(m=>`${m}: ${save.records.filter(r=>r.answerMode===m).length}`).join(" · ")}. Earlier records without a mode are retained.</p><p><strong>Most useful next focus:</strong> ${escapeHTML(next)}</p><p class="small">Records stay on this device. No name, account, or analytics are used.</p><div class="menu"><button class="button" id="export">EXPORT JSON</button><label class="button ghost" for="import">IMPORT JSON</label><input class="sr-only" id="import" type="file" accept="application/json"><button class="button primary" id="done">DONE</button></div><div id="import-status" class="feedback" hidden></div>`,true);
  bind('#done','click',back);bind('#export','click',exportSave);bind('#import','change',(event)=>importSave(event,()=>showReport(back)));
}

function exportSave(){const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='chrono-circuit-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
async function importSave(event,done){if(!adult.unlocked){adultLogin(showTitle);return;}const status=overlay.querySelector('#import-status');status.hidden=false;try{const file=event.target.files[0];if(!file||file.size>1024*1024)throw Error('Choose a progress JSON file smaller than 1 MB.');const parsed=migrateSave(JSON.parse(await file.text()));if(!parsed)throw Error('That file is not a valid Chrono Circuit report.');parsed.settings.answerMode=save.settings.answerMode;parsed.settings.stageModes=save.settings.stageModes;parsed.settings.questionsPerGate=save.settings.questionsPerGate;save=parsed;document.body.classList.toggle('high-contrast',save.settings.contrast);document.body.classList.toggle('reduced-motion',save.settings.reducedMotion);persist();fitCanvas();status.textContent='Progress restored.';setTimeout(done,500);}catch(error){status.textContent=error.message||'Could not import that file.';status.classList.add('hint');}}

function showPracticeMenu(){state.screen='practice-menu';showOverlay(`<p class="eyebrow">FIVE QUICK CHALLENGES</p><h2>PRACTICE RELAY</h2><p>Pick a time skill. There are no hazards and mistakes cost nothing.</p><div class="menu stack"><button class="button" data-band="story">WHOLE HOURS & MIXED TIME</button><button class="button" data-band="quarters">QUARTER PAST / HALF PAST / QUARTER TO</button><button class="button" data-band="backward">GOING BACKWARD</button><button class="button" data-band="24hour">24-HOUR CLOCK</button><button class="button" data-band="tidal">TIMETABLES & CONNECTIONS</button><button class="button" data-band="garden">MULTI-STEP JOURNEYS</button><button class="button" data-band="prism">COMPARE DURATIONS</button><button class="button" data-band="fair">MINUTES & SECONDS</button><button class="button" data-band="mixed">MIX ALL EIGHT STAGES</button><button class="button ghost" id="back">BACK</button></div>`);bindAll('[data-band]','click',(event)=>{save.settings.band=event.currentTarget.dataset.band;persist();state.practice=true;state.practiceCount=0;state.practiceSeed=save.records.length%PROBLEMS.length;nextPractice();});bind('#back','click',showTitle);}
function nextPractice(){
 if(state.practiceCount>=5){showPracticeResults();return;}
 const n=save.run*7+state.practiceCount*11+save.records.length,band=save.settings.band;
 const seed=QUESTION_SEEDS[n%QUESTION_SEEDS.length],representation=['clock','platforms','timeline'][state.practiceCount%3];
 let problem;
 if(['tidal','garden','prism','fair'].includes(band)){
  const bank=PROBLEMS.filter(p=>p.id.startsWith(band+'_'));const template=bank[((state.practiceSeed||0)+state.practiceCount*5)%bank.length];
  problem=makeExpansionProblem(template.id,n+17);
 }else if(band==='mixed'){
  const template=PROBLEMS[((state.practiceSeed||0)+state.practiceCount*5)%PROBLEMS.length];
  problem=['tidal','garden','prism','fair'].some(id=>template.id.startsWith(id+'_'))?makeExpansionProblem(template.id,n+17):template;
 }else problem=generateProblem(seed,band,representation);
 openMath(problem,()=>{state.practiceCount++;setTimeout(nextPractice,500);},{practice:true});
}
function showPracticeResults(){state.practice=false;state.screen='practice-results';const recent=save.records.slice(-5),ind=recent.filter((r)=>r.support==='independent').length;showOverlay(`<div class="reward">◉</div><p class="eyebrow">RELAY COMPLETE</p><h2>${ind} OF 5 INDEPENDENT</h2><p>You finished every challenge. The useful part is the route you took through time.</p><div class="menu"><button class="button primary" id="again">PLAY AGAIN</button><button class="button" id="report">VIEW REPORT</button><button class="button ghost" id="title">TITLE</button></div>`);bind('#again','click',()=>{state.practiceCount=0;nextPractice();});bind('#report','click',()=>showReport(showPracticeResults));bind('#title','click',showTitle);}

function openMath(problem,onComplete,options={}){
 if(state.boss&&!options.practice)return;
 state.screen='math';
 options.answerMode=options.practice?modeOf(save.settings.answerMode):modeOf(save.routes[state.stage]?.answerMode);
 return openGateUI({problem,options,getSave:()=>save,persist,showOverlay,overlay,audio,
  onExit:()=>{window.speechSynthesis?.cancel();if(options.practice)showPracticeMenu();else{resumePlay();state.player.invulnerable=1;}},
  onComplete:result=>{closeOverlay();state.screen=options.practice?'practice-wait':'play';onComplete(result);}
 });
}

function solveTerminal(index){
 if(state.boss)return;
 const room=ROOMS[state.room],gate=room.gate;if(!gate)return;
 const questions=questionsForGate(save,gate.id),pending=questions.filter(p=>!save.answered.includes(p.id));
 if(!pending.length){completeGate(save,gate.id);state.platforms=createMachinery(room,save.solved);initWorld(state,room,save.world||(save.world={}));persist();return;}
 const problem=pending[0];
 openMath(problem,()=>{
  // openGateUI atomically records the answer and gate credit before continuation.
  persist();
  if(questions.some(p=>!save.answered.includes(p.id))){solveTerminal();return;}
  completeGate(save,gate.id);state.platforms=createMachinery(room,save.solved);initWorld(state,room,save.world||(save.world={}));state.reveal=save.settings.reducedMotion?.5:1.7;state.shake=save.settings.reducedMotion?0:.18;state.player.invulnerable=1;persist();showToast('CLOCK CIRCUITS RESTORED · ROUTE OPEN',2200);burst(gate.x,gate.y,COLORS.cyan,22);
 },{gateId:gate.id,ordinal:questions.length-pending.length+1,total:questions.length});
}

function update(dt){
  if(dev&&!adult.unlocked&&state.screen==='play'){adultLogin(showTitle,resumePlay);return;}
  pollGamepad();
  if(state.screen==='power-demo'){state.demoTime+=dt;drawPowerDemo();input.pressed.clear();return;}
  if(state.screen==='boss-victory'){state.roomTime+=dt;state.victoryTimer-=dt;updateParticles(dt);if(state.victoryTimer<=0)showResults();input.pressed.clear();return;}
  if(state.screen!=='play'){input.pressed.clear();return;}
  const p=state.player,room=ROOMS[state.room];
  if(consume('pause')){showPause();return;}
  if(state.deathTimer>0){state.deathTimer-=dt;if(state.deathTimer<=0)enterRoom(save.checkpoint,false);input.pressed.clear();return;}
  if(state.transition>0){state.transition-=dt;input.pressed.clear();return;}
  if(state.reveal>0){state.reveal-=dt;state.camera.x+=(clamp(room.gate.x+110,0,room.width-320)-state.camera.x)*Math.min(1,dt*4);updateParticles(dt);input.pressed.clear();return;}
  state.roomTime+=dt;state.brake=Math.max(0,state.brake-dt);state.powerCooldown=Math.max(0,state.powerCooldown-dt);
  const slow=state.brake>0?.25:1;state.machineTime+=dt*slow;
  updateMachinery(state.platforms,dt*slow);
  updateWorld(state,room,dt*slow);
  if(moveActor(p,dt,state.platforms,room,input.held,input.pressed).jumped)audio.jump();
  if(input.held.get('fire')&&p.shotCooldown<=0){shootPlayer();p.shotCooldown=.28;}
  if(consume('cycle')){const id=cyclePower(save);if(id){persist();showToast(POWERS[id].name+' EQUIPPED',900);}}
  if(consume('power')&&ownedPowers(save).length){if(activatePower(save,state)){persist();audio.tick(false);showToast(POWERS[save.equipped].name,900);burst(p.x+7,p.y+14,COLORS.cyan,14);}else if(save.energy<2)showToast('FIND BLUE ENERGY CELLS TO RECHARGE',1000);}
  const gate=room.gate,unsolved=gate&&!save.solved.includes(gate.id);
  const nearSwitch=!!nearbyWorldSwitch(state,room);
  const nearTerminal=!!gate&&Math.abs(p.x-gate.x)<35&&Math.abs(p.y+p.h-(gate.y+39))<20;
  interactButton.classList.toggle('visible',(nearTerminal&&unsolved)||nearSwitch);
  interactButton.textContent=nearSwitch&&!nearTerminal?'SWITCH':'TIME';
  powerButton.classList.toggle('visible',ownedPowers(save).length>0&&!nearTerminal);
  document.querySelector('#cycle-control').classList.toggle('visible',ownedPowers(save).length>1);
  powerButton.setAttribute('aria-label',`Use ${POWERS[save.equipped].name}`);
  if(unsolved&&p.x+p.w>gate.barrierX){p.x=gate.barrierX-p.w;p.vx=0;}
  if(nearTerminal&&unsolved&&(consume('interact')||consume('up'))){solveTerminal(gate.problem);return;}
  if(nearSwitch&&(consume('interact')||consume('up'))&&interactWorld(state,room)){persist();showToast('BRIDGE ROUTE CHANGED',1000);}
  updateEnemies(dt*slow);updateBullets(dt,slow);updateHazards();
  if(state.player!==p||state.deathTimer>0)return;
  updatePickups();
  if(state.boss)updateBoss(dt);
  if(state.screen!=='play')return;
  if(p.y>room.height+25){damagePlayer(true);return;}
  const exit=worldExit(state,room,save.solved);
  if(exit){
   const next=ROOMS.findIndex(r=>r.id===exit.roomId);
   if(next>=0){enterRoom(next,true);if(exit.spawn){Object.assign(state.player,exit.spawn);state.camera=cameraFor(state.player,ROOMS[next]);}return;}
  }else if(!room.exits&&atExit(p,room)){
   if(room.bossDoor&&!canEnterBoss(save,state.stage)){p.x=room.width-p.w-2;showToast('RESTORE ALL THREE CLOCKS FIRST',1300);}
   else{enterRoom(state.room+1,true);return;}
  }
  const camera=cameraFor(p,room);state.camera.x+=(camera.x-state.camera.x)*Math.min(1,dt*12);state.camera.y+=(camera.y-state.camera.y)*Math.min(1,dt*12);
  state.shake=Math.max(0,state.shake-dt);updateParticles(dt);input.pressed.clear();
}

function getPlatforms(){return state.platforms.filter(p=>!p.hidden);}

function shootPlayer(){const p=state.player;if(state.bullets.filter(b=>b.kind==='blaster').length>=12)return;state.bullets.push(makeBlaster(p));audio.fire();}
function updateBullets(dt,slow=1){
 const room=ROOMS[state.room];
 const impacts=stepPlayerProjectiles(state,dt,{platforms:state.platforms,room});
 for(const hit of impacts.enemyHits){
  burst(hit.x,hit.y,COLORS.cyan,6);audio.hit();
  if(hit.killed){burst(hit.enemy.x,hit.enemy.y,COLORS.orange,12);if(ownedPowers(save).length)state.pickups.push({id:hit.enemy.id+'-drop',x:hit.enemy.x+8,y:hit.enemy.y+5,type:'energy',collected:false});}
 }
 for(const hit of impacts.bossHits){state.shake=save.settings.reducedMotion?0:.08;burst(hit.x,hit.y,COLORS.cyan,8);audio.hit();}
 stepEnemyProjectiles(state,dt,{slow,room,platforms:state.platforms,onPlayerHit:()=>damagePlayer(false)});
}

function updateEnemies(dt){for(const e of state.enemies){if(e.dead)continue;const visible=e.x+e.w>=state.camera.x-12&&e.x<state.camera.x+332&&e.y+e.h>=state.camera.y&&e.y<state.camera.y+180;if(!visible)continue;state.enemyShots.push(...stepEnemy(e,state.player,dt,save.settings.assist,{room:ROOMS[state.room],platforms:state.platforms,waterY:state.world?.waterY}));if(overlap(e,state.player))damagePlayer(false);}}
function enemyShot(x,y,dx,dy,speed){const length=Math.hypot(dx,dy)||1;state.enemyShots.push({x,y,vx:dx/length*speed,vy:dy/length*speed,life:4,r:3});}
function activeHazards(){const room=ROOMS[state.room];return room.hazards.filter(h=>!(h.gateDisabled&&room.gate&&save.solved.includes(room.gate.id))).map(h=>hazardFrame(h,state.machineTime));}
function updateHazards(){for(const h of [...activeHazards(),...worldHazards(state,ROOMS[state.room])])if(h.active&&overlap(h,state.player)){damagePlayer(!!h.recovery);if(h.recovery)return;}}
function updatePickups(){for(const p of state.pickups)if(!p.collected&&hitBox(p.x-7,p.y-7,14,14,state.player.x,state.player.y,state.player.w,state.player.h)){p.collected=true;if(p.type==='heart')state.player.hearts=Math.min(5,state.player.hearts+1);else refillEnergy(save);audio.tick();persist();}}
function damagePlayer(fall){
 const p=state.player;if(state.screen!=='play'||state.deathTimer>0||(!fall&&p.invulnerable>0))return;
 p.hearts--;p.invulnerable=save.settings.assist?1.5:1;state.shake=save.settings.reducedMotion?0:.2;audio.hit();
 if(p.hearts<=0){state.deathTimer=.9;clearInput();showToast('REWINDING TO CHECKPOINT · CLOCKS STAY RESTORED',1500);}
 else if(fall){const health=p.hearts;enterRoom(state.room,true);state.player.hearts=health;state.player.invulnerable=1.2;showToast('SAFE GROUND · ONE HEART USED',1000);}
 else{p.vy=-100;p.ladder=null;p.ladderCooldown=.2;}
}

function updateBoss(dt){
 const b=state.boss;if(!b||b.defeated)return;
 if(b.hp<=0){b.defeated=true;state.player.victory=true;state.player.invulnerable=0;state.screen='boss-victory';state.victoryTimer=1.2;state.enemyShots=[];clearInput();awardStage(save,state.stage);persist();burst(b.x+18,b.y+25,COLORS.amber,60);audio.good();return;}
 state.enemyShots.push(...stepGuardian(b,state.player,dt*(state.brake>0&&b.kind==='railox'?.4:1),save.settings.assist));
 if(b.phase!=='intro'&&overlap(b,state.player))damagePlayer(false);
 for(const drop of b.drops)if(drop.active&&drop.y<164&&overlap(drop,state.player))damagePlayer(false);
}

let previousPad=new Set();
function pollGamepad(){
 const pad=navigator.getGamepads?.()[0];
 for(const [action,axis,sign,button] of [['left',0,-1,14],['right',0,1,15],['up',1,-1,12],['down',1,1,13]])input.set(action,!!pad&&(pad.axes[axis]*sign>.4||pad.buttons[button]?.pressed),`pad:${action}`);
 for(const [action,index] of [['jump',0],['fire',2],['power',1],['interact',3],['cycle',4],['pause',9]])input.set(action,!!pad?.buttons[index]?.pressed,`pad:${action}`);
 const down=new Set([...input.sources].filter(([key])=>key.startsWith('pad:')).map(([,action])=>action));
 const newlyPressed=new Set([...down].filter(action=>!previousPad.has(action)));
 const menuEdge=action=>newlyPressed.has(action);previousPad=down;
 if(!pad||state.screen==='play'||state.screen==='boss-victory')return;
 if(state.screen==='stage-select'){
  const delta=menuEdge('right')?1:menuEdge('left')?-1:menuEdge('down')?stageColumns():menuEdge('up')?-stageColumns():0;
  if(delta){const i=STAGES.findIndex(s=>s.id===state.selectedStage);overlay.querySelector(`[data-stage="${STAGES[(i+delta+STAGES.length)%STAGES.length].id}"]`)?.focus();}
  if(menuEdge('jump'))overlay.querySelector('#enter-stage')?.click();
  if(menuEdge('power'))showTitle();
 }else{
  const buttons=[...overlay.querySelectorAll('button:not([disabled])')];
  const delta=menuEdge('down')||menuEdge('right')?1:menuEdge('up')||menuEdge('left')?-1:0;
  if(delta&&buttons.length){const current=buttons.indexOf(document.activeElement);buttons[(Math.max(0,current)+delta+buttons.length)%buttons.length]?.focus();}
  if(menuEdge('jump')){const focused=buttons.includes(document.activeElement)?document.activeElement:buttons[0];focused?.click();}
 }
}
function hitBox(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}

function draw(){clearSharpText();ctx.save();if(state.shake>0)ctx.translate(Math.round((Math.random()-.5)*3),Math.round((Math.random()-.5)*3));drawBackdrop();if(state.screen!=='title'&&state.player)drawWorld();ctx.restore();updateHud();state.raf=requestAnimationFrame(loop);}
function drawBackdrop(){if(state.stage!=='foundry'&&state.screen!=='title'){drawScenery(ctx,state.stage,save.settings.reducedMotion?0:state.roomTime,state.camera);return;}if(images.backdrop.complete&&images.backdrop.naturalWidth){const sw=1536,sh=864,sy=80;ctx.drawImage(images.backdrop,0,sy,sw,sh,0,0,320,180);}else{ctx.fillStyle=COLORS.navy;ctx.fillRect(0,0,320,180);}ctx.fillStyle='#07102644';ctx.fillRect(0,0,320,180);}
function drawWorld(){
 const room=ROOMS[state.room];ctx.save();ctx.translate(-Math.round(state.camera.x),-Math.round(state.camera.y));
 if(!room.boss)drawHazard(0,room.height-10,room.width,10);
 for(const w of room.wind||[]){ctx.fillStyle='#d8f5f980';const drift=(state.machineTime*35*Math.sign(w.force))%50;for(let x=w.x;x<w.x+w.w-25;x+=50)for(let y=52;y<140;y+=27){ctx.fillRect(x+drift,y,18,1);ctx.fillRect(x+drift+(w.force>0?15:0),y-2,3,5);}}
 for(const l of room.ladders){ctx.fillStyle='#0b1224';ctx.fillRect(l.x-3,l.y-4,l.w+6,l.h+8);ctx.fillStyle='#ffc65e';ctx.fillRect(l.x,l.y-4,3,l.h+8);ctx.fillRect(l.x+l.w-3,l.y-4,3,l.h+8);for(let y=l.y;y<l.y+l.h;y+=9)ctx.fillRect(l.x,y,l.w,3);}
 for(const p of getPlatforms()){
  const wobble=p.falling&&p.triggered&&p.fallAge<.65&&!save.settings.reducedMotion?Math.sin(p.fallAge*70)*1.5:0;
  drawPlatform(p.x+wobble,p.y,p.w,p.h);
  if(p.moving){ctx.fillStyle=COLORS.cyan;ctx.fillRect(p.x+2,p.y,p.w-4,2);ctx.fillRect(p.x+p.w/2-2,p.y+4,4,2);}
  if(p.dropThrough){ctx.fillStyle=COLORS.cyan;ctx.fillRect(p.x+2,p.y,p.w-4,2);for(let x=p.x+8;x<p.x+p.w-5;x+=12){ctx.fillRect(x,p.y+4,4,1);ctx.fillRect(x+1,p.y+5,2,1);}}
  if(p.conveyor){ctx.save();ctx.beginPath();ctx.rect(p.x,p.y+3,p.w,7);ctx.clip();ctx.fillStyle=COLORS.amber;const offset=(state.machineTime*p.conveyor)%16;for(let x=p.x-20;x<p.x+p.w+20;x+=16){ctx.beginPath();ctx.moveTo(x+offset,p.y+4);ctx.lineTo(x+6+offset,p.y+7);ctx.lineTo(x+offset,p.y+10);ctx.fill();}ctx.restore();}
  if(p.falling){ctx.strokeStyle=p.triggered?COLORS.danger:COLORS.amber;ctx.beginPath();ctx.moveTo(p.x+13,p.y+2);ctx.lineTo(p.x+18,p.y+5);ctx.lineTo(p.x+14,p.y+8);ctx.stroke();}
 }
 drawWorldMechanisms(ctx,state,room);
 for(const h of activeHazards())drawMachineHazard(h);
 if(room.gate){const solved=save.solved.includes(room.gate.id);drawTerminal(room.gate.x,room.gate.y,solved);if(!solved){ctx.fillStyle='#1cd2de44';ctx.fillRect(room.gate.barrierX,20,5,room.height-20);ctx.fillStyle=COLORS.cyan;for(let y=24;y<room.height;y+=9)ctx.fillRect(room.gate.barrierX,y,5,4);}}
 if(!room.boss&&!room.exits){ctx.fillStyle=COLORS.cyan;ctx.font='bold 8px monospace';ctx.textAlign='right';ctx.fillText(room.bossDoor?'BOSS >':'NEXT >',room.width-7,room.exitY-43);ctx.fillRect(room.width-4,room.exitY-32,3,31);}
 for(const p of state.pickups)if(!p.collected){const bob=save.settings.reducedMotion?0:Math.sin(state.roomTime*4+p.x)*2;ctx.fillStyle=p.type==='heart'?COLORS.orange:COLORS.cyan;ctx.fillRect(p.x-4,p.y-5+bob,9,10);ctx.fillStyle=COLORS.cream;ctx.fillRect(p.x-1,p.y-3+bob,3,6);}
 for(const e of state.enemies)if(!e.dead)drawEnemy(e);
 for(const b of state.bullets)drawPlayerProjectile(ctx,b,state);
 drawWeaponEffects(ctx,state);
 for(const b of state.enemyShots)drawEnemyProjectile(ctx,b);
 if(state.boss)drawBoss(state.boss);
 drawPlayer(state.player);drawParticles();
 if(state.brake>0){ctx.strokeStyle=COLORS.cyan;ctx.lineWidth=1;ctx.beginPath();ctx.arc(state.player.x+7,state.player.y+14,20,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 ctx.fillStyle='#081126e8';ctx.fillRect(0,0,320,17);ctx.fillStyle=COLORS.cream;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText((dev?'DEV · ':'')+room.name,160,11);
 if(state.boss){const b=state.boss;ctx.fillStyle='#150b25';ctx.fillRect(91,20,138,10);ctx.fillStyle=COLORS.violet;ctx.fillRect(93,22,134*b.hp/b.max,6);ctx.strokeStyle=COLORS.amber;ctx.strokeRect(91,20,138,10);}
 if(state.transition>0){ctx.fillStyle=`rgba(3,8,20,${Math.min(.85,state.transition*3)})`;ctx.fillRect(0,0,320,180);}
}
function drawMachineHazard(h){
 ctx.fillStyle='#364159';ctx.fillRect(h.x-3,h.restY-4,h.w+6,6);
 if(h.warning||h.active){ctx.fillStyle=h.warning?'#ffc95e99':'#ff5d4877';ctx.fillRect(h.x-4,h.shadowY-3,h.w+8,3);if(h.warning){ctx.fillStyle=COLORS.amber;ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('!',h.x+h.w/2,h.shadowY-11);}}
 if(h.type==='crusher'||h.type==='signal'){
  ctx.fillStyle='#73829a';ctx.fillRect(h.x+h.w/2-2,h.restY,4,Math.max(0,h.y-h.restY));
  drawPlatform(h.x,h.y,h.w,h.h);ctx.fillStyle=COLORS.danger;for(let x=h.x;x<h.x+h.w;x+=8)ctx.fillRect(x,h.y+h.h-4,4,4);
 }else if(h.active){ctx.fillStyle=h.type==='bell'?'#d2b26b':h.type==='spark'?'#92e5f3':'#b34d2d';ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle=COLORS.cream;ctx.fillRect(h.x+2,h.y+1,h.w-4,4);if(h.type==='bell')ctx.fillRect(h.x-2,h.y+h.h-4,h.w+4,4);}
}
function drawPlatform(x,y,w,h){const theme=THEMES[state.stage];x=Math.round(x);y=Math.round(y);ctx.fillStyle='#071020';ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=theme.floor;ctx.fillRect(x,y,w,h);ctx.fillStyle=theme.edge;ctx.fillRect(x,y,w,3);ctx.fillStyle=theme.dark;for(let i=x+6;i<x+w;i+=12){ctx.fillRect(i,y+7,5,5);ctx.fillStyle=theme.edge;ctx.fillRect(i+1,y+8,2,2);ctx.fillStyle=theme.dark;}}
function drawHazard(x,y,w,h){if(state.stage==='sky'){ctx.fillStyle='#beeaf433';ctx.fillRect(x,y,w,h);return;}const theme=THEMES[state.stage];ctx.fillStyle=theme.dark;ctx.fillRect(x,y,w,h);const glow=save.settings.reducedMotion?.7:(Math.sin(state.roomTime*7)+1)/2;ctx.fillStyle=state.stage==='foundry'?`rgba(255,91,45,${.55+glow*.35})`:theme.light;for(let i=x+2;i<x+w;i+=6){ctx.beginPath();ctx.moveTo(i,y+h);ctx.lineTo(i+3,y+2);ctx.lineTo(i+6,y+h);ctx.fill();}}
function drawTerminal(x,y,solved){ctx.fillStyle='#17182c';ctx.fillRect(x-9,y,20,39);ctx.fillStyle=solved?COLORS.cyan:'#67708c';ctx.fillRect(x-7,y+2,16,16);ctx.fillStyle='#081126';ctx.beginPath();ctx.arc(x+1,y+10,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle=solved?COLORS.cyan:COLORS.amber;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+1,y+10,5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x+1,y+10);ctx.lineTo(x+1,y+6);ctx.moveTo(x+1,y+10);ctx.lineTo(x+5,y+12);ctx.stroke();if(!solved&&Math.abs(state.player.x-x)<34){ctx.fillStyle=COLORS.cyan;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('TIME',x+1,y-5);}}
function drawEnemy(e){if(dev&&debugBoxes)drawEnemyTelegraph(ctx,e);if(e.action==='field'){ctx.save();ctx.strokeStyle='#72f1ec';for(let i=0;i<7;i++){const dx=((state.roomTime*45+i*13)%72)+18;for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(e.x+e.w/2+sign*dx,e.y+12);ctx.lineTo(e.x+e.w/2+sign*(dx-5),e.y+15);ctx.lineTo(e.x+e.w/2+sign*dx,e.y+18);ctx.stroke();}}ctx.restore();}drawRobot(ctx,e,state.roomTime);}
function drawPlayer(p){if(p.invulnerable>0&&Math.floor(p.invulnerable*16)%2===0)return;drawTempo(ctx,p,state.roomTime);}
function drawBoss(b){
 if(dev&&debugBoxes)drawGuardianTelegraph(ctx,b);
 if(b.kind!=='pendula'){
  if(dev&&debugBoxes&&b.kind==='railox'&&b.phase==='telegraph'){
   ctx.fillStyle='#ffbc6970';
   if(b.attack===0){ctx.fillRect(24,148,270,3);ctx.fillStyle=COLORS.amber;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('JUMP TO A HIGH LEDGE',160,54);}
   if(b.attack===1){ctx.fillRect(b.targetX,147,b.w,4);ctx.strokeStyle='#ffbc69';ctx.setLineDash([3,4]);ctx.strokeRect(b.targetX,103,b.w,44);ctx.setLineDash([]);ctx.fillStyle=COLORS.amber;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('STAY LOW · WATCH THE LANDING',160,54);}
   if(b.attack===2){ctx.fillStyle=COLORS.amber;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('GET ABOVE THE FLOOR PULSES',160,54);}
  }
  if(dev&&debugBoxes&&b.kind==='vesper'&&b.attack===1&&b.phase==='telegraph'){ctx.fillStyle='#ffdc7777';ctx.fillRect(b.lockX,149,b.w,3);ctx.setLineDash([3,4]);ctx.strokeStyle='#ffdc77';ctx.strokeRect(b.lockX,38,b.w,111);ctx.setLineDash([]);}
  if(!(b.hitCooldown>0&&Math.floor(b.hitCooldown*30)%2))drawGuardian(ctx,b,state.roomTime);
  ctx.textAlign='center';ctx.font='bold 8px monospace';ctx.fillStyle=COLORS.amber;
  if(b.warning>0)ctx.fillText(GUARDIAN_ATTACKS[b.kind][b.attack],160,43);
  if(b.phase==='recovery'){ctx.fillStyle=COLORS.cyan;ctx.font='bold 7px monospace';ctx.fillText('RECOVERING',b.x+b.w/2,b.y-9);}
  if(b.phase==='intro')ctx.fillText('GET READY',160,43);
  return;
 }
 if(b.defeated){drawGuardian(ctx,b,state.roomTime);return;}
 if(b.attack===0||b.phase==='intro'){ctx.strokeStyle=COLORS.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(160,33);ctx.lineTo(b.x+20,b.y);ctx.stroke();}
 for(const d of b.drops){ctx.fillStyle=b.phase==='telegraph'?'#ffc95eaa':'#ff5d4899';if(dev&&debugBoxes)ctx.fillRect(d.x-5,148,30,3);if(b.phase==='telegraph'){ctx.fillStyle=COLORS.amber;ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('!',d.x+10,135);}if(d.y<174){drawPlatform(d.x,d.y,d.w,d.h);ctx.fillStyle=COLORS.violet;ctx.fillRect(d.x+5,d.y+4,10,12);}}
 const key=b.phase==='recovery'?'bossOpen':b.phase==='active'?'bossAttack':'boss';
 if(!(b.hitCooldown>0&&Math.floor(b.hitCooldown*30)%2))drawGuardian(ctx,b,state.roomTime);
 if(b.warning>0){ctx.fillStyle=COLORS.amber;ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(GUARDIAN_ATTACKS.pendula[b.attack],160,43);}
 else if(b.phase==='recovery'){ctx.fillStyle=COLORS.cyan;ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('RECOVERING',b.x+20,b.y-12);}
}
function drawRing(x,y,r,color){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(Math.round(x),Math.round(y),r,0,Math.PI*2);ctx.stroke();}
function burst(x,y,color,count){for(let i=0;i<count&&state.particles.length<100;i++){const a=Math.random()*Math.PI*2,s=20+Math.random()*65;state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.4+Math.random()*.5,color});}}
function updateParticles(dt){for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}state.particles=state.particles.filter(p=>p.life>0);}
function drawParticles(){for(const p of state.particles){ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,2,2);}}
let lastHud='';
function updateHud(){if(state.screen==='play'&&state.player){const s=stageFor(state.stage);hud.style.display='flex';const hearts='◆'.repeat(Math.max(0,state.player.hearts))+'◇'.repeat(Math.max(0,5-state.player.hearts));const html=`<span class="hearts" aria-label="${state.player.hearts} hearts">${hearts}</span><span>◷ ${stageSolved(save,state.stage)}/3</span><span>${state.room-s.start+1}/${s.end-s.start+1}</span>${ownedPowers(save).length?`<span class="energy">${POWERS[save.equipped].short} ${save.energy}/8</span>`:''}`;if(html!==lastHud){hud.innerHTML=html;lastHud=html;}}else hud.style.display='none';}
let toastTimer=0;function showToast(text,ms=1300){toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),ms);}


function showResults(){
 state.screen='results';const s=stageFor(state.stage),power=POWERS[s.powerId],complete=save.cleared.length===STAGES.length;
 showOverlay(`<div class="reward">◈</div><p class="eyebrow">${s.name} RESTORED</p><h2>${power.name} ACQUIRED</h2><p>${s.boss} gives Tempo its timing core.</p><p class="objective">${power.description}</p><p class="small">C or POWER uses it. Q or SWAP changes your equipped power. Blue cells restore energy.</p>${complete?'<p class="campaign-complete">ALL EIGHT CIRCUITS RESTORED!<br>The city’s clocks tick together again. Every guardian is free.</p>':`<p>${save.cleared.length} / ${STAGES.length} circuits restored. Your new power travels with you.</p>`}<div class="menu"><button class="button primary" id="try-power">TRY YOUR POWER</button><button class="button" id="select">STAGE SELECT</button></div>`);
 bind('#try-power','click',showPowerDemo);bind('#select','click',()=>showStageSelect(state.stage));
}
function showPowerDemo(){
 state.screen='power-demo';state.demoTime=0;state.demoBrake=0;state.demoPosition=0;state.demoHits=0;
 const id=save.equipped,power=POWERS[id],player=newPlayer({x:id==='orbit'?72:22,y:54});
 player.onGround=true;player.facing=1;
 state.demoTrial={player,bullets:[],enemies:[],boss:null,weaponEffects:[],brake:0,powerCooldown:0,platforms:[{x:0,y:83,w:256,h:13}],roomWidth:256};
 state.demoTarget={id:'test-target',type:'turret',x:id==='orbit'?104:131,y:id==='burst'?28:60,w:22,h:23,hp:9999,maxHp:9999,hitFlash:0,dead:false};
 state.demoTrial.enemies=[state.demoTarget];
 showOverlay(`<p class="eyebrow">WEAPON TEST BAY</p><h2>${power.name}</h2><canvas id="power-demo" width="256" height="96" aria-label="Try the equipped power on a moving target"></canvas><p>${power.description}</p><p class="small" id="demo-caption">Free energy here. Press USE POWER to try it.</p><div class="menu"><button class="button primary" id="demo-brake">USE POWER</button><button class="button warm" id="select">STAGE SELECT</button><button class="button ghost" id="replay">REPLAY THIS STAGE</button></div>`);
 bind('#demo-brake','click',()=>{if(activatePower({weapons:[id],equipped:id,energy:8},state.demoTrial)){state.demoTrial.player.shotCooldown=.28;audio.tick(false);}});
 bind('#select','click',()=>showStageSelect(state.stage));bind('#replay','click',()=>showIntro(state.stage));
}
function drawPowerDemo(){
 const c=overlay.querySelector('#power-demo')?.getContext('2d');if(!c)return;
 const trial=state.demoTrial,target=state.demoTarget,id=save.equipped;
 trial.powerCooldown=Math.max(0,trial.powerCooldown-STEP);trial.brake=Math.max(0,trial.brake-STEP);
 trial.player.shotCooldown=Math.max(0,trial.player.shotCooldown-STEP);state.demoPosition+=STEP*(trial.brake>0?.25:1);
 target.x=(id==='orbit'?104:id==='arc'||id==='disc'?111:131)+Math.sin(state.demoPosition*2)*(id==='orbit'?4:12);
 target.hitFlash=Math.max(0,target.hitFlash-STEP);
 const results=stepPlayerProjectiles(trial,STEP,{platforms:trial.platforms});state.demoHits+=results.enemyHits.length;
 c.imageSmoothingEnabled=false;c.fillStyle='#081226';c.fillRect(0,0,256,96);c.fillStyle='#6c8a9d';c.fillRect(0,83,256,13);c.fillStyle='#b9d1df';c.fillRect(0,83,256,2);
 drawTempo(c,trial.player,state.demoTime);
 c.fillStyle=target.hitFlash>0?'#fff2cf':trial.brake>0?'#8ff3ff':'#e4b777';c.fillRect(target.x,target.y,target.w,target.h);c.strokeStyle='#45516a';c.strokeRect(target.x+5,target.y+5,12,12);
 for(const b of trial.bullets)drawPlayerProjectile(c,b,trial);drawWeaponEffects(c,trial);
 c.fillStyle='#f9e6be';c.font='bold 9px monospace';c.fillText(id==='brake'?(trial.brake>0?'TIME SLOWED':'NORMAL SPEED'):`TARGET HITS: ${state.demoHits}`,66,15);
}

function loop(now){const dt=Math.min(.1,Math.max(0,(now-state.lastTime)/1000||0));state.lastTime=now;state.accumulator+=dt;let count=0;while(state.accumulator>=STEP&&count++<6){update(STEP);state.accumulator-=STEP;}draw();}
for(const img of Object.values(images))img.addEventListener('error',()=>showToast('An art file could not load. Gameplay still works.',1800));
showOverlay('<p class="eyebrow">CHRONO CIRCUIT · v'+BUILD+'</p><h2>WINDING UP…</h2><p>Loading Tempo and the eight guardians.</p>');
const bootReady=Promise.allSettled([preloadTempoArt(),preloadActorArt(),preloadScenery()]).then(results=>{showTitle();if(results.some(r=>r.status==='rejected'))showToast('Some artwork could not load. Refresh to try again.',4000);state.lastTime=performance.now();state.raf=requestAnimationFrame(loop);});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});

function adultLogin(back,success=()=>adultPanel(back)){
 state.screen='adult';clearInput();
 showOverlay('<h2>ADULT ACCESS</h2><label>Password<input id="adult-pass" type="password" autocomplete="current-password"></label><p id="adult-error" role="status"></p><div class="menu"><button class="button primary" id="unlock">UNLOCK</button><button class="button" id="cancel">BACK</button></div>');
 const unlock=async()=>{const button=overlay.querySelector('#unlock');button.disabled=true;try{if(await adult.unlock(overlay.querySelector('#adult-pass').value))success();else{overlay.querySelector('#adult-error').textContent=Date.now()<adult.blockedUntil?'Wait 30 seconds before trying again.':'Password not accepted.';button.disabled=false;}}catch{overlay.querySelector('#adult-error').textContent='Adult access requires HTTPS and browser storage.';button.disabled=false;}};
 bind('#unlock','click',unlock);bind('#adult-pass','keydown',e=>{if(e.key==='Enter')unlock();});bind('#cancel','click',()=>{adult.lock();back();});
}
function adultPanel(back){
 state.screen='adult';if(!adult.unlocked)return adultLogin(back);
 const select=(id,value,inherit=false)=>`<select id="${id}">${inherit?'<option value="">Use global mode</option>':''}${MODES.map(m=>`<option value="${m}" ${m===value?'selected':''}>${m.toUpperCase()}</option>`).join('')}</select>`;
 showOverlay(`<h2>ADULT SETTINGS</h2><p>Changes apply to new runs. DEV runs do not save progress.</p><label>Answer mode ${select('adult-mode',save.settings.answerMode)}</label><label>Questions per gate<input id="adult-count" type="number" min="1" max="10" value="${save.settings.questionsPerGate}"></label><details><summary>Stage overrides</summary>${STAGES.map(s=>`<label>${s.name}${select('mode-'+s.id,save.settings.stageModes?.[s.id]||'',true)}</label>`).join('')}</details><label>New password (optional)<input id="new-password" type="password" autocomplete="new-password"></label><p id="adult-status" role="status"></p><div class="menu"><button class="button primary" id="adult-save">SAVE SETTINGS</button><button class="button" id="dev-start">${dev?'EXIT DEV AND RESTORE SAVE':'ENTER DEV MODE'}</button><button class="button" id="adult-back">LOCK AND BACK</button></div>${dev?`<label>Jump to room<select id="dev-room">${ROOMS.map((r,i)=>`<option value="${i}">${r.stage} · ${r.name}</option>`).join('')}</select></label><label><input type="checkbox" id="dev-boxes" ${debugBoxes?'checked':''}>Debug hitboxes</label><div class="menu"><button class="button" id="dev-jump">LOAD ROOM / RESET ENCOUNTER</button><button class="button" id="dev-refill">REFILL HEALTH AND ENERGY</button></div>`:''}`,true);
 bind('#adult-save','click',async()=>{if(!adult.unlocked)return adultLogin(back);const count=Number(overlay.querySelector('#adult-count').value);if(!Number.isInteger(count)||count<1||count>10){overlay.querySelector('#adult-status').textContent='Choose 1–10 questions.';return;}try{const password=overlay.querySelector('#new-password').value;if(password)await adult.change(password);save.settings.answerMode=modeOf(overlay.querySelector('#adult-mode').value);save.settings.questionsPerGate=count;save.settings.stageModes=Object.fromEntries(STAGES.map(s=>[s.id,overlay.querySelector('#mode-'+s.id).value]).filter(([,v])=>v));persist();overlay.querySelector('#adult-status').textContent='Saved for new runs.';}catch(e){overlay.querySelector('#adult-status').textContent=e.message;}});
 bind('#adult-back','click',()=>{adult.lock();back();});
 bind('#dev-start','click',()=>{if(!adult.unlocked)return adultLogin(back);if(dev){dev=false;debugBoxes=false;save=devBackup;devBackup=null;adult.lock();showTitle();return;}devBackup=save;save=structuredClone(save);dev=true;save.solved=[...GATE_IDS];save.weapons=Object.keys(POWERS);save.energy=8;adultPanel(back);});
 bind('#dev-jump','click',()=>{if(!adult.unlocked)return adultLogin(back);debugBoxes=overlay.querySelector('#dev-boxes').checked;save.solved=[...GATE_IDS];state.screen='play';const room=Number(overlay.querySelector('#dev-room').value);closeOverlay();enterRoom(room,false);});
 bind('#dev-refill','click',()=>{if(!adult.unlocked)return adultLogin(back);if(state.player)state.player.hearts=5;save.energy=8;overlay.querySelector('#adult-status').textContent='Health and energy restored.';});
}
