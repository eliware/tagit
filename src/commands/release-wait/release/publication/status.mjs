import { verifyReleaseCi } from "../../verify/release/ci.mjs";
import { verifyRegistries } from "../../verify/registries.mjs";
import { verifyPublicationJobs } from "./jobs.mjs";
import { selectReleasePublicationTargets } from "./targets.mjs";

export async function verifyReleasePublication({
  fs,
  runnerLabelsByJobName,
  execFile,
  log,
  repo,
  tag,
  headSha,
  version,
  run,
  publicationRuns = [],
  verifiedTarget,
  release,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
  const npmTarget =
    verifiedTarget ?? verifyReleaseCi(fs, log, repo, tag, run, runnerLabelsByJobName);
  const { applicable, packageName, isPrivate } = npmTarget;
  const { targets, ghcrApplicable } = selectReleasePublicationTargets(fs, npmTarget);
  verifyPublicationJobs({
    targets,
    publicationRuns,
    applicable,
    isPrivate,
    repo,
    tag,
    log,
  });
  if (!applicable && !ghcrApplicable)
    return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  const registries = await verifyRegistries({
    fs,
    execFile,
    log,
    repo,
    version,
    release,
    applicable,
    packageName,
    isPrivate,
    ghcrApplicable,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
  return { repo, tag, headSha, ci: true, ...registries };
}
