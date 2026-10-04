export function windowsCiPolicy(jobs, successful) {
  const isWindows = (job) => job.labels?.some((label) => /windows/i.test(label));
  const windowsJobs = jobs.filter(isWindows);
  return {
    present: windowsJobs.length > 0,
    passed: windowsJobs.every((job) => successful(job)),
    successful: jobs.some((job) => successful(job) && isWindows(job)),
  };
}
