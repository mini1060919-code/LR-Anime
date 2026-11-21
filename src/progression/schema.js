import {SKILLS} from '../characters/catalog.js';
import {THRESHOLDS,rankForExperience} from './rules.js';
export const GROWTH_FEATURE='progression-v1';
export function emptyExperience(ranks){return Object.fromEntries(SKILLS.map(s=>[s,THRESHOLDS[ranks[s]]]));}
export function upgradeProgression(characters){
 if(!characters.progression)characters.progression={schemaVersion:1,effectsEnabled:true,sequence:0};
 for(const record of Object.values(characters.records)){
  record.experience ??= emptyExperience(record.abilityRanks);
  record.experienceRemainders ??= Object.fromEntries(SKILLS.map(s=>[s,0]));
 }
 return characters;
}
export function validateProgression(characters,exactKeys,check){
 const p=characters.progression;
 exactKeys(p,['schemaVersion','effectsEnabled','sequence'],'progression');
 check(p.schemaVersion===1 && typeof p.effectsEnabled==='boolean' && Number.isSafeInteger(p.sequence) && p.sequence>=0,'Invalid progression metadata.');
 for(const r of Object.values(characters.records)){
  exactKeys(r.experience,SKILLS,'experience');exactKeys(r.experienceRemainders,SKILLS,'experience remainders');
  for(const skill of SKILLS){
   const xp=r.experience[skill],carry=r.experienceRemainders[skill];
   check(Number.isSafeInteger(xp)&&xp>=0&&xp<=THRESHOLDS[5]&&rankForExperience(xp)===r.abilityRanks[skill],'Invalid experience/rank.');
   check(typeof carry==='number'&&Number.isFinite(carry)&&carry>=0&&carry<1&&(xp<THRESHOLDS[5]||carry===0),'Invalid experience remainder.');
  }
 }
}
