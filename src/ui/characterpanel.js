// Read-only presentation adapter. Saves contain identity snapshots and asset IDs, never image bytes.
import { BUILDING_DEFS } from '../buildings/definitions.js';
import { ARCHETYPES } from '../characters/catalog.js';
import { createPortraitManager } from '../characters/portraits.js';
import { ANIME_EXPRESSIONS } from '../characters/anime.js';
import { t, getLocale } from './i18n/index.js';

export function characterProfile(survivor, state) {
  const workplace = state.buildings.find(building => building.id === survivor.buildingId);
  const bounded = value => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const record=state.characters?.records?.[survivor.id];
  const archetype=ARCHETYPES.find(item=>item.id===record?.archetypeId && record.archetypeRevision===1);
  return {
    id: survivor.id,
    uid: record?.uid ?? null,
    name: record ? (record.customName ?? record.nameSnapshot[getLocale()]) : t('Survivor #{id}', { id: survivor.id }),
    profession: record ? t(record.professionId.replace(/^./,c=>c.toUpperCase())) : t('Generalist'),
    personalities: record?.personalityIds.map(id=>t(id.replace(/^./,c=>c.toUpperCase()))).join(getLocale()==='en'?', ':'、') ?? '',
    appearanceId: record?.portraitSetId ?? 'pset.chr_generic.standard.v001',
    background: archetype?.background[getLocale()] ?? t(record?.archetypeId==='chr_generic'?'A survivor seeking a new home after the catastrophe.':'Background unavailable.'),
    assignment: workplace
      ? t('Assigned to {building}', { building: t(BUILDING_DEFS[workplace.defId]?.name ?? workplace.defId) })
      : t('Awaiting assignment'),
    hunger: bounded(survivor.hunger), thirst: bounded(survivor.thirst),
  };
}

/** Optional future assets must be local and carry attribution and a license.
 * This descriptor is a presentation contract, not a legal verification service.
 */
export function approvedPortrait(descriptor) {
  return descriptor && typeof descriptor.src === 'string' &&
    /^assets\/portraits\/[a-zA-Z0-9_/-]+\.(png|webp|jpe?g)$/.test(descriptor.src) &&
    ['CC0', 'CC-BY-4.0', 'Original', 'MIT'].includes(descriptor.license) &&
    typeof descriptor.credit === 'string' && descriptor.credit.trim() &&
    typeof descriptor.alt === 'string' && descriptor.alt.trim() ? descriptor : null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = t(text);
  return node;
}

