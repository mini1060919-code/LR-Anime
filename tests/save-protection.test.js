import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import {
  SAVE_KEY, SLOT_KEYS, BACKUP_PREFIX, createSaveData, migrateSave, decodeSave,
  inspectSave, readSave, restoreSave, saveGame, clearSave, saveSlot, loadSlot,
  importSave, exportSave, listBackups, listSlots, MAX_SAVE_BYTES,
} from '../src/persistence.js';
import { createGameState, addBuilding, addSurvivor } from '../src/sim/state.js';
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
afterEach(() => vi.unstubAllGlobals());

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
  it('round trips JSON from v4 and v5 and keeps multiple immutable backups', () => {
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
