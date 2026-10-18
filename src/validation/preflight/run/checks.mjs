import { validateRepository } from "../../../repository/validate/repository.mjs";
import { runLocalChecks } from "./local/checks.mjs";
import { throwPreflightFailures } from "../report.mjs";
import { collectPreflightContext } from "../collect-context.mjs";
import { runCiCheck } from "./ci-check.mjs";

const CHECK_TIMEOUT_MS = 180000;
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
  // Add a blocked result only for a dirty worktree that was reported above.
  // Report CI errors separately.
  if (verifyCi) {
    const ci = runCiCheck(execFileSync, log, status, fs);
    results.ci = ci.result;
    if (ci.failure) failures.push(ci.failure);
  }
  throwPreflightFailures(failures);
  return results;
}
