import {
  COMBAT_ROLL_INTERVAL_MS,
  PLAYER_BLOCK_CAP,
  PLAYER_MAX_HP,
  resolveCombatRoll,
  resolveEnemyAttack,
  type CombatDieDefinition,
  type CombatEnemyDefinition,
} from "./combat";

export interface EncounterSimulationResult {
  victory: boolean;
  durationMs: number;
  playerHp: number;
  enemyHp: number;
  rolls: number;
  enemyAttacks: number;
  nextSeed: number;
}

export interface MatchupSimulationResult {
  runs: number;
  wins: number;
  winRate: number;
  medianVictoryMs: number | null;
  averageVictoryHp: number | null;
}

export function simulateCombatEncounter(
  seed: number,
  dice: readonly CombatDieDefinition[],
  enemy: CombatEnemyDefinition,
  maxDurationMs = 5 * 60_000,
): EncounterSimulationResult {
  let nextSeed = seed;
  let playerHp = PLAYER_MAX_HP;
  let enemyHp = enemy.maxHp;
  let block = 0;
  let rolls = 0;
  let enemyAttacks = 0;
  let nextPlayerRollMs = COMBAT_ROLL_INTERVAL_MS;
  let nextEnemyAttackMs = enemy.attackIntervalMs;

  while (
    Math.min(nextPlayerRollMs, nextEnemyAttackMs) <= maxDurationMs &&
    playerHp > 0 &&
    enemyHp > 0
  ) {
    if (nextPlayerRollMs <= nextEnemyAttackMs) {
      rolls += 1;
      const outcome = resolveCombatRoll(nextSeed, rolls, dice);
      nextSeed = outcome.nextSeed;
      enemyHp = Math.max(0, enemyHp - outcome.event.damage);
      block = Math.min(PLAYER_BLOCK_CAP, block + outcome.event.block);

      if (enemyHp <= 0) {
        return {
          victory: true,
          durationMs: nextPlayerRollMs,
          playerHp,
          enemyHp,
          rolls,
          enemyAttacks,
          nextSeed,
        };
      }

      nextPlayerRollMs += COMBAT_ROLL_INTERVAL_MS;
      continue;
    }

    enemyAttacks += 1;
    const attack = resolveEnemyAttack(playerHp, block, enemy.attack);
    playerHp = attack.playerHp;
    block = attack.blockRemaining;

    if (playerHp <= 0) {
      return {
        victory: false,
        durationMs: nextEnemyAttackMs,
        playerHp,
        enemyHp,
        rolls,
        enemyAttacks,
        nextSeed,
      };
    }

    nextEnemyAttackMs += enemy.attackIntervalMs;
  }

  return {
    victory: enemyHp <= 0,
    durationMs: maxDurationMs,
    playerHp,
    enemyHp,
    rolls,
    enemyAttacks,
    nextSeed,
  };
}

export function simulateCombatMatchup(
  dice: readonly CombatDieDefinition[],
  enemy: CombatEnemyDefinition,
  runs = 500,
  seedBase = 1,
): MatchupSimulationResult {
  const results = Array.from({ length: runs }, (_, index) =>
    simulateCombatEncounter(seedBase + index * 9_973, dice, enemy),
  );
  const victories = results.filter((result) => result.victory);
  const victoryDurations = victories
    .map((result) => result.durationMs)
    .sort((left, right) => left - right);
  const midpoint = Math.floor(victoryDurations.length / 2);
  const medianVictoryMs =
    victoryDurations.length === 0
      ? null
      : victoryDurations.length % 2 === 0
        ? (victoryDurations[midpoint - 1] + victoryDurations[midpoint]) / 2
        : victoryDurations[midpoint];
  const averageVictoryHp =
    victories.length === 0
      ? null
      : victories.reduce((total, result) => total + result.playerHp, 0) /
        victories.length;

  return {
    runs,
    wins: victories.length,
    winRate: victories.length / runs,
    medianVictoryMs,
    averageVictoryHp,
  };
}
