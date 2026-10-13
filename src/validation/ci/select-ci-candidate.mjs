import { successfulRun } from "./select-run.mjs";

export function selectCiCandidate(runs, headSha) {
  const matching = runs
    .filter((run) => run.headSha === headSha)
    .sort((left, right) => Number(right.databaseId) - Number(left.databaseId));
  const candidates = matching.filter((run) => successfulRun(run));
  return {
    candidates,
    pending: matching.find((run) => run.status !== "completed") ?? null,
  };
}
