export function verifyReleaseJobs(jobs) {
  const successful = job => job.status === 'completed' && job.conclusion === 'success';
  const windowsJobs = jobs.filter(job => /windows/i.test(job.name));
  if (windowsJobs.length && !windowsJobs.every(successful)) throw new Error('Release CI has a failing Windows job.');
  const failed = jobs.filter(job => job.status !== 'completed' || !['success', 'skipped', 'neutral'].includes(job.conclusion));
  if (failed.length) throw new Error(`Release CI failed: ${failed.map(job => `${job.name}: ${job.conclusion}`).join('; ')}`);
  if (!jobs.some(job => successful(job) && /ubuntu/i.test(job.name))) throw new Error('Release CI lacks a successful Ubuntu job.');
  return { successful, windowsJobs };
}
