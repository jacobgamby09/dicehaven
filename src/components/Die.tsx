import { motion, useReducedMotion } from "motion/react";
import type { DieDefinition, DieResult } from "../engine/roll";
import { RESOURCE_LABELS } from "../engine/resources";
import type { RollPhase } from "../hooks/useRollClock";
import { ResourceIcon } from "./ResourceIcon";

interface DieProps {
  definition: DieDefinition;
  result?: DieResult;
  phase: RollPhase;
}

export function Die({ definition, result, phase }: DieProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const isRolling = phase === "rolling";
  const isBoosted = (result?.boostedBy ?? 0) > 0;
  const face = result?.face;
  const resultLabel = !face
    ? "Waiting…"
    : face.type === "produce"
      ? `${result?.finalAmount ?? 0} ${RESOURCE_LABELS[face.resource]}`
      : face.amount
        ? `Boost +${face.amount}`
        : "No boost";

  return (
    <article className="die-card">
      <motion.div
        animate={
          isRolling && !reduceMotion
            ? {
                rotate: [0, -8, 12, -5, 0],
                scale: [1, 0.94, 1.05, 0.98, 1],
                y: [0, -18, -4, -10, 0],
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        aria-label={`${definition.name} result`}
        className={`die die--${definition.material}${isBoosted ? " die--boosted" : ""}`}
        transition={{ duration: reduceMotion ? 0 : 0.52, ease: "easeOut" }}
      >
        <div className="die__inner">
          {isRolling ? (
            <span aria-hidden="true" className="die__rolling-mark">
              •••
            </span>
          ) : face?.type === "produce" ? (
            <>
              <ResourceIcon resource={face.resource} size={30} />
              <strong>{result?.finalAmount ?? 0}</strong>
            </>
          ) : face?.type === "boost" ? (
            <>
              <span aria-hidden="true" className="boost-glyph">
                ↑
              </span>
              <strong>{face.amount > 0 ? `+${face.amount}` : "0"}</strong>
            </>
          ) : (
            <span className="die__empty-face">?</span>
          )}
        </div>
      </motion.div>

      <div className="die-card__label">
        <strong>{definition.name}</strong>
        <span>{isRolling ? "Rolling…" : resultLabel}</span>
      </div>

      {isBoosted ? <span className="die-card__boost">+{result?.boostedBy} boost</span> : null}
    </article>
  );
}
