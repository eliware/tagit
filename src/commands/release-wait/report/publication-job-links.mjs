export function reportPublicationJobLinks(log, profile, publishJobs) {
  publishJobs.forEach((job) => {
    if (job.url) log.info(`${profile}: [${job.url}](${job.url})`);
  });
}
