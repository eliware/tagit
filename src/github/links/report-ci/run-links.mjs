import { readJobLinks } from "./read-job-links.mjs";

export function reportCiRunLinks(execFileSync, log, repo, runs) {
  runs.slice(0, 5).forEach((run) => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    readJobLinks(execFileSync, repo, run).forEach((job) => {
      if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
    });
  });
}
