// Player intent is independent of building-level automatic management.
import {updateRestState} from './rules.js';
export function writeManualMode(state,id,manual){
 const r=state.characters?.records?.[id],s=state.survivors.find(s=>s.id===id);if(!r?.autonomy||!s)return;
 const a=r.autonomy;a.mode=manual?'manual':'auto';a.targetBuildingId=manual?s.buildingId:null;
 updateRestState(a,r.needs,state.characters.survival.elapsedSeconds);
 if(a.resting){for(const b of state.buildings)b.workers=b.workers.filter(worker=>worker!==id);s.buildingId=null;}
}
export function setResidentControl(state,id,mode){
 if(!['auto','manual'].includes(mode)||!state.characters?.autonomy||!state.survivors.some(s=>s.id===id)||!state.characters.records[id]?.autonomy)return {ok:false,error:'Resident control is unavailable.'};
 if(state.characters.records[id].autonomy.mode===mode)return {ok:true};
 writeManualMode(state,id,mode==='manual');return {ok:true};
}
