// Validated v5 dawn checkpoints with read-only v4 compatibility and archival writes.
// Pure data in/out — no DOM, no rendering: restoreSave rebuilds grid + state
// from the save data, saveGame serializes them back. The endless mode has no
// victory: the record is the number of nights survived, kept apart from the
// save so it survives restarts.

import {
  CONFIG,
  MAX_LEVEL,
  createGameState,
  addBuilding,
  addSurvivor,
} from './sim/state.js';
import { levelMultiplier, effectiveCaps } from './sim/economy.js';
import { GRID_SIZE, createGrid, occupy, occupyTrap, getCell } from './world/grid.js';
import { generateMap } from './world/mapgen.js';
import { BUILDING_DEFS, getDef } from './buildings/definitions.js';
import { TECHS } from './sim/research.js';

export const SAVE_KEY = 'cbs-save';
export const SAVE_VERSION = 5;
export const SLOT_KEYS = [1, 2, 3].map(n => `cbs-slot-${n}`);
export const BACKUP_PREFIX = 'cbs-backup:';
export const MAX_SAVE_BYTES = 2 * 1024 * 1024;
export const RECORD_KEY = 'cbs-record'; // best nights survived, across runs
const RESOURCE_KEYS = ['food', 'water', 'wood', 'metal', 'energy', 'fuel'];

// Best run (nights survived), persisted apart from the save so it survives
// restarts; 0 when no record exists or storage is unavailable.
export function readRecord() {
  try {
    const n = Number.parseInt(localStorage.getItem(RECORD_KEY), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeRecord(n) {
  try {
    localStorage.setItem(RECORD_KEY, String(n));
  } catch {
    // Storage unavailable: the record just won't persist.
  }
}

// Every operation returns an explicit result. No failed read is treated as empty.
const fail = (error) => ({ ok: false, error: String(error.message ?? error) });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);

/** Validate before restoration, rejecting data the legacy loader would discard. */
export function validateSave(data) {
  assert(object(data) && data.version === 4, 'Unsupported save payload version.');
  assert(Number.isSafeInteger(data.seed), 'Invalid map seed.');
  assert(Number.isSafeInteger(data.day) && data.day >= 1, 'Invalid day.');
  assert(object(data.resources), 'Invalid resources.');
  for (const [key, value] of Object.entries(data.resources)) {
    assert(RESOURCE_KEYS.includes(key) && finite(value), 'Invalid resource value.');
  }
  for (const key of ['researchPoints', 'kills', 'reputation']) {
    assert(data[key] === undefined || finite(data[key]), `Invalid ${key}.`);
  }
  assert(data.researched === undefined || (Array.isArray(data.researched) &&
    data.researched.every(id => Object.hasOwn(TECHS, id))), 'Unknown research.');
  assert(Array.isArray(data.buildings) && data.buildings.length <= GRID_SIZE ** 2,
    'Invalid buildings.');
  const ids = new Set();
  const occupied = new Set();
  let refuges = 0;
  for (const b of data.buildings) {
    assert(object(b) && Object.hasOwn(BUILDING_DEFS, b.defId), 'Unknown building.');
    const def = getDef(b.defId);
    if (b.defId === 'hq') refuges++;
    assert(Number.isInteger(b.x) && Number.isInteger(b.z) && b.x >= 0 && b.z >= 0 &&
      b.x + def.w <= GRID_SIZE && b.z + def.h <= GRID_SIZE, 'Building outside map.');
    if (b.id !== undefined) {
      assert(Number.isSafeInteger(b.id) && b.id > 0 && !ids.has(b.id), 'Invalid/duplicate building ID.');
      ids.add(b.id);
    }
    for (let z = b.z; z < b.z + def.h; z++) {
      for (let x = b.x; x < b.x + def.w; x++) {
        const tile = `${x},${z}`;
        assert(!occupied.has(tile), 'Overlapping buildings.');
        occupied.add(tile);
      }
    }
    for (const key of ['hp', 'extracted', 'efficiency']) {
      assert(b[key] === undefined || finite(b[key]), `Invalid building ${key}.`);
    }
    for (const key of ['autoAssign', 'enabled', 'repairing']) {
      assert(b[key] === undefined || typeof b[key] === 'boolean', `Invalid building ${key}.`);
    }
    assert(b.level === undefined || (Number.isInteger(b.level) && b.level >= 1 && b.level <= MAX_LEVEL), 'Invalid level.');
    assert(b.priority === undefined || (Number.isInteger(b.priority) && b.priority >= 0 && b.priority <= 2), 'Invalid priority.');
  }
  assert(refuges === 1, 'Save must contain exactly one Refuge.');
  assert(data.survivors === undefined || (Array.isArray(data.survivors) && data.survivors.length <= 10000), 'Invalid survivors.');
  const survivors = new Set();
  for (const s of data.survivors ?? []) {
    assert(object(s), 'Invalid survivor.');
    assert(Number.isSafeInteger(s.id) && s.id > 0 && !survivors.has(s.id), 'Invalid/duplicate survivor ID.');
    survivors.add(s.id);
    for (const key of ['hunger', 'thirst']) assert(s[key] === undefined || finite(s[key]), `Invalid ${key}.`);
    assert(s.buildingId == null || ids.has(s.buildingId), 'Unknown workplace.');
  }
  assert(data.changedTiles === undefined || (Array.isArray(data.changedTiles) && data.changedTiles.length <= GRID_SIZE ** 2), 'Invalid changed tiles.');
  for (const t of data.changedTiles ?? []) {
    assert(object(t) && Number.isInteger(t.x) && Number.isInteger(t.z) &&
      t.x >= 0 && t.z >= 0 && t.x < GRID_SIZE && t.z < GRID_SIZE &&
      ['grass', 'forest', 'trail'].includes(t.toType), 'Invalid changed tile.');
  }
  return data;
}

/** Pure migration: does not mutate the input or touch storage. */
export function migrateSave(data) {
  if (data?.version === SAVE_VERSION) {
    assert(data.format === 'last-refuge' && data.checkpoint === 'dawn' &&
      typeof data.savedAt === 'string' && Number.isFinite(Date.parse(data.savedAt)), 'Invalid save envelope.');
    validateSave(data.payload);
    return structuredClone(data);
  }
  validateSave(data);
  return {
    format: 'last-refuge', version: SAVE_VERSION, checkpoint: 'dawn',
    savedAt: new Date().toISOString(), payload: structuredClone(data),
  };
}

export function decodeSave(raw) {
  assert(typeof raw === 'string' && new Blob([raw]).size <= MAX_SAVE_BYTES, 'Save exceeds 2 MiB limit.');
  const envelope = migrateSave(JSON.parse(raw));
  // Exercise the same reconstruction used by the game before committing data.
  restoreSave(envelope.payload);
  return envelope;
}

export function inspectSave(key = SAVE_KEY) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { ok: true, empty: true };
    try { return { ok: true, raw, data: decodeSave(raw) }; }
    catch (error) { return { ...fail(error), raw }; }
  } catch (error) { return fail(error); }
}

