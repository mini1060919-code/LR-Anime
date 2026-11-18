import {describe,it,expect,vi,afterEach} from 'vitest';
import {createGameState,addBuilding,addSurvivor,removeBuilding} from '../src/sim/state.js';
import {BUILDING_DEFS as DEFS} from '../src/buildings/definitions.js';
import {initializeCharacters,reconcileCharacters} from '../src/characters/state.js';
import {assignJobs,assignWorker,unassignWorker,availableWorkerCount,idleCount,killBuildingWorkers,tickSurvivors} from '../src/sim/survivors.js';
import {assignResident,restoreAutomaticAssignment} from '../src/progression/assignments.js';
import {setResidentControl} from '../src/autonomy/control.js';
import {REST_RULES} from '../src/autonomy/rules.js';
import {tickNeeds} from '../src/needs/simulation.js';
import {tickEconomy} from '../src/sim/economy.js';
import {getModifiers} from '../src/sim/modifiers.js';
import {createCheckpoint,restoreSave,migrateSave,saveGame,importSave,exportSave,listBackups,saveSlot,loadSlot,SLOT_KEYS,SAVE_KEY} from '../src/persistence.js';
const RUN='run_12345678-1234-4234-8234-123456789abc';
function game(count=4){const s=createGameState();addBuilding(s,'hq',DEFS.hq,30,30);for(let i=0;i<count;i++)addSurvivor(s);initializeCharacters(s,RUN);return s;}
function build(s,id='farm',x=20,z=20){return addBuilding(s,id,DEFS[id],x,z);}
const r=(s,id=1)=>s.characters.records[id];
function autoPlace(s,id,b){s.survivors.find(x=>x.id===id).buildingId=b.id;b.workers.push(id);}
function advance(s,n){for(let i=0;i<n;i++)tickNeeds(s,1,s.characters.survival.lastStep+1,DEFS);}
function invariant(s){const seen=new Set();for(const b of s.buildings){expect(b.workers.length).toBeLessThanOrEqual(DEFS[b.defId].jobs);for(const id of b.workers){expect(seen.has(id)).toBe(false);seen.add(id);expect(s.survivors.find(x=>x.id===id)?.buildingId).toBe(b.id);}}for(const x of s.survivors)if(x.buildingId!==null)expect(s.buildings.find(b=>b.id===x.buildingId)?.workers).toContain(x.id);}
function storage(){const values=new Map();vi.stubGlobal('localStorage',{get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)});return values;}
afterEach(()=>vi.unstubAllGlobals());
describe('bounded rest lifecycle and hysteresis',()=>{
 it('releases an exhausted worker and fills the vacancy with one eligible resident',()=>{
  const s=game(),b=build(s);autoPlace(s,1,b);r(s).needs.fatigue=85;assignJobs(s,DEFS);
  expect(r(s).autonomy).toMatchObject({mode:'auto',resting:true,reason:'fatigue',cooldownUntil:10});expect(s.survivors[0].buildingId).toBeNull();expect(b.workers).not.toContain(1);invariant(s);
 });
 it('requires both the low fatigue threshold and the saved minimum rest time',()=>{
  const s=game(1),b=build(s);autoPlace(s,1,b);r(s).needs.fatigue=85;assignJobs(s,DEFS);r(s).needs.fatigue=35;advance(s,5);assignJobs(s,DEFS);expect(r(s).autonomy.resting).toBe(true);expect(r(s).autonomy.cooldownUntil).toBe(10);
  advance(s,5);assignJobs(s,DEFS);expect(r(s).autonomy.resting).toBe(false);expect(s.survivors[0].buildingId).toBe(b.id);invariant(s);
 });
 it('does not thrash around the upper threshold or reassign a stable job for small score changes',()=>{
  const s=game(1),b=build(s);assignJobs(s,DEFS);r(s).needs.fatigue=85;assignJobs(s,DEFS);const deadline=r(s).autonomy.cooldownUntil;
  for(const fatigue of [84.9,85.1,70,36]){r(s).needs.fatigue=fatigue;advance(s,1);assignJobs(s,DEFS);expect(r(s).autonomy.resting).toBe(true);expect(r(s).autonomy.cooldownUntil).toBe(deadline);}
  advance(s,10);r(s).needs.fatigue=35;assignJobs(s,DEFS);r(s).needs.fatigue=40;assignJobs(s,DEFS);expect(r(s).autonomy.resting).toBe(false);expect(b.workers).toEqual([1]);
 });
 it('low health lowers ranking without inventing compulsory illness or new deaths',()=>{
  const s=game(2),b=build(s,'garden');r(s,1).needs.health=0;r(s,1).professionId='farmer';r(s,1).abilityRanks.agriculture=5;assignJobs(s,DEFS);expect(b.workers).toEqual([2]);expect(s.survivors).toHaveLength(2);
  assignResident(s,2,null,DEFS);b.autoAssign=true;assignJobs(s,DEFS);expect(b.workers).toEqual([1]);expect(r(s,1).autonomy.resting).toBe(false);
 });
 it('preserves cooldown on restore and does not restart the rest timer on every evaluation',()=>{
  const s=game(1),b=build(s);autoPlace(s,1,b);r(s).needs.fatigue=90;assignJobs(s,DEFS);advance(s,5);
  const copy=restoreSave(createCheckpoint(s,42,[])).state;for(let i=0;i<10;i++)assignJobs(copy,DEFS);expect(r(copy).autonomy.cooldownUntil).toBe(10);expect(r(copy).autonomy.resting).toBe(true);
  r(copy).needs.fatigue=35;advance(copy,5);assignJobs(copy,DEFS);expect(r(copy).autonomy.resting).toBe(false);
 });
});
describe('player intent and all existing manual entry points',()=>{
 it('reserves a manual target while exhausted, then resumes it ahead of autonomous occupants',()=>{
  const s=game(2),b=build(s,'garden');r(s).needs.fatigue=90;expect(assignResident(s,1,b.id,DEFS).ok).toBe(true);
  expect(r(s).autonomy).toMatchObject({mode:'manual',targetBuildingId:b.id,resting:true});expect(b.workers).toEqual([]);
  b.autoAssign=true;assignJobs(s,DEFS);expect(b.workers).toEqual([2]);r(s).needs.fatigue=35;advance(s,10);assignJobs(s,DEFS);
  expect(b.workers).toEqual([1]);expect(s.survivors[1].buildingId).toBeNull();expect(r(s).autonomy.mode).toBe('manual');invariant(s);
 });
 it('never evicts another manual worker when a reserved manual target is full',()=>{
  const s=game(2),b=build(s,'garden');r(s).needs.fatigue=90;assignResident(s,1,b.id,DEFS);assignResident(s,2,b.id,DEFS);r(s).needs.fatigue=35;advance(s,10);assignJobs(s,DEFS);
  expect(b.workers).toEqual([2]);expect(r(s).autonomy).toMatchObject({mode:'manual',resting:false,targetBuildingId:b.id});expect(s.survivors[0].buildingId).toBeNull();
 });
 it('keeps manual idle intent until the player explicitly returns control',()=>{
  const s=game(1),b=build(s);assignResident(s,1,null,DEFS);assignJobs(s,DEFS);expect(b.workers).toEqual([]);
  expect(setResidentControl(s,1,'auto').ok).toBe(true);assignJobs(s,DEFS);expect(b.workers).toEqual([1]);
 });
 it('keeps healthy manual assignments stable despite profession scores and other vacancies',()=>{
  const s=game(),farm=build(s),lab=build(s,'lab',24,20);assignResident(s,1,lab.id,DEFS);for(let i=0;i<10;i++)assignJobs(s,DEFS);
  expect(s.survivors[0].buildingId).toBe(lab.id);expect(r(s).autonomy.targetBuildingId).toBe(lab.id);invariant(s);
 });
 it('failed manual requests preserve the complete rest state and old target',()=>{
  const s=game(2),b=build(s,'garden');assignResident(s,2,b.id,DEFS);r(s).needs.fatigue=90;assignJobs(s,DEFS);const before=structuredClone(s);
  expect(assignResident(s,1,b.id,DEFS).ok).toBe(false);expect(assignResident(s,1,999,DEFS).ok).toBe(false);expect(s).toEqual(before);
 });
 it('generic plus/minus commands preserve player intent and skip resting residents',()=>{
  const s=game(2),b=build(s);r(s).needs.fatigue=90;assignJobs(s,DEFS);expect(assignWorker(s,b.id,DEFS)).toBe(false); // only healthy resident already occupied
  expect(unassignWorker(s,b.id)).toBe(true);expect(r(s,2).autonomy.mode).toBe('manual');assignJobs(s,DEFS);expect(b.workers).toEqual([]);
  expect(assignWorker(s,b.id,DEFS)).toBe(true);expect(r(s,2).autonomy.targetBuildingId).toBe(b.id);invariant(s);
 });
 it('returning a building to automatic management clears its live and pending manual orders only',()=>{
  const s=game(3),b=build(s);r(s).needs.fatigue=90;assignResident(s,1,b.id,DEFS);assignResident(s,2,b.id,DEFS);assignResident(s,3,null,DEFS);
  expect(restoreAutomaticAssignment(s,b.id,DEFS).ok).toBe(true);expect(r(s,1).autonomy.mode).toBe('auto');expect(r(s,2).autonomy.mode).toBe('auto');expect(r(s,3).autonomy.mode).toBe('manual');invariant(s);
 });
 it('idempotent control commands do not erase a pending manual target',()=>{
  const s=game(1),b=build(s);r(s).needs.fatigue=90;assignResident(s,1,b.id,DEFS);const before=structuredClone(r(s).autonomy);
  expect(setResidentControl(s,1,'manual').ok).toBe(true);expect(r(s).autonomy).toEqual(before);
 });
 it.each(['invalid',null,0])('rejects unknown control mode %s without mutation',mode=>{
  const s=game(),before=structuredClone(s);expect(setResidentControl(s,1,mode).ok).toBe(false);expect(setResidentControl(s,999,'auto').ok).toBe(false);expect(s).toEqual(before);
 });
 it('releases pending targets when a building is demolished and never restores dead residents',()=>{
  const s=game(2),b=build(s);r(s).needs.fatigue=90;assignResident(s,1,b.id,DEFS);assignResident(s,2,b.id,DEFS);const uid=r(s,2).uid;
  killBuildingWorkers(s,b);removeBuilding(s,b.id);reconcileCharacters(s);assignJobs(s,DEFS);expect(r(s,1).autonomy).toMatchObject({mode:'auto',targetBuildingId:null});expect(r(s,2)).toBeUndefined();
  const loaded=restoreSave(createCheckpoint(s,42,[])).state;addSurvivor(loaded);reconcileCharacters(loaded);expect(r(loaded,3).uid).not.toBe(uid);
 });
});
describe('deterministic job priority, suitability and capacity',()=>{
 it('prioritizes a building flag before resource urgency',()=>{
  const s=game(1),farm=build(s),lab=build(s,'lab',24,20);s.resources.food=0;lab.priority=2;assignJobs(s,DEFS);expect(s.survivors[0].buildingId).toBe(lab.id);
 });
 it('uses base water/fuel shortage before the ordinary category at equal building priority',()=>{
  const s=game(1);build(s);const dist=build(s,'distillery',24,20);s.resources.food=100;s.resources.fuel=0;assignJobs(s,DEFS);expect(s.survivors[0].buildingId).toBe(dist.id);
 });
 it('considers profession and skill with stable ID tie breaks',()=>{
  const s=game(2),b=build(s,'garden');r(s,2).professionId='farmer';assignJobs(s,DEFS);expect(b.workers).toEqual([2]);
  const other=game(2),g=build(other,'garden');r(other,1).professionId='generalist';r(other,2).professionId='generalist';r(other,2).abilityRanks.agriculture=5;assignJobs(other,DEFS);expect(g.workers).toEqual([2]);
  const tie=game(2),t=build(tie,'garden');r(tie,1).professionId='generalist';r(tie,2).professionId='generalist';assignJobs(tie,DEFS);expect(t.workers).toEqual([1]);
 });
 it('prefers healthier candidates over a low-health expert',()=>{
  const s=game(2),b=build(s,'garden');r(s,1).needs.health=40;r(s,1).professionId='farmer';r(s,1).abilityRanks.agriculture=5;r(s,2).professionId='generalist';assignJobs(s,DEFS);expect(b.workers).toEqual([2]);
 });
 it('deduplicates stale cross-building references and respects every capacity',()=>{
  const s=game(),a=build(s,'garden'),b=build(s,'lab',24,20);autoPlace(s,1,a);a.workers.push(1,999);b.workers.push(1,2);s.survivors[1].buildingId=a.id;
  assignJobs(s,DEFS);invariant(s);expect(a.workers).toHaveLength(1);
 });
 it('does not reorder valid manual worker history or emit XP for repeated job evaluation',()=>{
  const s=game(2),b=build(s);assignResident(s,2,b.id,DEFS);assignResident(s,1,b.id,DEFS);const before=structuredClone(s.resources),xp=structuredClone(s.characters.progression);
  for(let i=0;i<20;i++)assignJobs(s,DEFS);expect(b.workers).toEqual([2,1]);expect(s.resources).toEqual(before);expect(s.characters.progression).toEqual(xp);
 });
 it('does not use wall time or RNG to decide jobs',()=>{
  const a=game(6),b=structuredClone(a);build(a);build(b);r(a).needs.fatigue=90;r(b).needs.fatigue=90;assignJobs(a,DEFS);assignJobs(b,DEFS);expect(a).toEqual(b);
 });
});
describe('safe v6 autonomy extension',()=>{
 function oldM5A(){const s=game(),b=build(s);assignResident(s,1,b.id,DEFS);const d=createCheckpoint(s,42,[]);d.requiredFeatures.pop();delete d.characters.autonomy;for(const r of Object.values(d.characters.records))delete r.autonomy;return d;}
 it('infers old manual work without changing any M5-A fields',()=>{
  const old=oldM5A(),copy=structuredClone(old),d=migrateSave(old);expect(old).toEqual(copy);expect(d.run).toEqual(old.run);expect(d.core).toEqual(old.core);expect(d.characters.records[1].autonomy).toMatchObject({mode:'manual',targetBuildingId:2});
  for(const [id,r] of Object.entries(d.characters.records)){const {autonomy,...original}=r;expect(original).toEqual(old.characters.records[id]);}expect(migrateSave(d)).toEqual(d);
 });
 it('preserves exact old v6 import bytes even when the upgraded payload already exists',()=>{
  const values=storage(),old=oldM5A(),current=JSON.stringify(migrateSave(old));values.set(SAVE_KEY,current);const raw=' '+JSON.stringify(old);expect(importSave(raw).ok).toBe(true);expect(listBackups().entries.some(b=>b.pinned&&b.raw===raw)).toBe(true);expect(values.get(SAVE_KEY)).toBe(current);
 });
 it('persists manual targets, rest cooldown and needs through three slots and JSON',()=>{
  storage();const s=game(1),b=build(s);r(s).needs.fatigue=90;assignResident(s,1,b.id,DEFS);advance(s,3);expect(saveGame(s,42,[]).ok).toBe(true);const old=exportSave().raw;
  for(const slot of SLOT_KEYS){expect(saveSlot(slot).ok).toBe(true);expect(loadSlot(slot).ok).toBe(true);expect(restoreSave(JSON.parse(exportSave().raw)).state.characters).toEqual(s.characters);}expect(JSON.parse(old).version).toBe(6);
 });
 it.each([
  d=>{d.characters.autonomy.schemaVersion=2;},d=>{delete d.characters.records[1].autonomy;},d=>{d.characters.records[1].autonomy.mode='ai';},d=>{d.characters.records[1].autonomy.resting='true';},d=>{d.characters.records[1].autonomy.cooldownUntil=-1;},d=>{d.characters.records[1].autonomy.cooldownUntil=1000;},d=>{d.characters.records[1].autonomy.reason='disease';},d=>{d.characters.records[1].autonomy.targetBuildingId=999;},d=>{d.characters.records[1].autonomy.mode='manual';d.characters.records[1].autonomy.targetBuildingId=1;},d=>{d.characters.records[1].autonomy.resting=true;d.characters.records[1].autonomy.reason='fatigue';},d=>{d.requiredFeatures.pop();},d=>{d.requiredFeatures.push('future');},d=>{d.requiredFeatures=5;},d=>{d.version=99;}
 ])('blocks corrupt/unknown autonomy and preserves raw originals',change=>{
  const values=storage(),s=game(),b=build(s);autoPlace(s,1,b);const d=createCheckpoint(s,42,[]);change(d);const raw=JSON.stringify(d);values.set(SAVE_KEY,raw);expect(importSave(raw).ok).toBe(false);expect(saveGame(game(),42,[]).ok).toBe(false);expect(exportSave().raw).toBe(raw);
 });
});
describe('long autonomous rest/work simulation',()=>{
 it('runs 200 cycle-equivalents with real repeated rest/resume, bounded resources and no duplicate jobs',()=>{
  const s=game(8);for(let i=0;i<3;i++)build(s,'farm',8+i*8,8);build(s,'clinic',8,16);for(let i=0;i<4;i++)build(s,'well',16+i*4,16);build(s,'house',8,24);
  s.resources.food=150;s.resources.water=100;assignJobs(s,DEFS);let rests=0,resumes=0;const flags=new Map(s.survivors.map(x=>[x.id,false]));
  for(let step=1;step<=30000;step++){
   if(step%2===0){assignJobs(s,DEFS);for(const x of s.survivors){const now=r(s,x.id).autonomy.resting;if(now!==flags.get(x.id)){if(now)rests++;else resumes++;flags.set(x.id,now);}}}
   const mods=getModifiers(s);tickEconomy(s,1,DEFS,mods);tickSurvivors(s,1,mods);tickNeeds(s,1,step,DEFS);
   if(step%150===0){s.day++;invariant(s);expect(s.survivors).toHaveLength(8);for(const [key,value] of Object.entries(s.resources)){expect(Number.isFinite(value)&&value>=0).toBe(true);expect(value).toBeLessThanOrEqual(s.caps[key]);}}
  }
  expect(rests).toBeGreaterThan(20);expect(resumes).toBeGreaterThan(20);expect(createCheckpoint(s,42,[]).version).toBe(6);expect(s.resources.food).toBeGreaterThan(0);expect(s.resources.water).toBeGreaterThan(0);
 },30000);
});

describe('legacy staffing controls with autonomous rest',()=>{
 it('configures Auto while a building is off without staffing it until enabled',()=>{
  const s=game(1),b=build(s);assignResident(s,1,b.id,DEFS);b.enabled=false;
  expect(restoreAutomaticAssignment(s,b.id,DEFS).ok).toBe(true);
  expect(b.autoAssign).toBe(true);expect(b.workers).toEqual([]);expect(r(s).autonomy.mode).toBe('auto');
  b.enabled=true;assignJobs(s,DEFS);expect(b.workers).toEqual([1]);
 });
 it('counts available manual workers separately from idle HQ defenders',()=>{
  const s=game(2),b=build(s);r(s,1).needs.fatigue=90;r(s,2).needs.fatigue=90;assignJobs(s,DEFS);
  expect(idleCount(s)).toBe(2);expect(availableWorkerCount(s)).toBe(0);expect(assignWorker(s,b.id,DEFS)).toBe(false);
  r(s,2).needs.fatigue=35;advance(s,10);assignJobs(s,DEFS);assignResident(s,2,null,DEFS);
  expect(availableWorkerCount(s)).toBe(1);expect(assignWorker(s,b.id,DEFS)).toBe(true);expect(b.workers).toEqual([2]);
 });
});
