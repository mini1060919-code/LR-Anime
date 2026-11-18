import {writeManualMode} from '../autonomy/control.js';
// Player commands validate the current core roster; UI never edits workers.
import {assignJobs} from '../sim/survivors.js';
export function assignResident(state,residentId,buildingId,DEFS){
 const s=state.survivors.find(s=>s.id===residentId);if(!s)return {ok:false,error:'Resident is no longer alive.'};
 const old=state.buildings.find(b=>b.id===s.buildingId);
 if(buildingId!==null){
  const b=state.buildings.find(b=>b.id===buildingId),def=b&&DEFS[b.defId];
  if(!def || !(def.jobs>0) || b.hp<=0 || b.enabled===false)return {ok:false,error:'Building is unavailable.'};
  const other=new Set(b.workers.filter(id=>id!==s.id));
  if(other.size>=def.jobs)return {ok:false,error:'Building has no free job slots.'};
  // All checks before mutation: failure preserves the previous assignment.
  for(const source of state.buildings)source.workers=source.workers.filter(id=>id!==s.id);
  b.workers.push(s.id);b.autoAssign=false;s.buildingId=b.id;
 }else{
  for(const source of state.buildings)source.workers=source.workers.filter(id=>id!==s.id);
  s.buildingId=null;if(old)old.autoAssign=false;
 }
 writeManualMode(state,s.id,true);
 return {ok:true};
}
export function restoreAutomaticAssignment(state,buildingId,DEFS){
 const b=state.buildings.find(b=>b.id===buildingId);
 if(!b || b.hp<=0 || !(DEFS[b.defId]?.jobs>0))return {ok:false,error:'Building is unavailable.'};
 b.autoAssign=true;for(const s of state.survivors)if(s.buildingId===b.id||state.characters?.records?.[s.id]?.autonomy?.targetBuildingId===b.id)writeManualMode(state,s.id,false);assignJobs(state,DEFS);return {ok:true};
}
