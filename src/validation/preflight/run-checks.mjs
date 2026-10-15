import { validateRepository } from "../../repository/validate-repository.mjs";
import { runLocalChecks } from "./run-local-checks.mjs";
import { throwPreflightFailures } from "./report.mjs";
import { collectPreflightContext } from "./collect-context.mjs";
import { runCiCheck } from "./run-ci-check.mjs";

const CHECK_TIMEOUT_MS = 120000;
export function runPreflight(
  execFileSync,
  fs,
  log,
  {
    ignore100x4 = false,
    ignoreMonolithLimits = false,
    verifyCi = false,
    strictRepository = false,
  } = {},
) {
  const { status, dirtyFailure } = collectPreflightContext(execFileSync);
  const failures = [];
  if (strictRepository) validateRepository(execFileSync, failures);
  if (dirtyFailure) failures.push(dirtyFailure);
  const local = runLocalChecks(execFileSync, fs, {
    ignore100x4,
    ignoreMonolithLimits,
    timeoutMs: CHECK_TIMEOUT_MS,
  });
  failures.push(...local.failures);
  const results = local.results;
  // A blocked result is produced only for the already-reported dirty worktree; CI errors are independent blockers.
  if (verifyCi) {
    const ci = runCiCheck(execFileSync, log, status, fs);
    results.ci = ci.result;
    if (ci.failure) failures.push(ci.failure);
  }
  throwPreflightFailures(failures);
  return results;
}
