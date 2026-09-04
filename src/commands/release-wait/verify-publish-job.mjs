export function verifyPublishJob(jobs, successful, packageName, isPrivate) {
  const publishJobs = jobs.filter(job => /publish/i.test(job.name));
  if (packageName && !isPrivate && !publishJobs.some(successful)) throw new Error('Release CI lacks a successful publish job.');
  return publishJobs;
}
