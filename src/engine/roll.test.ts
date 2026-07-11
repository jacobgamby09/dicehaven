import { describe, expect, it } from "vitest";
import {
  createGatheringDieInstance,
  createStarterGatheringDie,
  getGatheringDice,
  getGatheringDieFaces,
  getTierTwoGatheringRecipe,
} from "./content";
import { resolveRoll } from "./roll";

function createDice(skill: "woodcutting" | "mining", count = 1, upgrade = 0) {
  const inventory = Array.from({ length: count }, (_, index) =>
    createStarterGatheringDie(skill, index + 1, index === 0 ? upgrade : 0),
  );
  return getGatheringDice(
    inventory,
    inventory.map((instance) => instance.id),
  );
}

describe("resolveRoll", () => {
  it("returns identical outcomes for identical seeds and inputs", () => {
    const dice = createDice("woodcutting");
    const first = resolveRoll(42, 1, dice);
    const second = resolveRoll(42, 1, dice);

    expect(first).toEqual(second);
  });

  it("keeps resource gains non-negative", () => {
    const outcome = resolveRoll(1, 1, createDice("woodcutting"));

    expect(outcome.event.gains.wood).toBeGreaterThanOrEqual(0);
    expect(outcome.event.gains.oak).toBe(0);
    expect(outcome.event.gains.stone).toBe(0);
    expect(outcome.event.gains.copper).toBe(0);
  });

  it("starts Woodcutting with exactly one deliberately weak die", () => {
    const dice = createDice("woodcutting");

    expect(dice).toHaveLength(1);
    expect(dice[0].name).toBe("Dull Axe");
    expect(dice[0].faces.map((face) => (face.type === "produce" ? face.amount : -1))).toEqual([
      0, 0, 0, 1, 1, 1,
    ]);
  });

  it("applies six visible upgrades to one physical die", () => {
    const axe = createStarterGatheringDie("woodcutting", 1, 6);

    expect(getGatheringDieFaces(axe).map((face) => face.amount)).toEqual([
      1, 1, 1, 2, 2, 2,
    ]);
  });

  it("makes Tier 2 dice specialists instead of pure-output replacements", () => {
    const oakheartAxe = createGatheringDieInstance(
      "woodcutting",
      "oakheartAxe",
      2,
    );
    const faces = getGatheringDieFaces(oakheartAxe);

    expect(faces.map((face) => face.resource)).toEqual([
      "wood", "oak", "wood", "oak", "wood", "oak",
    ]);
    expect(faces.map((face) => face.amount)).toEqual([1, 0, 1, 1, 2, 1]);
  });

  it("improves Tier 2 rare-resource faces through its own ladder", () => {
    const copperDie = createGatheringDieInstance(
      "mining",
      "copperProspector",
      2,
      6,
    );
    const faces = getGatheringDieFaces(copperDie);

    expect(faces.map((face) => face.amount)).toEqual([2, 1, 2, 2, 3, 2]);
    expect(faces.filter((face) => face.resource === "copper").map((face) => face.amount)).toEqual([
      1, 2, 2,
    ]);
  });

  it("avoids a Tier 2 bootstrap deadlock in specialist recipes", () => {
    const oakRecipe = getTierTwoGatheringRecipe("woodcutting");
    const copperRecipe = getTierTwoGatheringRecipe("mining");

    expect(oakRecipe.cost.oak).toBeUndefined();
    expect(copperRecipe.cost.copper).toBeUndefined();
    expect(oakRecipe.cost.monsterParts).toBeGreaterThan(0);
    expect(copperRecipe.cost.monsterParts).toBeGreaterThan(0);
  });

  it("keeps upgrades attached to their physical die", () => {
    const first = createStarterGatheringDie("mining", 1, 3);
    const second = createStarterGatheringDie("mining", 2, 0);
    const dice = getGatheringDice([first, second], [first.id, second.id]);

    expect(dice).toHaveLength(2);
    expect(dice[0].faces.map((face) => (face.type === "produce" ? face.amount : -1))).toEqual([
      1, 1, 1, 1, 1, 1,
    ]);
    expect(dice[1].faces.map((face) => (face.type === "produce" ? face.amount : -1))).toEqual([
      0, 0, 0, 1, 1, 1,
    ]);
  });
});
