import {
  BARRACKS_COST,
  canAfford,
  FRONTIER_FORGE_COST,
  WORKSHOP_COST,
} from "../engine/progression";
import { useGameStore } from "../store/gameStore";
import { formatCost, formatMissingCost } from "../ui/formatCost";

export function SettlementPage(): React.JSX.Element {
  const resources = useGameStore((state) => state.resources);
  const workshopBuilt = useGameStore((state) => state.buildings.workshop);
  const barracksBuilt = useGameStore((state) => state.buildings.barracks);
  const frontierForgeBuilt = useGameStore(
    (state) => state.buildings.frontierForge,
  );
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const purchaseWorkshop = useGameStore((state) => state.purchaseWorkshop);
  const purchaseBarracks = useGameStore((state) => state.purchaseBarracks);
  const purchaseFrontierForge = useGameStore(
    (state) => state.purchaseFrontierForge,
  );
  const canBuildWorkshop = !workshopBuilt && canAfford(resources, WORKSHOP_COST);
  const canBuildBarracks =
    forestTrophy && !barracksBuilt && canAfford(resources, BARRACKS_COST);
  const canBuildFrontierForge =
    forestTrophy &&
    !frontierForgeBuilt &&
    canAfford(resources, FRONTIER_FORGE_COST);

  return (
    <div className="destination-page destination-page--settlement">
      <header className="destination-header">
        <span className="eyebrow">World</span>
        <h1>Settlement</h1>
        <p>
          Your permanent support engine. Gathering continues while you plan and build.
        </p>
      </header>

      <section
        className={`settlement-preview${workshopBuilt ? " settlement-preview--workshop" : ""}${barracksBuilt ? " settlement-preview--barracks" : ""}${frontierForgeBuilt ? " settlement-preview--forge" : ""}`}
      >
        <div
          aria-label="Settlement overview"
          className="settlement-preview__scene"
          role="img"
        >
          <span aria-hidden="true" className="settlement-hill" />
          <span aria-hidden="true" className="settlement-house settlement-house--one" />
          <span aria-hidden="true" className="settlement-house settlement-house--two" />
          <span aria-hidden="true" className="settlement-path" />
          {workshopBuilt ? (
            <span aria-label="Workshop built" className="settlement-workshop">
              <span aria-hidden="true" className="workshop-wheel" />
            </span>
          ) : (
            <span aria-label="Empty Workshop site" className="workshop-site" />
          )}
          {barracksBuilt ? (
            <span aria-label="Barracks built" className="settlement-barracks">
              <span aria-hidden="true" className="barracks-banner" />
            </span>
          ) : null}
          {frontierForgeBuilt ? (
            <span aria-label="Frontier Forge built" className="settlement-forge">
              <span aria-hidden="true" className="forge-fire" />
            </span>
          ) : null}
        </div>

        <div className="settlement-buildings">
          <div>
            <span className="eyebrow">Building queue</span>
            <h2>{workshopBuilt ? "Foundation established" : "Your first building"}</h2>
          </div>

          <article className={`building-card${workshopBuilt ? " building-card--built" : ""}`}>
            <div className="building-card__heading">
              <span aria-hidden="true" className="building-card__icon">W</span>
              <div>
                <strong>Workshop</strong>
                <small>{workshopBuilt ? "Built" : "Available"}</small>
              </div>
            </div>
            <p>Unlock Training Sword, Wooden Shield and Torch recipes.</p>
            <span className="building-card__cost">{formatCost(WORKSHOP_COST)}</span>
            <button
              className="primary-button"
              disabled={!canBuildWorkshop}
              onClick={purchaseWorkshop}
              type="button"
            >
              {workshopBuilt
                ? "Workshop built"
                : canBuildWorkshop
                  ? "Build Workshop"
                  : formatMissingCost(resources, WORKSHOP_COST)}
            </button>
          </article>

          <article
            className={`building-card${barracksBuilt ? " building-card--built" : forestTrophy ? "" : " building-card--locked"}`}
          >
            <div className="building-card__heading">
              <span aria-hidden="true" className="building-card__icon">B</span>
              <div>
                <strong>Barracks</strong>
                <small>
                  {barracksBuilt
                    ? "Built"
                    : forestTrophy
                      ? "Trophy unlocked"
                      : "Boss gated"}
                </small>
              </div>
            </div>
            <p>Add a fourth combat slot. Combat talents follow in M2.</p>
            <span className="building-card__cost">
              {forestTrophy
                ? formatCost(BARRACKS_COST)
                : "Requires Forest Trophy"}
            </span>
            <button
              className="primary-button"
              disabled={!canBuildBarracks}
              onClick={purchaseBarracks}
              type="button"
            >
              {barracksBuilt
                ? "Barracks built"
                : !forestTrophy
                  ? "Defeat Forest Brute"
                  : canBuildBarracks
                    ? "Build Barracks"
                    : formatMissingCost(resources, BARRACKS_COST)}
            </button>
          </article>

          <article
            className={`building-card${frontierForgeBuilt ? " building-card--built" : forestTrophy ? "" : " building-card--locked"}`}
          >
            <div className="building-card__heading">
              <span aria-hidden="true" className="building-card__icon">F</span>
              <div>
                <strong>Frontier Forge</strong>
                <small>
                  {frontierForgeBuilt
                    ? "Built"
                    : forestTrophy
                      ? "Blueprint unlocked"
                      : "Boss gated"}
                </small>
              </div>
            </div>
            <p>
              Unlock Copper Longsword, Oakguard Shield and the Wolf Den expedition.
            </p>
            <span className="building-card__cost">
              {forestTrophy
                ? formatCost(FRONTIER_FORGE_COST)
                : "Requires Forest Trophy"}
            </span>
            <button
              className="primary-button"
              disabled={!canBuildFrontierForge}
              onClick={purchaseFrontierForge}
              type="button"
            >
              {frontierForgeBuilt
                ? "Frontier Forge built"
                : !forestTrophy
                  ? "Defeat Forest Brute"
                  : canBuildFrontierForge
                    ? "Build Frontier Forge"
                    : formatMissingCost(resources, FRONTIER_FORGE_COST)}
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
