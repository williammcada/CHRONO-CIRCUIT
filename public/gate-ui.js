import {absolute,fromAbsolute,formatTime,boundaryFlags,landmarkHops,addMinutes} from './time-engine.js';
import {expectedAnswer,answerLabel,taskChoices,taskHint,secondsText} from './math-tasks.js';
import {learningSession,submitLearningAnswer,nextLearningCheck} from './progress.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isNumber=v=>v!==''&&Number.isInteger(Number(v))&&Number(v)>=0;
const days={[-1]:'Monday',0:'Tuesday',1:'Wednesday',2:'Thursday'};
const timeLabel=(n,named=false)=>`${formatTime(fromAbsolute(n),false,!named)}${named?` ${days[Math.floor(n/1440)]||`day ${Math.floor(n/1440)+1}`}`:''}`;
export function parseDurationDraft(d,target=null){
 target ||= d.durationUnit;
 if(target==='seconds'||target==='minutes')return isNumber(d.amount)?Number(d.amount)*(target==='minutes'?60:1):null;
 if(!['hours','minutes','seconds'].some(k=>d[k]!==undefined&&d[k]!==''))return null;
 const values=['hours','minutes','seconds'].map(k=>d[k]===''||d[k]===undefined?0:Number(d[k]));
 if(values.some(n=>!Number.isInteger(n)||n<0)||values[2]>=60||(target!=='minutesSeconds'&&values[1]>=60))return null;
 return values[0]*3600+values[1]*60+values[2];
}
export function parseTimeDraft(d,notation24=false){
 if(!isNumber(d.hour)||!isNumber(d.minute)||Number(d.minute)>59)return null;
 let h=Number(d.hour);if(notation24){if(h>23)return null;}else{if(h<1||h>12||!['AM','PM'].includes(d.period))return null;h=h%12+(d.period==='PM'?12:0);}
 const day=Number(d.day??0);if(!Number.isInteger(day)||day< -2||day>3)return null;
 return fromAbsolute(day*1440+h*60+Number(d.minute));
}
export function candidateFromDraft(p,d){
 if(p.task==='seconds')return parseDurationDraft(d,p.unitTarget);
 if(p.task==='quantity')return isNumber(d.amount)?Number(d.amount):null;
 if(p.task==='duration'){const seconds=parseDurationDraft(d);return seconds===null||seconds%60?null:seconds/60;}
 if(p.task==='comparison'){const seconds=parseDurationDraft(d);return d.route&&seconds!==null?{route:d.route,seconds}:null;}
 if(p.task==='route')return d.route||null;
 if(p.task==='words')return d.choice===undefined?null:fromAbsolute(Number(d.choice));
 return parseTimeDraft(d,!!p.notation24);
}
function numberField(name,label,d,max){return `<label>${label}<input data-field="${name}" type="number" inputmode="numeric" min="0" ${max===undefined?'':`max="${max}"`} value="${esc(d[name]??'')}" placeholder="0" autocomplete="off"></label>`;}
function durationFields(d,target){
 const selector=!target?`<label class="gate-select">Answer units<select data-field="durationUnit">${[['parts','Hours, minutes, seconds'],['seconds','Total seconds'],['minutes','Total minutes']].map(([value,label])=>`<option value="${value}" ${(d.durationUnit||'parts')===value?'selected':''}>${label}</option>`).join('')}</select></label>`:'';
 const effective=target||d.durationUnit;
 if(effective==='seconds'||effective==='minutes')return `${selector}<div class="gate-fields">${numberField('amount',effective==='seconds'?'Seconds':'Minutes',d)}</div>`;
 return `${selector}<div class="gate-fields">${target==='minutesSeconds'?'':numberField('hours','Hours',d)}${numberField('minutes','Minutes',d,target==='minutesSeconds'?undefined:59)}${numberField('seconds','Seconds',d,59)}</div>`;
}

