import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { parseGhcrRepository } from "../parse/repository.mjs";
import { pollGhcrVisibility } from "../poll-visibility.mjs";
import { imageDigest, requireExpectedDigest } from "./digest.mjs";
import { reportGhcrPublication } from "./report-publication.mjs";

export async function verifyGhcrPublication(
  execFile,
  log,
  {
    repository,
    version,
    expectedDigest = null,
    retries = 30,
    retryMs = 10000,
    sleep = sleepDefault,
  },
) {
  // codescope ignore: A digest is optional when the caller has no expected digest. The GHCR tag check applies.
  const [owner, imageName] = parseGhcrRepository(repository);
  const image = await pollGhcrVisibility(execFile, log, {
    owner,
    imageName,
    version,
    retries,
    retryMs,
    sleep,
  });
  const digest = imageDigest(image);
  requireExpectedDigest(digest, expectedDigest, repository, version);
  reportGhcrPublication(log, repository, version, digest);
  return { imageDigest: digest };
}
