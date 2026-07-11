import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CombatArsenal } from "../components/CombatArsenal";
import { CombatDiceTray } from "../components/CombatDiceTray";
import { CombatKillToast } from "../components/CombatKillToast";
import {
  COMBAT_DICE,
  COMBAT_DIE_IDS,
  COMBAT_ENEMIES,
  PLAYER_MAX_HP,
} from "../engine/combat";
import { getLevelProgress } from "../engine/progression";
import type { CombatClock } from "../hooks/useCombatClock";
import {
  type CombatResult,
  useGameStore,
} from "../store/gameStore";
import { combatRoleIcon } from "../ui/combatDie";
import type { ViewId } from "../ui/navigation";
import { PROGRESSION_UNLOCK_LABELS } from "../ui/unlockLabels";

interface CombatPageProps {
  clock: CombatClock;
  onNavigate: (view: ViewId) => void;
  onOpenSettlement: () => void;
}

function defeatAdvice(reason: CombatResult["defeatReason"]): string | null {
  if (reason === "noBlock") {
    return "You took every hit. Equip a Block die before the next run.";
  }
  if (reason === "lowDamage") {
    return "Your defense prolonged the fight, but damage was too low. Add or upgrade a Damage die.";
  }
  if (reason === "overwhelmed") {
    return "The enemy still broke through. Try a stronger drop or trade one Damage slot for more Block.";
  }
  return null;
}

