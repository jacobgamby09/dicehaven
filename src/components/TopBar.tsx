import type { ResourceId } from "../engine/roll";
import { ResourceIcon } from "./ResourceIcon";

interface TopBarProps {
  isMenuOpen: boolean;
  resources: Record<ResourceId, number>;
  onOpenMenu: () => void;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en", {
    notation: amount >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function TopBar({ isMenuOpen, resources, onOpenMenu }: TopBarProps): React.JSX.Element {
  return (
    <header className="topbar">
      <button
        aria-controls="main-sidebar"
        aria-expanded={isMenuOpen}
        aria-label="Open navigation"
        className="menu-button"
        onClick={onOpenMenu}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="topbar__resources" role="list" aria-label="Resources">
        <div
          aria-label={`Wood: ${formatAmount(resources.wood)}`}
          className="resource-chip resource-chip--wood"
          role="listitem"
        >
          <ResourceIcon resource="wood" />
          <span>Wood</span>
          <strong>{formatAmount(resources.wood)}</strong>
        </div>
        {resources.oak > 0 ? (
          <div
            aria-label={`Oak Logs: ${formatAmount(resources.oak)}`}
            className="resource-chip resource-chip--oak"
            role="listitem"
          >
            <ResourceIcon resource="oak" />
            <span>Oak</span>
            <strong>{formatAmount(resources.oak)}</strong>
          </div>
        ) : null}
        <div
          aria-label={`Stone: ${formatAmount(resources.stone)}`}
          className="resource-chip resource-chip--stone"
          role="listitem"
        >
          <ResourceIcon resource="stone" />
          <span>Stone</span>
          <strong>{formatAmount(resources.stone)}</strong>
        </div>
        <div
          aria-label={`Copper Ore: ${formatAmount(resources.copper)}`}
          className="resource-chip resource-chip--copper"
          role="listitem"
        >
          <ResourceIcon resource="copper" />
          <span>Copper</span>
          <strong>{formatAmount(resources.copper)}</strong>
        </div>
        <div
          aria-label={`Monster Parts: ${formatAmount(resources.monsterParts)}`}
          className="resource-chip resource-chip--monster-parts"
          role="listitem"
        >
          <ResourceIcon resource="monsterParts" />
          <span>Parts</span>
          <strong>{formatAmount(resources.monsterParts)}</strong>
        </div>
      </div>

      <button aria-label="Settings coming soon" className="round-button" title="Settings coming soon" type="button">
        <span aria-hidden="true">⚙</span>
      </button>
    </header>
  );
}
