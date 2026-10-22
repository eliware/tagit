import { verifyReleaseCi } from "../../verify/release/ci.mjs";
import { verifyRegistries } from "../../verify/registries.mjs";
import { verifyPublicationJobs } from "./jobs.mjs";
import { publishesGhcr } from "../../../../registries/ghcr/discover-publication.mjs";

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
  const { applicable, packageName, isPrivate } =
    verifiedTarget ?? verifyReleaseCi(fs, log, repo, tag, run, runnerLabelsByJobName);
  const ghcrApplicable = publishesGhcr(fs);
  const targets = [
    ...(applicable ? [{ profile: "npm", packageName, isPrivate }] : []),
    ...(ghcrApplicable ? [{ profile: "ghcr", packageName: "image", isPrivate: false }] : []),
  ];
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
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
  return { repo, tag, headSha, ci: true, ...registries };
}
