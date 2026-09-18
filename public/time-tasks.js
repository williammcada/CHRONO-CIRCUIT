import {absolute,fromAbsolute,addMinutes,formatTime,elapsedText,timeWords,landmarkHops,diagnose,hintFor} from './time-engine.js';
export function expectedAnswer(p){
 if(p.task==='seconds')return p.answerSeconds;
 if(p.task==='quantity')return p.answerNumber;
 if(p.task==='route')return p.answerRoute;
 if(p.task==='comparison')return {route:p.answerRoute,seconds:p.answerSeconds};
 return p.task==='duration'?p.duration:addMinutes(p.start,p.duration);
}
export function answerCorrect(p,a){
 const expected=expectedAnswer(p);
 if(['seconds','quantity','duration'].includes(p.task))return Number.isInteger(a)&&a===expected;
 if(p.task==='route')return typeof a==='string'&&a===expected;
 if(p.task==='comparison')return !!a&&a.route===expected.route&&Number.isInteger(a.seconds)&&a.seconds===expected.seconds;
 return !!a&&Number.isInteger(a.minuteOfDay)&&Number.isInteger(a.dayOffset)&&absolute(a)===absolute(expected);
}
export function secondsText(value){const n=Math.abs(value),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return [h?`${h} h`:'',m?`${m} min`:'',s?`${s} s`:''].filter(Boolean).join(' ')||'0 s';}
export function answerLabel(p,a){
 if(p.task==='quantity')return `${a} ${p.unit||''}`;
 if(p.task==='seconds')return p.unitTarget==='seconds'?`${a} seconds`:p.unitTarget==='minutes'?`${a/60} minutes`:secondsText(a);
 if(p.task==='route')return a==='none'?'NONE':`Route ${a}`;
 if(p.task==='comparison')return `${a.route==='equal'?'EQUAL':`Route ${a.route}`} · ${secondsText(a.seconds)} difference`;
 if(typeof a==='number')return elapsedText(a);
 if(p.namedDays){const label={[-1]:'Monday',0:'Tuesday',1:'Wednesday',2:'Thursday'}[a.dayOffset]||`day ${a.dayOffset+1}`;return `${formatTime(a,!!p.notation24,false)} ${label}`;}
 return p.task==='words'?`${timeWords(a)} · ${a.minuteOfDay<720?'AM':'PM'}`:formatTime(a,!!p.notation24);
}
export function taskChoices(p){
 if(['seconds','quantity','comparison','route'].includes(p.task))return [];
 const correct=expectedAnswer(p),a=absolute(correct);
 let values=p.task==='convert'?[a,(a+720)%1440,(a+60)%1440]:p.task==='words'?[a,a-15,a+15]:[a-60,a,a+30];
 let seed=[...p.id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7);
 for(let i=values.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[values[i],values[j]]=[values[j],values[i]];}
 return [...new Set(values)].map(fromAbsolute);
}
export function taskEquation(p){
 if(p.expansion)return '';
 if(p.hideStart)return '';
 if(p.task==='duration')return `${formatTime(p.start,!!p.notation24)} → ${formatTime(p.end,!!p.notation24)}<br>How long?`;
 if(p.task==='convert')return `${formatTime(p.start,!p.notation24)} → ${p.notation24?'24-hour time':'AM/PM time'}`;
 if(p.task==='read'||p.task==='words'||p.hideStart)return '';
 if(p.duration<0)return `? + ${elapsedText(p.duration)}<br>= ${formatTime(p.start,!!p.notation24)}`;
 return `${formatTime(p.start,!!p.notation24)}<br>+ ${elapsedText(p.duration)} = ?`;
}
export function taskHint(p,answer){
 if(p.expansion){
  let text='Use the quantities shown. Keep hours, minutes and seconds in separate groups.';
  if(p.gate.startsWith('tidal'))text='Find when the transfer finishes. A departure must be at or after that time. Check the arrival deadline separately.';
  if(p.gate==='tidal_wait')text='Count from arrival to departure. There are 60 minutes in an hour.';
  if(p.gate.startsWith('garden'))text='Combine every journey step, including stops. For a missing start, work backward from the finish. Crossing midnight changes the day.';
  if(p.gate.startsWith('prism'))text='Calculate each duration separately, then compare. The trip that finishes later is not always the longer trip. Equal durations have zero difference.';
  if(p.gate==='prism_overnight'&&p.task==='route')text='This question asks which arrives later. Both arrivals are Wednesday; compare their arrival clock times.';
  if(p.gate==='fair_units')text='One minute is 60 seconds. One hour is 60 minutes. Group into sixties, not hundreds.';
  if(p.gate==='fair_cycles')text='Identical cycles have equal durations. Multiply for the total, or divide an exact total into equal groups.';
  if(p.gate==='fair_budget')text='Include setup once. Multiply one cycle by the number of cycles. Subtract the used time from the budget when asked for the remainder.';
  const taxonomy={tidal_wait:'schedule-waiting-time',tidal_transfer:'transfer-feasibility',tidal_deadline:'arrival-deadline',garden_steps:'multi-step-time',garden_deadline:'working-backward-from-deadline',garden_midnight:'midnight-day-boundary',prism_compare:'duration-comparison',prism_difference:'elapsed-duration-comparison',prism_overnight:'overnight-duration-comparison',fair_units:'time-unit-conversion',fair_cycles:'repeated-durations',fair_budget:'time-budget'};
  const error=p.task==='comparison'&&answer?.route===p.answerRoute?'duration-difference':p.task==='route'&&p.gate==='prism_overnight'?'arrival-time-order':taxonomy[p.gate]||'time-calculation';
  return {error,text};
 }
 if(p.task==='duration')return {error:'elapsed-duration',text:'Count from the starting time to the finishing time. Combine the hours and the minutes. There are 60 minutes in one hour.'};
 if(p.task==='convert')return {error:'notation-conversion',text:'00:00 is midnight (12:00 AM). 12:00 is noon (12:00 PM). For afternoon hours 1–11, add 12 to write 24-hour time.'};
 if(p.task==='read'||p.task==='words')return {error:p.skill.replaceAll(' ','-'),text:p.hint||'Quarter past is :15, half past is :30, and quarter to is :45 in the hour before the named hour.'};
 const error=diagnose(p,answer);return {error,text:hintFor(p,error)};
}
export function taskScaffold(p){
 if(p.expansion)return taskHint(p,null).text;
 if(['read','words','convert'].includes(p.task))return p.hint||taskHint(p,null).text;
 return landmarkHops(p).map(h=>`${h<0?'−':'+'}${Math.abs(h)} min`).join(' → ');
}
