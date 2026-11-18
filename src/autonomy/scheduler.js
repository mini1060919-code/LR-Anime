// Bounded deterministic scheduler; no movement, social AI, deaths or economy writes.
import {updateRestState,compareBuildings,compareResidents} from './rules.js';
export function runAutonomy(state,DEFS){
 if(!state.characters?.autonomy)return false;
 const records=state.characters.records,now=state.characters.survival.elapsedSeconds;
 const buildings=new Map(state.buildings.map(b=>[b.id,b]));
 const valid=b=>b&&b.hp>0&&b.enabled!==false&&(DEFS[b.defId]?.jobs ?? 0)>0;
 const original=new Map(state.buildings.map(b=>[b.id,new Set(b.workers)]));
 // Rebuild reciprocal membership once, preserving manual orders first.
 for(const b of state.buildings)b.workers=[];
 const ordered=[...state.survivors].sort((a,b)=>Number(records[b.id]?.autonomy?.mode==='manual')-Number(records[a.id]?.autonomy?.mode==='manual')||a.id-b.id);
 for(const s of ordered){const a=records[s.id]?.autonomy,b=buildings.get(s.buildingId);
  if(!a){s.buildingId=null;continue;}
  updateRestState(a,records[s.id].needs,now);
  if(!a.resting&&valid(b)&&original.get(b.id).has(s.id)&&b.workers.length<DEFS[b.defId].jobs){b.workers.push(s.id);}else{s.buildingId=null;}
 }
 for(const b of state.buildings){const rank=new Map([...original.get(b.id)].map((id,i)=>[id,i]));b.workers.sort((a,c)=>rank.get(a)-rank.get(c));}
 // Resume reserved manual jobs before offering vacancies to autonomous candidates.
 for(const s of [...state.survivors].sort((a,b)=>a.id-b.id)){
  const a=records[s.id]?.autonomy,b=buildings.get(a?.targetBuildingId);
  if(a?.mode!=='manual'||a.resting||s.buildingId!==null||!valid(b))continue;
  if(b.workers.length>=DEFS[b.defId].jobs){
   const candidates=b.workers.map(id=>state.survivors.find(s=>s.id===id)).filter(s=>records[s.id]?.autonomy?.mode==='auto').sort((x,y)=>compareResidents(state,b,DEFS[b.defId],y,x));
   const displaced=candidates[0];if(displaced){b.workers=b.workers.filter(id=>id!==displaced.id);displaced.buildingId=null;}
  }
  if(b.workers.length<DEFS[b.defId].jobs){s.buildingId=b.id;b.workers.push(s.id);}
 }
 const idle=state.survivors.filter(s=>s.buildingId===null&&records[s.id]?.autonomy?.mode==='auto'&&!records[s.id].autonomy.resting);
 const open=state.buildings.filter(b=>valid(b)&&b.autoAssign!==false&&b.workers.length<DEFS[b.defId].jobs).sort((a,b)=>compareBuildings(state,DEFS,a,b));
 for(const b of open){idle.sort((a,c)=>compareResidents(state,b,DEFS[b.defId],a,c));while(b.workers.length<DEFS[b.defId].jobs&&idle.length){const s=idle.shift();s.buildingId=b.id;b.workers.push(s.id);}}
 return true;
}
