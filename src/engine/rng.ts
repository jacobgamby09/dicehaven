const UINT32_RANGE = 4_294_967_296;

export interface RandomStep {
  seed: number;
  value: number;
}

export function nextRandom(seed: number): RandomStep {
  const nextSeed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;

  return {
    seed: nextSeed,
    value: nextSeed / UINT32_RANGE,
  };
}

export function randomIndex(seed: number, length: number): RandomStep {
  if (length <= 0) {
    throw new Error("Cannot choose from an empty collection.");
  }

  const step = nextRandom(seed);

  return {
    seed: step.seed,
    value: Math.floor(step.value * length),
  };
}

