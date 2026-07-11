import { motion } from "motion/react";
import { RESOURCE_LABELS } from "../engine/resources";
import type { ResourceId } from "../engine/roll";
import { ResourceIcon } from "./ResourceIcon";

interface ResourceBurstProps {
  amount: number;
  resource: ResourceId;
}

export function ResourceBurst({
  amount,
  resource,
}: ResourceBurstProps): React.JSX.Element | null {
  if (amount <= 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.08, 1, 0.96], y: [20, 0, -12, -34] }}
      className="resource-burst"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 1.15, times: [0, 0.2, 0.72, 1] }}
    >
      <ResourceIcon resource={resource} size={22} />
      <strong>+{amount} {RESOURCE_LABELS[resource]}</strong>
    </motion.div>
  );
}
