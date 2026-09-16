import {fromAbsolute} from './time-engine.js';
const q=(id,start,duration,representation,skill,context,effect,extra={})=>({id,start:fromAbsolute(start),duration,representation,skill,context,effect,...extra});
const duration=(id,start,end,skill,context,effect,extra={})=>q(id,start,end-start,'duration',skill,context,effect,{task:'duration',end:fromAbsolute(end),...extra});
const convert=(id,minute,notation24,context,effect,extra={})=>q(id,minute,0,'convert','12/24-hour conversion',context,effect,{task:'convert',notation24,...extra});
export const ADDITIONAL_PROBLEMS=[
 q('foundry_minutes',535,35,'timeline','regrouping minutes','A press starts at 8:55 AM and runs for 35 minutes. Choose its finish time.','Cooling circuit checked'),
 duration('foundry_elapsed',610,705,'elapsed time','A conveyor runs from 10:10 AM until 11:45 AM. How long does it run?','Shift timer checked'),
 q('foundry_noon_exact',690,30,'clock','noon and midnight','A safety check starts at 11:30 AM and lasts 30 minutes. Set the finish time.','Noon signal checked'),
 q('metro_departure',625,-75,'clock','missing start time','The train arrives at 10:25 AM. The journey takes 1 hour 15 minutes. Set its departure time.','Departure signal restored'),
 q('metro_borrow',605,-40,'timeline','backward regrouping','The signal turns green at 10:05 AM. Maintenance must finish 40 minutes earlier. When is the deadline?','Signal arms raised'),
 q('metro_noon',765,-90,'clock','backward across noon','A train arrives at 12:45 PM after a 1 hour 30 minute journey. When did it leave?','Switch tracks aligned'),
 q('metro_missing_start',800,-155,'timetable','missing start time','ARRIVAL: 1:20 PM. JOURNEY: 2 hours 35 minutes. Choose the missing departure time on the timetable.','Express schedule restored'),
 q('metro_midnight',20,-50,'timeline','backward across midnight','The last train arrives at 12:20 AM. It travelled for 50 minutes. Choose its departure time, including the day.','Night platform powered'),
 q('metro_duration_unknown',730,-130,'clock','subtract hours and minutes','The engine inspection ends at 12:10 PM. It started 2 hours 10 minutes earlier. Set the start time.','Railox route unlocked'),
 q('tower_quarter_past',0,555,'read','quarter past','Set the clock to quarter past 9 in the morning.','East bell tuned',{task:'read',hint:'Quarter past means 15 minutes after the named hour.'}),
 q('tower_half_past',0,870,'words','half past','The bell rings at 2:30 PM. Choose the matching words.','West bell tuned',{task:'words',hint:'Half an hour is 30 minutes. Half past stays in the named hour.'}),
 q('tower_quarter_to',0,885,'read','quarter to','Set the clock to quarter to 3 in the afternoon.','Clock hands aligned',{task:'read',hint:'Quarter to 3 means 15 minutes before 3:00 PM.'}),
 q('tower_word_addition',585,45,'clock','time language and addition','The winding starts at quarter to 10 in the morning. It takes 45 minutes. Set the finish time.','Gear lift engaged',{hideStart:true}),
 duration('tower_elapsed',675,765,'elapsed across noon','The bells ring from quarter past 11 in the morning to quarter to 1 in the afternoon. How much time passes?','Bell bridge locked',{hideStart:true}),
 q('tower_word_subtraction',930,-45,'timeline','time language and subtraction','The rehearsal ends at half past 3 in the afternoon. It lasts 45 minutes. Choose the start time.','Ricochet route unlocked',{hideStart:true}),
 convert('sky_24_pm',1125,true,'The airship leaves at 6:45 PM. Enter its time on the 24-hour display.','Airship beacon restored'),
 convert('sky_12_pm',840,false,'The weather station displays 14:00. Choose the equivalent AM/PM time.','Weather channel restored'),
 convert('sky_midnight_label',0,false,'The beacon displays 00:00. Choose the equivalent AM/PM time.','Midnight beacon aligned'),
 convert('sky_noon_label',720,true,'The sun dial reads 12:00 PM. Enter this time on the 24-hour display.','Noon beacon aligned'),
 q('sky_midnight_trip',1420,95,'clock','24-hour midnight addition','The airship leaves at 23:40. Its journey takes 1 hour 35 minutes. Set its arrival time and day.','Storm bridge energized',{notation24:true}),
 duration('sky_elapsed',1415,1480,'24-hour elapsed time','A flight leaves at 23:35 and arrives at 00:40 the next day. How long is the flight?','Vesper route unlocked',{notation24:true}),
];

