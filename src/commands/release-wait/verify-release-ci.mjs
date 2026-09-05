import { verifyReleaseJobs } from '../../github/runs/release-job-policy.mjs';
import { releaseLinks } from './release-links.mjs';
import { verifyPublishJob } from './verify-publish-job.mjs';
import { readPublicationTarget } from './read-publication-target.mjs';

export function verifyReleaseCi(fs, log, repo, tag, run) {
  if (!Array.isArray(run.jobs)) throw new Error('Release CI returned malformed job records: jobs must be an array.');
  const jobs = run.jobs;
  const { successful, windowsJobs } = verifyReleaseJobs(jobs);
  const { packageName, isPrivate } = readPublicationTarget(fs);
  const publishJobs = verifyPublishJob(jobs, successful, packageName, isPrivate);
  const links = releaseLinks(run, windowsJobs, publishJobs);
  log.info(`Release CI verified for ${repo}@${tag}:`); links.forEach(([label, url]) => log.info(`${label}: [${url}](${url})`));
  return { packageName, isPrivate, publishJobs };
}
