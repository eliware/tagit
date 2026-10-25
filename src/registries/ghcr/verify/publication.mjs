import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { parseGhcrRepository } from "../parse/repository.mjs";
import { pollGhcrVisibility } from "../poll-visibility.mjs";
import { finalizeGhcrPublication } from "./finalize-publication.mjs";

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
  return pollGhcrVisibility(execFile, log, {
    owner,
    imageName,
    version,
    retries,
    retryMs,
    sleep,
    onVisible: (image) => finalizeGhcrPublication(log, repository, version, expectedDigest, image),
  });
}
