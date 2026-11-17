// Save management UI. Slots store dawn checkpoints, never incomplete combat state.
import { t } from './i18n/index.js';
import {
  SAVE_KEY, MAX_SAVE_BYTES, inspectSave, listSlots, saveSlot, loadSlot,
  importSave, exportSave, listBackups, setBackupPinned, ROLLING_BACKUP_LIMIT,
} from '../persistence.js';

function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = t(text);
  return node;
}

/** Create accessible save controls; callbacks pause/resume play and reload after a load. */
export function createSavePanel(root, { onOpen, onClose, onLoad }) {
  const launch = el('button', 'Saves');
  launch.className = 'save-launch';
  const warning = el('div');
  warning.className = 'save-warning';
  warning.setAttribute('role', 'alert');
  warning.hidden = true;
  const dialog = el('dialog');
  dialog.className = 'save-dialog';
  dialog.setAttribute('aria-label', t('Save management'));
  (root.querySelector('.interface-tools') ?? root).append(launch);
  root.append(warning, dialog);
  let status;

  function notify(message) {
    warning.textContent = t(message);
    warning.hidden = false;
    if (status) status.textContent = t(message);
  }
  function result(outcome, success) {
    if (!outcome.ok) notify(`Save protected: ${outcome.error} Original data was retained. Export it before recovery.`);
    else { status.textContent = t(success); refresh(); if (outcome.warning) notify(outcome.warning); }
    return outcome.ok;
  }
  function button(parent, label, action, disabled = false) {
    const node = el('button', label);
    node.type = 'button';
    node.disabled = disabled;
    node.addEventListener('click', action);
    parent.append(node);
  }
  function download(raw, name) {
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = el('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportKey(key, name) {
    const out = exportSave(key);
    if (out.ok) download(out.raw, name);
    else notify(out.error);
  }
  const body = el('div');
  function refresh() {
    const backupsOpen = body.querySelector('details')?.open ?? false;
    body.replaceChildren();
    const active = inspectSave();
    body.append(el('p', active.ok
      ? (active.empty ? 'No autosave yet.' : `Autosave: Day ${active.data.payload.day}`)
      : `Autosave protected: ${active.error}`));
    button(body, 'Export autosave JSON', () => exportKey(SAVE_KEY, 'last-refuge-autosave.json'));
    for (const [i, slot] of listSlots().entries()) {
      const row = el('div');
      row.className = 'save-slot';
      row.append(el('strong', `Slot ${i + 1}: ${!slot.ok ? 'Protected / unreadable' : slot.empty ? 'Empty' : `Day ${slot.data.payload.day}`}`));
      button(row, `Save slot ${i + 1}`, () => {
        if (!slot.empty && !window.confirm(t(`Replace slot ${i + 1}? Its previous contents will be backed up.`))) return;
        result(saveSlot(slot.key), 'Dawn checkpoint saved.');
      });
      button(row, `Load slot ${i + 1}`, () => {
        if (!window.confirm(t('Load this dawn checkpoint? The current autosave will be backed up. Unsaved play since dawn is not retained.'))) return;
        if (result(loadSlot(slot.key), 'Loaded.')) onLoad();
      }, !slot.ok || slot.empty);
      button(row, `Export slot ${i + 1}`, () => exportKey(slot.key, `last-refuge-slot-${i + 1}.json`), slot.empty === true);
      body.append(row);
    }
    const backups = listBackups();
    const details = el('details');
    details.open = backupsOpen;
    details.append(el('summary', `Recovery backups (${backups.ok ? backups.entries.length : 'unavailable'})`));
    if (!backups.ok) details.append(el('p', backups.error));
    for (const entry of [...(backups.entries ?? [])].sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0))) {
      const row = el('div');
      row.className = 'save-backup';
      row.append(el('p', `${entry.pinned ? 'Permanent' : 'Rotating'} backup: ${entry.savedAt} (${entry.reason})`));
      if (entry.error) row.append(el('p', entry.error));
      button(row, 'Export backup JSON', () => download(entry.raw, 'last-refuge-backup.json'));
      if (entry.mutable) {
        button(row, entry.pinned ? 'Allow rotation' : 'Keep permanently', () => {
          if (entry.pinned && !window.confirm(t('Allow this backup to be replaced by future saves? Export a copy first if it is important.'))) return;
          result(setBackupPinned(entry.backupKey, !entry.pinned),
            entry.pinned ? 'Backup may now rotate.' : 'Backup kept permanently. Automatic rotation cannot replace it.');
        });
      }
      details.append(row);
    }
    body.append(details);
  }
  dialog.append(el('h2', 'Save management'), el('p',
    `Three manual slots preserve the latest dawn checkpoint. Loading restarts that day; current battles are not saved. Up to ${ROLLING_BACKUP_LIMIT} normal backups rotate. Permanent backups, existing archives, and migration/recovery originals are excluded. Browser storage is finite: export important backups off-browser.`));
  status = el('p');
  status.setAttribute('role', 'status');
  dialog.append(status, body);
  const label = el('label', 'Import JSON ');
  const file = el('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.setAttribute('aria-label', t('Import save JSON'));
  label.append(file);
  dialog.append(label);
  const recoveryLabel = el('label', ' Recover a protected autosave by archiving it before this import');
  const recovery = el('input');
  recovery.type = 'checkbox';
  recoveryLabel.prepend(recovery);
  dialog.append(recoveryLabel);
  file.addEventListener('change', async () => {
    try {
      const selected = file.files[0];
      if (!selected) return;
      if (selected.size > MAX_SAVE_BYTES) throw new Error('Save exceeds 2 MiB limit.');
      const raw = await selected.text();
      if (!window.confirm(t(recovery.checked
        ? 'Recover using this import and reload? The protected original will be archived byte-for-byte before replacement. If backup fails, nothing will be replaced.'
        : 'Import this checkpoint and reload? The existing autosave will be backed up. Unknown or damaged existing saves will remain protected.'))) return;
      if (result(importSave(raw, { recoverProtected: recovery.checked }), 'Imported.')) onLoad();
    } catch (error) { notify(`Import failed: ${error.message}`); }
    finally { file.value = ''; }
  });
  function close() { dialog.close(); }
  button(dialog, 'Close saves', close);
  dialog.addEventListener('close', () => { onClose(); launch.focus(); });
  // Keep camera/building hotkeys out of the modal, including file input controls.
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('keyup', event => event.stopPropagation());
  launch.addEventListener('click', () => {
    onOpen();
    refresh();
    dialog.showModal();
  });
  return { notify };
}
