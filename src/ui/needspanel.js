import {needsEfficiency,needsStatus} from '../needs/rules.js';
import {t} from './i18n/index.js';
function el(tag,text,className=''){const n=document.createElement(tag);n.className=className;if(text!==undefined)n.textContent=t(text);return n;}
export function createNeedsPanel(record,state,{onEffects,onRefresh}={}){
 const root=el('section',undefined,'resident-needs');root.setAttribute('aria-label',t('Survival needs'));
 if(!record?.needs)return root;
 const statuses=needsStatus(record.needs),labels={fatigue:'Fatigue',health:'Health',morale:'Morale'};
 for(const key of Object.keys(labels)){
  const row=el('label',undefined,'needs-row');row.dataset.need=key;
  row.append(el('strong',labels[key]),el('span',`${record.needs[key].toFixed(1)}/100 · ${t(statuses[key])}`));
  const meter=el('meter');meter.min=0;meter.max=100;meter.low=key==='fatigue'?40:30;meter.high=key==='fatigue'?75:key==='health'?70:60;meter.optimum=key==='fatigue'?0:100;meter.value=record.needs[key];meter.setAttribute('aria-label',t(labels[key]));row.append(meter);root.append(row);
 }
 const factor=state.characters.survival.effectsEnabled?needsEfficiency(record.needs):1;
 root.append(el('p',t('Needs work efficiency: {value}%',{value:(factor*100).toFixed(1)}),'needs-efficiency'));
 root.append(el('small','Idle or stopped workplaces allow rest. Automatic assignment may allocate another job.'));
 root.append(el('small','Efficiency applies to production, extraction, planting and research. Combat and support auras retain their existing rules.'));
 if(onEffects){const label=el('label','Apply survival efficiency');const checkbox=el('input');checkbox.type='checkbox';checkbox.checked=state.characters.survival.effectsEnabled;checkbox.setAttribute('aria-label',t('Apply survival efficiency'));checkbox.addEventListener('change',()=>{onEffects(checkbox.checked);onRefresh();});label.prepend(checkbox);root.append(label);}
 return root;
}
