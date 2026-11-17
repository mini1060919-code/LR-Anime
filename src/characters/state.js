// Identity and presentation records only. Never changes jobs, resources or AI.
import { ARCHETYPES, SKILLS, PROFESSIONS, PERSONALITIES } from './catalog.js';
import { sha256 } from './hash.js';
const rosterCache = new WeakMap();
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const check = (ok,message) => { if (!ok) throw new Error(message); };
export function exactKeys(value, keys, label) {
  check(object(value) && Object.keys(value).every(key=>keys.includes(key)) && keys.every(key=>Object.hasOwn(value,key)), `Invalid ${label} fields.`);
}
export function validRunId(id) { return typeof id === 'string' && /^run_(?:[a-f0-9]{64}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/.test(id); }
function generateRecord(runId, id, used) {
  const available = ARCHETYPES.filter(item=>!used.includes(item.id));
  const pick = available[Number.parseInt(sha256(`${runId}:${id}:generator1`).slice(0,8),16) % available.length];
  if (pick) used.push(pick.id);
  const genericIndex=Number.parseInt(sha256(`${runId}:${id}:generic1`).slice(0,8),16);
  const genericNames=[['星野葵','Aoi Hoshino'],['月見蓮','Ren Tsukimi'],['青川晴','Haru Aokawa'],['水原凪','Nagi Mizuhara']][genericIndex%4];
  return {
    uid:`${runId}:${id}`, archetypeId:pick?.id ?? 'chr_generic', archetypeRevision:1,
    nameSnapshot:pick ? {...pick.names} : {'zh-TW':`${genericNames[0]} #${id}`,en:`${genericNames[1]} #${id}`},
    customName:null, professionId:pick?.profession ?? PROFESSIONS[genericIndex%PROFESSIONS.length], personalityIds:pick ? [...pick.traits] : [PERSONALITIES[genericIndex%PERSONALITIES.length]],
    abilityRanks:Object.fromEntries(SKILLS.map(skill=>[skill,0])),
    portraitSetId:`pset.${pick?.id ?? 'chr_generic'}.standard.v001`,
  };
}
export function initializeCharacters(state, runId = `run_${crypto.randomUUID()}`) {
  check(validRunId(runId),'Invalid run identity.');
  check(!state.characters && !state.runId,'Character identity already initialized.');
  state.runId=runId;
  state.characters={schemaVersion:1,generatorVersion:1,contentPackId:'lr-original-cast',contentPackVersion:1,usedUniqueArchetypeIds:[],records:{}};
  return reconcileCharacters(state);
}
export function reconcileCharacters(state) {
  if (!state.characters) return initializeCharacters(state);
  check(validRunId(state.runId),'Invalid run identity.');
  const previous=rosterCache.get(state);
  if(previous?.array===state.survivors && previous.count===state.survivors.length && previous.next===state.nextSurvivorId)return state.characters;
  const alive = new Set(state.survivors.map(s=>String(s.id)));
  const records = state.characters.records;
  // Reconcile the actual roster, not bounded/drained toast events.
  for (const id of Object.keys(records)) if (!alive.has(id)) delete records[id];
  for (const survivor of [...state.survivors].sort((a,b)=>a.id-b.id)) {
    check(Number.isSafeInteger(survivor.id) && survivor.id>0,'Invalid survivor identity.');
    if (!Object.hasOwn(records,String(survivor.id))) records[survivor.id]=generateRecord(state.runId,survivor.id,state.characters.usedUniqueArchetypeIds);
  }
  rosterCache.set(state,{array:state.survivors,count:state.survivors.length,next:state.nextSurvivorId});
  return state.characters;
}
export function validateCharacters(run, characters, survivors) {
  exactKeys(run,['id','nextSurvivorId'],'run');
  check(validRunId(run.id),'Invalid run identity.');
  check(Number.isSafeInteger(run.nextSurvivorId) && run.nextSurvivorId>Math.max(0,...survivors.map(s=>s.id)) && run.nextSurvivorId<=Number.MAX_SAFE_INTEGER,'Invalid survivor high-water mark.');
  exactKeys(characters,['schemaVersion','generatorVersion','contentPackId','contentPackVersion','usedUniqueArchetypeIds','records'],'characters');
  check(characters.schemaVersion===1 && characters.generatorVersion===1,'Unsupported character schema/generator.');
  check(typeof characters.contentPackId==='string' && /^[a-z0-9-]{1,64}$/.test(characters.contentPackId) && Number.isSafeInteger(characters.contentPackVersion) && characters.contentPackVersion>0,'Invalid character content pack.');
  check(Array.isArray(characters.usedUniqueArchetypeIds) && characters.usedUniqueArchetypeIds.length<=128 && new Set(characters.usedUniqueArchetypeIds).size===characters.usedUniqueArchetypeIds.length && characters.usedUniqueArchetypeIds.every(id=>typeof id==='string' && /^chr_[a-z0-9_]{1,64}$/.test(id)), 'Invalid reserved archetypes.');
  const ids=survivors.map(s=>String(s.id));
  check(object(characters.records) && Object.keys(characters.records).length===ids.length && ids.every(id=>Object.hasOwn(characters.records,id)), 'Character roster does not match survivors.');
  const usedLive=new Set();
  for (const id of ids) {
    const record=characters.records[id];
    exactKeys(record,['uid','archetypeId','archetypeRevision','nameSnapshot','customName','professionId','personalityIds','abilityRanks','portraitSetId'],'character record');
    check(record.uid===`${run.id}:${id}`,'Character UID mismatch.');
    check(typeof record.archetypeId==='string' && /^chr_[a-z0-9_]{1,64}$/.test(record.archetypeId) && Number.isSafeInteger(record.archetypeRevision) && record.archetypeRevision>0,'Invalid character archetype.');
    exactKeys(record.nameSnapshot,['zh-TW','en'],'name snapshot');
    const validName=name=>typeof name==='string' && name.normalize('NFC')===name && name.trim().length>0 && Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(name)).length<=32 && !/[\p{Cc}\p{Cf}]/u.test(name);
    check(Object.values(record.nameSnapshot).every(validName) && (record.customName===null || validName(record.customName)), 'Invalid character name.');
    check(PROFESSIONS.includes(record.professionId),'Unknown character profession.');
    check(Array.isArray(record.personalityIds) && record.personalityIds.length<=2 && new Set(record.personalityIds).size===record.personalityIds.length && record.personalityIds.every(id=>PERSONALITIES.includes(id)),'Invalid character personality.');
    exactKeys(record.abilityRanks,SKILLS,'abilities');
    check(Object.values(record.abilityRanks).every(n=>Number.isInteger(n)&&n>=0&&n<=5),'Invalid ability rank.');
    check(typeof record.portraitSetId==='string' && /^pset\.[a-z0-9_.-]{1,120}$/.test(record.portraitSetId),'Invalid appearance ID.');
    if (ARCHETYPES.some(item=>item.id===record.archetypeId)) {
      check(!usedLive.has(record.archetypeId) && characters.usedUniqueArchetypeIds.includes(record.archetypeId),'Duplicate/unreserved unique character.');
      usedLive.add(record.archetypeId);
    }
  }
  return characters;
}
