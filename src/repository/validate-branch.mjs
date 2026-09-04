import { readCurrentBranch } from './branch/read-current-branch.mjs';
import { requireMain } from './branch/require-main.mjs';

export function validateBranch(execFileSync, failures) {
  try {
    const failure = requireMain(readCurrentBranch(execFileSync));
    if (failure) failures.push(failure);
  } catch (error) {
    failures.push(`BLOCKED: branch validation failed: ${error.message}`);
  }
}
