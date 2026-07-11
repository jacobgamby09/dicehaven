interface PreviewPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PreviewPage({
  eyebrow,
  title,
  description,
}: PreviewPageProps): React.JSX.Element {
  return (
    <div className="destination-page destination-page--preview">
      <header className="destination-header">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <div className="preview-card">
        <span className="lab-pill">Coming after Roll Lab</span>
        <h2>The foundation is ready</h2>
        <p>This destination will inherit the shared navigation and its own visual theme.</p>
      </div>
    </div>
  );
}

