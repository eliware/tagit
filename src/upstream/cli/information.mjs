import { showUpstreamHelp } from "./help.mjs";
import { showUpstreamVersion } from "./version.mjs";
import { selectInformationOption } from "./information-option.mjs";

export function showUpstreamInformation(args, { readFileSync, log }, packageJsonUrl) {
  const option = selectInformationOption(args);
  if (option === "help") showUpstreamHelp(log);
  else if (option === "version") showUpstreamVersion(readFileSync, packageJsonUrl, log);
  return option !== null;
}
