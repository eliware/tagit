import { execFileCommand } from "../../process/async/exec-file.mjs";
import { buildNpmViewCommand } from "./build-view-command.mjs";

function readNpmView(output, version) {
  const value = JSON.parse(output);
  return Array.isArray(value) ? value.includes(version) : value === version;
}

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
      const visible = readNpmView(output, version);
      log.info?.(`${status}: ${visible ? "visible" : "not visible"}.`);
      if (visible) return;
    } catch (error) {
      const detail = String(error.stderr ?? error.stdout ?? error.message ?? "unknown error")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 300);
      log.info?.(`${status}: failed (${detail}).`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} attempts.`;
  log.info?.(message);
  throw new Error(message);
}
