import { motion, useReducedMotion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import type {
  CombatDieDefinition,
  CombatFace,
  CombatMotionPreset,
} from "../engine/combat";
import { combatRoleIcon } from "../ui/combatDie";

type CombatDieVisualSize = "small" | "medium" | "roll";

interface CombatDieVisualProps {
  active?: boolean;
  ariaLabel?: string;
  definition: CombatDieDefinition;
  decorative?: boolean;
  face?: CombatFace;
  isRolling?: boolean;
  size?: CombatDieVisualSize;
}

const MOTION_FRAMES: Record<CombatMotionPreset, TargetAndTransition> = {
  strike: {
    rotate: [0, -18, 22, -8, 0],
    scale: [1, 0.88, 1.1, 0.97, 1],
    y: [0, -28, -7, -13, 0],
  },
  guard: {
    rotate: [0, -5, 7, -3, 0],
    scale: [1, 0.94, 1.05, 1.02, 1],
    y: [0, -16, -5, -8, 0],
  },
  spark: {
    rotate: [0, 13, 38, -10, 0],
    scale: [1, 0.92, 1.08, 1.01, 1],
    y: [0, -23, -10, -17, 0],
  },
};

const MOTION_DURATION: Record<CombatMotionPreset, number> = {
  strike: 0.48,
  guard: 0.62,
  spark: 0.68,
};

function faceSymbol(face: CombatFace | undefined): string {
  if (face === undefined) return "";
  if (face.type === "damage") return face.amount > 0 ? "⚔" : "—";
  if (face.type === "block") return face.amount > 0 ? "◆" : "—";
  return face.amount > 0 ? "✦" : "—";
}

export function CombatDieVisual({
  active = false,
  ariaLabel,
  definition,
  decorative = false,
  face,
  isRolling = false,
  size = "medium",
}: CombatDieVisualProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const frames = MOTION_FRAMES[definition.visual.motion];
  const showAmount =
    face !== undefined && face.amount > 0 && face.type !== "light";

  return (
    <motion.div
      animate={
        isRolling && !reduceMotion
          ? frames
          : { rotate: 0, scale: 1, y: 0 }
      }
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel ?? definition.name}
      className={`combat-die-visual combat-die-visual--${size} combat-die-visual--${definition.role.toLowerCase()} combat-die-visual--${definition.visual.material} combat-die-visual--tier-${definition.visual.tier} combat-die-visual--${definition.visual.rarity}${active ? " is-active" : ""}${isRolling ? " is-rolling" : ""}`}
      data-motion={definition.visual.motion}
      role={decorative ? undefined : "img"}
      transition={{
        duration: reduceMotion ? 0 : MOTION_DURATION[definition.visual.motion],
        ease: "easeOut",
      }}
    >
      <span aria-hidden="true" className="combat-die-visual__surface" />
      <span aria-hidden="true" className="combat-die-visual__effect" />
      <span className="combat-die-visual__content">
        {isRolling ? (
          <span className="combat-die-visual__rolling" aria-hidden="true">•••</span>
        ) : face ? (
          <>
            <span aria-hidden="true">{faceSymbol(face)}</span>
            {showAmount ? <strong>{face.amount}</strong> : null}
          </>
        ) : (
          <strong>{combatRoleIcon(definition.role)}</strong>
        )}
      </span>
      <span aria-hidden="true" className="combat-die-visual__particles">
        <i />
        <i />
        <i />
      </span>
    </motion.div>
  );
}
