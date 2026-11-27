import mergeReleaseRun from "../../../merge-release-run.mjs";
import formatReleasePollFailure from "./failure-message.mjs";

export default function applyReleaseCiResultPolicy(candidate, details, { log, workflowLabel }) {
  const failure = formatReleasePollFailure(details, workflowLabel);
  if (failure) {
    const error = new Error(failure);
    error.code = "ERR_RELEASE_CI_FAILED";
    throw error;
  }
  if (details.status === "completed") return mergeReleaseRun(candidate, details);
  log.info(`Release ${workflowLabel ?? "CI"} is ${details.status}. Waiting.`);
  return { pending: true };
}