/** Snapshot the paused roster. Only callbacks control pause; this panel never mutates state. */
export function createCharacterPanel(root, { getState, onOpen, onClose, portraitManager = createPortraitManager() }) {
  const launch = el('button', 'character-launch', 'Characters');
  launch.type = 'button';
  const dialog = el('dialog', 'character-dialog');
  dialog.setAttribute('aria-label', t('Operator dossier'));
  const close = el('button', 'character-close', 'Close dossier');
  close.type = 'button';
  close.addEventListener('click', () => dialog.close());
  const roster = el('div', 'character-roster');
  roster.setAttribute('role', 'group');
  roster.setAttribute('aria-label', t('Survivors'));
  const detail = el('section', 'character-detail');
  detail.setAttribute('aria-live', 'polite');
  dialog.append(el('p', 'dossier-eyebrow', 'Survivor records · skill effects disabled'),
    el('h2', 'dossier-title', 'Operator dossier'), close, roster, detail,
    el('p', 'character-note', 'Portraits are presentation only. They do not change survivor statistics or saved data.'));
  (root.querySelector('.interface-tools') ?? root).append(launch);
  root.append(dialog);

  let selectionToken=0;
  let pageIndex=0;
  const PAGE_SIZE=50;
  window.addEventListener('pagehide',()=>portraitManager.dispose(),{once:true});
  function select(survivor, state) {
    const token=++selectionToken;
    const profile = characterProfile(survivor, state);
    for (const button of roster.children) button.setAttribute('aria-pressed', String(button.dataset.survivorId === String(profile.id)));
    detail.replaceChildren();
    const frame = el('div', 'portrait-frame');
    frame.dataset.portraitStatus='loading';
    const silhouette = el('div', 'operator-silhouette');
    silhouette.setAttribute('role', 'img');
    silhouette.setAttribute('aria-label', t('Original silhouette placeholder. No character artwork installed.'));
    silhouette.append(el('span', 'silhouette-head'), el('span', 'silhouette-body'));
    frame.append(silhouette, el('small', 'portrait-credit', 'Original silhouette placeholder. No character artwork installed.'));
    async function loadPortrait(expression, target=frame, kind='full') {
      const request=String(Number(target.dataset.request ?? 0)+1);target.dataset.request=request;
      target.dataset.portraitStatus='loading';
      const portrait=await portraitManager.resolve(profile.appearanceId,expression,kind);
      if(token!==selectionToken || !dialog.open || target.dataset.request!==request)return;
      if(!portrait){if(target!==frame)target.replaceChildren(el('span','','Portrait unavailable.'));target.dataset.portraitStatus='fallback';return;}
      let lease;
      const image=el('img',kind==='full'?'character-portrait':'character-expression-image');image.dataset.assetId=portrait.assetId;image.alt=portrait.alt[getLocale()];
      try {
        lease=portrait.acquire();image.src=lease.src;
        await image.decode();
        if(image.naturalWidth!==portrait.width || image.naturalHeight!==portrait.height)throw new Error('Portrait dimensions mismatch.');
        if(token!==selectionToken || !dialog.open || target.dataset.request!==request)return;
        target.replaceChildren(image,el('small','portrait-credit',t('Artwork: {credit} · License: {license}',portrait)));
        target.dataset.portraitStatus='ready';
      } catch {
        if(token!==selectionToken || target.dataset.request!==request)return;
        if(expression!=='neutral')await loadPortrait('neutral',target,kind);
        else {if(target!==frame)target.replaceChildren(el('span','','Portrait unavailable.'));target.dataset.portraitStatus='fallback';}
      } finally {lease?.release();}
    }
    void loadPortrait('neutral');
    const info = el('div', 'character-info');
    const expressionFrame=el('div','character-expression-frame');
    expressionFrame.setAttribute('aria-label',t('Expression portrait'));
    const expressions=el('div','character-expressions');expressions.setAttribute('role','group');expressions.setAttribute('aria-label',t('Expressions'));
    const labels={neutral:'Calm',happy:'Happy',alert:'Alert',tired:'Tired',injured:'Injured'};
    for(const expression of ANIME_EXPRESSIONS){
      const button=el('button','',labels[expression]);button.type='button';button.dataset.expression=expression;
      button.setAttribute('aria-pressed',String(expression==='neutral'));
      button.addEventListener('click',()=>{
        for(const item of expressions.children)item.setAttribute('aria-pressed',String(item===button));
        void loadPortrait(expression,expressionFrame,'portrait');
      });expressions.append(button);
    }
    info.append(expressionFrame,expressions);
    void loadPortrait('neutral',expressionFrame,'portrait');
    info.append(el('h3', 'character-name', profile.name), el('p', 'character-assignment', profile.assignment),
      el('p','character-profession',profile.profession),el('p','character-personality',profile.personalities),
      el('p','character-background',profile.background),el('small','character-uid',profile.uid ?? ''),
      el('p','character-appearance',t('Appearance ID: {id}',{id:profile.appearanceId})));
    for (const [key, label] of [['hunger', 'Hunger level'], ['thirst', 'Thirst level']]) {
      const row = el('label', 'character-stat', label);
      const meter = el('meter');
      meter.min = 0; meter.max = 100; meter.value = profile[key];
      meter.setAttribute('aria-label', t(label));
      row.append(meter, el('span', 'character-stat-value', `${Math.round(profile[key])}/100`));
      info.append(row);
    }
    detail.append(frame, info);
  }
  const pagination=el('div','character-pagination');
  const previous=el('button','','Previous residents');previous.type='button';
  const next=el('button','','Next residents');next.type='button';
  const pageLabel=el('span');pagination.append(previous,pageLabel,next);dialog.insertBefore(pagination,detail);
  function renderPage() {
    const state=getState();roster.replaceChildren();
    const pages=Math.max(1,Math.ceil(state.survivors.length/PAGE_SIZE));
    pageIndex=Math.min(pageIndex,pages-1);
    const members=state.survivors.slice(pageIndex*PAGE_SIZE,(pageIndex+1)*PAGE_SIZE);
    for(const survivor of members) {
      const profile=characterProfile(survivor,state);
      const button=el('button','character-roster-button',profile.name);button.type='button';
      button.dataset.survivorId=String(survivor.id);
      const avatar=el('span','character-avatar-placeholder');avatar.setAttribute('aria-hidden','true');button.prepend(avatar);
      void portraitManager.resolve(profile.appearanceId,'neutral','avatar').then(async portrait=>{
        if(!portrait || !button.isConnected)return;
        let lease;const image=el('img','character-avatar');image.alt='';
        try {lease=portrait.acquire();image.src=lease.src;await image.decode();if(button.isConnected && image.naturalWidth===portrait.width && image.naturalHeight===portrait.height)avatar.replaceWith(image);}catch{/* default avatar */}finally{lease?.release();}
      });
      button.addEventListener('click',()=>select(survivor,state));roster.append(button);
    }
    previous.disabled=pageIndex===0;next.disabled=pageIndex>=pages-1;
    pageLabel.textContent=t('Page {page} / {total}',{page:pageIndex+1,total:pages});
    if(members.length)select(members[0],state);
    else {selectionToken++;detail.replaceChildren(el('p','','No survivors in the settlement.'));}
  }
  previous.addEventListener('click',()=>{pageIndex--;renderPage();});
  next.addEventListener('click',()=>{pageIndex++;renderPage();});
  launch.addEventListener('click',()=>{onOpen();pageIndex=0;dialog.showModal();renderPage();});
  dialog.addEventListener('close', () => { selectionToken++; onClose(); launch.focus(); });
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('keyup', event => event.stopPropagation());
  return { el: dialog };
}
