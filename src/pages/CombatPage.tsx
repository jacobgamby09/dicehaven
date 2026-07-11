import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { CombatDiceTray } from "../components/CombatDiceTray";
import { CombatKillToast } from "../components/CombatKillToast";
import {
  COMBAT_DICE,
  COMBAT_DIE_IDS,
  COMBAT_ENEMIES,
  PLAYER_MAX_HP,
  type CombatDieDefinition,
  type CombatDieId,
  type CombatFace,
} from "../engine/combat";
import {
  canAfford,
  COMBAT_DIE_RECIPES,
  getLevelProgress,
} from "../engine/progression";
import type { CombatClock } from "../hooks/useCombatClock";
import {
  type CombatResult,
  useGameStore,
} from "../store/gameStore";
import { formatCost, formatMissingCost } from "../ui/formatCost";
import type { ViewId } from "../ui/navigation";
import { PROGRESSION_UNLOCK_LABELS } from "../ui/unlockLabels";

interface CombatPageProps {
  clock: CombatClock;
  onNavigate: (view: ViewId) => void;
  onOpenSettlement: () => void;
}

function roleIcon(die: CombatDieDefinition): string {
  if (die.role === "Damage") return "D";
  if (die.role === "Block") return "B";
  return "U";
}

function countEquipped(
  loadout: readonly (CombatDieId | null)[],
  dieId: CombatDieId,
): number {
  return loadout.filter((equippedDieId) => equippedDieId === dieId).length;
}

function faceText(face: CombatFace): string {
  if (face.type === "damage") return `${face.amount} Damage`;
  if (face.type === "block") return `${face.amount} Block`;
  return face.amount > 0 ? "Light" : "Dark";
}

function faceMark(face: CombatFace): string {
  if (face.type === "damage") return face.amount > 0 ? `⚔${face.amount}` : "—";
  if (face.type === "block") return face.amount > 0 ? `◆${face.amount}` : "—";
  return face.amount > 0 ? "✦" : "—";
}

