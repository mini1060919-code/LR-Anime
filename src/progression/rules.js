// M4 v1 rules. Integer milli-XP, finite ranks, no new needs/AI or random rolls.
export const THRESHOLDS = Object.freeze([0,10000,30000,60000,100000,150000]);
export const PROFESSION_SKILL = Object.freeze({farmer:'agriculture',mechanic:'engineering',medic:'medicine',scout:'scavenging',guard:'defense',logistician:'logistics',researcher:'engineering'});
export const TRAIT_SKILLS = Object.freeze({steadfast:['*'],empathetic:['medicine'],pragmatic:['engineering','logistics'],curious:['scavenging','engineering'],reserved:['defense'],optimistic:['agriculture'],patient:['agriculture','medicine'],cautious:['defense','scavenging']});
export function learningMultiplier(record,skill){
 let bonus=PROFESSION_SKILL[record.professionId]===skill?0.1:0;
 for(const trait of record.personalityIds ?? [])if(TRAIT_SKILLS[trait]?.some(s=>s==='*'||s===skill))bonus+=trait==='steadfast'?0.02:0.03;
 return 1+Math.min(0.15,bonus);
}
export function rankForExperience(xp){let rank=0;while(rank<5 && xp>=THRESHOLDS[rank+1])rank++;return rank;}
export function buildingSkill(defId,def){
 if(['farm','garden','greenhouse','ranch','forester'].includes(defId))return 'agriculture';
 if(def?.extracts || ['hunt','fish'].includes(defId))return 'scavenging';
 if(defId==='clinic')return 'medicine';
 if(['garage','radio'].includes(defId))return 'logistics';
 if(def?.isTower)return 'defense';
 return 'engineering';
}
