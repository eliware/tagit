import { execFileCommand } from "../../process/async/exec-file-command.mjs";
import { buildNpmViewCommand } from "./build-view-command.mjs";
import { reportNpmViewAttempt } from "./error/view/attempt.mjs";

export async function pollNpmPublication(
  execFile,
  log,
  { packageName, version, retries, retryMs, sleep },
) {
  const { executable, args, options } = buildNpmViewCommand(packageName, version);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const status = `npm view ${packageName}@${version} (${attempt + 1}/${retries})`;
    try {
      const output = await execFileCommand(execFile, executable, args, options);
      if (reportNpmViewAttempt(log, status, { output, version })) return;
    } catch (error) {
      reportNpmViewAttempt(log, status, { error });
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} checks.`;
  log.info?.(message);
  throw new Error(message);
}
