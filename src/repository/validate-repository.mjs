import { validateBranch } from './validate-branch.mjs';
import { validateMetadata } from './validate-metadata.mjs';
import { validateTrackedFiles } from './validate-tracked-files.mjs';

export function validateRepository(execFileSync, fs, failures) {
  validateBranch(execFileSync, failures);
  validateMetadata(fs, failures);
  validateTrackedFiles(execFileSync, failures);
  return failures;
}
