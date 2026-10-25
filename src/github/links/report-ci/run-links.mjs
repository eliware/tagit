import { reportCiJobLinks } from "./job-links.mjs";

export function reportCiRunLinks(execFileSync, log, repo, runs) {
  runs.slice(0, 5).forEach((run) => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    reportCiJobLinks(execFileSync, log, repo, run);
  });
}
