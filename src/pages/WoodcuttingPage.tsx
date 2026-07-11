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

interface WoodcuttingPageProps {
  event: RollEvent | null;
  intervalMs: number;
  isActive: boolean;
  isPaused: boolean;
  phase: RollPhase;
  progress: number;
  onMakeActive: () => void;
  onTogglePause: () => void;
}

export function WoodcuttingPage({
  event,
  intervalMs,
  isActive,
  isPaused,
  phase,
  progress,
  onMakeActive,
  onTogglePause,
}: WoodcuttingPageProps): React.JSX.Element {
  const [openOverlay, setOpenOverlay] = useState<"rack" | "tree" | null>(null);
  const progression = useGameStore((state) => state.woodcutting);
  const levelProgress = getLevelProgress(progression.lifetimeXp);
  const dice = getGatheringDice(
    progression.inventory,
    progression.loadout,
  );

  return (
    <div className="skill-page skill-page--woodcutting">
      <section className="skill-hero">
        <div aria-hidden="true" className="skill-hero__landscape">
          <span className="hill hill--back" />
          <span className="hill hill--front" />
          <span className="tree tree--one" />
          <span className="tree tree--two" />
          <span className="tree tree--three" />
          <span className="tower" />
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
          <h1>Woodcutting</h1>
          <p>Your crew works the greenwood, one careful roll at a time.</p>
          <div className="skill-level">
            <div>
              <span>Level {levelProgress.level}</span>
              <strong>
                {progression.lifetimeXp} / {levelProgress.nextLevelXp} lifetime XP
              </strong>
            </div>
            <progress
              aria-label="Woodcutting level progress"
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
          primaryResource="wood"
          progress={progress}
          secondaryResource="oak"
          skillName="Woodcutting"
        />
      </div>
      {openOverlay === "rack" ? (
        <DiceRackOverlay
          onClose={() => setOpenOverlay(null)}
          onOpenSkillTree={() => setOpenOverlay("tree")}
          skill="woodcutting"
        />
      ) : null}
      {openOverlay === "tree" ? (
        <SkillTreeOverlay
          onClose={() => setOpenOverlay(null)}
          onOpenDiceRack={() => setOpenOverlay("rack")}
          skill="woodcutting"
        />
      ) : null}
    </div>
  );
}
