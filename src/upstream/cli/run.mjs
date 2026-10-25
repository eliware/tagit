import { dispatchUpstreamInformation } from "./information/dispatch.mjs";
import { handleCliError } from "../../cli/application/handle-cli-error.mjs";

export function runUpstreamCli(
  args,
  { execFileSync, readFileSync, now, log, runUpstream, exit = process.exit },
) {
  try {
    if (dispatchUpstreamInformation(args, { readFileSync, log })) return;
    return runUpstream(args, execFileSync, now, log);
  } catch (error) {
    handleCliError(error, {
      log,
      exit,
      format: (value) => value?.message ?? String(value),
    });
  }
}
