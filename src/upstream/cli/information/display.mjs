import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";

const packageJsonUrl = new URL("../../../../package.json", import.meta.url);

export function showUpstreamInformation(option, { readFileSync, log }) {
  if (option === "help") showUpstreamHelp(log);
  else if (option === "version") showUpstreamVersion(readFileSync, packageJsonUrl, log);
  return option !== null;
}
