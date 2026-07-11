import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COMBAT_DICE,
  COMBAT_DIE_IDS,
  COMBAT_ENEMIES,
  createEmptyCombatInventory,
  FOREST_BRUTE,
  PLAYER_MAX_HP,
  resolveCombatLoot,
  resolveCombatRoll,
  resolveEnemyAttack,
  selectForestEdgeEnemy,
  selectWolfDenEnemy,
  type CombatDieId,
  type CombatEnemyId,
  type CombatLootEntry,
  type CombatRollEvent,
  type CombatZoneId,
} from "../engine/combat";
import {
  createGatheringDieInstance,
  createStarterGatheringDie,
  getGatheringDieLevelRequirement,
  getGatheringDieSkill,
  getGatheringFaceUpgradeCost,
  getGatheringDice,
  getTierTwoGatheringRecipe,
  isGatheringDieKind,
  type GatheringDieInstance,
  type GatheringSkillId,
} from "../engine/content";
import {
  canAfford,
  BARRACKS_COST,
  COMBAT_DIE_RECIPES,
  FRONTIER_FORGE_COST,
  GATHERING_FACE_UPGRADE_COSTS,
  GATHERING_ROLL_SPEED_COSTS,
  getLevelProgress,
  getGatheringSlotCost,
  MAX_GATHERING_SLOTS,
  SKILL_XP_PER_ROLL,
  subtractCost,
  WORKSHOP_COST,
} from "../engine/progression";
import { resolveRoll, type ResourceId, type RollEvent } from "../engine/roll";

type ResourceWallet = Record<ResourceId, number>;
export type { GatheringSkillId } from "../engine/content";

export interface SkillProgression {
  lifetimeXp: number;
  spendableXp: number;
  slots: number;
  rollSpeedLevel: number;
  inventory: GatheringDieInstance[];
  loadout: Array<string | null>;
}

export interface CombatSession {
  id: number;
  encounterId: number;
  zoneId: CombatZoneId;
  enemyId: CombatEnemyId;
  enemyHp: number;
  playerHp: number;
  block: number;
  scouted: boolean;
  lastEnemyAttack: {
    id: number;
    damageTaken: number;
    blockUsed: number;
  } | null;
  enemiesDefeated: number;
  xpGained: number;
  monsterPartsGained: number;
  diceGained: Partial<Record<CombatDieId, number>>;
  lootRolls: CombatLootEntry[];
}

export interface CombatResult {
  type: "victory" | "defeat" | "retreat";
  zoneId: CombatZoneId;
  enemyName: string;
  xpGained: number;
  monsterPartsGained: number;
  enemiesDefeated: number;
  trophyGained: boolean;
  diceGained: Partial<Record<CombatDieId, number>>;
  lootRolls: CombatLootEntry[];
  defeatReason: "noBlock" | "lowDamage" | "overwhelmed" | null;
  unlocksGained: ProgressionUnlockId[];
}

export type ProgressionUnlockId =
  | "forestTrophy"
  | "bruteCleaver"
  | "oakheartBlueprint"
  | "copperProspectorBlueprint"
  | "barracksBlueprint";

export const FOREST_BRUTE_FIRST_CLEAR_UNLOCKS: readonly ProgressionUnlockId[] = [
  "forestTrophy",
  "bruteCleaver",
  "oakheartBlueprint",
  "copperProspectorBlueprint",
  "barracksBlueprint",
];

export interface CombatKillEvent {
  id: number;
  zoneId: CombatZoneId;
  enemyName: string;
  isBoss: boolean;
  xpGained: number;
  monsterPartsGained: number;
  diceGained: Partial<Record<CombatDieId, number>>;
  scouted: boolean;
  zoneProgress: number;
  trophyGained: boolean;
  unlocksGained: ProgressionUnlockId[];
}

export interface CombatState {
  lifetimeXp: number;
  inventory: Record<CombatDieId, number>;
  loadout: Array<CombatDieId | null>;
  zoneProgress: number;
  wolfDenProgress: number;
  forestTrophy: boolean;
  runCount: number;
  rollCount: number;
  enemyAttackCount: number;
  session: CombatSession | null;
  lastRoll: CombatRollEvent | null;
  lastKill: CombatKillEvent | null;
  lastResult: CombatResult | null;
}

