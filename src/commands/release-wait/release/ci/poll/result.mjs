import { mergeReleaseRun } from "../../../merge-release-run.mjs";
import { verifyReleaseCi } from "../../../verify/release/ci.mjs";
import { formatReleasePollFailure } from "./failure-message.mjs";

export function applyReleaseCiResultPolicy(
  candidate,
  details,
  { linksOnly, log, workflowLabel, workflowPath, runnerLabelsByJobName },
) {
  const failure = formatReleasePollFailure(details, workflowLabel);
  if (failure) {
    const error = new Error(failure);
    error.code = "ERR_RELEASE_CI_FAILED";
    throw error;
  }
  if (linksOnly) {
    if (workflowPath === ".github/workflows/ci.yaml" && details.status === "completed")
      verifyReleaseCi(details, runnerLabelsByJobName);
    return {
      ...candidate,
      url: details.url,
      jobs: details.jobs,
      linksOnly: true,
    };
  }
  if (details.status === "completed") return mergeReleaseRun(candidate, details);
  log.info(`Release ${workflowLabel ?? "CI"} is ${details.status}. Waiting.`);
  return { pending: true };
}
