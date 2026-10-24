export function enforceRequiredPlatformPolicy(jobs, ubuntuJobs, successful) {
  const failed = jobs.filter(
    (job) =>
      job.status !== "completed" || !["success", "skipped", "neutral"].includes(job.conclusion),
  );
  if (failed.length)
    throw new Error(
      `Release CI failed: ${failed.map((job) => `${job.name}: ${job.conclusion}`).join("; ")}`,
    );
  if (!ubuntuJobs.some(successful)) throw new Error("Release CI lacks a passing Ubuntu job.");
}
