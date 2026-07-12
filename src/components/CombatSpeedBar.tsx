interface CombatSpeedBarProps {
  actionLabel: string;
  ariaLabel: string;
  intervalMs: number;
  isResolving?: boolean;
  label: string;
  progress: number;
  resolvingLabel?: string;
  tone: "enemy" | "player";
}

export function CombatSpeedBar({
  actionLabel,
  ariaLabel,
  intervalMs,
  isResolving = false,
  label,
  progress,
  resolvingLabel,
  tone,
}: CombatSpeedBarProps): React.JSX.Element {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const displayedProgress = isResolving ? 1 : safeProgress;
  const intervalSeconds = intervalMs / 1_000;
  const remainingSeconds = Math.max(
    0,
    (intervalMs * (1 - safeProgress)) / 1_000,
  );
  const status = isResolving
    ? resolvingLabel ?? actionLabel
    : `${remainingSeconds.toFixed(1)}s until ${actionLabel.toLowerCase()}`;

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
        aria-valuenow={Math.round(displayedProgress * 100)}
        aria-valuetext={`${status}; ${intervalSeconds.toFixed(1)} second interval`}
        className="combat-speed-bar__track"
        role="progressbar"
      >
        <span
          className="combat-speed-bar__fill"
          style={{ transform: `scaleX(${displayedProgress})` }}
        />
      </div>
      <small>{intervalSeconds.toFixed(1)}s interval</small>
    </div>
  );
}
