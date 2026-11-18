import {describe,it,expect,vi,afterEach} from 'vitest';
import * as THREE from 'three';
import {createGameState,addBuilding,addSurvivor} from '../src/sim/state.js';
import {BUILDING_DEFS as DEFS} from '../src/buildings/definitions.js';
import {initializeCharacters,reconcileCharacters} from '../src/characters/state.js';
import {SKILLS,ARCHETYPES} from '../src/characters/catalog.js';
import {THRESHOLDS,learningMultiplier,rankForExperience,PROFESSION_SKILL,TRAIT_SKILLS} from '../src/progression/rules.js';
import {completeWork,createWorkReceipt,settleWork,abilityMultiplier,setAbilityEffects} from '../src/progression/work.js';
import {assignResident,restoreAutomaticAssignment} from '../src/progression/assignments.js';
import {tickEconomy,computeResourceBalance} from '../src/sim/economy.js';
import {tickExtraction} from '../src/sim/extraction.js';
import {tickResearch} from '../src/sim/research.js';
import {getModifiers} from '../src/sim/modifiers.js';
import {tickSurvivors,assignJobs,killBuildingWorkers,tryRecruit} from '../src/sim/survivors.js';
import {createCombat,buildingCenterWorld} from '../src/zombies/combat.js';
import {createGrid} from '../src/world/grid.js';
import {createCheckpoint,restoreSave,migrateSave,decodeSave,saveGame,SAVE_KEY,importSave,exportSave,listBackups,saveSlot,loadSlot,SLOT_KEYS} from '../src/persistence.js';
const RUN='run_12345678-1234-4234-8234-123456789abc';
function game(count=4){const state=createGameState();addBuilding(state,'hq',DEFS.hq,30,30);for(let i=0;i<count;i++)addSurvivor(state);initializeCharacters(state,RUN);return state;}
function building(state,id,x=20,z=20){return addBuilding(state,id,DEFS[id],x,z);}
function put(state,s,b){expect(assignResident(state,s.id,b.id,DEFS).ok).toBe(true);}
const xp=(state,s,skill)=>state.characters.records[s.id].experience[skill];
function maxRank(state,skill){for(const r of Object.values(state.characters.records)){r.abilityRanks[skill]=5;r.experience[skill]=THRESHOLDS[5];r.experienceRemainders[skill]=0;}}
function store(){const values=new Map();vi.stubGlobal('localStorage',{get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)});return values;}
afterEach(()=>vi.unstubAllGlobals());
describe('deterministic growth and receipts',()=>{
 it.each(SKILLS)('awards only actual %s participants and preserves unrelated skills',skill=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);completeWork(state,b,skill,10);
  expect(xp(state,state.survivors[0],skill)).toBeGreaterThanOrEqual(10000);expect(state.characters.records[1].abilityRanks[skill]).toBe(1);
  for(const other of SKILLS.filter(s=>s!==skill))expect(xp(state,state.survivors[0],other)).toBe(0);
  expect(Object.values(state.characters.records[2].experience)).toEqual(SKILLS.map(()=>0));
 });
 it('caps rank, experience and multiplier, preserving named professions',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);
  const r=state.characters.records[1],profession=r.professionId;completeWork(state,b,'agriculture',1e6);
  expect(r.experience.agriculture).toBe(150000);expect(r.abilityRanks.agriculture).toBe(5);expect(r.experienceRemainders.agriculture).toBe(0);
  expect(abilityMultiplier(state,b,'agriculture')).toBe(1.1);expect(r.professionId).toBe(profession);
  for(const r of Object.values(state.characters.records))expect(r.professionId).toBe(ARCHETYPES.find(a=>a.id===r.archetypeId).profession);
 });
 it('uses exact thresholds and bounded profession/personality learning rules',()=>{
  expect(THRESHOLDS.map(rankForExperience)).toEqual([0,1,2,3,4,5]);expect(rankForExperience(9999)).toBe(0);
  expect(learningMultiplier({professionId:'farmer',personalityIds:['optimistic','patient']},'agriculture')).toBe(1.15);
  expect(learningMultiplier({professionId:'farmer',personalityIds:['optimistic','patient']},'defense')).toBe(1);
 });
 it.each(Object.entries(PROFESSION_SKILL))('keeps profession %s learning bonus restricted to %s',(profession,skill)=>{
  expect(learningMultiplier({professionId:profession,personalityIds:[]},skill)).toBe(1.1);
  expect(learningMultiplier({professionId:profession,personalityIds:[]},SKILLS.find(s=>s!==skill))).toBe(1);
 });
 it.each(Object.entries(TRAIT_SKILLS))('applies personality %s through the independent learning rule table',(trait,skills)=>{
  const skill=skills[0]==='*'?'agriculture':skills[0];
  expect(learningMultiplier({professionId:'generalist',personalityIds:[trait]},skill)).toBeCloseTo(trait==='steadfast'?1.02:1.03);
 });
 it('settles a receipt once, rejects forged/replayed receipts and restored-state replay',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);const receipt=createWorkReceipt(state,b,'agriculture',1);
  expect(settleWork(state,receipt)).toBe(true);const before=xp(state,state.survivors[0],'agriculture');
  expect(settleWork(state,receipt)).toBe(false);expect(settleWork(state,{...receipt})).toBe(false);expect(xp(state,state.survivors[0],'agriculture')).toBe(before);
  const pending=createWorkReceipt(state,b,'agriculture',1),restored=restoreSave(createCheckpoint(state,42,[])).state;
  expect(settleWork(restored,pending)).toBe(false);expect(restored.characters.progression.sequence).toBe(state.characters.progression.sequence);
 });
 it.each([0,-1,NaN,Infinity])('rejects invalid work amount %s',units=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);expect(completeWork(state,b,'agriculture',units)).toBe(false);expect(state.characters.progression.sequence).toBe(0);
 });
 it('does not credit workers who died or changed jobs between issue and settlement',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);const receipt=createWorkReceipt(state,b,'agriculture',10);
  assignResident(state,1,null,DEFS);settleWork(state,receipt);expect(state.characters.records[1].experience.agriculture).toBe(0);
  put(state,state.survivors[0],b);const next=createWorkReceipt(state,b,'agriculture',10);killBuildingWorkers(state,b);reconcileCharacters(state);settleWork(state,next);
  expect(state.characters.records[1]).toBeUndefined();
 });
 it('retains fractional XP through save/reload and reproduces equivalent completed work',()=>{
  const a=game(),b=game(),ba=building(a,'farm'),bb=building(b,'farm');put(a,a.survivors[0],ba);put(b,b.survivors[0],bb);
  completeWork(a,ba,'agriculture',1);
  for(let i=0;i<100;i++)completeWork(b,bb,'agriculture',0.01);
  expect(b.characters.records[1].experience).toEqual(a.characters.records[1].experience);
  completeWork(b,bb,'agriculture',0.00001);const saved=createCheckpoint(b,42,[]);expect(restoreSave(saved).state.characters.records[1]).toEqual(b.characters.records[1]);
 });
});
describe('outcome hooks and bounded economic/defense effects',()=>{
 it('credits only food that fits the cap; no idle, stalled, disabled or zero-dt XP',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);state.resources.food=state.caps.food-1;
  tickEconomy(state,90,DEFS);expect(state.resources.food).toBe(state.caps.food);expect(xp(state,state.survivors[0],'agriculture')).toBeGreaterThan(0);
  const before=structuredClone(state.characters);tickEconomy(state,90,DEFS);tickEconomy(state,0,DEFS);b.enabled=false;state.resources.food=0;tickEconomy(state,90,DEFS);expect(state.characters).toEqual(before);
 });
 it('caps agriculture output at +10% and gives exactly baseline output with effects disabled',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);maxRank(state,'agriculture');state.resources.food=0;tickEconomy(state,90,DEFS);expect(state.resources.food).toBeCloseTo(4.4);
  setAbilityEffects(state,false);state.resources.food=0;tickEconomy(state,90,DEFS);expect(state.resources.food).toBe(4);
 });
 it('projects the same bounded food output in the resource HUD',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);maxRank(state,'agriculture');
  expect(computeResourceBalance(state,DEFS).food.produced.find(p=>p.label==='Farm').rate).toBeCloseTo(4.4);
 });
 it('keeps full economy, extraction, research, modifiers and needs equivalent when effects are off',()=>{
  const state=game();for(const [i,id] of ['farm','lumber','lab','clinic'].entries())put(state,state.survivors[i],building(state,id,10+i*4,20));
  const baseline=structuredClone(state);delete baseline.characters;delete baseline.runId;
  for(const skill of SKILLS)maxRank(state,skill);setAbilityEffects(state,false);
  const grid=createGrid(64);grid.cells[19][14].type='forest';const otherGrid=structuredClone(grid);
  for(let i=0;i<50;i++)for(const [s,g] of [[state,grid],[baseline,otherGrid]]){const mods=getModifiers(s,g);tickEconomy(s,.1,DEFS,mods);tickResearch(s,.1,DEFS);tickSurvivors(s,.1,mods);tickExtraction(s,g,.1,DEFS,mods);}
  expect(state.resources).toEqual(baseline.resources);expect(state.researchPoints).toBe(baseline.researchPoints);expect(state.survivors).toEqual(baseline.survivors);expect(grid).toEqual(otherGrid);expect(getModifiers(state,grid)).toEqual(getModifiers(baseline,otherGrid));
 });
 it('credits powered, fueled generation only when energy is actually used or stored',()=>{
  const state=game(),b=building(state,'generator');put(state,state.survivors[0],b);state.resources.energy=state.caps.energy;
  tickEconomy(state,1,DEFS);expect(xp(state,state.survivors[0],'engineering')).toBe(0);
  state.resources.energy=0;state.resources.wood=0;tickEconomy(state,1,DEFS);expect(xp(state,state.survivors[0],'engineering')).toBe(0);
  state.resources.wood=10;tickEconomy(state,1,DEFS);expect(xp(state,state.survivors[0],'engineering')).toBeGreaterThan(0);
 });
 it('credits actual lab research and clinic care without introducing health/fatigue',()=>{
  const state=game(),lab=building(state,'lab'),clinic=building(state,'clinic',24,20);put(state,state.survivors[0],lab);put(state,state.survivors[1],clinic);
  tickResearch(state,1,DEFS);expect(xp(state,state.survivors[0],'engineering')).toBeGreaterThan(0);
  tickSurvivors(state,1,{hungerRate:1,thirstRate:1});expect(xp(state,state.survivors[1],'medicine')).toBe(0);
  const mods=getModifiers(state);tickSurvivors(state,1,mods);expect(xp(state,state.survivors[1],'medicine')).toBeGreaterThan(0);
  const base=mods.hungerRate;maxRank(state,'medicine');expect(getModifiers(state).hungerRate/base).toBeCloseTo(.97);
  setAbilityEffects(state,false);expect(getModifiers(state).hungerRate).toBe(.85);
 });
 it('credits extraction and hauling only for delivered resource, never depleted/capped nodes',()=>{
  const state=game(),b=building(state,'lumber'),garage=building(state,'garage',24,20);put(state,state.survivors[0],b);put(state,state.survivors[1],garage);
  const grid=createGrid(64);grid.cells[19][20].type='forest';state.resources.wood=0;maxRank(state,'scavenging');maxRank(state,'logistics');
  tickExtraction(state,grid,1,DEFS);expect(state.resources.wood).toBeCloseTo(10*.5*1.1*1.05/90); // <=15.5% combined M4 bonus
  // Start below max for XP inspection.
  for(const [s,skill] of [[state.survivors[0],'scavenging'],[state.survivors[1],'logistics']]){state.characters.records[s.id].experience[skill]=0;state.characters.records[s.id].abilityRanks[skill]=0;}
  tickExtraction(state,grid,1,DEFS);expect(xp(state,state.survivors[0],'scavenging')).toBeGreaterThan(0);expect(xp(state,state.survivors[1],'logistics')).toBeGreaterThan(0);
  const before=structuredClone(state.characters);state.resources.wood=state.caps.wood;tickExtraction(state,grid,1,DEFS);grid.cells[19][20].type='grass';state.resources.wood=0;tickExtraction(state,grid,1,DEFS);expect(state.characters).toEqual(before);
 });
 it('awards radio logistics only after a recruit actually arrives',()=>{
  const state=game(1),radio=building(state,'radio');put(state,state.survivors[0],radio);state.resources.food=0;
  tryRecruit(state,DEFS,1);expect(xp(state,state.survivors[0],'logistics')).toBe(0);
  state.resources.food=100;tryRecruit(state,DEFS,1);expect(xp(state,state.survivors[0],'logistics')).toBeGreaterThan(0);
 });
 it('awards tree completion, not idle forester waiting',()=>{
  const state=game(),b=building(state,'forester');put(state,state.survivors[0],b);const grid=createGrid(64);state.resources.water=0;
  tickExtraction(state,grid,30,DEFS);expect(xp(state,state.survivors[0],'agriculture')).toBe(0);
  state.resources.water=10;tickExtraction(state,grid,20,DEFS);expect(xp(state,state.survivors[0],'agriculture')).toBeGreaterThan(0);
 });
 function shot(enabled,level=5,targetHp=100){const state=game(),b=building(state,'tower');put(state,state.survivors[0],b);maxRank(state,'defense');setAbilityEffects(state,enabled);
  const center=buildingCenterWorld(b);const target={wx:center.x,wz:center.z,hp:targetHp,state:'walking'};const manager={zombies:[target],damageZombie:(z,damage)=>{z.hp=Math.max(0,z.hp-damage);}};
  const combat=createCombat({scene:new THREE.Scene(),state,grid:createGrid(64),visuals:{meshes:new Map(),setDamaged:()=>{},remove:()=>{}}});combat.update(.1,manager);return {state,b,target,combat,manager};}
 it('credits only the six actual HQ militia fighters, and only on a hit',()=>{
  const state=game(7),hq=state.buildings[0];const center=buildingCenterWorld(hq);const manager={zombies:[{wx:center.x,wz:center.z,hp:100,state:'walking'}],damageZombie:(z,n)=>{z.hp=Math.max(0,z.hp-n);}};
  const combat=createCombat({scene:new THREE.Scene(),state,grid:createGrid(64),visuals:{meshes:new Map(),setDamaged:()=>{},remove:()=>{}}});combat.update(.1,manager);
  for(const s of state.survivors.slice(0,6))expect(xp(state,s,'defense')).toBeGreaterThan(0);expect(xp(state,state.survivors[6],'defense')).toBe(0);
 });
 it('limits tower bonus to 10%, preserves baseline combat when disabled, and gives no idle aim XP',()=>{
  const base=shot(false),boost=shot(true);expect(100-base.target.hp).toBeGreaterThan(0);expect(100-boost.target.hp).toBeCloseTo((100-base.target.hp)*1.1);
  const r=boost.state.characters.records[1];r.experience.defense=0;r.abilityRanks.defense=0;
  boost.manager.zombies=[];boost.combat.update(2,boost.manager);expect(r.experience.defense).toBe(0);
  boost.manager.zombies=[{wx:boost.target.wx,wz:boost.target.wz,hp:1,state:'walking'}];boost.combat.update(2,boost.manager);expect(r.experience.defense).toBeGreaterThan(0);expect(r.experience.defense).toBeLessThanOrEqual(115); // actual 1 HP /10, not overkill
 });
});
describe('validated player assignment and original automation',()=>{
 it('moves a specific living resident atomically, releasing old references',()=>{
  const state=game(),a=building(state,'farm'),b=building(state,'lab',24,20);put(state,state.survivors[0],a);put(state,state.survivors[0],b);
  expect(a.workers).toEqual([]);expect(b.workers).toEqual([1]);expect(state.survivors[0].buildingId).toBe(b.id);expect(b.autoAssign).toBe(false);
 });
 it.each(['full','disabled','destroyed','missing','dead'])('rejects %s assignment without losing previous work',kind=>{
  const state=game(),a=building(state,'farm'),b=building(state,'clinic',24,20);put(state,state.survivors[0],a);
  let id=1,target=b.id;if(kind==='full')put(state,state.survivors[1],b);if(kind==='disabled')b.enabled=false;if(kind==='destroyed')b.hp=0;if(kind==='missing')target=999;if(kind==='dead')id=999;
  const before=structuredClone(state);expect(assignResident(state,id,target,DEFS).ok).toBe(false);expect(state).toEqual(before);
 });
 it('keeps auto-assignment available and manual assignments stable across automation',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[2],b);assignJobs(state,DEFS);expect(b.workers).toEqual([3]);
  expect(restoreAutomaticAssignment(state,b.id,DEFS).ok).toBe(true);expect(b.workers).toHaveLength(2);expect(b.workers).toContain(3);
  expect(assignResident(state,3,null,DEFS).ok).toBe(true);expect(state.survivors[2].buildingId).toBeNull();
 });
});
describe('v4/v5/v6 add-on migration and protection',()=>{
 function oldV6(){const state=game(),data=createCheckpoint(state,42,[]);data.requiredFeatures=['characters-v1'];delete data.characters.progression;delete data.characters.survival;delete data.characters.autonomy;for(const r of Object.values(data.characters.records)){delete r.experience;delete r.experienceRemainders;delete r.needs;delete r.autonomy;}return data;}
 it('preserves v6 run, UID, art, names, ranks and safe defaults without version redesign',()=>{
  const old=oldV6();old.characters.records[1].abilityRanks.agriculture=3;const copy=structuredClone(old);const data=migrateSave(old);
  expect(old).toEqual(copy);expect(data.version).toBe(6);expect(data.run).toEqual(old.run);const r=data.characters.records[1];expect(r.uid).toBe(old.characters.records[1].uid);expect(r.portraitSetId).toBe(old.characters.records[1].portraitSetId);expect(r.experience.agriculture).toBe(60000);expect(r.abilityRanks.agriculture).toBe(3);expect(migrateSave(data)).toEqual(data);
  expect(decodeSave(JSON.stringify({...data,characters:data.characters}))).toEqual(data);
 });
 it('migrates v4/v5 to identical growth defaults and preserves exact old v6 source on import',()=>{
  const old=oldV6(),core=old.core,v5={format:'last-refuge',version:5,checkpoint:'dawn',savedAt:old.savedAt,payload:core};expect(migrateSave(core).characters).toEqual(migrateSave(v5).characters);
  store();const raw=' '+JSON.stringify(old);expect(importSave(raw).ok).toBe(true);expect(listBackups().entries.some(b=>b.raw===raw&&b.pinned)).toBe(true);
 });
 it('stores growth, remainder, work, effects switch and allocator in all three slots and JSON',()=>{
  store();const state=game(),b=building(state,'farm');put(state,state.survivors[0],b);completeWork(state,b,'agriculture',20.00001);setAbilityEffects(state,false);expect(saveGame(state,42,[]).ok).toBe(true);
  const original=JSON.parse(exportSave().raw);for(const slot of SLOT_KEYS){expect(saveSlot(slot).ok).toBe(true);expect(loadSlot(slot).ok).toBe(true);expect(JSON.parse(exportSave().raw).characters).toEqual(original.characters);}
  const restored=restoreSave(decodeSave(exportSave().raw)).state;expect(restored.characters).toEqual(state.characters);expect(restored.survivors[0].buildingId).toBe(b.id);expect(restored.buildings.find(x=>x.id===b.id).workers).toEqual([1]);
 });
 it.each([
  d=>{d.characters.records[1].experience.agriculture=-1;},d=>{d.characters.records[1].experience.agriculture=150001;},d=>{d.characters.records[1].experienceRemainders.agriculture=1;},d=>{delete d.characters.records[1].experience;},d=>{d.characters.progression.sequence=-1;},d=>{d.characters.progression.schemaVersion=2;},d=>{d.requiredFeatures.push('future');},d=>{d.version=99;},d=>{d.characters.records[1].abilityRanks.agriculture=5;}
 ])('protects corrupt/unknown progression and keeps raw export',change=>{
  const values=store(),data=createCheckpoint(game(),42,[]);change(data);const raw=JSON.stringify(data);values.set(SAVE_KEY,raw);expect(saveGame(game(),42,[]).ok).toBe(false);expect(importSave(raw).ok).toBe(false);expect(exportSave().raw).toBe(raw);
 });
 it.each([[],[1,1],[999],'bad'])('rejects inconsistent persisted worker lists %j without overwriting',workers=>{
  const values=store(),state=game(),b=building(state,'farm');put(state,state.survivors[0],b);
  const data=createCheckpoint(state,42,[]);data.core.buildings.find(x=>x.id===b.id).workers=workers;const raw=JSON.stringify(data);values.set(SAVE_KEY,raw);
  expect(importSave(raw).ok).toBe(false);expect(saveGame(state,42,[]).ok).toBe(false);expect(exportSave().raw).toBe(raw);
 });
 it('keeps a native empty v6 roster empty after adding growth data',()=>{
  const state=game(),b=building(state,'farm');for(const s of state.survivors.slice(0,2))put(state,s,b);
  killBuildingWorkers(state,b);const other=building(state,'farm',24,20);for(const s of [...state.survivors])put(state,s,other);killBuildingWorkers(state,other);reconcileCharacters(state);
  const restored=restoreSave(createCheckpoint(state,42,[])).state;expect(restored.survivors).toEqual([]);expect(restored.characters.records).toEqual({});expect(restored.nextSurvivorId).toBe(5);
 });
 it('keeps dead residents dead and high-water IDs non-reusable after growth reload',()=>{
  const state=game(),b=building(state,'farm');put(state,state.survivors[3],b);completeWork(state,b,'agriculture',10);const deadUid=state.characters.records[4].uid;killBuildingWorkers(state,b);reconcileCharacters(state);
  const restored=restoreSave(createCheckpoint(state,42,[])).state;expect(restored.characters.records[4]).toBeUndefined();expect(restored.nextSurvivorId).toBe(5);
  addSurvivor(restored);reconcileCharacters(restored);expect(restored.characters.records[5].uid).not.toBe(deadUid);expect(restored.characters.records[5].experience.agriculture).toBe(0);
 });
});
