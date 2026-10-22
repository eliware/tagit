export function verifyReleaseJobs(jobs, runnerLabelsByJobName = {}, workflowRun = {}) {
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const verifiedJobs = jobs.map((job) => {
    const completedSteps =
      Array.isArray(job.steps) &&
      job.steps.length > 0 &&
      job.steps.every((step) => step.status === "completed" && step.conclusion === "success");
    const staleJob = job.status !== "completed" || job.conclusion === null;
    return workflowRun.status === "completed" &&
      workflowRun.conclusion === "success" &&
      staleJob &&
      completedSteps
      ? { ...job, status: "completed", conclusion: "success" }
      : job;
  });
  const labels = (job) =>
    Array.isArray(job.labels) ? job.labels : (runnerLabelsByJobName[job.name] ?? []);
  const windowsJobs = verifiedJobs.filter((job) =>
    labels(job).some((label) => /windows/i.test(label)),
  );
  if (windowsJobs.length && !windowsJobs.every(successful))
    throw new Error("Release CI has a failing Windows job.");
  const failed = verifiedJobs.filter(
    (job) =>
      job.status !== "completed" || !["success", "skipped", "neutral"].includes(job.conclusion),
  );
  if (failed.length)
    throw new Error(
      `Release CI failed: ${failed.map((job) => `${job.name}: ${job.conclusion}`).join("; ")}`,
    );
  if (
    !verifiedJobs.some(
      (job) => successful(job) && labels(job).some((label) => /ubuntu/i.test(label)),
    )
  )
    throw new Error("Release CI lacks a passing Ubuntu job.");
  return { successful, windowsJobs };
}
