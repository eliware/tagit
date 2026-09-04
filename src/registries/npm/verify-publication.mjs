import { npmExecutable } from '../../process/commands/npm-executable.mjs';
import { execFileCommand } from '../../process/async/exec-file.mjs';

export async function verifyNpmPublication(execFile, log, { packageName, version, retries = 30, retryMs = 10000, sleep }) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const visible = (await execFileCommand(execFile, npmExecutable(), ['view', `${packageName}@${version}`, 'version'])).trim();
      log.debug?.(`npm visibility attempt ${attempt + 1}/${retries}: expected ${version}, received ${visible}.`);
      if (visible === version) return;
    } catch (error) {
      const detail = String(error).trim().slice(0, 300);
      log.debug?.(`npm visibility attempt ${attempt + 1}/${retries} failed: ${detail}`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  throw new Error(`npm did not expose ${packageName}@${version} after ${retries} attempts.`);
}
