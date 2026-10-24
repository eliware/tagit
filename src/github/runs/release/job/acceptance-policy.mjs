import { windowsCiPolicy } from "../../../../policy/windows-ci-policy.mjs";

export function enforceReleaseJobPolicy(jobs, { ubuntuJobs, windowsJobs }) {
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const windowsPolicy = windowsCiPolicy(jobs, successful, windowsJobs);
  if (!windowsPolicy.passed) throw new Error("Release CI has a failing Windows job.");
  const failed = jobs.filter(
    (job) =>
      job.status !== "completed" || !["success", "skipped", "neutral"].includes(job.conclusion),
  );
  if (failed.length)
    throw new Error(
      `Release CI failed: ${failed.map((job) => `${job.name}: ${job.conclusion}`).join("; ")}`,
    );
  if (!ubuntuJobs.some(successful)) throw new Error("Release CI lacks a passing Ubuntu job.");
  return { successful, windowsJobs };
}
