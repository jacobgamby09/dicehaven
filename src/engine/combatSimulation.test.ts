import { describe, expect, it } from "vitest";
import {
  BANDIT_SCOUT,
  COMBAT_DICE,
  DIRE_WOLF,
  FOREST_BRUTE,
  FOREST_WOLF,
  WILD_BOAR,
  type CombatDieDefinition,
  type CombatEnemyDefinition,
} from "./combat";
import {
  simulateCombatEncounter,
  simulateCombatMatchup,
} from "./combatSimulation";

describe("combat balance simulation", () => {
  const automaticDie: CombatDieDefinition = {
    ...COMBAT_DICE.trainingSword,
    faces: Array.from({ length: 6 }, () => ({
      type: "damage" as const,
      amount: 1,
    })),
  };

  const automaticEnemy = (
    attackIntervalMs: number,
  ): CombatEnemyDefinition => ({
    ...FOREST_WOLF,
    attack: 0,
    attackIntervalMs,
    maxHp: 99,
  });

  it("is deterministic for a fixed seed and matchup", () => {
    const loadout = [COMBAT_DICE.trainingSword, COMBAT_DICE.woodenShield];

    expect(simulateCombatEncounter(42, loadout, FOREST_WOLF)).toEqual(
      simulateCombatEncounter(42, loadout, FOREST_WOLF),
    );
  });

  it("lets independent player and enemy clocks resolve at their own speeds", () => {
    const fastEnemy = simulateCombatEncounter(
      1,
      [automaticDie],
      automaticEnemy(1_000),
      8_000,
    );
    const slowEnemy = simulateCombatEncounter(
      1,
      [automaticDie],
      automaticEnemy(10_000),
      8_000,
    );

    expect(fastEnemy.rolls).toBe(2);
    expect(fastEnemy.enemyAttacks).toBe(8);
    expect(slowEnemy.rolls).toBe(2);
    expect(slowEnemy.enemyAttacks).toBe(0);
  });

  it("resolves the player first when both clocks complete together", () => {
    const lethalEnemy: CombatEnemyDefinition = {
      ...automaticEnemy(4_000),
      attack: 10,
      maxHp: 1,
    };
    const result = simulateCombatEncounter(1, [automaticDie], lethalEnemy);

    expect(result.victory).toBe(true);
    expect(result.enemyAttacks).toBe(0);
    expect(result.playerHp).toBe(10);
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
