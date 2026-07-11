import { SKILL_XP_PER_ROLL, getGatheringRollInterval } from "./progression";

export interface GatheringPurchaseStep {
  id: string;
  cost: number;
  rollSpeedLevelAfter?: number;
}

export interface GatheringPurchaseResult extends GatheringPurchaseStep {
  purchasedAtMs: number;
  rollsCompleted: number;
}

export const UPGRADE_RUSH_BENCHMARK_ROUTE: readonly GatheringPurchaseStep[] = [
  { id: "die-1-face-1", cost: 5 },
  { id: "die-1-face-2", cost: 8 },
  { id: "die-1-face-3", cost: 12 },
  { id: "roll-speed-1", cost: 20, rollSpeedLevelAfter: 1 },
  { id: "slot-2", cost: 35 },
  { id: "die-1-face-4", cost: 18 },
  { id: "die-1-face-5", cost: 28 },
  { id: "die-1-face-6", cost: 45 },
  { id: "die-2-face-1", cost: 5 },
  { id: "die-2-face-2", cost: 8 },
  { id: "die-2-face-3", cost: 12 },
  { id: "die-2-face-4", cost: 18 },
  { id: "die-2-face-5", cost: 28 },
  { id: "die-2-face-6", cost: 45 },
  { id: "roll-speed-2", cost: 55, rollSpeedLevelAfter: 2 },
  { id: "slot-3", cost: 180 },
] as const;

export function simulateGatheringPurchases(
  route: readonly GatheringPurchaseStep[],
): readonly GatheringPurchaseResult[] {
  let spendableXp = 0;
  let elapsedMs = 0;
  let rollsCompleted = 0;
  let rollSpeedLevel = 0;
  const results: GatheringPurchaseResult[] = [];

  for (const purchase of route) {
    while (spendableXp < purchase.cost) {
      elapsedMs += getGatheringRollInterval(rollSpeedLevel);
      spendableXp += SKILL_XP_PER_ROLL;
      rollsCompleted += 1;
    }

    spendableXp -= purchase.cost;
    if (purchase.rollSpeedLevelAfter !== undefined) {
      rollSpeedLevel = purchase.rollSpeedLevelAfter;
    }
    results.push({ ...purchase, purchasedAtMs: elapsedMs, rollsCompleted });
  }

  return results;
}
