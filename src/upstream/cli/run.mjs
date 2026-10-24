import { showUpstreamInformation } from "./information.mjs";

const packageJsonUrl = new URL("../../../package.json", import.meta.url);

export function runUpstreamCli(args, { execFileSync, readFileSync, now, log, runUpstream }) {
  if (showUpstreamInformation(args, { readFileSync, log }, packageJsonUrl)) return;
  return runUpstream(args, execFileSync, now, log);
}
