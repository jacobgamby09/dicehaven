import type { ResourceId } from "./roll";

export const SKILL_XP_PER_ROLL = 1;
export const GATHERING_FACE_UPGRADE_COSTS = [5, 8, 12, 18, 28, 45] as const;
export const TIER_TWO_GATHERING_FACE_UPGRADE_COSTS = [
  30, 45, 70, 110, 170, 260,
] as const;
export const GATHERING_ROLL_INTERVALS_MS = [
  4_000, 3_600, 3_200, 2_800, 2_400,
] as const;
export const GATHERING_ROLL_SPEED_COSTS = [20, 55, 140, 350] as const;
export const GATHERING_SLOT_COSTS = {
  2: 35,
  3: 180,
} as const;
export const MAX_GATHERING_SLOTS = 3;

export type ResourceCost = Partial<Record<ResourceId, number>>;

export function getGatheringRollInterval(rollSpeedLevel: number): number {
  const safeLevel = Math.max(
    0,
    Math.min(
      GATHERING_ROLL_INTERVALS_MS.length - 1,
      Math.floor(rollSpeedLevel),
    ),
  );
  return GATHERING_ROLL_INTERVALS_MS[safeLevel];
}

export function getGatheringSlotCost(currentSlots: number): number | undefined {
  const nextSlot = Math.floor(currentSlots) + 1;
  return nextSlot === 2 || nextSlot === 3
    ? GATHERING_SLOT_COSTS[nextSlot]
    : undefined;
}

export const WORKSHOP_COST = {
  wood: 120,
  stone: 90,
} as const satisfies ResourceCost;

export const BARRACKS_COST = {
  wood: 80,
  stone: 60,
  monsterParts: 15,
} as const satisfies ResourceCost;

export const FRONTIER_FORGE_COST = {
  oak: 25,
  copper: 25,
  monsterParts: 20,
} as const satisfies ResourceCost;

export function canAfford(
  resources: Record<ResourceId, number>,
  cost: ResourceCost,
): boolean {
  return Object.entries(cost).every(
    ([resource, amount]) => resources[resource as ResourceId] >= (amount ?? 0),
  );
}

export function subtractCost(
  resources: Record<ResourceId, number>,
  cost: ResourceCost,
): Record<ResourceId, number> {
  if (!canAfford(resources, cost)) {
    return resources;
  }

  return {
    wood: resources.wood - (cost.wood ?? 0),
    oak: resources.oak - (cost.oak ?? 0),
    stone: resources.stone - (cost.stone ?? 0),
    copper: resources.copper - (cost.copper ?? 0),
    monsterParts: resources.monsterParts - (cost.monsterParts ?? 0),
  };
}

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressInLevel: number;
  xpNeededInLevel: number;
}

export function lifetimeXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return (25 * (safeLevel - 1) * safeLevel) / 2;
}

export function getLevelProgress(lifetimeXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(lifetimeXp));
  let level = 1;

  while (safeXp >= lifetimeXpForLevel(level + 1)) {
    level += 1;
  }

  const currentLevelXp = lifetimeXpForLevel(level);
  const nextLevelXp = lifetimeXpForLevel(level + 1);

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressInLevel: safeXp - currentLevelXp,
    xpNeededInLevel: nextLevelXp - currentLevelXp,
  };
}
