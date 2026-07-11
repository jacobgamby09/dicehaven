import { DiceTray } from "../components/DiceTray";
import { GatheringUpgradePanel } from "../components/GatheringUpgradePanel";
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
            {isActive ? (
              <span className="status-pill"><span /> Active skill</span>
            ) : (
              <button className="make-active-button" onClick={onMakeActive} type="button">
                Make Active
              </button>
            )}
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

      <div className="skill-layout">
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

        <GatheringUpgradePanel
          skill="woodcutting"
        />
      </div>
    </div>
  );
}
