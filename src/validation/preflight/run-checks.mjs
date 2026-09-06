import { validateRepository } from '../../repository/validate-repository.mjs';
import { runLocalChecks } from './run-local-checks.mjs';
import { verifyPreflightCi } from '../ci/verify-preflight-ci.mjs';
import { throwPreflightFailures } from './report.mjs';
import { readWorktreeStatus } from '../../repository/state/read-worktree-status.mjs';
import { requireCleanWorktree } from '../../repository/state/require-clean-worktree.mjs';

const CHECK_TIMEOUT_MS = 120000;
export function runPreflight(
  execFileSync,
  fs,
  log,
  { ignore100x4 = false, ignoreMonolithLimits = false, verifyCi = false, strictRepository = false } = {},
) {
  const status = readWorktreeStatus(execFileSync);
  const failures = [];
  if (strictRepository) validateRepository(execFileSync, fs, failures);
  const dirtyFailure = requireCleanWorktree(status);
  if (dirtyFailure) failures.push(dirtyFailure);
  const local = runLocalChecks(execFileSync, fs, { ignore100x4, ignoreMonolithLimits, timeoutMs: CHECK_TIMEOUT_MS });
  failures.push(...local.failures);
  const results = local.results;
  // A blocked result is produced only for the already-reported dirty worktree; CI errors are independent blockers.
  if (verifyCi) {
    results.ci = verifyPreflightCi(execFileSync, log, status);
    if (results.ci.error)
      failures.push(
        `BLOCKED: GitHub CI verification failed or was not completed. ${results.ci.error.message}\nAction: provide a successful Ubuntu run for the exact HEAD; Windows is optional but must pass when present.`,
      );
  }
  throwPreflightFailures(failures);
  return results;
}
