import { execFileCommand } from "../../process/async/exec-file.mjs";
import { buildNpmViewCommand } from "./build-view-command.mjs";
import { npmErrorSummary } from "./error-summary.mjs";
import { npmViewHasVersion } from "./view-response.mjs";

export async function verifyNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  const { executable, args, options } = buildNpmViewCommand(packageName, version);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const status = `npm view ${packageName}@${version} (${attempt + 1}/${retries})`;
    try {
      const output = await execFileCommand(execFile, executable, args, options);
      const exists = npmViewHasVersion(output, version);
      log.info?.(`${status}: ${exists ? "available" : "not found"}.`);
      if (exists) return;
    } catch (error) {
      log.info?.(`${status}: failed (${npmErrorSummary(error)}).`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} checks.`;
  log.info?.(message);
  throw new Error(message);
}
