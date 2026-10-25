import { dispatchUpstreamInformation } from "./information/dispatch.mjs";

export function runUpstreamCli(args, { execFileSync, readFileSync, now, log, runUpstream }) {
  if (dispatchUpstreamInformation(args, { readFileSync, log })) return;
  return runUpstream(args, execFileSync, now, log);
}
