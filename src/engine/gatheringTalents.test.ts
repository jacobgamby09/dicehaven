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
});
