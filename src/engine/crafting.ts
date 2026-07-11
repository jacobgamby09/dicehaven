import {
  COMBAT_DICE,
  type CombatDieId,
  type CombatRole,
} from "./combat";
import {
  getTierTwoGatheringRecipe,
  type GatheringDieKind,
  type GatheringSkillId,
} from "./content";
import { canAfford, type ResourceCost } from "./progression";
import type { ResourceId } from "./roll";

export type CraftingCategory = "combat" | "skill";
export type CraftingStationId = "workshop" | "frontierForge";

interface BaseCraftingRecipe {
  category: CraftingCategory;
  cost: ResourceCost;
  description: string;
  equipLevel: number;
  id: string;
  name: string;
  station: CraftingStationId;
  tier: 1 | 2;
  requiresForestTrophy: boolean;
}

export interface CombatCraftingRecipe extends BaseCraftingRecipe {
  category: "combat";
  itemId: CombatDieId;
  role: CombatRole;
}

export interface SkillCraftingRecipe extends BaseCraftingRecipe {
  category: "skill";
  itemId: GatheringDieKind;
  skill: GatheringSkillId;
}

export type CraftingRecipe = CombatCraftingRecipe | SkillCraftingRecipe;

export interface CraftingUnlocks {
  forestTrophy: boolean;
  frontierForgeBuilt: boolean;
  workshopBuilt: boolean;
}

const COMBAT_RECIPE_CONFIGS: readonly {
  cost: ResourceCost;
  id: CombatDieId;
  station: CraftingStationId;
  tier: 1 | 2;
}[] = [
  {
    cost: { wood: 25, stone: 15 },
    id: "trainingSword",
    station: "workshop",
    tier: 1,
  },
  {
    cost: { wood: 20, stone: 25 },
    id: "woodenShield",
    station: "workshop",
    tier: 1,
  },
  {
    cost: { wood: 30, stone: 10 },
    id: "torch",
    station: "workshop",
    tier: 1,
  },
  {
    cost: { oak: 8, copper: 18, monsterParts: 8 },
    id: "copperLongsword",
    station: "frontierForge",
    tier: 2,
  },
  {
    cost: { oak: 18, copper: 8, monsterParts: 8 },
    id: "oakguardShield",
    station: "frontierForge",
    tier: 2,
  },
] as const;

const COMBAT_CRAFTING_RECIPES: readonly CombatCraftingRecipe[] =
  COMBAT_RECIPE_CONFIGS.map((config) => {
    const die = COMBAT_DICE[config.id];
    return {
      category: "combat",
      cost: config.cost,
      description: die.description,
      equipLevel: die.levelRequirement,
      id: `combat:${config.id}`,
      itemId: config.id,
      name: die.name,
      requiresForestTrophy: false,
      role: die.role,
      station: config.station,
      tier: config.tier,
    };
  });

const SKILL_CRAFTING_RECIPES: readonly SkillCraftingRecipe[] = (
  ["woodcutting", "mining"] as const
).map((skill) => {
  const recipe = getTierTwoGatheringRecipe(skill);
  return {
    category: "skill",
    cost: recipe.cost,
    description: recipe.description,
    equipLevel: recipe.levelRequirement,
    id: `skill:${recipe.kind}`,
    itemId: recipe.kind,
    name: recipe.name,
    requiresForestTrophy: true,
    skill,
    station: "workshop",
    tier: 2,
  };
});

export const CRAFTING_RECIPES: readonly CraftingRecipe[] = [
  ...COMBAT_CRAFTING_RECIPES,
  ...SKILL_CRAFTING_RECIPES,
];

export function isCraftingRecipeVisible(
  recipe: CraftingRecipe,
  unlocks: CraftingUnlocks,
): boolean {
  if (!unlocks.workshopBuilt) return false;
  if (recipe.station === "frontierForge" && !unlocks.frontierForgeBuilt) {
    return false;
  }
  if (recipe.requiresForestTrophy && !unlocks.forestTrophy) return false;
  return true;
}

export function getVisibleCraftingRecipes(
  unlocks: CraftingUnlocks,
): readonly CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((recipe) =>
    isCraftingRecipeVisible(recipe, unlocks),
  );
}

export function isCraftingRecipeCraftable(
  recipe: CraftingRecipe,
  unlocks: CraftingUnlocks,
  resources: Record<ResourceId, number>,
): boolean {
  return (
    isCraftingRecipeVisible(recipe, unlocks) &&
    canAfford(resources, recipe.cost)
  );
}

export function getCombatCraftingRecipe(
  dieId: CombatDieId,
): CombatCraftingRecipe | undefined {
  return COMBAT_CRAFTING_RECIPES.find((recipe) => recipe.itemId === dieId);
}

export function getSkillCraftingRecipe(
  skill: GatheringSkillId,
): SkillCraftingRecipe {
  const recipe = SKILL_CRAFTING_RECIPES.find(
    (candidate) => candidate.skill === skill,
  );
  if (recipe === undefined) {
    throw new Error(`Missing crafting recipe for ${skill}`);
  }
  return recipe;
}
