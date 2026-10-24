import { windowsCiPolicy } from "../../../../policy/windows-ci-policy.mjs";
import { enforceRequiredPlatformPolicy } from "./required-platform-policy.mjs";

export function enforceReleaseJobPolicy(jobs, { ubuntuJobs, windowsJobs }) {
  const successful = (job) => job.status === "completed" && job.conclusion === "success";
  const windowsPolicy = windowsCiPolicy(jobs, successful, windowsJobs);
  if (!windowsPolicy.passed) throw new Error("Release CI has a failing Windows job.");
  enforceRequiredPlatformPolicy(jobs, ubuntuJobs, successful);
  return { successful, windowsJobs };
}
