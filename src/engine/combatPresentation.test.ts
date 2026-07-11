import { describe, expect, it } from "vitest";
import { COMBAT_DICE, COMBAT_DIE_IDS } from "./combat";
import { getCombatFaceInfo } from "./combatPresentation";

describe("combat presentation metadata", () => {
  it("assigns a complete visual identity to every Combat Die", () => {
    for (const dieId of COMBAT_DIE_IDS) {
      const die = COMBAT_DICE[dieId];
      expect(die.visual.material).toBeTruthy();
      expect(die.visual.tier).toBeGreaterThanOrEqual(1);
      expect(die.visual.motion).toBe(
        die.role === "Block"
          ? "guard"
          : die.role === "Utility"
            ? "spark"
            : "strike",
      );
    }
  });

  it("explains Block timing and persistence in plain language", () => {
    const info = getCombatFaceInfo(COMBAT_DICE.woodenShield, 1);

    expect(info.effectLabel).toBe("1 Block");
    expect(info.keyword).toBe("Block");
    expect(info.resolves).toBe("When the die lands");
    expect(info.duration).toBe("Until consumed by enemy attacks");
    expect(info.description).toContain("absorbs incoming Damage");
  });

  it("explains Light's extra loot roll and non-stacking rule", () => {
    const info = getCombatFaceInfo(COMBAT_DICE.torch, 3);

    expect(info.effectLabel).toBe("Light");
    expect(info.keyword).toBe("Scouted");
    expect(info.description).toContain("one additional time");
    expect(info.description).toContain("does not stack");
    expect(info.duration).toBe("Until the current enemy dies");
  });

  it("reports exact face probability and duplicate outcomes", () => {
    const info = getCombatFaceInfo(COMBAT_DICE.trainingSword, 1);

    expect(info.chanceLabel).toBe("1 of 6");
    expect(info.matchingFaces).toBe(3);
  });
});
