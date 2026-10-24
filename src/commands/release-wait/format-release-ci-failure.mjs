import { isReleaseCiFailure } from "./release/ci/poll/is-failure.mjs";

export function formatReleaseCiFailure(details) {
  if (!isReleaseCiFailure(details)) return null;
  const jobs = details.jobs
    .map((job) => `${job.name} [${job.status}/${job.conclusion}]`)
    .join(", ");
  return `Release CI failed: ${String(details.conclusion)}. Jobs: ${jobs || "none reported"}.`;
}