export const QUESTION_SETS={
 foundry_cooldown:['foundry_cooldown','foundry_minutes'],
 foundry_shift:['foundry_shift','foundry_elapsed'],
 foundry_crane:['foundry_crane','foundry_noon_exact'],
 metro_signals:['metro_departure','metro_borrow'],
 metro_switch:['metro_noon','metro_missing_start'],
 metro_night:['metro_midnight','metro_duration_unknown'],
 tower_bells:['tower_quarter_past','tower_half_past'],
 tower_hands:['tower_quarter_to','tower_word_addition'],
 tower_bridge:['tower_elapsed','tower_word_subtraction'],
 sky_beacons:['sky_24_pm','sky_12_pm'],
 sky_dials:['sky_midnight_label','sky_noon_label'],
 sky_storm:['sky_midnight_trip','sky_elapsed'],
};

// Four distinct reasoning templates per gate. Only integer arithmetic is used.
export const EXPANSION_GATE_TEMPLATES={
 tidal_wait:['wait_same','wait_hour','departure','arrival'],
 tidal_transfer:['catch','connection_wait','connection_arrival','none'],
 tidal_deadline:['feasible','earliest_arrival','latest_departure','slack'],
 garden_steps:['finish','total','missing_stop','start'],
 garden_deadline:['latest','allowance','spare','preparation'],
 garden_midnight:['finish','start','missing_stop','duration'],
 prism_compare:['shorter','longer','equal','mixed_units'],
 prism_difference:['intervals','staggered','missing_duration','equal'],
 prism_overnight:['shorter','longer','latest_finish','equal'],
 fair_units:['minute_seconds','seconds_minutes','hours_minutes','minutes_seconds'],
 fair_cycles:['repeat_seconds','repeat_mixed','count','cycle_length'],
 fair_budget:['remaining','total','missing_cycle','setup'],
};
const clock=n=>{const day=Math.floor(n/1440),m=((n%1440)+1440)%1440,h=Math.floor(m/60);return `${h%12||12}:${String(m%60).padStart(2,'0')} ${h>=12?'PM':'AM'}${day===1?' Wednesday':day===-1?' Monday':''}`;};
const minuteText=n=>`${Math.floor(n/60)?`${Math.floor(n/60)} h `:''}${n%60?`${n%60} min`:''}`.trim()||'0 min';
const secondText=n=>`${Math.floor(n/3600)?`${Math.floor(n/3600)} h `:''}${Math.floor(n%3600/60)?`${Math.floor(n%3600/60)} min `:''}${n%60?`${n%60} s`:''}`.trim()||'0 s';
const namedClock=n=>`${clock(n)}${n>=0&&n<1440?' Tuesday':''}`;
export function makeExpansionProblem(id,seed=1){
 const gate=Object.keys(EXPANSION_GATE_TEMPLATES).find(k=>id.startsWith(k+'_'));
 if(!gate)throw new Error(`Unknown expansion template ${id}`);
 const kind=id.slice(gate.length+1);let state=[...`${id}:${seed}`].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
 const pick=a=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return a[state%a.length];};
 const p={id,templateId:id,variantSeed:seed,gate,expansion:true,start:fromAbsolute(0),duration:0,representation:'table',skill:gate,context:'',effect:'Circuit restored',task:'seconds',answerSeconds:0};
 const seconds=(n,unitTarget=null)=>Object.assign(p,{task:'seconds',answerSeconds:n,unitTarget});
 const point=(start,delta)=>Object.assign(p,{task:'journey',start:fromAbsolute(start),duration:delta,representation:'journey'});
 const route=(rows,answer)=>Object.assign(p,{task:'route',schedule:rows,answerRoute:answer});
 const rows=(departures,arrivals)=>departures.map((departure,i)=>({id:String.fromCharCode(65+i),departure,arrival:arrivals[i]}));
 const steps=entries=>{p.steps=entries.map(([label,minutes])=>({label,minutes}));};
 const pair=(a,b,which='shorter',data={})=>{p.task='comparison';p.representation='comparison';p.compare={a,b,which,...data};p.answerRoute=a===b?'equal':which==='longer'?(a>b?'A':'B'):(a<b?'A':'B');p.answerSeconds=Math.abs(a-b)*60;};
 if(gate==='tidal_wait'){
  const start=pick([8,9,10])*60+pick([10,15,20]),wait=pick([15,20,25]);
  if(kind==='wait_same'||kind==='wait_hour'){const a=kind==='wait_hour'?start+30:start;p.context='Use the dock schedule. How long is the wait between arrival and departure?';p.schedule=[{id:'Dock',arrival:a,departure:a+wait}];seconds(wait*60);}
  if(kind==='departure'){p.context=`The cargo arrives at ${clock(start)}. It waits ${wait} minutes. Set the departure time.`;point(start,wait);steps([['Wait',wait]]);}
  if(kind==='arrival'){p.context=`Departure is ${clock(start+wait)} after a ${wait}-minute wait. Set the arrival time at the dock.`;point(start+wait,-wait);steps([['Wait',wait]]);}
 }
 if(gate==='tidal_transfer'){
  const arrival=pick([9,10,12])*60+35,walk=10,ready=arrival+walk;const schedule=rows([arrival+5,arrival+15,arrival+35],[arrival+35,arrival+50,arrival+65]);
  p.schedule=schedule;p.arrival=arrival;p.transferMinutes=walk;p.tableNote=`You reach this dock at ${clock(arrival)}. Transfer takes ${walk} minutes. Boarding is allowed when ready exactly at departure time.`;
  if(kind==='catch'){p.context='Choose the earliest departure you can catch.';route(schedule,'B');}
  if(kind==='connection_wait'){p.context='After completing the transfer, how long must you wait for service B?';seconds((schedule[1].departure-ready)*60);}
  if(kind==='connection_arrival'){p.context='Take the earliest departure you can catch. Set the time you arrive at the destination.';point(arrival,schedule[1].arrival-arrival);}
  if(kind==='none'){schedule[1].departure=arrival+7;schedule[2].departure=arrival+9;p.context='Which service can you catch? Choose NONE if every departure is too early.';route(schedule,'none');}
 }
 if(gate==='tidal_deadline'){
  const shift=pick([0,30,60]),arrival=755+shift,ready=arrival+10,deadline=840+shift;let schedule=rows([arrival+5,arrival+15,arrival+35],[arrival+35,arrival+60,arrival+95]);
  p.arrival=arrival;p.transferMinutes=10;p.deadline=deadline;p.tableNote=`You reach the dock at ${clock(arrival)} and need 10 minutes to transfer. Arrive at the destination no later than ${clock(deadline)}. You may board when ready exactly at departure time.`;
  if(kind==='feasible'){const order=pick([[0,1,2],[1,2,0],[2,0,1]]);schedule=order.map((n,i)=>({...schedule[n],id:String.fromCharCode(65+i)}));p.context='Choose the service that you can catch and that meets the deadline.';route(schedule,schedule.find(r=>r.departure>=ready&&r.arrival<=deadline).id);}
  if(kind==='earliest_arrival'){schedule=rows([ready+5,ready+15,ready+25],[deadline-10,deadline-25,deadline-5]);p.context='All three can be caught. Which reaches the destination earliest while meeting the deadline?';route(schedule,'B');}
  if(kind==='latest_departure'){schedule=rows([ready+5,ready+15,ready+25],[deadline-15,deadline-5,deadline+5]);p.context='Choose the latest departure that still meets the arrival deadline.';route(schedule,'B');}
  if(kind==='slack'){p.context='Take service B. How much time remains between its arrival and the deadline?';p.schedule=schedule;seconds((deadline-schedule[1].arrival)*60);}
 }
 if(gate==='garden_steps'){
  const start=pick([8,9,10])*60+20,a=pick([25,35,45]),pause=pick([10,15,20]),b=pick([20,25,30]),total=a+pause+b;
  steps([['Travel',a],['Stop',pause],['Travel',b]]);
  if(kind==='finish'){p.context=`Leave the greenhouse at ${clock(start)}. Follow every step in order. Set the finish time.`;point(start,total);}
  if(kind==='total'){p.context='Follow these journey steps in order. How much time does the whole journey take?';seconds(total*60);}
  if(kind==='missing_stop'){p.steps[1].minutes=null;p.context=`The whole journey takes ${minuteText(total)}. Find the missing stop duration.`;seconds(pause*60);}
  if(kind==='start'){p.context=`The journey ends at ${clock(start+total)}. Follow the steps shown. Set the start time.`;point(start+total,-total);}
 }
 if(gate==='garden_deadline'){
  const deadline=pick([13,14,15])*60+10,a=pick([15,20,25]),wait=15,b=45,total=a+wait+b;steps([['Walk',a],['Fixed wait',wait],['Travel',b]]);
  if(kind==='latest'){p.context=`Arrive no later than ${clock(deadline)}. Find the latest starting time for these steps.`;point(deadline,-total);}
  if(kind==='allowance'){p.steps[1].minutes=null;p.context=`Start at ${clock(deadline-total)} and arrive exactly at ${clock(deadline)}. Find the missing wait.`;seconds(wait*60);}
  if(kind==='spare'){const spare=pick([10,15,20]);p.context=`Start at ${clock(deadline-total-spare)}. The deadline is ${clock(deadline)}. How long after your arrival is the deadline?`;seconds(spare*60);}
  if(kind==='preparation'){const prep=pick([10,15,20]);steps([['Prepare',prep],['Walk',a],['Fixed wait',wait],['Travel',b]]);p.context=`Finish all these steps by ${clock(deadline)}. What is the latest time to begin preparation?`;point(deadline,-total-prep);}
 }
 if(gate==='garden_midnight'){
  const start=1380+pick([15,25,35]),a=40,pause=pick([10,15,20]),b=35,total=a+pause+b;steps([['Travel',a],['Stop',pause],['Travel',b]]);p.namedDays=true;
  if(kind==='finish'){p.context=`Leave at ${namedClock(start)}. Set the arrival time and day after all steps.`;point(start,total);}
  if(kind==='start'){p.context=`Arrive at ${namedClock(start+total)}. Set the departure time and day before these steps.`;point(start+total,-total);}
  if(kind==='missing_stop'){p.steps[1].minutes=null;p.context=`Leave at ${namedClock(start)} and arrive at ${namedClock(start+total)}. How long is the missing stop?`;seconds(pause*60);}
  if(kind==='duration'){p.context=`The complete route runs from ${namedClock(start)} to ${namedClock(start+total)}. How long is the route?`;seconds(total*60);}
 }
 if(gate==='prism_compare'){
  const a=pick([35,45,55]),diff=pick([10,20,30]);let b=a+diff;
  if(kind==='equal')b=a;
  pair(a,b,kind==='longer'?'longer':'shorter');p.context=`Route A takes ${minuteText(a)}. Route B takes ${minuteText(b)}. Choose the ${p.compare.which} route and enter the difference. Choose EQUAL with zero difference if equal.`;
  if(kind==='mixed_units'){pair(a+30,b+30);p.context=`Route A takes ${a+30} minutes. Route B takes ${minuteText(b+30)}. Choose the shorter route and enter the difference.`;}
 }
 if(gate==='prism_difference'){
  const start=pick([8,9])*60+35,a=75,b=kind==='equal'?75:pick([45,55,65]);const other=start+35;
  if(kind==='missing_duration'){p.context=`Route A takes ${a} minutes. Route B is ${a-b} minutes shorter. Find route B's duration.`;seconds(b*60);}
  else {pair(a,b);p.trips=[{id:'A',start,end:start+a},{id:'B',start:other,end:other+b}];p.context='Use both trip panels. Choose the shorter journey and enter the difference. Choose EQUAL with zero difference if equal.';if(kind==='staggered'){p.trips[1].start+=40;p.trips[1].end+=40;}}
 }
 if(gate==='prism_overnight'){
  const start=1370+pick([0,5,10]),a=90,b=kind==='equal'?90:pick([65,75,85]),other=start+25;pair(a,b,kind==='longer'?'longer':'shorter');p.trips=[{id:'A',start,end:start+a},{id:'B',start:other,end:other+b}];p.namedDays=true;
  p.context=`Both trips start Tuesday and end Wednesday. Choose the ${p.compare.which} journey and enter the duration difference. Choose EQUAL with zero difference if equal.`;
  if(kind==='latest_finish'){p.trips[1].end=other+85;p.task='route';p.answerRoute='B';p.context='Both trips start Tuesday and end Wednesday. Which arrives later on Wednesday? Compare arrival times, not journey durations.';}
 }
 if(gate==='fair_units'){
  if(kind==='minute_seconds'){const m=pick([2,3,4]),s=pick([15,20,35]);p.context=`Express ${m} minutes ${s} seconds in seconds.`;seconds(m*60+s,'seconds');}
  if(kind==='seconds_minutes'){const n=pick([135,155,185,205]);p.context=`Express ${n} seconds as minutes and seconds.`;seconds(n,'minutesSeconds');}
  if(kind==='hours_minutes'){const h=pick([1,2,3]),m=pick([15,20,35]);p.context=`Express ${h} hours ${m} minutes in minutes.`;seconds((h*60+m)*60,'minutes');}
  if(kind==='minutes_seconds'){const m=pick([3,4,6]);p.context=`Express ${m} minutes in seconds.`;seconds(m*60,'seconds');}
 }
 if(gate==='fair_cycles'){
  const count=pick([3,4,5]),length=kind==='repeat_seconds'?pick([25,35,45]):pick([75,95,135]);p.cycles={count,seconds:length};
  if(kind==='repeat_seconds'||kind==='repeat_mixed'){p.context=`${count} cycles each last ${secondText(length)}. They run consecutively with no gaps. Find the total duration.`;seconds(count*length);}
  if(kind==='count'){p.task='quantity';p.answerNumber=count;p.unit='cycles';p.context=`A ride runs for ${secondText(count*length)}. Each cycle takes ${secondText(length)}, with no gaps. How many complete cycles are there?`;p.cycles={count:null,seconds:length};}
  if(kind==='cycle_length'){p.context=`${count} identical cycles take ${secondText(count*length)} altogether, with no gaps. Find one cycle's duration.`;seconds(length);p.cycles={count,seconds:null};}
 }
 if(gate==='fair_budget'){
  const setup=pick([15,25,35]),count=pick([2,3,4]),length=pick([65,75,80]),total=setup+count*length,budget=total+pick([25,30,45,60]);p.budgetSeconds=budget;
  if(kind==='remaining'){p.context=`You have ${secondText(budget)}. Setup takes ${setup} seconds, then ${count} cycles each take ${secondText(length)}, with no gaps. How much time remains?`;seconds(budget-total);}
  if(kind==='total'){p.context=`Setup takes ${setup} seconds. Then ${count} consecutive cycles each take ${secondText(length)}. Find the total time including setup.`;seconds(total);}
  if(kind==='missing_cycle'){p.context=`Setup and ${count} identical cycles take ${secondText(total)} altogether. Setup takes ${setup} seconds. There are no gaps. Find one cycle's duration.`;seconds(length);}
  if(kind==='setup'){p.context=`Setup and ${count} consecutive ${secondText(length)} cycles take ${secondText(total)} altogether. Find the setup time.`;seconds(setup);}
 }
 if(!p.context)throw new Error(`Unimplemented template ${id}`);
 p.representation=p.schedule?'timetable':p.trips?'trip panels':p.steps?'ordered steps':p.compare?'duration panels':['seconds','quantity'].includes(p.task)?'duration units':p.representation;
 p.skill={tidal_wait:'schedule waiting time',tidal_transfer:'transfer feasibility',tidal_deadline:'schedule deadlines',garden_steps:'multi-step time',garden_deadline:'working backward from deadlines',garden_midnight:'multi-step midnight journeys',prism_compare:'compare stated durations',prism_difference:'compare calculated durations',prism_overnight:'compare overnight trips',fair_units:'exact time-unit conversion',fair_cycles:'repeated durations',fair_budget:'time budgets'}[gate];
 return p;
}
for(const [gate,kinds] of Object.entries(EXPANSION_GATE_TEMPLATES)){
 const ids=kinds.map(kind=>`${gate}_${kind}`);QUESTION_SETS[gate]=ids;ADDITIONAL_PROBLEMS.push(...ids.map(id=>makeExpansionProblem(id,1)));
}
