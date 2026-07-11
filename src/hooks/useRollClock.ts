import { useCallback, useEffect, useRef, useState } from "react";
import { getGatheringRollInterval } from "../engine/progression";
import { useGameStore } from "../store/gameStore";

export type RollPhase = "idle" | "rolling" | "settled";

const ROLL_ANIMATION_MS = 520;
const RESULT_HOLD_MS = 900;

export interface RollClock {
  progress: number;
  phase: RollPhase;
  intervalMs: number;
}

export function useRollClock(): RollClock {
  const performRoll = useGameStore((state) => state.performRoll);
  const isPaused = useGameStore((state) => state.isPaused);
  const activeSkill = useGameStore((state) => state.activeSkill);
  const rollSpeedLevel = useGameStore(
    (state) => state[state.activeSkill].rollSpeedLevel,
  );
  const isInCombat = useGameStore((state) => state.combat.session !== null);
  const intervalMs = getGatheringRollInterval(rollSpeedLevel);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<RollPhase>("idle");
  const elapsedRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const clearPhaseTimers = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
  }, []);

  const triggerRoll = useCallback(() => {
    clearPhaseTimers();
    performRoll();
    setPhase("rolling");

    settleTimerRef.current = window.setTimeout(() => {
      setPhase("settled");
    }, ROLL_ANIMATION_MS);

    idleTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
    }, ROLL_ANIMATION_MS + RESULT_HOLD_MS);
  }, [clearPhaseTimers, performRoll]);

  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setPhase("idle");
    clearPhaseTimers();
  }, [activeSkill, clearPhaseTimers, intervalMs]);

  useEffect(() => {
    if (isPaused || isInCombat) {
      return;
    }

    let previousTime = performance.now();

    const advance = (time: number) => {
      elapsedRef.current += time - previousTime;
      previousTime = time;

      if (elapsedRef.current >= intervalMs) {
        elapsedRef.current %= intervalMs;
        triggerRoll();
      }

      setProgress(elapsedRef.current / intervalMs);
      frameRef.current = requestAnimationFrame(advance);
    };

    frameRef.current = requestAnimationFrame(advance);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [intervalMs, isInCombat, isPaused, triggerRoll]);

  useEffect(() => clearPhaseTimers, [clearPhaseTimers]);

  return {
    progress: isInCombat ? 0 : progress,
    phase,
    intervalMs,
  };
}
