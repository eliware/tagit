import { hasAcceptedWorkflowJobStatus } from "../../job-status-policy.mjs";

export function enforceRequiredPlatformPolicy(jobs, ubuntuJobs, successful) {
  const failed = jobs.filter((job) => !hasAcceptedWorkflowJobStatus(job));
  if (failed.length)
    throw new Error(
      `Release CI failed: ${failed.map((job) => `${job.name}: ${job.conclusion}`).join("; ")}`,
    );
  if (!ubuntuJobs.some(successful)) throw new Error("Release CI lacks a passing Ubuntu job.");
}
