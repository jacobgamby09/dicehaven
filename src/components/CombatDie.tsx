import { motion, useReducedMotion } from "motion/react";
import type {
  CombatDieDefinition,
  CombatDieResult,
} from "../engine/combat";
import type { RollPhase } from "../hooks/useRollClock";

interface CombatDieProps {
  definition: CombatDieDefinition;
  phase: RollPhase;
  result?: CombatDieResult;
}

function faceLabel(result?: CombatDieResult): string {
  if (result === undefined) return "Waiting…";
  if (result.face.type === "damage") {
    return result.face.amount > 0 ? `${result.face.amount} Damage` : "Miss";
  }
  if (result.face.type === "block") {
    return result.face.amount > 0 ? `${result.face.amount} Block` : "No Block";
  }
  return result.face.amount > 0 ? "Light" : "Dark";
}

function faceGlyph(result?: CombatDieResult): string {
  if (result === undefined) return "?";
  if (result.face.type === "damage") return result.face.amount > 0 ? "⚔" : "—";
  if (result.face.type === "block") return result.face.amount > 0 ? "◆" : "—";
  return result.face.amount > 0 ? "✦" : "—";
}

export function CombatDie({
  definition,
  phase,
  result,
}: CombatDieProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const isRolling = phase === "rolling";
  const amount = result?.face.amount ?? 0;

  return (
    <article className="combat-die-card">
      <motion.div
        animate={
          isRolling && !reduceMotion
            ? {
                rotate: [0, -11, 14, -6, 0],
                scale: [1, 0.9, 1.08, 0.97, 1],
                y: [0, -24, -5, -12, 0],
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        aria-label={`${definition.name} combat result`}
        className={`combat-die combat-die--${definition.role.toLowerCase()}`}
        transition={{ duration: reduceMotion ? 0 : 0.52, ease: "easeOut" }}
      >
        {isRolling ? (
          <span className="combat-die__rolling" aria-hidden="true">•••</span>
        ) : (
          <>
            <span className="combat-die__glyph" aria-hidden="true">
              {faceGlyph(result)}
            </span>
            {amount > 0 && result?.face.type !== "light" ? (
              <strong>{amount}</strong>
            ) : null}
          </>
        )}
      </motion.div>
      <div className="combat-die-card__label">
        <strong>{definition.name}</strong>
        <span>{isRolling ? "Rolling…" : faceLabel(result)}</span>
      </div>
    </article>
  );
}
