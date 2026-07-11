import { randomIndex } from "./rng";

export type ResourceId =
  | "wood"
  | "oak"
  | "stone"
  | "copper"
  | "monsterParts";

export type DieFace =
  | { type: "produce"; resource: ResourceId; amount: number }
  | { type: "boost"; amount: number };

export interface DieDefinition {
  id: string;
  name: string;
  material: "wood" | "oak" | "stone" | "copper" | "arcane";
  faces: readonly DieFace[];
}

export interface DieResult {
  dieId: string;
  dieName: string;
  material: DieDefinition["material"];
  faceIndex: number;
  face: DieFace;
  finalAmount: number;
  boostedBy: number;
}

export interface RollModifier {
  sourceDieId: string;
  type: "boost";
  amount: number;
  targetDieIds: string[];
}

export interface RollEvent {
  id: number;
  results: DieResult[];
  modifiers: RollModifier[];
  gains: Record<ResourceId, number>;
}

export interface RollOutcome {
  nextSeed: number;
  event: RollEvent;
}

const EMPTY_GAINS: Record<ResourceId, number> = {
  wood: 0,
  oak: 0,
  stone: 0,
  copper: 0,
  monsterParts: 0,
};

export function resolveRoll(
  seed: number,
  eventId: number,
  dice: readonly DieDefinition[],
): RollOutcome {
  let nextSeed = seed;

  const results = dice.map<DieResult>((die) => {
    const step = randomIndex(nextSeed, die.faces.length);
    nextSeed = step.seed;
    const faceIndex = step.value;
    const face = die.faces[faceIndex];

    return {
      dieId: die.id,
      dieName: die.name,
      material: die.material,
      faceIndex,
      face,
      finalAmount: face.type === "produce" ? face.amount : face.amount,
      boostedBy: 0,
    };
  });

  const modifiers: RollModifier[] = [];

  for (const supportResult of results) {
    if (supportResult.face.type !== "boost" || supportResult.face.amount <= 0) {
      continue;
    }

    const targets = results.filter(
      (result) => result.face.type === "produce" && result.finalAmount > 0,
    );

    for (const target of targets) {
      target.finalAmount += supportResult.face.amount;
      target.boostedBy += supportResult.face.amount;
    }

    if (targets.length > 0) {
      modifiers.push({
        sourceDieId: supportResult.dieId,
        type: "boost",
        amount: supportResult.face.amount,
        targetDieIds: targets.map((target) => target.dieId),
      });
    }
  }

  const gains = { ...EMPTY_GAINS };

  for (const result of results) {
    if (result.face.type === "produce") {
      gains[result.face.resource] += result.finalAmount;
    }
  }

  return {
    nextSeed,
    event: {
      id: eventId,
      results,
      modifiers,
      gains,
    },
  };
}
