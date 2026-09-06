import { verifyReleaseCi } from './verify-release-ci.mjs';
import { verifyRegistries } from './verify-registries.mjs';

export async function verifyReleasePublication({
  fs,
  execFile,
  log,
  repo,
  tag,
  headSha,
  version,
  run,
  release,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
  const { packageName, isPrivate } = verifyReleaseCi(fs, log, repo, tag, run);
  const registries = await verifyRegistries({
    fs,
    execFile,
    log,
    repo,
    version,
    release,
    packageName,
    isPrivate,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
  return { repo, tag, headSha, ci: true, ...registries };
}
