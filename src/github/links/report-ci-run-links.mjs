export function reportCiRunLinks(execFileSync, log, repo, runs) {
  runs.slice(0, 5).forEach((run) => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    const details = JSON.parse(
      execFileSync('gh', ['run', 'view', String(run.databaseId), '--repo', repo, '--json', 'jobs'], {
        encoding: 'utf8',
      }),
    );
    if (!Array.isArray(details.jobs))
      throw new Error(`GitHub CI run ${run.databaseId} returned malformed job records.`);
    const malformedJobs = details.jobs.filter(
      (job) =>
        !job ||
        typeof job !== 'object' ||
        typeof job.name !== 'string' ||
        (job.url !== undefined && typeof job.url !== 'string'),
    );
    if (malformedJobs.length)
      throw new Error(`GitHub CI run ${run.databaseId} returned malformed job records: ${malformedJobs.length}.`);
    details.jobs.forEach((job) => {
      if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`);
    });
  });
}
