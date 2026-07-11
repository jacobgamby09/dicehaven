import { useState } from "react";
import {
  COMBAT_DICE,
  COMBAT_DIE_IDS,
  type CombatDieId,
} from "../engine/combat";
import { getLevelProgress } from "../engine/progression";
import { useGameStore } from "../store/gameStore";
import {
  averageCombatFaceValue,
  combatFaceMark,
  combatFaceText,
  combatRoleIcon,
} from "../ui/combatDie";

interface CombatArsenalProps {
  onOpenCrafting: () => void;
}

function countEquipped(
  loadout: readonly (CombatDieId | null)[],
  dieId: CombatDieId,
): number {
  return loadout.filter((equippedDieId) => equippedDieId === dieId).length;
}

export function CombatArsenal({
  onOpenCrafting,
}: CombatArsenalProps): React.JSX.Element {
  const [inspectedDieId, setInspectedDieId] =
    useState<CombatDieId>("trainingSword");
  const combat = useGameStore((state) => state.combat);
  const equipCombatDie = useGameStore((state) => state.equipCombatDie);
  const level = getLevelProgress(combat.lifetimeXp).level;
  const emptySlotCount = combat.loadout.filter((dieId) => dieId === null).length;
  const ownedDieIds = COMBAT_DIE_IDS.filter(
    (dieId) => combat.inventory[dieId] > 0,
  );
  const inspectedId = ownedDieIds.includes(inspectedDieId)
    ? inspectedDieId
    : ownedDieIds[0];
  const inspectedDie = inspectedId ? COMBAT_DICE[inspectedId] : null;
  const ownedDiceCount = ownedDieIds.reduce(
    (total, dieId) => total + combat.inventory[dieId],
    0,
  );

  return (
    <section aria-labelledby="combat-arsenal-title" className="combat-recipes combat-arsenal">
      <header>
        <div>
          <span className="eyebrow">Dice collection</span>
          <h2 id="combat-arsenal-title">Combat Arsenal</h2>
          <p>Inspect and equip only the physical Combat Dice you own.</p>
        </div>
        <div className="combat-arsenal__header-actions">
          <span className="recipe-counter">{ownedDiceCount} dice owned</span>
          <button className="secondary-button" onClick={onOpenCrafting} type="button">
            Open Crafting
          </button>
        </div>
      </header>

      {inspectedDie && inspectedId ? (
        <>
          <article className="combat-die-inspector">
            <div
              aria-hidden="true"
              className={`combat-die-inspector__die combat-die-inspector__die--${inspectedDie.role.toLowerCase()}`}
            >
              {combatRoleIcon(inspectedDie.role)}
            </div>
            <div className="combat-die-inspector__copy">
              <span className="eyebrow">Inspecting · {inspectedDie.role}</span>
              <h3>{inspectedDie.name}</h3>
              <p>{inspectedDie.description}</p>
              <div className="combat-die-inspector__meta">
                <span>Level {inspectedDie.levelRequirement}</span>
                <span>Average {averageCombatFaceValue(inspectedDie)}</span>
                <span>Owned {combat.inventory[inspectedId]}</span>
                <span>{inspectedDie.sourceLabel}</span>
              </div>
            </div>
            <div aria-label={`${inspectedDie.name} faces`} className="combat-face-grid">
              {inspectedDie.faces.map((face, index) => (
                <span
                  aria-label={`Face ${index + 1}: ${combatFaceText(face)}`}
                  className={`combat-face combat-face--${face.type}`}
                  key={`${inspectedDie.id}-face-${index + 1}`}
                  title={combatFaceText(face)}
                >
                  {combatFaceMark(face)}
                </span>
              ))}
              {inspectedDie.levelRequirement > level ? (
                <strong>Equip at Combat Level {inspectedDie.levelRequirement}</strong>
              ) : (
                <strong>Ready to equip</strong>
              )}
            </div>
          </article>

          <div className="combat-recipe-grid combat-inventory-grid">
            {ownedDieIds.map((dieId) => {
              const die = COMBAT_DICE[dieId];
              const owned = combat.inventory[dieId];
              const equipped = countEquipped(combat.loadout, dieId);
              const isLevelLocked = die.levelRequirement > level;
              const canEquip =
                !isLevelLocked && owned > equipped && emptySlotCount > 0;

              return (
                <article
                  className={`combat-recipe-card combat-recipe-card--crafted${isLevelLocked ? " combat-recipe-card--locked" : ""}`}
                  key={die.id}
                >
                  <div className="combat-recipe-card__die" aria-hidden="true">
                    {combatRoleIcon(die.role)}
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
                    aria-pressed={inspectedId === die.id}
                    className="combat-inspect-button"
                    onClick={() => setInspectedDieId(die.id)}
                    type="button"
                  >
                    {inspectedId === die.id ? "Inspecting faces" : "Inspect faces"}
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
                        ? "All copies equipped"
                        : emptySlotCount === 0
                          ? "Loadout full"
                          : "Equip die"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="combat-arsenal__empty">
          <span aria-hidden="true">◇</span>
          <strong>Your arsenal is empty</strong>
          <p>Craft a Training Sword or another Combat Die to prepare a loadout.</p>
          <button className="primary-button" onClick={onOpenCrafting} type="button">
            Open Crafting
          </button>
        </div>
      )}
    </section>
  );
}
