export function addWorkflowRunnerLabels(jobs, runnerLabelsByJobName = {}) {
  return jobs.map((job) => ({
    ...job,
    labels: Array.isArray(job.labels) ? job.labels : (runnerLabelsByJobName[job.name] ?? []),
  }));
}
