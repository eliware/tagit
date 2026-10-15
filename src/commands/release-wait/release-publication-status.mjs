import { verifyReleaseCi } from "./verify-release-ci.mjs";
import { verifyRegistries } from "./verify-registries.mjs";
import { verifyReleaseJobs } from "../../github/runs/release-job-policy.mjs";
import { verifyPublishJob } from "./verify-publish-job.mjs";
import { publishesGhcr } from "../../registries/ghcr/discover-publication.mjs";

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
  publishRun,
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
  if (!publishRun && (applicable || ghcrApplicable))
    throw new Error("Release publish workflow did not complete.");
  if (publishRun) {
    if (!Array.isArray(publishRun.jobs))
      throw new Error("Release publish workflow returned malformed job records.");
    const { windowsJobs } = verifyReleaseJobs(publishRun.jobs, runnerLabelsByJobName);
    const publishJobs = verifyPublishJob(publishRun.jobs, {
      applicable: applicable || ghcrApplicable,
      packageName: applicable ? packageName : "image",
      isPrivate: applicable ? isPrivate : false,
    });
    log.info(`Release publish workflow verified for ${repo}@${tag}.`);
    publishJobs.forEach((job) => {
      if (job.url) log.info(`Publish: [${job.url}](${job.url})`);
    });
    windowsJobs.forEach((job) => {
      if (job.url) log.info(`Windows: [${job.url}](${job.url})`);
    });
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
