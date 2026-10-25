import { validateMergeMessage } from "./validator.mjs";

export function createDefaultMergeMessage(now) {
  const timestamp = (now ?? new Date()).toISOString().replace("T", " ").slice(0, 19);
  validateMergeMessage(timestamp);
  return timestamp;
}
