import { describe, expect, it } from "vitest";
import {
  COMBAT_DICE,
  COMBAT_ENEMIES,
  FOREST_WOLF,
  resolveCombatLoot,
  resolveCombatRoll,
  resolveEnemyAttack,
  selectForestEdgeEnemy,
} from "./combat";

describe("combat engine", () => {
  it("returns identical rolls for identical seeds and loadouts", () => {
    const loadout = [COMBAT_DICE.trainingSword, COMBAT_DICE.woodenShield];

    expect(resolveCombatRoll(42, 1, loadout)).toEqual(
      resolveCombatRoll(42, 1, loadout),
    );
  });

  it("aggregates damage, block and light independently", () => {
    const outcome = resolveCombatRoll(1, 1, [
      COMBAT_DICE.trainingSword,
      COMBAT_DICE.woodenShield,
      COMBAT_DICE.torch,
    ]);

    expect(outcome.event.results).toHaveLength(3);
    expect(outcome.event.damage).toBeGreaterThanOrEqual(0);
    expect(outcome.event.block).toBeGreaterThanOrEqual(0);
    expect(outcome.event.light).toBeGreaterThanOrEqual(0);
  });

  it("uses stored block on the next enemy attack", () => {
    expect(resolveEnemyAttack(10, 1, 3)).toEqual({
      blockRemaining: 0,
      blockUsed: 1,
      damageTaken: 2,
      playerHp: 8,
    });
  });

  it("keeps unspent Block after a smaller enemy attack", () => {
    expect(resolveEnemyAttack(10, 5, 3)).toEqual({
      blockRemaining: 2,
      blockUsed: 3,
      damageTaken: 0,
      playerHp: 10,
    });
  });

  it("grants exactly one additional loot roll to a Scouted enemy", () => {
    const normal = resolveCombatLoot(7, FOREST_WOLF, false);
    const scouted = resolveCombatLoot(7, FOREST_WOLF, true);

    expect(normal.rolls).toHaveLength(1);
    expect(scouted.rolls).toHaveLength(2);
    expect(scouted.rolls[0]).toEqual(normal.rolls[0]);
  });

  it("selects Forest Edge encounters deterministically without selecting the boss", () => {
    const first = selectForestEdgeEnemy(99);
    const second = selectForestEdgeEnemy(99);

    expect(first).toEqual(second);
    expect(first.enemy.isBoss).toBe(false);
    expect(COMBAT_ENEMIES.forestBrute.isBoss).toBe(true);
  });
});
