import { useRef, useState } from "react";
import {
  COMBAT_DICE,
  type CombatDieId,
  type CombatRole,
} from "../engine/combat";
import { CombatDieVisual } from "../components/CombatDieVisual";
import { FaceInfoOverlay } from "../components/FaceInfoOverlay";
import {
  getVisibleCraftingRecipes,
  isCraftingRecipeCraftable,
  type CraftingCategory,
  type CraftingRecipe,
} from "../engine/crafting";
import {
  getGatheringDieFaces,
  type GatheringSkillId,
} from "../engine/content";
import { RESOURCE_LABELS, RESOURCE_SHORT_LABELS } from "../engine/resources";
import type { ResourceId } from "../engine/roll";
import {
  type CombatState,
  type SkillProgression,
  useGameStore,
} from "../store/gameStore";
import {
  combatFaceMark,
  combatFaceText,
} from "../ui/combatDie";
import { formatCost, formatMissingCost } from "../ui/formatCost";

type TierFilter = "all" | 1 | 2;
type CombatRoleFilter = "all" | CombatRole;
type SkillFilter = "all" | GatheringSkillId;

interface CraftingPageProps {
  onOpenSettlement: () => void;
}

const COMBAT_ROLE_FILTERS: readonly CombatRoleFilter[] = [
  "all",
  "Damage",
  "Block",
  "Utility",
];

const SKILL_FILTERS: readonly SkillFilter[] = [
  "all",
  "woodcutting",
  "mining",
];

const TIER_FILTERS: readonly TierFilter[] = ["all", 1, 2];

function getRecipeOwnedCount(
  recipe: CraftingRecipe,
  combatInventory: CombatState["inventory"],
  woodcuttingInventory: SkillProgression["inventory"],
  miningInventory: SkillProgression["inventory"],
): number {
  if (recipe.category === "combat") return combatInventory[recipe.itemId];
  const inventory =
    recipe.skill === "woodcutting" ? woodcuttingInventory : miningInventory;
  return inventory.filter((die) => die.kind === recipe.itemId).length;
}

function recipeMeta(recipe: CraftingRecipe): string {
  if (recipe.category === "combat") return recipe.role;
  return recipe.skill === "woodcutting" ? "Woodcutting" : "Mining";
}

function stationName(recipe: CraftingRecipe): string {
  return recipe.station === "frontierForge" ? "Frontier Forge" : "Workshop";
}

