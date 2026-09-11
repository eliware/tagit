import { validateRepository } from '../../repository/validate-repository.mjs';
import { runLocalChecks } from './run-local-checks.mjs';
import { verifyPreflightCi } from '../ci/verify-preflight-ci.mjs';
import { throwPreflightFailures } from './report.mjs';
import { collectPreflightContext } from './collect-context.mjs';
import { ciFailureMessage } from './ci-failure-message.mjs';

const CHECK_TIMEOUT_MS = 120000;
export function runPreflight(
  execFileSync,
  fs,
  log,
  { ignore100x4 = false, ignoreMonolithLimits = false, verifyCi = false, strictRepository = false } = {},
) {
  const { status, dirtyFailure } = collectPreflightContext(execFileSync);
  const failures = [];
  if (strictRepository) validateRepository(execFileSync, fs, failures);
  if (dirtyFailure) failures.push(dirtyFailure);
  const local = runLocalChecks(execFileSync, fs, { ignore100x4, ignoreMonolithLimits, timeoutMs: CHECK_TIMEOUT_MS });
  failures.push(...local.failures);
  const results = local.results;
  // A blocked result is produced only for the already-reported dirty worktree; CI errors are independent blockers.
  if (verifyCi) {
    results.ci = verifyPreflightCi(execFileSync, log, status);
    const ciFailure = ciFailureMessage(results.ci.error);
    if (ciFailure) failures.push(ciFailure);
  }
  throwPreflightFailures(failures);
  return results;
}