/** Immutable, byte-for-byte backup. A quota failure prevents the replacement. */
function backup(key, raw, reason) {
  const id = `${BACKUP_PREFIX}${crypto.randomUUID()}`;
  assert(localStorage.getItem(id) === null, 'Backup ID collision; original retained.');
  const value = JSON.stringify({ key, raw, reason, savedAt: new Date().toISOString() });
  localStorage.setItem(id, value);
  assert(localStorage.getItem(id) === value, 'Backup verification failed.');
  return id;
}

function writeSave(key, raw, reason, recoverProtected = false) {
  try {
    decodeSave(raw);
    const previous = inspectSave(key);
    assert(previous.ok || (recoverProtected && typeof previous.raw === 'string'), `Existing save protected: ${previous.error}`);
    if (previous.raw === raw) return { ok: true };
    if (!previous.empty) backup(key, previous.raw, reason);
    localStorage.setItem(key, raw);
    assert(localStorage.getItem(key) === raw, 'Save verification failed; recover from backup.');
    return { ok: true };
  } catch (error) { return fail(error); }
}

// Restart/defeat archive known data before removal; unrecognized data stays put.
export function clearSave() {
  try {
    const existing = inspectSave();
    assert(existing.ok, `Existing save protected: ${existing.error}`);
    if (!existing.empty) {
      backup(SAVE_KEY, existing.raw, 'restart/defeat');
      localStorage.removeItem(SAVE_KEY);
    }
    return { ok: true };
  } catch (error) { return fail(error); }
}

export function readSave() {
  const result = inspectSave();
  return result.ok && !result.empty ? result.data.payload : null;
}

