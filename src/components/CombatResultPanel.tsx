import { COMBAT_DICE, COMBAT_DIE_IDS } from "../engine/combat";
import type { CombatResult } from "../store/gameStore";
import { PROGRESSION_UNLOCK_LABELS } from "../ui/unlockLabels";

interface CombatResultPanelProps {
  onChooseZone: () => void;
  onEditLoadout: () => void;
  onNavigate: (view: "woodcutting" | "mining" | "settlement") => void;
  onRepeat: () => void;
  result: CombatResult;
}

function resultAdvice(result: CombatResult): string | null {
  if (result.defeatReason === "noBlock") return "Equip a Block die to absorb incoming Damage.";
  if (result.defeatReason === "lowDamage") return "Add another Damage die to end the fight sooner.";
  if (result.defeatReason === "overwhelmed") return "Try a stronger die or trade a Damage slot for more Block.";
  return null;
}

export function CombatResultPanel({
  onChooseZone,
  onEditLoadout,
  onNavigate,
  onRepeat,
  result,
}: CombatResultPanelProps): React.JSX.Element {
  const diceDrops = COMBAT_DIE_IDS.flatMap((dieId) => {
    const amount = result.diceGained[dieId] ?? 0;
    return amount > 0 ? [{ amount, die: COMBAT_DICE[dieId] }] : [];
  });
  const advice = resultAdvice(result);
  const won = result.type === "victory";

  return (
    <section aria-live="polite" className={`combat-v2-result combat-v2-result--${result.type}`}>
      <header>
        <span className="lab-pill">
          {won ? "Victory" : result.type === "defeat" ? "Defeat" : "Retreated"}
        </span>
        <h2>{won ? `${result.enemyName} defeated` : result.type === "defeat" ? "Your crew was defeated" : "Expedition ended"}</h2>
        <p>{won ? "The encounter is complete. Your rewards have been added." : "No earned progress was lost."}</p>
      </header>

      <div className="combat-v2-result__rewards">
        <div><span>Combat XP</span><strong>+{result.xpGained}</strong></div>
        <div><span>Monster Parts</span><strong>+{result.monsterPartsGained}</strong></div>
        <div><span>Loot rolls</span><strong>{result.lootRolls.length}</strong></div>
        <div><span>Dice found</span><strong>{diceDrops.reduce((total, drop) => total + drop.amount, 0)}</strong></div>
      </div>

      {result.lootRolls.length > 1 ? (
        <p className="combat-v2-scouted-reward">✦ Scouted granted one additional loot roll.</p>
      ) : null}

      {diceDrops.length > 0 ? (
        <div className="combat-v2-result__drops">
          {diceDrops.map(({ amount, die }) => (
            <span key={die.id}>{amount}× {die.name}</span>
          ))}
        </div>
      ) : null}

      {result.trophyGained ? <strong className="combat-v2-trophy">Forest Trophy claimed</strong> : null}
      {advice ? <p className="combat-v2-advice">{advice}</p> : null}

      {result.unlocksGained.length > 0 ? (
        <div className="combat-v2-unlocks">
          <span className="eyebrow">New blueprints</span>
          <ul>
            {result.unlocksGained.map((unlockId) => (
              <li key={unlockId}>{PROGRESSION_UNLOCK_LABELS[unlockId]}</li>
            ))}
          </ul>
          <div>
            <button onClick={() => onNavigate("woodcutting")} type="button">Woodcutting</button>
            <button onClick={() => onNavigate("mining")} type="button">Mining</button>
            <button onClick={() => onNavigate("settlement")} type="button">Settlement</button>
          </div>
        </div>
      ) : null}

      <footer>
        <button className="primary-button" onClick={onRepeat} type="button">Fight again</button>
        <button className="secondary-button" onClick={onEditLoadout} type="button">Edit loadout</button>
        <button className="combat-v2-text-button" onClick={onChooseZone} type="button">Choose another zone</button>
      </footer>
    </section>
  );
}