function tableMarkup(p){
 if(!p.schedule)return '';
 const hasArrival=p.schedule.some(r=>Number.isFinite(r.arrival)),hasDeparture=p.schedule.some(r=>Number.isFinite(r.departure));
 // Waiting tables represent arrival at a dock, then departure. Service tables
 // represent departure from the dock and arrival at the destination.
 const columns=p.gate==='tidal_wait'?['arrival','departure']:['departure','arrival'];
 return `<div class="gate-table-wrap"><table class="gate-table"><caption>${esc(p.tableNote||'Dock schedule')}</caption><thead><tr><th>Service</th>${columns.filter(k=>k==='arrival'?hasArrival:hasDeparture).map(k=>`<th>${k==='arrival'?'Arrival':'Departure'}</th>`).join('')}</tr></thead><tbody>${p.schedule.map(r=>`<tr><th scope="row">${esc(r.id)}</th>${columns.filter(k=>k==='arrival'?hasArrival:hasDeparture).map(k=>`<td>${Number.isFinite(r[k])?esc(timeLabel(r[k],!!p.namedDays)):'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function visualData(p){
 const steps=p.steps?`<ol class="gate-steps">${p.steps.map(s=>`<li><strong>${esc(s.label)}</strong><span>${s.minutes===null?'?':esc(secondsText(s.minutes*60))}</span></li>`).join('')}</ol>`:'';
 const trips=p.trips?`<div class="gate-trips">${p.trips.map(t=>`<div><strong>Route ${esc(t.id)}</strong><span>${esc(timeLabel(t.start,!!p.namedDays))}</span><span>to ${esc(timeLabel(t.end,!!p.namedDays))}</span></div>`).join('')}</div>`:'';
 const durations=p.compare&&!p.trips?`<div class="gate-trips"><div><strong>Route A</strong><span>${esc(secondsText(p.compare.a*60))}</span></div><div><strong>Route B</strong><span>${esc(secondsText(p.compare.b*60))}</span></div></div>`:'';
 return tableMarkup(p)+steps+trips+durations;
}
function method(p){
 const answer=answerLabel(p,expectedAnswer(p));
 if(p.schedule){const ready=(p.arrival??p.schedule[0].arrival)+(p.transferMinutes||0);return `${p.arrival!==undefined?`Ready to board: ${timeLabel(ready)}. `:''}Compare each departure with the ready time, then compare its arrival with the deadline when one is given. ${taskHint(p,null).text} Answer: ${answer}.`;}
 if(p.trips){const durations=p.trips.map(t=>`${t.id}: ${secondsText((t.end-t.start)*60)}`).join('; ');return `${durations}. ${p.task==='route'?'For the latest arrival, compare the arrival clocks.':'Compare those durations and subtract the shorter from the longer.'} Answer: ${answer}.`;}
 if(p.steps){const shown=p.steps.filter(s=>s.minutes!==null).map(s=>secondsText(s.minutes*60)).join(' + ');return `${shown}. ${taskHint(p,null).text} Answer: ${answer}.`;}
 if(p.task==='seconds'||p.task==='quantity'||p.task==='comparison')return `${taskHint(p,null).text} Answer: ${answer}.`;
 const hops=landmarkHops(p);let n=absolute(p.start);return `${timeLabel(n)} ${hops.map(h=>{n+=h;return ` → ${h<0?'−':'+'}${Math.abs(h)} min → ${timeLabel(n)}`;}).join('')}. Answer: ${answer}.`;
}
function initialDraft(p){return p.task==='words'?{}:{day:'0',period:p.start?.minuteOfDay>=720?'PM':'AM'};}
export function openGateUI(api){
 const {problem,options={},getSave,persist,showOverlay,overlay,onExit,onComplete}=api,audio=api.audio||{};
 const save=getSave(),session=learningSession(save,problem,options);let closed=false,finishing=false;
 if(!Object.keys(session.draft).length)session.draft=initialDraft(session.current);
 persist();
 const bind=(selector,event,fn)=>overlay.querySelectorAll(selector).forEach(el=>el.addEventListener(event,fn));
 function readInputs(){for(const input of overlay.querySelectorAll('[data-field]'))session.draft[input.dataset.field]=input.value;persist();}
 function render(){
  if(closed)return;const p=session.current,d=session.draft,demonstration=session.phase==='demonstration';
  let inputs='';
  if(demonstration)inputs=`<div class="gate-worked"><h3>LET’S WORK THROUGH IT</h3><p>${esc(method(p))}</p><p>The next check uses a fresh question. Your gate progress stays saved.</p><button class="button primary" id="gate-check">TRY A FRESH CHECK</button></div>`;
  else if(p.task==='route')inputs=`<label class="gate-select">Choose a service<select data-field="route"><option value="">Choose…</option>${[...new Set((p.schedule||p.trips||[{id:'A'},{id:'B'}]).map(r=>r.id)),'none'].map(r=>`<option value="${esc(r)}" ${d.route===r?'selected':''}>${r==='none'?'NONE':esc(r)}</option>`).join('')}</select></label>`;
  else if(p.task==='comparison')inputs=`<label class="gate-select">${p.compare?.which==='longer'?'Longer':'Shorter'} route<select data-field="route"><option value="">Choose…</option>${['A','B','equal'].map(r=>`<option value="${r}" ${d.route===r?'selected':''}>${r==='equal'?'EQUAL':`Route ${r}`}</option>`).join('')}</select></label><p>Difference in duration</p>${durationFields(d)}`;
  else if(p.task==='seconds'||p.task==='duration')inputs=durationFields(d,p.task==='seconds'?p.unitTarget:null);
  else if(p.task==='quantity')inputs=`<div class="gate-fields">${numberField('amount',esc(p.unit||'Number'),d)}</div>`;
  else if(p.task==='words')inputs=`<div class="choice-grid">${taskChoices(p).map(c=>`<button class="choice" data-word="${absolute(c)}">${esc(answerLabel(p,c))}</button>`).join('')}</div>`;
  else inputs=`<canvas id="gate-clock" width="210" height="210" aria-label="Clock used to explore your answer"></canvas><div class="gate-fields">${numberField('hour',p.notation24?'Hour (0–23)':'Hour (1–12)',d,p.notation24?23:12)}${numberField('minute','Minute (0–59)',d,59)}${p.notation24?'':`<label>AM / PM<select data-field="period"><option ${d.period==='AM'?'selected':''}>AM</option><option ${d.period==='PM'?'selected':''}>PM</option></select></label>`}</div><label class="gate-select">Day<select data-field="day">${[-1,0,1,2].map(day=>`<option value="${day}" ${Number(d.day||0)===day?'selected':''}>${p.namedDays?days[day]:day===0?'Same day':day===-1?'Previous day':day===1?'Next day':'Two days later'}</option>`).join('')}</select></label><div class="gate-adjust">${[-60,-15,-5,5,15,60].map(n=>`<button class="button" data-adjust="${n}">${n>0?'+':'−'}${Math.abs(n)===60?'1 h':Math.abs(n)+' min'}</button>`).join('')}</div>`;
  const feedback=session.feedback||'The world is paused. Take all the time you need.';
  showOverlay(`<section class="gate-panel"><div class="gate-question"><p class="eyebrow">${options.practice?'PRACTICE RELAY':`CLOCK GATE · ${options.ordinal||1} / ${options.total||1}`}${session.checkSerial?' · PRACTICE CHECK':''}</p><h2>${p.task==='comparison'?'COMPARE THE JOURNEYS':p.task==='route'?'PLAN THE ROUTE':['seconds','duration','quantity'].includes(p.task)?'WORK WITH TIME':'MOVE THROUGH TIME'}</h2><p class="gate-context">${esc(p.context)}</p>${visualData(p)}${session.attempts>=2&&!demonstration?`<p class="gate-scaffold">${esc(taskHint(p,null).text)}</p>`:''}<p class="feedback" aria-live="polite">${esc(feedback)}</p></div><div class="gate-answer">${inputs}${!demonstration&&p.task!=='words'?'<button class="button primary" id="gate-submit">LOCK IN ANSWER</button>':''}</div></section><div class="math-back"><button class="button ghost" id="gate-back">${options.practice?'BACK TO PRACTICE':'BACK TO THE CLOCK'}</button></div>`,true);
  bind('#gate-back','click',()=>{readInputs();closed=true;globalThis.speechSynthesis?.cancel();onExit?.();});
  bind('[data-field]','input',()=>{readInputs();drawAnswerClock();});bind('[data-field]','change',e=>{readInputs();if(e.currentTarget.dataset.field==='durationUnit')render();else drawAnswerClock();});
  bind('#gate-submit','click',()=>{readInputs();submit(candidateFromDraft(p,session.draft));});
  bind('[data-word]','click',e=>{session.draft.choice=e.currentTarget.dataset.word;persist();submit(candidateFromDraft(p,session.draft));});
  bind('[data-adjust]','click',e=>{readInputs();const before=parseTimeDraft(session.draft,!!p.notation24)||p.start,t=addMinutes(before,Number(e.currentTarget.dataset.adjust)),hour=Math.floor(t.minuteOfDay/60);Object.assign(session.draft,{hour:String(p.notation24?hour:hour%12||12),minute:String(t.minuteOfDay%60),period:hour>=12?'PM':'AM',day:String(t.dayOffset)});persist();audio.tick?.(Number(e.currentTarget.dataset.adjust)>0);render();});
  bind('#gate-check','click',()=>{nextLearningCheck(session);session.draft=initialDraft(session.current);session.feedback='Use the method on this fresh check.';persist();render();narrate();});
  drawAnswerClock();
 }
 function drawAnswerClock(){const canvas=overlay.querySelector('#gate-clock');if(!canvas)return;const c=canvas.getContext?.('2d');if(!c)return;const p=session.current,t=parseTimeDraft(session.draft,!!p.notation24)||p.start,r=105;c.clearRect(0,0,210,210);c.fillStyle='#fff3d1';c.beginPath();c.arc(r,r,99,0,Math.PI*2);c.fill();c.fillStyle='#172940';c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';for(let h=1;h<=12;h++){const a=h*Math.PI/6-Math.PI/2;c.fillText(String(h),r+Math.cos(a)*78,r+Math.sin(a)*78);}const hand=(a,len,w,color)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(r,r);c.lineTo(r+Math.cos(a-Math.PI/2)*len,r+Math.sin(a-Math.PI/2)*len);c.stroke();};hand(t.minuteOfDay/60*Math.PI/6,49,6,'#172940');hand(t.minuteOfDay%60*Math.PI/30,71,4,'#078c99');}
 function submit(candidate){
  if(closed||finishing)return;audio.start?.();
  if(candidate===null){session.feedback='Enter every required answer part. Use whole numbers; minutes and seconds in a clock go from 0 to 59.';persist();render();return;}
  const result=submitLearningAnswer(save,session,candidate,options);
  if(result.correct){
   finishing=true;audio.good?.();const record={id:session.original.id,templateId:problem.templateId||problem.id,skill:problem.skill,representation:problem.representation,boundary:boundaryFlags(problem),support:session.support,attempts:session.totalAttempts,errors:[...session.errors],seconds:Math.max(0,Math.round((Date.now()-session.startedAt)/1000)),at:Date.now(),transferChecks:session.checkSerial};
   if(!result.alreadyCredited){save.records.push(record);save.records=save.records.slice(-160);}
   persist();const el=overlay.querySelector('.feedback');if(el){el.className='feedback good';el.textContent=`${answerLabel(session.current,expectedAnswer(session.current))}. ${problem.effect}.`;}
   overlay.querySelectorAll('button,input,select').forEach(b=>b.disabled=true);
   setTimeout(()=>{if(closed)return;closed=true;onComplete?.({attempts:session.totalAttempts,support:session.support,problem,record,credited:true});},650);
  }else{audio.wrong?.();session.feedback=taskHint(session.current,candidate).text;persist();render();}
 }
 function narrate(){if(!save.settings.narration||!globalThis.speechSynthesis)return;globalThis.speechSynthesis.cancel();const p=session.current,spoken=[p.context,p.tableNote||'',...(p.schedule||[]).map(r=>`${r.id}. ${r.departure!==undefined?`Departure ${timeLabel(r.departure)}.`:''} ${r.arrival!==undefined?`Arrival ${timeLabel(r.arrival)}.`:''}`),...(p.steps||[]).map(s=>`${s.label}: ${s.minutes===null?'missing time':secondsText(s.minutes*60)}`),...(p.trips||[]).map(t=>`Route ${t.id}, ${timeLabel(t.start,!!p.namedDays)} to ${timeLabel(t.end,!!p.namedDays)}`)].join(' ');globalThis.speechSynthesis.speak(new SpeechSynthesisUtterance(spoken));}
 render();narrate();return {session,close(){readInputs();closed=true;globalThis.speechSynthesis?.cancel();},submit,render};
}
