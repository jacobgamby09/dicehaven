import {
  COMBAT_DICE,
  COMBAT_ENEMIES,
  COMBAT_ROLL_INTERVAL_MS,
  type CombatZoneId,
} from "../engine/combat";
import { useGameStore } from "../store/gameStore";
import { CombatDieVisual } from "./CombatDieVisual";

interface CombatHubProps {
  onOpenArsenal: () => void;
  onSelectZone: (zoneId: CombatZoneId) => void;
  onStart: () => void;
  selectedZoneId: CombatZoneId;
}

export function CombatHub({
  onOpenArsenal,
  onSelectZone,
  onStart,
  selectedZoneId,
}: CombatHubProps): React.JSX.Element {
  const combat = useGameStore((state) => state.combat);
  const frontierForgeBuilt = useGameStore((state) => state.buildings.frontierForge);
  const equippedDice = combat.loadout.flatMap((dieId) =>
    dieId === null ? [] : [COMBAT_DICE[dieId]],
  );
  const hasDamageDie = equippedDice.some((die) => die.role === "Damage");
  const bossIsReady = combat.zoneProgress >= 20 && !combat.forestTrophy;
  const selectedLocked = selectedZoneId === "wolfDen" && !frontierForgeBuilt;
  const selectedEnemy =
    selectedZoneId === "wolfDen"
      ? COMBAT_ENEMIES.direWolf
      : bossIsReady
        ? COMBAT_ENEMIES.forestBrute
        : null;

  return (
    <section aria-labelledby="combat-hub-title" className="combat-v2-hub">
      <header className="combat-v2-section-heading">
        <div>
          <span className="eyebrow">Prepare</span>
          <h2 id="combat-hub-title">Choose an encounter</h2>
          <p>Prepare your dice, then let both combat clocks run automatically.</p>
        </div>
        <button className="secondary-button" onClick={onOpenArsenal} type="button">
          Combat Arsenal
        </button>
      </header>

      <div className="combat-v2-zone-grid">
        <button
          aria-pressed={selectedZoneId === "forestEdge"}
          className="combat-v2-zone-card"
          onClick={() => onSelectZone("forestEdge")}
          type="button"
        >
          <span className="lab-pill">Zone 1</span>
          <span className="combat-v2-zone-card__title">
            <strong>Forest Edge</strong>
            <small>{combat.forestTrophy ? "Cleared" : `${combat.zoneProgress} / 20`}</small>
          </span>
          <span>Wolves, boars and scouts. Reach 20 victories to reveal the Forest Brute.</span>
          <progress max={20} value={Math.min(20, combat.zoneProgress)} />
        </button>

        <button
          aria-pressed={selectedZoneId === "wolfDen"}
          className="combat-v2-zone-card"
          onClick={() => onSelectZone("wolfDen")}
          type="button"
        >
          <span className="lab-pill">Zone 2</span>
          <span className="combat-v2-zone-card__title">
            <strong>Wolf Den</strong>
            <small>{frontierForgeBuilt ? `${combat.wolfDenProgress} / 10` : "Locked"}</small>
          </span>
          <span>Dire Wolves attack harder and can drop the Level 6 Dire Wolf Claw.</span>
          <progress max={10} value={combat.wolfDenProgress} />
        </button>
      </div>

      <div className="combat-v2-prepare-grid">
        <article className="combat-v2-encounter-preview">
          <span className="eyebrow">Selected encounter</span>
          <h3>
            {selectedZoneId === "wolfDen"
              ? "Dire Wolf"
              : bossIsReady
                ? "Forest Brute"
                : "Forest patrol"}
          </h3>
          {selectedEnemy ? (
            <dl>
              <div><dt>HP</dt><dd>{selectedEnemy.maxHp}</dd></div>
              <div><dt>Attack</dt><dd>{selectedEnemy.attack} Damage</dd></div>
              <div><dt>Speed</dt><dd>{(selectedEnemy.attackIntervalMs / 1_000).toFixed(1)}s</dd></div>
              <div><dt>Reward</dt><dd>{selectedEnemy.xpReward} XP</dd></div>
            </dl>
          ) : (
            <>
              <p>One random Forest Wolf, Wild Boar or Bandit Scout will appear.</p>
              <div className="combat-v2-threat-list">
                <span>Forest Wolf</span><span>Wild Boar</span><span>Bandit Scout</span>
              </div>
            </>
          )}
          {selectedLocked ? (
            <p className="combat-v2-warning">Build the Frontier Forge to enter this zone.</p>
          ) : null}
        </article>

        <article className="combat-v2-loadout-summary">
          <div className="combat-v2-loadout-summary__heading">
            <div>
              <span className="eyebrow">Your loadout</span>
              <h3>{equippedDice.length} / {combat.loadout.length} dice equipped</h3>
            </div>
            <span>{(COMBAT_ROLL_INTERVAL_MS / 1_000).toFixed(1)}s Roll Speed</span>
          </div>
          <div className="combat-v2-loadout-dice">
            {combat.loadout.map((dieId, index) =>
              dieId === null ? (
                <span className="combat-v2-empty-die" key={`empty-${index}`}>Slot {index + 1}</span>
              ) : (
                <div key={`${dieId}-${index}`}>
                  <CombatDieVisual decorative definition={COMBAT_DICE[dieId]} size="small" />
                  <small>{COMBAT_DICE[dieId].name}</small>
                </div>
              ),
            )}
          </div>
          <button className="combat-v2-text-button" onClick={onOpenArsenal} type="button">
            Edit loadout
          </button>
        </article>
      </div>

      <div className="combat-v2-start">
        <div>
          <strong>Combat runs automatically</strong>
          <span>Player rolls first if both speed bars complete together.</span>
        </div>
        <button
          className="primary-button"
          disabled={selectedLocked || !hasDamageDie}
          onClick={onStart}
          type="button"
        >
          {selectedLocked
            ? "Build Frontier Forge"
            : hasDamageDie
              ? bossIsReady && selectedZoneId === "forestEdge"
                ? "Challenge Forest Brute"
                : "Start combat"
              : "Equip a Damage die"}
        </button>
      </div>
    </section>
  );
}
