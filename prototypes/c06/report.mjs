// Isolated model of an atomic checkpoint and report write. No game import or storage.
export function prepareDawn(checkpoint, dawn, capture) {
  const { runId, day } = dawn;
  if (typeof runId !== 'string' || runId.length === 0 ||
      !Number.isSafeInteger(day) || day < 2 || runId !== checkpoint.runId) {
    throw new Error('Invalid dawn identity');
  }

  const id = JSON.stringify([runId, day]);
  if (Object.hasOwn(checkpoint.reports, id)) return checkpoint;
  if (day !== checkpoint.day + 1) throw new Error('Unexpected dawn sequence');

  return {
    ...checkpoint,
    day,
    reports: {
      ...checkpoint.reports,
      [id]: { id, day, snapshot: structuredClone(capture()) },
    },
  };
}

export function readReport(checkpoint, runId, day) {
  if (checkpoint.runId !== runId) return null;
  return structuredClone(checkpoint.reports[JSON.stringify([runId, day])] ?? null);
}
