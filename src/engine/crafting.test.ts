import { describe, expect, it } from "vitest";
import {
  getVisibleCraftingRecipes,
  isCraftingRecipeCraftable,
} from "./crafting";
import type { ResourceId } from "./roll";

const EMPTY_RESOURCES: Record<ResourceId, number> = {
  wood: 0,
  oak: 0,
  stone: 0,
  copper: 0,
  monsterParts: 0,
};

describe("crafting catalogue", () => {
  it("hides every recipe until the Workshop is built", () => {
    expect(
      getVisibleCraftingRecipes({
        forestTrophy: true,
        frontierForgeBuilt: true,
        workshopBuilt: false,
      }),
    ).toEqual([]);
  });

  it("shows only Workshop Combat Dice before later unlocks", () => {
    const recipes = getVisibleCraftingRecipes({
      forestTrophy: false,
      frontierForgeBuilt: false,
      workshopBuilt: true,
    });

    expect(recipes.map((recipe) => recipe.id)).toEqual([
      "combat:trainingSword",
      "combat:woodenShield",
      "combat:torch",
    ]);
  });

  it("reveals Skill Dice with the boss blueprint and Tier 2 Combat Dice with the Forge", () => {
    const afterBoss = getVisibleCraftingRecipes({
      forestTrophy: true,
      frontierForgeBuilt: false,
      workshopBuilt: true,
    });
    expect(afterBoss.filter((recipe) => recipe.category === "skill")).toHaveLength(2);
    expect(
      afterBoss.some((recipe) => recipe.id === "combat:copperLongsword"),
    ).toBe(false);

    const afterForge = getVisibleCraftingRecipes({
      forestTrophy: true,
      frontierForgeBuilt: true,
      workshopBuilt: true,
    });
    expect(afterForge.map((recipe) => recipe.id)).toContain(
      "combat:copperLongsword",
    );
    expect(afterForge.map((recipe) => recipe.id)).toContain(
      "combat:oakguardShield",
    );
  });

  it("uses resources, not equip level, to determine craftability", () => {
    const unlocks = {
      forestTrophy: false,
      frontierForgeBuilt: false,
      workshopBuilt: true,
    };
    const torch = getVisibleCraftingRecipes(unlocks).find(
      (recipe) => recipe.id === "combat:torch",
    );

    expect(torch?.equipLevel).toBe(2);
    expect(
      torch &&
        isCraftingRecipeCraftable(torch, unlocks, {
          ...EMPTY_RESOURCES,
          wood: 30,
          stone: 10,
        }),
    ).toBe(true);
  });
});
