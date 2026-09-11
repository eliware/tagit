const COMPLETED_CONCLUSIONS = ['success', 'failure', 'cancelled', 'skipped', 'neutral', 'timed_out', 'action_required'];

export function validateCompletedConclusion(run) {
  if (run?.status !== 'completed') return;
  if (!COMPLETED_CONCLUSIONS.includes(run.conclusion))
    throw new Error(
      `Latest GitHub Actions run ${run.databaseId} has malformed completed conclusion: ${run.conclusion}.`,
    );
  if (run.conclusion !== 'success')
    throw new Error(`Latest GitHub Actions run ${run.databaseId} failed with ${run.conclusion}.`);
}
