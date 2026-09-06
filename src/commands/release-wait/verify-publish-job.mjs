export function verifyPublishJob(jobs, { applicable, packageName, isPrivate }) {
  const publishJobs = jobs.filter((job) => /^publish$/i.test(job.name));
  if (
    applicable &&
    packageName &&
    !isPrivate &&
    !publishJobs.some((job) => job.status === 'completed' && job.conclusion === 'success')
  )
    throw new Error('Release CI lacks a successful publish job.');
  return publishJobs;
}
