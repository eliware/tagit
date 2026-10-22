import { formatReleaseCiFailure } from "../../../format-release-ci-failure.mjs";
import { mergeReleaseRun } from "../../../merge-release-run.mjs";

export function applyReleaseCiResultPolicy(candidate, details, { linksOnly, log, workflowLabel }) {
  const failure = formatReleaseCiFailure(details);
  if (failure && !linksOnly) {
    const error = new Error(failure.replaceAll("Release CI", `Release ${workflowLabel ?? "CI"}`));
    error.code = "ERR_RELEASE_CI_FAILED";
    throw error;
  }
  if (linksOnly || details.status === "completed") return mergeReleaseRun(candidate, details);
  log.info(`Release ${workflowLabel ?? "CI"} is ${details.status}. Waiting.`);
  return { pending: true };
}
