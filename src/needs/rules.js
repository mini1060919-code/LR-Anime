// M5-A v1: bounded individual needs. No AI, illness, new deaths or RNG.
export const NEEDS_FEATURE='survival-needs-v1';
export const DAY_SECONDS=90;
export const DEFAULT_NEEDS=Object.freeze({fatigue:0,health:100,morale:70});
export const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,n));
const round=n=>Math.round(clamp(n)*1e6)/1e6;
const DUTY={scout:.95,guard:.95,logistician:.97,mechanic:.98,researcher:1.02};
const MORALE={optimistic:4,steadfast:2,cautious:-2,reserved:-1,empathetic:-1,patient:1,curious:1,pragmatic:0};
export function individualRules(record){
 return {workFatigue:clamp(DUTY[record.professionId] ?? 1,.95,1.05),moraleBias:clamp((record.personalityIds ?? []).reduce((n,id)=>n+(MORALE[id] ?? 0),0),-5,5)};
}
export function needsEfficiency(needs){
 if(!needs)return 1;
 const fatigue=1-.25*clamp((needs.fatigue-40)/60,0,1);
 const health=1-.5*clamp((70-needs.health)/70,0,1);
 const morale=1-.1*clamp((40-needs.morale)/40,0,1);
 return clamp(fatigue*health*morale,.4,1);
}
export function calculateNeeds(record,survivor,{working,dt,resources}){
 const n=record.needs,rules=individualRules(record),days=dt/DAY_SECONDS;
 const fatigue=clamp(n.fatigue+(working?18*rules.workFatigue:-30)*days);
 const harm=(survivor.hunger>=75?8:0)+((survivor.thirst ?? 0)>=75?12:0);
 const recovery=survivor.hunger<50&&(survivor.thirst ?? 0)<50?6:0;
 const health=clamp(n.health+(harm>0?-harm:recovery)*days);
 let target=70+(working?0:8)+rules.moraleBias;
 target+=(resources.food ?? 0)>=1&&survivor.hunger<50?5:(resources.food ?? 0)<1?-10:0;
 target+=(resources.water ?? 0)>=1&&(survivor.thirst ?? 0)<50?5:(resources.water ?? 0)<1?-15:0;
 if(survivor.hunger>=75)target-=15;if((survivor.thirst ?? 0)>=75)target-=20;
 if(health<40)target-=15;if(fatigue>=75)target-=10;
 target=clamp(target);const movement=12*days;
 const morale=n.morale+clamp(target-n.morale,-movement,movement);
 return {fatigue:round(fatigue),health:round(health),morale:round(morale)};
}
export function needsStatus(needs){return {
 fatigue:needs.fatigue>=75?'Exhausted':needs.fatigue>=40?'Tired':'Rested',
 health:needs.health<30?'Critical':needs.health<70?'Unwell':'Healthy',
 morale:needs.morale<30?'Low spirits':needs.morale<60?'Uneasy':'Stable',
};}
