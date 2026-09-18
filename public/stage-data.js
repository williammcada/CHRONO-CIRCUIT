import { fromAbsolute } from './time-engine.js';
import {EXTRA_ROOMS} from './stage-layouts.js';
import {EXPANSION_ROOMS} from './expansion-layouts.js';
import {ADDITIONAL_PROBLEMS,QUESTION_SETS} from './curriculum.js';

export const BUILD='0.9.0';
export const STAGES=[
  {id:'foundry',boss:'PENDULA',name:'FURNACE RUN',district:'Gearwork Foundry',skill:'Hours + minutes · across noon',power:'BEAT BRAKE',color:'#ffc35b',portrait:'pendula',available:true,description:'Ride the shift lifts, climb the gantries, and duck falling slag. Repair three clocks to reach Pendula’s chamber.'},
  {id:'metro',boss:'RAILOX',name:'MIDNIGHT METRO',skill:'Work backward through time',power:'TRANSIT LANCE',color:'#f98972',portrait:'railox',available:false,description:'Train roofs, signal arms, and a charging locomotive guardian. Railox jumps across the arena and reverses at the walls.'},
  {id:'tower',boss:'RICOCHET',name:'BELL TOWER',skill:'Quarter past · half past · quarter to',power:'ECHO DISC',color:'#c3a3ff',portrait:'ricochet',available:false,description:'Rotating clock hands and ladder shafts lead to a wall-jumping clockwork lynx. Its rebounding discs become your next weapon.'},
  {id:'sky',boss:'VESPER WING',name:'SKY DIAL',skill:'24-hour clock · across midnight',power:'UPDRAFT BURST',color:'#7dece9',portrait:'vesper',available:false,description:'Airships and wind columns surround a flying guardian. Watch its spotlight lock before it dives to the ground.'},
  {id:'tidal',boss:'BRINEJAW',name:'TIDAL EXCHANGE',district:'Flood-Control Harbor',skill:'Schedules · waits · transfers',power:'DEPTH CHARGE',color:'#7de3dd',portrait:'brinejaw',available:true},
  {id:'garden',boss:'FLORAVEL',name:'VERDANT ENGINE',district:'The Living Greenhouse',skill:'Multi-step journeys · deadlines',power:'BRAMBLE ROLLER',color:'#b4e987',portrait:'floravel',available:true},
  {id:'prism',boss:'FACET',name:'PRISM ARCHIVE',district:'Archive of Light',skill:'Compare durations · differences',power:'PRISM ORBIT',color:'#c5b0f2',portrait:'facet',available:true},
  {id:'fair',boss:'JOLT JESTER',name:'DYNAMO FAIR',district:'Electric Fairground',skill:'Seconds · units · repeated durations',power:'ARC THREAD',color:'#ffe079',portrait:'jester',available:true},
];

export const FOUNDRY_PROBLEMS=[
 {id:'foundry_cooldown',start:fromAbsolute(505),duration:120,representation:'clock',skill:'whole hours',context:'The furnace starts cooling at 8:25 AM. Cooling takes 2 hours. Set the finish time to shut off the flame jets.',effect:'Flame jets off. Crossing lifts online'},
 {id:'foundry_shift',start:fromAbsolute(550),duration:95,representation:'clock',skill:'mixed time',context:'The shift lift leaves at 9:10 AM. Its trip takes 1 hour 35 minutes. Set its arrival time to synchronize the two lifts.',effect:'Shift lifts synchronized. Checkpoint saved'},
 {id:'foundry_crane',start:fromAbsolute(645),duration:210,representation:'clock',skill:'crossing noon',context:'The crane starts its route at 10:45 AM. The route takes 3 hours 30 minutes. Set the arrival time to turn the crane into a bridge.',effect:'Crane bridge locked. Boss route open'},
];
const floor=(x,y,w,h=12,extra={})=>({x,y,w,h,...extra});
const lift=(x,y,w,axis,travel,period=4,extra={})=>floor(x,y,w,8,{moving:true,axis,travel,period,...extra});
const ladder=(x,top,bottom)=>({x,y:top,w:18,h:bottom-top});
const slag=(x,top=30,bottom=151,offset=0)=>({type:'slag',x,y:top,w:12,h:16,bottom,period:3.8,offset,warning:.8});
const crusher=(x,y=30,bottom=151,offset=0)=>({type:'crusher',x,y,w:30,h:22,bottom,period:4,offset,warning:.75});
const enemy=(x,y,type=0)=>({x,y,type});
const room=(id,name,extras)=>({id,name,width:640,height:180,spawn:{x:16,y:122},exitY:151,platforms:[],ladders:[],moving:[],hazards:[],enemies:[],pickups:[],...extras});

