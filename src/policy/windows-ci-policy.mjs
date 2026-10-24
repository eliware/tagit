export function windowsCiPolicy(jobs, successful, classifiedWindowsJobs) {
  const isWindows = (job) => job.labels?.some((label) => /windows/i.test(label));
  const windowsJobs = classifiedWindowsJobs ?? jobs.filter(isWindows);
  return {
    present: windowsJobs.length > 0,
    passed: windowsJobs.every((job) => successful(job)),
    successful: windowsJobs.some(successful),
  };
}
