import { useState } from "react";
import {
  getGatheringDieName,
  getNextGatheringFaceUpgrade,
  type GatheringSkillId,
} from "../engine/content";
import {
  getGatheringTalentNodes,
  type GatheringTalentNode,
} from "../engine/gatheringTalents";
import { RESOURCE_LABELS } from "../engine/resources";
import { useGameStore, type SkillProgression } from "../store/gameStore";
import { OverlayDialog } from "./OverlayDialog";

interface SkillTreeOverlayProps {
  onClose: () => void;
  onOpenDiceRack: () => void;
  skill: GatheringSkillId;
}

function isNodeAcquired(
  node: GatheringTalentNode,
  progression: SkillProgression,
  forestTrophy: boolean,
): boolean {
  switch (node.effect.type) {
    case "root":
      return true;
    case "blueprint":
      return forestTrophy;
    case "face": {
      const effect = node.effect;
      return progression.inventory.some(
        (die) =>
          die.kind === effect.dieKind &&
          die.upgradeLevel >= effect.rank,
      );
    }
    case "speed":
      return progression.rollSpeedLevel >= node.effect.rank;
    case "slot":
      return progression.slots >= node.effect.slots;
  }
}

function getNodeDetail(
  node: GatheringTalentNode,
  progression: SkillProgression,
): string {
  if (node.effect.type === "face") {
    const effect = node.effect;
    const representative = progression.inventory.find(
      (die) => die.kind === effect.dieKind,
    );
    if (!representative) {
      return `Craft a ${getGatheringDieName(effect.dieKind)} in the Dice Rack to unlock this branch.`;
    }
    const previewDie = {
      ...representative,
      upgradeLevel: effect.rank - 1,
    };
    const preview = getNextGatheringFaceUpgrade(previewDie);
    if (preview) {
      return `Face ${preview.faceIndex + 1}: ${preview.before} → ${preview.after} ${RESOURCE_LABELS[preview.resource]}. Applies to every ${getGatheringDieName(effect.dieKind)} you own now or later.`;
    }
  }
  if (node.effect.type === "slot") {
    return `${node.description} Your new die inherits the current starter blueprint upgrades.`;
  }
  return node.description;
}

