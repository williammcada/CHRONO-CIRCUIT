import {SUBTRACTION_TYPES,TYPE_LABELS,randomSource} from './practice-config.js';
export function parseWhole(value){const text=String(value??'').trim();if(!/^\d+$/.test(text))return null;const n=Number(text);return Number.isSafeInteger(n)?n:null;}
const amount=(n,one,many=one+'s')=>`${n} ${n===1?one:many}`;
const stories=[
 (m,s,d,missing)=>missing?`A box had some bolts. Tempo used ${amount(s,'bolt')}. There ${d===1?'is':'are'} ${amount(d,'bolt')} left. How many bolts were in the box at first?`:`A box held ${amount(m,'bolt')}. Tempo used some bolts. There ${d===1?'is':'are'} ${amount(d,'bolt')} left. How many bolts did Tempo use?`,
 (m,s,d,missing)=>missing?`After giving away ${amount(s,'sticker')}, Mia has ${amount(d,'sticker')} left. How many stickers did she have before giving any away?`:`Mia had ${amount(m,'sticker')}. She gave some away and kept ${amount(d,'sticker')}. How many stickers did she give away?`,
 (m,s,d,missing)=>missing?`A robot moved ${amount(s,'crate')} out of a store. Now ${amount(d,'crate')} remain. How many crates were in the store before the robot moved any?`:`A store held ${amount(m,'crate')}. A robot moved some out, leaving ${amount(d,'crate')}. How many crates did the robot move?`,
 (m,s,d,missing)=>missing?`Leo spent ${amount(s,'token')} at the fair and had ${amount(d,'token')} left. How many tokens did he have before he spent any?`:`Leo took ${amount(m,'token')} to the fair. After spending some, he had ${amount(d,'token')} left. How many tokens did he spend?`,
 (m,s,d,missing)=>missing?`Some birds were on a fence. ${amount(s,'bird')} flew away. ${amount(d,'bird')} stayed. How many birds were on the fence at first?`:`There were ${amount(m,'bird')} on a fence. Some flew away and ${amount(d,'bird')} stayed. How many birds flew away?`,
 (m,s,d,missing)=>missing?`Tempo took ${amount(s,'book')} from a shelf. The shelf still holds ${amount(d,'book')}. How many books were on the shelf before Tempo took any?`:`A shelf held ${amount(m,'book')}. Tempo took some books, leaving ${amount(d,'book')}. How many books did Tempo take?`,
];
const units=['bolts','stickers','crates','tokens','birds','books'];
export function makeSubtraction(typeId,seed,config,id){
 if(!SUBTRACTION_TYPES.includes(typeId)||![20,100,1000].includes(config?.maximum)||typeof config?.includeZero!=='boolean'||!Number.isSafeInteger(seed)||seed<0)throw Error('Invalid subtraction generator input');
 const random=randomSource(seed),pick=n=>Math.floor(random()*n),minimum=config.includeZero?0:1;
 // Positive triples dominate even when zero is enabled; one in eight may contain zero.
 const zero=config.includeZero&&pick(8)===0;
 const M=zero?pick(config.maximum+1):2+pick(config.maximum-1);
 const S=zero?(pick(2)?M:0):1+pick(M-1),D=M-S;
 const story=pick(stories.length),missing=typeId.startsWith('minuend'),word=typeId.endsWith('word');
 const equation=missing?`□ − ${S} = ${D}`:`${M} − □ = ${D}`;
 const context=word?stories[story](M,S,D,missing):`${equation}. What number belongs in the box?`;
 return {id,moduleId:'subtraction',typeId,generatorVersion:1,seed,config:{maximum:config.maximum,includeZero:config.includeZero},templateId:`subtraction:${typeId}:${word?story:'equation'}`,task:'subtraction',representation:word?'word':'equation',skill:TYPE_LABELS[typeId],context,prompt:context,domain:{M,S,D,unknown:missing?'minuend':'subtrahend'},answerNumber:missing?M:S,unit:word?units[story]:'',effect:'Question complete',minimum};
}
export const subtractionFingerprint=p=>JSON.stringify([p.typeId,p.domain.M,p.domain.S,p.domain.D]);
export function subtractionHint(p){return {error:`subtraction-${p.domain.unknown}`,text:p.domain.unknown==='minuend'?'Find the starting amount: add the amount taken away to the amount left.':'Find the amount taken away: subtract the amount left from the starting amount.'};}
export function subtractionMethod(p){const {M,S,D,unknown}=p.domain;return `${subtractionHint(p).text} ${unknown==='minuend'?`${D} + ${S} = ${M}`:`${M} − ${D} = ${S}`}. Check: ${M} − ${S} = ${D}.`;}
export function subtractionCheck(p,serial){
 // Regenerate the complete deterministic check sequence. Imports do not control exclusions.
 const capacity=p.config.maximum*(p.config.maximum-1)/2,seen=new Set([subtractionFingerprint(p)]);let next=p;
 for(let n=1;n<=serial;n++){
  const previous=subtractionFingerprint(next);
  if(seen.size>=capacity){seen.clear();seen.add(subtractionFingerprint(p));seen.add(previous);}
  for(let retry=0;retry<2048;retry++){
   next=makeSubtraction(p.typeId,(p.seed+n*7919+retry*37)>>>0,p.config,`${p.id}__check_${n}`);
   const fp=subtractionFingerprint(next);
   if(!seen.has(fp)){seen.add(fp);break;}
   if(retry===2047)throw Error('Could not generate a fresh check');
  }
 }
 return next;
}
