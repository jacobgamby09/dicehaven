import { useState } from "react";
import {
  getGatheringDieFaces,
  getGatheringDieLevelRequirement,
  getGatheringDieName,
  getGatheringDieTier,
  getTierTwoGatheringRecipe,
  type GatheringSkillId,
} from "../engine/content";
import { canAfford, getLevelProgress } from "../engine/progression";
import { RESOURCE_SHORT_LABELS } from "../engine/resources";
import { useGameStore } from "../store/gameStore";
import { formatCost, formatMissingCost } from "../ui/formatCost";
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
  const resources = useGameStore((state) => state.resources);
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const equipDie = useGameStore((state) => state.equipGatheringDie);
  const unequipSlot = useGameStore((state) => state.unequipGatheringSlot);
  const craftTierTwoDie = useGameStore(
    (state) => state.craftTierTwoGatheringDie,
  );
  const [filter, setFilter] = useState<RackFilter>("all");
  const [selectedDieId, setSelectedDieId] = useState(
    progression.loadout.find((id): id is string => id !== null) ??
      progression.inventory[0]?.id ??
      "",
  );
  const firstEmptySlot = progression.loadout.findIndex((id) => id === null);
  const [selectedSlot, setSelectedSlot] = useState(
    firstEmptySlot >= 0 ? firstEmptySlot : 0,
  );

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
  const targetSlot = Math.min(selectedSlot, progression.slots - 1);
  const recipe = getTierTwoGatheringRecipe(skill);
  const ownedTierTwoDice = progression.inventory.filter(
    (die) => die.kind === recipe.kind,
  ).length;
  const canCraft = forestTrophy && canAfford(resources, recipe.cost);

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
      subtitle="Choose the physical dice your crew takes into the next roll."
      title="Dice Rack"
    >
      <div className="dice-rack__body">
        <section aria-labelledby="active-rack-title" className="rack-loadout">
          <div className="rack-section-heading">
            <div>
              <span className="eyebrow">Ready to roll</span>
              <h3 id="active-rack-title">Active dice pool</h3>
            </div>
            <span>{progression.loadout.filter(Boolean).length} of {progression.slots} equipped</span>
          </div>
          <div className="rack-loadout__slots">
            {progression.loadout.map((dieId, slotIndex) => {
              const die = progression.inventory.find(
                (candidate) => candidate.id === dieId,
              );
              return (
                <div
                  className={`rack-slot ${slotIndex === targetSlot ? "rack-slot--target" : ""}`}
                  key={`rack-slot-${slotIndex + 1}`}
                >
                  <button
                    aria-pressed={slotIndex === targetSlot}
                    className="rack-slot__select"
                    onClick={() => {
                      setSelectedSlot(slotIndex);
                      if (die) setSelectedDieId(die.id);
                    }}
                    type="button"
                  >
                    <small>Slot {slotIndex + 1}</small>
                    <strong>{die ? getGatheringDieName(die.kind) : "Empty slot"}</strong>
                    <span>{die ? `Tier ${getGatheringDieTier(die.kind)}` : "Select a die below"}</span>
                  </button>
                  {die ? (
                    <button
                      aria-label={`Unequip ${getGatheringDieName(die.kind)} from slot ${slotIndex + 1}`}
                      className="rack-slot__remove"
                      onClick={() => unequipSlot(skill, slotIndex)}
                      type="button"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <div className="dice-rack__workspace">
          <section aria-labelledby="owned-dice-title" className="rack-inventory">
            <div className="rack-section-heading">
              <div>
                <span className="eyebrow">Your collection</span>
                <h3 id="owned-dice-title">Owned dice</h3>
              </div>
              <span>{progression.inventory.length} physical dice</span>
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
                    <small>
                      {level < requirement
                        ? `Requires Level ${requirement}`
                        : slot >= 0
                          ? `Equipped · Slot ${slot + 1}`
                          : "On bench"}
                    </small>
                  </button>
                );
              })}
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
            {equippedSlot >= 0 ? (
              <button
                className="rack-primary-action rack-primary-action--muted"
                onClick={() => unequipSlot(skill, equippedSlot)}
                type="button"
              >
                Unequip from slot {equippedSlot + 1}
              </button>
            ) : (
              <button
                className="rack-primary-action"
                disabled={selectedIsLocked}
                onClick={() => equipDie(skill, selectedDie.id, targetSlot)}
                type="button"
              >
                Equip to slot {targetSlot + 1}
              </button>
            )}
            <button className="rack-tree-link" onClick={onOpenSkillTree} type="button">
              Improve this blueprint in Skill Tree →
            </button>
          </aside>
        </div>

        <section className="rack-blueprint">
          <div>
            <span className="eyebrow">Forest blueprint</span>
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
          </div>
          <div className="rack-blueprint__facts">
            <span>{ownedTierTwoDice} owned</span>
            <span>Equip at Level {recipe.levelRequirement}</span>
            <strong>{formatCost(recipe.cost)}</strong>
          </div>
          <button
            disabled={!canCraft}
            onClick={() => craftTierTwoDie(skill)}
            type="button"
          >
            {!forestTrophy
              ? "Defeat Forest Brute"
              : canCraft
                ? `Craft ${recipe.name}`
                : formatMissingCost(resources, recipe.cost)}
          </button>
        </section>
      </div>
    </OverlayDialog>
  );
}
