export function verifyPublishJob(jobs, { applicable, packageName, isPrivate }) {
  const publishJobs = jobs.filter(
    (job) =>
      /^publish$/i.test(job.name) && job.status === "completed" && job.conclusion === "success",
  );
  if (applicable && packageName && !isPrivate && !publishJobs.length)
    throw new Error("Release CI lacks a successful publish job.");
  return publishJobs;
}
