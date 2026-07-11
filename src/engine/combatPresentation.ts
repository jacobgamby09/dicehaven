import type {
  CombatDieDefinition,
  CombatFace,
  CombatRole,
} from "./combat";

export interface CombatFaceInfo {
  chanceLabel: string;
  description: string;
  duration: string;
  effectLabel: string;
  keyword: string;
  matchingFaces: number;
  resolves: string;
  role: CombatRole;
}

function effectLabel(face: CombatFace): string {
  if (face.type === "damage") {
    return face.amount > 0 ? `${face.amount} Damage` : "Miss";
  }
  if (face.type === "block") {
    return face.amount > 0 ? `${face.amount} Block` : "No Block";
  }
  return face.amount > 0 ? "Light" : "Dark";
}

function matchingEffect(left: CombatFace, right: CombatFace): boolean {
  return left.type === right.type && left.amount === right.amount;
}

export function getCombatFaceInfo(
  die: CombatDieDefinition,
  faceIndex: number,
): CombatFaceInfo {
  const safeIndex = Math.max(0, Math.min(die.faces.length - 1, faceIndex));
  const face = die.faces[safeIndex];
  const matchingFaces = die.faces.filter((candidate) =>
    matchingEffect(candidate, face),
  ).length;

  if (face.type === "damage") {
    return {
      chanceLabel: `1 of ${die.faces.length}`,
      description:
        face.amount > 0
          ? `Deals ${face.amount} Damage to the current enemy when this die lands.`
          : "This face deals no Damage. The die still completes its roll normally.",
      duration: "Immediate",
      effectLabel: effectLabel(face),
      keyword: face.amount > 0 ? "Damage" : "Miss",
      matchingFaces,
      resolves: "When the die lands",
      role: die.role,
    };
  }

  if (face.type === "block") {
    return {
      chanceLabel: `1 of ${die.faces.length}`,
      description:
        face.amount > 0
          ? `Adds ${face.amount} Block to your crew. Block absorbs incoming Damage before HP is lost.`
          : "This face adds no Block. Existing Block on your crew is not removed.",
      duration: face.amount > 0 ? "Until consumed by enemy attacks" : "Immediate",
      effectLabel: effectLabel(face),
      keyword: face.amount > 0 ? "Block" : "No Block",
      matchingFaces,
      resolves: "When the die lands",
      role: die.role,
    };
  }

  return {
    chanceLabel: `1 of ${die.faces.length}`,
    description:
      face.amount > 0
        ? "Scouts the current enemy. When a Scouted enemy dies, its loot table is rolled one additional time. Scouted does not stack."
        : "This face does not Scout the enemy. An existing Scouted status remains active.",
    duration: face.amount > 0 ? "Until the current enemy dies" : "Immediate",
    effectLabel: effectLabel(face),
    keyword: face.amount > 0 ? "Scouted" : "Dark",
    matchingFaces,
    resolves: "When the die lands",
    role: die.role,
  };
}
