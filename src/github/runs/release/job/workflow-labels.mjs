export function addWorkflowRunnerLabels(jobs, runnerLabelsByJobName = {}) {
  return jobs.map((job) => {
    const labels = Array.isArray(job.labels) ? job.labels : [];
    return {
      ...job,
      labels: labels.length ? labels : (runnerLabelsByJobName[job.name] ?? []),
    };
  });
}
