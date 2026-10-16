import { validateLocalTestCheck } from "./validate-local-test-check.mjs";
import { runLocalTestCommand } from "./run-local-test-command.mjs";

export function runLocalChecks(
  execFileSync,
  fs,
  { ignore100x4 = false, ignoreMonolithLimits = false, timeoutMs = 180000 } = {},
) {
  const failures = [];
  const testCheck = validateLocalTestCheck(fs, { ignore100x4, ignoreMonolithLimits });
  if (testCheck.missing)
    failures.push(
      "BLOCKED: package.json and scripts.test are required.\nAction: add package.json with the required test command, then rerun tagit preflight.",
    );
  else if (testCheck.invalid)
    failures.push(
      "BLOCKED: scripts.test or the installed @eliware/test dev dependency is invalid. For @eliware/test, scripts.test must be node bin/eliware-test.mjs.\nAction: fix package.json and install @eliware/test as a dev dependency when this is not @eliware/test, then rerun tagit preflight.",
    );
  if (!testCheck.check) return { failures, results: {} };
  const results = {};
  const { result, failure } = runLocalTestCommand(execFileSync, testCheck.check, timeoutMs);
  results.test = result;
  if (failure) failures.push(failure);
  return { failures, results };
}
