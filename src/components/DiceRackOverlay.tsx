import { useState } from "react";
import {
  getGatheringDieFaces,
  getGatheringDieLevelRequirement,
  getGatheringDieName,
  getGatheringDieTier,
  type GatheringSkillId,
} from "../engine/content";
import { getLevelProgress } from "../engine/progression";
import { RESOURCE_SHORT_LABELS } from "../engine/resources";
import { useGameStore } from "../store/gameStore";
import { OverlayDialog } from "./OverlayDialog";

type RackFilter = "all" | "tier-one" | "tier-two" | "benched";

interface DiceRackOverlayProps {
  onClose: () => void;
  onOpenSkillTree: () => void;
  skill: GatheringSkillId;
}

const FILTERS: readonly { id: RackFilter; label: string }[] = [
  { id: "all", label: "All dice" },
  { id: "tier-one", label: "Tier 1" },
  { id: "tier-two", label: "Tier 2" },
  { id: "benched", label: "On bench" },
];

export function DiceRackOverlay({
  onClose,
  onOpenSkillTree,
  skill,
}: DiceRackOverlayProps): React.JSX.Element {
  const progression = useGameStore((state) => state[skill]);
  const equipDie = useGameStore((state) => state.equipGatheringDie);
  const unequipSlot = useGameStore((state) => state.unequipGatheringSlot);
  const [filter, setFilter] = useState<RackFilter>("all");
  const [selectedDieId, setSelectedDieId] = useState(
    progression.loadout.find((id): id is string => id !== null) ??
      progression.inventory[0]?.id ??
      "",
  );
  const firstEmptySlot = progression.loadout.findIndex((id) => id === null);
  const equippedCount = progression.loadout.filter(Boolean).length;

  const selectedDie =
    progression.inventory.find((die) => die.id === selectedDieId) ??
    progression.inventory[0];
  const level = getLevelProgress(progression.lifetimeXp).level;
  const selectedRequirement = getGatheringDieLevelRequirement(selectedDie.kind);
  const selectedIsLocked = level < selectedRequirement;
  const equippedSlot = progression.loadout.indexOf(selectedDie.id);
  const selectedTier = getGatheringDieTier(selectedDie.kind);
  const selectedFaces = getGatheringDieFaces(selectedDie);
  const selectedOrdinal =
    progression.inventory
      .slice(0, progression.inventory.indexOf(selectedDie) + 1)
      .filter((die) => die.kind === selectedDie.kind).length;
  const filteredDice = progression.inventory.filter((die) => {
    const tier = getGatheringDieTier(die.kind);
    if (filter === "tier-one") return tier === 1;
    if (filter === "tier-two") return tier === 2;
    if (filter === "benched") return !progression.loadout.includes(die.id);
    return true;
  });

  return (
    <OverlayDialog
      className={`dice-rack dice-rack--${skill}`}
      eyebrow={`${skill === "woodcutting" ? "Woodcutting" : "Mining"} loadout`}
      onClose={onClose}
      subtitle="Tap a die to select it, then equip or manage it."
      title="Dice Rack"
    >
      <div className="dice-rack__body">
        <div className="dice-rack__workspace">
          <section aria-labelledby="owned-dice-title" className="rack-inventory">
            <div className="rack-section-heading">
              <div>
                <span className="eyebrow">Your collection</span>
                <h3 id="owned-dice-title">Choose a die</h3>
              </div>
              <span className="rack-equipped-count">
                <strong>{equippedCount}/{progression.slots}</strong> equipped
              </span>
            </div>
            <div aria-label="Filter dice" className="rack-filters">
              {FILTERS.map((item) => (
                <button
                  aria-pressed={filter === item.id}
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            {filteredDice.length > 0 ? (
              <div className="rack-dice-grid">
                {filteredDice.map((die) => {
                  const slot = progression.loadout.indexOf(die.id);
                  const ordinal = progression.inventory
                    .slice(0, progression.inventory.indexOf(die) + 1)
                    .filter((candidate) => candidate.kind === die.kind).length;
                  const requirement = getGatheringDieLevelRequirement(die.kind);
                  const isSelected = selectedDie.id === die.id;
                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`rack-die-card ${isSelected ? "rack-die-card--selected" : ""} ${getGatheringDieTier(die.kind) === 2 ? "rack-die-card--specialist" : ""}`}
                      key={die.id}
                      onClick={() => setSelectedDieId(die.id)}
                      type="button"
                    >
                      <span className="rack-die-card__die" aria-hidden="true">
                        {getGatheringDieTier(die.kind) === 2 ? "T2" : "D6"}
                      </span>
                      <strong>{getGatheringDieName(die.kind)} #{ordinal}</strong>
                      <small
                        className={slot >= 0 ? "rack-die-card__equipped" : ""}
                      >
                        {level < requirement
                          ? `Level ${requirement} required`
                          : slot >= 0
                            ? `✓ Equipped · Slot ${slot + 1}`
                            : "Tap to select"}
                      </small>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rack-empty-state">
                No owned dice match this filter. Craft new physical dice in Crafting.
              </div>
            )}

            <div aria-live="polite" className="rack-quick-action">
              <div className="rack-quick-action__copy">
                <span>Selected</span>
                <strong>{getGatheringDieName(selectedDie.kind)} #{selectedOrdinal}</strong>
                <small>
                  {selectedIsLocked
                    ? `Requires Level ${selectedRequirement}`
                    : equippedSlot >= 0
                      ? `Currently in slot ${equippedSlot + 1}`
                      : firstEmptySlot >= 0
                        ? `Open slot ${firstEmptySlot + 1} available`
                        : "All slots are currently filled"}
                </small>
              </div>

              {equippedSlot >= 0 ? (
                <button
                  className="rack-primary-action rack-primary-action--muted"
                  onClick={() => unequipSlot(skill, equippedSlot)}
                  type="button"
                >
                  Unequip
                </button>
              ) : firstEmptySlot >= 0 ? (
                <button
                  className="rack-primary-action"
                  disabled={selectedIsLocked}
                  onClick={() => equipDie(skill, selectedDie.id, firstEmptySlot)}
                  type="button"
                >
                  {selectedIsLocked
                    ? `Level ${selectedRequirement} required`
                    : "Equip die"}
                </button>
              ) : (
                <div className="rack-replace-picker">
                  <span>
                    {selectedIsLocked
                      ? `Level ${selectedRequirement} required`
                      : "Replace equipped die:"}
                  </span>
                  <div>
                    {progression.loadout.map((dieId, slotIndex) => {
                      const equippedDie = progression.inventory.find(
                        (die) => die.id === dieId,
                      );
                      return (
                        <button
                          disabled={selectedIsLocked}
                          key={`replace-slot-${slotIndex + 1}`}
                          onClick={() => equipDie(skill, selectedDie.id, slotIndex)}
                          type="button"
                        >
                          <small>Slot {slotIndex + 1}</small>
                          <strong>
                            {equippedDie
                              ? getGatheringDieName(equippedDie.kind)
                              : "Empty"}
                          </strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="rack-inspector">
            <div className="rack-inspector__title">
              <span className="eyebrow">Selected die</span>
              <h3>{getGatheringDieName(selectedDie.kind)} #{selectedOrdinal}</h3>
              <p>Tier {selectedTier} · Blueprint rank {selectedDie.upgradeLevel}/6</p>
            </div>
            <ol aria-label="Die face values" className="rack-face-grid">
              {selectedFaces.map((face, index) => (
                <li key={`rack-face-${index + 1}`}>
                  <small>{index + 1}</small>
                  <strong>{face.amount}</strong>
                  <span>{RESOURCE_SHORT_LABELS[face.resource]}</span>
                </li>
              ))}
            </ol>
            {selectedIsLocked ? (
              <p className="rack-inspector__notice">
                Reach Level {selectedRequirement} to equip this die.
              </p>
            ) : null}
            <button className="rack-tree-link" onClick={onOpenSkillTree} type="button">
              Improve this blueprint in Skill Tree →
            </button>
          </aside>
        </div>
      </div>
    </OverlayDialog>
  );
}
