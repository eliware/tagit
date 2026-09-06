export function reportReleaseLinks(log, repo, tag, run) {
  log.info(`Release CI discovered for ${repo}@${tag}. Run tagit release-wait to monitor it.`);
  log.info(`Workflow: [${run.url}](${run.url})`);
  (run.jobs ?? []).forEach((job) => {
    if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
  });
}
