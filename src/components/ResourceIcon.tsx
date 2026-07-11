import type { ResourceId } from "../engine/roll";

interface ResourceIconProps {
  resource: ResourceId;
  size?: number;
}

export function ResourceIcon({
  resource,
  size = 18,
}: ResourceIconProps): React.JSX.Element {
  if (resource === "wood") {
    return (
      <svg
        aria-hidden="true"
        className="resource-icon"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="M7 3h10l-1.5 5H18l-2 6h2l-3 7H9l-3-7h2L6 8h2.5L7 3Z" />
        <path className="resource-icon-detail" d="M12 5v14M9 10l3 2 3-2" />
      </svg>
    );
  }

  if (resource === "oak") {
    return (
      <svg
        aria-hidden="true"
        className="resource-icon"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="M5 18h14l-2-5h2l-3-5h1l-5-6-5 6h1l-3 5h2l-2 5Z" />
        <path className="resource-icon-detail" d="M12 7v14M8 12l4 3 4-3M8 21h8" />
      </svg>
    );
  }

  if (resource === "stone") {
    return (
      <svg
        aria-hidden="true"
        className="resource-icon"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="m4 17 3-9 6-4 6 6 1 8-5 3H8l-4-4Z" />
        <path className="resource-icon-detail" d="m7 9 5 4 7-3M12 13l-2 7" />
      </svg>
    );
  }

  if (resource === "copper") {
    return (
      <svg
        aria-hidden="true"
        className="resource-icon"
        height={size}
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="m12 2 7 6-2 11-5 3-5-3L5 8l7-6Z" />
        <path className="resource-icon-detail" d="m5 8 7 4 7-4M12 12v10" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="resource-icon"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M8 4c2-2 6-2 8 0l1 3 3 3-2 8-6 3-6-3-2-8 3-3 1-3Z" />
      <path className="resource-icon-detail" d="m7 7 5 3 5-3M8 15l4-5 4 5" />
    </svg>
  );
}
