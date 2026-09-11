import { successfulRun } from './select-run.mjs';

export function selectCiCandidate(run, headSha) {
  if (!run || run.headSha !== headSha) return { candidates: [], pending: null };
  return {
    candidates: successfulRun(run) ? [run] : [],
    pending: run.status !== 'completed' ? run : null,
  };
}