function averageFaceValue(die: CombatDieDefinition): string {
  const total = die.faces.reduce((sum, face) => sum + face.amount, 0);
  return (total / die.faces.length).toFixed(2);
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
  const [inspectedDieId, setInspectedDieId] =
    useState<CombatDieId>("trainingSword");
  const reduceMotion = useReducedMotion();
  const resources = useGameStore((state) => state.resources);
  const workshopBuilt = useGameStore((state) => state.buildings.workshop);
  const frontierForgeBuilt = useGameStore(
    (state) => state.buildings.frontierForge,
  );
  const combat = useGameStore((state) => state.combat);
  const craftCombatDie = useGameStore((state) => state.craftCombatDie);
  const equipCombatDie = useGameStore((state) => state.equipCombatDie);
  const unequipCombatSlot = useGameStore((state) => state.unequipCombatSlot);
  const startCombat = useGameStore((state) => state.startCombat);
  const retreatFromCombat = useGameStore((state) => state.retreatFromCombat);
  const levelProgress = getLevelProgress(combat.lifetimeXp);
  const ownedDiceCount = Object.values(combat.inventory).reduce(
    (total, amount) => total + amount,
    0,
  );
  const emptySlotCount = combat.loadout.filter((dieId) => dieId === null).length;
  const hasDamageDie = combat.loadout.some(
    (dieId) => dieId !== null && COMBAT_DICE[dieId].role === "Damage",
  );
  const currentEnemy =
    combat.session === null ? null : COMBAT_ENEMIES[combat.session.enemyId];
  const bossIsReady = combat.zoneProgress >= 20 && !combat.forestTrophy;
  const currentZoneName =
    combat.session?.zoneId === "wolfDen" ? "Wolf Den" : "Forest Edge";
  const inspectedDie = COMBAT_DICE[inspectedDieId];
  const inspectedOwned = combat.inventory[inspectedDieId];
  const inspectedIsLocked = inspectedDie.levelRequirement > levelProgress.level;
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
          <p>Craft or discover dice, meet their level gates, and build a loadout.</p>
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
            <p>Your crews need somewhere to turn Wood and Stone into combat dice.</p>
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
                      <b aria-hidden="true">{roleIcon(COMBAT_DICE[dieId])}</b>
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

          <section aria-labelledby="combat-inventory-title" className="combat-recipes">
            <header>
              <div>
                <span className="eyebrow">Dice collection</span>
                <h2 id="combat-inventory-title">Inventory & Workshop</h2>
              </div>
              <span className="recipe-counter">{ownedDiceCount} dice owned</span>
            </header>
            <article className="combat-die-inspector">
              <div
                aria-hidden="true"
                className={`combat-die-inspector__die combat-die-inspector__die--${inspectedDie.role.toLowerCase()}`}
              >
                {roleIcon(inspectedDie)}
              </div>
              <div className="combat-die-inspector__copy">
                <span className="eyebrow">Inspecting · {inspectedDie.role}</span>
                <h3>{inspectedDie.name}</h3>
                <p>{inspectedDie.description}</p>
                <div className="combat-die-inspector__meta">
                  <span>Level {inspectedDie.levelRequirement}</span>
                  <span>Average {averageFaceValue(inspectedDie)}</span>
                  <span>Owned {inspectedOwned}</span>
                  <span>{inspectedDie.sourceLabel}</span>
                </div>
              </div>
              <div aria-label={`${inspectedDie.name} faces`} className="combat-face-grid">
                {inspectedDie.faces.map((face, index) => (
                  <span
                    aria-label={`Face ${index + 1}: ${faceText(face)}`}
                    className={`combat-face combat-face--${face.type}`}
                    key={`${inspectedDie.id}-face-${index}`}
                    title={faceText(face)}
                  >
                    {faceMark(face)}
                  </span>
                ))}
                {inspectedIsLocked ? (
                  <strong>Equip at Combat Level {inspectedDie.levelRequirement}</strong>
                ) : (
                  <strong>Ready to equip when owned</strong>
                )}
              </div>
            </article>
            <div className="combat-recipe-grid combat-inventory-grid">
              {COMBAT_DIE_IDS.map((dieId) => {
                const die = COMBAT_DICE[dieId];
                const recipe = COMBAT_DIE_RECIPES.find(
                  (candidate) => candidate.id === dieId,
                );
                const owned = combat.inventory[dieId];
                const equipped = countEquipped(combat.loadout, dieId);
                const isLevelLocked = die.levelRequirement > levelProgress.level;
                const canEquip =
                  !isLevelLocked && owned > equipped && emptySlotCount > 0;
                const stationReady =
                  recipe?.station === "frontierForge"
                    ? frontierForgeBuilt
                    : workshopBuilt;
                const canCraft =
                  recipe !== undefined &&
                  stationReady &&
                  canAfford(resources, recipe.cost);

                return (
                  <article
                    className={`combat-recipe-card${owned > 0 ? " combat-recipe-card--crafted" : ""}${isLevelLocked ? " combat-recipe-card--locked" : ""}${recipe?.station === "frontierForge" ? " combat-recipe-card--tier-two" : ""}`}
                    key={die.id}
                  >
                    <div className="combat-recipe-card__die" aria-hidden="true">
                      {roleIcon(die)}
                    </div>
                    <div className="combat-die-meta">
                      <span className="combat-role">{die.role}</span>
                      <span>Level {die.levelRequirement}</span>
                    </div>
                    <h3>{die.name}</h3>
                    <p>{die.description}</p>
                    <small className="combat-source">{die.sourceLabel}</small>
                    <strong>Owned {owned} · Equipped {equipped}</strong>

                    <button
                      aria-pressed={inspectedDieId === die.id}
                      className="combat-inspect-button"
                      onClick={() => setInspectedDieId(die.id)}
                      type="button"
                    >
                      {inspectedDieId === die.id ? "Inspecting faces" : "Inspect faces"}
                    </button>

                    {isLevelLocked ? (
                      <span className="combat-level-lock">
                        Requires Combat Level {die.levelRequirement}
                      </span>
                    ) : (
                      <button
                        className="secondary-button"
                        disabled={!canEquip}
                        onClick={() => equipCombatDie(die.id)}
                        type="button"
                      >
                        {owned <= equipped
                          ? owned === 0
                            ? "Not owned"
                            : "All copies equipped"
                          : emptySlotCount === 0
                            ? "Loadout full"
                            : "Equip die"}
                      </button>
                    )}

                    {recipe ? (
                      <div className="combat-craft-row">
                        <span>{formatCost(recipe.cost)}</span>
                        <button
                          className="secondary-button"
                          disabled={!canCraft}
                          onClick={() => craftCombatDie(recipe.id)}
                          type="button"
                        >
                          {!stationReady
                            ? "Build Frontier Forge"
                            : canCraft
                            ? owned > 0
                              ? "Craft another"
                              : "Craft die"
                            : formatMissingCost(resources, recipe.cost)}
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
