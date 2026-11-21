import {describe,it,expect,vi,afterEach} from 'vitest';
import {DEFAULT_NEEDS,needsEfficiency,calculateNeeds,individualRules,needsStatus,NEEDS_FEATURE} from '../src/needs/rules.js';
import {tickNeeds,markDefenseActivity,setNeedsEffects} from '../src/needs/simulation.js';
import {createGameState,addBuilding,addSurvivor} from '../src/sim/state.js';
import {initializeCharacters,reconcileCharacters} from '../src/characters/state.js';
import {BUILDING_DEFS as DEFS} from '../src/buildings/definitions.js';
import {PROFESSIONS,PERSONALITIES} from '../src/characters/catalog.js';
import {assignResident} from '../src/progression/assignments.js';
import {crewEfficiency} from '../src/progression/work.js';
import {tickEconomy,computeResourceBalance} from '../src/sim/economy.js';
import {tickSurvivors,killBuildingWorkers} from '../src/sim/survivors.js';
import {tickResearch} from '../src/sim/research.js';
import {tickExtraction} from '../src/sim/extraction.js';
import {getModifiers} from '../src/sim/modifiers.js';
import {createGrid} from '../src/world/grid.js';
import {createCheckpoint,createSaveData,migrateSave,restoreSave,decodeSave,saveGame,importSave,exportSave,listBackups,SAVE_KEY,saveSlot,loadSlot,SLOT_KEYS} from '../src/persistence.js';
const RUN='run_12345678-1234-4234-8234-123456789abc';
function game(n=4){const s=createGameState();addBuilding(s,'hq',DEFS.hq,30,30);for(let i=0;i<n;i++)addSurvivor(s);initializeCharacters(s,RUN);return s;}
function build(s,id='farm',x=20,z=20){return addBuilding(s,id,DEFS[id],x,z);}
function put(s,id,b){expect(assignResident(s,id,b.id,DEFS).ok).toBe(true);}
const record=s=>s.characters.records[1];
function storage(){const values=new Map();vi.stubGlobal('localStorage',{get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)});return values;}
afterEach(()=>vi.unstubAllGlobals());
describe('bounded needs and simulation clock',()=>{
 it('starts healthy and neutral without modifying M4 identity, skills or core',()=>{
  const s=game();for(const r of Object.values(s.characters.records))expect(r.needs).toEqual(DEFAULT_NEEDS);
  expect(needsEfficiency(record(s).needs)).toBe(1);expect(record(s).abilityRanks.agriculture).toBe(0);
 });
 it('increases fatigue on a valid duty and recovers while idle',()=>{
  const s=game(),b=build(s);put(s,1,b);tickNeeds(s,1,1,DEFS);expect(record(s).needs.fatigue).toBeGreaterThan(0);expect(s.characters.records[2].needs.fatigue).toBe(0);
  const before=record(s).needs.fatigue;assignResident(s,1,null,DEFS);tickNeeds(s,1,2,DEFS);expect(record(s).needs.fatigue).toBeLessThan(before);
 });
 it.each(['disabled','unpowered','destroyed','missing','inconsistent'])('treats %s work references as rest, not extra fatigue',kind=>{
  const s=game(),b=build(s);put(s,1,b);record(s).needs.fatigue=50;
  if(kind==='disabled')b.enabled=false;if(kind==='unpowered')b.powered=false;if(kind==='destroyed')b.hp=0;if(kind==='missing')s.buildings=s.buildings.filter(x=>x!==b);if(kind==='inconsistent')b.workers=[];
  tickNeeds(s,1,1,DEFS);expect(record(s).needs.fatigue).toBeLessThan(50);
 });
 it('counts actual idle militia fire for one settled step only',()=>{
  const s=game();markDefenseActivity(s,1);tickNeeds(s,1,1,DEFS);expect(record(s).needs.fatigue).toBeGreaterThan(0);tickNeeds(s,1,2,DEFS);expect(record(s).needs.fatigue).toBe(0);
 });
 it.each([0,-1,NaN,Infinity,1.01])('does not settle invalid dt %s',dt=>{
  const s=game();const before=structuredClone(s);expect(tickNeeds(s,dt,1,DEFS)).toBe(false);expect(s).toEqual(before);
 });
 it.each([0,-1,1.2,NaN,Infinity])('does not settle invalid or old step %s',step=>{
  const s=game();const before=structuredClone(s);expect(tickNeeds(s,1,step,DEFS)).toBe(false);expect(s).toEqual(before);
 });
 it('rejects duplicate/reversed settlement and ignores wall-clock/phase jumps',()=>{
  const s=game(),b=build(s);put(s,1,b);tickNeeds(s,.5,1,DEFS);const before=structuredClone(s.characters);
  expect(tickNeeds(s,.5,1,DEFS)).toBe(false);expect(tickNeeds(s,.5,0,DEFS)).toBe(false);expect(s.characters).toEqual(before);
  s.day=999;s.phase='night';s.timeInPhase=1e6;tickNeeds(s,.5,2,DEFS);expect(s.characters.survival.elapsedSeconds).toBe(1);
 });
 it('is reproducible for the same valid simulation steps without RNG',()=>{
  const a=game(),b=structuredClone(a);for(let i=1;i<=500;i++){tickNeeds(a,.3,i,DEFS);tickNeeds(b,.3,i,DEFS);}expect(a.characters).toEqual(b.characters);expect(a.characters.survival.elapsedSeconds).toBe(150);
 });
 it('prevents replay across checkpoint restore and preserves the elapsed counter',()=>{
  const s=game();tickNeeds(s,.3,1,DEFS);const data=createCheckpoint(s,42,[]),restored=restoreSave(data).state;
  expect(tickNeeds(restored,.3,1,DEFS)).toBe(false);expect(restored.characters).toEqual(s.characters);expect(tickNeeds(restored,.3,2,DEFS)).toBe(true);expect(restored.characters.survival.elapsedSeconds).toBe(.6);
 });
});
describe('health, morale and individual differences',()=>{
 it('loses health under hunger/thirst stress and recovers when supplied',()=>{
  const s=game();s.survivors[0].hunger=80;s.survivors[0].thirst=80;tickNeeds(s,1,1,DEFS);expect(record(s).needs.health).toBeLessThan(100);
  const injured=record(s).needs.health;s.survivors[0].hunger=0;s.survivors[0].thirst=0;tickNeeds(s,1,2,DEFS);expect(record(s).needs.health).toBeGreaterThan(injured);
 });
 it('never adds a health-based death or revives original starvation victims',()=>{
  const s=game();record(s).needs.health=0;tickSurvivors(s,.1,getModifiers(s));tickNeeds(s,.1,1,DEFS);expect(s.survivors).toHaveLength(4);
  s.resources.food=0;s.survivors[0].hunger=100;tickSurvivors(s,1,getModifiers(s));tickNeeds(s,1,2,DEFS);reconcileCharacters(s);expect(s.survivors.some(x=>x.id===1)).toBe(false);expect(s.characters.records[1]).toBeUndefined();
 });
 it('moves morale toward supplied/rested conditions and away from unmet needs',()=>{
  const good=game(),bad=game();bad.resources.food=0;bad.resources.water=0;bad.survivors[0].hunger=90;bad.survivors[0].thirst=90;record(bad).needs.health=20;record(bad).needs.fatigue=90;
  for(let i=1;i<=90;i++){tickNeeds(good,1,i,DEFS);tickNeeds(bad,1,i,DEFS);}expect(record(good).needs.morale).toBeGreaterThan(70);expect(record(bad).needs.morale).toBeLessThan(70);
 });
 it.each(PROFESSIONS)('keeps profession %s differences within five percent',professionId=>{
  const p=individualRules({professionId,personalityIds:[]});expect(p.workFatigue).toBeGreaterThanOrEqual(.95);expect(p.workFatigue).toBeLessThanOrEqual(1.05);
 });
 it.each(PERSONALITIES)('bounds personality %s morale bias without new statuses or AI',id=>{
  const p=individualRules({professionId:'generalist',personalityIds:[id]});expect(Math.abs(p.moraleBias)).toBeLessThanOrEqual(5);
 });
 it('caps combined personality differences and all three needs at both extremes',()=>{
  expect(individualRules({professionId:'guard',personalityIds:['optimistic','steadfast']}).moraleBias).toBe(5);
  const r={professionId:'generalist',personalityIds:[],needs:{fatigue:100,health:0,morale:0}};
  const n=calculateNeeds(r,{hunger:100,thirst:100},{working:true,dt:1,resources:{}});expect(n.fatigue).toBe(100);expect(n.health).toBe(0);expect(n.morale).toBeGreaterThanOrEqual(0);
  const recovered=calculateNeeds({...r,needs:{fatigue:0,health:100,morale:100}},{hunger:0,thirst:0},{working:false,dt:1,resources:{food:1,water:1}});expect(recovered.fatigue).toBe(0);expect(recovered.health).toBe(100);expect(recovered.morale).toBeLessThanOrEqual(100);
 });
 it('reports Traditional-Chinese-ready threshold statuses and only reduces efficiency',()=>{
  expect(needsStatus({fatigue:100,health:0,morale:0})).toEqual({fatigue:'Exhausted',health:'Critical',morale:'Low spirits'});
  expect(needsEfficiency({fatigue:0,health:100,morale:100})).toBe(1);expect(needsEfficiency({fatigue:100,health:0,morale:0})).toBe(.4);
  expect(needsEfficiency({fatigue:100,health:100,morale:70})).toBe(.75);
 });
});
describe('bounded real output and long-running simulation',()=>{
 it('reduces actual food and HUD projections, restoring exact M4 output when disabled',()=>{
  const s=game(),b=build(s);put(s,1,b);record(s).needs={fatigue:100,health:0,morale:0};s.resources.food=0;
  tickEconomy(s,90,DEFS);expect(s.resources.food).toBeCloseTo(1.6);expect(computeResourceBalance(s,DEFS).food.produced.find(x=>x.label==='Farm').rate).toBeCloseTo(1.6);
  setNeedsEffects(s,false);s.resources.food=0;tickEconomy(s,90,DEFS);expect(s.resources.food).toBe(4);
 });
 it('uses average crew needs, preserves skills, and affects research/extraction',()=>{
  const s=game(),b=build(s,'lab');put(s,1,b);record(s).needs={fatigue:84,health:0,morale:0};expect(crewEfficiency(s,b)).toBe(.4);
  tickResearch(s,1,DEFS);const poor=s.researchPoints;setNeedsEffects(s,false);s.researchPoints=0;tickResearch(s,1,DEFS);expect(poor/s.researchPoints).toBeCloseTo(.4);
  const l=build(s,'lumber',24,20);put(s,1,l);const grid=createGrid(64);grid.cells[19][24].type='forest';setNeedsEffects(s,true);s.resources.wood=0;tickExtraction(s,grid,1,DEFS);expect(s.resources.wood).toBeCloseTo(10*.5*.4/90);
 });
 it('simulates 200 complete day/night cycles without invalid needs, extra deaths or resource overflow',()=>{
  const s=game(),farm=build(s),garden=build(s,'garden',24,20),clinic=build(s,'clinic',27,20);build(s,'well',20,24);build(s,'well',24,24);
  put(s,1,farm);put(s,2,farm);put(s,3,garden);put(s,4,clinic);
  for(let step=1;step<=30000;step++){
   const mods=getModifiers(s);tickEconomy(s,1,DEFS,mods);tickSurvivors(s,1,mods);tickNeeds(s,1,step,DEFS);
   if(step%150===0){s.day++;const values=Object.values(s.resources);expect(values.every(Number.isFinite)).toBe(true);expect(s.resources.food).toBeLessThanOrEqual(s.caps.food);expect(s.resources.water).toBeLessThanOrEqual(s.caps.water);expect(s.survivors).toHaveLength(4);
    for(const r of Object.values(s.characters.records))expect(Object.values(r.needs).every(n=>Number.isFinite(n)&&n>=0&&n<=100)).toBe(true);
   }
  }
  expect(s.characters.survival.elapsedSeconds).toBe(30000);expect(record(s).needs.fatigue).toBe(100);expect(s.resources.food).toBeGreaterThan(0);expect(s.resources.water).toBeGreaterThan(0);
 },20000);
});
describe('v4/v5/M3/M4 v6 migration and safe protection',()=>{
 function m4(){const s=game(),b=build(s);put(s,1,b);const d=createCheckpoint(s,42,[]);d.requiredFeatures=d.requiredFeatures.filter(f=>f!==NEEDS_FEATURE&&f!=='autonomy-v1');delete d.characters.survival;delete d.characters.autonomy;for(const r of Object.values(d.characters.records)){delete r.needs;delete r.autonomy;}return d;}
 it('preserves every M4 identity, XP, skill, work and art reference while adding safe defaults',()=>{
  const old=m4(),copy=structuredClone(old),d=migrateSave(old);expect(old).toEqual(copy);expect(d.version).toBe(6);expect(d.run).toEqual(old.run);expect(d.core).toEqual(old.core);expect(d.characters.progression).toEqual(old.characters.progression);
  for(const [id,r] of Object.entries(d.characters.records)){const {needs,autonomy,...rest}=r;expect(needs).toEqual(DEFAULT_NEEDS);expect(rest).toEqual(old.characters.records[id]);}
  expect(migrateSave(d)).toEqual(d);
 });
 it('loads v4/v5/M3 v6 and permanently backs up exact pre-needs v6 import bytes',()=>{
  const old=m4(),v4=old.core,v5={format:'last-refuge',version:5,checkpoint:'dawn',savedAt:old.savedAt,payload:v4};expect(migrateSave(v4).characters).toEqual(migrateSave(v5).characters);
  const m3=structuredClone(old);m3.requiredFeatures=['characters-v1'];delete m3.characters.progression;for(const r of Object.values(m3.characters.records)){delete r.experience;delete r.experienceRemainders;}
  expect(migrateSave(m3).characters.records[1].needs).toEqual(DEFAULT_NEEDS);
  storage();const raw=' '+JSON.stringify(old);expect(importSave(raw).ok).toBe(true);expect(listBackups().entries.some(b=>b.pinned&&b.raw===raw)).toBe(true);
 });
 it('pins exact legacy source even when migration output equals the existing save',()=>{
  const values=storage(),old=m4(),current=JSON.stringify(migrateSave(old));values.set(SAVE_KEY,current);
  const raw=' '+JSON.stringify(old);expect(importSave(raw).ok).toBe(true);expect(values.get(SAVE_KEY)).toBe(current);expect(listBackups().entries.some(b=>b.pinned&&b.raw===raw)).toBe(true);
 });
 it('round-trips all needs, clock, switch, XP and jobs through three slots and JSON',()=>{
  storage();const s=game(),b=build(s);put(s,1,b);record(s).needs={fatigue:80,health:50,morale:20};tickNeeds(s,.3,1,DEFS);setNeedsEffects(s,false);expect(saveGame(s,42,[]).ok).toBe(true);
  const original=decodeSave(exportSave().raw);for(const slot of SLOT_KEYS){expect(saveSlot(slot).ok).toBe(true);expect(loadSlot(slot).ok).toBe(true);expect(decodeSave(exportSave().raw).characters).toEqual(original.characters);}
  expect(restoreSave(original).state.characters).toEqual(s.characters);
 });
 it.each([
  d=>{delete d.characters.records[1].needs;},d=>{d.characters.records[1].needs.health=-1;},d=>{d.characters.records[1].needs.fatigue=101;},d=>{d.characters.records[1].needs.morale='50';},d=>{d.characters.records[1].needs.extra=1;},d=>{d.characters.survival.schemaVersion=2;},d=>{d.characters.survival.lastStep=-1;},d=>{d.characters.survival.elapsedSeconds=100;},d=>{d.requiredFeatures.pop();},d=>{d.requiredFeatures.push('future');},d=>{d.version=99;}
 ])('preserves corrupted/unknown original data and raw export',change=>{
  const values=storage(),d=createCheckpoint(game(),42,[]);change(d);const raw=JSON.stringify(d);values.set(SAVE_KEY,raw);expect(saveGame(game(),42,[]).ok).toBe(false);expect(importSave(raw).ok).toBe(false);expect(exportSave().raw).toBe(raw);
 });
 it('keeps a native empty roster empty and does not reuse dead UID after load',()=>{
  const s=game(1),b=build(s);put(s,1,b);const uid=record(s).uid;killBuildingWorkers(s,b);reconcileCharacters(s);const r=restoreSave(createCheckpoint(s,42,[])).state;expect(r.survivors).toEqual([]);expect(r.characters.records).toEqual({});addSurvivor(r);reconcileCharacters(r);expect(r.characters.records[2].uid).not.toBe(uid);expect(r.characters.records[2].needs).toEqual(DEFAULT_NEEDS);
 });
});
