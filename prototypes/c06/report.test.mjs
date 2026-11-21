import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareDawn, readReport } from './report.mjs';

const initial = () => ({ runId: 'run-a', day: 1, reports: {} });
const dawn = { runId: 'run-a', day: 2 };

test('duplicate dawn after serialization does not capture again', () => {
  const first = prepareDawn(initial(), dawn, () => ({ food: 0, residents: [17] }));
  const reloaded = JSON.parse(JSON.stringify(first));
  assert.equal(prepareDawn(reloaded, dawn, assert.fail), reloaded);
  assert.equal(Object.keys(reloaded.reports).length, 1);
});

test('historical read is isolated from input, callers, later dawns, and other runs', () => {
  const source = { buildingIds: [9] };
  const first = prepareDawn(initial(), dawn, () => source);
  const next = prepareDawn(first, { ...dawn, day: 3 }, () => ({}));
  source.buildingIds.push(10);
  const report = readReport(next, 'run-a', 2);
  report.snapshot.buildingIds.push(11);
  assert.deepEqual(readReport(next, 'run-a', 2).snapshot.buildingIds, [9]);
  assert.equal(report.id, JSON.stringify(['run-a', 2]));
  assert.equal(readReport(next, 'run-b', 2), null);
  assert.equal(readReport(next, 'run-a', 4), null);
});

test('preparation failure or discarded write leaves prior data available for retry', () => {
  const checkpoint = initial();
  assert.throws(() => prepareDawn(checkpoint, dawn, () => { throw new Error('capture failed'); }));
  prepareDawn(checkpoint, dawn, () => ({ food: 3 })); // proposed write discarded
  assert.deepEqual(checkpoint, initial());
  const retry = prepareDawn(checkpoint, dawn, () => ({ food: 3 }));
  assert.equal(readReport(retry, 'run-a', 2).snapshot.food, 3);
});

test('rejects invalid identity and out-of-sequence dawn before capture', () => {
  for (const candidate of [{ ...dawn, runId: 'run-b' }, { ...dawn, day: 3 }, { ...dawn, day: 1 }]) {
    assert.throws(() => prepareDawn(initial(), candidate, assert.fail), /dawn/);
  }
});
