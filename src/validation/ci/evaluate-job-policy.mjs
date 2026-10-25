import { windowsCiPolicy } from "../../policy/windows-ci-policy.mjs";
import { classifyJobsByPlatform } from "../../github/runs/runner/job-platforms.mjs";
import { hasAcceptedWorkflowJobStatus } from "../../github/runs/job-status-policy.mjs";

export function evaluateJobPolicy(jobs, successful) {
  const passed = (job) => successful(job);
  const failed = jobs.some((job) => !hasAcceptedWorkflowJobStatus(job));
  const { ubuntuJobs } = classifyJobsByPlatform(jobs);
  const ubuntu = ubuntuJobs.some(passed);
  const windows = windowsCiPolicy(jobs, passed);
  return { failed, ubuntu, windows };
}
