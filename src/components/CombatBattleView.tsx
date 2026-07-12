import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { COMBAT_ENEMIES, PLAYER_BLOCK_CAP, PLAYER_MAX_HP } from "../engine/combat";
import type { CombatClock } from "../hooks/useCombatClock";
import { useGameStore } from "../store/gameStore";
import { CombatDiceTray } from "./CombatDiceTray";

interface CombatBattleViewProps {
  clock: CombatClock;
  onInspectLoadout: () => void;
  onRetreat: () => void;
}

function enemyMark(enemyId: string): string {
  if (enemyId === "forestBrute") return "B";
  if (enemyId === "banditScout") return "S";
  if (enemyId === "wildBoar") return "T";
  return "W";
}

export function CombatBattleView({
  clock,
  onInspectLoadout,
  onRetreat,
}: CombatBattleViewProps): React.JSX.Element | null {
  const reduceMotion = useReducedMotion();
  const combat = useGameStore((state) => state.combat);
  const session = combat.session;

  if (session === null) return null;

  const enemy = COMBAT_ENEMIES[session.enemyId];
  const zoneName = session.zoneId === "wolfDen" ? "Wolf Den" : "Forest Edge";

  return (
    <section aria-labelledby="active-encounter-title" className="combat-v2-battle">
      <header className="combat-v2-battle__topbar">
        <div>
          <span className="lab-pill">Automatic combat</span>
          <h2 id="active-encounter-title">{zoneName}</h2>
          <p>Both sides act when their own speed bar is full.</p>
        </div>
        <div className="combat-v2-battle__actions">
          <button className="secondary-button" onClick={onInspectLoadout} type="button">
            Inspect loadout
          </button>
          <button className="combat-v2-retreat" onClick={onRetreat} type="button">
            Retreat
          </button>
        </div>
      </header>

      <article className={`combat-v2-enemy${enemy.isBoss ? " is-boss" : ""}`}>
        <div aria-hidden="true" className="combat-v2-enemy__portrait">
          {enemyMark(enemy.id)}
        </div>
        <div className="combat-v2-enemy__body">
          <div className="combat-v2-enemy__heading">
            <div>
              <span className="eyebrow">{enemy.isBoss ? "Zone boss" : "Current enemy"}</span>
              <h3>{enemy.name}</h3>
            </div>
            <strong>{session.enemyHp} / {enemy.maxHp} HP</strong>
          </div>
          <progress aria-label={`${enemy.name} health`} max={enemy.maxHp} value={session.enemyHp} />
          <div className="combat-v2-enemy__statuses">
            <span className={session.scouted ? "is-active" : ""}>
              ✦ {session.scouted ? "Scouted · extra loot roll" : "Not Scouted"}
            </span>
          </div>
          <div className="combat-v2-intent">
            <div>
              <span>Next attack</span>
              <strong>{enemy.attackName}</strong>
            </div>
            <div className="combat-v2-intent__numbers">
              <strong>{enemy.attack} Damage</strong>
              <span>{(enemy.attackIntervalMs / 1_000).toFixed(1)}s speed</span>
            </div>
            <progress aria-label="Time until enemy attack" max={1} value={clock.enemyProgress} />
          </div>
        </div>
      </article>

      <AnimatePresence initial={false}>
        {session.lastEnemyAttack ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="combat-v2-attack-event"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            key={session.lastEnemyAttack.id}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <strong>{enemy.attackName}</strong>
            <span>
              {session.lastEnemyAttack.blockUsed > 0
                ? `${session.lastEnemyAttack.blockUsed} blocked · `
                : ""}
              {session.lastEnemyAttack.damageTaken} Damage taken
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CombatDiceTray
        block={session.block}
        blockCap={PLAYER_BLOCK_CAP}
        event={combat.lastRoll}
        intervalMs={clock.playerIntervalMs}
        loadout={combat.loadout}
        phase={clock.phase}
        playerHp={session.playerHp}
        playerMaxHp={PLAYER_MAX_HP}
        progress={clock.playerProgress}
      />
    </section>
  );
}
