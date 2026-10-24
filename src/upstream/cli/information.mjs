import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";

export function showUpstreamInformation(option, { readFileSync, log }, packageJsonUrl) {
  if (option === "help") showUpstreamHelp(log);
  else if (option === "version") showUpstreamVersion(readFileSync, packageJsonUrl, log);
  return option !== null;
}
