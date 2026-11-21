// DOM adapter only. Validated commands are injected by the application.
import {SKILLS} from '../characters/catalog.js';
import {THRESHOLDS} from '../progression/rules.js';
import {BUILDING_DEFS} from '../buildings/definitions.js';
import {t} from './i18n/index.js';
function node(tag,text,className=''){const n=document.createElement(tag);n.className=className;if(text!==undefined)n.textContent=t(text);return n;}
const LABELS={agriculture:'Agriculture',engineering:'Engineering',medicine:'Medicine skill',scavenging:'Scavenging',defense:'Defense',logistics:'Logistics'};
export function createProgressionControls(survivor,state,{onAssign,onAutomatic,onEffects,onRefresh}={}){
 const root=node('section',undefined,'character-growth');const record=state.characters?.records?.[survivor.id];if(!record?.experience)return root;
 root.setAttribute('aria-label',t('Skills and experience'));
 const skills=node('div',undefined,'skill-grid');
 for(const skill of SKILLS){
  const rank=record.abilityRanks[skill],xp=record.experience[skill],low=THRESHOLDS[rank],next=THRESHOLDS[Math.min(5,rank+1)];
  const row=node('label',undefined,'skill-row');row.dataset.skill=skill;
  row.append(node('strong',LABELS[skill]));
  row.append(node('span',rank===5?t('Level {rank} · MAX',{rank}):t('Level {rank} · XP {current}/{needed}',{rank,current:((xp-low)/1000).toFixed(2),needed:(next-low)/1000})));
  const meter=node('progress');meter.max=rank===5?1:next-low;meter.value=rank===5?1:xp-low;meter.setAttribute('aria-label',t(LABELS[skill]));row.append(meter);skills.append(row);
 }
 root.append(skills);
 if(onAssign){
  const form=node('form',undefined,'resident-assignment');
  const label=node('label','Workplace');const select=node('select');select.setAttribute('aria-label',t('Workplace'));
  const idle=node('option','Unassigned');idle.value='';select.append(idle);
  for(const b of state.buildings){const def=BUILDING_DEFS[b.defId];if(!(def?.jobs>0))continue;
   const option=node('option',`${t(def.name)} #${b.id} (${b.workers.length}/${def.jobs})`);option.value=String(b.id);option.disabled=b.hp<=0||b.enabled===false||(b.workers.length>=def.jobs&&survivor.buildingId!==b.id);select.append(option);
  }
  select.value=survivor.buildingId===null?'':String(survivor.buildingId);label.append(select);
  const apply=node('button','Assign resident');apply.type='submit';const status=node('p',undefined,'assignment-status');status.setAttribute('role','status');
  form.append(label,apply,status);form.addEventListener('submit',event=>{event.preventDefault();
   const result=onAssign(survivor.id,select.value===''?null:Number(select.value));
   if(result.ok)onRefresh();else status.textContent=t(result.error);
  });
  if(survivor.buildingId!==null&&onAutomatic){const automatic=node('button','Restore building auto-assignment');automatic.type='button';automatic.addEventListener('click',()=>{const result=onAutomatic(survivor.buildingId);if(result.ok)onRefresh();else status.textContent=t(result.error);});form.append(automatic);}
  root.append(form);
 }
 if(onEffects){const label=node('label','Enable bounded ability bonuses');const input=node('input');input.type='checkbox';input.checked=state.characters.progression.effectsEnabled;input.setAttribute('aria-label',t('Enable bounded ability bonuses'));input.addEventListener('change',()=>{onEffects(input.checked);onRefresh();});label.prepend(input);root.append(label);}
 root.append(node('small','Skill bonus limits: work and defense +10%, hauling +5%, clinic care +3%.'));
 root.append(node('small','Experience comes only from completed work. Jobs remain open to every profession.'));
 return root;
}
