// Isolated proposal. The caller owns catalog validation and atomic persistence.
const cost = 5;

export function prepareRecruitment(checkpoint, intent, allowedArchetypes) {
  const { runId, archetypeId, generation } = intent;
  const keep = status => ({ status, checkpoint });
  if (runId !== checkpoint.runId || !allowedArchetypes.has(archetypeId)) {
    return keep('invalid-request');
  }

  const key = JSON.stringify([runId, archetypeId]);
  if (Object.hasOwn(checkpoint.receipts, key)) return keep('already-claimed');
  if (generation !== checkpoint.generation) return keep('stale');
  if (!checkpoint.unlocked.includes(archetypeId)) return keep('locked');
  if (checkpoint.residents.length >= checkpoint.capacity) return keep('no-capacity');

  const { food, water } = checkpoint.resources;
  if (!(Number.isFinite(food) && Number.isFinite(water) && food - cost > 30 && water - cost > 20)) {
    return keep('insufficient-stock');
  }
  const id = checkpoint.nextSurvivorId;
  if (!Number.isSafeInteger(id) || id <= 0 || id >= Number.MAX_SAFE_INTEGER ||
      checkpoint.residents.some(resident => resident.id >= id)) {
    return keep('invalid-request');
  }

  const resident = { id, uid: `${runId}:${id}`, archetypeId };
  return {
    status: 'prepared',
    checkpoint: {
      ...checkpoint,
      generation: checkpoint.generation + 1,
      nextSurvivorId: id + 1,
      residents: [...checkpoint.residents, resident],
      resources: { ...checkpoint.resources, food: food - cost, water: water - cost },
      receipts: { ...checkpoint.receipts, [key]: resident.uid },
    },
  };
}
