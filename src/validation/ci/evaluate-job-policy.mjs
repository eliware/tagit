import { windowsCiPolicy } from "../../policy/windows-ci-policy.mjs";

export function evaluateJobPolicy(jobs, successful) {
  const passed = (job) => successful(job);
  const failed = jobs.some(
    (job) =>
      job.status !== "completed" || !["success", "skipped", "neutral"].includes(job.conclusion),
  );
  const ubuntu = jobs.some(
    (job) => passed(job) && job.labels?.some((label) => /ubuntu/i.test(label)),
  );
  const windows = windowsCiPolicy(jobs, passed);
  return { failed, ubuntu, windows };
}