export function listSlots() { return SLOT_KEYS.map(key => ({ key, ...inspectSave(key) })); }
export function saveSlot(slot) {
  if (!SLOT_KEYS.includes(slot)) return fail('Invalid slot.');
  const current = inspectSave();
  if (!current.ok || current.empty) return fail(current.error ?? 'No dawn checkpoint available.');
  return writeSave(slot, JSON.stringify(current.data), 'manual slot replacement');
}
export function loadSlot(slot) {
  if (!SLOT_KEYS.includes(slot)) return fail('Invalid slot.');
  const current = inspectSave(slot);
  if (!current.ok || current.empty) return fail(current.error ?? 'Slot is empty.');
  return writeSave(SAVE_KEY, JSON.stringify(current.data), 'load manual slot');
}
export function importSave(raw, { recoverProtected = false } = {}) {
  try { return writeSave(SAVE_KEY, JSON.stringify(decodeSave(raw)), 'JSON import', recoverProtected); }
  catch (error) { return fail(error); }
}
// Export raw bytes even when unknown/corrupt; recovery must remain possible.
export function exportSave(key = SAVE_KEY) {
  try {
    const raw = localStorage.getItem(key);
    assert(raw !== null, 'No save available.');
    return { ok: true, raw };
  } catch (error) { return fail(error); }
}
export function listBackups() {
  try {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) entries.push({ backupKey: key, ...JSON.parse(localStorage.getItem(key)) });
    }
    return { ok: true, entries };
  } catch (error) { return fail(error); }
}

// Serialize the legacy-compatible payload. Only call at dawn; combat is not serialized.
export function createSaveData(state, seed, changedTiles) {
  return {
    version: 4,
    seed,
    day: state.day,
    resources: { ...state.resources },
    survivors: state.survivors.map((s) => ({
      id: s.id,
      hunger: s.hunger,
      thirst: s.thirst,
      buildingId: s.buildingId,
    })),
    buildings: state.buildings.map((b) => ({
      id: b.id,
      defId: b.defId,
      x: b.x,
      z: b.z,
      hp: Math.round(b.hp),
      workers: [...b.workers],
      autoAssign: b.autoAssign,
      extracted: b.extracted,
      efficiency: b.efficiency,
      enabled: b.enabled !== false,
      repairing: b.repairing === true,
      priority: b.priority ?? 1,
      level: b.level ?? 1,
    })),
    changedTiles: changedTiles.map((t) => ({ ...t })),
    researchPoints: state.researchPoints,
    researched: [...state.researched],
    kills: state.kills,
    reputation: state.reputation ?? 0,
  };
}

export function saveGame(state, seed, changedTiles) {
  try {
    const data = migrateSave(createSaveData(state, seed, changedTiles));
    return writeSave(SAVE_KEY, JSON.stringify(data), 'autosave/migration');
  } catch (error) { return fail(error); }
}

