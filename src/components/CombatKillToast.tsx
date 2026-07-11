import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { COMBAT_DICE, COMBAT_DIE_IDS } from "../engine/combat";
import type { CombatKillEvent } from "../store/gameStore";
import { PROGRESSION_UNLOCK_LABELS } from "../ui/unlockLabels";

interface CombatKillToastProps {
  event: CombatKillEvent | null;
}

export function CombatKillToast({
  event,
}: CombatKillToastProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const [visibleEvent, setVisibleEvent] = useState<CombatKillEvent | null>(null);

  useEffect(() => {
    if (event === null) return;

    setVisibleEvent(event);
    const timer = window.setTimeout(
      () => setVisibleEvent(null),
      event.unlocksGained.length > 0 ? 5_200 : 2_800,
    );
    return () => window.clearTimeout(timer);
  }, [event]);

  const diceDrops = visibleEvent
    ? COMBAT_DIE_IDS.flatMap((dieId) => {
        const amount = visibleEvent.diceGained[dieId] ?? 0;
        return amount > 0 ? [`${amount}× ${COMBAT_DICE[dieId].name}`] : [];
      })
    : [];
  const unlocks = visibleEvent
    ? visibleEvent.unlocksGained.map(
        (unlockId) => PROGRESSION_UNLOCK_LABELS[unlockId],
      )
    : [];

  return (
    <AnimatePresence>
      {visibleEvent ? (
        <motion.aside
          animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
          aria-live="polite"
          className="combat-kill-toast"
          exit={reduceMotion ? { opacity: 0, x: "-50%" } : { opacity: 0, scale: 0.96, x: "-50%", y: -10 }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94, x: "-50%", y: 14 }}
          key={visibleEvent.id}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <span aria-hidden="true" className="combat-kill-toast__mark">✓</span>
          <div>
            <strong>{visibleEvent.enemyName} defeated</strong>
            <span>
              +{visibleEvent.xpGained} Combat XP · +{visibleEvent.monsterPartsGained} Parts
              {visibleEvent.scouted ? " · Scouted loot" : ""}
            </span>
            {diceDrops.length > 0 ? <em>Found {diceDrops.join(", ")}</em> : null}
            {unlocks.length > 0 ? <em>Unlocked {unlocks.join(", ")}</em> : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
