import { AnimatePresence } from "motion/react";
import { RESOURCE_LABELS } from "../engine/resources";
import type { DieDefinition, ResourceId, RollEvent } from "../engine/roll";
import type { RollPhase } from "../hooks/useRollClock";
import { Die } from "./Die";
import { ResourceBurst } from "./ResourceBurst";

interface DiceTrayProps {
  dice: readonly DieDefinition[];
  event: RollEvent | null;
  isActive: boolean;
  isPaused: boolean;
  intervalMs: number;
  phase: RollPhase;
  primaryResource: ResourceId;
  secondaryResource?: ResourceId;
  progress: number;
  skillName: string;
  onTogglePause: () => void;
}

export function DiceTray({
  dice,
  event,
  isActive,
  isPaused,
  intervalMs,
  phase,
  primaryResource,
  secondaryResource,
  progress,
  skillName,
  onTogglePause,
}: DiceTrayProps): React.JSX.Element {
  const boostModifier = event?.modifiers.find((modifier) => modifier.type === "boost");
  const secondaryGain = secondaryResource
    ? (event?.gains[secondaryResource] ?? 0)
    : 0;
  const featuredResource = secondaryGain > 0 && secondaryResource
    ? secondaryResource
    : primaryResource;
  const featuredGain = event?.gains[featuredResource] ?? 0;
  const producedResources = [primaryResource, secondaryResource].flatMap(
    (resource) => {
      if (!resource) return [];
      const amount = event?.gains[resource] ?? 0;
      return amount > 0 ? [{ amount, resource }] : [];
    },
  );
  const visiblePhase = isActive ? phase : "idle";

  return (
    <section aria-labelledby="dice-tray-title" className="dice-tray">
      <header className="dice-tray__header">
        <div>
          <span className="eyebrow">{isActive ? "Active crew" : "Inactive crew"}</span>
          <h2 id="dice-tray-title">{skillName} dice</h2>
        </div>
        {isActive ? (
          <button className="text-button" onClick={onTogglePause} type="button">
            {isPaused ? "Resume" : "Pause"}
          </button>
        ) : (
          <span className="inactive-label">Inactive</span>
        )}
      </header>

      <div className="roll-meter">
        <div className="roll-meter__labels">
          <span>
            {!isActive
              ? "No production"
              : isPaused
                ? "Production paused"
                : phase === "rolling"
                  ? "Rolling…"
                  : "Next roll"}
          </span>
          <span>
            {isActive
              ? `${(intervalMs / 1_000).toFixed(1)}s`
              : "Make active to train"}
          </span>
        </div>
        <progress
          aria-label={`Time until next ${skillName} roll`}
          max={1}
          value={isActive ? progress : 0}
        />
      </div>

      <div className="dice-stage">
        <div aria-live="polite" className={`dice-grid dice-grid--${dice.length}`}>
          {dice.map((die) => (
            <Die
              definition={die}
              key={die.id}
              phase={visiblePhase}
              result={event?.results.find((result) => result.dieId === die.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {isActive && phase === "settled" && event ? (
            <ResourceBurst
              amount={featuredGain}
              key={`${featuredResource}-${event.id}`}
              resource={featuredResource}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <footer className="dice-tray__footer">
        <div aria-live="polite" className="roll-summary">
          {boostModifier ? (
            <>
              <span className="roll-summary__spark">✦</span>
              Foreman boosted {boostModifier.targetDieIds.length} dice by +{boostModifier.amount}
            </>
          ) : event ? (
            `${isActive ? "Roll" : "Last roll"} ${event.id} produced ${
              producedResources.length > 0
                ? producedResources
                    .map(
                      ({ amount, resource }) =>
                        `${amount} ${RESOURCE_LABELS[resource]}`,
                    )
                    .join(" + ")
                : "no resources"
            }`
          ) : !isActive ? (
            `Make ${skillName} active to begin production.`
          ) : (
            "The crew is getting ready for its first roll."
          )}
        </div>
        <span className="xp-per-roll">+1 {skillName} XP per roll</span>
      </footer>
    </section>
  );
}
