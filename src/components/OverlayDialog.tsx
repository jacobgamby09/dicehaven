import { useEffect, useRef, type ReactNode } from "react";

interface OverlayDialogProps {
  children: ReactNode;
  className?: string;
  eyebrow: string;
  onClose: () => void;
  subtitle: string;
  title: string;
}

export function OverlayDialog({
  children,
  className = "",
  eyebrow,
  onClose,
  subtitle,
  title,
}: OverlayDialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="game-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="overlay-dialog-title"
        aria-modal="true"
        className={`overlay-dialog ${className}`}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="overlay-dialog__header">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 id="overlay-dialog-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            aria-label={`Close ${title}`}
            className="overlay-dialog__close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
