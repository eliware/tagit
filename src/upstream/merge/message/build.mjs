import { validateMergeMessage } from "./policy.mjs";

export function mergeMessage(args = [], now = new Date()) {
  const message = args.length ? args.join(" ") : now.toISOString().replace("T", " ").slice(0, 19);
  validateMergeMessage(message);
  return message;
}
