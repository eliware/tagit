import { validateBranch } from "./branch.mjs";

export function validateRepository(execFileSync, failures) {
  validateBranch(execFileSync, failures);
  return failures;
}
