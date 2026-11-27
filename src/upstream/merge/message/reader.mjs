import mergeMessage from "./build.mjs";
import createDefaultMergeMessage from "./default.mjs";

export default function readMergeMessage(args, now) {
  if (!args?.length) return createDefaultMergeMessage(now);
  return mergeMessage(args);
}
