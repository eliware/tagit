import { verifyReleaseJobs } from "../../../../github/runs/release/job/policy.mjs";

export function verifyReleaseCi(run, runnerLabelsByJobName = {}) {
  if (!Array.isArray(run.jobs))
    throw new Error("Release CI returned malformed job records: jobs must be an array.");
  const jobs = run.jobs;
  return verifyReleaseJobs(jobs, runnerLabelsByJobName, run).windowsJobs;
}