// All route data uses logical pixels. A room may span several camera screens.
export const ROOMS=[
 room('entry','FURNACE RUN',{
   hint:'Run right. Hold JUMP for a higher leap. Hold PULSE to fire.',
   platforms:[floor(0,151,170,29),floor(202,139,90),floor(324,151,140,29),floor(494,136,76),floor(592,151,48,29)],
   enemies:[enemy(108,136),enemy(385,136)],pickups:[{x:538,y:116,type:'heart'}],
 }),
 room('belts','CONVEYOR GANTRY',{
   hint:'The striped belts carry you. Jump against the belt to leave it.',
   platforms:[floor(0,151,105,29),floor(125,145,150,12,{conveyor:23}),floor(301,124,100,12,{conveyor:-20}),floor(429,145,105,12,{conveyor:26}),floor(558,151,82,29)],
   enemies:[enemy(215,130),enemy(468,130)],
 }),
 room('cooldown','COOLING CONTROL',{
   hint:'Use TIME at the clock. Your answer powers the crossing lifts.',
   gate:{id:'foundry_cooldown',problem:0,x:95,y:112,barrierX:184},
   platforms:[floor(0,151,186,29),floor(561,151,79,29)],
   unlockedPlatforms:[floor(261,138,58),floor(416,128,60)],
   unlockedMoving:[lift(199,147,45,'y',-26,3.5),lift(337,135,50,'x',24,4),lift(490,140,50,'y',-18,3.2)],
   hazards:[{...crusher(183),gateDisabled:true}],
 }),
 room('presses','STAMPING LINE',{
   hint:'Yellow lights warn before the press falls. Wait beside each striped lane.',
   platforms:[floor(0,151,640,29)],
   hazards:[crusher(172),crusher(335,30,151,1.3),crusher(492,30,151,2.6)],
   enemies:[enemy(265,136),enemy(573,136)],
 }),
 room('ladderworks','LADDER WORKS',{
   width:320,height:360,spawn:{x:16,y:306},exitY:72,
   hint:'UP or DOWN catches a ladder. Climb through the top. Jump to let go.',
   platforms:[floor(0,335,165,25),floor(69,235,128),floor(179,151,118),floor(207,72,113)],
   ladders:[ladder(101,235,335),ladder(182,151,235),ladder(241,72,151)],
   enemies:[enemy(267,136,2)],pickups:[{x:266,y:51,type:'heart'}],
 }),
 room('slag','SLAG CHUTES',{
   hint:'Look for the yellow shadow. Falling slag always warns first.',
   platforms:[floor(0,151,166,29),floor(194,141,116),floor(337,151,147,29),floor(516,137,60),floor(600,151,40,29)],
   hazards:[slag(128),slag(253,24,141,1.1),slag(421,24,151,2.2),slag(545,24,137,.7)],
   enemies:[enemy(370,136),enemy(535,112,1)],pickups:[{x:307,y:111,type:'energy'}],
 }),
 room('shift','SHIFT CONTROL',{
   hint:'Synchronize the shift lifts. This control room is a checkpoint.',checkpoint:true,
   gate:{id:'foundry_shift',problem:1,x:89,y:112,barrierX:171},
   platforms:[floor(0,151,173,29),floor(298,126,60),floor(486,118,62),floor(578,151,62,29)],
   unlockedMoving:[lift(196,150,74,'y',-32,4.5),lift(381,126,77,'y',-30,4.5,{phase:.5})],
   pickups:[{x:512,y:97,type:'heart'}],
 }),
 room('shaft','COUNTERWEIGHT SHAFT',{
   width:320,height:360,spawn:{x:16,y:306},exitY:91,
   hint:'Ride the lift, then climb. The maintenance cache above the side ledge is optional.',
   platforms:[floor(0,335,109,25),floor(209,254,111),floor(43,174,80),floor(187,91,133)],
   moving:[lift(131,328,64,'y',-81,4.5,{phase:.5})],
   ladders:[ladder(214,174,254),ladder(77,91,174)],
   // Narrow bridge landings connect both ladder tops; no blind precision jump.
   extraPlatforms:[floor(109,174,133),floor(69,91,151)],
   hazards:[slag(263,110,254,1)],
   pickups:[{x:269,y:234,type:'energy'}],
 }),
 room('catwalk','BREAKAWAY CATWALK',{
   hint:'Loose plates shake before falling. Keep moving; they always return.',
   platforms:[floor(0,151,106,29),floor(135,136,59,8,{falling:true}),floor(222,121,59,8,{falling:true}),floor(307,141,76),floor(408,126,64,8,{falling:true}),floor(496,136,61,8,{falling:true}),floor(583,151,57,29)],
   hazards:[slag(341,28,141,1.2)],
   enemies:[enemy(338,126)],
 }),
 room('crane','MASTER CRANE CLOCK',{
   hint:'Cross noon in your calculation. The crane becomes your final bridge.',
   gate:{id:'foundry_crane',problem:2,x:97,y:112,barrierX:191},
   platforms:[floor(0,151,193,29),floor(574,151,66,29)],
   unlockedPlatforms:[floor(210,137,105),floor(335,125,95),floor(450,137,103)],
 }),
 room('finale','THE LAST SHIFT',{
   width:800,hint:'Combine what you learned: belts, lifts, ladders, and marked slag.',
   platforms:[floor(0,151,132,29,{conveyor:22}),floor(248,134,101),floor(477,130,126),floor(649,99,65),floor(741,151,59,29)],
   moving:[lift(156,145,66,'y',-23,3.7),lift(380,127,66,'y',-20,3.8)],
   ladders:[ladder(575,99,130)],extraPlatforms:[floor(568,99,98)],
   hazards:[slag(286,24,134,.5),slag(526,24,130,1.5),crusher(669,26,99,2)],
   enemies:[enemy(305,119),enemy(550,115)],
 }),
 room('corridor','PENDULA APPROACH',{
   width:320,checkpoint:true,hint:'Three clocks restored. Take a breath. Pendula is through the door.',
   platforms:[floor(0,151,320,29)],pickups:[{x:123,y:132,type:'heart'},{x:166,y:132,type:'energy'}],
   bossDoor:true,
 }),
 room('boss','PENDULA’S CHAMBER',{
   width:320,boss:true,hint:'Watch the warning. Dodge the swing. Fire at Pendula.',
   platforms:[floor(0,151,320,29)],
 }),
];
ROOMS.push(...EXTRA_ROOMS);
// Append only: saves from v0.6 retain all 52 original numerical room indices.
ROOMS.push(...EXPANSION_ROOMS);
ROOMS.forEach((r,roomIndex)=>{
 r.stage=r.stage||'foundry';
 if(r.gate)r.gate.problems=QUESTION_SETS[r.gate.id];
 r.index=roomIndex;
 r.platforms.push(...(r.extraPlatforms||[]));
 for(const key of ['platforms','moving','unlockedPlatforms','unlockedMoving'])
   (r[key]||[]).forEach((p,i)=>{p.id=`${r.id}-${key}-${i}`;});
 r.enemies.forEach((e,i)=>{e.id=`${r.id}-enemy-${i}`;});
 r.pickups.forEach((p,i)=>{p.id=`${r.id}-pickup-${i}`;});
});
// The original export remains useful to old saves and foundry regression checks.
export const BOSS_ROOM=12;
export const PROBLEMS=[...FOUNDRY_PROBLEMS,...ADDITIONAL_PROBLEMS];
export const GATE_IDS=ROOMS.filter(r=>r.gate).map(r=>r.gate.id);
const descriptions={
 foundry:'Restore the furnace clocks. Ride lifts, climb gantries, and dodge falling slag before facing Pendula.',
 metro:'Work backward through departure boards. Ride train roofs, cross signal arms, and face Railox’s charges and leaps.',
 tower:'Translate the bells’ time language. Climb the spire, ride orbiting clock hands, and face the wall-jumping Ricochet.',
 sky:'Repair 12-hour and 24-hour beacons. Cross airships, wind currents, and storm lanes before Vesper Wing dives from the clouds.',
 tidal:'Read schedules and transfer times. Ride buoys, return through the drained quay, and face Brinejaw on its raised docks.',
 garden:'Combine journeys and work backward from deadlines. Follow growing leaves and stable seed pods to Floravel’s crown.',
 prism:'Compare exact durations. Switch light bridges, restore both archive wings, and confront Facet’s moving shutters.',
 fair:'Convert seconds and budget repeated cycles. Board gondolas and drum lifts before facing Jolt Jester’s spring attacks.',
};
for(const s of STAGES){
 const rooms=ROOMS.filter(r=>r.stage===s.id);
 s.available=true;s.start=rooms[0].index;s.end=rooms.at(-1).index;s.gates=rooms.filter(r=>r.gate).map(r=>r.gate.id);
 s.description=descriptions[s.id];s.gameplayDescription=descriptions[s.id].split('. ').slice(1).join('. ');s.district=s.district||s.name;
 s.powerId={foundry:'brake',metro:'lance',tower:'disc',sky:'burst',tidal:'depth',garden:'roller',prism:'orbit',fair:'arc'}[s.id];
}
export const stageFor=id=>STAGES.find(s=>s.id===id)||STAGES[0];
export const problemFor=id=>PROBLEMS.find(p=>p.id===id);
