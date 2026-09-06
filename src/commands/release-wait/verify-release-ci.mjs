import { verifyReleaseJobs } from '../../github/runs/release-job-policy.mjs';
import { releaseLinks } from './release-links.mjs';
import { verifyPublishJob } from './verify-publish-job.mjs';
import { readPublicationTarget } from './read-publication-target.mjs';

export function verifyReleaseCi(fs, log, repo, tag, run) {
  if (!Array.isArray(run.jobs)) throw new Error('Release CI returned malformed job records: jobs must be an array.');
  const jobs = run.jobs;
  const { windowsJobs } = verifyReleaseJobs(jobs);
  const target = readPublicationTarget(fs);
  const publishJobs = verifyPublishJob(jobs, target);
  const links = releaseLinks(run, windowsJobs, publishJobs);
  log.info(`Release CI verified for ${repo}@${tag}:`);
  links.forEach(([label, url]) => log.info(`${label}: [${url}](${url})`));
  return { ...target, publishJobs };
}
