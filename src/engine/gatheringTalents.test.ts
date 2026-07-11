import { describe, expect, it } from "vitest";
import { getGatheringTalentNodes } from "./gatheringTalents";

describe("gathering talent trees", () => {
  it("maps every existing engine upgrade into the Woodcutting tree", () => {
    const nodes = getGatheringTalentNodes("woodcutting");

    expect(nodes).toHaveLength(20);
    expect(nodes.filter((node) => node.effect.type === "face")).toHaveLength(12);
    expect(nodes.filter((node) => node.effect.type === "speed")).toHaveLength(4);
    expect(nodes.filter((node) => node.effect.type === "slot")).toHaveLength(2);
  });

  it("keeps each upgrade track sequential and exposes the Tier 2 horizon", () => {
    const nodes = getGatheringTalentNodes("mining");
    const speedFour = nodes.find((node) => node.id === "speed-4");
    const tierTwoFace = nodes.find((node) => node.id === "specialist-face-1");

    expect(speedFour?.prerequisiteIds).toEqual(["speed-3"]);
    expect(tierTwoFace?.prerequisiteIds).toEqual(["specialist-blueprint"]);
    expect(tierTwoFace?.cost).toBe(30);
  });

  it("labels nodes with their concrete effect instead of upgrade names", () => {
    const nodes = getGatheringTalentNodes("mining");

    expect(nodes.find((node) => node.id === "starter-face-4")?.label).toBe(
      "Face 4: 1 → 2 Stone",
    );
    expect(nodes.find((node) => node.id === "speed-1")?.label).toBe(
      "Roll interval: 4.0s → 3.6s",
    );
    expect(nodes.find((node) => node.id === "slot-2")?.label).toBe(
      "Unlock dice slot 2",
    );
    expect(
      nodes.find((node) => node.id === "specialist-blueprint")?.label,
    ).toBe("Unlock Copper Prospector blueprint");
  });
});
