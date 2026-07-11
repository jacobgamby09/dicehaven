import type { PropsWithChildren } from "react";
import type { ResourceId } from "../engine/roll";
import type { GatheringSkillId } from "../store/gameStore";
import type { ViewId } from "../ui/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps extends PropsWithChildren {
  activeView: ViewId;
  activeSkill: GatheringSkillId;
  barracksBuilt: boolean;
  combatLevel: number;
  forestTrophy: boolean;
  frontierForgeBuilt: boolean;
  isMenuOpen: boolean;
  isInCombat: boolean;
  ownedCombatDiceCount: number;
  progress: number;
  resources: Record<ResourceId, number>;
  miningLevel: number;
  woodcuttingLevel: number;
  workshopBuilt: boolean;
  workshopReady: boolean;
  onCloseMenu: () => void;
  onNavigate: (view: ViewId) => void;
  onOpenMenu: () => void;
}

export function AppShell({
  activeView,
  activeSkill,
  barracksBuilt,
  combatLevel,
  children,
  forestTrophy,
  frontierForgeBuilt,
  isMenuOpen,
  isInCombat,
  ownedCombatDiceCount,
  progress,
  resources,
  miningLevel,
  woodcuttingLevel,
  workshopBuilt,
  workshopReady,
  onCloseMenu,
  onNavigate,
  onOpenMenu,
}: AppShellProps): React.JSX.Element {
  return (
    <div className="app-shell">
      <Sidebar
        activeSkill={activeSkill}
        activeView={activeView}
        barracksBuilt={barracksBuilt}
        combatLevel={combatLevel}
        forestTrophy={forestTrophy}
        frontierForgeBuilt={frontierForgeBuilt}
        isOpen={isMenuOpen}
        isInCombat={isInCombat}
        miningLevel={miningLevel}
        onClose={onCloseMenu}
        onNavigate={onNavigate}
        ownedCombatDiceCount={ownedCombatDiceCount}
        progress={progress}
        woodcuttingLevel={woodcuttingLevel}
        workshopBuilt={workshopBuilt}
        workshopReady={workshopReady}
      />
      <div className="app-frame">
        <TopBar isMenuOpen={isMenuOpen} onOpenMenu={onOpenMenu} resources={resources} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