export function CraftingPage({
  onOpenSettlement,
}: CraftingPageProps): React.JSX.Element {
  const resources = useGameStore((state) => state.resources);
  const buildings = useGameStore((state) => state.buildings);
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const combatInventory = useGameStore((state) => state.combat.inventory);
  const woodcuttingInventory = useGameStore(
    (state) => state.woodcutting.inventory,
  );
  const miningInventory = useGameStore((state) => state.mining.inventory);
  const craftCombatDie = useGameStore((state) => state.craftCombatDie);
  const craftSkillDie = useGameStore(
    (state) => state.craftTierTwoGatheringDie,
  );
  const [category, setCategory] = useState<CraftingCategory>("combat");
  const [combatRole, setCombatRole] = useState<CombatRoleFilter>("all");
  const [skill, setSkill] = useState<SkillFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [craftableOnly, setCraftableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(
    "combat:trainingSword",
  );
  const [faceInfo, setFaceInfo] = useState<{
    dieId: CombatDieId;
    faceIndex: number;
  } | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const unlocks = {
    forestTrophy,
    frontierForgeBuilt: buildings.frontierForge,
    workshopBuilt: buildings.workshop,
  };
  const visibleRecipes = getVisibleCraftingRecipes(unlocks);
  const categoryRecipes = visibleRecipes.filter(
    (recipe) => recipe.category === category,
  );
  const filteredRecipes = categoryRecipes
    .filter((recipe) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (
        normalizedQuery.length > 0 &&
        !`${recipe.name} ${recipe.description} ${recipeMeta(recipe)}`
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }
      if (tier !== "all" && recipe.tier !== tier) return false;
      if (
        recipe.category === "combat" &&
        combatRole !== "all" &&
        recipe.role !== combatRole
      ) {
        return false;
      }
      if (
        recipe.category === "skill" &&
        skill !== "all" &&
        recipe.skill !== skill
      ) {
        return false;
      }
      return (
        !craftableOnly ||
        isCraftingRecipeCraftable(recipe, unlocks, resources)
      );
    })
    .sort((left, right) => {
      const leftReady = isCraftingRecipeCraftable(left, unlocks, resources);
      const rightReady = isCraftingRecipeCraftable(right, unlocks, resources);
      return Number(rightReady) - Number(leftReady) || left.tier - right.tier;
    });
  const selectedRecipe =
    filteredRecipes.find((recipe) => recipe.id === selectedRecipeId) ??
    filteredRecipes[0];
  const visibleCraftableCount = visibleRecipes.filter((recipe) =>
    isCraftingRecipeCraftable(recipe, unlocks, resources),
  ).length;

  const ownedCount = selectedRecipe
    ? getRecipeOwnedCount(
        selectedRecipe,
        combatInventory,
        woodcuttingInventory,
        miningInventory,
      )
    : 0;
  const selectedCanCraft = selectedRecipe
    ? isCraftingRecipeCraftable(selectedRecipe, unlocks, resources)
    : false;

  const selectRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    if (window.matchMedia("(max-width: 760px)").matches) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const craftSelectedRecipe = () => {
    if (selectedRecipe === undefined) return;
    if (selectedRecipe.category === "combat") {
      craftCombatDie(selectedRecipe.itemId);
    } else {
      craftSkillDie(selectedRecipe.skill);
    }
  };

  if (!buildings.workshop) {
    return (
      <div className="destination-page destination-page--crafting">
        <header className="destination-header">
          <span className="eyebrow">Progression</span>
          <h1>Crafting</h1>
          <p>Turn resources and discovered blueprints into physical dice.</p>
        </header>
        <section className="crafting-gate">
          <div aria-hidden="true" className="crafting-gate__mark">⚒</div>
          <div>
            <span className="lab-pill">Station required</span>
            <h2>Build the Workshop</h2>
            <p>
              The Workshop opens Crafting and your first three Combat Dice
              recipes.
            </p>
            <button className="primary-button" onClick={onOpenSettlement} type="button">
              Open Settlement
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="destination-page destination-page--crafting">
      <header className="destination-header crafting-page-header">
        <div>
          <span className="eyebrow">Workshop</span>
          <h1>Crafting</h1>
          <p>Choose a known recipe, inspect the result and craft a physical die.</p>
        </div>
        <div className="crafting-summary">
          <strong>{visibleCraftableCount}</strong>
          <span>craftable now</span>
          <small>{visibleRecipes.length} known recipes</small>
        </div>
      </header>

      <section className="crafting-workspace">
        <div aria-label="Crafting category" className="crafting-tabs" role="tablist">
          <button
            aria-selected={category === "combat"}
            onClick={() => setCategory("combat")}
            role="tab"
            type="button"
          >
            Combat Dice
            <small>
              {visibleRecipes.filter((recipe) => recipe.category === "combat").length}
            </small>
          </button>
          <button
            aria-selected={category === "skill"}
            onClick={() => setCategory("skill")}
            role="tab"
            type="button"
          >
            Skill Dice
            <small>
              {visibleRecipes.filter((recipe) => recipe.category === "skill").length}
            </small>
          </button>
        </div>

        <div className="crafting-toolbar">
          <label className="crafting-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search recipes"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search recipes"
              type="search"
              value={searchQuery}
            />
          </label>
          <div aria-label="Recipe type filter" className="crafting-filter-group">
            {(category === "combat" ? COMBAT_ROLE_FILTERS : SKILL_FILTERS).map(
              (filter) => {
                const isSelected =
                  category === "combat"
                    ? combatRole === filter
                    : skill === filter;
                const label =
                  filter === "all"
                    ? "All"
                    : filter === "woodcutting"
                      ? "Woodcutting"
                      : filter === "mining"
                        ? "Mining"
                        : filter;
                return (
                  <button
                    aria-pressed={isSelected}
                    key={filter}
                    onClick={() => {
                      if (category === "combat") {
                        setCombatRole(filter as CombatRoleFilter);
                      } else {
                        setSkill(filter as SkillFilter);
                      }
                    }}
                    type="button"
                  >
                    {label}
                  </button>
                );
              },
            )}
          </div>
          <div aria-label="Tier filter" className="crafting-filter-group">
            {TIER_FILTERS.map((filter) => (
              <button
                aria-pressed={tier === filter}
                key={filter}
                onClick={() => setTier(filter)}
                type="button"
              >
                {filter === "all" ? "All tiers" : `Tier ${filter}`}
              </button>
            ))}
          </div>
          <button
            aria-pressed={craftableOnly}
            className="crafting-ready-filter"
            onClick={() => setCraftableOnly((current) => !current)}
            type="button"
          >
            Craftable now
          </button>
        </div>

        <div className="crafting-layout">
          <section aria-labelledby="recipe-list-title" className="crafting-catalog">
            <div className="crafting-section-heading">
              <div>
                <span className="eyebrow">Known blueprints</span>
                <h2 id="recipe-list-title">
                  {category === "combat" ? "Combat Dice" : "Skill Dice"}
                </h2>
              </div>
              <span>{filteredRecipes.length} shown</span>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="crafting-recipe-list">
                {filteredRecipes.map((recipe) => {
                  const recipeOwned = getRecipeOwnedCount(
                    recipe,
                    combatInventory,
                    woodcuttingInventory,
                    miningInventory,
                  );
                  const canCraft = isCraftingRecipeCraftable(
                    recipe,
                    unlocks,
                    resources,
                  );
                  const selected = selectedRecipe?.id === recipe.id;
                  return (
                    <button
                      aria-pressed={selected}
                      className="crafting-recipe-card"
                      key={recipe.id}
                      onClick={() => selectRecipe(recipe.id)}
                      type="button"
                    >
                      {recipe.category === "combat" ? (
                        <CombatDieVisual
                          active={selected}
                          decorative
                          definition={COMBAT_DICE[recipe.itemId]}
                          size="small"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="crafting-recipe-card__icon crafting-recipe-card__icon--skill"
                        >
                          {recipe.skill === "woodcutting" ? "W" : "M"}
                        </span>
                      )}
                      <span className="crafting-recipe-card__copy">
                        <span>
                          {recipeMeta(recipe)} · Tier {recipe.tier}
                        </span>
                        <strong>{recipe.name}</strong>
                        <small>{formatCost(recipe.cost)}</small>
                      </span>
                      <span className="crafting-recipe-card__state">
                        <small>Owned {recipeOwned}</small>
                        <strong className={canCraft ? "is-ready" : ""}>
                          {canCraft
                            ? "Craftable"
                            : recipeOwned === 0
                              ? "New recipe"
                              : "Needs materials"}
                        </strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="crafting-empty-state">
                <strong>
                  {category === "skill" && categoryRecipes.length === 0
                    ? "No Skill Dice blueprints discovered yet"
                    : "No recipes match these filters"}
                </strong>
                <p>
                  {category === "skill" && categoryRecipes.length === 0
                    ? "Defeat powerful enemies to discover specialist designs."
                    : "Try another role, tier or turn off Craftable now."}
                </p>
              </div>
            )}
          </section>

          <aside className="crafting-detail" ref={detailRef}>
            {selectedRecipe ? (
              <>
                <div className="crafting-detail__heading">
                  <span className="eyebrow">
                    {recipeMeta(selectedRecipe)} · Tier {selectedRecipe.tier}
                  </span>
                  <h2>{selectedRecipe.name}</h2>
                  <p>{selectedRecipe.description}</p>
                  <div className="crafting-detail__meta">
                    <span>{stationName(selectedRecipe)}</span>
                    <span>Equip at Level {selectedRecipe.equipLevel}</span>
                    <span>{ownedCount} owned</span>
                  </div>
                </div>

                <div className="crafting-face-grid" aria-label={`${selectedRecipe.name} faces`}>
                  {selectedRecipe.category === "combat"
                    ? COMBAT_DICE[selectedRecipe.itemId].faces.map((face, index) => (
                        <button
                          aria-label={`Open information for face ${index + 1}: ${combatFaceText(face)}`}
                          className={`crafting-face crafting-face--${face.type}`}
                          key={`${selectedRecipe.id}-face-${index + 1}`}
                          onClick={() =>
                            setFaceInfo({
                              dieId: selectedRecipe.itemId,
                              faceIndex: index,
                            })
                          }
                          title={combatFaceText(face)}
                          type="button"
                        >
                          <small>{index + 1}</small>
                          <strong>{combatFaceMark(face)}</strong>
                        </button>
                      ))
                    : getGatheringDieFaces({
                        id: "crafting-preview",
                        kind: selectedRecipe.itemId,
                        upgradeLevel: 0,
                      }).map((face, index) => (
                        <span
                          className="crafting-face crafting-face--produce"
                          key={`${selectedRecipe.id}-face-${index + 1}`}
                        >
                          <small>{index + 1}</small>
                          <strong>{face.amount}</strong>
                          <em>{RESOURCE_SHORT_LABELS[face.resource]}</em>
                        </span>
                      ))}
                </div>

                <div className="crafting-cost-panel">
                  <span className="eyebrow">Materials</span>
                  <ul>
                    {Object.entries(selectedRecipe.cost).map(([resource, amount]) => {
                      const resourceId = resource as ResourceId;
                      const required = amount ?? 0;
                      const available = resources[resourceId];
                      return (
                        <li
                          className={available >= required ? "is-ready" : ""}
                          key={resource}
                        >
                          <span>{RESOURCE_LABELS[resourceId]}</span>
                          <strong>{available} / {required}</strong>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <button
                  className="crafting-primary-action"
                  disabled={!selectedCanCraft}
                  onClick={craftSelectedRecipe}
                  type="button"
                >
                  {selectedCanCraft
                    ? ownedCount > 0
                      ? `Craft another ${selectedRecipe.name}`
                      : `Craft ${selectedRecipe.name}`
                    : formatMissingCost(resources, selectedRecipe.cost)}
                </button>
                <small className="crafting-level-note">
                  Crafting is instant. Level requirements apply only when equipping.
                </small>
              </>
            ) : (
              <div className="crafting-empty-state">
                <strong>Select a visible recipe</strong>
                <p>Its faces, requirements and craft action will appear here.</p>
              </div>
            )}
          </aside>
        </div>
        </section>
      </div>
      {faceInfo ? (
        <FaceInfoOverlay
          definition={COMBAT_DICE[faceInfo.dieId]}
          initialFaceIndex={faceInfo.faceIndex}
          key={`${faceInfo.dieId}-${faceInfo.faceIndex}`}
          onClose={() => setFaceInfo(null)}
        />
      ) : null}
    </>
  );
}
