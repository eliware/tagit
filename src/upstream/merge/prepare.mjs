import { mergeMessage } from "./message/build.mjs";
import { parseUpstreamArguments } from "./arguments/parser.mjs";

export function prepareUpstreamMerge(args, now) {
  const { dryRun, messageArguments } = parseUpstreamArguments(args);
  return { dryRun, message: mergeMessage(messageArguments, now) };
}
