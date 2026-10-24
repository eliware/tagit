import { verifyReleaseJobs } from "../../../../github/runs/release/job/policy.mjs";
import { validateJobRecords } from "../../../../validation/ci/validate/job-records.mjs";

export function verifyReleaseCi(run, runnerLabelsByJobName = {}) {
  const jobs = validateJobRecords(run.jobs, run.databaseId ?? run.id ?? "release CI");
  return verifyReleaseJobs(jobs, runnerLabelsByJobName, run).windowsJobs;
}
