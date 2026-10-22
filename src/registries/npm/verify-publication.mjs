import { validateNpmViewCommandInputs } from "./validate/view-command.mjs";
import { pollNpmPublication } from "./poll-publication.mjs";

export async function verifyNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  validateNpmViewCommandInputs(packageName, version);
  return pollNpmPublication(execFile, log, { packageName, version, retries, retryMs, sleep });
}
