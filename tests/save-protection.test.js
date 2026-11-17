import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import {
  SAVE_KEY, SLOT_KEYS, BACKUP_PREFIX, createSaveData, migrateSave, decodeSave,
  inspectSave, readSave, restoreSave, saveGame, clearSave, saveSlot, loadSlot,
  importSave, exportSave, listBackups, listSlots, MAX_SAVE_BYTES,
  ROLLING_BACKUP_LIMIT, setBackupPinned,
} from '../src/persistence.js';
import { createGameState, addBuilding, addSurvivor } from '../src/sim/state.js';
import * as mapgen from '../src/world/mapgen.js';
import { getDef } from '../src/buildings/definitions.js';

let values;
let storage;
function game() {
  const state = createGameState();
  addBuilding(state, 'hq', getDef('hq'), 30, 30);
  addBuilding(state, 'warehouse', getDef('warehouse'), 20, 20);
  const farm = addBuilding(state, 'farm', getDef('farm'), 15, 15);
  const survivor = addSurvivor(state);
  survivor.buildingId = farm.id;
  farm.workers.push(survivor.id);
  farm.level = 2;
  farm.priority = 2;
  farm.enabled = false;
  farm.repairing = true;
  state.resources.wood = 200;
  state.researched = ['forestry'];
  state.researchPoints = 12;
  state.kills = 10;
  state.reputation = 15;
  state.day = 3;
  return state;
}
const legacy = () => createSaveData(game(), 42, [{ x: 1, z: 2, toType: 'forest' }]);
const rawLegacy = () => JSON.stringify(legacy());
function backups() { return listBackups().entries; }

