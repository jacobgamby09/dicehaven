import { useCallback, useEffect, useRef, useState } from "react";
import { COMBAT_ENEMIES, COMBAT_ROLL_INTERVAL_MS } from "../engine/combat";
import { useGameStore } from "../store/gameStore";
import type { RollPhase } from "./useRollClock";

const ROLL_ANIMATION_MS = 520;
const RESULT_HOLD_MS = 900;
const VISUAL_UPDATE_MS = 100;

export interface CombatClock {
  playerProgress: number;
  enemyProgress: number;
  phase: RollPhase;
  playerIntervalMs: number;
  enemyIntervalMs: number;
}

export function useCombatClock(): CombatClock {
  const encounterKey = useGameStore((state) => {
    const session = state.combat.session;
    return session === null ? null : `${session.id}:${session.encounterId}`;
  });
  const enemyId = useGameStore(
    (state) => state.combat.session?.enemyId ?? null,
  );
  const enemyIntervalMs =
    enemyId === null ? 0 : COMBAT_ENEMIES[enemyId].attackIntervalMs;
  const performCombatRoll = useGameStore((state) => state.performCombatRoll);
  const performEnemyAttack = useGameStore((state) => state.performEnemyAttack);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [enemyProgress, setEnemyProgress] = useState(0);
  const [phase, setPhase] = useState<RollPhase>("idle");
  const playerElapsedRef = useRef(0);
  const enemyElapsedRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const lastVisualUpdateRef = useRef(0);

  const clearPhaseTimers = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
  }, []);

  const triggerCombatRoll = useCallback(() => {
    clearPhaseTimers();
    performCombatRoll();
    setPhase("rolling");
    settleTimerRef.current = window.setTimeout(
      () => {
        setPhase("settled");
      },
      ROLL_ANIMATION_MS,
    );
    idleTimerRef.current = window.setTimeout(
      () => setPhase("idle"),
      ROLL_ANIMATION_MS + RESULT_HOLD_MS,
    );
  }, [clearPhaseTimers, performCombatRoll]);

  useEffect(() => {
    playerElapsedRef.current = 0;
    enemyElapsedRef.current = 0;
    setPlayerProgress(0);
    setEnemyProgress(0);
    setPhase("idle");
    lastVisualUpdateRef.current = 0;
    clearPhaseTimers();
  }, [clearPhaseTimers, encounterKey]);

  useEffect(() => {
    if (encounterKey === null || enemyIntervalMs <= 0) {
      return;
    }

    let previousTime = performance.now();

    const advance = (time: number) => {
      const elapsed = Math.min(time - previousTime, 250);
      previousTime = time;
      playerElapsedRef.current += elapsed;
      enemyElapsedRef.current += elapsed;
      let resolvedEvent = false;

      if (playerElapsedRef.current >= COMBAT_ROLL_INTERVAL_MS) {
        playerElapsedRef.current %= COMBAT_ROLL_INTERVAL_MS;
        resolvedEvent = true;
        triggerCombatRoll();
      }

      const currentSession = useGameStore.getState().combat.session;

      const currentEncounterKey =
        currentSession === null
          ? null
          : `${currentSession.id}:${currentSession.encounterId}`;

      if (currentEncounterKey !== encounterKey) {
        return;
      }

      if (enemyElapsedRef.current >= enemyIntervalMs) {
        enemyElapsedRef.current %= enemyIntervalMs;
        resolvedEvent = true;
        performEnemyAttack();
      }

      const nextSession = useGameStore.getState().combat.session;
      const nextEncounterKey =
        nextSession === null
          ? null
          : `${nextSession.id}:${nextSession.encounterId}`;

      if (nextEncounterKey !== encounterKey) {
        return;
      }

      if (
        resolvedEvent ||
        time - lastVisualUpdateRef.current >= VISUAL_UPDATE_MS
      ) {
        lastVisualUpdateRef.current = time;
        setPlayerProgress(playerElapsedRef.current / COMBAT_ROLL_INTERVAL_MS);
        setEnemyProgress(enemyElapsedRef.current / enemyIntervalMs);
      }
      frameRef.current = requestAnimationFrame(advance);
    };

    frameRef.current = requestAnimationFrame(advance);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    encounterKey,
    enemyIntervalMs,
    performEnemyAttack,
    triggerCombatRoll,
  ]);

  useEffect(() => clearPhaseTimers, [clearPhaseTimers]);

  return {
    playerProgress,
    enemyProgress,
    phase,
    playerIntervalMs: COMBAT_ROLL_INTERVAL_MS,
    enemyIntervalMs,
  };
}
