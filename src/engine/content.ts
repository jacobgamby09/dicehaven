import {
  GATHERING_FACE_UPGRADE_COSTS,
  TIER_TWO_GATHERING_FACE_UPGRADE_COSTS,
} from "./progression";
import type { DieDefinition, DieFace, ResourceId } from "./roll";

export type GatheringSkillId = "woodcutting" | "mining";
export type GatheringDieKind =
  | "dullAxe"
  | "oakheartAxe"
  | "rustyPickaxe"
  | "copperProspector";

export interface GatheringDieInstance {
  id: string;
  kind: GatheringDieKind;
  upgradeLevel: number;
}

type ProduceFace = Extract<DieFace, { type: "produce" }>;

interface GatheringDieConfig {
  kind: GatheringDieKind;
  levelRequirement: number;
  material: DieDefinition["material"];
  name: string;
  skill: GatheringSkillId;
  tier: 1 | 2;
  baseFaces: readonly ProduceFace[];
  upgradeFaceOrder: readonly number[];
}

export interface GatheringDieRecipe {
  cost: Partial<Record<ResourceId, number>>;
  description: string;
  kind: GatheringDieKind;
  levelRequirement: number;
  name: string;
  outputLabel: string;
  skill: GatheringSkillId;
}

const STARTER_FACE_ORDER = [0, 1, 2, 3, 4, 5] as const;
const SPECIALIST_FACE_ORDER = [1, 0, 3, 2, 5, 4] as const;

const GATHERING_DIE_CONFIGS: Record<GatheringDieKind, GatheringDieConfig> = {
  dullAxe: {
    kind: "dullAxe",
    levelRequirement: 1,
    material: "wood",
    name: "Dull Axe",
    skill: "woodcutting",
    tier: 1,
    baseFaces: [0, 0, 0, 1, 1, 1].map((amount) => ({
      type: "produce" as const,
      resource: "wood" as const,
      amount,
    })),
    upgradeFaceOrder: STARTER_FACE_ORDER,
  },
  oakheartAxe: {
    kind: "oakheartAxe",
    levelRequirement: 5,
    material: "oak",
    name: "Oakheart Axe",
    skill: "woodcutting",
    tier: 2,
    baseFaces: [
      { type: "produce", resource: "wood", amount: 1 },
      { type: "produce", resource: "oak", amount: 0 },
      { type: "produce", resource: "wood", amount: 1 },
      { type: "produce", resource: "oak", amount: 1 },
      { type: "produce", resource: "wood", amount: 2 },
      { type: "produce", resource: "oak", amount: 1 },
    ],
    upgradeFaceOrder: SPECIALIST_FACE_ORDER,
  },
  rustyPickaxe: {
    kind: "rustyPickaxe",
    levelRequirement: 1,
    material: "stone",
    name: "Rusty Pickaxe",
    skill: "mining",
    tier: 1,
    baseFaces: [0, 0, 0, 1, 1, 1].map((amount) => ({
      type: "produce" as const,
      resource: "stone" as const,
      amount,
    })),
    upgradeFaceOrder: STARTER_FACE_ORDER,
  },
  copperProspector: {
    kind: "copperProspector",
    levelRequirement: 5,
    material: "copper",
    name: "Copper Prospector",
    skill: "mining",
    tier: 2,
    baseFaces: [
      { type: "produce", resource: "stone", amount: 1 },
      { type: "produce", resource: "copper", amount: 0 },
      { type: "produce", resource: "stone", amount: 1 },
      { type: "produce", resource: "copper", amount: 1 },
      { type: "produce", resource: "stone", amount: 2 },
      { type: "produce", resource: "copper", amount: 1 },
    ],
    upgradeFaceOrder: SPECIALIST_FACE_ORDER,
  },
};

export const GATHERING_DIE_KINDS = Object.keys(
  GATHERING_DIE_CONFIGS,
) as GatheringDieKind[];

const TIER_TWO_RECIPES: Record<GatheringSkillId, GatheringDieRecipe> = {
  woodcutting: {
    cost: { wood: 120, stone: 80, monsterParts: 12 },
    description:
      "A specialist die that trades pure Wood output for Oak Logs.",
    kind: "oakheartAxe",
    levelRequirement: 5,
    name: "Oakheart Axe",
    outputLabel: "Wood + Oak Logs",
    skill: "woodcutting",
  },
  mining: {
    cost: { wood: 80, stone: 120, monsterParts: 12 },
    description:
      "A specialist die that trades pure Stone output for Copper Ore.",
    kind: "copperProspector",
    levelRequirement: 5,
    name: "Copper Prospector",
    outputLabel: "Stone + Copper Ore",
    skill: "mining",
  },
};

export const MAX_GATHERING_DIE_UPGRADE_LEVEL = 6;

