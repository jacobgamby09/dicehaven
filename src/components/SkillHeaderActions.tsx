interface SkillHeaderActionsProps {
  equippedDice: number;
  isActive: boolean;
  onMakeActive: () => void;
  onOpenDiceRack: () => void;
  onOpenSkillTree: () => void;
  skillXp: number;
  slots: number;
}

export function SkillHeaderActions({
  equippedDice,
  isActive,
  onMakeActive,
  onOpenDiceRack,
  onOpenSkillTree,
  skillXp,
  slots,
}: SkillHeaderActionsProps): React.JSX.Element {
  return (
    <div className="skill-hero__actions">
      {isActive ? (
        <span className="status-pill"><span /> Active skill</span>
      ) : (
        <button className="make-active-button" onClick={onMakeActive} type="button">
          Make Active
        </button>
      )}
      <button className="hero-tool-button" onClick={onOpenDiceRack} type="button">
        <span aria-hidden="true">▦</span>
        Dice Rack
        <strong>{equippedDice}/{slots}</strong>
      </button>
      <button className="hero-tool-button hero-tool-button--tree" onClick={onOpenSkillTree} type="button">
        <span aria-hidden="true">⌁</span>
        Skill Tree
        <strong>{skillXp} XP</strong>
      </button>
    </div>
  );
}
