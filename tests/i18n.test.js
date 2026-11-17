import { afterEach, describe, expect, it, vi } from 'vitest';
import { BUILDING_DEFS, CATEGORIES } from '../src/buildings/definitions.js';
import { TECHS } from '../src/sim/research.js';
import { WEATHERS } from '../src/sim/weather.js';
import { t, getLocale, setLocale, initializeLocale, hasTranslation, LOCALE_KEY } from '../src/ui/i18n/index.js';
import { characterProfile, approvedPortrait } from '../src/ui/characterpanel.js';
import { createGameState, addBuilding, addSurvivor } from '../src/sim/state.js';
import { createSaveData, migrateSave, decodeSave, restoreSave } from '../src/persistence.js';

afterEach(() => { setLocale('zh-TW'); vi.restoreAllMocks(); });
describe('Traditional Chinese presentation catalog', () => {
  it('covers all building names/descriptions without changing simulation definitions', () => {
    const before = structuredClone(BUILDING_DEFS);
    for (const def of Object.values(BUILDING_DEFS)) {
      for (const text of [def.name, def.desc]) {
        expect(hasTranslation(text), text).toBe(true);
        expect(t(text)).toMatch(/[\u3400-\u9fff]/u);
        expect(t(text)).not.toBe(text);
      }
    }
    expect(BUILDING_DEFS).toEqual(before);
  });
  it('covers every technology, category, resource and weather label', () => {
    const labels = [...Object.values(TECHS).flatMap(tech => [tech.name, tech.desc]),
      ...CATEGORIES.map(category => category.name), ...Object.values(WEATHERS).map(weather => weather.name),
      'Food', 'Water', 'Wood', 'Metal', 'Energy', 'Fuel'];
    for (const label of labels) expect(hasTranslation(label), label).toBe(true);
    expect(t('Unlocks: Forester')).toBe('解鎖：植林站');
    expect(t('Extractor production +25%')).toBe('採集產量 +25%');
  });
  it('formats dynamic templates, nested labels and optional tooltip suffixes', () => {
    expect(t('Day {day}', { day: 12 })).toBe('第 12 天');
    expect(t('Day 12')).toBe('第 12 天');
    expect(t('89s')).toBe('89秒');
    expect(t('−6.7/d')).toBe('−6.7/天');
    expect(t('Slot 2: Day 3')).toBe('存檔槽 2：第 3 天');
    expect(t('🥫 Food — daily balance')).toBe('🥫 食物 — 每日收支');
    expect(t('Produces: ⚡ 8/day (day only)')).toBe('產出：⚡ 8/天（僅限白天）');
    expect(t('Weather: Rain — no effect')).toBe('天氣：下雨 — 無額外效果');
    expect(t('Laboratory ×2')).toBe('研究室 ×2');
    expect(t('Nights survived: 2 — Record: 3. The hordes have prevailed.')).toBe('撐過 2 夜 — 最佳紀錄：3 夜。 屍潮吞沒了這片防線。');
    expect(t('Day invalid diagnostic')).toBe('Day invalid diagnostic');
  });
  it('keeps English and deterministic missing-message fallback available', () => {
    setLocale('en');
    expect(t('Start game')).toBe('Start game');
    expect(t('Day {day}', { day: 3 })).toBe('Day 3');
    setLocale('zh-TW');
    expect(t('untranslated diagnostic <sample>')).toBe('untranslated diagnostic <sample>');
    expect(t('__proto__')).toBe('__proto__');
    expect(t('Day {day}')).toBe('第 {day} 天');
  });
  it('selects query, saved preference and default in order without touching game keys', () => {
    const values = new Map([['cbs-save', 'precious'], [LOCALE_KEY, 'en']]);
    const storage = { getItem: key => values.get(key) ?? null, setItem: vi.fn((key, value) => values.set(key, value)) };
    expect(initializeLocale('', storage)).toBe('en');
    expect(initializeLocale('?lang=zh-TW', storage)).toBe('zh-TW');
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(LOCALE_KEY, 'zh-TW');
    expect(initializeLocale('?lang=unsupported', storage)).toBe('zh-TW');
    expect(values.get('cbs-save')).toBe('precious');
    expect(setLocale('unsupported')).toBe('zh-TW');
  });
  it('does not stop gameplay when preference storage is blocked/full', () => {
    const storage = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } };
    expect(initializeLocale('?lang=en', storage)).toBe('en');
    expect(getLocale()).toBe('en');
    expect(initializeLocale('', storage)).toBe('zh-TW');
  });
});

describe('read-only character presentation and save compatibility', () => {
  const world = () => {
    const state = createGameState();
    const hq = addBuilding(state, 'hq', BUILDING_DEFS.hq, 30, 30);
    const survivor = addSurvivor(state);
    survivor.buildingId = hq.id;
    survivor.hunger = 24; survivor.thirst = 12;
    return { state, survivor };
  };
  it('adapts existing survivors without adding stats, portraits or translated IDs to the save', () => {
    const { state, survivor } = world();
    const before = structuredClone(state);
    expect(characterProfile(survivor, state)).toMatchObject({ name: '倖存者 #1', assignment: '工作地點：庇護所', hunger: 24, thirst: 12 });
    setLocale('en');
    expect(characterProfile(survivor, state).name).toBe('Survivor #1');
    expect(state).toEqual(before);
    const data = createSaveData(state, 42, []);
    expect(data.buildings[0].defId).toBe('hq');
    expect(data).not.toHaveProperty('locale');
    expect(data.survivors[0]).not.toHaveProperty('portrait');
  });
  it('preserves v4/v5 payloads and restored state across locales', () => {
    const { state } = world();
    const v4 = createSaveData(state, 42, []);
    const original = structuredClone(v4);
    const migrated = migrateSave(v4);
    setLocale('en');
    const english = restoreSave(decodeSave(JSON.stringify(migrated)));
    setLocale('zh-TW');
    const chinese = restoreSave(decodeSave(JSON.stringify(v4)));
    expect(v4).toEqual(original);
    expect(migrated.core).toEqual(v4);
    expect(chinese.state).toEqual(english.state);
    expect(chinese.seed).toBe(42);
  });
  it('supports an empty/idle roster and clamps display values without mutating the survivor', () => {
    const state = createGameState();
    const survivor = { id: 5, hunger: -10, thirst: 110, buildingId: null };
    expect(characterProfile(survivor, state)).toMatchObject({ assignment: '待命中', hunger: 0, thirst: 100 });
    expect(survivor.hunger).toBe(-10);
  });
  it('requires local artwork plus explicit license, attribution and alt text', () => {
    const valid = { src: 'assets/portraits/operator.webp', license: 'Original', credit: 'Project artist', alt: 'Operator portrait' };
    expect(approvedPortrait(valid)).toBe(valid);
    for (const invalid of [null, { ...valid, src: 'https://example.com/image.jpg' },
      { ...valid, src: 'assets/portraits/../image.jpg' }, { ...valid, license: 'unknown' },
      { ...valid, credit: '' }, { ...valid, alt: '' }]) expect(approvedPortrait(invalid)).toBeNull();
  });
});
