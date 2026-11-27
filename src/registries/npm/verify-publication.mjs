import validateNpmViewCommandInputs from "./validate/view-command.mjs";
import buildNpmViewArguments from "./build-view-command.mjs";
import buildNpmCommand from "./command-builder.mjs";
import pollNpmPublication from "./poll.mjs";

export default async function verifyNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  validateNpmViewCommandInputs(packageName, version);
  const command = buildNpmCommand(buildNpmViewArguments(packageName, version));
  return pollNpmPublication(execFile, log, {
    command,
    packageName,
    version,
    retries,
    retryMs,
    sleep,
  });
}
