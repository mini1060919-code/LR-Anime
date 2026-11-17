// Read-only presentation adapter. Portraits and localized names never enter saves.
import { BUILDING_DEFS } from '../buildings/definitions.js';
import { t } from './i18n/index.js';

export function characterProfile(survivor, state) {
  const workplace = state.buildings.find(building => building.id === survivor.buildingId);
  const bounded = value => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return {
    id: survivor.id,
    name: t('Survivor #{id}', { id: survivor.id }),
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
    /^assets\/portraits\/[a-zA-Z0-9_/-]+\.(png|webp|jpg|svg)$/.test(descriptor.src) &&
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
export function createCharacterPanel(root, { getState, onOpen, onClose, resolvePortrait = () => null }) {
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
  dialog.append(el('p', 'dossier-eyebrow', 'Portrait interface prototype'),
    el('h2', 'dossier-title', 'Operator dossier'), close, roster, detail,
    el('p', 'character-note', 'Portraits are presentation only. They do not change survivor statistics or saved data.'));
  (root.querySelector('.interface-tools') ?? root).append(launch);
  root.append(dialog);

  function select(survivor, state) {
    const profile = characterProfile(survivor, state);
    for (const button of roster.children) button.setAttribute('aria-pressed', String(button.dataset.survivorId === String(profile.id)));
    detail.replaceChildren();
    const frame = el('div', 'portrait-frame');
    const portrait = approvedPortrait(resolvePortrait(profile.id));
    if (portrait) {
      const image = el('img', 'character-portrait');
      image.src = `${import.meta.env.BASE_URL}${portrait.src}`;
      image.alt = portrait.alt;
      frame.append(image, el('small', 'portrait-credit', t('Artwork: {credit} · License: {license}', portrait)));
    } else {
      const silhouette = el('div', 'operator-silhouette');
      silhouette.setAttribute('role', 'img');
      silhouette.setAttribute('aria-label', t('Original silhouette placeholder. No character artwork installed.'));
      silhouette.append(el('span', 'silhouette-head'), el('span', 'silhouette-body'));
      frame.append(silhouette, el('small', 'portrait-credit', 'Original silhouette placeholder. No character artwork installed.'));
    }
    const info = el('div', 'character-info');
    info.append(el('h3', 'character-name', profile.name), el('p', 'character-assignment', profile.assignment));
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
  launch.addEventListener('click', () => {
    onOpen();
    const state = getState();
    roster.replaceChildren(); detail.replaceChildren();
    for (const survivor of state.survivors) {
      const button = el('button', 'character-roster-button', t('Survivor #{id}', { id: survivor.id }));
      button.type = 'button';
      button.dataset.survivorId = String(survivor.id);
      button.addEventListener('click', () => select(survivor, state));
      roster.append(button);
    }
    if (state.survivors.length) select(state.survivors[0], state);
    else detail.append(el('p', '', 'No survivors in the settlement.'));
    dialog.showModal();
  });
  dialog.addEventListener('close', () => { onClose(); launch.focus(); });
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('keyup', event => event.stopPropagation());
  return { el: dialog };
}
