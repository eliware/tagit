import readReleaseCiCandidate from "../../../read/release-ci/candidate.mjs";
import readReleaseCiDetails from "../../../read/release-ci/details.mjs";
import validateReleaseRunDetails from "../../../validate-release/run/details.mjs";
import applyReleaseCiResultPolicy from "./apply-result-policy.mjs";

export default async function runReleaseCiPollAttempt({
  execFile,
  repo,
  headSha,
  tag,
  log,
  workflowPath,
  workflowLabel,
  runnerLabelsByJobName,
}) {
  const candidate = await readReleaseCiCandidate(execFile, repo, headSha, tag, workflowPath);
  if (!candidate) return null;
  const details = await readReleaseCiDetails(execFile, repo, candidate.databaseId);
  validateReleaseRunDetails(details, candidate, headSha, tag);
  return applyReleaseCiResultPolicy(candidate, details, {
    log,
    workflowLabel,
    workflowPath,
    runnerLabelsByJobName,
  });
}
