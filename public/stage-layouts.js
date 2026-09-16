// Individually authored routes: metro train roofs, a vertical bell tower, and open sky.
const p=(x,y,w,h=12,extra={})=>({x,y,w,h,...extra});
const lift=(x,y,w,axis,travel,period=4,extra={})=>p(x,y,w,8,{moving:true,axis,travel,period,...extra});
const ladder=(x,top,bottom)=>({x,y:top,w:18,h:bottom-top});
const e=(x,foot,type)=>({x,foot,type});
const fall=(type,x,bottom=151,offset=0)=>({type,x,y:25,w:14,h:18,bottom,period:4.4,offset,warning:1});
const signal=(x,bottom=151,offset=0)=>({type:'signal',x,y:25,w:24,h:20,bottom,period:4.5,offset,warning:1});
const r=(stage,id,name,extra={})=>({stage,id:`${stage}-${id}`,name,width:640,height:180,spawn:{x:16,y:122},exitY:151,platforms:[],moving:[],ladders:[],hazards:[],enemies:[],pickups:[],...extra});
const gate=(stage,id,name,gateId,extra={})=>r(stage,id,name,{gate:{id:gateId,x:90,y:112,barrierX:177},platforms:[p(0,151,179,29),p(550,151,90,29)],unlockedPlatforms:[p(207,143,80),p(319,128,80),p(432,142,87)],hint:'Answer the clock questions to open this route.',...extra});
const approach=(stage,name)=>r(stage,'approach',name,{width:320,checkpoint:true,bossDoor:true,platforms:[p(0,151,320,29)],pickups:[{x:140,y:132,type:'heart'},{x:178,y:132,type:'energy'}],hint:'Clocks restored. Checkpoint saved. The guardian is through the door.'});
const boss=(stage,name)=>r(stage,'boss',name,{width:320,boss:true,platforms:[p(0,151,320,29),...(stage==='metro'?[
 p(26,125,45,8,{dropThrough:true}),p(80,97,52,8,{dropThrough:true}),
 p(128,125,64,8,{dropThrough:true}),p(188,97,52,8,{dropThrough:true}),p(249,125,45,8,{dropThrough:true}),
 ]:[])],hint:stage==='metro'?'Jump from a ledge over the charge. Stay low for the leap. DOWN + JUMP drops through ledges.':'Watch the warning, keep moving, and use your blaster.'});

