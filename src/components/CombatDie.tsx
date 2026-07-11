import type {
  CombatDieDefinition,
  CombatDieResult,
} from "../engine/combat";
import type { RollPhase } from "../hooks/useRollClock";
import { CombatDieVisual } from "./CombatDieVisual";

interface CombatDieProps {
  definition: CombatDieDefinition;
  onInspectFace: () => void;
  phase: RollPhase;
  result?: CombatDieResult;
}

function faceLabel(result?: CombatDieResult): string {
  if (result === undefined) return "Waiting…";
  if (result.face.type === "damage") {
    return result.face.amount > 0 ? `${result.face.amount} Damage` : "Miss";
  }
  if (result.face.type === "block") {
    return result.face.amount > 0 ? `${result.face.amount} Block` : "No Block";
  }
  return result.face.amount > 0 ? "Light" : "Dark";
}

export function CombatDie({
  definition,
  onInspectFace,
  phase,
  result,
}: CombatDieProps): React.JSX.Element {
  const isRolling = phase === "rolling";

  return (
    <article className="combat-die-card">
      {!isRolling && result ? (
        <button
          aria-label={`Inspect ${definition.name} face ${result.faceIndex + 1}: ${faceLabel(result)}`}
          className="combat-die__inspect"
          onClick={onInspectFace}
          type="button"
        >
          <CombatDieVisual
            ariaLabel={`${definition.name}: ${faceLabel(result)}`}
            definition={definition}
            face={result.face}
            size="roll"
          />
        </button>
      ) : (
        <CombatDieVisual
          ariaLabel={`${definition.name} combat result`}
          definition={definition}
          face={result?.face}
          isRolling={isRolling}
          size="roll"
        />
      )}
      <div className="combat-die-card__label">
        <strong>{definition.name}</strong>
        <span>{isRolling ? "Rolling…" : faceLabel(result)}</span>
      </div>
    </article>
  );
}
