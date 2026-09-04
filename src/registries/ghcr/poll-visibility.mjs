import { execFileCommand } from '../../process/async/exec-file.mjs';
import { hasVersionTag } from './verify-version-tag.mjs';

export async function pollGhcrVisibility(execFile, log, { owner, imageName, version, retries, retryMs, sleep }) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      let versions = JSON.parse(await execFileCommand(execFile, 'gh', ['api', '--paginate', '--slurp', `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`]));
      if (!Array.isArray(versions)) throw new Error('GHCR returned an invalid versions response.');
      if (versions.every(Array.isArray)) versions = versions.flat();
      const image = versions.find(item => hasVersionTag(item, `v${version}`));
      if (image) return image;
    } catch (error) {
      log.debug?.(`GHCR visibility attempt ${attempt + 1}/${retries} failed: ${String(error).slice(0, 300)}`);
    }
    if (attempt + 1 < retries) await sleep(retryMs);
  }
  throw new Error(`GHCR does not expose ${owner}/${imageName}:${version}.`);
}
