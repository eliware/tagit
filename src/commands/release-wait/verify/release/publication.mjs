import { verifyReleasePublicationJobs } from "./publication/jobs.mjs";
import { reportReleasePublicationLinks } from "./publication/links.mjs";
import { verifyPublicationRegistries } from "../../release/publication/registries.mjs";
import { buildReleasePublicationPlan } from "./publication/plan.mjs";

export async function verifyReleasePublication({
  fs,
  execFile,
  log,
  repo,
  tag,
  headSha,
  version,
  release,
  publication,
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
  } = buildReleasePublicationPlan(publication);
  const verifiedPublications = verifyReleasePublicationJobs({
    targets,
    publicationRuns,
    applicable: publication.applicable,
    isPrivate: publication.isPrivate,
    repo,
    tag,
    log,
  });
  reportReleasePublicationLinks(log, verifiedPublications);
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
    applicable: publication.applicable,
    packageName: publication.packageName,
    isPrivate: publication.isPrivate,
    ghcrApplicable,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
