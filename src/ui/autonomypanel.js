import {t} from './i18n/index.js';
function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=t(text);return n;}
export function createAutonomyPanel(survivor,state,{onControl,onRefresh}={}){
 const root=el('section');root.className='resident-autonomy';root.setAttribute('aria-label',t('Resident autonomy'));
 const a=state.characters?.records?.[survivor.id]?.autonomy;if(!a)return root;
 const label=a.resting?'Resting for fatigue':a.mode==='manual'?(survivor.buildingId===null?(a.targetBuildingId===null?'Manual idle':'Awaiting manual workplace'):'Manual assignment'):survivor.buildingId===null?'Awaiting autonomous work':'Autonomous work';
 const status=el('p',label);status.className='autonomy-status';root.append(status);
 root.append(el('small','Automatic rest at fatigue 85; resume at 35 after at least 10 seconds. Health below 50 lowers work priority.'));
 if(a.mode==='manual'&&a.targetBuildingId!==null)root.append(el('p',t('Reserved manual workplace: #{id}',{id:a.targetBuildingId})));
 root.append(el('small','Manual jobs are reserved during rest and take priority on recovery. Existing HQ defense remains active.'));
 root.append(el('small','Autonomous vacancies use buildings with automatic assignment enabled.'));
 if(onControl){const button=el('button',a.mode==='manual'?'Return resident to autonomy':'Keep manual control');button.type='button';const feedback=el('p');feedback.setAttribute('role','status');
  button.addEventListener('click',()=>{const result=onControl(survivor.id,a.mode==='manual'?'auto':'manual');if(result.ok)onRefresh();else feedback.textContent=t(result.error);});root.append(button,feedback);
 }
 return root;
}
