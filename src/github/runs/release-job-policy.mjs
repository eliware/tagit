export function verifyReleaseJobs(jobs, runnerLabelsByJobName = {}) {
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const labels = (job) =>
    Array.isArray(job.labels) ? job.labels : (runnerLabelsByJobName[job.name] ?? []);
  const windowsJobs = jobs.filter((job) => labels(job).some((label) => /windows/i.test(label)));
  if (windowsJobs.length && !windowsJobs.every(successful))
    throw new Error("Release CI has a failing Windows job.");
  const failed = jobs.filter(
    (job) =>
      job.status !== "completed" || !["success", "skipped", "neutral"].includes(job.conclusion),
  );
  if (failed.length)
    throw new Error(
      `Release CI failed: ${failed.map((job) => `${job.name}: ${job.conclusion}`).join("; ")}`,
    );
  if (!jobs.some((job) => successful(job) && labels(job).some((label) => /ubuntu/i.test(label))))
    throw new Error("Release CI lacks a successful Ubuntu job.");
  return { successful, windowsJobs };
}