export const EXTRA_ROOMS=[
 r('metro','entry','MIDNIGHT METRO',{platforms:[p(0,151,186,29),p(218,139,118),p(367,151,273,29)],enemies:[e(120,151,'railbug'),e(277,139,'railbug'),e(474,151,'signalbot')],hint:'Railbugs charge after their red lamp flashes. All armor takes blaster damage.'}),
 r('metro','roofs','ROOFTOP EXPRESS',{platforms:[p(0,151,100,29),p(205,139,110),p(430,139,94),p(553,151,87,29)],moving:[lift(122,145,62,'x',20,3),lift(336,138,72,'x',17,3.8)],enemies:[e(253,139,'signalbot'),e(482,139,'railbug')],hint:'Ride the cyan roof cars. Jump when they bring you close to the next train.'}),
 gate('metro','signals','DEPARTURE SIGNALS','metro_signals',{hazards:[{...signal(186),gateDisabled:true}]}),
 r('metro','junction','SWITCHBACK JUNCTION',{platforms:[p(0,151,640,29)],hazards:[signal(178),signal(358,151,1.5),signal(523,151,3)],enemies:[e(275,151,'railbug'),e(584,151,'signalbot')],hint:'Yellow track lamps warn before a signal arm lowers. Stop outside the marked lane.'}),
 r('metro','vent','SERVICE RISER',{width:320,height:320,spawn:{x:16,y:276},exitY:101,platforms:[p(0,305,146,15),p(83,214,175),p(180,101,140)],ladders:[ladder(103,214,305),ladder(224,101,214)],enemies:[e(280,101,'signalbot')],pickups:[{x:264,y:82,type:'heart'}],hint:'Climb the service ladders. Tempo can fire sideways while climbing.'}),
 r('metro','freight','FREIGHT SHUFFLE',{platforms:[p(0,151,152,29,{conveyor:18}),p(180,139,116,12,{conveyor:-18}),p(326,151,130,29),p(488,137,83),p(600,151,40,29)],enemies:[e(243,139,'railbug'),e(380,151,'signalbot'),e(514,119,'ticketdrone')],hint:'Ticket drones dip into blaster range. Jump to meet one higher up.'}),
 gate('metro','switch','NOON SWITCH CONTROL','metro_switch',{checkpoint:true,unlockedPlatforms:[p(310,128,85)],unlockedMoving:[lift(207,143,80,'x',12,4),lift(432,142,87,'x',-12,4)]}),
 r('metro','shuttle','SHUTTLE TRANSFER',{platforms:[p(0,151,120,29),p(248,135,108),p(480,136,72),p(583,151,57,29)],moving:[lift(147,146,76,'x',20,3.3),lift(386,138,70,'x',17,3.9)],enemies:[e(300,135,'signalbot'),e(509,136,'railbug')],hint:'The shuttle cars move sideways. Jump from their leading edges.'}),
 r('metro','tunnel','LAST TRAIN TUNNEL',{platforms:[p(0,151,149,29),p(179,137,77,8,{falling:true}),p(286,143,87),p(403,128,76,8,{falling:true}),p(508,151,132,29)],hazards:[signal(328,143,.8)],enemies:[e(563,151,'railbug')],hint:'Old roof panels loosen beneath your feet. Their warning shake gives you time to leave.'}),
 gate('metro','night','LAST DEPARTURE','metro_night'),
 r('metro','express','SIGNAL GAUNTLET',{width:800,platforms:[p(0,151,167,29),p(196,138,146,12,{conveyor:18}),p(449,139,105),p(586,127,90),p(705,151,95,29)],moving:[lift(367,144,61,'x',15,3)],hazards:[signal(258,138,.7),signal(631,127,2.2)],enemies:[e(498,139,'signalbot'),e(745,151,'railbug')],hint:'Time the signals, then ride the final express car. Railox is close.'}),
 approach('metro','RAILOX APPROACH'),boss('metro','RAILOX’S TERMINUS'),

 r('tower','entry','BELL TOWER',{platforms:[p(0,151,151,29),p(179,132,106),p(315,151,118,29),p(461,130,80),p(571,151,69,29)],enemies:[e(112,151,'gearling'),e(372,151,'bellguard')],hint:'Gearlings hop. Shoot while they land or jump to meet them.'}),
 r('tower','gears','GEAR BALCONIES',{platforms:[p(0,151,118,29),p(253,137,111),p(498,139,70),p(596,151,44,29)],moving:[lift(148,142,76,'orbit',12,4,{radiusY:9}),lift(394,137,73,'orbit',13,4.8,{radiusY:9})],enemies:[e(305,137,'bellguard')],hint:'Clockwork ledges move in circles. Their cyan tops are safe to stand on.'}),
 gate('tower','bells','EAST AND WEST BELLS','tower_bells'),
 r('tower','chimes','CHIME SHAFT',{width:320,height:420,spawn:{x:16,y:366},exitY:101,platforms:[p(0,395,146,25),p(80,295,158),p(157,199,151),p(76,101,244)],ladders:[ladder(105,295,395),ladder(192,199,295),ladder(244,101,199)],hazards:[fall('bell',277,199,1.7)],enemies:[e(289,101,'bellguard')],hint:'Climb the alternating rungs. Falling bells mark their landing lane first.'}),
 r('tower','balcony','NORTH BELL BALCONY',{platforms:[p(0,151,146,29),p(176,137,106),p(311,151,115,29),p(456,135,84),p(570,151,70,29)],hazards:[fall('bell',236,137,.3),fall('bell',392,151,1.9)],enemies:[e(107,151,'gearling'),e(488,116,'chimebat')],hint:'Watch the gold bell shadows. Chime bats sweep down through your firing line.'}),
 r('tower','escapement','ESCAPEMENT WALK',{platforms:[p(0,151,122,29),p(151,134,63,8,{falling:true}),p(243,117,75),p(347,134,70,8,{falling:true}),p(448,143,86),p(564,151,76,29)],enemies:[e(272,117,'gearling'),e(485,143,'bellguard')],hint:'Use a full jump for rising steps. Loose escapement teeth fall after a shake.'}),
 gate('tower','hands','CLOCK HAND CONTROL','tower_hands',{checkpoint:true,unlockedPlatforms:[p(319,128,80)],unlockedMoving:[lift(207,143,80,'orbit',7,4,{radiusY:7}),lift(432,142,87,'orbit',7,4.8,{radiusY:7})]}),
 r('tower','spire','SPIRAL MAINTENANCE',{width:320,height:360,spawn:{x:16,y:306},exitY:87,platforms:[p(0,335,153,25),p(94,251,186),p(40,169,162),p(134,87,186)],ladders:[ladder(116,251,335),ladder(149,169,251),ladder(165,87,169)],enemies:[e(271,87,'bellguard')],pickups:[{x:60,y:148,type:'heart'}],hint:'Three ladder flights wind around the spire. Release the direction to hold a rung.'}),
 r('tower','orbit','HOUR HAND CROSSING',{platforms:[p(0,151,122,29),p(253,137,111),p(497,136,66),p(594,151,46,29)],moving:[lift(151,141,75,'orbit',11,3.8,{radiusY:10}),lift(393,139,76,'orbit',12,4.7,{radiusY:9})],enemies:[e(310,137,'gearling')],hint:'The clock hands orbit slowly. Wait on each ledge before the next jump.'}),
 gate('tower','bridge','GREAT BELL TIMER','tower_bridge'),
 r('tower','finale','THE LAST CHIME',{width:800,platforms:[p(0,151,147,29),p(177,135,104),p(310,117,76),p(417,139,112),p(641,132,73),p(744,151,56,29)],moving:[lift(556,143,60,'orbit',8,4,{radiusY:8})],hazards:[fall('bell',236,135,.4),fall('bell',476,139,2)],enemies:[e(351,117,'gearling'),e(684,132,'bellguard')],hint:'Bells, gears, and moving hands meet here. The guardian waits beyond the next checkpoint.'}),
 approach('tower','RICOCHET APPROACH'),boss('tower','RICOCHET’S BELFRY'),

 r('sky','entry','SKY DIAL',{platforms:[p(0,151,154,29),p(183,137,99),p(313,151,136,29),p(479,134,76),p(585,151,55,29)],enemies:[e(113,151,'cloudcrab'),e(384,151,'stormorb')],hint:'Storm orbs fire a three-spark fan. Their bright cores always take damage.'}),
 r('sky','airships','AIRSHIP MOORINGS',{platforms:[p(0,151,111,29),p(248,137,112),p(496,139,66),p(591,151,49,29)],moving:[lift(140,148,80,'y',-18,4),lift(389,144,79,'y',-15,4.8)],enemies:[e(303,137,'cloudcrab')],hint:'Floating airship decks rise and fall. Watch for the high point before jumping.'}),
 gate('sky','beacons','AIRSHIP TIME BEACONS','sky_beacons',{unlockedPlatforms:[p(319,128,80)],unlockedMoving:[lift(207,143,80,'y',-12,4),lift(432,142,87,'y',-12,4.5)]}),
 r('sky','wind','EAST WIND BRIDGE',{wind:[{x:144,w:400,force:18}],platforms:[p(0,151,148,29),p(176,138,123),p(327,125,95),p(449,141,98),p(575,151,65,29)],enemies:[e(235,138,'cloudcrab'),e(493,141,'stormorb')],hint:'The wind pushes right while you are airborne. Feather your movement on the way down.'}),
 r('sky','mast','WEATHER MAST',{width:320,height:360,spawn:{x:16,y:306},exitY:87,platforms:[p(0,335,151,25),p(88,249,164),p(160,167,160),p(177,87,143)],ladders:[ladder(112,249,335),ladder(204,167,249),ladder(244,87,167)],enemies:[e(290,87,'stormorb')],pickups:[{x:273,y:65,type:'heart'}],hint:'Sheltered ladders ignore the wind. Climb to the weather station.'}),
 r('sky','clouds','THIN CLOUD CATWALK',{platforms:[p(0,151,114,29),p(143,136,74,8,{falling:true}),p(246,122,86),p(362,140,75,8,{falling:true}),p(465,132,77,8,{falling:true}),p(572,151,68,29)],enemies:[e(286,122,'cloudcrab')],hazards:[fall('spark',404,140,1.5)],hint:'Fragile clouds flash before they dissolve. The solid blue decks are resting places.'}),
 gate('sky','dials','NOON AND MIDNIGHT DIALS','sky_dials',{checkpoint:true}),
 r('sky','front','STORM FRONT',{platforms:[p(0,151,151,29),p(181,138,112),p(323,151,119,29),p(472,135,91),p(592,151,48,29)],hazards:[fall('spark',238,138,.1),fall('spark',393,151,1.8),fall('spark',522,135,3)],enemies:[e(104,151,'stormorb'),e(483,109,'skimmer')],hint:'Falling sparks announce their lane. Skimmers dive low, then circle back.'}),
 r('sky','west','WEST WIND TRANSFER',{wind:[{x:150,w:375,force:-14}],platforms:[p(0,151,119,29),p(150,139,98),p(277,151,94,29),p(399,136,110),p(538,151,102,29)],enemies:[e(327,151,'cloudcrab'),e(466,136,'stormorb')],hint:'The west wind pushes left during jumps. Hold right a little longer.'}),
 gate('sky','storm','OVERNIGHT FLIGHT CONTROL','sky_storm'),
 r('sky','finale','DAWN APPROACH',{width:800,platforms:[p(0,151,132,29),p(263,136,111),p(405,151,105,29),p(541,132,87),p(660,144,81),p(767,151,33,29)],moving:[lift(160,146,76,'y',-19,4)],hazards:[fall('spark',318,136,.6),fall('spark',590,132,2)],enemies:[e(457,151,'stormorb'),e(703,144,'cloudcrab')],hint:'The final airship rises toward dawn. Restore the sky and face Vesper Wing.'}),
 approach('sky','VESPER WING APPROACH'),boss('sky','VESPER’S SKY ARENA'),
];
