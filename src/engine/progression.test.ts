import { describe, expect, it } from "vitest";
import {
  GATHERING_FACE_UPGRADE_COSTS,
  GATHERING_ROLL_INTERVALS_MS,
  GATHERING_SLOT_COSTS,
  TIER_TWO_GATHERING_FACE_UPGRADE_COSTS,
  getGatheringRollInterval,
  getGatheringSlotCost,
  getLevelProgress,
  lifetimeXpForLevel,
} from "./progression";

describe("gathering progression", () => {
  it("starts at level one and reaches level two at 25 lifetime XP", () => {
    expect(getLevelProgress(0).level).toBe(1);
    expect(getLevelProgress(24).level).toBe(1);
    expect(getLevelProgress(25).level).toBe(2);
  });

  it("never loses level progress when spendable XP is used", () => {
    const beforePurchase = getLevelProgress(25);
    const afterSpendingXp = getLevelProgress(25);

    expect(afterSpendingXp).toEqual(beforePurchase);
    expect(lifetimeXpForLevel(3)).toBe(75);
  });

  it("front-loads inexpensive face upgrades", () => {
    expect(GATHERING_FACE_UPGRADE_COSTS).toEqual([5, 8, 12, 18, 28, 45]);
    expect(TIER_TWO_GATHERING_FACE_UPGRADE_COSTS).toEqual([
      30, 45, 70, 110, 170, 260,
    ]);
  });

  it("reduces the roll interval through four speed upgrades", () => {
    expect(GATHERING_ROLL_INTERVALS_MS).toEqual([
      4_000, 3_600, 3_200, 2_800, 2_400,
    ]);
    expect(getGatheringRollInterval(0)).toBe(4_000);
    expect(getGatheringRollInterval(4)).toBe(2_400);
    expect(getGatheringRollInterval(99)).toBe(2_400);
  });

  it("prices second and third crew slots in skill XP", () => {
    expect(GATHERING_SLOT_COSTS).toEqual({ 2: 35, 3: 180 });
    expect(getGatheringSlotCost(1)).toBe(35);
    expect(getGatheringSlotCost(2)).toBe(180);
    expect(getGatheringSlotCost(3)).toBeUndefined();
  });
});
