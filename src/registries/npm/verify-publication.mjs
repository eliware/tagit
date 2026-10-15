import { execFileCommand } from "../../process/async/exec-file.mjs";
import { buildNpmViewCommand } from "./build-view-command.mjs";

function readNpmView(output, version) {
  const value = JSON.parse(output);
  return Array.isArray(value) ? value.length === 1 && value[0] === version : value === version;
}

function npmErrorSummary(error) {
  const detail = String(error.stderr ?? error.stdout ?? error.message ?? "");
  if (/\b404\b|E404|Not Found/i.test(detail)) return "404 not found";
  if (error.code && /^[A-Z0-9_-]+$/i.test(String(error.code))) return String(error.code);
  return "request failed";
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
      log.info?.(`${status}: failed (${npmErrorSummary(error)}).`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  const message = `npm did not expose ${packageName}@${version} after ${retries} attempts.`;
  log.info?.(message);
  throw new Error(message);
}
