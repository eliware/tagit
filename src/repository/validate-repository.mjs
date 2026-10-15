import { validateBranch } from "./validate-branch.mjs";

export function validateRepository(execFileSync, failures) {
  validateBranch(execFileSync, failures);
  return failures;
}
