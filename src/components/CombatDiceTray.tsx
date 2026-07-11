import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { COMBAT_DICE, type CombatDieId, type CombatRollEvent } from "../engine/combat";
import type { RollPhase } from "../hooks/useRollClock";
import { CombatDie } from "./CombatDie";

interface CombatDiceTrayProps {
  event: CombatRollEvent | null;
  loadout: readonly (CombatDieId | null)[];
  phase: RollPhase;
  progress: number;
}

export function CombatDiceTray({
  event,
  loadout,
  phase,
  progress,
}: CombatDiceTrayProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const equippedDice = loadout.flatMap((dieId) =>
    dieId === null ? [] : [COMBAT_DICE[dieId]],
  );

  return (
    <section aria-labelledby="combat-dice-title" className="combat-dice-tray">
      <header>
        <div>
          <span className="eyebrow">Active loadout</span>
          <h2 id="combat-dice-title">Combat roll</h2>
        </div>
        <strong>{equippedDice.length} dice</strong>
      </header>

      <div className="combat-roll-meter">
        <div>
          <span>{phase === "rolling" ? "Rolling…" : "Next combat roll"}</span>
          <span>4.0s</span>
        </div>
        <progress aria-label="Time until next combat roll" max={1} value={progress} />
      </div>

      <div className={`combat-dice-grid combat-dice-grid--${equippedDice.length}`}>
        {equippedDice.map((die, index) => (
          <CombatDie
            definition={die}
            key={`${die.id}-${index}`}
            phase={phase}
            result={event?.results[index]}
          />
        ))}
      </div>

      <AnimatePresence>
        {phase === "settled" && event ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-live="polite"
            className="combat-resolution-burst"
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 14 }}
            key={event.id}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {event.damage > 0 ? (
              <span className="combat-resolution-burst--damage">
                ⚔ {event.damage} Damage
              </span>
            ) : null}
            {event.block > 0 ? (
              <span className="combat-resolution-burst--block">
                ◆ +{event.block} Block
              </span>
            ) : null}
            {event.light > 0 ? (
              <span className="combat-resolution-burst--light">✦ Scouted</span>
            ) : null}
            {event.damage + event.block + event.light === 0 ? (
              <span>Blank roll</span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <footer aria-live="polite">
        {event === null
          ? "Your loadout is ready for its first roll."
          : `Roll ${event.id}: ${event.damage} Damage · ${event.block} Block${event.light > 0 ? " · Light" : ""}`}
      </footer>
    </section>
  );
}
