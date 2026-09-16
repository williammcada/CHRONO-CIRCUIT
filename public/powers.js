export const BRAKE_COST=2;
export const BRAKE_SECONDS=2.2;
export const POWERS={
 brake:{name:'BEAT BRAKE',short:'BRAKE',color:'#ffcc75',description:'Slows machines and enemies. Against Railox, it also strengthens blaster hits.'},
 lance:{name:'TRANSIT LANCE',short:'LANCE',color:'#f79b88',description:'A fast piercing shot. Ricochet is weak to it.'},
 disc:{name:'ECHO DISC',short:'DISC',color:'#c6a7f4',description:'A returning disc that can hit on its outward and return journeys. Vesper is weak to it.'},
 burst:{name:'UPDRAFT BURST',short:'BURST',color:'#8be4ea',description:'Three rising shots reach high targets. Floravel is weak to it; Pendula also takes extra damage.'},
 depth:{name:'DEPTH CHARGE',short:'DEPTH',color:'#ef9274',description:'Lob a charge that bounces once and bursts. Its blast reaches Facet through open firing lanes.'},
 roller:{name:'BRAMBLE ROLLER',short:'ROLLER',color:'#a9d477',description:'A spiked wheel rolls along floors and drops off edges. It catches Jolt Jester’s grounded springs.'},
 orbit:{name:'PRISM ORBIT',short:'ORBIT',color:'#d8c1ff',description:'Two close crystal shards circle Tempo briefly. They reach Pendula’s outer mechanism. Body contact still hurts.'},
 arc:{name:'ARC THREAD',short:'ARC',color:'#ffde64',description:'A short aimed electric shot chains once to a nearby visible target. Brinejaw is weak to it.'},
};
export const ownedPowers=save=>[...new Set([...(save.weapons||[]),...(save.powerUnlocked?['brake']:[])])].filter(k=>POWERS[k]);
export function cyclePower(save){const list=ownedPowers(save);if(!list.length)return null;save.equipped=list[(list.indexOf(save.equipped)+1)%list.length];return save.equipped;}
export function activateBrake(save,state){
 if(!ownedPowers(save).includes('brake')||save.energy<BRAKE_COST||state.brake>0)return false;
 save.energy-=BRAKE_COST;state.brake=BRAKE_SECONDS;state.powerCooldown=.35;return true;
}
let activationId=0;
export function activatePower(save,state){
 const kind=save.equipped||'brake';if(!POWERS[kind]||!ownedPowers(save).includes(kind)||save.energy<2||state.powerCooldown>0)return false;
 if(kind==='brake')return activateBrake(save,state);
 const active=state.bullets.filter(b=>b.kind===kind&&b.life>0);
 if((kind==='orbit'&&active.length)||(kind==='depth'||kind==='roller')&&active.length>=2)return false;
 save.energy-=2;state.powerCooldown=.35;
 const p=state.player,activation={id:++activationId,bossHits:0,hits:new Set()},base={x:p.x+p.w/2,y:p.y+18,life:1.8,age:0,damage:3,r:5,kind,pierce:true,hits:new Set(),vy:0,activation};
 if(kind==='lance')state.bullets.push({...base,vx:p.facing*290,life:1.6});
 if(kind==='disc')state.bullets.push({...base,vx:p.facing*160,damage:2,life:1.5});
 if(kind==='burst')for(const vy of [-45,-105,-165])state.bullets.push({...base,vx:p.facing*(vy===-45?155:110),vy,life:1.2,hits:new Set(),pierce:false,damage:2});
 if(kind==='depth')state.bullets.push({...base,vx:p.facing*150,vy:-130,gravity:720,life:.8,bounces:0,r:5});
 if(kind==='roller')state.bullets.push({...base,y:p.y+p.h-5,vx:p.facing*140,vy:0,gravity:720,life:1.5,r:6,damage:2});
 if(kind==='orbit')for(let shard=0;shard<2;shard++)state.bullets.push({...base,life:1.6,vx:0,vy:0,r:4,damage:2,shard,hits:new Set()});
 if(kind==='arc')state.bullets.push({...base,vx:p.facing*440,life:.25,r:3,pierce:false,originX:base.x,originY:base.y});
 return true;
}
export function refillEnergy(save,amount=2){save.energy=Math.min(8,save.energy+amount);}
