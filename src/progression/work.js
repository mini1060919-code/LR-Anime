// Synchronous completion receipts. No polling rewards, wall clock, UI or RNG.
import {learningMultiplier,rankForExperience,THRESHOLDS} from './rules.js';
import {BUILDING_DEFS} from '../buildings/definitions.js';
import {SKILLS} from '../characters/catalog.js';
const issued=new WeakMap();
const rosters=new WeakMap();
const careProofs=new WeakMap();
export function registerCare(mods,building,baseHunger,baseThirst){careProofs.set(mods,{buildingId:building.id,baseHunger,baseThirst});}
export function careProof(mods){return mods&&careProofs.get(mods);}
export function participants(state,building,{militia=false,limit=Infinity}={}){
 if(!state.characters?.progression || !state.buildings.includes(building) || building.hp<=0 || building.enabled===false)return [];
 const previous=rosters.get(state);
 let roster=previous;
 if(!roster || roster.array!==state.survivors || roster.count!==state.survivors.length){roster={array:state.survivors,count:state.survivors.length,byId:new Map(state.survivors.map(s=>[s.id,s]))};rosters.set(state,roster);}
 const candidates=militia?state.survivors.filter(s=>s.buildingId===null):[...new Set(building.workers ?? [])].map(id=>roster.byId.get(id)).filter(s=>s?.buildingId===building.id);
 const capacity=militia?limit:Math.min(limit,BUILDING_DEFS[building.defId]?.jobs ?? candidates.length);
 return candidates.filter(s=>state.characters.records[s.id]?.uid===`${state.runId}:${s.id}`).sort((a,b)=>a.id-b.id).slice(0,capacity);
}
export function abilityMultiplier(state,building,skill,options){
 if(state?.characters?.progression?.effectsEnabled!==true)return 1;
 const members=participants(state,building,options);if(!members.length)return 1;
 const mean=members.reduce((sum,s)=>sum+state.characters.records[s.id].abilityRanks[skill],0)/members.length;
 return 1+Math.min(0.1,Math.max(0,mean)*0.02);
}
export function supportingBuilding(state,defId){
 return state.buildings.filter(b=>b.defId===defId&&participants(state,b).length>0).sort((a,b)=>a.id-b.id)[0] ?? null;
}
export function supportingGarage(state){
 return (state.resources.fuel ?? 0)>0?supportingBuilding(state,'garage'):null;
}
export function logisticsMultiplier(state){const b=supportingGarage(state);return b?1+(abilityMultiplier(state,b,'logistics')-1)/2:1;}
export function createWorkReceipt(state,building,skill,units,options){
 const p=state.characters?.progression;
 if(!p || !SKILLS.includes(skill) || !Number.isFinite(units) || units<=0 || p.sequence>=Number.MAX_SAFE_INTEGER)return null;
 const members=participants(state,building,options);if(!members.length)return null;
 const receipt=Object.freeze({sequence:p.sequence+1,skill,units});
 issued.set(receipt,{state,building,options,members:members.map(s=>({id:s.id,uid:state.characters.records[s.id].uid}))});
 return receipt;
}
export function settleWork(state,receipt){
 const proof=receipt&&issued.get(receipt);if(!proof || proof.state!==state)return false;
 issued.delete(receipt); // one use, including invalidated or stale receipts
 const p=state.characters.progression;if(receipt.sequence!==p.sequence+1)return false;
 p.sequence=receipt.sequence;
 const eligible=new Set(participants(state,proof.building,proof.options).map(s=>s.id));
 for(const member of proof.members){
  const r=state.characters.records[member.id];if(!eligible.has(member.id)||r?.uid!==member.uid)continue;
  const skill=receipt.skill;if(r.experience[skill]>=THRESHOLDS[5])continue;
  const raw=receipt.units*1000/proof.members.length*learningMultiplier(r,skill)+r.experienceRemainders[skill];
  const whole=Math.floor(raw+1e-9);
  r.experience[skill]=Math.min(THRESHOLDS[5],r.experience[skill]+whole);
  r.experienceRemainders[skill]=r.experience[skill]===THRESHOLDS[5]?0:Math.max(0,Math.min(0.999999999999,Math.round((raw-whole)*1e12)/1e12));
  r.abilityRanks[skill]=rankForExperience(r.experience[skill]);
 }
 return true;
}
export function completeWork(state,building,skill,units,options){return settleWork(state,createWorkReceipt(state,building,skill,units,options));}
export function setAbilityEffects(state,enabled){if(typeof enabled!=='boolean'||!state.characters?.progression)return false;state.characters.progression.effectsEnabled=enabled;return true;}
