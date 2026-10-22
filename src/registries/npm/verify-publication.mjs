import { execFileCommand } from "../../process/async/exec-file-command.mjs";
import { buildNpmViewCommand } from "./build-view-command.mjs";
import { reportNpmViewFailure, reportNpmViewResult } from "./error/report-view-attempt.mjs";
import { npmViewHasVersion } from "./view-response.mjs";
import { validateNpmViewCommandInputs } from "./validate/view-command.mjs";

export async function verifyNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  validateNpmViewCommandInputs(packageName, version);
  const { executable, args, options } = buildNpmViewCommand(packageName, version);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const status = `npm view ${packageName}@${version} (${attempt + 1}/${retries})`;
    try {
      const output = await execFileCommand(execFile, executable, args, options);
      const exists = npmViewHasVersion(output, version);
      reportNpmViewResult(log, status, exists);
      if (exists) return;
    } catch (error) {
      reportNpmViewFailure(log, status, error);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} checks.`;
  log.info?.(message);
  throw new Error(message);
}