// Rebuilds grid + state from a v4 save. Throws on inconsistent data; the
// caller falls back to a fresh game. Changed tiles are replayed onto the
// freshly generated grid, so buildTerrain (which runs after this) renders
// them natively.
export function restoreSave(data) {
  const grid = generateMap(createGrid(), data.seed);
  const state = createGameState();
  state.mapSeed = data.seed;

  if (typeof data.day === 'number' && data.day >= 1) {
    state.day = Math.floor(data.day);
  }
  if (data.resources && typeof data.resources === 'object') {
    for (const key of RESOURCE_KEYS) {
      if (typeof data.resources[key] === 'number') {
        // Lower clamp only: the upper one waits for the buildings below
        // (their capBonus raises the ceiling — see the effectiveCaps pass).
        state.resources[key] = Math.max(0, data.resources[key]);
      }
    }
  }
  if (typeof data.researchPoints === 'number') {
    state.researchPoints = Math.max(0, data.researchPoints);
  }
  if (Array.isArray(data.researched)) {
    state.researched = data.researched.filter((id) => typeof id === 'string');
  }
  if (typeof data.kills === 'number' && data.kills >= 0) {
    state.kills = Math.floor(data.kills);
  }
  // deathsToday non è persistito: riparte da 0 (createGameState).
  if (typeof data.reputation === 'number') {
    state.reputation = Math.min(100, Math.max(0, data.reputation));
  }

  // Tiles changed by extraction/planting since mapgen.
  const changedTiles = [];
  if (Array.isArray(data.changedTiles)) {
    for (const t of data.changedTiles) {
      if (!Number.isInteger(t?.x) || !Number.isInteger(t?.z)) continue;
      if (t.toType !== 'grass' && t.toType !== 'forest' && t.toType !== 'trail') continue;
      const cell = getCell(grid, t.x, t.z);
      if (!cell) continue;
      cell.type = t.toType;
      cell.walkable = true; // grass, (planted) forest and trails are all walkable
      changedTiles.push({ x: t.x, z: t.z, toType: t.toType });
    }
  }

  // Buildings keep their saved ids so the survivor ↔ workplace links (and
  // the worker rosters rebuilt below) stay valid across the reload.
  let maxBuildingId = 0;
  for (const b of data.buildings) {
    const def = getDef(b?.defId);
    if (!def || !Number.isInteger(b.x) || !Number.isInteger(b.z)) continue;
    const building = addBuilding(state, b.defId, def, b.x, b.z);
    if (Number.isInteger(b.id) && b.id > 0) {
      building.id = b.id;
      maxBuildingId = Math.max(maxBuildingId, b.id);
    }
    building.autoAssign = b.autoAssign !== false;
    // v4 fields added later: default to on / not repairing / normal
    // priority / level 1 on old saves.
    building.enabled = b.enabled !== false;
    building.repairing = b.repairing === true;
    if (Number.isInteger(b.priority)) {
      building.priority = Math.min(Math.max(b.priority, 0), 2);
    }
    if (Number.isInteger(b.level)) {
      building.level = Math.min(Math.max(b.level, 1), MAX_LEVEL);
    }
    // maxHp follows the level (hp saved as-is: niente cura all'upgrade qui).
    building.maxHp = def.hp * levelMultiplier(building.level);
    building.hp = building.maxHp;
    if (typeof b.hp === 'number' && b.hp > 0) {
      building.hp = Math.min(b.hp, building.maxHp);
    }
    if (typeof b.extracted === 'number') building.extracted = b.extracted;
    if (typeof b.efficiency === 'number') building.efficiency = b.efficiency;
    if (def.isTrap) {
      // Traps keep the tile walkable: restore the trap mark, not an occupation.
      occupyTrap(grid, b.x, b.z, building.id);
    } else {
      occupy(grid, b.x, b.z, building.w, building.h, building.id, def.isRoad === true);
    }
  }
  state.nextBuildingId = Math.max(state.nextBuildingId, maxBuildingId + 1);
  if (!state.buildings.some((b) => b.defId === 'hq')) {
    throw new Error('Save without a Refuge');
  }

  // Upper clamp on the restored resources, now that the buildings are back:
  // the effective caps (base + storage bonuses) are the ceiling the HUD
  // shows, so a stock saved above the base cap survives the reload.
  const effCaps = effectiveCaps(state, BUILDING_DEFS);
  for (const key of RESOURCE_KEYS) {
    state.resources[key] = Math.min(
      effCaps[key] ?? Infinity,
      state.resources[key] ?? 0
    );
  }

  // Survivors keep their saved ids and reconnect to their workplace via
  // the saved buildingId.
  const buildingIds = new Set(state.buildings.map((b) => b.id));
  const saved = Array.isArray(data.survivors) ? data.survivors : [];
  let maxSurvivorId = 0;
  for (const s of saved) {
    const survivor = addSurvivor(state);
    if (Number.isInteger(s?.id) && s.id > 0) {
      survivor.id = s.id;
      maxSurvivorId = Math.max(maxSurvivorId, s.id);
    }
    if (typeof s?.hunger === 'number') survivor.hunger = s.hunger;
    if (typeof s?.thirst === 'number') survivor.thirst = s.thirst;
    if (Number.isInteger(s?.buildingId) && buildingIds.has(s.buildingId)) {
      survivor.buildingId = s.buildingId;
    }
  }
  state.nextSurvivorId = Math.max(state.nextSurvivorId, maxSurvivorId + 1);
  if (state.survivors.length === 0) {
    for (let i = 0; i < CONFIG.startSurvivors; i++) addSurvivor(state);
  }

  // Worker rosters are rebuilt from the survivors' buildingId (single source
  // of truth), capped at the definition's job slots; the overflow goes idle.
  for (const b of state.buildings) {
    const def = getDef(b.defId);
    const slots = def?.jobs ?? 0;
    b.workers = [];
    for (const s of state.survivors) {
      if (s.buildingId !== b.id) continue;
      if (b.workers.length < slots) b.workers.push(s.id);
      else s.buildingId = null;
    }
  }

  return { grid, state, seed: data.seed, changedTiles };
}