beforeEach(() => {
  values = new Map();
  storage = {
    get length() { return values.size; },
    key: i => [...values.keys()][i] ?? null,
    getItem: vi.fn(key => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    removeItem: vi.fn(key => values.delete(key)),
  };
  vi.stubGlobal('localStorage', storage);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('v4 to v5 compatibility', () => {
  it('migrates without mutating or losing legacy data', () => {
    const data = legacy();
    const original = structuredClone(data);
    const migrated = migrateSave(data);
    expect(data).toEqual(original);
    expect(migrated).toMatchObject({ version: 5, format: 'last-refuge', checkpoint: 'dawn', payload: original });
    const restored = restoreSave(decodeSave(JSON.stringify(migrated)).payload);
    expect(restored.state.resources.wood).toBe(200);
    expect(restored.state).toMatchObject({ day: 3, researched: ['forestry'], researchPoints: 12, kills: 10, reputation: 15 });
    expect(restored.state.buildings[2]).toMatchObject({ level: 2, priority: 2, enabled: false, repairing: true, workers: [1] });
    expect(restored.state.survivors[0].buildingId).toBe(3);
    expect(restored.changedTiles).toEqual(original.changedTiles);
  });
  it('accepts legacy v4 fields added after v4 first shipped', () => {
    const data = legacy();
    for (const b of data.buildings) {
      for (const key of ['enabled', 'repairing', 'level', 'priority']) delete b[key];
    }
    delete data.reputation;
    const restored = restoreSave(migrateSave(data).payload);
    expect(restored.state.buildings[0]).toMatchObject({ enabled: true, repairing: false, level: 1, priority: 1 });
    expect(restored.state.reputation).toBe(0);
  });
  it('reads v4 without writing and backs up its exact bytes before first v5 write', () => {
    const raw = '  ' + rawLegacy();
    values.set(SAVE_KEY, raw);
    expect(readSave()).toEqual(legacy());
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(saveGame(game(), 42, []).ok).toBe(true);
    expect(JSON.parse(values.get(SAVE_KEY)).version).toBe(5);
    expect(backups()[0].raw).toBe(raw);
  });
  it('migration of v5 is idempotent', () => {
    const v5 = migrateSave(legacy());
    expect(migrateSave(v5)).toEqual(v5);
  });
});

describe('validation and preservation', () => {
  it.each([
    ['malformed JSON', '{broken'],
    ['future version', JSON.stringify({ version: 99 })],
    ['missing Refuge', JSON.stringify({ ...legacy(), buildings: [] })],
    ['unknown building', JSON.stringify({ ...legacy(), buildings: [{ defId: 'future', x: 1, z: 1 }] })],
    ['invalid position', JSON.stringify({ ...legacy(), buildings: [{ defId: 'hq', x: -1, z: 1 }] })],
    ['invalid field', JSON.stringify({ ...legacy(), day: '3' })],
    ['unknown research', JSON.stringify({ ...legacy(), researched: ['future'] })],
    ['bad envelope', JSON.stringify({ version: 5, payload: legacy() })],
  ])('never overwrites or deletes %s', (_, raw) => {
    values.set(SAVE_KEY, raw);
    expect(inspectSave().ok).toBe(false);
    expect(saveGame(game(), 42, []).ok).toBe(false);
    expect(clearSave().ok).toBe(false);
    expect(importSave(rawLegacy()).ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(raw);
    expect(exportSave().raw).toBe(raw);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
  it('rejects duplicate IDs, overlap, invalid workplace and changed tiles', () => {
    const variants = [
      d => { d.buildings[1].id = d.buildings[0].id; },
      d => { d.buildings[1].x = 30; d.buildings[1].z = 30; },
      d => { d.survivors[0].buildingId = 999; },
      d => { d.changedTiles[0].toType = 'lava'; },
      d => { d.resources.wood = Infinity; },
      d => { d.buildings[0].hp = NaN; },
    ];
    for (const change of variants) {
      const data = legacy(); change(data);
      expect(() => migrateSave(data)).toThrow();
    }
  });
  it('keeps saves untouched if storage cannot be read', () => {
    storage.getItem.mockImplementation(() => { throw new Error('SecurityError'); });
    expect(saveGame(game(), 42, []).ok).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('does not overwrite if backup fails from quota', () => {
    const raw = rawLegacy(); values.set(SAVE_KEY, raw);
    storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(saveGame(game(), 42, []).error).toContain('QuotaExceededError');
    expect(values.get(SAVE_KEY)).toBe(raw);
    expect(clearSave().ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(raw);
  });
  it('retains both original and backup if replacement fails after backup', () => {
    const raw = rawLegacy(); values.set(SAVE_KEY, raw);
    storage.setItem.mockImplementation((key, value) => {
      if (key === SAVE_KEY) throw new Error('QuotaExceededError');
      values.set(key, value);
    });
    expect(saveGame(game(), 42, []).ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(raw);
    expect(backups()[0].raw).toBe(raw);
  });
  it('archives before explicit restart and does not touch slots or record', () => {
    const raw = rawLegacy(); values.set(SAVE_KEY, raw);
    values.set(SLOT_KEYS[0], raw); values.set('cbs-record', '9');
    expect(clearSave().ok).toBe(true);
    expect(values.has(SAVE_KEY)).toBe(false);
    expect(values.get(SLOT_KEYS[0])).toBe(raw);
    expect(values.get('cbs-record')).toBe('9');
    expect(backups()[0].raw).toBe(raw);
  });
});

describe('manual slots and JSON', () => {
  it('stores three independent checkpoints, exports and loads them with backup', () => {
    expect(listSlots()).toHaveLength(3);
    for (const [i, key] of SLOT_KEYS.entries()) {
      const state = game(); state.day = i + 1;
      expect(saveGame(state, 42, []).ok).toBe(true);
      expect(saveSlot(key).ok).toBe(true);
    }
    expect(listSlots().map(s => s.data.payload.day)).toEqual([1, 2, 3]);
    expect(loadSlot(SLOT_KEYS[0]).ok).toBe(true);
    expect(readSave().day).toBe(1);
    expect(JSON.parse(exportSave(SLOT_KEYS[2]).raw).payload.day).toBe(3);
    expect(backups().length).toBeGreaterThan(0);
  });
  it('preserves an unreadable manual slot and invalid imports', () => {
    values.set(SAVE_KEY, rawLegacy()); values.set(SLOT_KEYS[0], '{broken');
    expect(saveSlot(SLOT_KEYS[0]).ok).toBe(false);
    expect(loadSlot(SLOT_KEYS[0]).ok).toBe(false);
    expect(importSave('{broken').ok).toBe(false);
    expect(values.get(SLOT_KEYS[0])).toBe('{broken');
    expect(readSave().day).toBe(3);
  });
  it('round trips JSON from v4 and v5 and retains preceding snapshots', () => {
    const raw = rawLegacy();
    expect(importSave(raw).ok).toBe(true);
    const v5 = exportSave().raw;
    expect(importSave(v5).ok).toBe(true);
    const state = game(); state.day++;
    expect(saveGame(state, 42, []).ok).toBe(true);
    const first = backups()[0];
    expect(importSave(raw).ok).toBe(true);
    expect(backups()).toContainEqual(first);
    expect([...values.keys()].filter(k => k.startsWith(BACKUP_PREFIX))).toHaveLength(2);
  });
  it('rejects oversized imports without writing', () => {
    expect(importSave(' '.repeat(MAX_SAVE_BYTES + 1)).ok).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('requires explicit recovery to replace protected data and archives the raw original', () => {
    const unknown = '{"version":99}'; values.set(SAVE_KEY, unknown);
    expect(importSave(rawLegacy()).ok).toBe(false);
    expect(importSave(rawLegacy(), { recoverProtected: true }).ok).toBe(true);
    expect(backups()[0].raw).toBe(unknown);
    expect(readSave().day).toBe(3);
  });
  it('does not recover protected data when archiving fails', () => {
    values.set(SAVE_KEY, '{broken');
    storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(importSave(rawLegacy(), { recoverProtected: true }).ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe('{broken');
  });
  it('reports empty/invalid slots', () => {
    expect(saveSlot('other').ok).toBe(false);
    expect(loadSlot(SLOT_KEYS[0]).ok).toBe(false);
    expect(saveSlot(SLOT_KEYS[0]).ok).toBe(false);
  });
});


function quota(bytes) {
  storage.setItem.mockImplementation((key, value) => {
    const next = new Map(values);
    next.set(key, String(value));
    const used = [...next].reduce((sum, [k, v]) => sum + 2 * (k.length + v.length), 0);
    if (used > bytes) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    values.set(key, String(value));
  });
}
function advance(day) {
  const state = game(); state.day = day;
  return saveGame(state, 42, []);
}
function rolling() { return backups().filter(entry => !entry.pinned); }
function oldArchive(id, raw = rawLegacy()) {
  const key = BACKUP_PREFIX + id;
  const value = JSON.stringify({ key: SAVE_KEY, raw, reason: 'legacy archive', savedAt: '2026-11-17T00:00:00Z' });
  values.set(key, value);
  return { key, value };
}

describe('bounded rotation and permanent retention', () => {
  it('runs 200 dawns within a finite quota and retains exactly the three latest checkpoints', () => {
    quota(16 * 1024);
    for (let day = 1; day <= 200; day++) expect(advance(day).ok).toBe(true);
    expect(readSave().day).toBe(200);
    expect(rolling()).toHaveLength(ROLLING_BACKUP_LIMIT);
    expect(rolling().map(entry => decodeSave(entry.raw).payload.day).sort((a, b) => a - b)).toEqual([197, 198, 199]);
    expect(values.size).toBe(4);
  }, 20000);
  it('does not create a backup or rewrite an unchanged v5 checkpoint on repeated reloads', () => {
    expect(advance(3).ok).toBe(true);
    const raw = values.get(SAVE_KEY);
    storage.setItem.mockClear();
    for (let i = 0; i < 10; i++) expect(advance(3).ok).toBe(true);
    expect(values.get(SAVE_KEY)).toBe(raw);
    expect(backups()).toHaveLength(0);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('retains a pinned backup byte-for-byte across later rotation', () => {
    for (let day = 1; day <= 4; day++) expect(advance(day).ok).toBe(true);
    const oldest = rolling().sort((a, b) => a.sequence - b.sequence)[0];
    expect(setBackupPinned(oldest.backupKey, true).ok).toBe(true);
    const pinned = values.get(oldest.backupKey);
    for (let day = 5; day <= 50; day++) expect(advance(day).ok).toBe(true);
    expect(values.get(oldest.backupKey)).toBe(pinned);
    expect(backups().find(entry => entry.backupKey === oldest.backupKey).pinned).toBe(true);
    expect(rolling()).toHaveLength(3);
  });
  it('keeps legacy, corrupt and future-format archives without hiding healthy backups', () => {
    const legacyArchive = oldArchive('legacy');
    const corruptKey = BACKUP_PREFIX + 'corrupt'; values.set(corruptKey, '{broken');
    const futureKey = BACKUP_PREFIX + 'future';
    const future = JSON.stringify({ format: 'last-refuge-backup', version: 99, key: SAVE_KEY,
      raw: rawLegacy(), reason: 'future', savedAt: '2026-11-17T00:00:00Z', pinned: false });
    values.set(futureKey, future);
    for (let day = 1; day <= 12; day++) expect(advance(day).ok).toBe(true);
    expect(values.get(legacyArchive.key)).toBe(legacyArchive.value);
    expect(values.get(corruptKey)).toBe('{broken');
    expect(values.get(futureKey)).toBe(future);
    expect(listBackups().ok).toBe(true);
    expect(backups().filter(entry => entry.pinned)).toHaveLength(3);
    expect(rolling()).toHaveLength(3);
  });
  it('permanently retains the original v4 migration and unknown recovery originals', () => {
    const v4 = '  ' + rawLegacy(); values.set(SAVE_KEY, v4);
    expect(advance(3).ok).toBe(true);
    const unknown = '{"version":99}'; values.set(SAVE_KEY, unknown);
    expect(importSave(rawLegacy(), { recoverProtected: true }).ok).toBe(true);
    for (let day = 4; day <= 12; day++) expect(advance(day).ok).toBe(true);
    for (const raw of [v4, unknown]) expect(backups().some(entry => entry.pinned && entry.raw === raw)).toBe(true);
  });
  it('only makes a legacy backup rotatable after an explicit unpin', () => {
    const archive = oldArchive('legacy');
    expect(backups()[0].pinned).toBe(true);
    expect(setBackupPinned(archive.key, false).ok).toBe(true);
    expect(backups()[0].pinned).toBe(false);
    for (let day = 1; day <= 10; day++) expect(advance(day).ok).toBe(true);
    expect(backups().some(entry => entry.raw === rawLegacy())).toBe(false);
    expect(rolling()).toHaveLength(3);
  });
  it('cleans excess explicitly unpinned legacy archives only after a successful primary write', () => {
    const archives = Array.from({ length: 6 }, (_, i) => {
      const data = legacy(); data.day = i + 10;
      const archive = oldArchive('legacy-' + i, JSON.stringify(data));
      expect(setBackupPinned(archive.key, false).ok).toBe(true);
      return archive;
    });
    expect(rolling()).toHaveLength(6);
    expect(advance(1).ok).toBe(true);
    expect(rolling()).toHaveLength(3);
    expect(archives.filter(archive => values.has(archive.key))).toHaveLength(3);
  });
  it('does not silently claim success when a pin update fails', () => {
    const archive = oldArchive('legacy');
    storage.setItem.mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    const result = setBackupPinned(archive.key, false);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Storage full');
    expect(values.get(archive.key)).toBe(archive.value);
    expect(backups()[0].pinned).toBe(true);
  });
  it('cannot make malformed or unknown-version save archives eligible for rotation', () => {
    const archive = oldArchive('unknown', '{"version":99}');
    expect(setBackupPinned(archive.key, false).ok).toBe(false);
    expect(values.get(archive.key)).toBe(archive.value);
    expect(backups()[0].pinned).toBe(true);
  });
  it('preserves the active save and every pin when storage is completely full', () => {
    for (let day = 1; day <= 4; day++) expect(advance(day).ok).toBe(true);
    const first = rolling()[0]; expect(setBackupPinned(first.backupKey, true).ok).toBe(true);
    const original = new Map(values);
    quota(1);
    const result = advance(5);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Storage full');
    expect(values).toEqual(original);
    expect(clearSave().ok).toBe(false);
    expect(values).toEqual(original);
  });
  it('protects the active save and pins if replacement fails after rotating an old archive', () => {
    for (let day = 1; day <= 5; day++) expect(advance(day).ok).toBe(true);
    expect(setBackupPinned(rolling()[0].backupKey, true).ok).toBe(true);
    expect(advance(6).ok).toBe(true);
    const active = values.get(SAVE_KEY);
    const pinned = backups().find(entry => entry.pinned);
    const pinnedBytes = values.get(pinned.backupKey);
    storage.setItem.mockImplementation((key, value) => {
      if (key === SAVE_KEY) throw new DOMException('full', 'QuotaExceededError');
      values.set(key, String(value));
    });
    expect(advance(7).ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(active);
    expect(values.get(pinned.backupKey)).toBe(pinnedBytes);
    expect(backups().some(entry => entry.raw === active)).toBe(true);
    expect(rolling()).toHaveLength(3);
  });
  it('reports a failed permanent pin without changing its prior retention state', () => {
    expect(advance(1).ok).toBe(true);
    expect(advance(2).ok).toBe(true);
    const entry = rolling()[0];
    const original = values.get(entry.backupKey);
    storage.setItem.mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    expect(setBackupPinned(entry.backupKey, true)).toMatchObject({ ok: false });
    expect(values.get(entry.backupKey)).toBe(original);
    expect(rolling()[0].pinned).toBe(false);
  });
  it('reports cleanup failure separately from a successful save and never touches pins', () => {
    const permanent = oldArchive('important');
    for (let i = 0; i < 5; i++) {
      const data = legacy(); data.day = i + 10;
      const archive = oldArchive('excess-' + i, JSON.stringify(data));
      expect(setBackupPinned(archive.key, false).ok).toBe(true);
    }
    storage.removeItem.mockImplementation(() => { throw new Error('cleanup unavailable'); });
    const result = advance(1);
    expect(result.ok).toBe(true);
    expect(result.warning).toContain('cleanup unavailable');
    expect(readSave().day).toBe(1);
    expect(values.get(permanent.key)).toBe(permanent.value);
    expect(rolling()).toHaveLength(5);
  });
  it('refuses rotation when a selected archive was pinned after the backup scan', () => {
    for (let day = 1; day <= 4; day++) expect(advance(day).ok).toBe(true);
    const selected = rolling().sort((a, b) => a.sequence - b.sequence)[0];
    const pinned = JSON.stringify({ ...JSON.parse(selected.stored), pinned: true });
    const original = values.get(SAVE_KEY);
    let reads = 0;
    storage.getItem.mockImplementation(key => {
      if (key === selected.backupKey && ++reads === 2) values.set(key, pinned);
      return values.get(key) ?? null;
    });
    expect(advance(5).ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(original);
    expect(values.get(selected.backupKey)).toBe(pinned);
  });
  it('preserves raw v4 data when actual map reconstruction fails', () => {
    const raw = rawLegacy(); values.set(SAVE_KEY, raw);
    vi.spyOn(mapgen, 'generateMap').mockImplementation(() => { throw new Error('Map reconstruction failed'); });
    expect(inspectSave().error).toContain('Map reconstruction failed');
    expect(importSave(raw).ok).toBe(false);
    expect(advance(4).ok).toBe(false);
    expect(clearSave().ok).toBe(false);
    expect(values.get(SAVE_KEY)).toBe(raw);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(exportSave().raw).toBe(raw);
  });
  it('rejects mixed legacy building IDs rather than creating duplicate IDs during restoration', () => {
    const data = legacy(); delete data.buildings[0].id;
    values.set(SAVE_KEY, JSON.stringify(data));
    expect(inspectSave().ok).toBe(false);
    expect(advance(4).ok).toBe(false);
    expect(JSON.parse(values.get(SAVE_KEY))).toEqual(data);
  });
});
