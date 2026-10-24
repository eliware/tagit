import { showUpstreamInformation } from "./information.mjs";
import { selectInformationOption } from "./information-option.mjs";

const packageJsonUrl = new URL("../../../package.json", import.meta.url);

export function runUpstreamCli(args, { execFileSync, readFileSync, now, log, runUpstream }) {
  const option = selectInformationOption(args);
  if (showUpstreamInformation(option, { readFileSync, log }, packageJsonUrl)) return;
  return runUpstream(args, execFileSync, now, log);
}
