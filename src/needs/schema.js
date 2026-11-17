import {DEFAULT_NEEDS} from './rules.js';
export function upgradeNeeds(characters){
 characters.survival ??= {schemaVersion:1,effectsEnabled:true,lastStep:0,elapsedSeconds:0};
 for(const record of Object.values(characters.records))record.needs ??= {...DEFAULT_NEEDS};
 return characters;
}
export function validateNeeds(characters,exactKeys,check){
 const meta=characters.survival;exactKeys(meta,['schemaVersion','effectsEnabled','lastStep','elapsedSeconds'],'survival needs');
 check(meta.schemaVersion===1&&typeof meta.effectsEnabled==='boolean'&&Number.isSafeInteger(meta.lastStep)&&meta.lastStep>=0&&typeof meta.elapsedSeconds==='number'&&Number.isFinite(meta.elapsedSeconds)&&meta.elapsedSeconds>=0&&meta.elapsedSeconds<=meta.lastStep,'Invalid survival clock.');
 for(const record of Object.values(characters.records)){
  exactKeys(record.needs,['fatigue','health','morale'],'resident needs');
  check(Object.values(record.needs).every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100),'Invalid resident needs.');
 }
}
