import {BUILDING_DEFS} from '../buildings/definitions.js';
import {REST_RULES} from './rules.js';
export function upgradeAutonomy(characters,core){
 characters.autonomy ??= {schemaVersion:1};
 for(const [id,record] of Object.entries(characters.records))if(!record.autonomy){
  const resident=core.survivors.find(s=>String(s.id)===id),building=core.buildings.find(b=>b.id===resident?.buildingId);
  record.autonomy={mode:building?.autoAssign===false?'manual':'auto',targetBuildingId:building?.autoAssign===false?building.id:null,resting:false,reason:null,cooldownUntil:0};
 }
 return characters;
}
export function validateAutonomy(characters,survivors,exactKeys,check,buildings=[]){
 exactKeys(characters.autonomy,['schemaVersion'],'autonomy');check(characters.autonomy.schemaVersion===1,'Unsupported autonomy schema.');
 for(const s of survivors){const a=characters.records[s.id].autonomy;exactKeys(a,['mode','targetBuildingId','resting','reason','cooldownUntil'],'resident autonomy');
  check(['auto','manual'].includes(a.mode)&&typeof a.resting==='boolean'&&typeof a.cooldownUntil==='number'&&Number.isFinite(a.cooldownUntil)&&a.cooldownUntil>=0&&a.cooldownUntil<=characters.survival.elapsedSeconds+REST_RULES.minimumRestSeconds+1e-6,'Invalid autonomy state.');
  check(a.resting?(a.reason==='fatigue'&&s.buildingId==null):a.reason===null,'Inconsistent resting state.');
  check(a.mode==='auto'?a.targetBuildingId===null:(a.targetBuildingId===null||buildings.some(b=>b.id===a.targetBuildingId&&(BUILDING_DEFS[b.defId]?.jobs ?? 0)>0)), 'Invalid manual work target.');
  check(a.mode!=='manual'||s.buildingId==null||s.buildingId===a.targetBuildingId,'Manual target does not match current work.');
 }
}
