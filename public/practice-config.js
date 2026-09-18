export const SUBTRACTION_TYPES=['minuend-equation','subtrahend-equation','minuend-word','subtrahend-word'];
export const TYPE_LABELS={
 'minuend-equation':'Missing starting number — equation',
 'subtrahend-equation':'Missing amount taken away — equation',
 'minuend-word':'Missing starting number — word problem',
 'subtrahend-word':'Missing amount taken away — word problem',
};
export const defaultPractice=()=>({subjects:['time'],subtraction:{types:[...SUBTRACTION_TYPES],maximum:100,includeZero:false}});
export function validatePractice(c){
 if(!c||!Array.isArray(c.subjects)||!c.subjects.length||c.subjects.length>2||new Set(c.subjects).size!==c.subjects.length||c.subjects.some(s=>!['time','subtraction'].includes(s)))return 'Choose Time, Subtraction, or both.';
 const s=c.subtraction;
 if(!s||!Array.isArray(s.types)||s.types.length>4||new Set(s.types).size!==s.types.length||s.types.some(t=>!SUBTRACTION_TYPES.includes(t))||(c.subjects.includes('subtraction')&&!s.types.length))return 'Choose at least one subtraction question type.';
 if(![20,100,1000].includes(s.maximum)||typeof s.includeZero!=='boolean')return 'Choose a number range: 20, 100, or 1,000.';
 return '';
}
export function copyPractice(c){const p=c??defaultPractice();if(validatePractice(p))throw Error(validatePractice(p));return {subjects:['time','subtraction'].filter(s=>p.subjects.includes(s)),subtraction:{types:SUBTRACTION_TYPES.filter(t=>p.subtraction.types.includes(t)),maximum:p.subtraction.maximum,includeZero:p.subtraction.includeZero}};}
export function practiceSummary(c){c=copyPractice(c);return c.subjects.map(s=>s==='time'?'Time':`Subtraction · within ${c.subtraction.maximum.toLocaleString('en-US')} · ${c.subtraction.types.length} type${c.subtraction.types.length===1?'':'s'}${c.subtraction.includeZero?' · including zero':''}`).join(' + ');}
export const hashSeed=value=>[...String(value)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
export function randomSource(seed){let n=hashSeed(seed);return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function shuffledBag(values,count,seed){const random=randomSource(seed),result=[];while(result.length<count){const bag=[...values];if(!bag.length)throw Error('Empty practice selection');for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}result.push(...bag);}return result.slice(0,count);}
export const newRunSeed=()=>globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]:hashSeed(`${Date.now()}:${Math.random()}`);
