export function windowsCiPolicy(jobs, successful) {
  const windowsJobs = jobs.filter(job => /windows/i.test(job.name));
  return {
    present: windowsJobs.length > 0,
    passed: windowsJobs.every(job => successful(job)),
    successful: jobs.some(job => successful(job) && /windows/i.test(job.name)),
  };
}
