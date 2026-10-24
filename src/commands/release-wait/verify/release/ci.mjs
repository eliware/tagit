import { verifyReleaseJobs } from "../../../../github/runs/release/job/policy.mjs";

export function verifyReleaseCi(run, runnerLabelsByJobName = {}) {
  return verifyReleaseJobs(run.jobs, runnerLabelsByJobName, run).windowsJobs;
}
