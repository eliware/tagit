import { mergeMessage } from "./message/build.mjs";
import { parseUpstreamArguments } from "./parse-arguments.mjs";

export function readUpstreamMergeInput(args, now) {
  const { dryRun, messageArguments } = parseUpstreamArguments(args);
  return { dryRun, message: mergeMessage(messageArguments, now) };
}
