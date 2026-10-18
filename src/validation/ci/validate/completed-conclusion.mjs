const COMPLETED_CONCLUSIONS = [
  "success",
  "failure",
  "cancelled",
  "skipped",
  "neutral",
  "timed_out",
  "action_required",
];

export function validateCompletedConclusion(run) {
  if (run?.status !== "completed") return;
  if (!COMPLETED_CONCLUSIONS.includes(run.conclusion))
    throw new Error(
      `Latest GitHub Actions run ${run.databaseId} has an invalid final result: ${run.conclusion}.`,
    );
}
