export function reportPublicationJobLinks(log, profile, windowsJobs, publishJobs) {
  publishJobs.forEach((job) => {
    if (job.url) log.info(`${profile}: [${job.url}](${job.url})`);
  });
  windowsJobs.forEach((job) => {
    if (job.url) log.info(`Windows: [${job.url}](${job.url})`);
  });
}