interface GameState {
  resources: ResourceWallet;
  activeSkill: GatheringSkillId;
  woodcutting: SkillProgression;
  mining: SkillProgression;
  buildings: {
    workshop: boolean;
    barracks: boolean;
    frontierForge: boolean;
  };
  combat: CombatState;
  seed: number;
  rollCount: number;
  lastEvents: Record<GatheringSkillId, RollEvent | null>;
  isPaused: boolean;
  performRoll: () => void;
  setActiveSkill: (skill: GatheringSkillId) => void;
  purchaseGatheringFaceUpgrade: (
    skill: GatheringSkillId,
    dieInstanceId: string,
  ) => void;
  purchaseGatheringRollSpeed: (skill: GatheringSkillId) => void;
  purchaseGatheringSlot: (skill: GatheringSkillId) => void;
  craftTierTwoGatheringDie: (skill: GatheringSkillId) => void;
  equipGatheringDie: (
    skill: GatheringSkillId,
    dieInstanceId: string,
    slotIndex: number,
  ) => void;
  unequipGatheringSlot: (
    skill: GatheringSkillId,
    slotIndex: number,
  ) => void;
  purchaseWorkshop: () => void;
  purchaseBarracks: () => void;
  purchaseFrontierForge: () => void;
  craftCombatDie: (dieId: CombatDieId) => void;
  equipCombatDie: (dieId: CombatDieId) => void;
  unequipCombatSlot: (slotIndex: number) => void;
  startCombat: (zoneId?: CombatZoneId) => void;
  performCombatRoll: () => void;
  performEnemyAttack: () => void;
  retreatFromCombat: () => void;
  togglePause: () => void;
  resetGame: () => void;
}

const INITIAL_RESOURCES: ResourceWallet = {
  wood: 0,
  oak: 0,
  stone: 0,
  copper: 0,
  monsterParts: 0,
};

const INITIAL_SEED = 0x0d1ce;

function createInitialSkillProgression(
  skill: GatheringSkillId,
): SkillProgression {
  const starterDie = createStarterGatheringDie(skill, 1);
  return {
    lifetimeXp: 0,
    spendableXp: 0,
    slots: 1,
    rollSpeedLevel: 0,
    inventory: [starterDie],
    loadout: [starterDie.id],
  };
}

const INITIAL_LAST_EVENTS: Record<GatheringSkillId, RollEvent | null> = {
  woodcutting: null,
  mining: null,
};

const INITIAL_BUILDINGS = {
  workshop: false,
  barracks: false,
  frontierForge: false,
};
const INITIAL_COMBAT: CombatState = {
  lifetimeXp: 0,
  inventory: createEmptyCombatInventory(),
  loadout: [null, null, null],
  zoneProgress: 0,
  wolfDenProgress: 0,
  forestTrophy: false,
  runCount: 0,
  rollCount: 0,
  enemyAttackCount: 0,
  session: null,
  lastRoll: null,
  lastKill: null,
  lastResult: null,
};

function countEquippedDice(
  loadout: readonly (CombatDieId | null)[],
  dieId: CombatDieId,
): number {
  return loadout.filter((equippedDieId) => equippedDieId === dieId).length;
}

function mergeDiceGains(
  current: Partial<Record<CombatDieId, number>>,
  gained: Partial<Record<CombatDieId, number>>,
): Partial<Record<CombatDieId, number>> {
  const merged = { ...current };

  for (const dieId of COMBAT_DIE_IDS) {
    const amount = gained[dieId] ?? 0;
    if (amount > 0) {
      merged[dieId] = (merged[dieId] ?? 0) + amount;
    }
  }

  return merged;
}

function getDefeatReason(
  loadout: readonly (CombatDieId | null)[],
): CombatResult["defeatReason"] {
  const equippedDice = loadout.flatMap((dieId) =>
    dieId === null ? [] : [COMBAT_DICE[dieId]],
  );
  const blockDice = equippedDice.filter((die) => die.role === "Block").length;
  const damageDice = equippedDice.filter((die) => die.role === "Damage").length;

  if (blockDice === 0) return "noBlock";
  if (damageDice <= 1) return "lowDamage";
  return "overwhelmed";
}

