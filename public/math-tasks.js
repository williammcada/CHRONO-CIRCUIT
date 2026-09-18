import {moduleFor} from './math-modules.js';
export {secondsText} from './time-tasks.js';
export const expectedAnswer=p=>moduleFor(p).expectedAnswer(p);
export const answerCorrect=(p,a)=>moduleFor(p).answerCorrect(p,a);
export const answerLabel=(p,a)=>moduleFor(p).answerLabel(p,a);
export const taskHint=(p,a)=>moduleFor(p).taskHint(p,a);
export const taskScaffold=p=>moduleFor(p).taskScaffold(p);
export const taskEquation=p=>moduleFor(p).taskEquation(p);
// All response modes now use constructed answers.
export const taskChoices=()=>[];
