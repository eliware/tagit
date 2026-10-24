import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";

export function selectInformationOption(args) {
  if (args.includes("--help") || args.includes("-h")) return "help";
  if (args.includes("--version") || args.includes("-v")) return "version";
  return null;
}

export function showUpstreamInformation(args, { readFileSync, log }, packageJsonUrl) {
  const option = selectInformationOption(args);
  if (option === "help") showUpstreamHelp(log);
  else if (option === "version") showUpstreamVersion(readFileSync, packageJsonUrl, log);
  return option !== null;
}
