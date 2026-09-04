export function releaseLinks(run, windowsJobs, publishJobs) {
  const ubuntuJob = run.jobs.find(job => /ubuntu/i.test(job.name));
  const windowsJob = windowsJobs[0];
  return [
    ['Workflow', run.url],
    ['Ubuntu', ubuntuJob?.url],
    ['Windows', windowsJob?.url],
    ...publishJobs.map((job, index) => [`Publish${publishJobs.length > 1 ? ` ${index + 1}` : ''}`, job.url]),
  ].filter(([, url]) => url);
}
