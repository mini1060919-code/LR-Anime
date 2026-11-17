import {buildingSkill,PROFESSION_SKILL} from '../progression/rules.js';
export const AUTONOMY_FEATURE='autonomy-v1';
export const REST_RULES=Object.freeze({fatigueEnter:85,fatigueExit:35,healthPriority:50,minimumRestSeconds:10});
export function workCategory(def){if(def.produces?.food)return 0;if(def.produces?.water)return 1;if(def.extracts)return 2;if(def.researchRate>0)return 3;return 4;}
export function urgency(state,def){
 if(def.produces?.food&&(state.resources.food ?? 0)<30)return 3;
 if(def.produces?.water&&(state.resources.water ?? 0)<20)return 3;
 if(def.produces?.energy&&(state.resources.energy ?? 0)<5)return 2;
 if(def.produces?.fuel&&(state.resources.fuel ?? 0)<5)return 2;
 return 0;
}
export function compareBuildings(state,DEFS,a,b){return (b.priority ?? 1)-(a.priority ?? 1)||urgency(state,DEFS[b.defId])-urgency(state,DEFS[a.defId])||workCategory(DEFS[a.defId])-workCategory(DEFS[b.defId])||a.id-b.id;}
export function compareResidents(state,building,def,a,b){
 const ra=state.characters.records[a.id],rb=state.characters.records[b.id],skill=buildingSkill(building.defId,def);
 const tier=r=>r.needs.health<REST_RULES.healthPriority?1:0;
 const score=r=>(PROFESSION_SKILL[r.professionId]===skill?20:0)+(r.abilityRanks[skill] ?? 0)*5;
 return tier(ra)-tier(rb)||score(rb)-score(ra)||ra.needs.fatigue-rb.needs.fatigue||a.id-b.id;
}

export function updateRestState(a,needs,now){
 if(!a.resting&&needs.fatigue>=REST_RULES.fatigueEnter)Object.assign(a,{resting:true,reason:'fatigue',cooldownUntil:Math.round((now+REST_RULES.minimumRestSeconds)*1e6)/1e6});
 else if(a.resting&&now>=a.cooldownUntil&&needs.fatigue<=REST_RULES.fatigueExit)Object.assign(a,{resting:false,reason:null,cooldownUntil:Math.round((now+REST_RULES.minimumRestSeconds)*1e6)/1e6});
}
