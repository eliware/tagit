import { verifyPublicationJobs } from "../../release/publication/jobs.mjs";
import { verifyPublicationRegistries } from "../../release/publication/registries.mjs";
import { buildReleasePublicationPlan } from "./publication/targets.mjs";

export async function verifyReleasePublication({
  fs,
  execFile,
  log,
  repo,
  tag,
  headSha,
  version,
  release,
  npmTarget,
  publicationRuns,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
}) {
  const {
    targets,
    ghcrApplicable,
    applicable: publicationApplies,
  } = buildReleasePublicationPlan(fs, npmTarget);
  verifyPublicationJobs({
    targets,
    publicationRuns,
    applicable: npmTarget.applicable,
    isPrivate: npmTarget.isPrivate,
    repo,
    tag,
    log,
  });
  if (!publicationApplies) return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  return verifyPublicationRegistries({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    applicable: npmTarget.applicable,
    packageName: npmTarget.packageName,
    isPrivate: npmTarget.isPrivate,
    ghcrApplicable,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
