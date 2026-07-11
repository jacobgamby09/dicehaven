import { describe, expect, it } from "vitest";
import {
  BANDIT_SCOUT,
  COMBAT_DICE,
  DIRE_WOLF,
  FOREST_BRUTE,
  FOREST_WOLF,
  WILD_BOAR,
} from "./combat";
import {
  simulateCombatEncounter,
  simulateCombatMatchup,
} from "./combatSimulation";

describe("combat balance simulation", () => {
  it("is deterministic for a fixed seed and matchup", () => {
    const loadout = [COMBAT_DICE.trainingSword, COMBAT_DICE.woodenShield];

    expect(simulateCombatEncounter(42, loadout, FOREST_WOLF)).toEqual(
      simulateCombatEncounter(42, loadout, FOREST_WOLF),
    );
  });

  it("keeps the crafted Sword + Shield loadout viable in Forest Edge", () => {
    const loadout = [COMBAT_DICE.trainingSword, COMBAT_DICE.woodenShield];

    for (const enemy of [FOREST_WOLF, WILD_BOAR, BANDIT_SCOUT]) {
      const result = simulateCombatMatchup(loadout, enemy);
      expect(result.winRate).toBeGreaterThanOrEqual(0.7);
      expect(result.medianVictoryMs).not.toBeNull();
    }
  });

  it("makes Forest Brute a gear check that a Level 3 drop can solve", () => {
    const craftedOnly = [
      COMBAT_DICE.trainingSword,
      COMBAT_DICE.woodenShield,
      COMBAT_DICE.trainingSword,
    ];
    const dropLoadout = [
      COMBAT_DICE.trainingSword,
      COMBAT_DICE.woodenShield,
      COMBAT_DICE.wolfFang,
    ];
    const craftedResult = simulateCombatMatchup(craftedOnly, FOREST_BRUTE);
    const dropResult = simulateCombatMatchup(dropLoadout, FOREST_BRUTE);

    expect(craftedResult.winRate).toBeLessThan(0.5);
    expect(dropResult.winRate).toBeGreaterThanOrEqual(0.55);
    expect(dropResult.medianVictoryMs).toBeGreaterThanOrEqual(45_000);
    expect(dropResult.medianVictoryMs).toBeLessThanOrEqual(120_000);
  });

  it("makes Dire Wolf the first real Tier 2 loadout check", () => {
    const oldGear = [
      COMBAT_DICE.bruteCleaver,
      COMBAT_DICE.trainingSword,
      COMBAT_DICE.banditBuckler,
    ];
    const tierTwoLoadout = [
      COMBAT_DICE.bruteCleaver,
      COMBAT_DICE.copperLongsword,
      COMBAT_DICE.oakguardShield,
    ];
    const oldResult = simulateCombatMatchup(oldGear, DIRE_WOLF);
    const tierTwoResult = simulateCombatMatchup(tierTwoLoadout, DIRE_WOLF);

    expect(oldResult.winRate).toBeLessThanOrEqual(0.2);
    expect(tierTwoResult.winRate).toBeGreaterThanOrEqual(0.7);
    expect(tierTwoResult.winRate).toBeLessThanOrEqual(0.9);
    expect(tierTwoResult.medianVictoryMs).toBe(20_000);
  });

  it("lets Barracks turn Wolf Den attempts into sustainable patrols", () => {
    const fourSlotLoadout = [
      COMBAT_DICE.bruteCleaver,
      COMBAT_DICE.copperLongsword,
      COMBAT_DICE.oakguardShield,
      COMBAT_DICE.oakguardShield,
    ];
    const result = simulateCombatMatchup(fourSlotLoadout, DIRE_WOLF);

    expect(result.winRate).toBe(1);
    expect(result.averageVictoryHp).toBeGreaterThanOrEqual(6);
  });
});
