import { publishesGhcr } from '../../registries/ghcr/discover-publication.mjs';
import { verifyNpmPublication } from '../../registries/npm/verify-publication.mjs';
import { verifyGhcrPublication } from '../../registries/ghcr/verify-publication.mjs';
import { verifyReleaseJobs } from '../../github/runs/release-job-policy.mjs';
import { releaseLinks } from './release-links.mjs';
import { verifyPublishJob } from './verify-publish-job.mjs';
import { readPublicationTarget } from './read-publication-target.mjs';

export async function verifyReleasePublication({ fs, execFile, log, repo, tag, headSha, version, run, release, maxPolls, npmRetries, pollMs, npmRetryMs, sleep }) {
  const jobs = Array.isArray(run.jobs) ? run.jobs : [];
  const { successful, windowsJobs } = verifyReleaseJobs(jobs);
  const { packageName, isPrivate } = readPublicationTarget(fs);
  const publishJobs = verifyPublishJob(jobs, successful, packageName, isPrivate);
  const links = releaseLinks(run, windowsJobs, publishJobs);
  log.info(`Release CI verified for ${repo}@${tag}:`); links.forEach(([label, url]) => log.info(`${label}: [${url}](${url})`));
  if (packageName && !isPrivate) { await verifyNpmPublication(execFile, log, { packageName, version, retries: npmRetries, retryMs: npmRetryMs, sleep }); log.info(`npm verified: ${packageName}@${version}.`); } else log.info('npm verification: not applicable.');
  const hasGhcrPublication = publishesGhcr(fs);
  if (hasGhcrPublication) {
    const { imageDigest } = await verifyGhcrPublication(execFile, log, { repository: repo, version, expectedDigest: release.imageDigest ?? null, retries: maxPolls, retryMs: pollMs, sleep });
    return { repo, tag, headSha, ci: true, npm: Boolean(packageName && !isPrivate), ghcr: true, imageDigest };
  }
  log.info('GHCR verification: not applicable.');
  return { repo, tag, headSha, ci: true, npm: Boolean(packageName && !isPrivate), ghcr: false };
}