function clampUpgradeLevel(upgradeLevel: number): number {
  return Math.max(
    0,
    Math.min(MAX_GATHERING_DIE_UPGRADE_LEVEL, Math.floor(upgradeLevel)),
  );
}

export function isGatheringDieKind(value: unknown): value is GatheringDieKind {
  return (
    typeof value === "string" &&
    GATHERING_DIE_KINDS.includes(value as GatheringDieKind)
  );
}

export function getStarterGatheringDieKind(
  skill: GatheringSkillId,
): GatheringDieKind {
  return skill === "woodcutting" ? "dullAxe" : "rustyPickaxe";
}

export function createGatheringDieInstance(
  skill: GatheringSkillId,
  kind: GatheringDieKind,
  index: number,
  upgradeLevel = 0,
): GatheringDieInstance {
  if (GATHERING_DIE_CONFIGS[kind].skill !== skill) {
    throw new Error(`${kind} does not belong to ${skill}.`);
  }

  return {
    id: `${skill}-die-${index}`,
    kind,
    upgradeLevel: clampUpgradeLevel(upgradeLevel),
  };
}

export function createStarterGatheringDie(
  skill: GatheringSkillId,
  index: number,
  upgradeLevel = 0,
): GatheringDieInstance {
  return createGatheringDieInstance(
    skill,
    getStarterGatheringDieKind(skill),
    index,
    upgradeLevel,
  );
}

export function getGatheringDieName(kind: GatheringDieKind): string {
  return GATHERING_DIE_CONFIGS[kind].name;
}

export function getGatheringDieSkill(
  kind: GatheringDieKind,
): GatheringSkillId {
  return GATHERING_DIE_CONFIGS[kind].skill;
}

export function getGatheringDieTier(kind: GatheringDieKind): 1 | 2 {
  return GATHERING_DIE_CONFIGS[kind].tier;
}

export function getGatheringDieLevelRequirement(
  kind: GatheringDieKind,
): number {
  return GATHERING_DIE_CONFIGS[kind].levelRequirement;
}

export function getTierTwoGatheringRecipe(
  skill: GatheringSkillId,
): GatheringDieRecipe {
  return TIER_TWO_RECIPES[skill];
}

export function getGatheringFaceUpgradeCost(
  instance: GatheringDieInstance,
): number | undefined {
  const config = GATHERING_DIE_CONFIGS[instance.kind];
  const costs =
    config.tier === 1
      ? GATHERING_FACE_UPGRADE_COSTS
      : TIER_TWO_GATHERING_FACE_UPGRADE_COSTS;
  return costs[clampUpgradeLevel(instance.upgradeLevel)];
}

export function getGatheringDieFaces(
  instance: GatheringDieInstance,
): readonly ProduceFace[] {
  const config = GATHERING_DIE_CONFIGS[instance.kind];
  const faces = config.baseFaces.map((face) => ({ ...face }));
  const appliedUpgrades = clampUpgradeLevel(instance.upgradeLevel);

  for (let step = 0; step < appliedUpgrades; step += 1) {
    const faceIndex = config.upgradeFaceOrder[step];
    faces[faceIndex] = {
      ...faces[faceIndex],
      amount: faces[faceIndex].amount + 1,
    };
  }

  return faces;
}

export function getGatheringDieDefinition(
  instance: GatheringDieInstance,
): DieDefinition {
  const config = GATHERING_DIE_CONFIGS[instance.kind];

  return {
    id: instance.id,
    name: config.name,
    material: config.material,
    faces: getGatheringDieFaces(instance),
  };
}

export function getGatheringDice(
  inventory: readonly GatheringDieInstance[],
  loadout: readonly (string | null)[],
): readonly DieDefinition[] {
  const byId = new Map(inventory.map((instance) => [instance.id, instance]));

  return loadout.flatMap((instanceId) => {
    if (instanceId === null) return [];
    const instance = byId.get(instanceId);
    return instance ? [getGatheringDieDefinition(instance)] : [];
  });
}

export interface GatheringFaceUpgradePreview {
  after: number;
  before: number;
  faceIndex: number;
  resource: ResourceId;
}

export function getNextGatheringFaceUpgrade(
  instance: GatheringDieInstance,
): GatheringFaceUpgradePreview | null {
  const config = GATHERING_DIE_CONFIGS[instance.kind];
  const upgradeStep = clampUpgradeLevel(instance.upgradeLevel);
  if (upgradeStep >= config.upgradeFaceOrder.length) {
    return null;
  }

  const faceIndex = config.upgradeFaceOrder[upgradeStep];
  const face = getGatheringDieFaces(instance)[faceIndex];
  return {
    after: face.amount + 1,
    before: face.amount,
    faceIndex,
    resource: face.resource,
  };
}
