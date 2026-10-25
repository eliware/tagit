import { readReleaseCiCandidate } from "../../../read/release-ci/candidate.mjs";
import { readReleaseCiDetails } from "../../../read/release-ci/details.mjs";
import { validateReleaseRunDetails } from "../../../validate-release/run/details.mjs";
import { applyReleaseCiResultPolicy } from "./result-policy.mjs";

export async function runReleaseCiPollAttempt({
  execFile,
  repo,
  headSha,
  tag,
  linksOnly,
  log,
  workflowPath,
  workflowLabel,
}) {
  const candidate = await readReleaseCiCandidate(execFile, repo, headSha, tag, workflowPath);
  if (!candidate) return null;
  const details = await readReleaseCiDetails(execFile, repo, candidate.databaseId);
  validateReleaseRunDetails(details, candidate, headSha, tag, workflowPath);
  return applyReleaseCiResultPolicy(candidate, details, { linksOnly, log, workflowLabel });
}
