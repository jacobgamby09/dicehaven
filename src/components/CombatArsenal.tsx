import { useState } from "react";
import { COMBAT_DICE, COMBAT_DIE_IDS, type CombatDieId } from "../engine/combat";
import { getLevelProgress } from "../engine/progression";
import { useGameStore } from "../store/gameStore";
import { averageCombatFaceValue, combatFaceMark, combatFaceText } from "../ui/combatDie";
import { CombatDieVisual } from "./CombatDieVisual";
import { FaceInfoOverlay } from "./FaceInfoOverlay";

interface CombatArsenalProps {
  onBack: () => void;
  onOpenCrafting: () => void;
  readOnly?: boolean;
}

function countEquipped(
  loadout: readonly (CombatDieId | null)[],
  dieId: CombatDieId,
): number {
  return loadout.filter((equippedDieId) => equippedDieId === dieId).length;
}

export function CombatArsenal({
  onBack,
  onOpenCrafting,
  readOnly = false,
}: CombatArsenalProps): React.JSX.Element {
  const combat = useGameStore((state) => state.combat);
  const setCombatSlot = useGameStore((state) => state.setCombatSlot);
  const ownedDieIds = COMBAT_DIE_IDS.filter((dieId) => combat.inventory[dieId] > 0);
  const [selectedDieId, setSelectedDieId] = useState<CombatDieId>(
    ownedDieIds[0] ?? "trainingSword",
  );
  const [faceInfo, setFaceInfo] = useState<{ dieId: CombatDieId; faceIndex: number } | null>(null);
  const selectedId = ownedDieIds.includes(selectedDieId) ? selectedDieId : ownedDieIds[0];
  const selectedDie = selectedId ? COMBAT_DICE[selectedId] : null;
  const combatLevel = getLevelProgress(combat.lifetimeXp).level;

  return (
    <>
      <section aria-labelledby="combat-arsenal-title" className="combat-v2-arsenal">
        <header className="combat-v2-section-heading">
          <div>
            <button className="combat-v2-back" onClick={onBack} type="button">← Back</button>
            <span className="eyebrow">Loadout</span>
            <h2 id="combat-arsenal-title">Combat Arsenal</h2>
            <p>Select a die, inspect its faces and assign it directly to a slot.</p>
          </div>
          <button className="secondary-button" onClick={onOpenCrafting} type="button">
            Open Crafting
          </button>
        </header>

        {readOnly ? (
          <p className="combat-v2-arsenal__notice">Combat is active. You can inspect dice, but the loadout is locked.</p>
        ) : null}

        {selectedDie && selectedId ? (
          <div className="combat-v2-arsenal__layout">
            <div aria-label="Owned Combat Dice" className="combat-v2-collection">
              <div className="combat-v2-collection__heading">
                <span className="eyebrow">Owned dice</span>
                <strong>{ownedDieIds.length} types</strong>
              </div>
              <div className="combat-v2-collection__grid">
                {ownedDieIds.map((dieId) => {
                  const die = COMBAT_DICE[dieId];
                  const equipped = countEquipped(combat.loadout, dieId);
                  return (
                    <button
                      aria-pressed={selectedId === dieId}
                      className="combat-v2-die-option"
                      key={dieId}
                      onClick={() => setSelectedDieId(dieId)}
                      type="button"
                    >
                      <CombatDieVisual
                        active={selectedId === dieId}
                        decorative
                        definition={die}
                        size="small"
                      />
                      <span>
                        <strong>{die.name}</strong>
                        <small>{die.role} · Tier {die.visual.tier}</small>
                        <small>{equipped} equipped · {combat.inventory[dieId]} owned</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <article className="combat-v2-die-detail">
              <header>
                <CombatDieVisual active decorative definition={selectedDie} size="medium" />
                <div>
                  <span className="eyebrow">{selectedDie.role} · Tier {selectedDie.visual.tier}</span>
                  <h3>{selectedDie.name}</h3>
                  <p>{selectedDie.description}</p>
                </div>
              </header>

              <div className="combat-v2-die-detail__meta">
                <span>Equip Level {selectedDie.levelRequirement}</span>
                <span>Average {averageCombatFaceValue(selectedDie)}</span>
                <span>{selectedDie.sourceLabel}</span>
              </div>

              <div aria-label={`${selectedDie.name} faces`} className="combat-v2-face-row">
                {selectedDie.faces.map((face, index) => (
                  <button
                    aria-label={`Open information for face ${index + 1}: ${combatFaceText(face)}`}
                    className={`combat-face combat-face--${face.type}`}
                    key={`${selectedDie.id}-face-${index + 1}`}
                    onClick={() => setFaceInfo({ dieId: selectedDie.id, faceIndex: index })}
                    title={combatFaceText(face)}
                    type="button"
                  >
                    <small>{index + 1}</small>
                    <strong>{combatFaceMark(face)}</strong>
                  </button>
                ))}
              </div>

              <div className="combat-v2-slot-picker">
                <div>
                  <span className="eyebrow">Assign to loadout</span>
                  <strong>{combat.loadout.filter(Boolean).length} / {combat.loadout.length} equipped</strong>
                </div>
                <div className="combat-v2-slot-picker__grid">
                  {combat.loadout.map((currentDieId, slotIndex) => {
                    const selectedEquipped = countEquipped(combat.loadout, selectedId);
                    const nextSelectedCount =
                      selectedEquipped - (currentDieId === selectedId ? 1 : 0) + 1;
                    const levelLocked = selectedDie.levelRequirement > combatLevel;
                    const cannotAssign = nextSelectedCount > combat.inventory[selectedId];
                    const selectedHere = currentDieId === selectedId;

                    return (
                      <button
                        className={selectedHere ? "is-selected" : ""}
                        disabled={readOnly || levelLocked || (!selectedHere && cannotAssign)}
                        key={`combat-slot-${slotIndex + 1}`}
                        onClick={() => setCombatSlot(slotIndex, selectedHere ? null : selectedId)}
                        type="button"
                      >
                        <small>Slot {slotIndex + 1}</small>
                        <strong>{currentDieId ? COMBAT_DICE[currentDieId].name : "Empty"}</strong>
                        <span>
                          {readOnly
                            ? "Locked in combat"
                            : selectedHere
                              ? "Unequip"
                              : currentDieId
                                ? "Replace"
                                : "Equip here"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedDie.levelRequirement > combatLevel ? (
                  <p>Requires Combat Level {selectedDie.levelRequirement} to equip.</p>
                ) : null}
              </div>
            </article>
          </div>
        ) : (
          <div className="combat-arsenal__empty">
            <span aria-hidden="true">◇</span>
            <strong>Your arsenal is empty</strong>
            <p>Craft a Training Sword to prepare your first loadout.</p>
            <button className="primary-button" onClick={onOpenCrafting} type="button">Open Crafting</button>
          </div>
        )}
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