export function CombatPage({
  clock,
  onNavigate,
  onOpenSettlement,
}: CombatPageProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const workshopBuilt = useGameStore((state) => state.buildings.workshop);
  const frontierForgeBuilt = useGameStore(
    (state) => state.buildings.frontierForge,
  );
  const combat = useGameStore((state) => state.combat);
  const unequipCombatSlot = useGameStore((state) => state.unequipCombatSlot);
  const startCombat = useGameStore((state) => state.startCombat);
  const retreatFromCombat = useGameStore((state) => state.retreatFromCombat);
  const levelProgress = getLevelProgress(combat.lifetimeXp);
  const emptySlotCount = combat.loadout.filter((dieId) => dieId === null).length;
  const hasDamageDie = combat.loadout.some(
    (dieId) => dieId !== null && COMBAT_DICE[dieId].role === "Damage",
  );
  const currentEnemy =
    combat.session === null ? null : COMBAT_ENEMIES[combat.session.enemyId];
  const bossIsReady = combat.zoneProgress >= 20 && !combat.forestTrophy;
  const currentZoneName =
    combat.session?.zoneId === "wolfDen" ? "Wolf Den" : "Forest Edge";
  const runDiceFound = combat.session
    ? Object.values(combat.session.diceGained).reduce(
        (total, amount) => total + (amount ?? 0),
        0,
      )
    : 0;
  const lastDefeatAdvice = combat.lastResult
    ? defeatAdvice(combat.lastResult.defeatReason)
    : null;
  const diceDrops = COMBAT_DIE_IDS.flatMap((dieId) => {
    const amount = combat.lastResult?.diceGained[dieId] ?? 0;
    return amount > 0 ? [`${amount}× ${COMBAT_DICE[dieId].name}`] : [];
  });

  return (
    <div className="destination-page destination-page--combat">
      <header className="destination-header combat-page-header">
        <div>
          <span className="eyebrow">World</span>
          <h1>Combat</h1>
          <p>Build a loadout, enter dangerous zones and discover new physical dice.</p>
        </div>
        {workshopBuilt ? (
          <div className="combat-level-badge">
            <span>Combat Level</span>
            <strong>{levelProgress.level}</strong>
            <small>{combat.lifetimeXp} lifetime XP</small>
          </div>
        ) : null}
      </header>

      {!workshopBuilt ? (
        <section className="combat-gate">
          <div aria-hidden="true" className="combat-gate__art">
            <span className="gate-trees" />
            <span className="gate-path" />
            <span className="gate-swords">×</span>
          </div>
          <div className="combat-gate__copy">
            <span className="lab-pill">Preparation required</span>
            <h2>Build the Workshop</h2>
            <p>Unlock Crafting and prepare your crew's first combat loadout.</p>
            <button className="primary-button" onClick={onOpenSettlement} type="button">
              Open Settlement
            </button>
          </div>
        </section>
      ) : combat.session !== null && currentEnemy !== null ? (
        <section className="combat-battle">
          <header className="combat-battle__header">
            <div>
              <span className="lab-pill">
                {currentEnemy.isBoss ? "Boss encounter" : "Expedition active"}
              </span>
              <h2>{currentEnemy.isBoss ? currentEnemy.name : currentZoneName}</h2>
              <p>
                Gathering is paused · {combat.session.enemiesDefeated} enemies defeated this run
              </p>
            </div>
            <div className="combat-battle__actions">
              <div aria-label="Current run rewards" className="combat-run-stats">
                <span><b>{combat.session.enemiesDefeated}</b> Kills</span>
                <span><b>{combat.session.xpGained}</b> XP</span>
                <span><b>{combat.session.monsterPartsGained}</b> Parts</span>
                <span><b>{runDiceFound}</b> Dice</span>
              </div>
              <button className="secondary-button" onClick={retreatFromCombat} type="button">
                Retreat
              </button>
            </div>
          </header>

          <CombatKillToast event={combat.lastKill} />

          <AnimatePresence>
            {currentEnemy.isBoss ? (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="combat-boss-banner"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                key="forest-brute-reveal"
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
              >
                <span>20 / 20 · Boss revealed</span>
                <strong>Forest Brute</strong>
                <small>Defeat it to claim the Forest Trophy.</small>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="combatants">
            <article className="combatant-card combatant-card--player">
              <span className="eyebrow">Your crew</span>
              <div className="combatant-card__title">
                <h3>Adventurer</h3>
                <strong>{combat.session.playerHp} / {PLAYER_MAX_HP} HP</strong>
              </div>
              <progress
                aria-label="Player health"
                max={PLAYER_MAX_HP}
                value={combat.session.playerHp}
              />
              <div className="combat-statuses">
                <span className={combat.session.block > 0 ? "status-active" : ""}>
                  ◆ {combat.session.block} Block
                </span>
                <span className={combat.session.scouted ? "status-active" : ""}>
                  ✦ {combat.session.scouted ? "Scouted" : "Not Scouted"}
                </span>
              </div>
            </article>

            <div className="combat-versus" aria-hidden="true">VS</div>

            <AnimatePresence initial={false} mode="wait">
              <motion.article
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className={`combatant-card combatant-card--enemy${currentEnemy.isBoss ? " combatant-card--boss" : ""}`}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, x: 24 }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.94, x: 28 }}
                key={`${combat.session.id}-${combat.session.encounterId}`}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
              >
                <span className="eyebrow">
                  {currentEnemy.isBoss
                    ? "Zone boss"
                    : combat.session.zoneId === "wolfDen"
                      ? "Wolf Den threat"
                      : "Forest threat"}
                </span>
                <div className="combatant-card__title">
                  <h3>{currentEnemy.name}</h3>
                  <strong>{combat.session.enemyHp} / {currentEnemy.maxHp} HP</strong>
                </div>
                <progress
                  aria-label="Enemy health"
                  max={currentEnemy.maxHp}
                  value={combat.session.enemyHp}
                />
                <div className="enemy-telegraph">
                  <div>
                    <span>Next attack</span>
                    <strong>
                      {currentEnemy.attack} Damage · {(currentEnemy.attackIntervalMs / 1_000).toFixed(1)}s
                    </strong>
                  </div>
                  <progress
                    aria-label="Time until enemy attack"
                    max={1}
                    value={clock.enemyProgress}
                  />
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <CombatDiceTray
            event={combat.lastRoll}
            loadout={combat.loadout}
            phase={clock.phase}
            progress={clock.playerProgress}
          />
        </section>
      ) : (
        <>
          {combat.lastResult ? (
            <section
              aria-live="polite"
              className={`combat-result combat-result--${combat.lastResult.type}`}
            >
              <div>
                <span className="eyebrow">Last expedition</span>
                <h2>
                  {combat.lastResult.type === "victory"
                    ? `${combat.lastResult.enemyName} defeated`
                    : combat.lastResult.type === "defeat"
                      ? "Your crew was defeated"
                      : "Your crew retreated"}
                </h2>
              </div>
              <div className="combat-result__summary">
                <p>
                  {combat.lastResult.type === "victory"
                    ? `${combat.lastResult.enemiesDefeated} defeated · +${combat.lastResult.xpGained} Combat XP · +${combat.lastResult.monsterPartsGained} Monster Parts${combat.lastResult.trophyGained ? " · Forest Trophy" : ""}${diceDrops.length > 0 ? ` · Found ${diceDrops.join(", ")}` : ""}`
                    : `No progress was lost. Retained +${combat.lastResult.xpGained} Combat XP and +${combat.lastResult.monsterPartsGained} Monster Parts.`}
                </p>
                {lastDefeatAdvice ? <small>{lastDefeatAdvice}</small> : null}
              </div>
            </section>
          ) : null}

          {combat.lastResult?.unlocksGained.length ? (
            <section aria-labelledby="boss-unlocks-title" className="boss-unlock-reveal">
              <div>
                <span className="eyebrow">The frontier opens</span>
                <h2 id="boss-unlocks-title">New blueprints unlocked</h2>
                <p>
                  Forest Brute changed the world. Choose a path and start building Tier 2.
                </p>
              </div>
              <ul>
                {combat.lastResult.unlocksGained.map((unlockId) => (
                  <li key={unlockId}>{PROGRESSION_UNLOCK_LABELS[unlockId]}</li>
                ))}
              </ul>
              <div className="boss-unlock-reveal__actions">
                <button onClick={() => onNavigate("woodcutting")} type="button">
                  Open Woodcutting
                </button>
                <button onClick={() => onNavigate("mining")} type="button">
                  Open Mining
                </button>
                <button onClick={() => onNavigate("settlement")} type="button">
                  Open Settlement
                </button>
              </div>
            </section>
          ) : null}

          <section className="combat-preparation">
            <div className="combat-preview__zone combat-zone-list">
              <article className="combat-zone-card">
                <span className="lab-pill">Zone 1</span>
                <h2>Forest Edge</h2>
                <p>
                  {combat.forestTrophy
                    ? "Zone cleared. Patrol its enemies for dice drops and Monster Parts."
                    : bossIsReady
                      ? "The Forest Brute blocks the path. Defeat it to claim the Forest Trophy."
                      : "Wolves, boars and bandit scouts spawn continuously. Reach 20 kills to reveal the boss."}
                </p>
                <div className="zone-progress">
                  <span>Zone progress</span>
                  <strong>
                    {combat.forestTrophy ? "Cleared" : `${Math.min(combat.zoneProgress, 20)} / 20`}
                  </strong>
                  <progress max={20} value={Math.min(combat.zoneProgress, 20)} />
                </div>
                <button
                  className="primary-button combat-enter-button"
                  disabled={!hasDamageDie}
                  onClick={() => startCombat("forestEdge")}
                  type="button"
                >
                  {hasDamageDie
                    ? bossIsReady
                      ? "Challenge Forest Brute"
                      : combat.forestTrophy
                        ? "Patrol Forest Edge"
                        : "Enter Zone"
                    : "Equip a Damage die"}
                </button>
              </article>

              <article className={`combat-zone-card combat-zone-card--wolf-den${frontierForgeBuilt ? "" : " combat-zone-card--locked"}`}>
                <span className="lab-pill">Zone 2 preview</span>
                <h2>Wolf Den</h2>
                <p>
                  Dire Wolves hit harder and can drop the Level 6 Dire Wolf Claw.
                  Tier 2 combat dice are strongly recommended.
                </p>
                <div className="zone-progress">
                  <span>Survey progress</span>
                  <strong>
                    {combat.wolfDenProgress >= 10
                      ? "Surveyed"
                      : `${combat.wolfDenProgress} / 10`}
                  </strong>
                  <progress max={10} value={combat.wolfDenProgress} />
                </div>
                <button
                  className="primary-button combat-enter-button"
                  disabled={!frontierForgeBuilt || !hasDamageDie}
                  onClick={() => startCombat("wolfDen")}
                  type="button"
                >
                  {!frontierForgeBuilt
                    ? "Build Frontier Forge"
                    : hasDamageDie
                      ? "Enter Wolf Den"
                      : "Equip a Damage die"}
                </button>
              </article>
            </div>

            <div className="combat-preview__loadout">
              <div className="loadout-heading">
                <span className="eyebrow">Current loadout</span>
                <strong>
                  {combat.loadout.length - emptySlotCount} / {combat.loadout.length} equipped
                </strong>
              </div>
              <div className="loadout-slots">
                {combat.loadout.map((dieId, index) =>
                  dieId === null ? (
                    <span key={`empty-${index}`}>
                      <b aria-hidden="true">+</b>
                      Empty slot
                    </span>
                  ) : (
                    <button
                      aria-label={`Remove ${COMBAT_DICE[dieId].name} from slot ${index + 1}`}
                      className="loadout-slot--filled"
                      key={`${dieId}-${index}`}
                      onClick={() => unequipCombatSlot(index)}
                      type="button"
                    >
                      <b aria-hidden="true">
                        {combatRoleIcon(COMBAT_DICE[dieId].role)}
                      </b>
                      <span>
                        <strong>{COMBAT_DICE[dieId].name}</strong>
                        <small>Click to remove</small>
                      </span>
                    </button>
                  ),
                )}
              </div>
              <p className="loadout-rule">At least one Damage die is required.</p>
            </div>
          </section>

          <CombatArsenal onOpenCrafting={() => onNavigate("crafting")} />
        </>
      )}
    </div>
  );
}
