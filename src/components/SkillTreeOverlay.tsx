import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
  const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? nodes[0];

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    viewport.scrollLeft = 0;
  }, []);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
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
    setRecentlyPurchased(selectedNode.id);
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
    return `Buy for ${selectedNode.cost} XP`;
  })();

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
      <div className="skill-tree__body">
        <div className="skill-tree__viewport" ref={viewportRef}>
          <div className="skill-tree__canvas">
            <div aria-hidden="true" className="skill-tree__scenery">
              <span className="tree-scenery__trunk" />
              <span className="tree-scenery__crown" />
              <span className="tree-scenery__ground" />
            </div>
            <svg
              aria-hidden="true"
              className="skill-tree__connections"
              height="700"
              viewBox="0 0 1180 700"
              width="1180"
            >
              {nodes.flatMap((node) =>
                node.prerequisiteIds.flatMap((prerequisiteId) => {
                  const source = nodesById.get(prerequisiteId);
                  if (!source) return [];
                  const targetAcquired = acquiredById.get(node.id) ?? false;
                  const sourceAcquired = acquiredById.get(source.id) ?? false;
                  const controlX = (source.x + node.x) / 2;
                  const controlY = (source.y + node.y) / 2 - 24;
                  return [
                    <path
                      className={
                        targetAcquired
                          ? "talent-branch talent-branch--grown"
                          : sourceAcquired
                            ? "talent-branch talent-branch--reachable"
                            : "talent-branch"
                      }
                      d={`M ${source.x} ${source.y} Q ${controlX} ${controlY} ${node.x} ${node.y}`}
                      key={`${source.id}-${node.id}`}
                    />,
                  ];
                }),
              )}
            </svg>

            {nodes.map((node) => {
              const acquired = acquiredById.get(node.id) ?? false;
              const prerequisitesMet = node.prerequisiteIds.every(
                (id) => acquiredById.get(id),
              );
              const effect = node.effect;
              const hasRequiredDie =
                effect.type !== "face" ||
                progression.inventory.some((die) => die.kind === effect.dieKind);
              const isReachable = prerequisitesMet && hasRequiredDie;
              const isAffordable =
                node.cost !== undefined &&
                progression.spendableXp >= node.cost;
              const stateClass = acquired
                ? "talent-node--acquired"
                : isReachable
                  ? isAffordable
                    ? "talent-node--ready"
                    : "talent-node--reachable"
                  : "talent-node--locked";
              return (
                <motion.button
                  animate={{
                    scale: recentlyPurchased === node.id ? [1, 1.2, 1] : 1,
                  }}
                  aria-label={`${node.label}${acquired ? ", purchased" : ""}`}
                  aria-pressed={selectedNode.id === node.id}
                  className={`talent-node talent-node--${node.size} ${stateClass} ${selectedNode.id === node.id ? "talent-node--selected" : ""}`}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: node.x, top: node.y }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="talent-node__medallion">
                    <strong>{node.icon}</strong>
                    {acquired ? <i aria-hidden="true">✓</i> : null}
                  </span>
                  <span className="talent-node__label">{node.label}</span>
                  {node.cost !== undefined && !acquired ? (
                    <small>{node.cost} XP</small>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>

        <aside className="talent-detail">
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
          <div className="talent-detail__legend">
            <span><i className="legend-dot legend-dot--ready" /> Ready</span>
            <span><i className="legend-dot legend-dot--owned" /> Purchased</span>
            <span><i className="legend-dot" /> Locked</span>
          </div>
        </aside>
      </div>
    </OverlayDialog>
  );
}