export function SkillTreeOverlay({
  onClose,
  onOpenDiceRack,
  skill,
}: SkillTreeOverlayProps): React.JSX.Element {
  const progression = useGameStore((state) => state[skill]);
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const purchaseFace = useGameStore(
    (state) => state.purchaseGatheringFaceUpgrade,
  );
  const purchaseSpeed = useGameStore(
    (state) => state.purchaseGatheringRollSpeed,
  );
  const purchaseSlot = useGameStore((state) => state.purchaseGatheringSlot);
  const nodes = getGatheringTalentNodes(skill);
  const [selectedNodeId, setSelectedNodeId] = useState("starter-face-1");
  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? nodes[0];
  const acquiredById = new Map(
    nodes.map((node) => [
      node.id,
      isNodeAcquired(node, progression, forestTrophy),
    ]),
  );

  const selectedAcquired = acquiredById.get(selectedNode.id) ?? false;
  const selectedPrerequisitesMet = selectedNode.prerequisiteIds.every(
    (id) => acquiredById.get(id),
  );
  const selectedEffect = selectedNode.effect;
  const selectedRepresentative =
    selectedEffect.type === "face"
      ? progression.inventory.find((die) => die.kind === selectedEffect.dieKind)
      : undefined;
  const selectedHasRequiredDie =
    selectedNode.effect.type !== "face" || selectedRepresentative !== undefined;
  const selectedIsPurchasableType =
    selectedNode.effect.type === "face" ||
    selectedNode.effect.type === "speed" ||
    selectedNode.effect.type === "slot";
  const selectedCanAfford =
    selectedNode.cost !== undefined &&
    progression.spendableXp >= selectedNode.cost;
  const canPurchaseSelected =
    !selectedAcquired &&
    selectedPrerequisitesMet &&
    selectedHasRequiredDie &&
    selectedIsPurchasableType &&
    selectedCanAfford;

  const purchaseSelected = () => {
    if (!canPurchaseSelected) return;
    switch (selectedNode.effect.type) {
      case "face":
        if (selectedRepresentative) {
          purchaseFace(skill, selectedRepresentative.id);
        }
        break;
      case "speed":
        purchaseSpeed(skill);
        break;
      case "slot":
        purchaseSlot(skill);
        break;
      default:
        return;
    }
  };

  const purchaseLabel = (() => {
    if (selectedAcquired) return "Purchased";
    if (selectedNode.effect.type === "root") return "Your starting point";
    if (selectedNode.effect.type === "blueprint") {
      return "Defeat Forest Brute to unlock";
    }
    if (!selectedPrerequisitesMet) return "Purchase the previous node";
    if (!selectedHasRequiredDie) return "Craft this die in Dice Rack";
    if (!selectedCanAfford && selectedNode.cost !== undefined) {
      return `Need ${selectedNode.cost - progression.spendableXp} more XP`;
    }
    return `Buy · ${selectedNode.cost} XP`;
  })();
  const tracks = [
    {
      id: "starter",
      eyebrow: "Blueprint",
      title: "Face upgrades",
      description: "Improve the six faces shared by every starter die.",
      nodes: nodes.filter((node) => node.id.startsWith("starter-face-")),
    },
    {
      id: "speed",
      eyebrow: "Automation",
      title: "Roll speed",
      description: "Shorten the time between automatic rolls.",
      nodes: nodes.filter((node) => node.id.startsWith("speed-")),
    },
    {
      id: "slots",
      eyebrow: "Capacity",
      title: "Dice slots",
      description: "Add more physical dice to the active loadout.",
      nodes: nodes.filter((node) => node.id.startsWith("slot-")),
    },
    {
      id: "specialist",
      eyebrow: "Tier 2",
      title: "Specialist blueprint",
      description: "Earn the blueprint in combat, then improve its faces.",
      nodes: nodes.filter(
        (node) =>
          node.id === "specialist-blueprint" ||
          node.id.startsWith("specialist-face-"),
      ),
    },
  ] as const;

  return (
    <OverlayDialog
      className={`skill-tree skill-tree--${skill}`}
      eyebrow={`${skill === "woodcutting" ? "Woodcutting" : "Mining"} progression`}
      onClose={onClose}
      subtitle="Grow your engine one meaningful node at a time."
      title="Skill Tree"
    >
      <div className="skill-tree__balance">
        <span>Spendable skill XP</span>
        <strong>{progression.spendableXp}</strong>
      </div>
      <div className="skill-tree-minimal__body">
        <main className="skill-tree-minimal__tracks">
          <div className="skill-tree-minimal__grid">
            {tracks.map((track) => (
              <section className="upgrade-track" key={track.id}>
                <header>
                  <span className="eyebrow">{track.eyebrow}</span>
                  <h3>{track.title}</h3>
                  <p>{track.description}</p>
                </header>
                <ol>
                  {track.nodes.map((node) => {
                    const acquired = acquiredById.get(node.id) ?? false;
                    const prerequisitesMet = node.prerequisiteIds.every(
                      (id) => acquiredById.get(id),
                    );
                    const effect = node.effect;
                    const hasRequiredDie =
                      effect.type !== "face" ||
                      progression.inventory.some(
                        (die) => die.kind === effect.dieKind,
                      );
                    const reachable = prerequisitesMet && hasRequiredDie;
                    const affordable =
                      node.cost !== undefined &&
                      progression.spendableXp >= node.cost;
                    const stateClass = acquired
                      ? "upgrade-node--acquired"
                      : reachable
                        ? affordable
                          ? "upgrade-node--ready"
                          : "upgrade-node--reachable"
                        : "upgrade-node--locked";
                    return (
                      <li key={node.id}>
                        <button
                          aria-label={`${node.label}${acquired ? ", purchased" : ""}`}
                          aria-pressed={selectedNode.id === node.id}
                          className={`upgrade-node ${stateClass} ${selectedNode.id === node.id ? "upgrade-node--selected" : ""}`}
                          onClick={() => setSelectedNodeId(node.id)}
                          type="button"
                        >
                          <span className="upgrade-node__status" aria-hidden="true">
                            {acquired ? "✓" : node.icon}
                          </span>
                          <span className="upgrade-node__copy">
                            <strong>{node.label}</strong>
                            <small>
                              {acquired
                                ? "Purchased"
                                : !reachable
                                  ? "Locked"
                                  : affordable
                                    ? "Ready to buy"
                                    : "Available"}
                            </small>
                          </span>
                          <span className="upgrade-node__cost">
                            {acquired ? "Done" : node.cost !== undefined ? `${node.cost} XP` : "Gate"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        </main>

        <aside className="talent-detail talent-detail--minimal">
          <span className="eyebrow">
            {selectedAcquired
              ? "Unlocked"
              : selectedPrerequisitesMet
                ? "Available path"
                : "Future upgrade"}
          </span>
          <div className="talent-detail__icon" aria-hidden="true">
            {selectedNode.icon}
          </div>
          <h3>{selectedNode.label}</h3>
          <p>{getNodeDetail(selectedNode, progression)}</p>
          {selectedNode.cost !== undefined ? (
            <div className="talent-detail__cost">
              <span>Cost</span>
              <strong>{selectedNode.cost} skill XP</strong>
            </div>
          ) : null}
          <button
            className="talent-detail__purchase"
            disabled={!canPurchaseSelected}
            onClick={purchaseSelected}
            type="button"
          >
            {purchaseLabel}
          </button>
          {!selectedHasRequiredDie ? (
            <button className="talent-detail__rack-link" onClick={onOpenDiceRack} type="button">
              Open Dice Rack →
            </button>
          ) : null}
        </aside>
      </div>
    </OverlayDialog>
  );
}
