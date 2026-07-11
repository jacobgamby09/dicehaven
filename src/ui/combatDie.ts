import type {
  CombatDieDefinition,
  CombatFace,
  CombatRole,
} from "../engine/combat";

export function combatRoleIcon(role: CombatRole): string {
  if (role === "Damage") return "D";
  if (role === "Block") return "B";
  return "U";
}

export function combatFaceText(face: CombatFace): string {
  if (face.type === "damage") return `${face.amount} Damage`;
  if (face.type === "block") return `${face.amount} Block`;
  return face.amount > 0 ? "Light" : "Dark";
}

export function combatFaceMark(face: CombatFace): string {
  if (face.type === "damage") return face.amount > 0 ? `⚔${face.amount}` : "—";
  if (face.type === "block") return face.amount > 0 ? `◆${face.amount}` : "—";
  return face.amount > 0 ? "✦" : "—";
}

export function averageCombatFaceValue(die: CombatDieDefinition): string {
  const total = die.faces.reduce((sum, face) => sum + face.amount, 0);
  return (total / die.faces.length).toFixed(2);
}
