export function validateReleaseRunDetailsShape(details, runId) {
  if (
    !details ||
    (details.databaseId !== undefined && typeof details.databaseId !== "number") ||
    typeof details.status !== "string" ||
    (details.conclusion !== null &&
      details.conclusion !== undefined &&
      typeof details.conclusion !== "string") ||
    typeof details.headSha !== "string" ||
    !Array.isArray(details.jobs)
  )
    throw new Error(`Release CI returned malformed details for run ${runId}.`);
  return details;
}
