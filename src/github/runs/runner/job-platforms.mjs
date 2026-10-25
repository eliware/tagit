export function classifyJobsByPlatform(jobs) {
  const labels = (job) => (Array.isArray(job.labels) ? job.labels : []);
  return {
    ubuntuJobs: jobs.filter((job) => labels(job).some((label) => /ubuntu/i.test(label))),
    windowsJobs: jobs.filter((job) => labels(job).some((label) => /windows/i.test(label))),
  };
}
