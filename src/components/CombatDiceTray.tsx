import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { COMBAT_DICE, type CombatDieId, type CombatRollEvent } from "../engine/combat";
import type { RollPhase } from "../hooks/useRollClock";
import { CombatDie } from "./CombatDie";
import { CombatSpeedBar } from "./CombatSpeedBar";
import { FaceInfoOverlay } from "./FaceInfoOverlay";

interface CombatDiceTrayProps {
  block: number;
  blockCap: number;
  event: CombatRollEvent | null;
  intervalMs: number;
  loadout: readonly (CombatDieId | null)[];
  phase: RollPhase;
  playerHp: number;
  playerMaxHp: number;
  progress: number;
}

export function CombatDiceTray({
  block,
  blockCap,
  event,
  intervalMs,
  loadout,
  phase,
  playerHp,
  playerMaxHp,
  progress,
}: CombatDiceTrayProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const [faceInfo, setFaceInfo] = useState<{
    dieId: CombatDieId;
    faceIndex: number;
  } | null>(null);
  const equippedDice = loadout.flatMap((dieId) =>
    dieId === null ? [] : [COMBAT_DICE[dieId]],
  );

  return (
    <>
      <section aria-labelledby="combat-dice-title" className="combat-dice-tray">
      <header>
        <div>
          <span className="eyebrow">Your crew</span>
          <h2 id="combat-dice-title">Automatic roll</h2>
        </div>
        <div className="combat-v2-player-stats">
          <span><strong>{playerHp} / {playerMaxHp}</strong> HP</span>
          <span className={block > 0 ? "is-active" : ""}>
            <strong>{block} / {blockCap}</strong> Block
          </span>
        </div>
      </header>

      <progress aria-label="Player health" className="combat-v2-player-health" max={playerMaxHp} value={playerHp} />

      <CombatSpeedBar
        actionLabel="Roll"
        ariaLabel="Player roll speed"
        intervalMs={intervalMs}
        isResolving={phase === "rolling"}
        label="Roll speed"
        progress={progress}
        resolvingLabel="Rolling…"
        tone="player"
      />

      <div className={`combat-dice-grid combat-dice-grid--${equippedDice.length}`}>
        {equippedDice.map((die, index) => (
          <CombatDie
            definition={die}
            key={`${die.id}-${index}`}
            onInspectFace={() => {
              const result = event?.results[index];
              if (result) {
                setFaceInfo({ dieId: die.id, faceIndex: result.faceIndex });
              }
            }}
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
