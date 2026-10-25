const RUN_STATUSES = new Set([
  "queued",
  "in_progress",
  "completed",
  "waiting",
  "requested",
  "pending",
]);
const RUN_CONCLUSIONS = new Set([
  "success",
  "failure",
  "neutral",
  "cancelled",
  "skipped",
  "timed_out",
  "action_required",
  "stale",
  "startup_failure",
]);

export function validateReleaseRunDetailsShape(details, runId) {
  if (
    !details ||
    (details.databaseId !== undefined && typeof details.databaseId !== "number") ||
    typeof details.status !== "string" ||
    !RUN_STATUSES.has(details.status) ||
    (details.conclusion !== null &&
      details.conclusion !== undefined &&
      (typeof details.conclusion !== "string" || !RUN_CONCLUSIONS.has(details.conclusion))) ||
    typeof details.headSha !== "string" ||
    !Array.isArray(details.jobs)
  )
    throw new Error(`Release CI returned malformed details for run ${runId}.`);
  return details;
}
