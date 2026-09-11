import { validateLocalTestCheck } from './validate-local-test-check.mjs';
import { runLocalTestCommand } from './run-local-test-command.mjs';

export function runLocalChecks(
  execFileSync,
  fs,
  { ignore100x4 = false, ignoreMonolithLimits = false, timeoutMs = 120000 } = {},
) {
  const failures = [];
  const testCheck = validateLocalTestCheck(fs, { ignore100x4, ignoreMonolithLimits });
  if (testCheck.missing)
    failures.push(
      'BLOCKED: package.json does not declare scripts.test.\nAction: add the shared npm test harness before running preflight.',
    );
  else if (testCheck.invalid)
    failures.push(
      'BLOCKED: package.json must use an installed, non-linked @eliware/test dev dependency and scripts.test must invoke eliware-test.\nAction: install @eliware/test as a dev dependency, remove any local link, set scripts.test to eliware-test, then rerun tagit preflight.',
    );
  if (!testCheck.check) return { failures, results: {} };
  const results = {};
  const { result, failure } = runLocalTestCommand(execFileSync, testCheck.check, timeoutMs);
  results.test = result;
  if (failure) failures.push(failure);
  return { failures, results };
}
