import type { GatheringSkillId } from "../store/gameStore";
import type { ViewId } from "../ui/navigation";

interface SidebarProps {
  activeSkill: GatheringSkillId;
  activeView: ViewId;
  barracksBuilt: boolean;
  combatLevel: number;
  forestTrophy: boolean;
  frontierForgeBuilt: boolean;
  isOpen: boolean;
  isInCombat: boolean;
  miningLevel: number;
  progress: number;
  woodcuttingLevel: number;
  workshopBuilt: boolean;
  workshopReady: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  ownedCombatDiceCount: number;
}

interface NavItem {
  id: ViewId;
  icon: string;
  label: string;
  meta?: string;
}

const SKILL_ITEMS: readonly NavItem[] = [
  { id: "woodcutting", icon: "W", label: "Woodcutting" },
  { id: "mining", icon: "M", label: "Mining" },
];

const WORLD_ITEMS: readonly NavItem[] = [
  { id: "combat", icon: "C", label: "Combat" },
  { id: "settlement", icon: "S", label: "Settlement" },
];

const PROGRESSION_ITEMS: readonly NavItem[] = [
  { id: "recipes", icon: "R", label: "Recipes", meta: "3 new" },
];

export function Sidebar({
  activeSkill,
  activeView,
  barracksBuilt,
  combatLevel,
  forestTrophy,
  frontierForgeBuilt,
  isOpen,
  isInCombat,
  miningLevel,
  progress,
  woodcuttingLevel,
  workshopBuilt,
  workshopReady,
  onClose,
  onNavigate,
  ownedCombatDiceCount,
}: SidebarProps): React.JSX.Element {
  const activeSkillName = isInCombat
    ? "Combat"
    : activeSkill === "woodcutting"
      ? "Woodcutting"
      : "Mining";
  const activeSkillLevel = isInCombat
    ? combatLevel
    : activeSkill === "woodcutting"
      ? woodcuttingLevel
      : miningLevel;

  const navigate = (view: ViewId) => {
    onNavigate(view);
    onClose();
  };

  const renderItems = (items: readonly NavItem[]) =>
    items.map((item) => {
      const skillLevel =
        item.id === "woodcutting"
          ? woodcuttingLevel
          : item.id === "mining"
            ? miningLevel
            : null;
      const isActiveSkill = !isInCombat && item.id === activeSkill;
      let meta = item.meta;

      if (skillLevel !== null) {
        meta = `Lv. ${skillLevel}${isActiveSkill ? " · Active" : ""}${forestTrophy ? " · T2" : ""}`;
      } else if (item.id === "settlement") {
        meta = frontierForgeBuilt
          ? "Frontier Forge built"
          : barracksBuilt
          ? "Barracks built"
          : forestTrophy
            ? "Forge blueprint ready"
            : workshopBuilt
          ? "Workshop built"
          : workshopReady
            ? "Workshop ready"
            : "Build your base";
      } else if (item.id === "combat") {
        meta = isInCombat
          ? "Battle active"
          : frontierForgeBuilt
            ? "Wolf Den unlocked"
          : forestTrophy
            ? "Forest Edge cleared"
          : workshopBuilt
          ? `${ownedCombatDiceCount} dice owned`
          : "Workshop required";
      }

      return (
        <button
          aria-current={activeView === item.id ? "page" : undefined}
          className="nav-item"
          key={item.id}
          onClick={() => navigate(item.id)}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`nav-item__icon nav-item__icon--${item.id}`}
          >
            {item.icon}
          </span>
          <span className="nav-item__copy">
            <strong>{item.label}</strong>
            {meta ? <small>{meta}</small> : null}
          </span>
        </button>
      );
    });

  return (
    <>
      <button
        aria-label="Close navigation"
        className={`sidebar-scrim${isOpen ? " sidebar-scrim--visible" : ""}`}
        onClick={onClose}
        type="button"
      />
      <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`} id="main-sidebar">
        <div className="brand">
          <div aria-hidden="true" className="brand__mark">
            <span>6</span>
          </div>
          <div>
            <strong>Dicehaven</strong>
            <span>Roll. Build. Venture.</span>
          </div>
        </div>

        <div className="active-card">
          <div className="active-card__heading">
            <span className="active-dot" />
            <span>Active</span>
            <small>Lv. {activeSkillLevel}</small>
          </div>
          <strong>{activeSkillName}</strong>
          <progress aria-label="Active skill roll progress" max={1} value={progress} />
        </div>

        <nav aria-label="Main navigation" className="sidebar__nav">
          <section>
            <h2>Skills</h2>
            {renderItems(SKILL_ITEMS)}
          </section>
          <section>
            <h2>World</h2>
            {renderItems(WORLD_ITEMS)}
          </section>
          <section>
            <h2>Progression</h2>
            {renderItems(PROGRESSION_ITEMS)}
          </section>
        </nav>

        <footer className="sidebar__footer">
          <span>Prototype 0.2</span>
          <span>Saved locally</span>
        </footer>
      </aside>
    </>
  );
}
