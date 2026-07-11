import { useEffect, useId, useRef, useState } from "react";
import type { CombatDieDefinition } from "../engine/combat";
import { getCombatFaceInfo } from "../engine/combatPresentation";
import { combatFaceMark, combatFaceText } from "../ui/combatDie";
import { CombatDieVisual } from "./CombatDieVisual";

interface FaceInfoOverlayProps {
  definition: CombatDieDefinition;
  initialFaceIndex: number;
  onClose: () => void;
}

export function FaceInfoOverlay({
  definition,
  initialFaceIndex,
  onClose,
}: FaceInfoOverlayProps): React.JSX.Element {
  const [faceIndex, setFaceIndex] = useState(initialFaceIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeHandlerRef = useRef(onClose);
  const titleId = useId();
  const face = definition.faces[faceIndex];
  const info = getCombatFaceInfo(definition, faceIndex);
  closeHandlerRef.current = onClose;

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHandlerRef.current();
        return;
      }
      if (event.key !== "Tab" || dialogRef.current === null) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first === undefined || last === undefined) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const previousFace = () => {
    setFaceIndex((current) =>
      current === 0 ? definition.faces.length - 1 : current - 1,
    );
  };

  const nextFace = () => {
    setFaceIndex((current) => (current + 1) % definition.faces.length);
  };

  return (
    <div className="face-info-layer">
      <button
        aria-label="Close face information"
        className="face-info-backdrop"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`face-info-dialog face-info-dialog--${definition.role.toLowerCase()}`}
        ref={dialogRef}
        role="dialog"
      >
        <header className="face-info-dialog__header">
          <div>
            <span className="eyebrow">{definition.name} · Face {faceIndex + 1}</span>
            <h2 id={titleId}>{info.effectLabel}</h2>
          </div>
          <button
            aria-label="Close face information"
            className="face-info-dialog__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </header>

        <div className="face-info-dialog__hero">
          <CombatDieVisual
            active
            ariaLabel={`Face ${faceIndex + 1}: ${combatFaceText(face)}`}
            definition={definition}
            face={face}
            size="medium"
          />
          <p>{info.description}</p>
        </div>

        <dl className="face-info-rules">
          <div>
            <dt>Chance</dt>
            <dd>{info.chanceLabel}</dd>
          </div>
          <div>
            <dt>Resolves</dt>
            <dd>{info.resolves}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{info.duration}</dd>
          </div>
          <div>
            <dt>Keyword</dt>
            <dd>{info.keyword}</dd>
          </div>
        </dl>

        <p className="face-info-matching">
          {info.matchingFaces} of {definition.faces.length} faces share this exact result.
        </p>

        <div aria-label="Choose die face" className="face-info-picker">
          {definition.faces.map((candidate, index) => (
            <button
              aria-label={`Face ${index + 1}: ${combatFaceText(candidate)}`}
              aria-pressed={index === faceIndex}
              key={`${definition.id}-info-face-${index + 1}`}
              onClick={() => setFaceIndex(index)}
              type="button"
            >
              <small>{index + 1}</small>
              <strong>{combatFaceMark(candidate)}</strong>
            </button>
          ))}
        </div>

        <footer className="face-info-dialog__footer">
          <button onClick={previousFace} type="button">← Previous</button>
          <span>Face {faceIndex + 1} of {definition.faces.length}</span>
          <button onClick={nextFace} type="button">Next →</button>
        </footer>
      </section>
    </div>
  );
}
