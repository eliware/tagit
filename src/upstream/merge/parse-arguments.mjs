import { parseUpstreamDryRunOption } from "./dry/run-option.mjs";

export function parseUpstreamArguments(args = []) {
  if (!Array.isArray(args)) throw new TypeError("Upstream arguments must be an array.");
  return parseUpstreamDryRunOption(args);
}
