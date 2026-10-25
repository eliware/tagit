export function addCompletedRunRunnerLabels(jobs, runnerLabelsByJobName = {}) {
  return jobs.map((job) => ({ ...job, labels: runnerLabelsByJobName[job.name] ?? [] }));
}
