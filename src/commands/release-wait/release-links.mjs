export function releaseLinks(run, windowsJobs, publishJobs) {
  const ubuntuJob = run.jobs.find(
    (job) =>
      job.labels?.some((label) => /ubuntu/i.test(label)) &&
      job.status === "completed" &&
      job.conclusion === "success",
  );
  const windowsJob = windowsJobs.find(
    (job) => job.status === "completed" && job.conclusion === "success",
  );
  return [
    ["Workflow", run.url],
    ["Ubuntu", ubuntuJob?.url],
    ["Windows", windowsJob?.url],
    ...publishJobs.map((job, index) => [
      `Publish${publishJobs.length > 1 ? ` ${index + 1}` : ""}`,
      job.url,
    ]),
  ].filter(([, url]) => url);
}
