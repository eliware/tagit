import { readJobLinks } from "./read-job-links.mjs";

export function reportCiJobLinks(execFileSync, log, repo, run) {
  readJobLinks(execFileSync, repo, run).forEach((job) => {
    if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
  });
}
