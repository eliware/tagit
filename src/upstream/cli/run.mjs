import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";
import { selectInformationOption } from "./information.mjs";

const packageJsonUrl = new URL("../../../package.json", import.meta.url);

export function runUpstreamCli(args, { execFileSync, readFileSync, now, log, runUpstream }) {
  const informationOption = selectInformationOption(args);
  if (informationOption === "help") {
    showUpstreamHelp(log);
    return;
  }
  if (informationOption === "version") {
    showUpstreamVersion(readFileSync, packageJsonUrl, log);
    return;
  }
  return runUpstream(args, execFileSync, now, log);
}
