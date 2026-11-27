import validateBranch from "./branch.mjs";

export default function validateRepository(execFileSync, failures) {
  validateBranch(execFileSync, failures);
  return failures;
}
