export function reportReleaseLinks(log, repo, tag, run, workflowLabel = "CI") {
  log.info(`Release ${workflowLabel} discovered for ${repo}@${tag}.`);
  if (run.url) log.info(`${workflowLabel}: [${run.url}](${run.url})`);
  (run.jobs ?? []).forEach((job) => {
    if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
  });
}
