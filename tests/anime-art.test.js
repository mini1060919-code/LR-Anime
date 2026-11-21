import {describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ANIME_CAST,ANIME_EXPRESSIONS} from '../src/characters/anime.js';
import {createPortraitManager,approvedAsset} from '../src/characters/portraits.js';
import manifest from '../public/assets/portraits/manifest.v1.json';
import rights from '../public/assets/portraits/rights.v1.json';
import inspection from '../docs/M3-ART-INSPECTION.json';
import {createGameState,addBuilding,addSurvivor} from '../src/sim/state.js';
import {BUILDING_DEFS} from '../src/buildings/definitions.js';
import {initializeCharacters,reconcileCharacters} from '../src/characters/state.js';
import {createCheckpoint,restoreSave,migrateSave,createSaveData} from '../src/persistence.js';
const RUN='run_12345678-1234-4234-8234-123456789abc';
function game(){const state=createGameState();addBuilding(state,'hq',BUILDING_DEFS.hq,30,30);for(let i=0;i<4;i++)addSurvivor(state);return state;}
function manager(fail='') {return createPortraitManager({fetcher:async url=>{
 if(url.endsWith('manifest.v1.json'))return Response.json(manifest);
 if(url.endsWith('rights.v1.json'))return Response.json(rights);
 if(url.includes(fail) && fail)return new Response('',{status:404});
 return new Response(await readFile(new URL('../public'+url,import.meta.url)),{headers:{'content-type':'image/png'}});
}});}
describe('user supplied anime pack',()=>{
 it('preserves all 32 source PNG byte hashes, RGBA headers and dimensions',async()=>{
  expect(inspection).toHaveLength(32);
  for(const row of inspection){const b=await readFile(new URL('../'+row.path,import.meta.url));expect(createHash('sha256').update(b).digest('hex')).toBe(row.sha256);expect(b[25]).toBe(6);expect([b.readUInt32BE(16),b.readUInt32BE(20)]).toEqual(row.size);}
 });
 it('loads the actual 4 full bodies, 4 avatars and 20 expressions under stable IDs',async()=>{
  const loader=manager();
  try {for(const [id,set] of Object.entries(ANIME_CAST)){
   expect((await loader.resolve(set,'neutral','full')).assetId).toBe(`${id}.full.v001`);
   expect((await loader.resolve(set,'neutral','avatar')).assetId).toBe(`${id}.avatar.v001`);
   for(const expression of ANIME_EXPRESSIONS)expect((await loader.resolve(set,expression)).assetId).toBe(`${id}.${expression}.v001`);
  }}finally{loader.dispose();}
 },20000);
 it('falls back to calm on missing expression, then null if calm is missing too',async()=>{
  let loader=manager('char_rin_happy');
  expect((await loader.resolve(ANIME_CAST.char_rin,'happy')).assetId).toBe('char_rin.neutral.v001');loader.dispose();
  loader=manager('/expressions/');expect(await loader.resolve(ANIME_CAST.char_rin,'happy')).toBeNull();loader.dispose();
 });
 it('records integration authorization without inventing commercial or modification rights',()=>{
  const grant=rights.records['user-m3-art-v1'];expect(grant.permissions.commercial).toBeNull();expect(grant.releaseReview).toContain('pending');
  const asset=manifest.assets['char_rin.full.v001'];expect(approvedAsset(asset,rights,'full')).toBe(true);
  const denied=structuredClone(rights);denied.records['user-m3-art-v1'].permissions.repositoryRedistribution=false;expect(approvedAsset(asset,denied,'full')).toBe(false);
  expect(approvedAsset({...asset,path:'assets/portraits/fake.png'},rights,'full')).toBe(false);
 });
 it('continues generator v1 saves with the original cast and preserved profiles',()=>{
  const state=game();initializeCharacters(state,RUN);
  state.characters.generatorVersion=1;state.characters.contentPackVersion=1;state.characters.records={};state.characters.usedUniqueArchetypeIds=[];
  state.survivors=[...state.survivors];reconcileCharacters(state);
  expect(new Set(Object.values(state.characters.records).map(r=>r.archetypeId))).toEqual(new Set(['chr_isumi_rin','chr_asagiri_mio','chr_tachibana_yuma','chr_shiraishi_tsumugi']));
  const saved=createCheckpoint(state,42,[]);const restored=restoreSave(saved).state;
  expect(restored.characters).toEqual(saved.characters);addSurvivor(restored);reconcileCharacters(restored);
  expect(restored.characters.records['5'].archetypeId).toBe('chr_generic');
 });
 it('assigns new cast without rewriting legacy v6 profiles and migrates v4/v5',()=>{
  const state=game();initializeCharacters(state,RUN);expect(new Set(Object.values(state.characters.records).map(r=>r.portraitSetId))).toEqual(new Set(Object.values(ANIME_CAST)));
  const v6=createCheckpoint(state,42,[]);const r=v6.characters.records['1'];r.archetypeId='chr_asagiri_mio';r.nameSnapshot={'zh-TW':'朝霧澪',en:'Mio Asagiri'};r.portraitSetId='pset.chr_asagiri_mio.standard.v001';v6.characters.usedUniqueArchetypeIds.push('chr_asagiri_mio');
  expect(restoreSave(v6).state.characters.records['1']).toEqual(r);
  const core=createSaveData(state,42,[]);const v5={format:'last-refuge',version:5,checkpoint:'dawn',savedAt:'2026-11-17T00:00:00Z',payload:core};
  expect(migrateSave(core).characters).toEqual(migrateSave(v5).characters);
  expect(migrateSave(v6)).toEqual(v6);
 });
});
