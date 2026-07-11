import type { ResourceCost } from "../engine/progression";
import { RESOURCE_LABELS } from "../engine/resources";
import type { ResourceId } from "../engine/roll";

export function formatMissingCost(
  resources: Record<ResourceId, number>,
  cost: ResourceCost,
): string {
  const missing = Object.entries(cost).flatMap(([resource, amount]) => {
    const resourceId = resource as ResourceId;
    const missingAmount = Math.max(0, (amount ?? 0) - resources[resourceId]);

    return missingAmount > 0
      ? [`${missingAmount} ${RESOURCE_LABELS[resourceId]}`]
      : [];
  });

  return missing.length > 0 ? `Need ${missing.join(" · ")}` : "Ready";
}

export function formatCost(cost: ResourceCost): string {
  return Object.entries(cost)
    .map(
      ([resource, amount]) =>
        `${amount ?? 0} ${RESOURCE_LABELS[resource as ResourceId]}`,
    )
    .join(" · ");
}
