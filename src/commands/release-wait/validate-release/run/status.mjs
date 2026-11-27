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

export default function isValidReleaseRunStatus(status, conclusion) {
  return (
    typeof status === "string" &&
    RUN_STATUSES.has(status) &&
    (conclusion === null ||
      conclusion === undefined ||
      (typeof conclusion === "string" && RUN_CONCLUSIONS.has(conclusion))) &&
    (status !== "completed" || (typeof conclusion === "string" && RUN_CONCLUSIONS.has(conclusion)))
  );
}