function migrateCombat(legacyCombat: unknown, slotCount: number): CombatState {
  const legacy = legacyCombat as
    | (Partial<CombatState> & {
        craftedDice?: Partial<Record<CombatDieId, boolean>>;
        inventory?: Partial<Record<CombatDieId, number>>;
      })
    | undefined;
  const inventory = createEmptyCombatInventory();

  for (const dieId of COMBAT_DIE_IDS) {
    inventory[dieId] =
      legacy?.inventory?.[dieId] ?? (legacy?.craftedDice?.[dieId] ? 1 : 0);
  }

  const legacyLoadout = legacy?.loadout?.filter(
    (dieId): dieId is CombatDieId | null =>
      dieId === null || COMBAT_DIE_IDS.includes(dieId),
  );
  const ownedLevelOneDice = COMBAT_DIE_IDS.filter((dieId) =>
    inventory[dieId] > 0 && COMBAT_DICE[dieId].levelRequirement <= 1,
  );
  const loadout = legacyLoadout
    ? [...legacyLoadout.slice(0, slotCount)]
    : ownedLevelOneDice.slice(0, slotCount);

  while (loadout.length < slotCount) {
    loadout.push(null);
  }

  const legacySession = legacy?.session;
  const session = legacySession
    ? {
        ...legacySession,
        encounterId: legacySession.encounterId ?? 1,
        zoneId: legacySession.zoneId ?? "forestEdge",
        enemiesDefeated: legacySession.enemiesDefeated ?? 0,
        xpGained: legacySession.xpGained ?? 0,
        monsterPartsGained: legacySession.monsterPartsGained ?? 0,
        diceGained: legacySession.diceGained ?? {},
        lootRolls: legacySession.lootRolls ?? [],
      }
    : null;
  const lastResult = legacy?.lastResult
    ? {
        ...legacy.lastResult,
        enemiesDefeated: legacy.lastResult.enemiesDefeated ?? 0,
        trophyGained: legacy.lastResult.trophyGained ?? false,
        defeatReason: legacy.lastResult.defeatReason ?? null,
        zoneId: legacy.lastResult.zoneId ?? "forestEdge",
        unlocksGained: legacy.lastResult.unlocksGained ?? [],
      }
    : null;
  const lastKill = legacy?.lastKill
    ? {
        ...legacy.lastKill,
        zoneId: legacy.lastKill.zoneId ?? "forestEdge",
        unlocksGained: legacy.lastKill.unlocksGained ?? [],
      }
    : null;

  return {
    ...INITIAL_COMBAT,
    lifetimeXp: legacy?.lifetimeXp ?? 0,
    inventory,
    loadout,
    zoneProgress: legacy?.zoneProgress ?? 0,
    wolfDenProgress: legacy?.wolfDenProgress ?? 0,
    forestTrophy: legacy?.forestTrophy ?? false,
    runCount: legacy?.runCount ?? 0,
    rollCount: legacy?.rollCount ?? 0,
    enemyAttackCount: legacy?.enemyAttackCount ?? 0,
    session,
    lastRoll: legacy?.lastRoll ?? null,
    lastKill,
    lastResult,
  };
}

function migrateGatheringProgression(
  skill: GatheringSkillId,
  legacyProgression: unknown,
): SkillProgression {
  const legacy = legacyProgression as
    | (Partial<SkillProgression> & { sharpenLevel?: number })
    | undefined;
  const slots = Math.max(
    1,
    Math.min(MAX_GATHERING_SLOTS, Math.floor(legacy?.slots ?? 1)),
  );
  const physicalInventory = Array.isArray(legacy?.inventory)
    ? legacy.inventory.flatMap((candidate) => {
        if (
          typeof candidate?.id !== "string" ||
          !isGatheringDieKind(candidate.kind) ||
          getGatheringDieSkill(candidate.kind) !== skill
        ) {
          return [];
        }

        return [
          {
            id: candidate.id,
            kind: candidate.kind,
            upgradeLevel: Math.max(
              0,
              Math.min(
                GATHERING_FACE_UPGRADE_COSTS.length,
                Math.floor(candidate.upgradeLevel ?? 0),
              ),
            ),
          },
        ];
      })
    : [];

  if (physicalInventory.length > 0) {
    const highestUpgradeByKind = new Map<string, number>();
    for (const instance of physicalInventory) {
      highestUpgradeByKind.set(
        instance.kind,
        Math.max(
          highestUpgradeByKind.get(instance.kind) ?? 0,
          instance.upgradeLevel,
        ),
      );
    }
    const inventory = physicalInventory.map((instance) => ({
      ...instance,
      upgradeLevel: highestUpgradeByKind.get(instance.kind) ?? 0,
    }));
    const inventoryIds = new Set(inventory.map((instance) => instance.id));
    const equippedIds = new Set<string>();
    const loadout: Array<string | null> = Array.isArray(legacy?.loadout)
      ? legacy.loadout.slice(0, slots).map((id) => {
          if (
            typeof id !== "string" ||
            !inventoryIds.has(id) ||
            equippedIds.has(id)
          ) {
            return null;
          }
          equippedIds.add(id);
          return id;
        })
      : [];

    for (const instance of inventory) {
      if (loadout.length >= slots) break;
      if (!equippedIds.has(instance.id)) {
        loadout.push(instance.id);
        equippedIds.add(instance.id);
      }
    }

    let nextIndex = inventory.length + 1;
    while (loadout.length < slots) {
      while (inventoryIds.has(`${skill}-die-${nextIndex}`)) nextIndex += 1;
      const starterDie = createStarterGatheringDie(skill, nextIndex);
      inventory.push(starterDie);
      inventoryIds.add(starterDie.id);
      loadout.push(starterDie.id);
      nextIndex += 1;
    }

    return {
      lifetimeXp: legacy?.lifetimeXp ?? 0,
      spendableXp: legacy?.spendableXp ?? 0,
      slots,
      rollSpeedLevel: Math.max(
        0,
        Math.min(
          GATHERING_ROLL_SPEED_COSTS.length,
          Math.floor(legacy?.rollSpeedLevel ?? 0),
        ),
      ),
      inventory,
      loadout,
    };
  }

  const legacyUpgradeLevel = Math.max(
    0,
    Math.min(
      GATHERING_FACE_UPGRADE_COSTS.length,
      Math.floor(legacy?.sharpenLevel ?? 0),
    ),
  );
  const inventory = Array.from({ length: slots }, (_, index) =>
    createStarterGatheringDie(skill, index + 1, index === 0 ? legacyUpgradeLevel : 0),
  );

  return {
    lifetimeXp: legacy?.lifetimeXp ?? 0,
    spendableXp: legacy?.spendableXp ?? 0,
    slots,
    rollSpeedLevel: 0,
    inventory,
    loadout: inventory.map((instance) => instance.id),
  };
}

