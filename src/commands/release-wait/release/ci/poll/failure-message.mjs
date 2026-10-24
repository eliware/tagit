import { formatReleaseCiFailure } from "../../../format-release-ci-failure.mjs";

export function formatReleasePollFailure(details, workflowLabel) {
  const failure = formatReleaseCiFailure(details);
  if (!failure) return null;
  return failure.replaceAll("Release CI", `Release ${workflowLabel ?? "CI"}`);
}
