import {calculateNeeds} from './rules.js';
const combatActivity=new WeakMap();
export function markDefenseActivity(state,id){let active=combatActivity.get(state);if(!active){active=new Set();combatActivity.set(state,active);}active.add(id);}
export function onDuty(state,resident,DEFS){
 const b=state.buildings.find(b=>b.id===resident.buildingId);
 return !!(b&&b.hp>0&&b.enabled!==false&&b.powered!==false&&DEFS[b.defId]?.jobs>0&&b.workers.includes(resident.id));
}
// The application supplies one strictly increasing simulation-step token. No wall time.
export function tickNeeds(state,dt,step,DEFS){
 const meta=state.characters?.survival;
 if(!meta||!Number.isFinite(dt)||dt<=0||dt>1||!Number.isSafeInteger(step)||step<=meta.lastStep)return false;
 const fighting=combatActivity.get(state) ?? new Set();
 for(const resident of state.survivors){
  const record=state.characters.records[resident.id];if(!record)continue;
  record.needs=calculateNeeds(record,resident,{working:onDuty(state,resident,DEFS)||fighting.has(resident.id),dt,resources:state.resources});
 }
 meta.lastStep=step;meta.elapsedSeconds=Math.round((meta.elapsedSeconds+dt)*1e9)/1e9;
 combatActivity.delete(state);return true;
}
export function setNeedsEffects(state,enabled){if(typeof enabled!=='boolean'||!state.characters?.survival)return false;state.characters.survival.effectsEnabled=enabled;return true;}
