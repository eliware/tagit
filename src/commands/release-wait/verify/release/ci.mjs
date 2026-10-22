import { verifyReleaseJobs } from "../../../../github/runs/release/job-policy.mjs";
import { readPublicationTarget } from "../../read/publication-target.mjs";
import { reportReleaseCiLinks } from "./link-report.mjs";

export function verifyReleaseCi(fs, log, repo, tag, run, runnerLabelsByJobName = {}) {
  if (!Array.isArray(run.jobs))
    throw new Error("Release CI returned malformed job records: jobs must be an array.");
  const jobs = run.jobs;
  const { windowsJobs } = verifyReleaseJobs(jobs, runnerLabelsByJobName, run);
  const target = readPublicationTarget(fs);
  reportReleaseCiLinks(log, repo, tag, run, windowsJobs);
  return target;
}
