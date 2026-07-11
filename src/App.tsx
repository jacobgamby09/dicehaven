import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { canAfford, getLevelProgress, WORKSHOP_COST } from "./engine/progression";
import { useCombatClock } from "./hooks/useCombatClock";
import { useRollClock } from "./hooks/useRollClock";
import { CombatPage } from "./pages/CombatPage";
import { MiningPage } from "./pages/MiningPage";
import { PreviewPage } from "./pages/PreviewPage";
import { SettlementPage } from "./pages/SettlementPage";
import { WoodcuttingPage } from "./pages/WoodcuttingPage";
import { useGameStore } from "./store/gameStore";
import type { ViewId } from "./ui/navigation";

export function App(): React.JSX.Element {
  const activeSkill = useGameStore((state) => state.activeSkill);
  const [activeView, setActiveView] = useState<ViewId>(activeSkill);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resources = useGameStore((state) => state.resources);
  const workshopBuilt = useGameStore((state) => state.buildings.workshop);
  const barracksBuilt = useGameStore((state) => state.buildings.barracks);
  const frontierForgeBuilt = useGameStore(
    (state) => state.buildings.frontierForge,
  );
  const combatInventory = useGameStore((state) => state.combat.inventory);
  const combatLifetimeXp = useGameStore((state) => state.combat.lifetimeXp);
  const forestTrophy = useGameStore((state) => state.combat.forestTrophy);
  const isInCombat = useGameStore((state) => state.combat.session !== null);
  const lastEvents = useGameStore((state) => state.lastEvents);
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);
  const setActiveSkill = useGameStore((state) => state.setActiveSkill);
  const retreatFromCombat = useGameStore((state) => state.retreatFromCombat);
  const woodcuttingLifetimeXp = useGameStore(
    (state) => state.woodcutting.lifetimeXp,
  );
  const miningLifetimeXp = useGameStore((state) => state.mining.lifetimeXp);
  const clock = useRollClock();
  const combatClock = useCombatClock();
  const woodcuttingLevel = getLevelProgress(woodcuttingLifetimeXp).level;
  const miningLevel = getLevelProgress(miningLifetimeXp).level;
  const combatLevel = getLevelProgress(combatLifetimeXp).level;
  const workshopReady = !workshopBuilt && canAfford(resources, WORKSHOP_COST);
  const ownedCombatDiceCount = Object.values(combatInventory).reduce(
    (total, amount) => total + amount,
    0,
  );

  const makeGatheringActive = (skill: "woodcutting" | "mining") => {
    if (isInCombat) {
      retreatFromCombat();
    }
    setActiveSkill(skill);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  let page: React.JSX.Element;

  switch (activeView) {
    case "settlement":
      page = <SettlementPage />;
      break;
    case "combat":
      page = (
        <CombatPage
          clock={combatClock}
          onNavigate={setActiveView}
          onOpenSettlement={() => setActiveView("settlement")}
        />
      );
      break;
    case "mining":
      page = (
        <MiningPage
          event={lastEvents.mining}
          isActive={!isInCombat && activeSkill === "mining"}
          isPaused={isPaused}
          intervalMs={clock.intervalMs}
          onMakeActive={() => makeGatheringActive("mining")}
          onTogglePause={togglePause}
          phase={clock.phase}
          progress={clock.progress}
        />
      );
      break;
    case "talents":
      page = (
        <PreviewPage
          description="Concrete unlocks and mechanic-changing choices for every skill."
          eyebrow="Progression"
          title="Talents"
        />
      );
      break;
    case "recipes":
      page = (
        <PreviewPage
          description="Cross-skill goals that turn gathered resources into new possibilities."
          eyebrow="Progression"
          title="Recipes"
        />
      );
      break;
    default:
      page = (
        <WoodcuttingPage
          event={lastEvents.woodcutting}
          isActive={!isInCombat && activeSkill === "woodcutting"}
          isPaused={isPaused}
          intervalMs={clock.intervalMs}
          onMakeActive={() => makeGatheringActive("woodcutting")}
          onTogglePause={togglePause}
          phase={clock.phase}
          progress={clock.progress}
        />
      );
  }

  return (
    <AppShell
      activeSkill={activeSkill}
      activeView={activeView}
      barracksBuilt={barracksBuilt}
      combatLevel={combatLevel}
      forestTrophy={forestTrophy}
      frontierForgeBuilt={frontierForgeBuilt}
      isInCombat={isInCombat}
      isMenuOpen={isMenuOpen}
      miningLevel={miningLevel}
      onCloseMenu={() => setIsMenuOpen(false)}
      onNavigate={setActiveView}
      onOpenMenu={() => setIsMenuOpen(true)}
      ownedCombatDiceCount={ownedCombatDiceCount}
      progress={isInCombat ? combatClock.playerProgress : clock.progress}
      resources={resources}
      workshopBuilt={workshopBuilt}
      workshopReady={workshopReady}
      woodcuttingLevel={woodcuttingLevel}
    >
      {page}
    </AppShell>
  );
}
