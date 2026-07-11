import { useState } from "react";
import { DiceRackOverlay } from "../components/DiceRackOverlay";
import { DiceTray } from "../components/DiceTray";
import { SkillHeaderActions } from "../components/SkillHeaderActions";
import { SkillTreeOverlay } from "../components/SkillTreeOverlay";
import { getGatheringDice } from "../engine/content";
import { getLevelProgress } from "../engine/progression";
import type { RollEvent } from "../engine/roll";
import type { RollPhase } from "../hooks/useRollClock";
import { useGameStore } from "../store/gameStore";

interface MiningPageProps {
  event: RollEvent | null;
  intervalMs: number;
  isActive: boolean;
  isPaused: boolean;
  phase: RollPhase;
  progress: number;
  onMakeActive: () => void;
  onTogglePause: () => void;
}

export function MiningPage({
  event,
  intervalMs,
  isActive,
  isPaused,
  phase,
  progress,
  onMakeActive,
  onTogglePause,
}: MiningPageProps): React.JSX.Element {
  const [openOverlay, setOpenOverlay] = useState<"rack" | "tree" | null>(null);
  const progression = useGameStore((state) => state.mining);
  const levelProgress = getLevelProgress(progression.lifetimeXp);
  const dice = getGatheringDice(
    progression.inventory,
    progression.loadout,
  );

  return (
    <div className="skill-page skill-page--mining">
      <section className="skill-hero skill-hero--mining">
        <div aria-hidden="true" className="mining-landscape">
          <span className="mine-ridge mine-ridge--back" />
          <span className="mine-ridge mine-ridge--front" />
          <span className="mine-entrance" />
          <span className="crystal crystal--one" />
          <span className="crystal crystal--two" />
          <span className="mine-lantern" />
        </div>
        <div className="skill-hero__copy">
          <div className="skill-hero__meta">
            <SkillHeaderActions
              equippedDice={progression.loadout.filter(Boolean).length}
              isActive={isActive}
              onMakeActive={onMakeActive}
              onOpenDiceRack={() => setOpenOverlay("rack")}
              onOpenSkillTree={() => setOpenOverlay("tree")}
              skillXp={progression.spendableXp}
              slots={progression.slots}
            />
          </div>
          <h1>Mining</h1>
          <p>Your crew follows the lantern light toward stone and deeper veins.</p>
          <div className="skill-level">
            <div>
              <span>Level {levelProgress.level}</span>
              <strong>
                {progression.lifetimeXp} / {levelProgress.nextLevelXp} lifetime XP
              </strong>
            </div>
            <progress
              aria-label="Mining level progress"
              max={levelProgress.xpNeededInLevel}
              value={levelProgress.progressInLevel}
            />
            <small>{progression.spendableXp} spendable XP</small>
          </div>
        </div>
      </section>

      <div className="skill-layout skill-layout--single">
        <DiceTray
          dice={dice}
          event={event}
          intervalMs={intervalMs}
          isActive={isActive}
          isPaused={isPaused}
          onTogglePause={onTogglePause}
          phase={phase}
          primaryResource="stone"
          progress={progress}
          secondaryResource="copper"
          skillName="Mining"
        />
      </div>
      {openOverlay === "rack" ? (
        <DiceRackOverlay
          onClose={() => setOpenOverlay(null)}
          onOpenSkillTree={() => setOpenOverlay("tree")}
          skill="mining"
        />
      ) : null}
      {openOverlay === "tree" ? (
        <SkillTreeOverlay
          onClose={() => setOpenOverlay(null)}
          onOpenDiceRack={() => setOpenOverlay("rack")}
          skill="mining"
        />
      ) : null}
    </div>
  );
}
