import validateMergeMessage from "./validator.mjs";
import createDefaultMergeMessage from "./default.mjs";

export default function mergeMessage(args = [], now) {
  if (!args.length) return createDefaultMergeMessage(now);
  const message = args.join(" ");
  validateMergeMessage(message);
  return message;
}