export function migratePersistedGameState(
  persistedState: unknown,
  version: number,
): Partial<GameState> {
  if (version >= 10) {
    return persistedState as Partial<GameState>;
  }

  const legacy = persistedState as Partial<GameState>;
  const buildings = { ...INITIAL_BUILDINGS, ...legacy.buildings };
  return {
    ...legacy,
    resources: { ...INITIAL_RESOURCES, ...legacy.resources },
    activeSkill: legacy.activeSkill ?? "woodcutting",
    woodcutting: migrateGatheringProgression(
      "woodcutting",
      legacy.woodcutting,
    ),
    mining: migrateGatheringProgression("mining", legacy.mining),
    buildings,
    combat: migrateCombat(
      legacy.combat,
      buildings.barracks ? 4 : 3,
    ),
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      resources: INITIAL_RESOURCES,
      activeSkill: "woodcutting",
      woodcutting: createInitialSkillProgression("woodcutting"),
      mining: createInitialSkillProgression("mining"),
      buildings: INITIAL_BUILDINGS,
      combat: INITIAL_COMBAT,
      seed: INITIAL_SEED,
      rollCount: 0,
      lastEvents: INITIAL_LAST_EVENTS,
      isPaused: false,
      performRoll: () => {
        set((state) => {
          if (state.combat.session !== null) {
            return state;
          }

          const nextRollId = state.rollCount + 1;
          const skill = state.activeSkill;
          const skillState = state[skill];
          const dice = getGatheringDice(
            skillState.inventory,
            skillState.loadout,
          );
          if (dice.length === 0) {
            return state;
          }
          const outcome = resolveRoll(state.seed, nextRollId, dice);

          return {
            seed: outcome.nextSeed,
            rollCount: nextRollId,
            lastEvents: {
              ...state.lastEvents,
              [skill]: outcome.event,
            },
            [skill]: {
              ...skillState,
              lifetimeXp: skillState.lifetimeXp + SKILL_XP_PER_ROLL,
              spendableXp: skillState.spendableXp + SKILL_XP_PER_ROLL,
            },
            resources: {
              wood: state.resources.wood + outcome.event.gains.wood,
              oak: state.resources.oak + outcome.event.gains.oak,
              stone: state.resources.stone + outcome.event.gains.stone,
              copper: state.resources.copper + outcome.event.gains.copper,
              monsterParts:
                state.resources.monsterParts + outcome.event.gains.monsterParts,
            },
          };
        });
      },
      setActiveSkill: (skill) =>
        set((state) =>
          state.activeSkill === skill
            ? state
            : { activeSkill: skill, isPaused: false },
        ),
      purchaseGatheringFaceUpgrade: (skill, dieInstanceId) => {
        set((state) => {
          const skillState = state[skill];
          const dieIndex = skillState.inventory.findIndex(
            (instance) => instance.id === dieInstanceId,
          );
          const die = skillState.inventory[dieIndex];
          const cost = die ? getGatheringFaceUpgradeCost(die) : undefined;

          if (
            dieIndex === -1 ||
            cost === undefined ||
            skillState.spendableXp < cost
          ) {
            return state;
          }

          const inventory = skillState.inventory.map((instance) =>
            instance.kind === die.kind
              ? { ...instance, upgradeLevel: die.upgradeLevel + 1 }
              : instance,
          );

          return {
            lastEvents: { ...state.lastEvents, [skill]: null },
            [skill]: {
              ...skillState,
              inventory,
              spendableXp: skillState.spendableXp - cost,
            },
          };
        });
      },
      purchaseGatheringRollSpeed: (skill) => {
        set((state) => {
          const skillState = state[skill];
          const cost = GATHERING_ROLL_SPEED_COSTS[skillState.rollSpeedLevel];

          if (cost === undefined || skillState.spendableXp < cost) {
            return state;
          }

          return {
            [skill]: {
              ...skillState,
              rollSpeedLevel: skillState.rollSpeedLevel + 1,
              spendableXp: skillState.spendableXp - cost,
            },
          };
        });
      },
      purchaseGatheringSlot: (skill) => {
        set((state) => {
          const skillState = state[skill];
          const cost = getGatheringSlotCost(skillState.slots);

          if (cost === undefined || skillState.spendableXp < cost) {
            return state;
          }

          let nextIndex = skillState.inventory.length + 1;
          while (
            skillState.inventory.some(
              (instance) => instance.id === `${skill}-die-${nextIndex}`,
            )
          ) {
            nextIndex += 1;
          }
          const starterDie = createStarterGatheringDie(skill, nextIndex);
          const starterKind = starterDie.kind;
          const blueprintLevel = skillState.inventory.find(
            (instance) => instance.kind === starterKind,
          )?.upgradeLevel ?? 0;
          const upgradedStarterDie = {
            ...starterDie,
            upgradeLevel: blueprintLevel,
          };

          return {
            lastEvents: { ...state.lastEvents, [skill]: null },
            [skill]: {
              ...skillState,
              slots: skillState.slots + 1,
              spendableXp: skillState.spendableXp - cost,
              inventory: [...skillState.inventory, upgradedStarterDie],
              loadout: [...skillState.loadout, upgradedStarterDie.id],
            },
          };
        });
      },
      craftTierTwoGatheringDie: (skill) => {
        set((state) => {
          const recipe = getTierTwoGatheringRecipe(skill);

          if (
            !state.combat.forestTrophy ||
            !canAfford(state.resources, recipe.cost)
          ) {
            return state;
          }

          const skillState = state[skill];
          let nextIndex = skillState.inventory.length + 1;
          while (
            skillState.inventory.some(
              (instance) => instance.id === `${skill}-die-${nextIndex}`,
            )
          ) {
            nextIndex += 1;
          }
          const craftedDie = createGatheringDieInstance(
            skill,
            recipe.kind,
            nextIndex,
          );

          return {
            resources: subtractCost(state.resources, recipe.cost),
            [skill]: {
              ...skillState,
              inventory: [...skillState.inventory, craftedDie],
            },
          };
        });
      },
      equipGatheringDie: (skill, dieInstanceId, slotIndex) => {
        set((state) => {
          const skillState = state[skill];
          const die = skillState.inventory.find(
            (instance) => instance.id === dieInstanceId,
          );
          const skillLevel = getLevelProgress(skillState.lifetimeXp).level;

          if (
            die === undefined ||
            getGatheringDieSkill(die.kind) !== skill ||
            getGatheringDieLevelRequirement(die.kind) > skillLevel ||
            slotIndex < 0 ||
            slotIndex >= skillState.slots ||
            slotIndex >= skillState.loadout.length ||
            skillState.loadout[slotIndex] === dieInstanceId
          ) {
            return state;
          }

          const loadout = [...skillState.loadout];
          const existingSlot = loadout.indexOf(dieInstanceId);
          if (existingSlot >= 0) {
            loadout[existingSlot] = loadout[slotIndex];
          }
          loadout[slotIndex] = dieInstanceId;

          return {
            lastEvents: { ...state.lastEvents, [skill]: null },
            [skill]: { ...skillState, loadout },
          };
          });
        },
      unequipGatheringSlot: (skill, slotIndex) => {
        set((state) => {
          const skillState = state[skill];
          if (
            slotIndex < 0 ||
            slotIndex >= skillState.loadout.length ||
            skillState.loadout[slotIndex] === null
          ) {
            return state;
          }

          const loadout = [...skillState.loadout];
          loadout[slotIndex] = null;
          return {
            lastEvents: { ...state.lastEvents, [skill]: null },
            [skill]: { ...skillState, loadout },
          };
        });
      },
      purchaseWorkshop: () => {
        set((state) => {
          if (state.buildings.workshop || !canAfford(state.resources, WORKSHOP_COST)) {
            return state;
          }

          return {
            resources: subtractCost(state.resources, WORKSHOP_COST),
            buildings: { ...state.buildings, workshop: true },
          };
        });
      },
      purchaseBarracks: () => {
        set((state) => {
          if (
            state.buildings.barracks ||
            !state.combat.forestTrophy ||
            !canAfford(state.resources, BARRACKS_COST)
          ) {
            return state;
          }

          return {
            resources: subtractCost(state.resources, BARRACKS_COST),
            buildings: { ...state.buildings, barracks: true },
            combat: {
              ...state.combat,
              loadout:
                state.combat.loadout.length >= 4
                  ? state.combat.loadout
                  : [...state.combat.loadout, null],
            },
          };
        });
      },
      purchaseFrontierForge: () => {
        set((state) => {
          if (
            state.buildings.frontierForge ||
            !state.combat.forestTrophy ||
            !canAfford(state.resources, FRONTIER_FORGE_COST)
          ) {
            return state;
          }

          return {
            resources: subtractCost(state.resources, FRONTIER_FORGE_COST),
            buildings: { ...state.buildings, frontierForge: true },
          };
        });
      },
      craftCombatDie: (dieId) => {
        set((state) => {
          const recipe = COMBAT_DIE_RECIPES.find((candidate) => candidate.id === dieId);
          const stationReady =
            recipe?.station === "frontierForge"
              ? state.buildings.frontierForge
              : state.buildings.workshop;

          if (
            !stationReady ||
            recipe === undefined ||
            !canAfford(state.resources, recipe.cost)
          ) {
            return state;
          }

          return {
            resources: subtractCost(state.resources, recipe.cost),
            combat: {
              ...state.combat,
              inventory: {
                ...state.combat.inventory,
                [dieId]: state.combat.inventory[dieId] + 1,
              },
            },
          };
        });
      },
      equipCombatDie: (dieId) => {
        set((state) => {
          if (state.combat.session !== null) {
            return state;
          }

          const definition = COMBAT_DICE[dieId];
          const combatLevel = getLevelProgress(state.combat.lifetimeXp).level;
          const equippedCopies = countEquippedDice(state.combat.loadout, dieId);
          const emptySlotIndex = state.combat.loadout.findIndex(
            (equippedDieId) => equippedDieId === null,
          );

          if (
            definition.levelRequirement > combatLevel ||
            equippedCopies >= state.combat.inventory[dieId] ||
            emptySlotIndex === -1
          ) {
            return state;
          }

          const loadout = [...state.combat.loadout];
          loadout[emptySlotIndex] = dieId;

          return { combat: { ...state.combat, loadout } };
        });
      },
      unequipCombatSlot: (slotIndex) => {
        set((state) => {
          if (
            state.combat.session !== null ||
            slotIndex < 0 ||
            slotIndex >= state.combat.loadout.length ||
            state.combat.loadout[slotIndex] === null
          ) {
            return state;
          }

          const loadout = [...state.combat.loadout];
          loadout[slotIndex] = null;

          return { combat: { ...state.combat, loadout } };
        });
      },
      startCombat: (zoneId = "forestEdge") => {
        set((state) => {
          const combatLevel = getLevelProgress(state.combat.lifetimeXp).level;
          const equippedDice = state.combat.loadout.flatMap((dieId) =>
            dieId === null ? [] : [COMBAT_DICE[dieId]],
          );
          const ownsLoadout = COMBAT_DIE_IDS.every(
            (dieId) =>
              countEquippedDice(state.combat.loadout, dieId) <=
              state.combat.inventory[dieId],
          );
          const meetsLevelRequirements = equippedDice.every(
            (die) => die.levelRequirement <= combatLevel,
          );
          const hasDamageDie = equippedDice.some((die) => die.role === "Damage");

          if (
            !state.buildings.workshop ||
            state.combat.session !== null ||
            (zoneId === "wolfDen" && !state.buildings.frontierForge) ||
            !ownsLoadout ||
            !meetsLevelRequirements ||
            !hasDamageDie
          ) {
            return state;
          }

          const runCount = state.combat.runCount + 1;
          const bossIsReady =
            zoneId === "forestEdge" &&
            state.combat.zoneProgress >= 20 &&
            !state.combat.forestTrophy;
          const selection =
            zoneId === "wolfDen"
              ? selectWolfDenEnemy(state.seed)
              : bossIsReady
                ? { enemy: FOREST_BRUTE, nextSeed: state.seed }
                : selectForestEdgeEnemy(state.seed);

          return {
            seed: selection.nextSeed,
            combat: {
              ...state.combat,
              runCount,
              session: {
                id: runCount,
                encounterId: 1,
                zoneId,
                enemyId: selection.enemy.id,
                enemyHp: selection.enemy.maxHp,
                playerHp: PLAYER_MAX_HP,
                block: 0,
                scouted: false,
                lastEnemyAttack: null,
                enemiesDefeated: 0,
                xpGained: 0,
                monsterPartsGained: 0,
                diceGained: {},
                lootRolls: [],
              },
              lastRoll: null,
              lastKill: null,
              lastResult: null,
            },
          };
        });
      },
      performCombatRoll: () => {
        set((state) => {
          const session = state.combat.session;

          if (session === null) {
            return state;
          }

          const dice = state.combat.loadout.flatMap((dieId) =>
            dieId === null ? [] : [COMBAT_DICE[dieId]],
          );
          const rollCount = state.combat.rollCount + 1;
          const outcome = resolveCombatRoll(state.seed, rollCount, dice);
          const enemy = COMBAT_ENEMIES[session.enemyId];
          const enemyHp = Math.max(0, session.enemyHp - outcome.event.damage);
          const block = session.block + outcome.event.block;
          const scouted = session.scouted || outcome.event.light > 0;

          if (enemyHp > 0) {
            return {
              seed: outcome.nextSeed,
              combat: {
                ...state.combat,
                rollCount,
                lastRoll: outcome.event,
                session: { ...session, enemyHp, block, scouted },
              },
            };
          }

          const loot = resolveCombatLoot(outcome.nextSeed, enemy, scouted);
          const isFirstBossClear =
            enemy.id === "forestBrute" && !state.combat.forestTrophy;
          const unlocksGained = isFirstBossClear
            ? [...FOREST_BRUTE_FIRST_CLEAR_UNLOCKS]
            : [];
          const diceGained = { ...loot.dice };
          const lootRolls = [...loot.rolls];

          if (isFirstBossClear) {
            diceGained.bruteCleaver = (diceGained.bruteCleaver ?? 0) + 1;
            lootRolls.push({ type: "die", dieId: "bruteCleaver" });
          }

          const inventory = { ...state.combat.inventory };

          for (const dieId of COMBAT_DIE_IDS) {
            inventory[dieId] += diceGained[dieId] ?? 0;
          }

          const runEnemiesDefeated = session.enemiesDefeated + 1;
          const runXpGained = session.xpGained + enemy.xpReward;
          const runMonsterPartsGained =
            session.monsterPartsGained + loot.monsterParts;
          const runDiceGained = mergeDiceGains(session.diceGained, diceGained);
          const runLootRolls = [...session.lootRolls, ...lootRolls];
          const zoneProgress =
            session.zoneId === "forestEdge" && !enemy.isBoss
              ? Math.min(20, state.combat.zoneProgress + 1)
              : state.combat.zoneProgress;
          const wolfDenProgress =
            session.zoneId === "wolfDen"
              ? Math.min(10, state.combat.wolfDenProgress + 1)
              : state.combat.wolfDenProgress;
          const currentZoneProgress =
            session.zoneId === "wolfDen" ? wolfDenProgress : zoneProgress;

          if (enemy.isBoss) {
            return {
              seed: loot.nextSeed,
              resources: {
                ...state.resources,
                monsterParts: state.resources.monsterParts + loot.monsterParts,
              },
              combat: {
                ...state.combat,
                lifetimeXp: state.combat.lifetimeXp + enemy.xpReward,
                inventory,
                zoneProgress,
                wolfDenProgress,
                forestTrophy: state.combat.forestTrophy || isFirstBossClear,
                rollCount,
                session: null,
                lastRoll: outcome.event,
                lastResult: {
                  type: "victory",
                  zoneId: session.zoneId,
                  enemyName: enemy.name,
                  xpGained: runXpGained,
                  monsterPartsGained: runMonsterPartsGained,
                  enemiesDefeated: runEnemiesDefeated,
                  trophyGained: isFirstBossClear,
                  diceGained: runDiceGained,
                  lootRolls: runLootRolls,
                  defeatReason: null,
                  unlocksGained,
                },
                lastKill: {
                  id: rollCount,
                  zoneId: session.zoneId,
                  enemyName: enemy.name,
                  isBoss: true,
                  xpGained: enemy.xpReward,
                  monsterPartsGained: loot.monsterParts,
                  diceGained,
                  scouted,
                  zoneProgress: currentZoneProgress,
                  trophyGained: isFirstBossClear,
                  unlocksGained,
                },
              },
            };
          }

          const bossIsNext =
            session.zoneId === "forestEdge" &&
            zoneProgress >= 20 &&
            !state.combat.forestTrophy;
          const nextSelection =
            session.zoneId === "wolfDen"
              ? selectWolfDenEnemy(loot.nextSeed)
              : bossIsNext
                ? { enemy: FOREST_BRUTE, nextSeed: loot.nextSeed }
                : selectForestEdgeEnemy(loot.nextSeed);

          return {
            seed: nextSelection.nextSeed,
            resources: {
              ...state.resources,
              monsterParts: state.resources.monsterParts + loot.monsterParts,
            },
            combat: {
              ...state.combat,
              lifetimeXp: state.combat.lifetimeXp + enemy.xpReward,
              inventory,
              zoneProgress,
              wolfDenProgress,
              rollCount,
              session: {
                ...session,
                encounterId: session.encounterId + 1,
                enemyId: nextSelection.enemy.id,
                enemyHp: nextSelection.enemy.maxHp,
                block: 0,
                scouted: false,
                lastEnemyAttack: null,
                enemiesDefeated: runEnemiesDefeated,
                xpGained: runXpGained,
                monsterPartsGained: runMonsterPartsGained,
                diceGained: runDiceGained,
                lootRolls: runLootRolls,
              },
              lastRoll: outcome.event,
              lastKill: {
                id: rollCount,
                zoneId: session.zoneId,
                enemyName: enemy.name,
                isBoss: false,
                xpGained: enemy.xpReward,
                monsterPartsGained: loot.monsterParts,
                diceGained,
                scouted,
                zoneProgress: currentZoneProgress,
                trophyGained: false,
                unlocksGained: [],
              },
            },
          };
        });
      },
      performEnemyAttack: () => {
        set((state) => {
          const session = state.combat.session;

          if (session === null) {
            return state;
          }

          const attack = resolveEnemyAttack(
            session.playerHp,
            session.block,
            COMBAT_ENEMIES[session.enemyId].attack,
          );
          const enemyAttackCount = state.combat.enemyAttackCount + 1;

          if (attack.playerHp <= 0) {
            return {
              combat: {
                ...state.combat,
                enemyAttackCount,
                session: null,
                lastResult: {
                  type: "defeat",
                  zoneId: session.zoneId,
                  enemyName: COMBAT_ENEMIES[session.enemyId].name,
                  xpGained: session.xpGained,
                  monsterPartsGained: session.monsterPartsGained,
                  enemiesDefeated: session.enemiesDefeated,
                  trophyGained: false,
                  diceGained: session.diceGained,
                  lootRolls: session.lootRolls,
                  defeatReason: getDefeatReason(state.combat.loadout),
                  unlocksGained: [],
                },
              },
            };
          }

          return {
            combat: {
              ...state.combat,
              enemyAttackCount,
              session: {
                ...session,
                playerHp: attack.playerHp,
                block: 0,
                lastEnemyAttack: {
                  id: enemyAttackCount,
                  damageTaken: attack.damageTaken,
                  blockUsed: attack.blockUsed,
                },
              },
            },
          };
        });
      },
      retreatFromCombat: () => {
        set((state) => {
          if (state.combat.session === null) {
            return state;
          }

          const session = state.combat.session;

          return {
            combat: {
              ...state.combat,
              session: null,
              lastResult: {
                type: "retreat",
                zoneId: session.zoneId,
                enemyName: COMBAT_ENEMIES[session.enemyId].name,
                xpGained: session.xpGained,
                monsterPartsGained: session.monsterPartsGained,
                enemiesDefeated: session.enemiesDefeated,
                trophyGained: false,
                diceGained: session.diceGained,
                lootRolls: session.lootRolls,
                defeatReason: null,
                unlocksGained: [],
              },
            },
          };
        });
      },
      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
      resetGame: () =>
        set({
          resources: INITIAL_RESOURCES,
          activeSkill: "woodcutting",
          woodcutting: createInitialSkillProgression("woodcutting"),
          mining: createInitialSkillProgression("mining"),
          buildings: INITIAL_BUILDINGS,
          combat: INITIAL_COMBAT,
          seed: INITIAL_SEED,
          rollCount: 0,
          lastEvents: INITIAL_LAST_EVENTS,
          isPaused: false,
        }),
    }),
    {
      name: "dicehaven-save",
      version: 10,
      migrate: migratePersistedGameState,
      partialize: ({
        resources,
        activeSkill,
        woodcutting,
        mining,
        buildings,
        combat,
        seed,
        rollCount,
      }) => ({
        resources,
        activeSkill,
        woodcutting,
        mining,
        buildings,
        combat,
        seed,
        rollCount,
      }),
    },
  ),
);
