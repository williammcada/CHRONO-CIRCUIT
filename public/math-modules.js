import * as time from './time-tasks.js';
import {boundaryFlags,timeWords,addMinutes} from './time-engine.js';
import {makeSubtraction,parseWhole,subtractionHint,subtractionMethod,subtractionCheck,subtractionFingerprint} from './subtraction.js';
export const MATH_MODULES={
 time:{id:'time',label:'Time',...time,boundary:boundaryFlags,prompt:p=>p.task==='words'?`Enter the clock time for ${timeWords(addMinutes(p.start,p.duration))}${addMinutes(p.start,p.duration).minuteOfDay<720?' in the morning':' in the afternoon or evening'}.`:p.context},
 subtraction:{id:'subtraction',label:'Subtraction',generate:makeSubtraction,parse:parseWhole,expectedAnswer:p=>p.answerNumber,answerCorrect:(p,a)=>Number.isSafeInteger(a)&&a===p.answerNumber,answerLabel:(p,a)=>`${a}${p.unit?' '+p.unit:''}`,taskHint:subtractionHint,taskScaffold:p=>subtractionHint(p).text,taskEquation:p=>p.context,taskChoices:()=>[],method:subtractionMethod,check:subtractionCheck,fingerprint:subtractionFingerprint,boundary:()=>[],prompt:p=>p.context,narrate:p=>p.context.replace('□','blank').replace('−','minus').replace('=','equals')},
};
export const moduleFor=p=>MATH_MODULES[p.moduleId||'time'];
