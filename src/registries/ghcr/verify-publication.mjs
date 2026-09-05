import { sleep as sleepDefault } from '../../process/timing/sleep.mjs';
import { parseGhcrRepository } from './parse-repository.mjs';
import { pollGhcrVisibility } from './poll-visibility.mjs';
import { imageDigest, requireExpectedDigest } from './verify-image-digest.mjs';

export async function verifyGhcrPublication(execFile, log, { repository, version, expectedDigest = null, retries = 30, retryMs = 10000, sleep = sleepDefault }) {
  // codescope ignore: digest is optional when the caller has no expected digest; tag visibility remains the applicable GHCR contract.
  const [owner, imageName] = parseGhcrRepository(repository);
  const image = await pollGhcrVisibility(execFile, log, { owner, imageName, version, retries, retryMs, sleep });
  const digest = imageDigest(image); requireExpectedDigest(digest, expectedDigest, repository, version);
  log.info(`GHCR verified: ${repository}:${version}.`); if (digest) log.info(`GHCR digest: ${digest}`);
  return { imageDigest: digest };
}
