import isValidReleaseRunStatus from "./status.mjs";

export default function validateReleaseRunDetailsShape(details, runId) {
  if (
    !details ||
    (details.databaseId !== undefined && typeof details.databaseId !== "number") ||
    !isValidReleaseRunStatus(details.status, details.conclusion) ||
    typeof details.headSha !== "string" ||
    !Array.isArray(details.jobs)
  )
    throw new Error(`Release CI returned malformed details for run ${runId}.`);
  return details;
}
