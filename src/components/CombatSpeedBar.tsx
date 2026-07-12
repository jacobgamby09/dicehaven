import { useReducedMotion } from "motion/react";
import { useState } from "react";

interface CombatSpeedBarProps {
  actionLabel: string;
  ariaLabel: string;
  intervalMs: number;
  label: string;
  progress: number;
  tone: "enemy" | "player";
}

export function CombatSpeedBar({
  actionLabel,
  ariaLabel,
  intervalMs,
  label,
  progress,
  tone,
}: CombatSpeedBarProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const safeProgress = Math.max(0, Math.min(1, progress));
  const [initialProgress] = useState(safeProgress);
  const intervalSeconds = intervalMs / 1_000;
  const remainingSeconds = Math.max(
    0,
    (intervalMs * (1 - safeProgress)) / 1_000,
  );
  const status = `${remainingSeconds.toFixed(1)}s until ${actionLabel.toLowerCase()}`;
  const fillStyle = reduceMotion
    ? { transform: `scaleX(${safeProgress})` }
    : {
        animationDelay: `-${initialProgress * intervalMs}ms`,
        animationDuration: `${Math.max(1, intervalMs)}ms`,
      };

  return (
    <div className={`combat-speed-bar combat-speed-bar--${tone}`}>
      <div className="combat-speed-bar__labels">
        <span><i aria-hidden="true" /> {label}</span>
        <strong>{status}</strong>
      </div>
      <div
        aria-label={ariaLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(safeProgress * 100)}
        aria-valuetext={`${status}; ${intervalSeconds.toFixed(1)} second interval`}
        className="combat-speed-bar__track"
        role="progressbar"
      >
        <span
          className="combat-speed-bar__fill"
          style={fillStyle}
        />
      </div>
      <small>{intervalSeconds.toFixed(1)}s interval</small>
    </div>
  );
}
