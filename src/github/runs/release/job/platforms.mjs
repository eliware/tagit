export function classifyReleaseJobPlatforms(jobs, runnerLabelsByJobName = {}) {
  const labels = (job) =>
    Array.isArray(job.labels) ? job.labels : (runnerLabelsByJobName[job.name] ?? []);
  return {
    ubuntuJobs: jobs.filter((job) => labels(job).some((label) => /ubuntu/i.test(label))),
    windowsJobs: jobs.filter((job) => labels(job).some((label) => /windows/i.test(label))),
  };
}
