import { DiceTray } from "../components/DiceTray";
import { GatheringUpgradePanel } from "../components/GatheringUpgradePanel";
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
            {isActive ? (
              <span className="status-pill"><span /> Active skill</span>
            ) : (
              <button className="make-active-button" onClick={onMakeActive} type="button">
                Make Active
              </button>
            )}
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

      <div className="skill-layout">
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

        <GatheringUpgradePanel
          skill="mining"
        />
      </div>
    </div>
  );
}
