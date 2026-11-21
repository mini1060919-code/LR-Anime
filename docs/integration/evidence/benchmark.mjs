// Diagnostic only. No DOM, storage, user data, network or application changes.
import {performance} from 'node:perf_hooks';
import fs from 'node:fs';
import {createGameState,addBuilding,addSurvivor} from '../../../src/sim/state.js';
import {initializeCharacters} from '../../../src/characters/state.js';
import {assignJobs} from '../../../src/sim/survivors.js';
import {BUILDING_DEFS as D} from '../../../src/buildings/definitions.js';
const results=[];
for(const population of [8,32,128]){
 const s=createGameState();addBuilding(s,'hq',D.hq,30,30);
 for(let i=0;i<population;i++)addSurvivor(s);
 initializeCharacters(s,'run_12345678-1234-4234-8234-123456789abc');
 for(let i=0;i<Math.ceil(population/2);i++)addBuilding(s,'farm',D.farm,8+i%12,8+Math.floor(i/12));
 const samples=[];
 for(let i=0;i<550;i++){
  for(const r of s.survivors)r.buildingId=null;
  for(const b of s.buildings)b.workers=[];
  const start=performance.now();assignJobs(s,D);const elapsed=performance.now()-start;
  if(i>=50)samples.push(elapsed);
 }
 samples.sort((a,b)=>a-b);
 results.push({population,buildings:s.buildings.length,samples:samples.length,p50Ms:samples[250],p95Ms:samples[475],maxMs:samples.at(-1),meanMs:samples.reduce((a,b)=>a+b)/samples.length});
}
console.log(JSON.stringify({node:process.version,platform:process.platform,architecture:process.arch,kind:'CPU vacancy scheduler; 50 warmup + 500 measured; no rendering, battles or storage',results},null,2));
