import { validateRepository } from '../../repository/validate-repository.mjs';
import { failureMessage } from '../../output/errors/failure-message.mjs';
import { buildTestCheck } from '../local/test-command.mjs';
import { verifyPreflightCi } from '../ci/verify-preflight-ci.mjs';
import { throwPreflightFailures } from './report.mjs';
import { coverageWaiverPolicy } from '../../policy/coverage-waiver-policy.mjs';
import { readWorktreeStatus } from '../../repository/state/read-worktree-status.mjs';
import { requireCleanWorktree } from '../../repository/state/require-clean-worktree.mjs';
import { processCommand } from '../local/process-command.mjs';
import { processOptions } from '../local/process-options.mjs';

const CHECK_TIMEOUT_MS = 120000;
export function runPreflight(execFileSync, fs, log, { ignore100x4: _ignore100x4 = false, verifyCi = false, strictRepository = false } = {}) {
  const status = readWorktreeStatus(execFileSync); const failures = [];
  if (strictRepository) validateRepository(execFileSync, fs, failures);
  const dirtyFailure = requireCleanWorktree(status); if (dirtyFailure) failures.push(dirtyFailure);
  const checks = []; const testCheck = buildTestCheck(fs, coverageWaiverPolicy(_ignore100x4).ignored);
  if (testCheck.missing) failures.push('BLOCKED: package.json does not declare scripts.test.\nAction: add the shared npm test harness before running preflight.'); else if (testCheck.check) checks.unshift(testCheck.check);
  const results = {};
  for (const [name, [executable, args]] of checks) {
    try {
      const [command, commandArgs] = processCommand(executable, args);
      execFileSync(command, commandArgs, processOptions(command, CHECK_TIMEOUT_MS));
    }
    catch (error) { results[name] = { passed: false }; failures.push(failureMessage(name, error, `${error.stdout ?? ''}\n${error.stderr ?? ''}`)); continue; }
    results[name] = { passed: true };
  }
  if (verifyCi) { results.ci = verifyPreflightCi(execFileSync, log, status); if (results.ci.error) failures.push(`BLOCKED: GitHub CI verification failed: ${results.ci.error.message}\nAction: push the current commit, wait for successful Ubuntu and Windows CI, then rerun tagit preflight.`); }
  throwPreflightFailures(failures); return results;
}
