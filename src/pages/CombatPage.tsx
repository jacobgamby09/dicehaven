import { useState } from "react";
import { CombatArsenal } from "../components/CombatArsenal";
import { CombatBattleView } from "../components/CombatBattleView";
import { CombatHub } from "../components/CombatHub";
import { CombatResultPanel } from "../components/CombatResultPanel";
import type { CombatZoneId } from "../engine/combat";
import { getLevelProgress } from "../engine/progression";
import type { CombatClock } from "../hooks/useCombatClock";
import { useGameStore } from "../store/gameStore";
import type { ViewId } from "../ui/navigation";

interface CombatPageProps {
  clock: CombatClock;
  onNavigate: (view: ViewId) => void;
  onOpenSettlement: () => void;
}

export function CombatPage({
  clock,
  onNavigate,
  onOpenSettlement,
}: CombatPageProps): React.JSX.Element {
  const workshopBuilt = useGameStore((state) => state.buildings.workshop);
  const combat = useGameStore((state) => state.combat);
  const startCombat = useGameStore((state) => state.startCombat);
  const retreatFromCombat = useGameStore((state) => state.retreatFromCombat);
  const clearCombatResult = useGameStore((state) => state.clearCombatResult);
  const [selectedZoneId, setSelectedZoneId] = useState<CombatZoneId>(
    combat.lastResult?.zoneId ?? "forestEdge",
  );
  const [showArsenal, setShowArsenal] = useState(false);
  const levelProgress = getLevelProgress(combat.lifetimeXp);

  const beginCombat = (zoneId: CombatZoneId) => {
    setShowArsenal(false);
    startCombat(zoneId);
  };

  return (
    <div className="destination-page destination-page--combat combat-v2-page">
      <header className="destination-header combat-page-header">
        <div>
          <span className="eyebrow">World</span>
          <h1>Combat</h1>
          <p>Prepare your dice, then watch two independent combat clocks decide the fight.</p>
        </div>
        {workshopBuilt ? (
          <div className="combat-level-badge">
            <span>Combat Level</span>
            <strong>{levelProgress.level}</strong>
            <small>{combat.lifetimeXp} lifetime XP</small>
          </div>
        ) : null}
      </header>

      {!workshopBuilt ? (
        <section className="combat-gate">
          <div aria-hidden="true" className="combat-gate__art">
            <span className="gate-trees" />
            <span className="gate-path" />
            <span className="gate-swords">×</span>
          </div>
          <div className="combat-gate__copy">
            <span className="lab-pill">Preparation required</span>
            <h2>Build the Workshop</h2>
            <p>Unlock Crafting and prepare your crew's first Combat Dice loadout.</p>
            <button className="primary-button" onClick={onOpenSettlement} type="button">
              Open Settlement
            </button>
          </div>
        </section>
      ) : showArsenal ? (
        <CombatArsenal
          onBack={() => setShowArsenal(false)}
          onOpenCrafting={() => onNavigate("crafting")}
          readOnly={combat.session !== null}
        />
      ) : combat.session !== null ? (
        <CombatBattleView
          clock={clock}
          onInspectLoadout={() => setShowArsenal(true)}
          onRetreat={retreatFromCombat}
        />
      ) : combat.lastResult ? (
        <CombatResultPanel
          onChooseZone={() => {
            clearCombatResult();
            setSelectedZoneId(combat.lastResult?.zoneId ?? "forestEdge");
          }}
          onEditLoadout={() => setShowArsenal(true)}
          onNavigate={onNavigate}
          onRepeat={() => beginCombat(combat.lastResult?.zoneId ?? selectedZoneId)}
          result={combat.lastResult}
        />
      ) : (
        <CombatHub
          onOpenArsenal={() => setShowArsenal(true)}
          onSelectZone={setSelectedZoneId}
          onStart={() => beginCombat(selectedZoneId)}
          selectedZoneId={selectedZoneId}
        />
      )}
    </div>
  );
}
