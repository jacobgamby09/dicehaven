import {
  getGatheringDieName,
  getStarterGatheringDieKind,
  getTierTwoGatheringRecipe,
  type GatheringDieKind,
  type GatheringSkillId,
} from "./content";
import {
  GATHERING_FACE_UPGRADE_COSTS,
  GATHERING_ROLL_INTERVALS_MS,
  GATHERING_ROLL_SPEED_COSTS,
  GATHERING_SLOT_COSTS,
  TIER_TWO_GATHERING_FACE_UPGRADE_COSTS,
} from "./progression";

export type GatheringTalentEffect =
  | { type: "root" }
  | { type: "blueprint" }
  | { type: "face"; dieKind: GatheringDieKind; rank: number }
  | { type: "speed"; rank: number }
  | { type: "slot"; slots: 2 | 3 };

export interface GatheringTalentNode {
  id: string;
  label: string;
  description: string;
  icon: string;
  x: number;
  y: number;
  size: "small" | "large";
  prerequisiteIds: readonly string[];
  cost?: number;
  effect: GatheringTalentEffect;
}

const FACE_POSITIONS = [
  { x: 215, y: 565 },
  { x: 270, y: 470 },
  { x: 225, y: 370 },
  { x: 285, y: 275 },
  { x: 225, y: 175 },
  { x: 315, y: 85 },
] as const;

const SPEED_POSITIONS = [
  { x: 485, y: 540 },
  { x: 515, y: 420 },
  { x: 470, y: 295 },
  { x: 540, y: 165 },
] as const;

const SLOT_POSITIONS = [
  { x: 720, y: 505 },
  { x: 730, y: 300 },
] as const;

const SPECIALIST_POSITIONS = [
  { x: 980, y: 455 },
  { x: 1040, y: 370 },
  { x: 970, y: 285 },
  { x: 1050, y: 200 },
  { x: 970, y: 115 },
  { x: 1080, y: 55 },
] as const;

function createFaceNodes(
  skill: GatheringSkillId,
  dieKind: GatheringDieKind,
  prefix: "starter" | "specialist",
): GatheringTalentNode[] {
  const isSpecialist = prefix === "specialist";
  const positions = isSpecialist ? SPECIALIST_POSITIONS : FACE_POSITIONS;
  const costs = isSpecialist
    ? TIER_TWO_GATHERING_FACE_UPGRADE_COSTS
    : GATHERING_FACE_UPGRADE_COSTS;
  const dieName = getGatheringDieName(dieKind);
  const action = skill === "woodcutting" ? "Sharpen" : "Hone";

  return positions.map((position, index) => {
    const rank = index + 1;
    const id = `${prefix}-face-${rank}`;
    return {
      id,
      label: isSpecialist
        ? `${dieName} face ${rank}`
        : `${action} face ${rank}`,
      description: `Permanently improves the next face on every ${dieName}.`,
      icon: `${rank}`,
      x: position.x,
      y: position.y,
      size: rank === 6 ? "large" : "small",
      prerequisiteIds: [
        rank === 1
          ? isSpecialist
            ? "specialist-blueprint"
            : "skill-root"
          : `${prefix}-face-${rank - 1}`,
      ],
      cost: costs[index],
      effect: { type: "face", dieKind, rank },
    };
  });
}

function createSpeedNodes(skill: GatheringSkillId): GatheringTalentNode[] {
  const labels =
    skill === "woodcutting"
      ? ["Find the rhythm", "Quick hands", "Seasoned crew", "Forest cadence"]
      : ["Steady swing", "Quick hands", "Deep rhythm", "Miner's cadence"];

  return SPEED_POSITIONS.map((position, index) => {
    const rank = index + 1;
    const before = GATHERING_ROLL_INTERVALS_MS[index] / 1_000;
    const after = GATHERING_ROLL_INTERVALS_MS[index + 1] / 1_000;
    return {
      id: `speed-${rank}`,
      label: labels[index],
      description: `Shortens every roll from ${before.toFixed(1)}s to ${after.toFixed(1)}s.`,
      icon: "↻",
      x: position.x,
      y: position.y,
      size: rank === 4 ? "large" : "small",
      prerequisiteIds: [rank === 1 ? "skill-root" : `speed-${rank - 1}`],
      cost: GATHERING_ROLL_SPEED_COSTS[index],
      effect: { type: "speed", rank },
    };
  });
}

function createSlotNodes(skill: GatheringSkillId): GatheringTalentNode[] {
  const names =
    skill === "woodcutting"
      ? ["Second lumberjack", "Full logging crew"]
      : ["Second miner", "Full mining crew"];

  return SLOT_POSITIONS.map((position, index) => {
    const slots = (index + 2) as 2 | 3;
    return {
      id: `slot-${slots}`,
      label: names[index],
      description: `Unlocks dice slot ${slots} and grants a new starter die.`,
      icon: `+${slots}`,
      x: position.x,
      y: position.y,
      size: "large",
      prerequisiteIds: [slots === 2 ? "skill-root" : "slot-2"],
      cost: GATHERING_SLOT_COSTS[slots],
      effect: { type: "slot", slots },
    };
  });
}

export function getGatheringTalentNodes(
  skill: GatheringSkillId,
): readonly GatheringTalentNode[] {
  const starterKind = getStarterGatheringDieKind(skill);
  const specialistKind = getTierTwoGatheringRecipe(skill).kind;
  const rootLabel = skill === "woodcutting" ? "First camp" : "First lantern";
  const blueprintLabel =
    skill === "woodcutting" ? "Oak Trail" : "Copper Vein";

  return [
    {
      id: "skill-root",
      label: rootLabel,
      description: "The beginning of this skill's engine.",
      icon: skill === "woodcutting" ? "♣" : "◆",
      x: 70,
      y: 610,
      size: "large",
      prerequisiteIds: [],
      effect: { type: "root" },
    },
    ...createFaceNodes(skill, starterKind, "starter"),
    ...createSpeedNodes(skill),
    ...createSlotNodes(skill),
    {
      id: "specialist-blueprint",
      label: blueprintLabel,
      description: `Defeat the Forest Brute to earn the ${getGatheringDieName(specialistKind)} blueprint.`,
      icon: "✦",
      x: 885,
      y: 565,
      size: "large",
      prerequisiteIds: ["skill-root"],
      effect: { type: "blueprint" },
    },
    ...createFaceNodes(skill, specialistKind, "specialist"),
  ];
}
