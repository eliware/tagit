import { validateBranch } from "./validate-branch.mjs";
import { readPackageJson } from "./metadata/read-package-json.mjs";
import { validateOrigin } from "./metadata/validate-origin.mjs";
import { validateTrackedFiles } from "./validate-tracked-files.mjs";

export function validateRepository(execFileSync, fs, failures) {
  validateBranch(execFileSync, failures);
  try {
    failures.push(...validateOrigin(execFileSync, readPackageJson(fs)));
  } catch (error) {
    failures.push(`BLOCKED: release safety validation failed: ${error.message}`);
  }
  validateTrackedFiles(execFileSync, failures);
  return failures;
}
