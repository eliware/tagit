import { hasBreakingChange } from "./has-breaking-change.mjs";
import { isSubstantialChange } from "./is-substantial-change.mjs";

export function classifyChangeLevel(files, diff) {
  if (hasBreakingChange(diff))
    return { level: "major", reason: "possible breaking public API or command change" };
  if (isSubstantialChange(files, diff))
    return { level: "minor", reason: "substantial implementation or public feature changes" };
  return { level: "patch", reason: "small or non-public changes" };
}
