import { failureMessage } from '../../output/errors/failure-message.mjs';
import { buildTestCheck } from '../local/test-command.mjs';
import { coverageWaiverPolicy } from '../../policy/coverage-waiver-policy.mjs';
import { processCommand } from '../local/process-command.mjs';
import { processOptions } from '../local/process-options.mjs';

export function runLocalChecks(
  execFileSync,
  fs,
  { ignore100x4 = false, ignoreMonolithLimits = false, timeoutMs = 120000 } = {},
) {
  const failures = [];
  const testCheck = buildTestCheck(fs, {
    ignore100x4: coverageWaiverPolicy(ignore100x4).ignored,
    ignoreMonolithLimits,
  });
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
  const [executable, args] = testCheck.check[1];
  try {
    const [command, commandArgs] = processCommand(executable, args);
    execFileSync(command, commandArgs, processOptions(command, timeoutMs));
    results.test = { passed: true };
  } catch (error) {
    results.test = { passed: false };
    failures.push(failureMessage('test', error, `${error.stdout ?? ''}\n${error.stderr ?? ''}`));
  }
  return { failures, results };
}
