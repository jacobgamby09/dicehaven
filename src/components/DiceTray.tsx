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
  const intervalSeconds = intervalMs / 1_000;
  const remainingSeconds = Math.max(
    0,
    (intervalMs * (1 - progress)) / 1_000,
  );
  const rollSpeedStatus = !isActive
    ? "Inactive"
    : dice.length === 0
      ? "No dice equipped"
      : isPaused
        ? "Paused"
        : phase === "rolling"
          ? "Rolling…"
          : `${remainingSeconds.toFixed(1)}s until roll`;
  const displayedRollProgress =
    !isActive || dice.length === 0
      ? 0
      : phase === "rolling"
        ? 1
        : progress;

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

      <div className="dice-stage">
        <div className="roll-speed-hud">
          <div className="roll-speed-hud__labels">
            <span><i aria-hidden="true" /> Roll speed</span>
            <strong>{rollSpeedStatus}</strong>
          </div>
          <div
            aria-label={`${skillName} roll speed`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(displayedRollProgress * 100)}
            aria-valuetext={`${rollSpeedStatus}; ${intervalSeconds.toFixed(1)} second interval`}
            className="roll-speed-hud__track"
            role="progressbar"
          >
            <span
              className="roll-speed-hud__fill"
              style={{ transform: `scaleX(${displayedRollProgress})` }}
            />
          </div>
          <small>{intervalSeconds.toFixed(1)}s interval</small>
        </div>
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
