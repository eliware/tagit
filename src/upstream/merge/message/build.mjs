import { validateMergeMessage } from "./policy.mjs";

export function mergeMessage(args = [], now) {
  const timestamp = () => (now ?? new Date()).toISOString().replace("T", " ").slice(0, 19);
  const message = args.length ? args.join(" ") : timestamp();
  validateMergeMessage(message);
  return message;
}
