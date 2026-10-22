import { verifyReleaseCi } from "../verify/release/ci.mjs";
import { verifyRegistries } from "../verify/registries.mjs";
import { verifyReleaseJobs } from "../../../github/runs/release/job-policy.mjs";
import { verifyPublishJob } from "../verify/publish-job.mjs";
import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { reportPublicationJobLinks } from "../report/publication-job-links.mjs";

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
  for (const target of targets) {
    const publication = publicationRuns.find((item) => item.profile === target.profile);
    if (!publication) throw new Error(`Release ${target.profile} workflow did not complete.`);
    if (!Array.isArray(publication.run.jobs))
      throw new Error(`Release ${target.profile} workflow returned malformed job records.`);
    const { windowsJobs } = verifyReleaseJobs(publication.run.jobs, runnerLabelsByJobName);
    const publishJobs = verifyPublishJob(publication.run.jobs, {
      applicable: target.profile === "ghcr" || (applicable && !isPrivate),
      packageName: target.packageName,
      isPrivate: target.isPrivate,
    });
    log.info(`Release ${target.profile} workflow verified for ${repo}@${tag}.`);
    reportPublicationJobLinks(log, target.profile, windowsJobs, publishJobs);
  }
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
