import { findSecretLookingPaths, secretFilesMessage } from './secrets/find-secret-looking-paths.mjs';

export function validateTrackedFiles(execFileSync, failures) {
  try {
    const secretFiles = findSecretLookingPaths(String(execFileSync('git', ['ls-files'], { encoding: 'utf8' })));
    if (secretFiles.length) failures.push(secretFilesMessage(secretFiles));
  } catch (error) {
    failures.push(`BLOCKED: tracked-file validation failed: ${error.message}`);
  }
}
