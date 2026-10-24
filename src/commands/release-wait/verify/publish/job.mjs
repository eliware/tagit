export function selectSuccessfulPublishJobs(jobs) {
  return jobs.filter(
    (job) =>
      /^publish$/i.test(job.name) && job.status === "completed" && job.conclusion === "success",
  );
}
