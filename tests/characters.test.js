import { describe,it,expect,vi,afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { sha256,canonicalJSON } from '../src/characters/hash.js';
import { initializeCharacters,reconcileCharacters,validateCharacters } from '../src/characters/state.js';
import { ARCHETYPES,SKILLS } from '../src/characters/catalog.js';
import { createGameState,addBuilding,addSurvivor } from '../src/sim/state.js';
import { BUILDING_DEFS } from '../src/buildings/definitions.js';
import { assignJobs,tryRecruit,tickSurvivors,killBuildingWorkers } from '../src/sim/survivors.js';
import { tickEconomy } from '../src/sim/economy.js';
import { createCheckpoint,createSaveData,migrateSave,restoreSave,decodeSave,saveGame,inspectSave,exportSave,exportLegacyCopy,SAVE_KEY } from '../src/persistence.js';
const RUN='run_12345678-1234-4234-8234-123456789abc';
function game(count=4) {
 const state=createGameState();addBuilding(state,'hq',BUILDING_DEFS.hq,30,30);
 addBuilding(state,'farm',BUILDING_DEFS.farm,20,20);
 for(let i=0;i<count;i++)addSurvivor(state);
 return state;
}
const v5=core=>({format:'last-refuge',version:5,checkpoint:'dawn',savedAt:'2026-11-17T00:00:00Z',payload:core});
afterEach(()=>vi.unstubAllGlobals());
describe('stable identity and roster lifecycle',()=>{
 it.each(['','abc','繁體中文角色','x'.repeat(1000)])('matches native SHA-256 for %j',text=>{
  expect(sha256(text)).toBe(createHash('sha256').update(text).digest('hex'));
 });
 it.each([55,56,63,64,65,120000])('matches native SHA-256 for binary buffer length %i',length=>{
  const bytes=Uint8Array.from({length},(_,i)=>i%256);
  expect(sha256(bytes)).toBe(createHash('sha256').update(bytes).digest('hex'));
 });
 it('canonicalizes object keys while preserving semantic array order',()=>{
  expect(canonicalJSON({b:2,a:[2,1]})).toBe(canonicalJSON({a:[2,1],b:2}));
  expect(canonicalJSON({a:[2,1]})).not.toBe(canonicalJSON({a:[1,2]}));
 });
 it('creates one fixed identity per resident without changing legacy state',()=>{
  const state=game();const core=createSaveData(state,42,[]);
  initializeCharacters(state,RUN);
  expect(createSaveData(state,42,[])).toEqual(core);
  expect(new Set(Object.values(state.characters.records).map(r=>r.uid)).size).toBe(4);
  expect(new Set(Object.values(state.characters.records).map(r=>r.archetypeId)).size).toBe(4);
  for(const record of Object.values(state.characters.records))expect(Object.values(record.abilityRanks)).toEqual(SKILLS.map(()=>0));
 });
 it('uses different namespaces for fresh games with the same map seed',()=>{
  const a=game(1),b=game(1);initializeCharacters(a);initializeCharacters(b);
  expect(a.runId).not.toBe(b.runId);
  expect(a.characters.records[1].uid).not.toBe(b.characters.records[1].uid);
 });
 it('reconciles deaths and recruitment before dawn serialization without reusing stories',()=>{
  const state=game();initializeCharacters(state,RUN);
  const original={...state.characters.records[4]};
  state.survivors=state.survivors.filter(s=>s.id!==4);
  reconcileCharacters(state);
  expect(state.characters.records[4]).toBeUndefined();
  addSurvivor(state);
  const saved=createCheckpoint(state,42,[]);
  expect(saved.characters.records[5].archetypeId).toBe('chr_generic');
  expect(saved.characters.records[5].uid).not.toBe(original.uid);
  expect(saved.characters.records[5].personalityIds.length).toBe(1);
  expect(saved.characters.usedUniqueArchetypeIds).toContain(original.archetypeId);
 });
 it('preserves high-water identity after the highest resident dies and the save reloads',()=>{
  const state=game();initializeCharacters(state,RUN);
  state.survivors=state.survivors.filter(s=>s.id!==4);
  const restored=restoreSave(createCheckpoint(state,42,[])).state;
  expect(restored.nextSurvivorId).toBe(5);
  expect(addSurvivor(restored).id).toBe(5);
  expect(createCheckpoint(restored,42,[]).characters.records[5].uid).toBe(`${RUN}:5`);
 });
 it('does not consume simulation or cosmetic RNG',()=>{
  const random=vi.spyOn(Math,'random');const state=game();initializeCharacters(state,RUN);reconcileCharacters(state);
  expect(random).not.toHaveBeenCalled();random.mockRestore();
 });
 it('leaves jobs, economy, survival and recruitment equivalent with ranks even at five',()=>{
  const original=game(),decorated=structuredClone(original);initializeCharacters(decorated,RUN);
  for(const record of Object.values(decorated.characters.records))for(const skill of SKILLS)record.abilityRanks[skill]=5;
  for(let i=0;i<100;i++)for(const state of [original,decorated]){
   assignJobs(state,BUILDING_DEFS);tickEconomy(state,0.1,BUILDING_DEFS);tickSurvivors(state,0.1);
  }
  expect(createSaveData(decorated,42,[])).toEqual(createSaveData(original,42,[]));
  expect(tryRecruit(decorated,BUILDING_DEFS,2).length).toBe(tryRecruit(original,BUILDING_DEFS,2).length);
  killBuildingWorkers(decorated,decorated.buildings[1]);killBuildingWorkers(original,original.buildings[1]);
  reconcileCharacters(decorated);
  expect(createSaveData(decorated,42,[])).toEqual(createSaveData(original,42,[]));
 });
 it('guards ID overflow without changing normal recruitment gates',()=>{
  const state=game(1);state.nextSurvivorId=Number.MAX_SAFE_INTEGER;
  expect(()=>addSurvivor(state)).toThrow('allocator exhausted');
  expect(tryRecruit(state,BUILDING_DEFS)).toEqual([]);
 });
});
describe('v6 complete save contract and safe legacy migration',()=>{
 it('migrates v4 and v5 deterministically and without modifying input',()=>{
  const core=createSaveData(game(),42,[]);const before=structuredClone(core);
  const four=migrateSave(core),five=migrateSave(v5(core));
  expect(core).toEqual(before);expect(four.core).toEqual(core);
  expect(four.run).toEqual(five.run);expect(four.characters).toEqual(five.characters);
  const reordered=Object.fromEntries(Object.entries(core).reverse());
  expect(migrateSave(reordered).run).toEqual(four.run);
  expect(four.run.id).toMatch(/^run_[a-f0-9]{64}$/);
 });
 it('round trips names, personality, occupation and appearance including missing art',()=>{
  const state=game();initializeCharacters(state,RUN);
  const profile=state.characters.records[1];profile.customName='原創名字';profile.portraitSetId='pset.missing.standard.v001';
  const saved=createCheckpoint(state,42,[]);
  const restored=restoreSave(decodeSave(JSON.stringify(saved))).state;
  expect(restored.characters).toEqual(state.characters);expect(restored.runId).toBe(RUN);
  expect(createCheckpoint(restored,42,[]).characters).toEqual(saved.characters);
 });
 it('keeps native zero population empty while protecting ambiguous legacy zero rosters',()=>{
  const state=game(0);initializeCharacters(state,RUN);
  expect(restoreSave(createCheckpoint(state,42,[])).state.survivors).toHaveLength(0);
  expect(()=>migrateSave(createSaveData(state,42,[]))).toThrow('explicit recovery');
  const core=createSaveData(game(),42,[]);delete core.survivors;
  expect(()=>migrateSave(v5(core))).toThrow('explicit recovery');
 });
 const corruptions=[
  data=>{data.version=99;}, data=>{data.future='unknown';}, data=>{data.requiredFeatures=['skills-enabled'];},
  data=>{data.characters.generatorVersion=2;}, data=>{data.characters.schemaVersion=2;},
  data=>{data.run.nextSurvivorId=1;}, data=>{data.run.id='bad';},
  data=>{delete data.characters.records[1];}, data=>{data.characters.records[1].uid=`${RUN}:2`;},
  data=>{data.characters.records[1].abilityRanks.medicine=Infinity;},
  data=>{data.characters.records[1].abilityRanks.defense=6;},
  data=>{data.characters.records[1].portraitSetId='https://untrusted/image.png';},
  data=>{data.characters.records[1].customName='\u0000';},
  data=>{data.characters.records[1].futureAbility=20;},
  data=>{data.characters.records[2].archetypeId=data.characters.records[1].archetypeId;},
 ];
 it.each(corruptions.map((change,index)=>[index,change]))('rejects invalid/unknown candidate %s without replacing raw bytes',(_,change)=>{
  const state=game();initializeCharacters(state,RUN);const data=createCheckpoint(state,42,[]);change(data);
  const raw=JSON.stringify(data);let value=raw;
  const setItem=vi.fn((_,next)=>{value=next;});
  vi.stubGlobal('localStorage',{getItem:()=>value,setItem});
  expect(inspectSave().ok).toBe(false);
  expect(saveGame(state,42,[]).ok).toBe(false);
  expect(value).toBe(raw);expect(setItem).not.toHaveBeenCalled();expect(exportSave().raw).toBe(raw);
 });
 it('exports a valid v5 copy without replacing or stripping the authoritative v6 data',()=>{
  const state=game();initializeCharacters(state,RUN);const data=createCheckpoint(state,42,[]);const raw=JSON.stringify(data);
  const storage={getItem:()=>raw,setItem:vi.fn()};vi.stubGlobal('localStorage',storage);
  const copy=exportLegacyCopy();expect(copy.ok).toBe(true);expect(copy.warning).toContain('omits M3');
  const old=JSON.parse(copy.raw);expect(old.version).toBe(5);expect(old.payload).toEqual(data.core);
  expect(migrateSave(old).core).toEqual(data.core);expect(storage.setItem).not.toHaveBeenCalled();
  expect(exportSave().raw).toBe(raw);
 });
 it('backs up the exact JSON v5 import source permanently, not only the previous active save',()=>{
  const data=v5(createSaveData(game(),42,[]));const raw=' '+JSON.stringify(data);const values=new Map();
  vi.stubGlobal('localStorage',{get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))});
  // Import is tested independently from boot, so even an initially empty origin retains the source.
  return import('../src/persistence.js').then(({importSave,listBackups})=>{
   expect(importSave(raw).ok).toBe(true);expect(JSON.parse(values.get(SAVE_KEY)).version).toBe(6);
   expect(listBackups().entries.some(entry=>entry.pinned && entry.raw===raw)).toBe(true);
  });
 });
 it('requires the exact appearance metadata schema and finite rank values before serialization',()=>{
  const state=game();initializeCharacters(state,RUN);state.characters.records[1].abilityRanks.medicine=NaN;
  expect(()=>createCheckpoint(state,42,[])).toThrow('ability');
 });
 it('rejects unknown legacy fields instead of silently erasing future data',()=>{
  const core=createSaveData(game(),42,[]);core.newCharacterExtension={name:'retain'};
  expect(()=>migrateSave(core)).toThrow('Unknown core');
 });
});
