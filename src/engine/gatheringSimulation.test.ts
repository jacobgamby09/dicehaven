import { describe, expect, it } from "vitest";
import {
  simulateGatheringPurchases,
  UPGRADE_RUSH_BENCHMARK_ROUTE,
} from "./gatheringSimulation";

describe("Upgrade Rush pacing", () => {
  const purchases = simulateGatheringPurchases(UPGRADE_RUSH_BENCHMARK_ROUTE);

  it("delivers three clear upgrades in the first 100 seconds", () => {
    expect(purchases.slice(0, 3).map((purchase) => purchase.purchasedAtMs)).toEqual([
      20_000, 52_000, 100_000,
    ]);
  });

  it("delivers 12 to 16 purchases in a representative first 30 minutes", () => {
    const purchasesInThirtyMinutes = purchases.filter(
      (purchase) => purchase.purchasedAtMs <= 30 * 60 * 1_000,
    );

    expect(purchasesInThirtyMinutes.length).toBeGreaterThanOrEqual(12);
    expect(purchasesInThirtyMinutes.length).toBeLessThanOrEqual(16);
  });

  it("makes the second physical die the fifth major purchase", () => {
    expect(purchases[4]).toMatchObject({
      id: "slot-2",
      purchasedAtMs: 306_000,
    });
  });
});
