import { useState } from "react";
import {
  getGatheringDieFaces,
  getGatheringDieLevelRequirement,
  getGatheringDieName,
  getGatheringDieTier,
  getGatheringFaceUpgradeCost,
  getNextGatheringFaceUpgrade,
  getStarterGatheringDieKind,
  getTierTwoGatheringRecipe,
  type GatheringSkillId,
} from "../engine/content";
import {
  GATHERING_ROLL_SPEED_COSTS,
  canAfford,
  getGatheringRollInterval,
  getGatheringSlotCost,
  getLevelProgress,
} from "../engine/progression";
import { RESOURCE_LABELS, RESOURCE_SHORT_LABELS } from "../engine/resources";
import { useGameStore } from "../store/gameStore";
import { formatCost, formatMissingCost } from "../ui/formatCost";

interface GatheringUpgradePanelProps {
  skill: GatheringSkillId;
}

function getUpgradeStateClass(
  isComplete: boolean,
  canPurchase: boolean,
): string {
  if (isComplete) return "upgrade-card--complete";
  return canPurchase ? "upgrade-card--ready" : "upgrade-card--blocked";
}

export function GatheringUpgradePanel({
  skill,
}: GatheringUpgradePanelProps): React.JSX.Element {
  const progression = useGameStore((state) => state[skill]);
  const resources = useGameStore((state) => state.resources);
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const purchaseFaceUpgrade = useGameStore(
    (state) => state.purchaseGatheringFaceUpgrade,
  );
  const purchaseRollSpeed = useGameStore(
    (state) => state.purchaseGatheringRollSpeed,
  );
  const purchaseSlot = useGameStore(
    (state) => state.purchaseGatheringSlot,
  );
  const craftTierTwoDie = useGameStore(
    (state) => state.craftTierTwoGatheringDie,
  );
  const equipGatheringDie = useGameStore(
    (state) => state.equipGatheringDie,
  );
  const [selectedDieId, setSelectedDieId] = useState(
    progression.loadout[0] ?? "",
  );
  const selectedDie =
    progression.inventory.find((instance) => instance.id === selectedDieId) ??
    progression.inventory[0];
  const selectedDieIndex = progression.inventory.findIndex(
    (instance) => instance.id === selectedDie.id,
  );
  const selectedKindOrdinal = progression.inventory
    .slice(0, selectedDieIndex + 1)
    .filter((instance) => instance.kind === selectedDie.kind).length;
  const levelProgress = getLevelProgress(progression.lifetimeXp);
  const selectedLevelRequirement = getGatheringDieLevelRequirement(
    selectedDie.kind,
  );
  const selectedIsLevelLocked =
    levelProgress.level < selectedLevelRequirement;
  const dieFaces = getGatheringDieFaces(selectedDie);
  const facePreview = getNextGatheringFaceUpgrade(selectedDie);
  const faceCost = getGatheringFaceUpgradeCost(selectedDie);
  const canBuyFace =
    faceCost !== undefined && progression.spendableXp >= faceCost;
  const faceComplete = faceCost === undefined;

  const speedCost = GATHERING_ROLL_SPEED_COSTS[progression.rollSpeedLevel];
  const canBuySpeed =
    speedCost !== undefined && progression.spendableXp >= speedCost;
  const speedComplete = speedCost === undefined;
  const currentInterval = getGatheringRollInterval(
    progression.rollSpeedLevel,
  );
  const nextInterval = getGatheringRollInterval(
    progression.rollSpeedLevel + 1,
  );

  const slotCost = getGatheringSlotCost(progression.slots);
  const canBuySlot =
    slotCost !== undefined && progression.spendableXp >= slotCost;
  const slotsComplete = slotCost === undefined;
  const nextSlot = progression.slots + 1;
  const dieName = getGatheringDieName(selectedDie.kind);
  const starterDieName = getGatheringDieName(
    getStarterGatheringDieKind(skill),
  );

  const recipe = getTierTwoGatheringRecipe(skill);
  const canCraftTierTwo =
    forestTrophy && canAfford(resources, recipe.cost);
  const ownedTierTwoDice = progression.inventory.filter(
    (instance) => instance.kind === recipe.kind,
  ).length;

  return (
    <aside
      aria-labelledby={`${skill}-upgrades-title`}
      className="upgrade-panel upgrade-workshop"
    >
      <header className="upgrade-workshop__header">
        <div>
          <span className="eyebrow">Upgrade workshop</span>
          <h2 id={`${skill}-upgrades-title`}>Build your engine</h2>
        </div>
        <div className="upgrade-xp-balance">
          <strong>{progression.spendableXp}</strong>
          <span>skill XP</span>
        </div>
      </header>

      <section aria-labelledby={`${skill}-dice-pool-title`} className="dice-pool">
        <div className="dice-pool__heading">
          <div>
            <span className="eyebrow">Physical dice pool</span>
            <h3 id={`${skill}-dice-pool-title`}>Inventory & bench</h3>
          </div>
          <span>{progression.loadout.length} crew / {progression.inventory.length} owned</span>
        </div>
        <div className="dice-pool__selector">
          {progression.inventory.map((instance, inventoryIndex) => {
            const kindOrdinal = progression.inventory
              .slice(0, inventoryIndex + 1)
              .filter((candidate) => candidate.kind === instance.kind).length;
            const equippedSlot = progression.loadout.indexOf(instance.id);
            const isSelected = instance.id === selectedDie.id;
            const tier = getGatheringDieTier(instance.kind);
            const levelRequirement = getGatheringDieLevelRequirement(
              instance.kind,
            );

            return (
              <button
                aria-pressed={isSelected}
                className={`pool-die ${isSelected ? "pool-die--selected" : ""} ${tier === 2 ? "pool-die--tier-two" : ""}`}
                key={instance.id}
                onClick={() => setSelectedDieId(instance.id)}
                type="button"
              >
                <span aria-hidden="true">{tier === 2 ? "T2" : "d6"}</span>
                <strong>{getGatheringDieName(instance.kind)} #{kindOrdinal}</strong>
                <small>
                  {levelProgress.level < levelRequirement
                    ? `Locked - Level ${levelRequirement}`
                    : equippedSlot >= 0
                      ? `Crew slot ${equippedSlot + 1}`
                      : "On bench"}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <div className="face-map" aria-label={`${dieName} face values`}>
        <div>
          <strong>{dieName} #{selectedKindOrdinal}</strong>
          <span>Face upgrades {selectedDie.upgradeLevel}/6</span>
        </div>
        <ol>
          {dieFaces.map((face, faceIndex) => (
            <li
              className={
                facePreview?.faceIndex === faceIndex ? "face-map__next" : ""
              }
              key={`face-${faceIndex + 1}`}
            >
              <small>{faceIndex + 1}</small>
              <strong>{face.amount}</strong>
              <em>{RESOURCE_SHORT_LABELS[face.resource]}</em>
            </li>
          ))}
        </ol>
      </div>

      <section aria-labelledby={`${skill}-loadout-title`} className="gathering-loadout">
        <div className="gathering-loadout__heading">
          <div>
            <span className="eyebrow">Adjust your pool</span>
            <h3 id={`${skill}-loadout-title`}>Crew loadout</h3>
          </div>
          <span>Select a die, then choose a slot</span>
        </div>
        <div className="gathering-loadout__slots">
          {progression.loadout.map((instanceId, slotIndex) => {
            const equippedDie = progression.inventory.find(
              (instance) => instance.id === instanceId,
            );
            const selectedIsHere = instanceId === selectedDie.id;

            return (
              <button
                aria-label={
                  selectedIsHere
                    ? `${dieName} is equipped in crew slot ${slotIndex + 1}`
                    : `Equip ${dieName} in crew slot ${slotIndex + 1}`
                }
                className={selectedIsHere ? "loadout-slot loadout-slot--selected" : "loadout-slot"}
                disabled={selectedIsHere || selectedIsLevelLocked}
                key={`slot-${slotIndex + 1}`}
                onClick={() =>
                  equipGatheringDie(skill, selectedDie.id, slotIndex)
                }
                type="button"
              >
                <small>Slot {slotIndex + 1}</small>
                <strong>
                  {equippedDie
                    ? getGatheringDieName(equippedDie.kind)
                    : "Empty"}
                </strong>
                <span>{selectedIsHere ? "Equipped" : "Replace"}</span>
              </button>
            );
          })}
        </div>
        {selectedIsLevelLocked ? (
          <p className="gathering-loadout__lock">
            Reach {skill === "woodcutting" ? "Woodcutting" : "Mining"} Level {selectedLevelRequirement} to equip this die.
          </p>
        ) : null}
      </section>

      <div className="upgrade-list upgrade-list--engine">
        <button
          className={`upgrade-card upgrade-card--action ${getUpgradeStateClass(faceComplete, canBuyFace)}`}
          disabled={!canBuyFace}
          onClick={() => purchaseFaceUpgrade(skill, selectedDie.id)}
          type="button"
        >
          <span className="upgrade-card__icon" aria-hidden="true">
            {faceComplete ? "OK" : "+1"}
          </span>
          <span className="upgrade-card__copy">
            <strong>
              {faceComplete ? `${dieName} mastered` : `Improve face ${(facePreview?.faceIndex ?? 0) + 1}`}
            </strong>
            <span>
              {facePreview
                ? `${facePreview.before} -> ${facePreview.after} ${RESOURCE_LABELS[facePreview.resource]}`
                : "All six faces improved"}
            </span>
            <em>
              {faceComplete
                ? "Complete"
                : canBuyFace
                  ? `${faceCost} XP - Buy now`
                  : `${faceCost} XP`}
            </em>
          </span>
        </button>

        <button
          className={`upgrade-card upgrade-card--action ${getUpgradeStateClass(speedComplete, canBuySpeed)}`}
          disabled={!canBuySpeed}
          onClick={() => purchaseRollSpeed(skill)}
          type="button"
        >
          <span className="upgrade-card__icon" aria-hidden="true">
            {speedComplete ? "OK" : "RUN"}
          </span>
          <span className="upgrade-card__copy">
            <strong>
              {speedComplete
                ? "Roll engine mastered"
                : `Roll Speed ${progression.rollSpeedLevel + 1}`}
            </strong>
            <span>
              {speedComplete
                ? `${(currentInterval / 1_000).toFixed(1)}s final speed`
                : `${(currentInterval / 1_000).toFixed(1)}s -> ${(nextInterval / 1_000).toFixed(1)}s`}
            </span>
            <em>
              {speedComplete
                ? "Complete"
                : canBuySpeed
                  ? `${speedCost} XP - Buy now`
                  : `${speedCost} XP`}
            </em>
          </span>
        </button>

        <button
          className={`upgrade-card upgrade-card--action ${getUpgradeStateClass(slotsComplete, canBuySlot)}`}
          disabled={!canBuySlot}
          onClick={() => purchaseSlot(skill)}
          type="button"
        >
          <span className="upgrade-card__icon" aria-hidden="true">
            {slotsComplete ? "OK" : `+${nextSlot}`}
          </span>
          <span className="upgrade-card__copy">
            <strong>
              {slotsComplete ? "Full crew" : `${nextSlot === 2 ? "Second" : "Third"} Slot`}
            </strong>
            <span>
              {slotsComplete
                ? "Three dice roll together"
                : `Adds a new ${starterDieName} immediately`}
            </span>
            <em>
              {slotsComplete
                ? "Complete"
                : canBuySlot
                  ? `${slotCost} XP - Buy now`
                  : `${slotCost} XP`}
            </em>
          </span>
        </button>
      </div>

      <section aria-labelledby={`${skill}-tier-two-title`} className="tier-two-recipe">
        <header>
          <div>
            <span className="eyebrow">Forest blueprint</span>
            <h3 id={`${skill}-tier-two-title`}>{recipe.name}</h3>
          </div>
          <span className={forestTrophy ? "blueprint-state blueprint-state--ready" : "blueprint-state"}>
            {forestTrophy ? "Blueprint earned" : "Boss locked"}
          </span>
        </header>
        <p>{recipe.description}</p>
        <div className="tier-two-recipe__facts">
          <span>{recipe.outputLabel}</span>
          <span>Equip at Level {recipe.levelRequirement}</span>
          <span>{ownedTierTwoDice} owned</span>
        </div>
        <strong className="tier-two-recipe__cost">{formatCost(recipe.cost)}</strong>
        <button
          className="tier-two-recipe__button"
          disabled={!canCraftTierTwo}
          onClick={() => craftTierTwoDie(skill)}
          type="button"
        >
          {!forestTrophy
            ? "Defeat Forest Brute to earn blueprint"
            : canCraftTierTwo
              ? `Craft ${recipe.name}`
              : formatMissingCost(resources, recipe.cost)}
        </button>
      </section>

      <p className="upgrade-panel__hint">
        Skill XP improves your engine. Resources and Monster Parts craft new physical dice.
      </p>
    </aside>
  );
}
