import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareRecruitment } from './recruit.mjs';

const archetypeId = 'chr_recruit_akane';
const allowed = new Set([archetypeId]);
const intent = { runId: 'run-a', archetypeId, generation: 3 };
const original = () => ({
  runId: 'run-a', generation: 3, capacity: 5, nextSurvivorId: 12,
  resources: { food: 36, water: 26 }, unlocked: [archetypeId], receipts: {},
  residents: ['chr_isumi_rin', 'chr_tachibana_yuma', 'chr_satsuki', 'chr_ren']
    .map((archetypeId, index) => ({ id: index + 1, uid: `run-a:${index + 1}`, archetypeId })),
});
const prepare = (state, request = intent) => prepareRecruitment(state, request, allowed);

test('one prepared change preserves four originals and proposes exactly one cost and ID', () => {
  const initial = original();
  const result = prepare(initial);
  assert.equal(result.status, 'prepared');
  assert.deepEqual(initial, original());
  assert.deepEqual(result.checkpoint.residents.slice(0, 4), initial.residents);
  assert.deepEqual(result.checkpoint.residents[4], { id: 12, uid: 'run-a:12', archetypeId });
  assert.deepEqual(result.checkpoint.resources, { food: 31, water: 21 });
  assert.equal(result.checkpoint.nextSurvivorId, 13);
});

test('serializing and removing the recruit does not allow another claim', () => {
  const state = JSON.parse(JSON.stringify(prepare(original()).checkpoint));
  state.residents.pop();
  assert.deepEqual(prepare(state), { status: 'already-claimed', checkpoint: state });
});

test('capacity, the strict post-cost floor, and locked states do not change the checkpoint', () => {
  for (const [patch, expected] of [
    [{ capacity: 4 }, 'no-capacity'],
    [{ resources: { food: 35, water: 26 } }, 'insufficient-stock'],
    [{ resources: { food: 36, water: 25 } }, 'insufficient-stock'],
    [{ unlocked: [] }, 'locked'],
  ]) {
    const state = { ...original(), ...patch };
    assert.deepEqual(prepare(state), { status: expected, checkpoint: state });
  }
});

test('different runs, stale generations, advisor or legacy templates, and exhausted IDs fail closed', () => {
  const state = original();
  for (const [patch, expected] of [
    [{ runId: 'run-b' }, 'invalid-request'],
    [{ generation: 2 }, 'stale'],
    [{ archetypeId: 'advisor.mio' }, 'invalid-request'],
    [{ archetypeId: 'chr_asagiri_mio' }, 'invalid-request'],
  ]) {
    assert.deepEqual(prepare(state, { ...intent, ...patch }), { status: expected, checkpoint: state });
  }
  const exhausted = { ...state, nextSurvivorId: Number.MAX_SAFE_INTEGER };
  assert.deepEqual(prepare(exhausted), { status: 'invalid-request', checkpoint: exhausted });
});

test('discarding an uncommitted candidate allows a retry with the same ID and original values', () => {
  const state = original();
  const first = prepare(state);
  assert.deepEqual(prepare(state), first);
  assert.deepEqual(state, original());
});
