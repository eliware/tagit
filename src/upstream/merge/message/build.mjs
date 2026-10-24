import { validateMergeMessage } from "./policy.mjs";
import { createDefaultMergeMessage } from "./default.mjs";

export function mergeMessage(args = [], now) {
  if (!args.length) return createDefaultMergeMessage(now);
  const message = args.join(" ");
  validateMergeMessage(message);
  return message;
}
