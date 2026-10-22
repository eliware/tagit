import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";

const packageJsonUrl = new URL("../../../package.json", import.meta.url);

export function runUpstreamCli(args, { execFileSync, readFileSync, now, log, runUpstream }) {
  if (args.includes("--help") || args.includes("-h")) {
    showUpstreamHelp(log);
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    showUpstreamVersion(readFileSync, packageJsonUrl, log);
    return;
  }
  return runUpstream(args, execFileSync, now, log);
}
